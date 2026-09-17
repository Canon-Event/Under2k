import { ImageResponse } from "next/og";

export const alt = "SplitUPI — Smart UPI Split Payments";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fa", color: "#121417", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", width: 1030, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", width: 680 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}><div style={{ display: "flex", height: 76, width: 76, alignItems: "center", justifyContent: "center", borderRadius: 18, background: "#5235b5", color: "white", fontSize: 44, fontWeight: 800 }}>S</div><span style={{ fontSize: 42, fontWeight: 800 }}>SplitUPI</span></div>
          <div style={{ marginTop: 48, fontSize: 64, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2 }}>Smart UPI split payments</div>
          <div style={{ marginTop: 24, fontSize: 26, lineHeight: 1.4, color: "#59616e" }}>Create accurate payment splits, UPI links and ready-to-scan QR codes in seconds.</div>
        </div>
        <div style={{ display: "flex", height: 300, width: 260, flexDirection: "column", alignItems: "center", justifyContent: "center", border: "2px solid #e4e7ec", borderRadius: 24, background: "white" }}><div style={{ fontSize: 22, color: "#667085" }}>Bill amount</div><div style={{ marginTop: 16, fontSize: 50, fontWeight: 800 }}>₹5,650</div><div style={{ marginTop: 28, padding: "12px 20px", borderRadius: 12, background: "#f3f1ff", color: "#5235b5", fontSize: 20, fontWeight: 700 }}>3 payments</div></div>
      </div>
    </div>,
    size,
  );
}
