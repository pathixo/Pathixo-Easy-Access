import QRCode from "qrcode";
import fs from "fs";
import path from "path";

const targetUrl =
  process.argv[2] ||
  "https://expo.pathixo.com/?utm_source=qr_booth&utm_medium=banner&utm_campaign=expo_mart_2026";

const outputDir = path.join(process.cwd(), "public", "assets", "qr");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateQRCodes() {
  console.log("\n========================================================");
  console.log("GENERATING PRINT-READY STALL QR CODES");
  console.log("========================================================");
  console.log(`Target URL: ${targetUrl}\n`);

  // 1. Scalable Vector Graphics (SVG) - Infinite Resolution for large roll-up banners
  const svgPath = path.join(outputDir, "pathixo-expo-qr.svg");
  const svgString = await QRCode.toString(targetUrl, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#09090b", // Obsidian black
      light: "#ffffff", // Pure white
    },
  });
  fs.writeFileSync(svgPath, svgString, "utf8");
  console.log(`✓ Generated Vector SVG: ${svgPath}`);

  // 2. High-Resolution 2000x2000px PNG (300 DPI ready for high-gloss print)
  const pngPath = path.join(outputDir, "pathixo-expo-qr.png");
  await QRCode.toFile(pngPath, targetUrl, {
    type: "png",
    width: 2000,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#09090b",
      light: "#ffffff",
    },
  });
  console.log(`✓ Generated 2000px High-DPI PNG: ${pngPath}`);

  // 3. Dark-Themed 2000px PNG (for dark booth banners and digital displays)
  const darkPngPath = path.join(outputDir, "pathixo-expo-qr-dark.png");
  await QRCode.toFile(darkPngPath, targetUrl, {
    type: "png",
    width: 2000,
    margin: 2,
    errorCorrectionLevel: "H",
    color: {
      dark: "#38bdf8", // Sky-400 / Pathixo cyan
      light: "#09090b", // Deep obsidian background
    },
  });
  console.log(`✓ Generated Dark-Theme 2000px PNG: ${darkPngPath}`);

  console.log("\nAll QR code assets generated successfully!");
}

generateQRCodes().catch((err) => {
  console.error("QR Generation failed:", err);
  process.exit(1);
});
