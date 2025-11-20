
import { GoogleGenAI, Tool } from "@google/genai";
import { GeoLocation, SearchResult, ParsedPrice } from "../types";

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
          if (!isNaN(priceVal)) {
            prices.push({ 
              store, 
              price: priceVal,
              productName: productName || undefined,
              originalQuery: originalQuery || undefined
            });
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

  return text.replace(/\.$/, '');
}

export const fetchGroceryPrices = async (
  query: string,
  location?: GeoLocation
): Promise<SearchResult> => {
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

    return {
      text: displayText,
      groundingMetadata,
      parsedPrices,
      productName: query
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

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const tools: Tool[] = [{ googleMaps: {} }, { googleSearch: {} }];
  const toolConfig = location ? { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } } : undefined;

  // We chunk items if too many, but for now assume reasonable list size
  const itemListStr = items.join(', ');

  const prompt = `
    I have a shopping list with these items: ${itemListStr}.
    Find the current best prices for each of these items at nearby grocery stores.
    
    CRITICAL OUTPUT FORMAT:
    Return ONLY a separator line "---PRICE_DATA---" followed by a list of the best price found for each item.
    Format each line as: "Store Name|Price|Specific Product Found|Original List Item Name".
    
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
    return parsePriceData(text);
  } catch (error) {
    console.error("Error fetching list prices:", error);
    // Return empty array on failure so app doesn't crash, just shows no updates
    return [];
  }
};
