import { validateRequest } from "@/lib/auth/validate-request";
import db from "@/lib/db";
import { mediaTable } from "@/lib/db/schema";
import { CreateMediaSchema } from "@/lib/zod-schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = CreateMediaSchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { id, url, key, size, format, width, height } = payload.data;

    const [res] = await db
      .insert(mediaTable)
      .values({
        id,
        userId: loggedInUser.id,
        url,
        key,
        size,
        format,
        width,
        height,
      })
      .returning({ id: mediaTable.id });

    return Response.json(res);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
