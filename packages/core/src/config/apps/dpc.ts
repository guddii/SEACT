import process from "node:process";
import { SolidApp } from "../../models/solid-app.ts";

export const DPC = new SolidApp({
  baseUrl: process.env.DPC_BASE_URL || "http://dpc.localhost:5000",
});
