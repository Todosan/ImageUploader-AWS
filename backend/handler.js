const AWS = require('aws-sdk');
const parser = require('lambda-multipart-parser');

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();

async function saveFile(file) {
    try {
        console.log('Processing file:', file.filename); // Make sure to use correct field name

        const BucketName = process.env.BUCKET_NAME;
        console.log('S3 Bucket:', BucketName);

        // Upload file to S3
        const savedFile = await s3
            .putObject({
                Bucket: BucketName,
                Key: file.filename, // Ensure correct field name (filename)
                Body: file.content,
            })
            .promise();

        console.log('File saved to S3:', savedFile);

        // Analyze labels with Rekognition
        const labels = await rekognition
            .detectLabels({
                Image: {
                    Bytes: file.content, // Make sure content is in the right format
                },
                MaxLabels: 10,
                MinConfidence: 70,
            })
            .promise();

        console.log('Rekognition labels:', labels);

        return { fileName: file.filename, savedFile, labels };
    } catch (err) {
        console.error('Error processing file:', file.filename, err);
        throw new Error(`Failed to process file ${file.filename}: ${err.message}`);
    }
}

exports.savePhoto = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event));

        // Parse multipart data
        const { files } = await parser.parse(event);
        if (!files || files.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No files uploaded' }),
            };
        }

        // Process all files concurrently
        const filesData = files.map(saveFile);
        const results = await Promise.all(filesData);

        return {
            statusCode: 200,
            body: JSON.stringify(results),
        };
    } catch (err) {
        console.error('Error handling request:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error', message: err.message }),
        };
    }
};
