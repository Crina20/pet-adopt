// app/api/animals/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/prisma";

interface Params {
  params: { id: string };
}

export async function GET(_: Request, { params }: Params) {
  const animalId = await params;

  try {
    const animal = await prisma.animal.findUnique({
      where: { id: animalId.id },
      include: { user: true },
    });

    if (!animal) {
      return NextResponse.json(
        { message: "Animal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(animal);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching animal" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const { userId, ...updateData } = data;
  const animalId = await params;

  try {
    const animal = await prisma.animal.findUnique({
      where: { id: animalId.id },
    });

    if (!animal) {
      return NextResponse.json(
        { message: "Animal not found" },
        { status: 404 }
      );
    }

    if (animal.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const updatedAnimal = await prisma.animal.update({
      where: { id: animalId.id },
      data: updateData,
    });

    return NextResponse.json(updatedAnimal);
  } catch (error) {
    return NextResponse.json(
      { message: "Error updating animal" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const { userId } = await req.json();
  const animalId = await params;

  try {
    const animal = await prisma.animal.findUnique({
      where: { id: animalId.id },
    });

    if (!animal) {
      return NextResponse.json(
        { message: "Animal not found" },
        { status: 404 }
      );
    }

    if (animal.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await prisma.animal.delete({
      where: { id: animalId.id },
    });

    return NextResponse.json({ message: "Animal deleted" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Error deleting animal" },
      { status: 500 }
    );
  }
}
