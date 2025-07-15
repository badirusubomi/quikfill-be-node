import express from "express";
import axios from "axios";
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from "../utils/jwt.js";

const router = express.Router();

router.post("/login", async (req, res) => {
	const { code } = req.body;

	try {
		// Example for Auth0 or Google
		const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
			code,
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			redirect_uri: process.env.REDIRECT_URI,
			grant_type: "authorization_code",
		});

		const { access_token, id_token } = tokenRes.data;
		const userInfo = await axios.get(
			`https://www.googleapis.com/oauth2/v3/userinfo`,
			{
				headers: { Authorization: `Bearer ${access_token}` },
			}
		);

		const user = userInfo.data;
		const accessToken = signAccessToken(user);
		const refreshToken = signRefreshToken(user);

		res.json({ accessToken, refreshToken, user });
	} catch (err) {
		console.error(err.response?.data || err.message);
		res.status(400).json({ error: "OAuth login failed" });
	}
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

router.post("/google/auth/callback", async (req, res) => {
	const { refreshToken } = req.body;
	try {
		const user = verifyRefreshToken(refreshToken);
		const newAccessToken = signAccessToken(user);
		res.json({ accessToken: newAccessToken });
	} catch (err) {
		res.status(401).json({ error: "Invalid or expired refresh token" });
	}
});

export default router;
