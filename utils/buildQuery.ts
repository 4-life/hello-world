import { ReadonlyURLSearchParams } from "next/navigation";

export function buildQuery(
  searchParams: ReadonlyURLSearchParams,
  newParams: Record<string, string>
) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  Object.entries(newParams).forEach(([key, value]) => {
    params.set(key, value);
  });

  return `?${params.toString()}`;
}
