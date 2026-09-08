import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@odthan/database";
import { contactRequestSchema } from "@odthan/validation";
import { checkRateLimit } from "@odthan/auth";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { allowed } = checkRateLimit(`contact:${ip}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Trop de messages envoyés. Réessayez plus tard." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Formulaire invalide.", details: parsed.error.flatten() }, { status: 400 });
  }

  const contact = await prisma.contactRequest.create({ data: parsed.data });

  return NextResponse.json({ success: true, id: contact.id }, { status: 201 });
}
