import { GoogleGenAI } from "@google/genai";
import { config } from 'dotenv';

config();

const API_KEY = process.env.GEMINI_API_KEY;

const parsePriceData = (text: string) => {
    const prices: any[] = [];
    try {
        const marker = "---PRICE_DATA---";
        const parts = text.split(marker);

        if (parts.length > 1) {
            const dataBlock = parts[1].trim();
            const lines = dataBlock.split('\n');

            for (const line of lines) {
                const [store, priceStr, productName, originalQuery] = line.split('|').map(s => s.trim());
                if (store && priceStr) {
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

async function test() {
    console.log("Testing with gemini-2.5-flash AND LOCATION...");
    if (!API_KEY) {
        console.error("API KEY NOT FOUND");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const items = ["Milk", "Eggs", "Bread"];
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

    // Mock Location (Seattle)
    const location = { latitude: 47.6062, longitude: -122.3321 };
    const toolConfig = { retrievalConfig: { latLng: { latitude: location.latitude, longitude: location.longitude } } };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }, { googleMaps: {} }], // Added googleMaps as in real app
                toolConfig
            }
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        console.log("Raw Gemini Response:", text);
        const parsed = parsePriceData(text);
        console.log("Parsed Data:", JSON.stringify(parsed, null, 2));
    } catch (error) {
        console.error("Error:", error);
    }
}

test();
