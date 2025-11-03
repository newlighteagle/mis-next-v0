import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FarmerDetailClient from "@/components/Farmers/FarmerDetailClient";

type Params = { params: Promise<{ id: string }> };

export default async function FarmerDetailPage({ params }: Params) {
  const { id } = await params;
  const { rows } = await query<{
    id: string;
    name: string;
    farmer_id_external: string | null;
    ics: string | null;
    status: string | null;
  }>(
    `select id, name, farmer_id_external, ics, status from tbl_farmers where id = $1 limit 1`,
    [id]
  );
  const farmer = rows[0];
  if (!farmer) return notFound();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Farmer Detail</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/data/Farmers"
            className="inline-flex items-center gap-1 rounded-md border px-2 py-1 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <span>ID: {farmer.id}</span>
          <div className="ml-auto" />
        </div>
      </div>
      <FarmerDetailClient farmer={farmer} />
    </div>
  );
}
