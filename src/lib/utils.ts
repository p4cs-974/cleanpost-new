import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SUPPORTED_FORMATS } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function isFileSupported(file: File): boolean {
  return (
    SUPPORTED_FORMATS.includes(file.type) ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatExposureTime(value: number | undefined): string {
  if (!value) return "-";
  if (value >= 1) return `${value}s`;
  return `1/${Math.round(1 / value)}s`;
}

export function formatAperture(value: number | undefined): string {
  if (!value) return "-";
  return `f/${value.toFixed(1)}`;
}

export function formatFocalLength(value: number | undefined): string {
  if (!value) return "-";
  return `${value}mm`;
}

export function formatIso(value: number | undefined): string {
  if (!value) return "-";
  return `ISO ${value}`;
}

export function formatDate(date: Date | undefined): string {
  if (!date) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGpsCoord(lat: number | undefined, lng: number | undefined): string {
  if (lat === undefined || lng === undefined) return "-";
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
}

export function formatShutterSpeed(value: number | undefined): string {
  if (!value) return "-";
  return formatExposureTime(1 / Math.pow(2, value));
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const dataUrl = base64.includes(",") ? base64 : `data:image/jpeg;base64,${base64}`;
  const base64Data = dataUrl.split(",")[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function uint8ArrayToBase64(bytes: Uint8Array, mimeType: string = "image/jpeg"): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `data:${mimeType};base64,${btoa(binary)}`;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export async function shareFile(file: File): Promise<boolean> {
  if (!navigator.share) return false;

  try {
    await navigator.share({
      files: [file],
      title: "Cleaned image",
    });
    return true;
  } catch {
    return false;
  }
}

export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = `cleaned_${file.name}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
