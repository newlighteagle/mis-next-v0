"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import FarmerParcelsMap from "@/components/Map/FarmerParcelsMap";
import ExportFarmerProfile from "@/components/Export/ExportFarmerProfile";

type Farmer = {
  id: string;
  name: string;
  farmer_id_external: string | null;
  ics: string | null;
  status: string | null;
};

type EdgeCoords = Record<string, string>;

export default function FarmerDetailClient({ farmer }: { farmer: Farmer }) {
  const [mapImage, setMapImage] = useState<string | undefined>(undefined);
  const [mapCoords, setMapCoords] = useState<EdgeCoords | undefined>(undefined);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Kiri 1/3: Info + Map */}
      <div className="md:col-span-1 space-y-4">
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
            <FarmerParcelsMap
              farmerId={farmer.id}
              onSnapshot={(p) => {
                setMapImage(p.dataUrl);
                setMapCoords(p.coords);
              }}
            />
          </div>
        </div>
      </div>

      {/* Kanan 2/3: Sections */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-end">
          <ExportFarmerProfile
            farmer={farmer}
            mapImage={mapImage}
            mapCoords={mapCoords}
          />
        </div>
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
  );
}
