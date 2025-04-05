import prisma from "@/app/prisma";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  const { userId } = await params;
  const result = await prisma.user.findUnique({
    where: {
      id: userId.toString(),
    },
  });
  if (result) {
    return Response.json({ message: "ok", status: 200, data: result });
  } else {
    return Response.json({ message: "not found", status: 404 });
  }
}
