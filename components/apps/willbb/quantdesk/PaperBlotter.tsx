"use client";

/**
 * Session-scoped Paper Trading drawer. Every trade emitted by a Strategy Lab
 * backtest appends here, so the user can see every entry / exit the strategy
 * fired without leaving the chart. The drawer is collapsed by default and
 * toggles open from any sub-tab; running a fresh backtest does not reset it.
 */

import { COLORS, FONT_MONO, FONT_UI } from "../OpenBB";

export interface PaperTrade {
  id: number;
  symbol: string;
  side: "long" | "short";
  qty: number;
  entryT: number;
  entryPx: number;
  exitT: number | null;
  exitPx: number | null;
  pnl: number | null; // dollars (post-commission)
  status: "open" | "closed";
}

export default function PaperBlotter({
  trades,
  open,
  setOpen,
  onClear,
}: {
  trades: PaperTrade[];
  open: boolean;
  setOpen: (b: boolean) => void;
  onClear: () => void;
}) {
  const totalPnl = trades.reduce((a, t) => a + (t.pnl ?? 0), 0);
  const openCount = trades.filter((t) => t.status === "open").length;
  return (
    <div
      className="shrink-0"
      style={{
        background: COLORS.panel,
        borderTop: "1px solid " + COLORS.border,
        fontFamily: FONT_UI,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-[14px] py-[6px]"
        style={{
          background: COLORS.panelDeep,
          border: "none",
          borderTop: "1px solid " + COLORS.border,
          color: COLORS.textDim,
          fontSize: 11,
          fontFamily: FONT_MONO,
          letterSpacing: "0.06em",
          cursor: "pointer",
        }}
      >
        <span>
          {open ? "▾" : "▸"}{" "}
          <span style={{ color: COLORS.text }}>PAPER TRADING</span> ·{" "}
          {trades.length} trades · {openCount} open ·{" "}
          <span style={{ color: totalPnl >= 0 ? COLORS.up : COLORS.down }}>
            {totalPnl >= 0 ? "+" : ""}${totalPnl.toFixed(0)}
          </span>
        </span>
        {trades.length > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={{ color: COLORS.textFaint, fontSize: 10 }}
          >
            clear
          </span>
        )}
      </button>
      {open && (
        <div
          className="overflow-y-auto"
          style={{ maxHeight: 180, background: COLORS.bg }}
        >
          {trades.length === 0 ? (
            <div
              style={{
                padding: "14px 16px",
                fontSize: 12,
                color: COLORS.textDim,
                fontFamily: FONT_MONO,
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: COLORS.text, fontWeight: 600, marginBottom: 6, fontSize: 12, letterSpacing: "0.04em" }}>
                No paper trades yet.
              </div>
              <div>
                Open the <span style={{ color: COLORS.brand }}>Alpha Lab</span> sub-tab,
                pick a preset (or edit the code), and click{" "}
                <span style={{ color: COLORS.brand }}>▶ RUN BACKTEST</span>.
                Every entry and exit the strategy fires will append here as a
                paper trade with simulated P&amp;L.
              </div>
            </div>
          ) : (
            <>
              {/* Inline guide so a first-time visitor immediately understands
                  what this drawer is and how the rows are read. */}
              <div
                style={{
                  padding: "8px 14px",
                  fontSize: 10,
                  color: COLORS.textFaint,
                  fontFamily: FONT_MONO,
                  borderBottom: "1px solid " + COLORS.border,
                  lineHeight: 1.5,
                }}
              >
                Paper trades emitted by your Strategy Lab backtests.{" "}
                <span style={{ color: COLORS.up }}>LONG</span> = bought at entry, sold at exit ·{" "}
                <span style={{ color: COLORS.down }}>SHORT</span> = sold at entry, bought at exit ·{" "}
                P&amp;L is post-commission.
              </div>
            <table style={{ width: "100%", fontSize: 11, fontFamily: FONT_MONO }}>
              <thead>
                <tr style={{ color: COLORS.textFaint, borderBottom: "1px solid " + COLORS.border }}>
                  <Th>#</Th>
                  <Th>SYMBOL</Th>
                  <Th>SIDE</Th>
                  <Th align="right">QTY</Th>
                  <Th align="right">ENTRY</Th>
                  <Th align="right">EXIT</Th>
                  <Th align="right">P&amp;L</Th>
                  <Th>STATUS</Th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => (
                  <tr
                    key={t.id}
                    style={{ borderBottom: "1px solid " + COLORS.borderSoft }}
                  >
                    <Td>{t.id}</Td>
                    <Td>{t.symbol}</Td>
                    <Td color={t.side === "long" ? COLORS.up : COLORS.down}>{t.side.toUpperCase()}</Td>
                    <Td align="right">{t.qty.toFixed(0)}</Td>
                    <Td align="right">${t.entryPx.toFixed(2)}</Td>
                    <Td align="right">{t.exitPx != null ? `$${t.exitPx.toFixed(2)}` : "-"}</Td>
                    <Td
                      align="right"
                      color={(t.pnl ?? 0) >= 0 ? COLORS.up : COLORS.down}
                    >
                      {t.pnl != null ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(0)}` : "-"}
                    </Td>
                    <Td color={t.status === "open" ? COLORS.brand : COLORS.textDim}>
                      {t.status}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th
      style={{
        padding: "6px 12px",
        textAlign: align,
        fontWeight: 500,
        fontSize: 9,
        letterSpacing: "0.12em",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
  color,
}: {
  children: React.ReactNode;
  align?: "left" | "right";
  color?: string;
}) {
  return (
    <td
      style={{
        padding: "5px 12px",
        textAlign: align,
        color: color ?? COLORS.text,
      }}
    >
      {children}
    </td>
  );
}
