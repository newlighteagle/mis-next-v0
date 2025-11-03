"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

type Farmer = {
  id: string;
  name: string;
  farmer_id_external: string | null;
  ics: string | null;
  status: string | null;
};

type EdgeCoords = Record<string, string>;

type Props = {
  farmer: Farmer;
  mapImage?: string;
  mapCoords?: EdgeCoords;
};

export default function ExportFarmerProfile({
  farmer,
  mapImage,
  mapCoords,
}: Props) {
  const targetRef = useRef<HTMLDivElement | null>(null);

  function drawLabel(
    pdf: jsPDF,
    text: string,
    x: number,
    y: number,
    align: "left" | "center" | "right" = "left"
  ) {
    const paddingX = 1.5; // mm
    const paddingY = 1; // mm
    const textWidth = pdf.getTextWidth(text);
    let drawX = x;
    if (align === "center") drawX = x - textWidth / 2;
    if (align === "right") drawX = x - textWidth;
    // background box
    pdf.setFillColor(255, 255, 255);
    pdf.rect(
      drawX - paddingX,
      y - 3 - paddingY,
      textWidth + paddingX * 2,
      4 + paddingY * 2,
      "F"
    );
    // text
    pdf.setTextColor(0, 0, 0);
    pdf.text(text, x, y, { align });
  }

  async function handleExport() {
    if (!targetRef.current) return;
    try {
      if (mapImage) {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(16);
        pdf.text("Farmer Profile", 14, 18);
        pdf.setFontSize(11);
        pdf.text(`Name: ${farmer.name}`, 14, 26);
        pdf.text(`ICS: ${farmer.ics ?? "-"}`, 14, 32);
        pdf.text(`Farmer ID: ${farmer.farmer_id_external ?? "-"}`, 14, 38);
        pdf.text(`Status: ${farmer.status ?? "-"}`, 14, 44);

        const marginTop = 50;
        const maxW = pageWidth - 20;
        const maxH = pageHeight - marginTop - 20;

        const img = new Image();
        img.src = mapImage;
        await new Promise((resolve) => (img.onload = resolve));
        const iw = img.width || 800;
        const ih = img.height || 600;
        const scale = Math.min(maxW / iw, maxH / ih);
        const w = iw * scale;
        const h = ih * scale;
        const x = 10;
        const y = marginTop;

        pdf.addImage(mapImage, "PNG", x, y, w, h, undefined, "FAST");

        if (mapCoords) {
          pdf.setFontSize(9);
          // Top
          if (mapCoords.TL) drawLabel(pdf, mapCoords.TL, x + 2, y + 5, "left");
          if (mapCoords.TC)
            drawLabel(pdf, mapCoords.TC, x + w / 2, y + 5, "center");
          if (mapCoords.TR)
            drawLabel(pdf, mapCoords.TR, x + w - 2, y + 5, "right");
          // Right center
          if (mapCoords.RC)
            drawLabel(pdf, mapCoords.RC, x + w - 2, y + h / 2, "right");
          // Bottom
          if (mapCoords.BL)
            drawLabel(pdf, mapCoords.BL, x + 2, y + h - 3, "left");
          if (mapCoords.BC)
            drawLabel(pdf, mapCoords.BC, x + w / 2, y + h - 3, "center");
          if (mapCoords.BR)
            drawLabel(pdf, mapCoords.BR, x + w - 2, y + h - 3, "right");
          // Left center
          if (mapCoords.LC)
            drawLabel(pdf, mapCoords.LC, x + 2, y + h / 2, "left");
        }

        pdf.save(`farmer_${farmer.id}.pdf`);
        return;
      }

      const canvas = await html2canvas(targetRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        foreignObjectRendering: true,
        ignoreElements: (el) => el.tagName === "STYLE" || el.tagName === "LINK",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.setFontSize(16);
      pdf.text("Farmer Profile", 14, 18);
      pdf.setFontSize(11);
      pdf.text(`Name: ${farmer.name}`, 14, 26);
      pdf.text(`ICS: ${farmer.ics ?? "-"}`, 14, 32);
      pdf.text(`Farmer ID: ${farmer.farmer_id_external ?? "-"}`, 14, 38);
      pdf.text(`Status: ${farmer.status ?? "-"}`, 14, 44);

      const marginTop = 50;
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const boundedHeight = Math.min(imgHeight, pageHeight - marginTop - 10);
      pdf.addImage(
        imgData,
        "PNG",
        10,
        marginTop,
        imgWidth,
        boundedHeight,
        undefined,
        "FAST"
      );

      pdf.save(`farmer_${farmer.id}.pdf`);
    } catch (e) {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      pdf.setFontSize(16);
      pdf.text("Farmer Profile", 14, 18);
      pdf.setFontSize(11);
      pdf.text(`Name: ${farmer.name}`, 14, 26);
      pdf.text(`ICS: ${farmer.ics ?? "-"}`, 14, 32);
      pdf.text(`Farmer ID: ${farmer.farmer_id_external ?? "-"}`, 14, 38);
      pdf.text(`Status: ${farmer.status ?? "-"}`, 14, 44);
      pdf.text("(Map/image snapshot unavailable)", 14, 60);
      pdf.save(`farmer_${farmer.id}.pdf`);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleExport} size="sm" variant="outline">
        Export PDF
      </Button>
      <div ref={targetRef} className="hidden">
        <div
          style={{
            width: 800,
            padding: 16,
            background: "#ffffff",
            color: "#111827",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            {farmer.name}
          </div>
          <div style={{ fontSize: 12, marginBottom: 12 }}>
            ICS: {farmer.ics ?? "-"} • Farmer ID:{" "}
            {farmer.farmer_id_external ?? "-"} • Status: {farmer.status ?? "-"}
          </div>
          <div
            id="map-print-slot"
            style={{ height: 384, width: "100%", background: "#e5e7eb" }}
          />
        </div>
      </div>
    </div>
  );
}
