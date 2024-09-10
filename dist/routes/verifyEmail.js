import { Router } from "express";
import prisma from "../config/database.js";
const router = Router();
router.get("/verify-email", async (req, res) => {
    const { email, token } = req.query;
    if (email && token) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (user) {
            if (token === user.email_verify_token) {
                await prisma.user.update({
                    data: {
                        email_verify_token: null,
                        email_verified_at: new Date().toISOString()
                    },
                    where: {
                        email: user.email
                    }
                });
                return res.redirect(`${process.env.CLIENT_APP_URL}/login`);
            }
            res.redirect("/verify-error");
        }
    }
    res.redirect("/verify-error");
});
router.get("/verify-error", (req, res) => {
    return res.render("emails/verifyError");
});
export default router;
