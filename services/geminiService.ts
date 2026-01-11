
import { GoogleGenAI, Tool } from "@google/genai";
import { GeoLocation, SearchResult, ParsedPrice } from "../types";
import { validate, validateBatch, sanitizeAIResponse, ALLOWLISTS } from "../src/utils/allowlist";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is missing from environment variables.");
}

// Helper to parse the special data block we request from Gemini
const parsePriceData = (text: string): ParsedPrice[] => {
  const prices: ParsedPrice[] = [];
  try {
    // Look for the specific marker
    const marker = "---PRICE_DATA---";
    const parts = text.split(marker);

    if (parts.length > 1) {
      const dataBlock = parts[1].trim();
      const lines = dataBlock.split('\n');

      for (const line of lines) {
        // Format: Store|Price|ProductName|OriginalQuery(optional)
        const [store, priceStr, productName, originalQuery] = line.split('|').map(s => s.trim());
        if (store && priceStr) {
          // Clean price string (remove currency symbols, approx, etc)
          const priceVal = parseFloat(priceStr.replace(/[^0-9.]/g, ''));

          // Validate store name
          const storeValidation = validate(store, 'storeName');
          if (!storeValidation.valid) {
            console.warn(`Invalid store name: ${store}`);
            continue;
          }

          // Validate price
          const priceValidation = validate(priceVal, 'price');
          if (!isNaN(priceVal) && priceValidation.valid) {
            prices.push({
              store: sanitizeAIResponse(store),
              price: priceVal,
              productName: productName ? sanitizeAIResponse(productName) : undefined,
              originalQuery: originalQuery ? sanitizeAIResponse(originalQuery) : undefined
            });
          } else {
            console.warn(`Invalid price: ${priceVal} for store ${store}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn("Failed to parse structured price data", e);
  }
  return prices;
};

export const identifyProductFromBarcode = async (barcode: string): Promise<string> => {
  // SECURITY: Validate barcode format (prevent prompt injection)
  const barcodeValidation = validate(barcode, 'barcode');
  if (!barcodeValidation.valid) {
    throw new Error(`Invalid barcode format: ${barcodeValidation.error}`);
  }

  // 1. Try Open Food Facts API first (Free, no key required)
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    if (response.ok) {
      const data = await response.json();
      if (data.status === 1 && data.product) {
        const brand = data.product.brands ? `${data.product.brands} ` : '';
        const name = data.product.product_name || '';
        if (name) return `${brand}${name}`.trim();
      }
    }
  } catch (e) {
    console.warn("OpenFoodFacts lookup failed", e);
  }

  // 2. Fallback to Gemini with Search Grounding
  if (!API_KEY) throw new Error("API Key not found");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    I have a barcode number: ${barcode}. 
    Search the web to identify the exact product name and brand.
    Return ONLY the product name. 
    If you cannot identify the product with high certainty, return "UNKNOWN".
    Do not provide any introductory text or explanation.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

  // Validation: if text is too long (likely an explanation) or indicates failure
  if (!text || text.length > 80 || text.toUpperCase().includes("UNKNOWN") || text.toLowerCase().includes("unable to")) {
    throw new Error("Product could not be identified from barcode.");
  }

  // SECURITY: Sanitize AI response before returning
  return sanitizeAIResponse(text.replace(/\.$/, ''));
}

export const fetchGroceryPrices = async (
  query: string,
  location?: GeoLocation
): Promise<SearchResult> => {
  // SECURITY: Validate search query (prevent prompt injection)
  const queryValidation = validate(query, 'searchQuery');
  if (!queryValidation.valid) {
    throw new Error(`Invalid search query: ${queryValidation.error}`);
  }

  if (!API_KEY) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const tools: Tool[] = [
    { googleMaps: {} },
    { googleSearch: {} },
  ];

  const toolConfig = location
    ? {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    }
    : undefined;

  const prompt = `
    I am looking for "${query}" at grocery stores near me.
    
    Please perform the following actions:
    1. Find nearby grocery stores that likely carry this item using Google Maps.
    2. Use Google Search to find recent pricing information or weekly ads for these specific stores if available.
    3. List the stores found.
    4. For each store, provide an estimated price or price range for the item. If exact real-time price isn't available, provide a high-confidence estimate based on typical local pricing or recent data.
    5. CLEARLY identify which store has the lowest price.
    
    Format the response as a clear, readable list. 
    Use bolding for Store Names and Prices.
    At the end, write a short summary recommendation.

    CRITICAL INSTRUCTION:
    At the very end of your response, after your summary, you MUST output a separator line "---PRICE_DATA---" followed by a list of the stores and their SINGLE best numeric price found (no ranges, just one number) AND the specific product name associated with that price. Format each line as: "Store Name|Price|Product Name".
    Example:
    ---PRICE_DATA---
    Safeway|5.99|Lucerne Large Eggs 12ct
    Trader Joe's|4.49|Trader Joe's Large White Eggs
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools,
        toolConfig,
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("No response candidates returned.");
    }

    const fullText = candidate.content?.parts?.[0]?.text || "No details found.";
    const groundingMetadata = candidate.groundingMetadata as any;

    // Parse the structured data for our charts/history
    const parsedPrices = parsePriceData(fullText);

    // Remove the technical data block from the display text
    const displayText = fullText.split('---PRICE_DATA---')[0];

    // SECURITY: Sanitize AI response before returning
    return {
      text: sanitizeAIResponse(displayText),
      groundingMetadata,
      parsedPrices,
      productName: sanitizeAIResponse(query)
    };
  } catch (error) {
    console.error("Error fetching grocery prices:", error);
    throw error;
  }
};

export const fetchGroceryPricesForList = async (
  items: string[],
  location?: GeoLocation
): Promise<ParsedPrice[]> => {
  if (!API_KEY) throw new Error("API Key not found");
  if (items.length === 0) return [];

  // SECURITY: Validate all item names (prevent prompt injection)
  const itemsValidation = validateBatch(items, 'itemName');
  if (!itemsValidation.valid) {
    throw new Error(`Invalid item in list: ${itemsValidation.error}`);
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const tools: Tool[] = [{ googleMaps: {} }, { googleSearch: {} }];
  const toolConfig = location ? { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } } : undefined;

  // Use bullet points for clarity to prevent comma issues in item names
  const itemListStr = items.map(i => `- ${i}`).join('\n');

  const prompt = `
    I have a shopping list with these items:
    ${itemListStr}
    
    Find the current best prices for each of these items at nearby grocery stores.
    
    CRITICAL INSTRUCTION:
    You MUST return a separator line "---PRICE_DATA---" followed by the price list.
    If you cannot find exact real-time prices, you MUST provide realistic ESTIMATES based on typical prices for that store.
    DO NOT return an apology or an empty response. ALWAYS return the data block.
    
    CRITICAL OUTPUT FORMAT:
    Return ONLY a separator line "---PRICE_DATA---" followed by a list of the best price found for each item.
    Format each line as: "Store Name|Price|Specific Product Found|Original List Item Name".
    IMPORTANT: The "Original List Item Name" column MUST match the input item name exactly.
    
    Example:
    ---PRICE_DATA---
    Safeway|5.99|Lucerne Large Eggs 12ct|Eggs
    Walmart|2.49|Great Value White Bread|Bread
    Target|3.29|Gala Apples 3lb|Apples
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools,
        toolConfig,
      },
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Raw Gemini Response for List:", text);
    const parsed = parsePriceData(text);
    console.log("Parsed Data:", parsed);
    return parsed;
  } catch (error) {
    console.error("Error fetching list prices:", error);
    throw error;
  }
};
