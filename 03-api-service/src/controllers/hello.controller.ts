import { Request, Response } from "express";

export const helloWorld = (req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Node.js Backend!" });
};