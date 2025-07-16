import axios from "axios";

export async function getEmbedding(text) {
	const res = await axios.post(
		"https://api.openai.com/v1/embeddings",
		{
			input: text,
			model: "text-embedding-ada-002",
		},
		{
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
		}
	);

	return res.data.data[0].embedding;
}

export async function generateAnswer(context, fieldPrompt) {
	const prompt = `
You're filling a job application. Based on the context:
"${context}"

Answer the question:
"${fieldPrompt}"
`;

	const res = await axios.post(
		"https://api.openai.com/v1/chat/completions",
		{
			model: "gpt-4",
			messages: [{ role: "user", content: prompt }],
			temperature: 0.7,
		},
		{
			headers: {
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
			},
		}
	);

	return res.data.choices[0].message.content.trim();
}
