import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SplitUPI — Smart UPI Split Payments",
    short_name: "SplitUPI",
    description: "Generate split UPI payment links and QR codes locally in your browser.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F8FA",
    theme_color: "#5235B5",
    orientation: "portrait-primary",
    categories: ["finance", "business", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
