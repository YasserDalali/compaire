import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword } from "../utils/jwt-bcrypt";
import { z } from "zod";

class UserController {
  static async getUsers(req: Request, res: Response) {
    try {
      const results = await prisma.user.findMany();
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve users" });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      // Try to parse as integer for ID lookup, if not a number it will be NaN
      const idAsNumber = parseInt(req.params.id);
      
      let user;
      if (!isNaN(idAsNumber)) {
        // If it's a valid number, look up by ID
        user = await prisma.user.findUnique({
          where: { id: idAsNumber },
        });
      } else {
        // Otherwise, try to look up by email
        user = await prisma.user.findUnique({
          where: { email: req.params.id },
        });
      }
      
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve user" });
    }
  }

  static async createUser(req: Request, res: Response) {
    const userSchema = z.object({
      email: z.string().email(),
      name: z.string().optional(),
      password: z.string().min(6),
    });
    try {
      const validatedData = userSchema.parse(req.body);
      const crypted = await hashPassword(validatedData.password);
      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          name: validatedData.name,
          password: crypted,
        },
      });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  static async updateUser(req: Request, res: Response) {
    const updateSchema = z.object({
      email: z.string().email().optional(),
      name: z.string().optional(),
      password: z.string().min(6).optional(),
    });
    try {
      const validatedData = updateSchema.parse(req.body);
      if (validatedData.password) {
        validatedData.password = await hashPassword(validatedData.password);  
      }
      
      // Try to parse as integer for ID lookup
      const idAsNumber = parseInt(req.params.id);
      
      let whereCondition;
      if (!isNaN(idAsNumber)) {
        whereCondition = { id: idAsNumber };
      } else {
        whereCondition = { email: req.params.id };
      }
      
      const user = await prisma.user.update({
        where: whereCondition,
        data: validatedData,
      });
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    try {
      // Try to parse as integer for ID lookup
      const idAsNumber = parseInt(req.params.id);
      
      let whereCondition;
      if (!isNaN(idAsNumber)) {
        whereCondition = { id: idAsNumber };
      } else {
        whereCondition = { email: req.params.id };
      }
      
      const user = await prisma.user.delete({
        where: whereCondition,
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export default UserController;
