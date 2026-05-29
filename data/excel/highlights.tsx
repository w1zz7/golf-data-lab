import type { SheetData } from "@/lib/excel/types";

const H = "#c0c0c0";
const ACCENT = "#fff3b0"; // banner highlight
const MUTED = "#666666";

/**
 * The default-open sheet. Designed for the recruiter 6-second scan.
 * Row 1-3: identity + headline
 * Row 5-8: 4 banner wins with case-study deep links
 * Row 10-17: Hiring Info block (exactly what a recruiter's ATS needs)
 */
export const highlights: SheetData = {
  id: "highlights",
  title: "Highlights",
  columns: [
    { letter: "A", width: 200 },
    { letter: "B", width: 400 },
    { letter: "C", width: 180 },
  ],
  frozenRows: 1,
  rowHeight: 22,
  maxRow: 22,
  maxCol: 3,
  initialSelection: "A1",
  cells: {
    // Hero row
    A1: {
      value: "WILL ZHANG - student founder, shipper, operator",
      bold: true,
      bg: H,
      merged: { colspan: 3 },
      align: "left",
    },

    A2: {
      value:
        "Drexel B.S. Business Admin (Finance + MIS) · GPA 4.0 · Dean's List · Philadelphia, PA",
      italic: true,
      color: MUTED,
      merged: { colspan: 3 },
    },

    A3: {
      value:
        "Co-founded Bulletproof AI (75k+ tool runs/mo, 200k-resume ATS). 1st place Philly CodeFest 2026. Trades my own book - $315,020 processed, 63.98% gain ratio across 267 logged trades. Former competitive junior golfer (US + China tours).",
      merged: { colspan: 3 },
    },

    // Banner wins - 4 most impressive, with case study deep-links
    A5: { value: "🏆  Philly CodeFest 2026", bold: true, bg: ACCENT },
    B5: {
      value: "1st Place, Advanced Track - 370+ participants, $3,000 winner share",
      bg: ACCENT,
    },
    C5: {
      value: "case study →",
      onClick: { openApp: "philaision" },
      bg: ACCENT,
      color: "#0000ee",
    },

    A6: { value: "🧠  Bulletproof AI", bold: true, bg: ACCENT },
    B6: {
      value: "75k+ tool runs Month 1 · 11 live AI tools · 200k-resume ATS model",
      bg: ACCENT,
    },
    C6: {
      value: "case study →",
      onClick: { openApp: "bulletproof" },
      bg: ACCENT,
      color: "#0000ee",
    },

    A7: { value: "📈  Stock Portfolio", bold: true, bg: ACCENT },
    B7: {
      value: "$315,020 processed · 63.98% gain ratio · 267 logged trades · Excel-validated macro swing strategy",
      bg: ACCENT,
    },
    C7: {
      value: "details →",
      onClick: { openApp: "stock-portfolio" },
      bg: ACCENT,
      color: "#0000ee",
    },

    A8: { value: "⚙  CNIPA Utility Model Patent", bold: true, bg: ACCENT },
    B8: {
      value: "A Multi-Purpose Golf Bag · filed September 2024 · CNIPA 202422233493.5",
      bg: ACCENT,
    },
    C8: {
      value: "details →",
      onClick: { openApp: "patent" },
      bg: ACCENT,
      color: "#0000ee",
    },

    // Hiring Info block - exactly what an ATS form needs
    A10: {
      value: "HIRING INFO",
      bold: true,
      bg: H,
      merged: { colspan: 3 },
    },

    A11: { value: "Degree", bold: true },
    B11: {
      value: "B.S. Business Administration (Finance + MIS)",
      merged: { colspan: 2 },
    },

    A12: { value: "GPA · Honors", bold: true },
    B12: {
      value: "4.0 · Dean's List (December 2025 – present)",
      merged: { colspan: 2 },
    },

    A13: { value: "Graduation", bold: true },
    B13: { value: "June 2029", merged: { colspan: 2 } },

    A14: { value: "Location", bold: true },
    B14: { value: "Philadelphia, PA", merged: { colspan: 2 } },

    A15: { value: "Phone", bold: true },
    B15: {
      value: "(267) 255-1163",
      href: "tel:+12672551163",
      merged: { colspan: 2 },
    },

    A16: { value: "Email", bold: true },
    B16: {
      value: "wz363@drexel.edu",
      href: "mailto:wz363@drexel.edu",
    },
    C16: {
      value: "compose →",
      onClick: { openApp: "contact" },
    },

    A17: { value: "LinkedIn", bold: true },
    B17: {
      value: "linkedin.com/in/willzhang6200",
      href: "https://www.linkedin.com/in/willzhang6200",
    },
    C17: {
      value: "open →",
      onClick: {
        openApp: "ie",
        props: { url: "https://www.linkedin.com/in/willzhang6200" },
      },
    },

    // Footer
    A20: {
      value:
        "// Tip: click any → link to drill down · arrow keys select cells · select a range to see live Sum / Avg / Count below.",
      italic: true,
      color: MUTED,
      merged: { colspan: 3 },
    },
  },
};
