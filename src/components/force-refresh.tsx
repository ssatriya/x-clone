"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

export default function ForceRefresh() {
  const router = useRouter();

  React.useEffect(() => {
    router.refresh();
  }, []);
  return <></>;
}
