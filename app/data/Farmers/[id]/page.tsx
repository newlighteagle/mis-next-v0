import { notFound } from "next/navigation";
import { query } from "@/lib/db";

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
        <p className="text-sm text-muted-foreground">ID: {farmer.id}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Name</div>
          <div className="text-base">{farmer.name}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Farmer ID</div>
          <div className="text-base">{farmer.farmer_id_external ?? "-"}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">ICS</div>
          <div className="text-base">{farmer.ics ?? "-"}</div>
        </div>
        <div className="rounded-md border p-4">
          <div className="text-sm text-muted-foreground">Status</div>
          <div className="text-base">{farmer.status ?? "-"}</div>
        </div>
      </div>
    </div>
  );
}
