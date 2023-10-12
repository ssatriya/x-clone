import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { LikeValidator } from "@/lib/validator/like";

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { postId } = LikeValidator.parse(body);

    const likeExist = await db.like.findFirst({
      where: {
        user_id: session.user.userId,
        post_id: postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user_one: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (likeExist) {
      await db.like.delete({
        where: {
          user_id_post_id: {
            post_id: postId,
            user_id: session.user.userId,
          },
        },
      });
      return new Response("Ok");
    }

    await db.like.create({
      data: {
        post_id: postId,
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
      return new Response("Post ID is missing.", { status: 400 });
    }

    const like = await db.like.findMany({
      where: {
        post_id: postId,
      },
    });

    return new Response(JSON.stringify(like));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
