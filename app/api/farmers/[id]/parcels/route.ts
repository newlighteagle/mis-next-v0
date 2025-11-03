import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type Row = {
  polygon: string | null;
  point: string | null;
};

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const sql = `
      SELECT
        ST_AsGeoJSON(geom) AS polygon,
        ST_AsGeoJSON(centroid) AS point
      FROM public.tbl_parcel_polygon
      WHERE farmer_id = $1 AND geom IS NOT NULL
    `;
    const { rows } = await query<Row>(sql, [id]);

    const features: any[] = [];
    for (const r of rows) {
      if (r.polygon) {
        features.push({
          type: "Feature",
          geometry: JSON.parse(r.polygon),
          properties: { kind: "polygon" },
        });
      }
      if (r.point) {
        features.push({
          type: "Feature",
          geometry: JSON.parse(r.point),
          properties: { kind: "centroid" },
        });
      }
    }

    const fc = { type: "FeatureCollection", features };
    return NextResponse.json(fc);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch parcels" },
      { status: 500 }
    );
  }
}
