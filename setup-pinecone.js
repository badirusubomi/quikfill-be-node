import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

let pcResponse = await pinecone.createIndexForModel({
	name: process.env.PINECONE_INDEX_NAME,
	cloud: "aws",
	region: "us-east-1",
	embed: {
		model: "pinecone-sparse-english-v0",
		fieldMap: { text: "chunk_text" },
	},
	waitUntilReady: true,
});

console.log(pcResponse);
