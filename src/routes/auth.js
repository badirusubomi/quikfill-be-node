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

	const betaUserRepository = datasource.getRepository("beta_users");

	let betaUser = betaUserRepository.findOne({
		where: {
			email: user.email,
		},
	});

	if (!betaUser) {
		console.log(e);
		res.status(400).json({ message: "Not a beta user" });
		return;
	}

	const userRepository = datasource.getRepository("users");

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

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: true, // Use HTTPS in production
			sameSite: "Lax", // or 'Strict' or 'None' if cross-origin
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Now redirect the user (from backend) back to the extension with the token
		res.redirect(
			`https://${process.env["EXTENSION_ID"]}.chromiumapp.org/?accessToken=${accessToken}`
		);
	} catch (err) {
		console.error(err);
		res.status(400).json({ error: "OAuth login failed" });
	}
});

// router.get("/me", async (req, res) => {
// 	const { accessToken } = req.headers["authorization"];
// 	let user;
// 	try {
// 		user = verifyRefreshToken(accessToken);
// 	} catch (e) {
// 		return res.status(401).message("Unauthorized");
// 	}

// 	const userRepository = datasource.getRepository("user_uploads");

// 	const dbUser = await userRepository.findOne({
// 		where: { email: user["email"] },
// 	});

// 	if (dbUser) {
// 		return res.json({ user });
// 	}

// 	return res.status(404).message("User not found");
// });

router.post("/refresh-token", async (req, res) => {
	const refreshToken = req.cookies?.refreshToken;

	if (!refreshToken) {
		return res.status(401).json({ error: "Refresh token missing" });
	}

	try {
		const userPayload = await verifyRefreshToken(refreshToken);

		const newAccessToken = await signAccessToken(userPayload);

		res.json({ accessToken: newAccessToken });
	} catch (err) {
		console.error("Refresh failed:", err.message);
		res.status(401).json({ error: "Invalid or expired refresh token" });
	}
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
