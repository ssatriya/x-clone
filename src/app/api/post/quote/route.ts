import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { QuoteValidator } from "@/lib/validator/quote";
import { PostType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { postId, originalPostOwnerId, repostType, imageUrl, content } =
      QuoteValidator.parse(body);

    const originalPost = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user_one: true,
      },
    });

    if (!originalPost) {
      return new Response("Original post not found.", { status: 404 });
    }

    await db.repost.create({
      data: {
        post_id: postId,
        user_id: session.user.userId,
        repost_type: repostType,
      },
    });

    await db.post.create({
      data: {
        user_one_id: session.user.userId,
        user_two_id: originalPostOwnerId,
        // @ts-ignore
        content: content,
        image_url: imageUrl,
        post_type: repostType,
        original_repost_post_id: postId,
      },
    });

    return new Response("Ok");
  } catch (error) {
    return new Response("Internal server error.", { status: 401 });
  }
}
