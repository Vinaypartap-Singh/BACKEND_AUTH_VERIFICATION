import { Router } from "express";
import { ZodError } from "zod";
import { formatError } from "../helper.js";
import { clashSchema, updatePostSchema } from "../validations/clashValidation.js";
import prisma from "../config/database.js";
const postRouter = Router();
// Get All posts
// Get posts including user information
postRouter.get("/", async (req, res) => {
    try {
        const posts = await prisma.post.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        _count: {
                            select: {
                                Post: true
                            }
                        }
                    }
                }
            }
        });
        return res.status(200).json({ message: "Posts fetched successfully", data: posts });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong get all posts include user information", error: error });
    }
});
// get all user specific posts
postRouter.get("/user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userPosts = await prisma.post.findMany({
            where: {
                user_id: Number(id)
            }
        });
        return res.status(200).json({ message: "Posts by user fetched", data: userPosts });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong get user specific post", errors: error });
    }
});
// post add
postRouter.post("/", async (req, res) => {
    try {
        const body = req.body;
        const payload = clashSchema.parse(body);
        await prisma.post.create({
            data: {
                ...payload,
                user_id: req.user?.id
            }
        });
        return res.json({ message: "Post created Successfully" });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong upload or add post", error: error });
    }
});
// get single post using post id
postRouter.get("/:post_id", async (req, res) => {
    try {
        const { post_id } = req.params;
        const post = await prisma.post.findFirst({
            where: {
                id: Number(post_id),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        _count: {
                            select: {
                                Post: true
                            }
                        }
                    }
                }
            }
        });
        return res.status(200).json({ message: "Single post data", data: post });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Post Method", errors: error });
    }
});
// update post 
postRouter.put("/post/:post_id", async (req, res) => {
    try {
        const { post_id } = req.params;
        const body = req.body;
        const payload = updatePostSchema.parse(body);
        if (!post_id) {
            return res.status(400).json({ message: "POST id is not required" });
        }
        const post = await prisma.post.findUnique({
            where: {
                id: Number(post_id)
            }
        });
        if (!post) {
            res.status(400).json({ message: "No post found. PLease check and try again" });
        }
        const updatePost = await prisma.post.update({
            where: {
                id: Number(post_id)
            },
            data: {
                content: payload.content,
                tags: payload.tags,
                updatedAt: new Date()
            }
        });
        return res.status(200).json({ message: "Post Updated Successfully", data: updatePost });
    }
    catch (error) {
        if (error instanceof ZodError) {
            const errors = formatError(error);
            return res.status(422).json({ message: "Invalid details", errors: errors });
        }
        return res.status(500).json({ message: "Something Went Wrong Post Method", errors: error });
    }
});
export default postRouter;
