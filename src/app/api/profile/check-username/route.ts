import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { removeAtSymbol } from "@/lib/utils";
import { UsernameValidator } from "@/lib/validator/username";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const usernameParams = searchParams.get("username");
    const userId = searchParams.get("userId");

    if (!usernameParams) {
      return new Response("Username is missing.", { status: 401 });
    }
    // const splitUsername = usernameParams.slice(1, usernameParams.length);
    const usernameWithoutAt = removeAtSymbol(usernameParams);

    const username = UsernameValidator.parse(usernameWithoutAt);

    if (!userId) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const user = await db.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
    });

    if (user.length === 0) {
      return new Response("Username is available.", { status: 200 });
    }

    const filterUsername = user.filter(
      (u) => u.username === username.toLowerCase()
    );

    if (filterUsername.length !== 0) {
      return new Response("Username is already exist.", { status: 409 });
    } else {
      return new Response("Username is available.", { status: 200 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error.message);
      return new Response(error.message, { status: 402 });
    }

    return new Response("Failed to check username.", { status: 500 });
  }
}
