import express, { Application, Request, Response } from "express"
import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import ejs from "ejs"
import { sendMail } from "./config/mail.js"
import RouteHandler from "./routes/index.js"
import cors from "cors"
import { appLimiter } from "./config/ratelimit.js"

const app: Application = express()
app.use(cors())

// Ejs Template FilePath

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Middlewares 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(appLimiter)

// set ejs view engine
app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, "./views"))

// Handle All Routes Here

app.use(RouteHandler)


const PORT = process.env.PORT || 7000

app.get("/", async (req: Request, res: Response) => {
    const html = await ejs.renderFile(__dirname + `/views/emails/email.ejs`, { name: "Vinaypartap Singh" })
    await sendMail("developervsandhu@gmail.com", "Test Email from Custom Backend Server", html)
    return res.render("welcome")
})


app.listen(PORT, () => console.log(`App is running on http://localhost:${PORT}`))