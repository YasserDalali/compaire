import { Request, Response } from "express";
import z from "zod";
import UserController from "./user.controller";
import prisma from "../prisma";
import { comparePassword } from "../utils/jwt-bcrypt";
class Auth {
    static async login(req: Request, res: Response) {
        const loginSchema = z.object({
            email: z.email(),
            password: z.string().min(6),
        })
        try {
            const validateData = loginSchema.parse(req.body);
            if (!validateData) {
                return res.status(400).json({ error: "Invalid data" });
            }
            
            const user = await prisma.user.findUnique({where: { email: validateData.email } });
            if (!user) {  
                return res.status(404).json({ error: "User not found" });
              }
            const isPassValid = await comparePassword(validateData.password, user.password);
            if (!isPassValid) {
                return res.status(401).json({ error: "Invalid password" });
            }



            // Login logic here

        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error });
            }
            res.status(500).json({ error: "Failed to login" });
        }
    }
    
    static async register(req: Request, res: Response) {

        // Registration logic here
    }
    
    static async logout(req: Request, res: Response) {

        // Logout logic here
    }

}