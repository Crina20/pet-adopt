// app/api/animals/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/prisma";

// GET: Fetch all animals
export async function GET() {
  try {
    const animals = await prisma.animal.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(animals);
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST: Create a new animal
export async function POST(req: Request) {
  const data = await req.json();
  const {
    name,
    species,
    breed,
    age,
    gender,
    description,
    image,
    latitude,
    longitude,
    userId,
  } = data;

  const intAge = parseInt(age) ?? null;
  const intLatitude = parseFloat(latitude) ?? null;
  const intLongitude = parseFloat(longitude) ?? null;
  try {
    const newAnimal = await prisma.animal.create({
      data: {
        name,
        species,
        breed,
        age: intAge,
        gender,
        description,
        image,
        latitude: intLatitude,
        longitude: intLongitude,
        userId: userId,
      },
    });

    return NextResponse.json(newAnimal, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Failed to create animal" },
      { status: 500 }
    );
  }
}
