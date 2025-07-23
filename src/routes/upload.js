import express, { request } from "express";
import multer from "multer";
import { parsePdf } from "../utils/pdf.js";
import { pinecone } from "../utils/pinecone.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import datasource from "../lib/database/datasource.js";
import multerS3 from "multer-s3";
import { S3, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

router.get("/", async (req, res) => {
	const uploadRepo = await datasource.getRepository("user_uploads");

	const uploadedFiles = await uploadRepo.find({
		where: {
			user: {
				email: req.user.email,
			},
		},
	});

	if (uploadedFiles.length === 0) {
		return res.status(404).message({ message: "No files found" });
	}
	let retUploads = uploadedFiles.map((entry) => {
		return {
			fileName: entry.file_name,
			id: entry.id,
			url: entry.upload_address_url,
		};
	});

	return res.json({ message: "Files found", data: retUploads });
});

router.get("/:id", async (req, res) => {
	const uploadRepo = await datasource.getRepository("user_uploads");

	const uploadedFile = await uploadRepo.findOneBy({
		id: req.params.id,
		user: { email: req.user.email },
	});

	if (!uploadedFile) {
		return res.status(404).json({ message: "File not found" });
	}

	return res.json({
		message: "File found",
		data: {
			fileName: uploadedFile.file_name,
			id: uploadedFile.id,
			url: uploadedFile.upload_address_url,
		},
	});
});

router.delete("/:id", async (req, res) => {
	const uploadRepo = await datasource.getRepository("user_uploads");

	const uploadedFile = await uploadRepo.findOneBy({
		id: req.params.id,
		user: { email: req.user.email },
	});

	if (!uploadedFile) {
		return res.status(404).json({ message: "File not found" });
	}

	try {
		const deleteObjectResult = await s3.deleteObject(
			// TO DO: add bucket field to user_uploads table
			{ Bucket: process.env.S3_BUCKET, Key: uploadedFile.upload_key }
		);

		if (deleteObjectResult.metadata.httpStatusCode === 204) {
			let uploadDeleteResult = await uploadRepo.delete({
				id: uploadedFile.id,
			});

			// To do: delete references in pinecone db

			return res.json({
				message: "File succesfully deleted",
				data: {
					fileName: uploadedFile.file_name,
					id: uploadedFile.id,
					url: uploadedFile.upload_address_url,
				},
			});
		}
	} catch (e) {
		console.log("An error occurred while deleting s3 object: ", e);
		res
			.status(500)
			.json({ message: "An error occured while deleting resource" });
		throw e;
	}
});

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
