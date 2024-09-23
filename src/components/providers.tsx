"use client";

import { PropsWithChildren } from "react";
import { NextUIProvider } from "@nextui-org/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NextUIProvider disableRipple={true}>{children}</NextUIProvider>
    </QueryClientProvider>
  );
};

export default Providers;
