"use client";

import { PropsWithChildren } from "react";
import { AppProgressBar } from "next-nprogress-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProgressBar
        height="4px"
        color="#1D9BF0"
        options={{ showSpinner: false }}
        shallowRouting
      />
      {children}
    </QueryClientProvider>
  );
};

export default Providers;
