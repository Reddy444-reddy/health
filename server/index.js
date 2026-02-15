const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Root route for server status
app.get('/', (req, res) => {
    res.send('AI Health Backend Server is running! Use /api/... endpoints for AI features.');
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper for file parts
function fileToGenerativePart(base64Data, mimeType) {
    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType
        },
    };
}

// 1. Chat Endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = "You are a direct and concise AI Health Assistant. Rules: 1. Answer immediately. 2. Be concise. 3. Use bullet points. 4. Add '(Note: I am an AI, not a doctor)' at end.";

        const formattedHistory = history.map(msg => ({
            role: msg.role === 'bot' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "System: " + systemPrompt }] },
                { role: "model", parts: [{ text: "Understood." }] },
                ...formattedHistory
            ],
        });

        const result = await chat.sendMessage(message);
        res.json({ text: result.response.text() });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
    try {
        const { fileBase64, mimeType } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const base64Data = fileBase64.split(',')[1] || fileBase64;
        const filePart = fileToGenerativePart(base64Data, mimeType);

        const prompt = `Act as an expert doctor. Analyze this medical report.
            
            1. **Estimate** a Health Score (0-100).
            2. **Estimate** average Heart Rate (bpm) and Sleep (e.g. "7h 30m").
            3. **Create** 3 specific recommendations.
            4. **Summary**: List 3-4 key bullet points findings using '•'.
            5. **Health Conditions**: List any detected conditions (e.g., ["diabetes", "hypertension", "high cholesterol"]).
            6. **Specializations**: List medical specializations needed (e.g., ["cardiology", "endocrinology"]).
            7. **Dietary Restrictions**: List dietary recommendations (e.g., ["low-sodium", "low-sugar", "high-protein"]).

            Response strictly in this JSON format (NO markdown):
            {
                "score": 85,
                "heartRate": 75,
                "sleep": "6h 30m",
                "recommendations": [
                    { "title": "Tip Title", "desc": "Reasoning...", "color": "cyan" },
                    { "title": "Tip Title", "desc": "Reasoning...", "color": "violet" },
                    { "title": "Tip Title", "desc": "Reasoning...", "color": "rose" }
                ],
                "summary": "• Point 1\\n• Point 2\\n• Point 3",
                "conditions": ["condition1", "condition2"],
                "specializations": ["specialization1"],
                "dietaryRestrictions": ["restriction1"]
            }`;

        const result = await model.generateContent([prompt, filePart]);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Analysis Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 3. Diet Plan Endpoint
app.post('/api/diet', async (req, res) => {
    try {
        const { score, conditions, restrictions } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Create a personalized diet plan for a person with:
            - Health Score: ${score}
            - Conditions: ${conditions.join(', ')}
            - Dietary needs: ${restrictions.join(', ')}
            
            Provide a JSON response (NO markdown) with:
            {
                "calories": "2000 kcal",
                "protein": "120g",
                "carbs": "250g",
                "fats": "60g",
                "meals": [
                    { "name": "Breakfast", "items": ["item1", "item2", "item3"] },
                    { "name": "Lunch", "items": ["item1", "item2", "item3"] },
                    { "name": "Snack", "items": ["item1", "item2"] },
                    { "name": "Dinner", "items": ["item1", "item2", "item3"] }
                ]
            }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Diet Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. Prevention Endpoint
app.post('/api/prevention', async (req, res) => {
    try {
        const { searchTerm } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze "${searchTerm}" and provide exactly 3 cards in this JSON format:
            [
                {
                    "title": "What is ${searchTerm}?", 
                    "type": "Overview", 
                    "content": "List 3-4 key bullet points explaining the condition and symptoms. Use '•' for bullets.", 
                    "source": "Trusted Source"
                },
                {
                    "title": "Why it Happens", 
                    "type": "Causes", 
                    "content": "List 3-4 key bullet points on causes/transmission. Use '•' for bullets.", 
                    "source": "Trusted Source"
                },
                {
                    "title": "Precautions & Prevention", 
                    "type": "Prevention", 
                    "content": "List 3-4 actionable bullet points for prevention. Use '•' for bullets.", 
                    "source": "Trusted Source"
                }
            ]
            Do NOT adhere to markdown formatting, just raw JSON.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(cleanJson));
    } catch (error) {
        console.error("Prevention Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
