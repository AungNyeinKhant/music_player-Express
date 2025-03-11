import { Request, Response } from "express";
import { CustomerRegisterDto } from "../../types/customer.dto";
import { responseFormatter } from "../../utils/helper";

export function getCustomer(req: Request, res: Response) {
  res.send("Get customer");
}

export async function createCustomer(
  req: Request<{}, {}, CustomerRegisterDto>,
  res: Response
): Promise<any> {
  console.log(req.body);
  // if (req.body.length === 0) {
  //   const response = responseFormatter(
  //     true,
  //     "Request body is missing",
  //     req.body
  //   );
  //   res.status(400).json(response);
  //   return;
  // }

  const { username, email, password } = req.body as CustomerRegisterDto;
  if (!email || !password) {
    const response = responseFormatter(
      false,
      "Email and password are required"
    );
    return res.status(400).json(response);
  }

  const response = responseFormatter(true, "Customer created", [req.body]);
  return res.status(201).json(response);
}
