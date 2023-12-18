import { auth } from "@/lib/lucia";
import { NextRequest, NextResponse } from "next/server";
import * as context from "next/headers";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
  try {
    const authRequest = auth.handleRequest(req.method, context);

    const session = await authRequest.validate();
    if (!session) {
      return new NextResponse(null, {
        status: 401,
      });
    }

    await auth.invalidateSession(session.sessionId);

    const sessionCookie = auth.createSessionCookie(null);

    return new NextResponse(null, {
      headers: {
        Location: "/",
        "Set-Cookie": sessionCookie.serialize(),
      },
      status: 302,
    });
  } catch (error) {
    return new NextResponse("Internal server error.", { status: 500 });
  }
}
