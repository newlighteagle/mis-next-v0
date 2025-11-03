import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type FarmerRow = {
  id: string;
  name: string;
  farmer_id_external: string | null;
  ics: string | null;
  status: string | null;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") || "10", 10))
  );
  const q = (searchParams.get("q") || "").trim();
  const sortBy = (searchParams.get("sortBy") || "name").toLowerCase();
  const sortDir =
    (searchParams.get("sortDir") || "asc").toLowerCase() === "desc"
      ? "desc"
      : "asc";

  const validSort = new Set(["id", "name", "ics", "status"]);
  const sortColumn = validSort.has(sortBy) ? sortBy : "name";

  const offset = (page - 1) * pageSize;

  // Build WHERE clause for search
  const whereParts: string[] = [];
  const params: any[] = [];
  if (q) {
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    whereParts.push(
      "(name ILIKE $1 OR farmer_id_external ILIKE $2 OR ics ILIKE $3 OR status ILIKE $4)"
    );
  }
  const whereSql = whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : "";

  try {
    const dataSql = `
      SELECT id, name, farmer_id_external, ics, status
      FROM tbl_farmers
      ${whereSql}
      ORDER BY ${sortColumn} ${sortDir}
      LIMIT ${pageSize} OFFSET ${offset}
    `;
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM tbl_farmers
      ${whereSql}
    `;

    const [dataRes, countRes] = await Promise.all([
      query<FarmerRow>(dataSql, params),
      query<{ total: number }>(countSql, params),
    ]);

    const rows = dataRes.rows;
    const total = (countRes.rows[0] && (countRes.rows[0] as any).total) || 0;

    return NextResponse.json({ data: rows, page, pageSize, total });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch farmers" },
      { status: 500 }
    );
  }
}
