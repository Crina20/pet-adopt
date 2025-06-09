import prisma from "@/app/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 9);

  const formatDate = (d: Date) =>
    d.toISOString().split("T")[0]; 

  const animals = await prisma.animal.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const adoptions = await prisma.petAdoption.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    select: {
      createdAt: true,
    },
  });

  const stats: Record<string, { animals: number; adoptions: number }> = {};

  for (let i = 0; i < 10; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const key = formatDate(date);
    stats[key] = { animals: 0, adoptions: 0 };
  }

  animals.forEach((a) => {
    const key = formatDate(a.createdAt);
    if (stats[key]) stats[key].animals += 1;
  });

  adoptions.forEach((a) => {
    const key = formatDate(a.createdAt);
    if (stats[key]) stats[key].adoptions += 1;
  });

  const dailyStats = Object.entries(stats).map(([date, values]) => ({
    date,
    ...values,
  }));

  return NextResponse.json({
    totalAnimals: animals.length,
    totalAdoptions: adoptions.length,
    dailyStats,
  });
}
