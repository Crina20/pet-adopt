import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/app/prisma";
import { NextResponse } from "next/server";

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contracts = await prisma.petAdoption.findMany({
      include: {
        animal: {
          select: { name: true },
        },
        requestedBy: {
          select: { fullName: true, email: true },
        },
        requestedTo: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = contracts.map((contract) => ({
      id: contract.id,
      animalId: contract.animalId,
      animalName: contract.animal.name,
      requestedBy: {
        name: contract.requestedBy.fullName || "Unknown",
        email: contract.requestedBy.email,
      },
      requestedTo: {
        name: contract.requestedTo.fullName || "Unknown",
        email: contract.requestedTo.email,
      },
      status: contract.status,
      createdAt: contract.createdAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Error loading contracts:", error);
    return NextResponse.json("Error");
  }
}
