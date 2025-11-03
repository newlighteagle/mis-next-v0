"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Farmer = {
  id: string;
  name: string;
  farmer_id_external: string | null;
  ics: string | null;
  status: string | null;
};

export default function FarmersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Farmer[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const qs = useMemo(() => {
    const sp = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (q.trim()) sp.set("q", q.trim());
    return sp.toString();
  }, [q, page, pageSize]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/farmers?${qs}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch farmers");
        const data = await res.json();
        if (cancelled) return;
        setRows(data.data ?? []);
        setTotal(data.total ?? 0);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [qs]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Farmers</h1>
        <p className="text-sm text-muted-foreground">
          Data Management / Farmers
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search name, farmer ID, ICS, status"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Action</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Farmer ID</TableHead>
              <TableHead>ICS</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} className="text-red-600">
                  {error}
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link
                      href={`/data/Farmers/${r.id}`}
                      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted"
                      aria-label="View"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.farmer_id_external ?? "-"}</TableCell>
                  <TableCell>{r.ics ?? "-"}</TableCell>
                  <TableCell>
                    {r.status ? (
                      <Badge
                        variant={
                          r.status.toLowerCase() === "registered"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {r.status}
                      </Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • Total {total}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
