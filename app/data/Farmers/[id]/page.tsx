import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import FarmerParcelsMap from "@/components/Map/FarmerParcelsMap";

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
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kiri 1/3: Info Farmer */}
        <div className="md:col-span-1">
          <div className="rounded-md border p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                <Image
                  src="/assets/no-user.jpg"
                  alt="Farmer photo"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="text-base font-medium">{farmer.name}</div>
                <div className="text-xs text-muted-foreground">
                  {farmer.ics ?? "-"} | {farmer.farmer_id_external ?? "-"}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["registered", "mapped", "trained", "certified"] as const).map(
                (label) => (
                  <Badge key={label}>{label}</Badge>
                )
              )}
            </div>
          </div>

          <div className="rounded-md border p-4 h-64">
            <div className="mb-2 text-sm font-medium">Map</div>
            <div className="h-full w-full">
              <FarmerParcelsMap farmerId={farmer.id} />
            </div>
          </div>
        </div>

        {/* Kanan 2/3: Map, Training, Certification */}
        <div className="md:col-span-2 space-y-4">
          <div className="rounded-md border p-4">
            <div className="mb-2 text-sm font-medium">Training diikuti</div>
            <div className="text-sm text-muted-foreground">
              ⚠️ Under development
            </div>
          </div>
          <div className="rounded-md border p-4">
            <div className="mb-2 text-sm font-medium">Sertifikasi dimiliki</div>
            <div className="text-sm text-muted-foreground">
              ⚠️ Under development
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
