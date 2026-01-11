const fs = require('fs');
const https = require('https');
const path = require('path');

const models = [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1'
];

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const outputDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

models.forEach(file => {
    const url = baseUrl + file;
    const filePath = path.join(outputDir, file);

    if (fs.existsSync(filePath)) {
        console.log(`Skipping ${file} (already exists)`);
        return;
    }

    const fileStream = fs.createWriteStream(filePath);

    console.log(`Downloading ${file}...`);
    https.get(url, (response) => {
        response.pipe(fileStream);
        fileStream.on('finish', () => {
            fileStream.close();
            console.log(`Downloaded ${file}`);
        });
    }).on('error', (err) => {
        fs.unlink(filePath, () => { }); // Delete the file async. (But we don't check for this)
        console.error(`Error downloading ${file}: ${err.message}`);
    });
});
