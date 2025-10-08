"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CloudUpload, Loader2 } from "lucide-react";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileUploadProps {
  userToken: string;
  setImages: Dispatch<SetStateAction<string[]>>;
}

export default function FileUpload({ userToken, setImages }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    // Check if the file is a HEIC file by extension (MIME type is often empty for HEIC)
    const fileName = file.name.toLowerCase();
    const isHeic = fileName.endsWith(".heic") || fileName.endsWith(".heif");

    if (!isHeic) {
      return file;
    }

    try {
      console.log("Konverterer HEIC/HEIF-fil:", file.name);

      // Dynamically import heic2any only when needed (client-side only)
      const heic2any = (await import("heic2any")).default;

      // Determine correct MIME type based on file extension
      const isHeif = fileName.endsWith(".heif");
      const detectedMimeType = isHeif ? "image/heif" : "image/heic";

      // Use the file's existing type if it's already correct, otherwise use detected type
      const isValidHeicType =
        file.type === "image/heic" || file.type === "image/heif";
      const mimeType = isValidHeicType ? file.type : detectedMimeType;

      // If file already has correct type, use it directly as a blob; otherwise create a new Blob
      let blob;
      if (isValidHeicType) {
        // File already has correct MIME type, use it directly (File extends Blob)
        blob = file;
      } else {
        // Create a Blob with correct MIME type
        blob = new Blob([file], { type: mimeType });
      }

      // Try conversion with quality 1 first (like the working example)
      let convertedBlob;
      try {
        convertedBlob = await heic2any({
          blob: blob,
          toType: "image/jpeg",
          quality: 1,
        });
      } catch {
        try {
          convertedBlob = await heic2any({
            blob: blob,
            toType: "image/jpeg",
            quality: 0.8,
          });
        } catch {
          convertedBlob = await heic2any({
            blob: blob,
            toType: "image/jpeg",
            quality: 0.5,
          });
        }
      }

      // heic2any can return an array or a single blob
      const resultBlob = Array.isArray(convertedBlob)
        ? convertedBlob[0]
        : convertedBlob;

      // Create a new file with the converted blob
      const newFileName = file.name
        .replace(/\.heic$/i, ".jpg")
        .replace(/\.heif$/i, ".jpg");

      const convertedFile = new File([resultBlob], newFileName, {
        type: "image/jpeg",
        lastModified: file.lastModified || Date.now(),
      });

      console.log("✓ HEIC/HEIF konvertert til JPEG");
      toast.success("HEIC/HEIF-bilde konvertert til JPEG");

      return convertedFile;
    } catch (error) {
      console.error("HEIC/HEIF-konverteringsfeil:", error);

      // Check for specific error codes (heic2any returns objects with code/message)
      const heicError = error as { code?: number; message?: string };
      if (
        heicError?.code === 2 ||
        heicError?.message?.includes("format not supported")
      ) {
        toast.error(
          "Dette HEIC/HEIF-formatet støttes ikke. Vennligst konverter bildet til JPEG på enheten din først.",
          { duration: 6000 }
        );
        throw new Error(
          "HEIC/HEIF-formatet støttes ikke. Konverter bildet til JPEG og prøv igjen."
        );
      }

      // Generic error - try uploading original
      console.warn("Prøver å laste opp original HEIC/HEIF-fil");
      toast.warning(
        "Kunne ikke konvertere HEIC/HEIF. Bildet vises kanskje ikke i e-posten.",
        { duration: 5000 }
      );
      return file;
    }
  };

  const uploadFileToLepton = async (file: File): Promise<string> => {
    const headers = new Headers();
    headers.append("x-csrf-token", userToken);

    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("https://api.tihlde.org/upload/", {
      method: "POST",
      body: formData,
      headers,
    });
    const data = await response.json();
    return data.url;
  };

  const handleFileChange = async (newFiles: File[]) => {
    if (!newFiles.length) return;
    setIsLoading(true);

    if (newFiles.length > 5) {
      toast.error("Maks 5 bilder kan lastes opp samtidig");
      setIsLoading(false);
      return;
    }

    try {
      // Convert HEIC files to JPEG if necessary
      const convertedFilesPromises = newFiles.map((file) =>
        convertHeicToJpeg(file).catch((error) => {
          // If conversion fails with unsupported format, skip this file
          console.error(`Hoppet over ${file.name}:`, error.message);
          return null;
        })
      );
      const convertedFilesWithNulls = await Promise.all(convertedFilesPromises);

      // Filter out failed conversions
      const convertedFiles = convertedFilesWithNulls.filter(
        (file): file is File => file !== null
      );

      if (convertedFiles.length === 0) {
        toast.error("Ingen filer kunne lastes opp");
        setIsLoading(false);
        return;
      }

      // Upload the converted files
      const filePromises = convertedFiles.map((file) =>
        uploadFileToLepton(file)
      );
      const urls = await Promise.all(filePromises);

      setImages((prev) => [...prev, ...urls]);

      if (convertedFiles.length < newFiles.length) {
        toast.warning(
          `${convertedFiles.length} av ${newFiles.length} filer ble lastet opp`
        );
      } else {
        toast.success(`Filen${newFiles.length > 1 ? "e" : ""} ble opplastet`);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Kunne ikke laste opp filen");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: () => {
      toast.error("Kunne ikke laste opp filen");
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative z-20 font-sans font-bold  text-neutral-300 text-base">
            Velg kvitteringer
          </p>
          <p className="relative z-20 font-sans font-normal  text-neutral-400 text-base mt-2">
            Slipp et bilde eller klikk for å laste opp
          </p>
          <div className="relative w-full mt-10 max-w-xl mx-auto">
            {isLoading ? (
              <div className="h-32 w-32 flex items-center justify-center mx-auto">
                <Loader2
                  size={48}
                  className="text-neutral-500 animate-spin mx-auto"
                />
              </div>
            ) : (
              <>
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className={cn(
                    "relative group-hover/file:shadow-2xl z-40 bg-background flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                    "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  )}
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Slipp
                      <CloudUpload className="h-6 w-6  text-neutral-400" />
                    </motion.p>
                  ) : (
                    <CloudUpload className="h-6 w-6  text-neutral-300" />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-indigo-600 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-indigo-950 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-neutral-950"
                  : "bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}
