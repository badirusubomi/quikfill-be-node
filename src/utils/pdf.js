import pdfParse from "pdf-parse";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream"; // Import Readable from 'stream'

// Helper function to convert a stream to a buffer
async function streamToBuffer(stream) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("error", reject);
		stream.on("end", () => resolve(Buffer.concat(chunks)));
	});
}

export async function parsePdf(key) {
	const s3 = new S3Client({ region: process.env.S3_REGION }); // Initialize S3Client

	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET,
		Key: key,
	});

	try {
		const s3Object = await s3.send(command);

		const dataStream = s3Object.Body;

		const dataBuffer = await streamToBuffer(dataStream); // Convert stream to buffer

		const data = await pdfParse(dataBuffer);
		return data.text;
	} catch (error) {
		console.error("Error retrieving or parsing PDF from S3:", error);
		throw error;
	}
}
