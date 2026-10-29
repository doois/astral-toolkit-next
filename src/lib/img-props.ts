import type { CSSProperties } from "react";
import type { ImageAttrs } from "./astral";

/** imageAttrs() speaks HTML; React wants srcSet, fetchPriority and a style object. */
export function reactImageProps(attrs: Partial<ImageAttrs> & Record<string, unknown>) {
  const { srcset, fetchpriority, style, ...rest } = attrs;
  const css: CSSProperties | undefined = style ? Object.fromEntries(style.split(";").filter(Boolean).map((rule) => {
    const [key = "", value = ""] = rule.split(":");
    return [key.trim().replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()), value.trim()];
  })) : undefined;
  return { ...rest, ...(srcset ? { srcSet: srcset } : {}), ...(fetchpriority ? { fetchPriority: fetchpriority } : {}), ...(css ? { style: css } : {}) };
}

