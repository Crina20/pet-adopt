import prisma from "@/app/prisma";
import { User } from "@prisma/client";

export async function PUT(req: Request) {
  const userToUpdate: User = await req.json();

  const result = await prisma.user.update({
    where: {
      id: userToUpdate.id,
    },
    data: {
      fullName: userToUpdate.fullName,
      address: userToUpdate.address,
      age: userToUpdate.age,
      description: userToUpdate.description,
      phone: userToUpdate.phone,
      picture: userToUpdate.picture,
      updatedAt: new Date(),
    },
  });

  if (result) {
    return Response.json({
      message: "User created",
      status: 200,
      data: userToUpdate.email,
    });
  }

  return Response.json({
    message: "Prisma user creation failed",
    status: 500,
  });
}
