import { NextRequest, NextResponse } from "next/server";
import { revokeSession } from "@odthan/auth";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("odthan_session")?.value;

  if (token) {
    await revokeSession(token);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("odthan_session");
  return response;
}
