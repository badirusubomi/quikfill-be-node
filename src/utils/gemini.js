import { GoogleGenerativeAI } from "@google/generative-ai";
// import axios from "axios";
import aiplatform from "@google-cloud/aiplatform";
import { helpers } from "@google-cloud/aiplatform";

const genAI = new GoogleGenerativeAI(process.env.GEMINIAI_API_KEY);
const { PredictionServiceClient } = aiplatform.v1;

// Gemini AI config
// let projectId = parseInt(process.env.GEMINIAI_PROJECT_ID);
// let model = "gemini-embedding-001";
// let task = "QUESTION_ANSWERING";
// let dimensionality = 768;
// const clientOptions = { apiEndpoint: process.env.GEMINIAI_API_ENDPOINT };
// const location = process.env.GEMINIAI_LOCATION;
// const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${model}`;

// export async function getEmbedding(text) {
// 	const instances = text
// 		.split(";")
// 		.map((e) => helpers.toValue({ content: e, task_type: task }));

// 	const client = new PredictionServiceClient(clientOptions);
// 	const parameters = helpers.toValue(
// 		dimensionality > 0 ? { outputDimensionality: parseInt(dimensionality) } : {}
// 	);
// 	const allEmbeddings = [];
// 	// gemini-embedding-001 takes one input at a time.
// 	for (const instance of instances) {
// 		const request = { endpoint, instances: [instance], parameters };
// 		const [response] = await client.predict(request);
// 		const predictions = response.predictions;

// 		const embeddings = predictions.map((p) => {
// 			const embeddingsProto = p.structValue.fields.embeddings;
// 			const valuesProto = embeddingsProto.structValue.fields.values;
// 			return valuesProto.listValue.values.map((v) => v.numberValue);
// 		});

// 		allEmbeddings.push(embeddings[0]);
// 	}

// 	return allEmbeddings;
// }

export async function generateAnswer(context, fieldPrompt) {
	const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

	const prompt = `
	You are an agent being prompted to fill a job application form online.
	

	Here is relevant Context:
	"${context}"

	Here is the form field label:
	"${fieldPrompt}"

	Generate a short, personalized answer. Do not include preample in your response. Your response will be passed directly into the form answer field
	
	If no context is provided, provide vague but prompt relevant response for the application form
	`;

	const result = await model.generateContent(prompt);
	return result.response.text().trim();
}
