import express, { request } from "express";
import multer from "multer";
import { parsePdf } from "../utils/pdf.js";
import { pinecone } from "../utils/pinecone.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import datasource from "../lib/database/datasource.js";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3";

const s3 = new S3({ region: process.env.S3_REGION });

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.S3_BUCKET,
		metadata: function (req, file, cb) {
			cb(null, { fieldName: file.fieldname });
		},
		key: function (req, file, cb) {
			cb(null, Date.now().toString());
		},
		limits: {
			fileSize: 1024 * 1024 * 5,
		},
	}),
});
const router = express.Router();

const uploadCategory = {
	USER_UPLOAD: "user-upload",
};

router.post("/", upload.single("file"), async (req, res) => {
	// Accept sonly pdf for now

	const userUploadRepo = datasource.getRepository("user_uploads");
	let dbUserUpload;

	try {
		dbUserUpload = await userUploadRepo.save({
			file_name: req.file.originalname,
			file_category: uploadCategory.USER_UPLOAD,
			description: "Resume",
			upload_address_url: req.file.location,
			upload_key: req.file.key,
			file_type: req.file.mimetype,
			status: "uploaded",
			user: req.user,
		});
	} catch (e) {
		throw new Error("Error connecting to database");
	}
	// Get file as buffer

	const text = await parsePdf(dbUserUpload.upload_key);
	const chunks = text.match(/(.|[\r\n]){1,400}/g);

	const vectors = await Promise.all(
		chunks.map(async (chunk, i) => ({
			id: `${req.file.filename}-${i}`,
			chunk_text: chunk,
			user_id: req.user.id,
			file_name: req.file.originalname,
			// values: await getEmbedding(chunk),
			// metadata: {
			// 	text: chunk,
			// 	user_id: userId,
			// 	filename: req.file.originalname,
			// },
		}))
	);
	const namespace = pinecone
		.index(process.env.PINECONE_INDEX_NAME, process.env.PINECONE_HOST_URL)
		.namespace(req.user.email);
	await namespace.upsertRecords(vectors);
	res.json({ success: true });
});

export default router;
