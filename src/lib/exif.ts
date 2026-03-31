import exifr from "exifr";
import piexif from "piexifjs";
import type { ExifData, ImageFile } from "./types";
import { fileToBase64, dataUrlToBlob } from "./utils";

export async function parseExif(file: File): Promise<ExifData | undefined> {
  try {
    const exif = await exifr.parse(file, {
      tiff: true,
      xmp: false,
      iptc: false,
      jfif: false,
      ihdr: true,
      icc: false,
      reviveValues: true,
      sanitize: true,
      translateKeys: true,
    });

    if (!exif) return undefined;

    return {
      latitude: exif.latitude,
      longitude: exif.longitude,
      Make: exif.Make,
      Model: exif.Model,
      Software: exif.Software,
      DateTimeOriginal: exif.DateTimeOriginal,
      CreateDate: exif.CreateDate,
      ModifyDate: exif.ModifyDate,
      ISO: exif.ISO,
      FNumber: exif.FNumber,
      ExposureTime: exif.ExposureTime,
      ShutterSpeedValue: exif.ShutterSpeedValue,
      FocalLength: exif.FocalLength,
      FocalLengthIn35mmFormat: exif.FocalLengthIn35mmFilm,
      LensModel: exif.LensModel,
      Orientation: exif.Orientation,
      ImageWidth: exif.ImageWidth || exif.ExifImageWidth,
      ImageHeight: exif.ImageHeight || exif.ExifImageHeight,
      XResolution: exif.XResolution,
      YResolution: exif.YResolution,
      ColorSpace: exif.ColorSpace,
      Flash: exif.Flash,
      WhiteBalance: exif.WhiteBalance,
      GPSAltitude: exif.GPSAltitude,
      GPSImgDirection: exif.GPSImgDirection,
      Copyright: exif.Copyright,
      Artist: exif.Artist,
    };
  } catch (error) {
    console.error("Error parsing EXIF:", error);
    return undefined;
  }
}

export function hasGpsData(exif: ExifData | undefined): boolean {
  return exif?.latitude !== undefined && exif?.longitude !== undefined;
}

export async function removeExif(
  file: File,
  options: {
    removeGps?: boolean;
    removeCamera?: boolean;
    removeDateTime?: boolean;
    removeAll?: boolean;
  },
): Promise<File> {
  if (!file.type.includes("jpeg") && !file.type.includes("jpg")) {
    return file;
  }

  try {
    const base64 = await fileToBase64(file);

    if (options.removeAll) {
      const cleaned = piexif.remove(base64);
      const blob = dataUrlToBlob(cleaned);
      return new File([blob], file.name, { type: file.type });
    }

    const exifObj = piexif.load(base64);

    if (options.removeGps) {
      delete exifObj["0th"][piexif.ImageIFD.GPSInfo];
      exifObj["GPS"] = {};
    }

    if (options.removeCamera) {
      delete exifObj["0th"][piexif.ImageIFD.Make];
      delete exifObj["0th"][piexif.ImageIFD.Model];
      delete exifObj["0th"][piexif.ImageIFD.Software];
      delete exifObj["Exif"][piexif.ExifIFD.LensModel];
      delete exifObj["Exif"][piexif.ExifIFD.LensSpecification];
      delete exifObj["Exif"][piexif.ExifIFD.FocalLength];
      delete exifObj["Exif"][piexif.ExifIFD.FocalLengthIn35mmFilm];
      delete exifObj["Exif"][piexif.ExifIFD.ISO];
      delete exifObj["Exif"][piexif.ExifIFD.FNumber];
      delete exifObj["Exif"][piexif.ExifIFD.ExposureTime];
      delete exifObj["Exif"][piexif.ExifIFD.ShutterSpeedValue];
      delete exifObj["Exif"][piexif.ExifIFD.ApertureValue];
    }

    if (options.removeDateTime) {
      delete exifObj["0th"][piexif.ImageIFD.DateTime];
      delete exifObj["Exif"][piexif.ExifIFD.DateTimeOriginal];
      delete exifObj["Exif"][piexif.ExifIFD.DateTimeDigitized];
      delete exifObj["GPS"][piexif.GPSIFD.GPSDateStamp];
      delete exifObj["GPS"][piexif.GPSIFD.GPSTimeStamp];
    }

    const exifStr = piexif.dump(exifObj);
    const cleaned = piexif.insert(exifStr, base64);
    const blob = dataUrlToBlob(cleaned);

    return new File([blob], file.name, { type: file.type });
  } catch (error) {
    console.error("Error removing EXIF:", error);
    return file;
  }
}

export async function loadImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function processImage(file: File): Promise<Partial<ImageFile>> {
  const [preview, exif] = await Promise.all([loadImagePreview(file), parseExif(file)]);

  return {
    preview,
    exif,
    hasGps: hasGpsData(exif),
    isLoading: false,
  };
}
