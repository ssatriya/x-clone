import { redirect } from "next/navigation";

type Props = {
  params: {
    username: string;
  };
};

export default function page({ params: { username } }: Props) {
  return redirect(`/${username}`);
}
