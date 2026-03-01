const fs = require('fs');
const pdfParse = require('pdf-parse');

async function extractText() {
    try {
        const filePath = process.argv[2];
        if (!filePath) {
            console.error(JSON.stringify({ error: "No file path provided" }));
            process.exit(1);
        }

        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);

        console.log(JSON.stringify({ text: data.text }));
    } catch (error) {
        console.error(JSON.stringify({ error: error.message }));
        process.exit(1);
    }
}

extractText();
