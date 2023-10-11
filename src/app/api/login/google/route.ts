import { googleAuth } from "@/lib/lucia";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const [url, state] = await googleAuth.getAuthorizationUrl();

    // store state
    cookies().set("google_oauth_state", state, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60,
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: url.toString(),
      },
    });
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
