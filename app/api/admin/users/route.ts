import prisma from "@/app/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}