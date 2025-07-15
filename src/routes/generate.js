import express from "express";
import { generateResponse } from "../utils/openai.js";

const router = express.Router();

router.post("/", async (req, res) => {
	const { fieldLabel, userProfile } = req.body;
	try {
		const response = await generateResponse(fieldLabel, userProfile);
		res.json({ text: response });
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Failed to generate response" });
	}
});

export default router;
