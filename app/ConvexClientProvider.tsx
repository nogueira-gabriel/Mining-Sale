"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const fallbackConvexUrl = "https://placeholder.convex.cloud";

if (!convexUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "NEXT_PUBLIC_CONVEX_URL não definido. Usando endpoint placeholder para permitir o build. Configure a variável no ambiente de deploy.",
  );
}

const convex = new ConvexReactClient(convexUrl ?? fallbackConvexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
