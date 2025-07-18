import express from "express";
import axios from "axios";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt.js";
import datasource from "../lib/database/datasource.js";
import { google } from "googleapis";

const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
	process.env["CLIENT_ID"],
	process.env["CLIENT_SECRET"],
	process.env["REDIRECT_URI"]
);

router.get("/google/callback", async (req, res) => {
	const { code } = req.query;
	let authServerResponse = await oauth2Client.getToken(code);
	oauth2Client.setCredentials(authServerResponse.tokens);
	const id_token = authServerResponse.tokens.id_token;

	const userInfo = await axios.get(
		`https://www.googleapis.com/oauth2/v1/userinfo?alt=json`,
		{
			headers: {
				Authorization: `Bearer ${authServerResponse.tokens.access_token}`,
			},
		}
	);
	if (!userInfo) {
		return res.status(400).message("Login Failed");
	}
	const user = userInfo.data;

	const userRepository = datasource.getRepository("Users");

	try {
		const dbUser = await userRepository.findOne({
			where: { email: user["email"] },
		});

		if (!dbUser) {
			let newUser = await userRepository.save({
				full_name: user.name,
				email: user.email,
				auth_provider: "google",
				google_id_token: id_token,
				status: "active",

				picture: user.picture,
			});
		}
		const accessToken = signAccessToken(user);
		const refreshToken = signRefreshToken(user);

		// Now redirect the user (from backend) back to the extension with the token
		res.redirect(
			`https://${process.env["EXTENSION_ID"]}.chromiumapp.org/?accessToken=${accessToken}&refresh_token=${refreshToken}`
		);
	} catch (err) {
		console.error(err.response?.data || err.message);
		res.status(400).json({ error: "OAuth login failed" });
	}
});

router.get("/me", async (req, res) => {
	const { accessToken } = req.headers["authorization"];
	let user;
	try {
		user = verifyRefreshToken(accessToken);
	} catch (e) {
		return res.status(401).message("Unauthorized");
	}

	const dbUser = await userRepository.findOne({
		where: { email: user["email"] },
	});

	if (dbUser) {
		return res.json({ user });
	}

	return res.status(404).message("User not found");
});

router.post("/refresh", async (req, res) => {
	const { refreshToken } = req.body;
	try {
		const user = verifyRefreshToken(refreshToken);
		const newAccessToken = signAccessToken(user);
		res.json({ accessToken: newAccessToken });
	} catch (err) {
		res.status(401).json({ error: "Invalid or expired refresh token" });
	}
});

// router.post("/auth/callback/google", async (req, res) => {
// 	const { refreshToken } = req.body;
// 	try {
// 		const user = verifyRefreshToken(refreshToken);
// 		const newAccessToken = signAccessToken(user);
// 		res.json({ accessToken: newAccessToken });
// 	} catch (err) {
// 		res.status(401).json({ error: "Invalid or expired refresh token" });
// 	}
// });

export default router;
