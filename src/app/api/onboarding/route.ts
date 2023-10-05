import getCurrentSession from "@/lib/getCurrentSession";
import { OnboardingValidator } from "@/lib/validator/onboarding";
import { z } from "zod";
import { parse, format } from "date-fns";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { birthdate, bio, username } = OnboardingValidator.parse(body);

    const isUsernameExist = await db.user.findMany({
      where: {
        id: {
          not: session.user.userId,
        },
      },
    });

    const filterUsername = isUsernameExist.filter(
      (user) => user.username === username.toLowerCase()
    );

    if (filterUsername.length > 0) {
      return new Response("Username already exist.", { status: 409 });
    }

    const parsedBirthdate = parse(birthdate, "yyyy-MM-dd", new Date());
    const formattedBirthdate = format(parsedBirthdate, "yyyy-MM-dd");

    await db.user.update({
      data: {
        birthdate: formattedBirthdate,
        bio: bio,
        username: `@${username}`,
        onboarding: true,
      },
      where: {
        id: session.user.userId,
      },
    });

    return new Response(null, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 402 });
    }

    return new Response("Failed to submit onboarding data.", { status: 500 });
  }
}
