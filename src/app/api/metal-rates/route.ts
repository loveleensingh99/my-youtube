import { NextResponse } from "next/server";
import { fetchIbjaRates } from "@/lib/ibja";

export const revalidate = 3600;

export async function GET() {
  try {
    const rates = await fetchIbjaRates();
    return NextResponse.json(rates, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load metal rates";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
