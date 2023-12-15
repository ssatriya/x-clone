import ForceRefresh from "@/components/force-refresh";
import PhotoModal from "@/components/modal/lightbox/photo-modal";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type ModalPageProps = {
  params: {
    photoIndex: string;
    postId: string;
    username: string;
  };
};

export default async function ModalPage({ params }: ModalPageProps) {
  const session = await getCurrentSession();

  const post = await db.post.findUnique({
    where: {
      id: params.postId,
    },
    include: {
      user_one: {
        include: {
          followers: true,
          following: true,
        },
      },
      replys: true,
      reposts: true,
      likes: true,
      original_repost: true,
    },
  });

  if (!session?.user) {
    return redirect("/");
  }

  const user = await db.user.findUnique({
    where: {
      id: session.user.userId,
    },
    include: {
      followers: true,
      following: true,
    },
  });

  if (!post) {
    return redirect("/home");
  }
  if (!user) {
    return redirect("/");
  }

  return (
    <>
      <PhotoModal params={params} post={post} currentUser={user} />;
    </>
  );
}
