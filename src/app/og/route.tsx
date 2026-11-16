import { ImageResponse } from "next/og";

export const runtime = "nodejs";
// The card never changes between requests, so build it once at deploy time.
export const dynamic = "force-static";

const WIDTH = 1200;
const HEIGHT = 630;

/** Branded share card used when a public page is posted to social media or chat apps. */
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "linear-gradient(135deg, #1d2638 0%, #2b3a5c 55%, #5B3A29 100%)",
          color: "#FBF7F0",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Ulô</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>Don’t just visit Africa.</div>
          <div style={{ fontSize: 76, fontWeight: 300, lineHeight: 1.1, letterSpacing: -2 }}>Experience it.</div>
        </div>
        <div style={{ fontSize: 30, color: "rgba(251,247,240,0.8)" }}>Soulful stays and trusted local experiences across Africa</div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT },
  );
}
