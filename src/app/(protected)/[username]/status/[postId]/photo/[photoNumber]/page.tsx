import { redirect } from "next/navigation";

type Props = {
  params: {
    username: string;
    postId: string;
  };
};

export default function Page({ params: { username, postId } }: Props) {
  return redirect(`/${username}/status/${postId}`);
}
