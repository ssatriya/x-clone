import { auth } from "@/lib/lucia";
import { NextRequest } from "next/server";
import * as context from "next/headers";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
  try {
    const authRequest = auth.handleRequest(req.method, context);

    const session = await authRequest.validate();
    if (!session) {
      return new Response(null, {
        status: 401,
      });
    }

    await auth.invalidateSession(session.sessionId);
    authRequest.setSession(null);

    return new Response(null, {
      status: 301,
    });
  } catch (error) {
    return new Response("Internal server error.", { status: 500 });
  }
}
