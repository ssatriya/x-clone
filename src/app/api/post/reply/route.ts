import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { ReplyValidator } from "@/lib/validator/reply";
import { PostType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { postRepliedToId, content, originalPostOwnerId, imageUrl } =
      ReplyValidator.parse(body);

    const post = await db.post.create({
      data: {
        user_one_id: session.user.userId,
        user_two_id: originalPostOwnerId,
        content: content,
        image_url: imageUrl,
        originalPostId: postRepliedToId,
        post_type: PostType.REPLY,
      },
    });

    const reply = await db.reply.create({
      data: {
        post_id: postRepliedToId,
        user_id: session.user.userId,
      },
    });

    return new Response("Ok");
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(req.url);

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const postId = searchParams.get("postId");

    if (!postId) {
      return new Response("Post Id is missing.", { status: 400 });
    }
    const reply = await db.reply.findMany({
      where: {
        post_id: postId,
      },
    });
    return new Response(JSON.stringify(reply));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
