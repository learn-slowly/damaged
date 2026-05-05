import { ImageResponse } from "next/og";

export const alt = "damaged.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0805",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 48,
            top: 48,
            fontSize: 18,
            color: "#a8a8b2",
            fontFamily: "monospace",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          / damaged.kr
        </div>

        <div
          style={{
            fontSize: 240,
            fontWeight: 800,
            color: "#ffffff",
            lineHeight: 1,
            letterSpacing: "-0.02em",
            display: "flex",
          }}
        >
          <span>damaged</span>
          <span style={{ color: "#d4a16d" }}>.</span>
        </div>

        <div
          style={{
            fontSize: 40,
            color: "#d4a16d",
            marginTop: 32,
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: "-0.01em",
          }}
        >
          but alive.
        </div>
      </div>
    ),
    { ...size }
  );
}
