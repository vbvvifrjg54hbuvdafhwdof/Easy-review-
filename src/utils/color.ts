import { AppState, ColorPalette, CustomColor, Unit } from '../types';
import { UNIT_PALETTE } from './date';

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export function hexToSoftBg(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#F0F0F5";
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.14)`;
}

export function hexToDarkText(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const f = 0.68;
  return `rgb(${Math.round(rgb.r * f)}, ${Math.round(rgb.g * f)}, ${Math.round(rgb.b * f)})`;
}

export function colorFor(key: string | null | undefined, customColors: CustomColor[]): CustomColor {
  const found = (customColors || []).find((c) => c.key === key);
  return found || {
    key: key || "default",
    label: "標準",
    border: "#6495ED",
    bg: "#EAF0FE",
    text: "#3D5FBF"
  };
}

export function paletteFor(u: Unit, customColors: CustomColor[]): ColorPalette {
  if (u && u.colorKey) {
    return colorFor(u.colorKey, customColors);
  }
  const idx = typeof u.color === "number" ? u.color : 0;
  return UNIT_PALETTE[idx % UNIT_PALETTE.length];
}

export function createCustomColor(hex: string, customLabel?: string): CustomColor {
  let cleanHex = (hex || "#6495ED").toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(cleanHex)) cleanHex = "#6495ED";
  const key = `custom-${cleanHex.replace("#", "")}-${Date.now()}`;
  return {
    key,
    label: customLabel || cleanHex,
    border: cleanHex,
    bg: hexToSoftBg(cleanHex),
    text: hexToDarkText(cleanHex)
  };
}
