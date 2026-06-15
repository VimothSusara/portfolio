import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { prisma } from "@/lib/prisma";
import { credentialFormSchema, toCredentialDbValues } from "@/validations/credential";

function revalidateCredentialPaths() {
  revalidatePath("/about");
  revalidatePath("/admin/credentials");
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const credentials = await prisma.credential.findMany({
    orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
    include: {
      image: { select: { id: true, publicUrl: true, filename: true } },
    },
  });

  return NextResponse.json({ credentials });
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = credentialFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const credential = await prisma.credential.create({
      data: {
        ...toCredentialDbValues(parsed.data),
        source: "MANUAL",
      },
      include: {
        image: { select: { id: true, publicUrl: true, filename: true } },
      },
    });

    revalidateCredentialPaths();

    return NextResponse.json({ credential }, { status: 201 });
  } catch (error) {
    console.error("Credential create error:", error);
    return NextResponse.json(
      { error: "Failed to create credential" },
      { status: 500 },
    );
  }
}
