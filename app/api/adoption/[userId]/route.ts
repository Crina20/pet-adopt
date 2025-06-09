import prisma from "@/app/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { userId: string }}) {
  const paramsResponse = await params;
  if (!paramsResponse.userId) {
    return NextResponse.json(
      { message: "Missing userId parameter" },
      { status: 400 }
    );
  }

  try {
    const requestsMade = await prisma.petAdoption.findMany({
      where: { requestedById: paramsResponse.userId },
      include: {
        animal: true,
        requestedTo: true,
        requestedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const requestsReceived = await prisma.petAdoption.findMany({
      where: { requestedToId: paramsResponse.userId },
      include: {
        animal: true,
        requestedTo: true,
        requestedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requestsMade, requestsReceived });
  } catch (error) {
    console.error("Error fetching adoptions:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
