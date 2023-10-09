import PhotoModal from "@/components/layout/center/photo-modal";
import { db } from "@/lib/db";
import getCurrentSession from "@/lib/getCurrentSession";
import { redirect } from "next/navigation";

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
      user_two: {
        include: {
          followers: true,
          following: true,
        },
      },
      replys: true,
      reposts: true,
      likes: true,
    },
  });

  if (!post) {
    return redirect("/home");
  }

  return (
    <PhotoModal
      params={params}
      post={post}
      currentUserId={session?.user.userId}
    />
  );
}
