import { Router } from "express"
import authRouter from "./authRoutes.js"
import verifyRoutes from "./verifyEmail.js"
import passRouter from "./passwordRoutes.js"

const routeHandler = Router()

routeHandler.use("/api/auth", authRouter)
routeHandler.use("/api/auth", passRouter)
routeHandler.use("/", verifyRoutes)


export default routeHandler