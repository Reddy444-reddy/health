const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = "AIzaSyBuqGFLW7OPaaQ__Z3ahOubi5Gw2lQBLfE";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const models = await genAI.listModels();
        console.log("Available models:");
        models.forEach(model => {
            console.log(`- ${model.name} (supports: ${model.supportedGenerationMethods.join(", ")})`);
        });
    } catch (error) {
        console.error("Error listing models:", error.message);
    }
}

listModels();
