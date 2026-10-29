// Inline stroke icons for the "feature" component (the select in astral.model.json).
const PATHS: Record<string, string> = {
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8",
  layers: "M12 3 2.5 8 12 13l9.5-5L12 3ZM2.5 12 12 17l9.5-5M2.5 16 12 21l9.5-5",
  compass: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  shield: "M12 3 4 6v6c0 4.5 3.4 7.9 8 9 4.6-1.1 8-4.5 8-9V6l-8-3ZM9 12l2 2 4-4",
  chart: "M4 20V10M10 20V4M16 20v-8M22 20H2",
  heart: "M12 20.5 4.3 12.8a4.5 4.5 0 0 1 6.4-6.4L12 7.7l1.3-1.3a4.5 4.5 0 0 1 6.4 6.4L12 20.5Z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9S14.5 18.3 12 21c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3Z",
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
};

export function Icon({ name, className = "feature__icon" }: { name: string | null | undefined; className?: string }) {
  const d = PATHS[name ?? ""] ?? PATHS.spark;
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d}></path>
    </svg>
  );
}
