import jwt from "jsonwebtoken";
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === null || authHeader === undefined) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized Access"
        });
    }
    const token = authHeader.split(" ")[1];
    // Verify Token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized Access"
            });
        }
        req.user = user;
        next();
    });
};
export default authMiddleware;
