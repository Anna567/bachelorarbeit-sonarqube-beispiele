import { Router } from "express";
import { helloWorld } from "../controllers/hello.controller";

const router = Router();

router.get("/hello", helloWorld);

export default router;