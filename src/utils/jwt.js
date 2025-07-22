import jwt from "jsonwebtoken";

const ACCESS_TOKEN_EXPIRY = "1hr";
const REFRESH_TOKEN_EXPIRY = "30d";

export function signAccessToken(user) {
	return jwt.sign(
		{ sub: user.sub, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: ACCESS_TOKEN_EXPIRY }
	);
}

export function signRefreshToken(user) {
	return jwt.sign({ sub: user.sub }, process.env.JWT_SECRET, {
		expiresIn: REFRESH_TOKEN_EXPIRY,
	});
}

export function verifyRefreshToken(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
}
