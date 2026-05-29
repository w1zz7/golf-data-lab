"use client";

/**
 * WillBB Markets Terminal - boot sequence.
 *
 * Plays for ~2.4s when the terminal first opens, then fades into the
 * live dashboard. Lines stream in like a Bloomberg cold start: cyan
 * accent, monospace, progress bar, and a final "READY" handshake.
 *
 * Pure presentation - no data fetching, no side-effects beyond a single
 * setInterval that drives the line cadence and a setTimeout that fires
 * `onComplete` when the sequence ends.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const COLORS = {
  bg: "#0a0d12",
  panel: "#151518",
  border: "#46464F",
  text: "#FFFFFF",
  textDim: "#9793b0",
  textFaint: "#8A8A90",
  brand: "#33BBFF",
  brandSoft: "rgba(51,187,255,0.08)",
  up: "#5dd39e",
  err: "#f0686a",
} as const;

const FONT_MONO = "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";
const FONT_UI =
  "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif";

interface Line {
  prefix: string;
  text: string;
  status?: "ok" | "info" | "warn";
  delayMs: number;
}

/**
 * Tight ~2.4-second boot script. The page-level boot (LandingShell ➜
 * BIOS POST ➜ Win98 splash ➜ bio playback) is the cinematic intro;
 * this terminal-level boot is just the "app starting" beat — short
 * enough to feel like flavor instead of a wait.
 *
 * Earlier versions ran ~7 s here, but layered on top of the 10+ s
 * landing boot it added up to ~17 s before users could actually
 * interact with the dashboard. Cut to 12 lines paced 0–2200 ms.
 *
 * Users can click or press any key to skip — see the keydown handler.
 * On subsequent terminal opens within the same session we skip this
 * boot entirely (see willbbBooted sessionStorage flag in OpenBB.tsx).
 */
const LINES: Line[] = [
  { prefix: ">", text: "WillBB Markets Terminal · v1.0 · build 2026.05", status: "info", delayMs: 0 },
  { prefix: ">", text: "boot · config loaded · 4-tier feed failover engaged", status: "ok", delayMs: 200 },
  { prefix: ">", text: "feed · Yahoo · CoinGecko · Stooq · Alpha Vantage", status: "ok", delayMs: 380 },
  { prefix: ">", text: "watchlist · 40 curated · indices · futures · crypto", status: "ok", delayMs: 580 },
  { prefix: ">", text: "cache · in-flight dedup + SWR · 30 s batch TTL", status: "ok", delayMs: 780 },
  { prefix: ">", text: "engine · TradingView + QuantChart canvas (60 fps)", status: "ok", delayMs: 980 },
  { prefix: ">", text: "indicators · sma · ema · rsi · macd · bb · adx · atr · ichimoku", status: "ok", delayMs: 1180 },
  { prefix: ">", text: "stats · PSR · DSR · HAC · bootstrap · reality check", status: "ok", delayMs: 1380 },
  { prefix: ">", text: "regression · Carhart 4-factor · Newey-West HAC", status: "ok", delayMs: 1580 },
  { prefix: ">", text: "backtester · walk-forward · ADV slippage · borrow rate", status: "ok", delayMs: 1780 },
  { prefix: ">", text: "research · 12 modules · discovery · scanner · blotter", status: "ok", delayMs: 1980 },
  { prefix: ">", text: "ALL SYSTEMS GO · welcome back, Will", status: "ok", delayMs: 2200 },
];

const TOTAL_MS = LINES[LINES.length - 1].delayMs + 400;

/**
 * @param dataReady  When false, the boot HOLDS at the end of the animation
 *                   ("synchronizing market data…") and only advances once the
 *                   dashboard's data has actually loaded — so the user never
 *                   lands on a half-populated terminal. Defaults to true so the
 *                   component still works standalone.
 * @param maxWaitMs  Hard ceiling: advance regardless after this long, so a
 *                   stalled feed can never trap the user on the boot screen.
 */
export default function BootScreen({
  onComplete,
  dataReady = true,
  maxWaitMs = 7000,
}: {
  onComplete: () => void;
  dataReady?: boolean;
  maxWaitMs?: number;
}) {
  const [visible, setVisible] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [fading, setFading] = useState<boolean>(false);
  const [animDone, setAnimDone] = useState<boolean>(false);
  const startedAt = useRef<number>(Date.now());
  const doneRef = useRef<boolean>(false);

  // Hold onComplete in a ref so `finish` can be a STABLE callback. The parent
  // (OpenBB) passes a fresh inline onComplete every render (it re-renders ~1Hz
  // for its clock); if `finish` depended on it, every timer/effect keyed on
  // `finish` — including the maxWait safety net — would reset each second and
  // never fire, trapping the user on the boot screen. The ref breaks that.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Idempotent finish: fade out, then hand off to the dashboard exactly once.
  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setFading(true);
    window.setTimeout(() => onCompleteRef.current(), 240);
  }, []);

  // Stream lines in on their delays.
  useEffect(() => {
    const timers = LINES.map((line, i) =>
      window.setTimeout(() => setVisible((v) => Math.max(v, i + 1)), line.delayMs)
    );
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Smooth progress bar. Caps at 94% until the data is actually ready, so the
  // bar visibly "waits" for the feed instead of hitting 100% on a dead app.
  useEffect(() => {
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      const timePct = Math.min(100, (elapsed / TOTAL_MS) * 100);
      setProgress(dataReady ? timePct : Math.min(94, timePct));
      if (elapsed >= TOTAL_MS && dataReady) window.clearInterval(id);
    }, 30);
    return () => window.clearInterval(id);
  }, [dataReady]);

  // Mark the scripted animation finished.
  useEffect(() => {
    const t = window.setTimeout(() => setAnimDone(true), TOTAL_MS - 200);
    return () => window.clearTimeout(t);
  }, []);

  // Advance only when BOTH the animation has finished AND data has loaded.
  useEffect(() => {
    if (animDone && dataReady) finish();
  }, [animDone, dataReady, finish]);

  // Safety net: never trap the user, even if the feed never resolves.
  useEffect(() => {
    const t = window.setTimeout(finish, maxWaitMs);
    return () => window.clearTimeout(t);
  }, [maxWaitMs, finish]);

  // Allow user to skip with any key (manual override — enters even if the
  // feed is still resolving; the dashboard panes have their own loaders).
  useEffect(() => {
    function skip() {
      setProgress(100);
      setVisible(LINES.length);
      finish();
    }
    window.addEventListener("keydown", skip, { once: true });
    return () => window.removeEventListener("keydown", skip);
  }, [finish]);

  const stamp = useMemo(() => {
    return new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }, []);

  return (
    <div
      onClick={() => {
        setProgress(100);
        setVisible(LINES.length);
        finish();
      }}
      className="absolute inset-0 z-30 flex flex-col cursor-pointer overflow-hidden"
      style={{
        background: COLORS.bg,
        opacity: fading ? 0 : 1,
        transition: "opacity 280ms ease-out",
      }}
    >
      {/* Scanline overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.012) 0px, rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)",
        }}
      />
      {/* Subtle radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Header */}
      <div
        className="px-[18px] py-[10px] flex items-center justify-between shrink-0"
        style={{ borderBottom: "1px solid " + COLORS.border, background: COLORS.panel }}
      >
        <div className="flex items-center gap-[12px]">
          <span
            aria-hidden
            className="inline-block"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: COLORS.brand,
              boxShadow: "0 0 12px " + COLORS.brand,
              animation: "willbb-pulse 1.4s ease-in-out infinite",
            }}
          />
          <span
            className="text-[14px] font-semibold tracking-[-0.01em]"
            style={{ color: COLORS.text, fontFamily: FONT_UI }}
          >
            WillBB
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.18em]"
            style={{ color: COLORS.textDim, fontFamily: FONT_UI }}
          >
            Markets Terminal · v1.0
          </span>
        </div>
        <div
          className="text-[11px] tabular-nums"
          style={{ color: COLORS.textFaint, fontFamily: FONT_MONO }}
        >
          {stamp}
        </div>
      </div>

      {/* ASCII brand */}
      <div className="px-[18px] pt-[14px] shrink-0" style={{ fontFamily: FONT_MONO }}>
        <pre
          className="leading-tight m-0 select-none"
          style={{
            color: COLORS.brand,
            fontSize: 11,
            textShadow: "0 0 8px rgba(51,187,255,0.5)",
            opacity: 0.92,
          }}
        >
{`
   __        ___ _ _ ____  ____    __  __            _        _
   \\ \\      / (_) | | __ )| __ )  |  \\/  | __ _ _ __| | _____| |_ ___
    \\ \\ /\\ / /| | | |  _ \\|  _ \\  | |\\/| |/ _\` | '__| |/ / _ \\ __/ __|
     \\ V  V / | | | | |_) | |_) | | |  | | (_| | |  |   <  __/ |_\\__ \\
      \\_/\\_/  |_|_|_|____/|____/  |_|  |_|\\__,_|_|  |_|\\_\\___|\\__|___/
                                                                          `}
        </pre>
      </div>

      {/* Streaming log */}
      <div
        className="flex-1 min-h-0 overflow-hidden px-[18px] pt-[6px]"
        style={{ fontFamily: FONT_MONO, fontSize: 12, lineHeight: "20px" }}
      >
        {LINES.slice(0, visible).map((line, i) => (
          <div
            key={i}
            className="flex items-baseline gap-[6px]"
            style={{
              color:
                line.status === "ok"
                  ? COLORS.up
                  : line.status === "warn"
                  ? COLORS.err
                  : COLORS.brand,
              opacity: 0,
              animation: "willbb-fade-in 220ms ease-out forwards",
            }}
          >
            <span style={{ color: COLORS.textFaint, opacity: 0.7 }}>
              [{String((line.delayMs / 1000).toFixed(2)).padStart(5, "0")}s]
            </span>
            <span style={{ color: COLORS.brand, opacity: 0.85 }}>{line.prefix}</span>
            <span style={{ color: COLORS.text }}>{line.text}</span>
          </div>
        ))}
        {/* Live cursor */}
        {visible < LINES.length && (
          <span
            aria-hidden
            className="inline-block ml-[6px]"
            style={{
              width: 9,
              height: 14,
              background: COLORS.brand,
              animation: "willbb-blink 0.7s steps(2) infinite",
              verticalAlign: "middle",
            }}
          />
        )}
      </div>

      {/* Progress bar */}
      <div
        className="px-[18px] pb-[18px] shrink-0"
        style={{ fontFamily: FONT_MONO, fontSize: 11 }}
      >
        <div className="flex items-baseline justify-between mb-[4px]">
          <span style={{ color: COLORS.textDim }}>
            {!dataReady
              ? "synchronizing market data…"
              : progress < 100
              ? "loading…"
              : "ready · click or press any key to continue"}
          </span>
          <span style={{ color: COLORS.brand }}>{Math.floor(progress)}%</span>
        </div>
        <div
          className="w-full"
          style={{
            height: 5,
            background: COLORS.panel,
            border: "1px solid " + COLORS.border,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, rgba(51,187,255,0.4) 0%, " +
                COLORS.brand +
                " 100%)",
              transition: "width 60ms linear",
              boxShadow: "0 0 8px " + COLORS.brand,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes willbb-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.6; }
        }
        @keyframes willbb-fade-in {
          from { opacity: 0; transform: translateX(-4px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes willbb-blink {
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
