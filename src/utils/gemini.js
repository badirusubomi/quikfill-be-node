import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";
import aiplatform from "@google-cloud/aiplatform";
import { helpers } from "@google-cloud/aiplatform";

const genAI = new GoogleGenerativeAI(process.env.GEMINIA_API_KEY);
const { PredictionServiceClient } = aiplatform.v1;

// Gemini AI config
let projectId = 290587789881;
let model = "gemini-embedding-001";
let task = "QUESTION_ANSWERING";
let dimensionality = 768;
let apiEndpoint = "us-central1-aiplatform.googleapis.com";
const clientOptions = { apiEndpoint: apiEndpoint };
const location = "us-central1";
const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;

export async function getEmbedding(text) {
	const instances = text
		.split(";")
		.map((e) => helpers.toValue({ content: e, task_type: task }));

	const client = new PredictionServiceClient(clientOptions);
	const parameters = helpers.toValue(
		dimensionality > 0 ? { outputDimensionality: parseInt(dimensionality) } : {}
	);
	const allEmbeddings = [];
	// gemini-embedding-001 takes one input at a time.
	for (const instance of instances) {
		const request = { endpoint, instances: [instance], parameters };
		const [response] = await client.predict(request);
		const predictions = response.predictions;

		const embeddings = predictions.map((p) => {
			const embeddingsProto = p.structValue.fields.embeddings;
			const valuesProto = embeddingsProto.structValue.fields.values;
			return valuesProto.listValue.values.map((v) => v.numberValue);
		});

		allEmbeddings.push(embeddings[0]);
	}

	return allEmbeddings;
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
