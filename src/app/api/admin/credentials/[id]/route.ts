import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/get-admin-user";
import { prisma } from "@/lib/prisma";
import { credentialFormSchema, toCredentialDbValues } from "@/validations/credential";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateCredentialPaths() {
  revalidatePath("/about");
  revalidatePath("/admin/credentials");
}

export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const credential = await prisma.credential.findUnique({
    where: { id },
    include: {
      image: { select: { id: true, publicUrl: true, filename: true } },
    },
  });

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  return NextResponse.json({ credential });
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.credential.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    if (existing.source !== "MANUAL") {
      return NextResponse.json(
        { error: "Synced credentials can only be updated via platform sync" },
        { status: 409 },
      );
    }

    const body = await request.json();
    const parsed = credentialFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const credential = await prisma.credential.update({
      where: { id },
      data: toCredentialDbValues(parsed.data),
      include: {
        image: { select: { id: true, publicUrl: true, filename: true } },
      },
    });

    revalidateCredentialPaths();

    return NextResponse.json({ credential });
  } catch (error) {
    console.error("Credential update error:", error);
    return NextResponse.json(
      { error: "Failed to update credential" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const existing = await prisma.credential.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Credential not found" }, { status: 404 });
    }

    await prisma.credential.delete({ where: { id } });

    revalidateCredentialPaths();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Credential delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 },
    );
  }
}
