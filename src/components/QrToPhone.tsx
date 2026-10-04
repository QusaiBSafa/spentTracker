"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

// QR code for the current site's landing page, so a desktop visitor can open
// it on their phone. Built from window.location so it works on any domain.
export default function QrToPhone({ className = "" }: { className?: string }) {
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    QRCode.toString(window.location.origin + "/", {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#111827", light: "#ffffff" },
    }).then(setSvg);
  }, []);

  if (!svg) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 p-3 pr-4 shadow-sm backdrop-blur ${className}`}
    >
      <div
        role="img"
        aria-label="QR code that opens this page"
        className="h-20 w-20 shrink-0 rounded-lg bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="text-sm">
        <div className="font-semibold text-gray-900">Open on your phone</div>
        <div className="text-gray-500">Scan with your camera</div>
      </div>
    </div>
  );
}
