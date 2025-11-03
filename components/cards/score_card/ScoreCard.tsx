"use client";

import {
  Building2,
  User,
  GraduationCap,
  Award,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const attrList = {
  ics: {
    title: "ICS",
    icon: Building2,
    color: "text-green-500",
  },
  farmers: {
    title: "Farmers",
    icon: User,
    color: "text-emerald-500",
  },
  trained: {
    title: "Trained Farmers",
    icon: GraduationCap,
    color: "text-amber-500",
  },
  certified: {
    title: "Certified Farmers",
    icon: Award,
    color: "text-sky-500",
  },
} as const;

type ScoreCardProps = {
  type: keyof typeof attrList;
  value?: number;
  trendText?: string;
  footerText?: string;
};

export default function ScoreCard({
  type,
  value = 0,
  trendText = "Trending up this month",
  footerText = "Data updated in the last 6 months",
}: ScoreCardProps) {
  const attr = attrList[type];
  const Icon = attr.icon;
  const formattedValue = new Intl.NumberFormat(undefined).format(value);

  return (
    <Card className="flex flex-row items-center gap-6 p-6 hover:bg-muted/30 transition-colors duration-300 rounded-xl shadow-sm">
      {/* 🏢 ICON BESAR DI KIRI */}
      <Icon className={`size-16 ${attr.color} flex-shrink-0`} />

      {/* 📊 KONTEN DI KANAN */}
      <div className="flex flex-col justify-center">
        <p className="text-sm text-muted-foreground">{attr.title}</p>
        <h2 className="text-3xl font-semibold tabular-nums">
          {formattedValue}
        </h2>

        <div className="flex items-center gap-1 font-medium text-sm mt-1 text-muted-foreground">
          <span>{trendText}</span>
          <TrendingUp className="size-4" />
        </div>

        <p className="text-xs text-muted-foreground mt-1">{footerText}</p>
      </div>
    </Card>
  );
}
