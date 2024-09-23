import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="border-x w-full min-h-screen relative">{children}</div>
  );
}
