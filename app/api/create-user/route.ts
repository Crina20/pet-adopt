import { CreateUserModel } from "@/models/createUserModel";
import prisma from "@/app/prisma";

export async function POST(req: Request) {
  const body = await req.json();
  const userToCreate: CreateUserModel = body;
  if (userToCreate) {
    const result = await prisma.user.create({
      data: {
        id: userToCreate.uid,
        email: userToCreate.email,
      },
    });
    if (result) {
      return Response.json({
        message: "User created",
        status: 200,
        data: userToCreate.email,
      });
    }

    return Response.json({
      message: "Prisma user creation failed",
      status: 500,
    });
  }

  return Response.json({
    message: "Issue converting data",
    status: 400,
    data: body,
  });
}
