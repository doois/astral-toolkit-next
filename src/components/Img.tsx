// A CMS image: WebP srcset at the project's widths, intrinsic width and height
// (no layout shift), lazy by default. The first image of a page is eager with
// fetchpriority="high"; the count lives in the request scope, so blocks need no
// coordination. Pass `priority` to decide by hand. next/image is not needed: the
// CMS already serves the sized variants.
import { imageAttrs, type Media } from "@/lib/astral";
import { reactImageProps } from "@/lib/img-props";
import { scope } from "@/lib/scope";

type Props = { media: Media | null | undefined; sizes?: string; priority?: boolean; alt?: string; className?: string };

export function Img({ media, sizes, priority, alt, className }: Props) {
  if (!media) return null;
  const state = scope();
  const first = priority ?? state.images === 0;
  state.images += 1;
  const attrs = imageAttrs(media, { sizes, priority: first, ...(alt !== undefined ? { alt } : {}) });
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...reactImageProps(attrs)} className={className} />;
}
