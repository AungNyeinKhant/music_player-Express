import { Request, Response } from "express";
import { responseFormatter } from "../../utils/helper";
import { UserRegisterDto } from "../../types/user.dto";

export function getUser(req: Request, res: Response) {
  res.send("Get user");
}

export async function createUser(
  req: Request<{}, {}, UserRegisterDto>,
  res: Response
): Promise<any> {
  console.log(req.body);

  // const { username, email, password } = req.body as UserRegisterDto;

  const response = responseFormatter(true, "User created", [req.body]);
  return res.status(201).json(response);
}
