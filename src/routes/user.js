import express from "express";
import datasource from "../lib/database/datasource.js";

const router = express.Router();

router.get("/me", async (req, res) => {
	const userRepository = datasource.getRepository("user_uploads");

	const dbUser = await userRepository.findOne({
		where: { email: req.user.email },
	});

	if (dbUser) {
		return res.json({ user });
	}

	return res.status(404).message("User not found");
});

router.post("/logout", (req, res) => {
	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: true,
		sameSite: "Lax",
	});
	res.status(200).json({ message: "Logged out" });
});

export default router;
