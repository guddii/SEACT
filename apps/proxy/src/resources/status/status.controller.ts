import type { RequestHandler } from "express";

export const statusRead: RequestHandler = (req, res) => {
  return res.json({ ok: true });
};
