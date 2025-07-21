import express from "express";
import { getEmbedding, generateAnswer } from "../utils/openai.js";
// import { index } from "../utils/pinecone.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/", async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];
	const user = jwt.verify(token, process.env.JWT_SECRET);
	const userId = user.sub;

	const { fieldPrompt } = req.body;
	const queryEmbedding = await getEmbedding(fieldPrompt);

	const result = "";

	const context = ""; //result.matches.map((match) => match.metadata.text).join("\n");
	const answer = await generateAnswer(context, fieldPrompt);

	res.json({ answer });
});

export default router;
