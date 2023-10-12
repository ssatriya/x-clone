import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { RepostValidator } from "@/lib/validator/repost";
import { PostType } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      return new Response("Unauthorized.", { status: 401 });
    }

    const body = await req.json();
    const { postId, repostType, originalPostOwnerId } =
      RepostValidator.parse(body);

    const repostExist = await db.repost.findFirst({
      where: {
        user_id: session.user.userId,
        post_id: postId,
      },
    });

    const originalPost = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        user_one: true,
      },
    });

    if (!originalPost) {
      return new Response("Post not found", { status: 404 });
    }

    if (repostExist) {
      const originalPost = await db.post.findFirst({
        where: {
          AND: {
            user_two_id: originalPostOwnerId,
            originalPostId: repostExist.post_id,
            post_type: PostType.REPOST,
          },
        },
      });

      if (originalPost) {
        await db.post.delete({
          where: { id: originalPost.id },
        });

        await db.repost.delete({
          where: {
            user_id_post_id: {
              user_id: session.user.userId,
              post_id: postId,
            },
          },
        });
        return new Response("Ok");
      }
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
        content: originalPost?.content,
        image_url: originalPost.image_url,
        post_type: PostType.REPOST,
        originalPostId: postId,
      },
    });

    // Sementara tambah semua data repost ke hasil repost untuk mendapatkan jumlah repost
    // const allRepost = await db.repost.findMany({
    //   where: {
    //     post_id: postId,
    //     repost_type: repostType,
    //   },
    // });

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
    const repost = await db.repost.findMany({
      where: {
        post_id: postId,
      },
    });
    return new Response(JSON.stringify(repost));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
