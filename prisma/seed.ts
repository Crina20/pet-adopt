import prisma from "@/app/prisma";

await prisma.user.upsert({
  where: { email: "admin@gmail.com" },
  update: {},
  create: {
    id: "admin-id-001",
    email: "admin@gmail.com",
    fullName: "PetAdmin",
    age: 22,
    picture: "",
    isAdmin: true,
    isActive: true,
  },
});