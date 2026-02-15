const https = require('https');
const fs = require('fs');

const apiKey = "AIzaSyBuqGFLW7OPaaQ__Z3ahOubi5Gw2lQBLfE";

async function listModels() {
    return new Promise((resolve, reject) => {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    let output = "Available models:\n\n";

                    if (jsonData.models) {
                        jsonData.models.forEach(model => {
                            output += `\n- Name: ${model.name}\n`;
                            output += `  Display Name: ${model.displayName || 'N/A'}\n`;
                            output += `  Supported Methods: ${model.supportedGenerationMethods ? model.supportedGenerationMethods.join(", ") : "N/A"}\n`;
                        });

                        // Write to file
                        fs.writeFileSync('models-list.txt', output);
                        console.log("Models saved to models-list.txt");
                        console.log(output);
                    } else {
                        output = "No models found or error:\n" + JSON.stringify(jsonData, null, 2);
                        fs.writeFileSync('models-list.txt', output);
                        console.log(output);
                    }
                    resolve();
                } catch (error) {
                    console.error("Parse error:", error.message);
                    console.log("Raw response:", data);
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error("Request error:", error.message);
            reject(error);
        });
    });
}

listModels().catch(console.error);
