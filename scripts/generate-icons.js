// Generate PWA icons for RHONDA — pure SVG approach (no native dependencies)
const fs = require("fs");
const path = require("path");

const iconsDir = path.join(__dirname, "..", "public", "icons");

const GOLD = "#c49b2a";
const FOREST = "#2c3528";
const BG = "#f4f1ea";

function appIcon(size) {
  const r = Math.round(size * 0.18);
  const fs1 = Math.round(size * 0.52);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="${GOLD}"/>
  <text x="50%" y="55%" font-family="Georgia,Times,serif" font-size="${fs1}" font-weight="700" fill="${BG}" text-anchor="middle" dominant-baseline="central">R</text>
</svg>`;
}

function shortcutIcon(size, symbol, label) {
  // Use simple text symbols instead of emoji for compatibility
  const symSize = Math.round(size * 0.38);
  const lblSize = Math.round(size * 0.14);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="${FOREST}"/>
  <text x="50%" y="40%" font-family="Arial,sans-serif" font-size="${symSize}" font-weight="700" fill="${GOLD}" text-anchor="middle" dominant-baseline="central">${symbol}</text>
  <text x="50%" y="80%" font-family="Arial,sans-serif" font-size="${lblSize}" font-weight="600" fill="${GOLD}" text-anchor="middle" opacity="0.8">${label}</text>
</svg>`;
}

// App icons
fs.writeFileSync(path.join(iconsDir, "icon-192.svg"), appIcon(192));
fs.writeFileSync(path.join(iconsDir, "icon-512.svg"), appIcon(512));

// Shortcut icons — using simple characters, not emoji
fs.writeFileSync(path.join(iconsDir, "shortcut-incident.svg"), shortcutIcon(96, "!", "REPORT"));
fs.writeFileSync(path.join(iconsDir, "shortcut-scan.svg"), shortcutIcon(96, "[]", "SCAN"));
fs.writeFileSync(path.join(iconsDir, "shortcut-equipment.svg"), shortcutIcon(96, "#", "EQUIP"));
fs.writeFileSync(path.join(iconsDir, "shortcut-sop.svg"), shortcutIcon(96, "S", "SOP"));

console.log("All SVG icons generated in public/icons/");
