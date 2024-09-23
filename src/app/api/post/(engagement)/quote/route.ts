import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { generateIdFromEntropySize } from "lucia";

import db from "@/lib/db";
import { QuoteInfo } from "@/types";
import { CreateQuoteSchema } from "@/lib/zod-schema";
import { postTable, quoteTable } from "@/lib/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

export async function GET(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const postId = req.nextUrl.searchParams.get("postId");

    if (!postId) {
      return new Response("invalid search params", { status: 400 });
    }

    const res = await db
      .select()
      .from(quoteTable)
      .where(eq(quoteTable.quoteTargetId, postId));

    const data: QuoteInfo = {
      quoteCount: res.length,
      isQuotedByUser: res.some((q) => q.userOriginId === loggedInUser.id),
    };

    return Response.json(data);
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return new Response("unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = CreateQuoteSchema.safeParse(body);

    if (!payload.success) {
      return new Response("invalid payload", { status: 400 });
    }

    const { content, media, postType, quoteTargetId } = payload.data;

    const postId = generateIdFromEntropySize(10);
    const quoteId = generateIdFromEntropySize(10);

    await db.transaction(async (tx) => {
      await tx.insert(postTable).values({
        id: postId,
        postType: postType,
        content: content,
        media: media,
        userId: loggedInUser.id,
        rootPostId: postId,
        originalPostId: quoteTargetId,
      });
      await tx.insert(quoteTable).values({
        id: quoteId,
        quoteTargetId: quoteTargetId,
        userOriginId: loggedInUser.id,
      });
    });

    return new Response("quoted successfully", { status: 201 });
  } catch (error) {
    return new Response("internal server error", { status: 500 });
  }
}
