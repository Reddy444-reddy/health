const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

async function listModels() {
    const apiKey = "AIzaSyAVQ9sca2rNPog4p6tSCOQl7RaEKsrh3lk";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        let output = "";
        if (data.models) {
            data.models.forEach(m => {
                output += `${m.name}\n`;
            });
            fs.writeFileSync("available_models.txt", output);
            console.log("Written available models to available_models.txt");
        } else {
            fs.writeFileSync("available_models.txt", "No models returned: " + JSON.stringify(data));
        }
    } catch (error) {
        fs.writeFileSync("available_models.txt", "Error: " + error.message);
    }
}

listModels();
