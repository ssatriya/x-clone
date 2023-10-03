import { auth, googleAuth } from "@/lib/lucia";
import { OAuthRequestError } from "@lucia-auth/oauth";
import { cookies, headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import type { NextRequest } from "next/server";
import { customAlphabet } from "nanoid";

export async function GET(req: NextRequest) {
  const storedState = cookies().get("google_oauth_state")?.value;

  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  // validate state
  if (!storedState || !state || storedState !== state || !code) {
    return new Response("Invalid state", {
      status: 400,
    });
  }

  const alphabet = "0123456789";
  const nanoid = customAlphabet(alphabet, 5);

  try {
    const { getExistingUser, createUser, googleUser } =
      await googleAuth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;

      const defaultUsername = `${googleUser.name.replace(/\s/g, "")}`.padEnd(
        15,
        nanoid()
      );

      const user = await createUser({
        userId: createId(),
        attributes: {
          name: googleUser.name,
          username: defaultUsername,
          email: googleUser.email!,
          avatar: googleUser.picture!,
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });

    const authRequest = auth.handleRequest(req.method, {
      cookies,
      headers,
    });

    authRequest.setSession(session);

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/home",
      },
    });
  } catch (error) {
    console.log(error);
    if (error instanceof OAuthRequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}
