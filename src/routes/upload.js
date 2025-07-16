import express from "express";
import multer from "multer";
import { parsePdf } from "../utils/pdf.js";
import { getEmbedding } from "../utils/openai.js";
// import { index } from "../utils/pinecone.js";
import jwt from "jsonwebtoken";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/", upload.single("file"), async (req, res) => {
	const token = req.headers.authorization?.split(" ")[1];
	const user = jwt.verify(token, process.env.JWT_SECRET);
	const userId = user.sub;

	const text = await parsePdf(req.file.path);
	const chunks = text.match(/(.|[\r\n]){1,400}/g);

	const vectors = await Promise.all(
		chunks.map(async (chunk, i) => ({
			id: `${req.file.filename}-${i}`,
			values: await getEmbedding(chunk),
			metadata: {
				text: chunk,
				user_id: userId,
				filename: req.file.originalname,
			},
		}))
	);

	// await index.upsert({ namespace: userId, vectors });
	res.json({ uploaded: chunks.length });
});

export default router;
