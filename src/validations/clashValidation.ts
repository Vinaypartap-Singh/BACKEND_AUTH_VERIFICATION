import { z } from "zod"

export const clashSchema = z.object({
    content: z.string({ message: "post content is required" }),
    tags: z.string({ message: "Add some tags for optimization" }).optional()
})