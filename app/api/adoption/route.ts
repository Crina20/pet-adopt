import { NextResponse } from "next/server";
import prisma from "@/app/prisma";

export async function POST(req: Request) {
  const data = await req.json();
  const {
   animalId,
   requestedById,
   requestedToId,
   status,
  } = data;
  
  const intStatus = parseInt(status) ?? null;
  try {
    const newAdoption = await prisma.petAdoption.create({
      data: {
        requestedById: requestedById,
        requestedToId: requestedToId,
        animalId: animalId,
        status: intStatus
      },
    });

    return NextResponse.json(newAdoption, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to create animal" },
      { status: 500 }
    );
  }
}