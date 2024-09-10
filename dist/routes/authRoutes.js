import { Router } from "express";
import { loginSchema, registerSchema } from "../validations/authValidations.js";
import { ZodError } from "zod";
import { formatError, renderEmailEjs } from "../helper.js";
import prisma from "../config/database.js";
// Bcrypt JS for password hasing
import bcrypt from "bcrypt";
import { v4 as uuid4 } from "uuid";
import { sendMail } from "../config/mail.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/authMiddleware.js";
import { authLimiter } from "../config/ratelimit.js";
const authRouter = Router();
// Login Route
authRouter.post("/login", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        // check email in db
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user || user === null) {
            return res.status(422).json({
                errors: {
                    email: "No user found with this email"
                }
            });
        }
        // check password if user found
        const compare = await bcrypt.compare(payload.password, user.password);
        if (!compare) {
            return res.status(422).json({
                errors: {
                    email: "Inavlid credentials"
                }
            });
        }
        // jwt payload
        const jwtPayload = {
            id: user.id,
            name: user.name,
            email: user.email,
        };
        const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY, {
            expiresIn: "30d"
        });
        return res.json({
            message: "Account Login Success",
            data: {
                ...jwtPayload,
                token: `Bearer ${token}`
            }
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Register Method", error: error });
    }
});
// Duplicate login api in order to check whether user is logged in or not
authRouter.post("/check/credentials", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = loginSchema.parse(body);
        // check email in db
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user || user === null) {
            return res.status(422).json({
                errors: {
                    email: "No user found with this email"
                }
            });
        }
        // check password if user found
        const compare = await bcrypt.compare(payload.password, user.password);
        if (!compare) {
            return res.status(422).json({
                errors: {
                    email: "Inavlid credentials"
                }
            });
        }
        return res.json({
            message: "Account Login Success",
            data: {}
        });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Register Method", error: error });
    }
});
authRouter.post("/register", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = registerSchema.parse(body);
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (user) {
            return res.status(409).json({ message: "User Already Exist" });
        }
        // Salt for password
        const salt = await bcrypt.genSalt(10);
        payload.password = await bcrypt.hash(payload.password, salt);
        // After Hashing password create a user in prisma
        // Generate a token before user created in database in order to verify and also send verification email to user
        const token = await bcrypt.hash(uuid4(), salt);
        const url = `${process.env.APP_URL}/verify-email?email=${payload.email}&token=${token}`;
        const emailBody = await renderEmailEjs("verifyEmail", { name: payload.email, url: url });
        await sendMail(payload.email, "Verification Email", emailBody);
        // After Verification Create User in Database
        await prisma.user.create({
            data: {
                name: payload.name,
                email: payload.email,
                password: payload.password,
                email_verify_token: token
            }
        });
        return res.status(200).json({ message: "Your account has been created successfully. we have sent you a verification email" });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Register Method", error: error });
    }
});
authRouter.post("/verify-email", async (req, res) => {
    // check for email and token here
});
// Get User
authRouter.get("/user", authMiddleware, async (req, res) => {
    const user = req.user;
    return res.json({ data: user });
});
export default authRouter;
