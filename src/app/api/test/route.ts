import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const post = await db.post.findMany({
      where: {
        user_one_id: "mszbg1tyabukq856m8iiinwv",
      },
      orderBy: { createdAt: "desc" },
      include: {
        originalPost: true,
        // user_one: true,
      },
    });

    return new Response(JSON.stringify(post));
  } catch (error) {
    return new Response("Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  // try {
  const { searchParams } = new URL(req.url);

  const postId = searchParams.get("postId");

  await db.post.deleteMany({
    where: {
      originalPostId: "clnn4086u0001pozw6cmg1yqn",
    },
  });
  await db.post.delete({
    where: {
      id: "clnn4086u0001pozw6cmg1yqn",
    },
  });

  return new Response("Ok");
  // } catch (error) {
  //   return new Response("Error", { status: 500 });
  // }
}
