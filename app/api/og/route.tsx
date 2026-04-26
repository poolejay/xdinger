import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#18181B",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "#22C55E",
              borderRadius: "50%",
            }}
          />
          <span
            style={{
              fontSize: "32px",
              fontWeight: 800,
              color: "#FFFFFF",
              letterSpacing: "-1px",
            }}
          >
            HR INTELLIGENCE
          </span>
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "#A1A1AA",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          MLB Home Run &amp; Laser Prop Analytics
        </div>
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["xDinger™", "Zone Heat Maps", "Pitch Splits", "Laser Props"].map((feature) => (
            <div
              key={feature}
              style={{
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.25)",
                color: "#22C55E",
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px",
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
