export interface ExifData {
  latitude?: number;
  longitude?: number;
  Make?: string;
  Model?: string;
  Software?: string;
  DateTimeOriginal?: Date;
  CreateDate?: Date;
  ModifyDate?: Date;
  ISO?: number;
  FNumber?: number;
  ExposureTime?: number;
  ShutterSpeedValue?: number;
  FocalLength?: number;
  FocalLengthIn35mmFormat?: number;
  LensModel?: string;
  Orientation?: number;
  ImageWidth?: number;
  ImageHeight?: number;
  XResolution?: number;
  YResolution?: number;
  ColorSpace?: number;
  Flash?: number;
  WhiteBalance?: number;
  GPSAltitude?: number;
  GPSImgDirection?: number;
  Copyright?: string;
  Artist?: string;
}

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  exif?: ExifData;
  isLoading: boolean;
  error?: string;
  hasGps: boolean;
  cleaned?: boolean;
  cleanedFile?: File;
}

export type MetadataCategory = "gps" | "camera" | "datetime" | "all";

export interface MetadataSelection {
  gps: boolean;
  camera: boolean;
  datetime: boolean;
  all: boolean;
}

export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const SUPPORTED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
