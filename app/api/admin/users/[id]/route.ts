import prisma from "@/app/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const { isActive } = await req.json();

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}