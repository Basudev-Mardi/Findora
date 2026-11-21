"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Printer,
  QrCode,
} from "lucide-react";

const QR_PRESETS = [
  {
    id: "home",
    label: "Findora Portal (Home)",
    path: "/",
    subtitle: "Scan to browse campus lost & found items or submit a report.",
  },
  {
    id: "report-lost",
    label: "Report Lost Item",
    path: "/report/lost",
    subtitle: "Scan to report a misplaced belonging on campus in under a minute.",
  },
  {
    id: "report-found",
    label: "Report Found Item",
    path: "/report/found",
    subtitle: "Found something on campus? Scan to log it safely for its owner.",
  },
  {
    id: "found",
    label: "Browse Found Items",
    path: "/found",
    subtitle: "Scan to check recently found items turned in across campus.",
  },
  {
    id: "lost",
    label: "Browse Lost Items",
    path: "/lost",
    subtitle: "Scan to view items currently reported missing on campus.",
  },
] as const;

const subscribeNoop = () => () => {};

export function AdminQrShareView() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("home");
  const origin = useSyncExternalStore(
    subscribeNoop,
    () => window.location.origin,
    () => "https://findora-pi-lovat.vercel.app"
  );
  const [customUrl, setCustomUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const preset =
    QR_PRESETS.find((item) => item.id === selectedPresetId) ?? QR_PRESETS[0];

  const targetUrl =
    customUrl.trim() || `${origin.replace(/\/+$/, "")}${preset.path}`;

  useEffect(() => {
    let active = true;

    QRCode.toDataURL(targetUrl, {
      width: 512,
      margin: 2,
      color: {
        dark: "#142D3B",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl(null);
      });

    return () => {
      active = false;
    };
  }, [targetUrl]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  }

  function handleDownloadPng() {
    if (!qrDataUrl) return;

    const canvas = document.createElement("canvas");
    const width = 720;
    const height = 920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background card
    ctx.fillStyle = "#F7F8F5";
    ctx.fillRect(0, 0, width, height);

    // Top Navy brand header
    ctx.fillStyle = "#142D3B";
    ctx.fillRect(0, 0, width, 165);

    ctx.fillStyle = "#C9FD04";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("FINDORA · CAMPUS LOST & FOUND", width / 2, 62);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(preset.label, width / 2, 118);

    const qrImg = new window.Image();
    qrImg.onload = () => {
      // White QR frame
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(110, 210, 500, 500);
      ctx.drawImage(qrImg, 130, 230, 460, 460);

      // Footer instructions + URL
      ctx.fillStyle = "#142D3B";
      ctx.font = "bold 22px sans-serif";
      ctx.fillText("Scan with your phone camera", width / 2, 770);

      ctx.fillStyle = "#7B858B";
      ctx.font = "18px sans-serif";
      ctx.fillText(targetUrl, width / 2, 815);

      ctx.fillStyle = "#1F6B50";
      ctx.font = "bold 16px sans-serif";
      ctx.fillText(
        "One Campus. One Community. Every Belonging Matters.",
        width / 2,
        865
      );

      const link = document.createElement("a");
      link.download = `findora-qr-${preset.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    qrImg.src = qrDataUrl;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="print:hidden">
        <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
          Share Campus QR Code
        </h2>
        <p className="mt-1 text-sm text-[#7B858B]">
          Generate, download, or print scannable Findora QR posters for
          libraries, lecture halls, student unions, and campus bulletin boards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Controls */}
        <section className="space-y-5 rounded-2xl border border-[#E7EBE8] bg-white p-6 lg:col-span-6 print:hidden">
          <div>
            <h3 className="text-sm font-bold text-[#142D3B]">
              1. Choose Destination Page
            </h3>
            <div className="mt-3 space-y-2">
              {QR_PRESETS.map((item) => {
                const active = selectedPresetId === item.id && !customUrl.trim();
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(item.id);
                      setCustomUrl("");
                    }}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-[#1F6B50] bg-[#1F6B50]/[0.06] text-[#142D3B]"
                        : "border-[#E7EBE8] bg-[#F7F8F5] text-[#202B32] hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="font-mono text-[11px] text-[#7B858B]">
                        {item.path}
                      </p>
                    </div>
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-[#1F6B50]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#E7EBE8] pt-4">
            <label
              htmlFor="custom-qr-url"
              className="block text-xs font-bold text-[#142D3B]"
            >
              2. Or Enter Custom URL (Optional)
            </label>
            <input
              id="custom-qr-url"
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder={`${origin}${preset.path}`}
              className="mt-1.5 h-10 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-3.5 text-xs text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 border-t border-[#E7EBE8] pt-4">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={!qrDataUrl}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1F6B50] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-[#C9FD04]" />
              Download Poster PNG
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2.5 text-xs font-semibold text-[#142D3B] hover:bg-white"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#1F6B50]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Link
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2.5 text-xs font-semibold text-[#142D3B] hover:bg-white"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </section>

        {/* Right Printable Poster Preview */}
        <section className="lg:col-span-6">
          <div className="overflow-hidden rounded-3xl border border-[#E7EBE8] bg-white shadow-[0_12px_36px_rgba(20,45,59,0.08)]">
            <div className="bg-[#142D3B] px-6 py-6 text-center text-white">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C9FD04]">
                <QrCode className="h-3.5 w-3.5" />
                Findora Campus Lost &amp; Found
              </p>
              <h3 className="mt-2 text-xl font-bold">{preset.label}</h3>
              <p className="mt-1 text-xs text-white/75">{preset.subtitle}</p>
            </div>

            <div className="flex flex-col items-center px-6 py-8">
              <div className="rounded-2xl border border-[#E7EBE8] bg-white p-4 shadow-xs">
                {qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={qrDataUrl}
                    alt={`QR code for ${targetUrl}`}
                    className="h-60 w-60"
                  />
                ) : (
                  <div className="h-60 w-60 animate-pulse rounded-xl bg-[#F7F8F5]" />
                )}
              </div>

              <p className="mt-5 text-sm font-bold text-[#142D3B]">
                Scan with your phone camera
              </p>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 break-all text-center font-mono text-xs text-[#1F6B50] hover:underline"
              >
                {targetUrl}
                <ExternalLink className="h-3 w-3 shrink-0 print:hidden" />
              </a>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7B858B]">
                One Campus. One Community. Every Belonging Matters.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
