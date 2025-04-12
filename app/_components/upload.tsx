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
};

export default function FileUpload ({
    userToken,
    setImages,
}: FileUploadProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const uploadFileToLepton = async (file: File): Promise<string> => {
        const headers = new Headers();
        headers.append("x-csrf-token", userToken);
  
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("https://api.tihlde.org/upload/", {
          method: "POST",
          body: formData,
          headers
        });
        const data = await response.json();
        return data.url;
    };

    const handleFileChange = async (newFiles: File[]) => {
        if (!newFiles.length) return;
        setIsLoading(true);

        if (newFiles.length > 5) {
            toast.error("Maks 5 bilder kan lastes opp samtidig");
            return;
        }

        const filePromises = newFiles.map((file) => uploadFileToLepton(file));
        const urls = await Promise.all(filePromises);

        setImages((prev) => [...prev, ...urls]);
        setIsLoading(false);
        toast.success(`Filen${newFiles.length > 1 ? "e" : ""} ble opplastet`);
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
                    accept="image/*"
                    onChange={(e) =>
                        handleFileChange(Array.from(e.target.files || []))
                    }
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
                        {isLoading
                            ? (
                                <div
                                    className="h-32 w-32 flex items-center justify-center mx-auto"
                                >
                                    <Loader2
                                        size={48}
                                        className="text-neutral-500 animate-spin mx-auto"
                                    />
                                </div>
                            )
                            : (
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
                                            "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
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
                            )
                        }
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

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
                }),
            )}
        </div>
    );
}
