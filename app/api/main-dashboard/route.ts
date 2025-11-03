import { NextResponse } from "next/server";
import { query, type MainDashboardRow } from "@/lib/db";

type Stats = {
  icsCount: number;
  farmers: number;
  trained: number;
  certified: number;
};

function computeStats(rows: MainDashboardRow[]): Stats {
  const base = rows.reduce(
    (acc, r) => {
      acc.farmers += Number(r.farmers || 0);
      acc.trained += Number(r.trained || 0);
      acc.certified += Number(r.certified || 0);
      return acc;
    },
    { farmers: 0, trained: 0, certified: 0 }
  );
  return { icsCount: rows.length, ...base };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "All District";
  const ics = searchParams.get("ics") || "All ICS";

  try {
    // Native SQL – fetch all rows from main_dashboard
    const { rows } = await query<MainDashboardRow>(
      `select name, region, farmers, trained, certified from main_dashboard`
    );

    const regions = Array.from(
      new Set(["All District", ...rows.map((r) => r.region)])
    ).sort((a, b) => a.localeCompare(b));

    const icsOptions = (
      region === "All District" ? rows : rows.filter((r) => r.region === region)
    ).map((r) => r.name);

    let stats: Stats;
    if (ics && ics !== "All ICS") {
      const found = rows.find((r) => r.name === ics);
      if (found) {
        stats = {
          icsCount: 1,
          farmers: Number(found.farmers || 0),
          trained: Number(found.trained || 0),
          certified: Number(found.certified || 0),
        };
      } else {
        stats = { icsCount: 0, farmers: 0, trained: 0, certified: 0 };
      }
    } else {
      const filtered =
        region === "All District"
          ? rows
          : rows.filter((r) => r.region === region);
      stats = computeStats(filtered);
    }

    return NextResponse.json({ regions, icsOptions, stats });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
