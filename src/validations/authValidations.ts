import { z } from "zod"

export const registerSchema = z.object({
    name: z.string({ message: "Name is required" }).min(5, "name must be 6 character").max(40, "maxiumum 40 character allowed in name"),
    email: z.string({ message: "email is required" }).email({ message: "Please use the correct email" }),
    password: z.string({ message: "Password is required" }).min(6, "password must be 6 character"),
    confirmPassword: z.string({ message: "Confirm Password is required" }).min(6, "must be same as password")
}).refine((data) => data.password === data.confirmPassword, { message: "Confirm password does not matched", path: ["confirmPassword"] })


export const loginSchema = z.object({
    email: z.string({ message: "email is required" }).email({ message: "Please use the correct email" }),
    password: z.string({ message: "Password is required" }).min(6, "Enter correct password or email"),
})


export const forgotPasswordSchema = z.object({
    email: z.string({ message: "email is required" }).email({ message: "Please use the correct email" }),
})


export const resetPasswordSchema = z.object({
    email: z.string({ message: "email is required" }).email({ message: "Please use the correct email" }),
    token: z.string({ message: "token is required" }),
    password: z.string({ message: "Password is required" }).min(6, "password must be 6 character"),
    confirmPassword: z.string({ message: "Confirm Password is required" }).min(6, "must be same as password")
}).refine((data) => data.password === data.confirmPassword, { message: "Confirm password does not matched", path: ["confirmPassword"] })