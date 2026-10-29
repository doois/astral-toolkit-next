import { cache } from "react";

// Per-request state of one render (React `cache` is scoped to a request, and to
// one render at build time): how many CMS images the page rendered so far. The
// first one is the eager, high-priority one (src/components/Img.tsx).
//
// The render mode is NOT kept here: Next prerenders a page in more than one pass
// and a value set by the page is not guaranteed to be seen by every pass, so the
// mode travels as a prop (Head.mode, BlockProps.mode) into every cached read.
export type Scope = { images: number };

export const scope = cache((): Scope => ({ images: 0 }));
