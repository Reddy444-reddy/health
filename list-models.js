import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.+)/);
const API_KEY = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!API_KEY) { console.error("No API Key"); process.exit(1); }

const genAI = new GoogleGenerativeAI(API_KEY);

// We rely on the fact that if getGenerativeModel fails, we can't list?
// Actually, to list models we need to make a raw REST call because the SDK might not expose listModels easily in the helper?
// Checked docs: SDK doesn't always expose listModels in the main entry.
// But we can try a fetch.

async function listModels() {
    console.log("Listing models...");
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log("- " + m.name.replace("models/", ""));
                }
            });
        } else {
            console.log("ERROR RESPONSE:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("FETCH ERROR:", error.message);
    }
}

listModels();
