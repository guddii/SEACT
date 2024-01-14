import { Router } from "express";
import { statusRead } from "./status.controller";

export const statusRouter: Router = Router();

statusRouter.get("/", statusRead);
