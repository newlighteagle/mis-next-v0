"use client";

import { useEffect, useMemo, useState } from "react";
import ScoreCard from "@/components/cards/score_card/ScoreCard";

export default function MainDashboardPage() {
  const [region, setRegion] = useState("All District");
  const [ics, setICS] = useState("All ICS");
  const [regions, setRegions] = useState<string[]>(["All District"]);
  const [icsOptions, setIcsOptions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    icsCount: 0,
    farmers: 0,
    trained: 0,
    certified: 0,
  });

  const qs = useMemo(
    () => new URLSearchParams({ region, ics }).toString(),
    [region, ics]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/main-dashboard?${qs}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load dashboard data");
        const data = await res.json();
        if (cancelled) return;
        setRegions(data.regions ?? ["All District"]);
        setIcsOptions(data.icsOptions ?? []);
        setStats(
          data.stats ?? { icsCount: 0, farmers: 0, trained: 0, certified: 0 }
        );
      } catch (_) {
        if (!cancelled) {
          setIcsOptions([]);
          setStats({ icsCount: 0, farmers: 0, trained: 0, certified: 0 });
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  return (
    <div className="space-y-6">
      {/* 🔽 Filter Section */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium block mb-1">Region</label>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setICS("All ICS");
            }}
            className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          >
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium block mb-1">ICS</label>
          <select
            value={ics}
            onChange={(e) => setICS(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          >
            <option>All ICS</option>
            {icsOptions.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 📊 Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
        <ScoreCard type="ics" value={stats.icsCount} />
        <ScoreCard type="farmers" value={stats.farmers} />
        <ScoreCard type="trained" value={stats.trained} />
        <ScoreCard type="certified" value={stats.certified} />
      </div>
    </div>
  );
}
