export interface MetalRates {
  gold24k10g: number;
  gold22k10g: number;
  silver1kg: number;
  session: "AM" | "PM";
  source: "IBJA";
  updatedAt: string;
}

const IBJA_PAGE_URL = "https://ibjarates.com/";

function parseSpan(html: string, id: string): number | null {
  const match = html.match(
    new RegExp(`<span[^>]*\\bid=["']${id}["'][^>]*>([\\d,\\.\\s]*)</span>`, "i"),
  );
  if (!match?.[1]) return null;
  const cleaned = match[1].replace(/[,\s]/g, "").trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function pickSessionRate(
  html: string,
  baseId: string,
): { value: number; session: "AM" | "PM" } | null {
  const pm = parseSpan(html, `${baseId}_PM`);
  if (pm != null) return { value: pm, session: "PM" };
  const am = parseSpan(html, `${baseId}_AM`);
  if (am != null) return { value: am, session: "AM" };
  return null;
}

export function parseIbjaHtml(html: string): MetalRates {
  const gold24 = pickSessionRate(html, "lblGold999");
  const gold22 = pickSessionRate(html, "lblGold916");
  const silver = pickSessionRate(html, "lblSilver999");

  if (!gold24 || !gold22 || !silver) {
    throw new Error("Could not parse IBJA metal rates from page HTML");
  }

  return {
    gold24k10g: gold24.value,
    gold22k10g: gold22.value,
    silver1kg: silver.value,
    session: gold24.session,
    source: "IBJA",
    updatedAt: new Date().toISOString(),
  };
}

export async function fetchIbjaRates(): Promise<MetalRates> {
  const response = await fetch(IBJA_PAGE_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LumenMetalRates/1.0; +https://localhost)",
      Accept: "text/html",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`IBJA fetch failed with status ${response.status}`);
  }

  const html = await response.text();
  return parseIbjaHtml(html);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
