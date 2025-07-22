// import { Router } from "express";
// import { generateAnswer } from "../utils/gemini.js";
// import { pinecone } from "../utils/pinecone.js";

// const router = Router();

// router.post("/", async (req, res) => {
// 	const user = req.user;

// 	const data = req.body?.data;
// 	if (!data) {
// 		return res.status(404).statusMessage("Data not attached");
// 	}
// 	const queryEmbeddings = data.map((field) => {
// 		let index = field.fieldIndex;
// 		let label = field.label;
// 		let entries = {
// 			fieldIndex: index,
// 			label: label,
// 			query: label,
// 		};
// 		return [
// 			...entries,
// 			// embedding: await getEmbedding(prompt.query),
// 		];
// 	});
// 	let llmQueryResponsePromises;

// 	try {
// 		llmQueryResponsePromises = await queryEmbeddings.map(
// 			async (formQueryEmbed) => {
// 				let llmQueryResponsesPromises = await formQueryEmbed.map(
// 					async (labelEntry) => {
// 						let formLabelResponse = { ...labelEntry };

// 						let vectorDBResponse = await pinecone
// 							.index(process.env["PINECONE_INDEX_NAME"])
// 							.namespace(user.email)
// 							.searchRecords({
// 								query: {
// 									topK: 3,
// 									inputs: {
// 										text: labelEntry.query,
// 									},
// 								},
// 								fields: ["chunk_text"],
// 							});

// 						let context = await vectorDBResponse.result.hits
// 							.map((hit) => hit.fields["chunk_text"])
// 							.join("\n");

// 						formLabelResponse["response"] = await generateAnswer(
// 							context,
// 							labelEntry.query
// 						);

// 						return formLabelResponse;
// 					}
// 				);
// 				const resolvedLlmQueryResponses = await Promise.all(
// 					llmQueryResponsesPromises
// 				);

// 				console.log(resolvedLlmQueryResponses);
// 				return {
// 					formIndex: resolvedLlmQueryResponses[0]["formIndex"],
// 					responses: [...resolvedLlmQueryResponses],
// 				};
// 			}
// 		);

// 		let llmQueryResponse = await Promise.all(llmQueryResponsePromises);

// 		return res.json({ data: llmQueryResponse });
// 	} catch (e) {
// 		console.log("Error fetching LLM query responses", e);
// 		res.status(500).json({ error: "Failed to fetch LLM query responses." });
// 		throw e;
// 	}
// });

// export default router;

import { Router } from "express";
import { generateAnswer } from "../utils/gemini.js";
import { pinecone } from "../utils/pinecone.js";

const router = Router();

router.post("/", async (req, res) => {
	const user = req.user;
	const data = req.body?.data;

	if (!data || !Array.isArray(data)) {
		return res.status(400).json({ error: "Invalid or missing data payload." });
	}

	try {
		// Process each field
		const results = await Promise.all(
			data.map(async (field) => {
				const { fieldIndex, label } = field;

				// Search vector DB with the label as query
				const vectorDBResponse = await pinecone
					.index(process.env["PINECONE_INDEX_NAME"])
					.namespace(user.email)
					.searchRecords({
						query: {
							topK: 3,
							inputs: { text: label },
						},
						fields: ["chunk_text"],
					});

				// Build context string from Pinecone hits
				const context = vectorDBResponse.result.hits
					.map((hit) => hit.fields["chunk_text"])
					.join("\n");

				// Use Gemini to generate answer using context + label
				const response = await generateAnswer(context, label);

				return {
					fieldIndex,
					label,
					response,
				};
			})
		);

		// Respond with the generated answers
		console.log("Generated responses:", results);
		if (results.length === 0) {
			return res.status(404).json({ error: "No relevant information found." });
		}
		return res.json({ data: results });
	} catch (e) {
		console.error("❌ Error fetching LLM query responses:", e);
		res.status(500).json({ error: "Failed to generate responses." });
	}
});

export default router;
