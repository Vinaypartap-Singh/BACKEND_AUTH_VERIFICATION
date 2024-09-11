import { Router } from "express"
import authRouter from "./authRoutes.js"
import verifyRoutes from "./verifyEmail.js"
import passRouter from "./passwordRoutes.js"
import postRouter from "./postRoutes.js"
import authMiddleware from "../middleware/authMiddleware.js"

const routeHandler = Router()

routeHandler.use("/api/auth", authRouter)
routeHandler.use("/api/auth", passRouter)
routeHandler.use("/", verifyRoutes)
routeHandler.use("/api/post", authMiddleware, postRouter)


export default routeHandler