import prisma from "@/app/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = body;

    if (![2, 3, 4].includes(status)) {
      return NextResponse.json(
        { message: "Invalid status. Must be 2 (Approved) or 3 (Rejected). or 4(Cancelled)" },
        { status: 400 }
      );
    }

    const updated = await prisma.petAdoption.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating adoption status:", error);
    return NextResponse.json(
      { message: "Failed to update adoption status" },
      { status: 500 }
    );
  }
}
