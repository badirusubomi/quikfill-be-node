import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function getEmbedding(text) {
	const res = await axios.post(
		"https://generativelanguage.googleapis.com/v1beta/models/embedding-gecko-001:embedText",
		{ content: text },
		{ headers: { "X-Goog-Api-Key": process.env.GOOGLE_API_KEY } }
	);

	return res.data.embedding.values;
}

export async function generateAnswer(context, fieldPrompt) {
	const model = genAI.getGenerativeModel({ model: "gemini-pro" });

	const prompt = `
You are helping fill a job application.

Context:
"${context}"

Question:
"${fieldPrompt}"

Generate a short, personalized answer.
`;

	const result = await model.generateContent(prompt);
	return result.response.text().trim();
}
