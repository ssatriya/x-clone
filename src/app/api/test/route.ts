import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const post = await db.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        likes: true,
      },
    });
    const like = await db.like.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    const likedPostId = like.map((li) => li.post_id);
    console.log(likedPostId);

    const likedPost = await db.post.findMany({
      where: {
        id: { in: likedPostId },
      },
    });

    const llc = likedPost.map((ll) => {
      return { ...ll, liked: true };
    });

    const merged = [...post, ...llc];
    // console.log(post);
    // console.log(likedPost);

    const all = merged.sort(
      (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
    );

    return new Response(JSON.stringify([...post, ...all]));
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}
