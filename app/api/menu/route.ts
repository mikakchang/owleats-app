import { fetchRiceMenus } from "@/lib/rice-dining";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const result = await fetchRiceMenus();
  return Response.json(result, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" }
  });
}
