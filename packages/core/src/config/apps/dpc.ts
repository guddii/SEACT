import process from "node:process";
import { SolidApp, SolidAppProxy } from "../../models/solid-app.ts";

export const DPC = new SolidApp({
  baseUrl: process.env.DPC_BASE_URL || "http://localhost:5000",
});
