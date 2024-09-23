import { nanoid } from "nanoid";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";

import db from "@/lib/db";
import { eq } from "drizzle-orm";
import kyInstance from "@/lib/ky";
import { userTable } from "@/lib/db/schema";
import { google, lucia } from "@/lib/auth";

export async function GET(request: NextRequest): Promise<Response> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const storedState = cookies().get("google_oauth_state")?.value;
  const storedCodeVerifier = cookies().get("code_verifier")?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );
    const googleUser: GoogleUser = await kyInstance
      .get("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      })
      .json<GoogleUser>();

    const [existingUser] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.googleId, googleUser.sub));

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/home",
        },
      });
    }

    const userId = generateIdFromEntropySize(10);
    const generatedUsername = `@${googleUser.given_name.replace(
      /\s/g,
      ""
    )}`.padEnd(15, nanoid());

    await db.insert(userTable).values({
      id: userId,
      name: googleUser.name,
      username: generatedUsername,
      email: googleUser.email,
      photo: googleUser.picture,
      googleId: googleUser.sub,
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/home",
      },
    });
  } catch (error) {
    if (error instanceof OAuth2RequestError) {
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

interface GoogleUser {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}
