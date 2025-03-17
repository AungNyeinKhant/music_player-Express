import { Request, Response } from "express";

export function getAlbumById(req: Request, res: Response) {
  res.status(200).json({ message: "Welcome from protected route" });
}
