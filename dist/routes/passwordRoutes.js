import { Router } from "express";
import { authLimiter } from "../config/ratelimit.js";
import { ZodError } from "zod";
import { checkDateHourDiff, formatError, renderEmailEjs } from "../helper.js";
import { forgotPasswordSchema, resetPasswordSchema } from "../validations/authValidations.js";
import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { sendMail } from "../config/mail.js";
const passRouter = Router();
passRouter.post("/forgot-password", authLimiter, async (req, res) => {
    try {
        const body = req.body;
        const payload = forgotPasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(422).json({
                message: "Inavlid Data", errors: {
                    email: "No user found with this email"
                }
            });
        }
        const salt = await bcrypt.genSalt(10);
        const token = await bcrypt.hash(uuid(), salt);
        await prisma.user.update({
            data: {
                password_reset_token: token,
                token_send_at: new Date().toISOString()
            },
            where: {
                email: payload.email
            }
        });
        const url = `${process.env.CLIENT_APP_URL}/reset-password?email=${payload.email}&token=${token}`;
        const html = await renderEmailEjs("forgotPassword", { url: url, name: payload.email });
        await sendMail(payload.email, "Reset Your Password", html);
        return res.json({
            message: "Email Send Successfully. Please check your mail box to reset your password"
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
passRouter.post("/reset-password", async (req, res) => {
    try {
        const body = req.body;
        const payload = resetPasswordSchema.parse(body);
        const user = await prisma.user.findUnique({
            where: {
                email: payload.email
            }
        });
        if (!user) {
            return res.status(422).json({
                message: "Inavlid Data", errors: {
                    email: "Make sure the url is correct for password reset.Please check the url"
                }
            });
        }
        // Check token
        if (user.password_reset_token !== payload) {
            return res.status(422).json({
                message: "Inavlid Data", errors: {
                    email: "Make sure the url is correct for password reset.Please check the url"
                }
            });
        }
        // check time frame
        const hourDiff = checkDateHourDiff(user.token_send_at);
        if (hourDiff > 2) {
            return res.status(422).json({
                message: "Inavlid Data", errors: {
                    email: "Expired. Reset Again"
                }
            });
        }
        // if everything okay then update password
        const salt = await bcrypt.genSalt(10);
        const newPass = await bcrypt.hash(payload.password, salt);
        await prisma.user.update({
            data: {
                password: newPass,
                password_reset_token: null,
                token_send_at: null
            },
            where: {
                email: payload.email
            }
        });
        return res.json({ message: "Password Reset Successfully. Please log in your account now" });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Register Method", error: error });
    }
});
export default passRouter;
