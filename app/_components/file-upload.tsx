"use client";

import { cn } from "@/lib/utils";
import { Loader2, Upload } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "../actions/file-upload";


interface FileUploadProps {
  setImgs: Dispatch<SetStateAction<string[]>>;
};

const FileUpload = ({ setImgs }: FileUploadProps)=> {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const uploadFileToAzure = async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      if (file.size > 4 * 1024 * 1024) { // 4 MB
        throw new Error("Filen er større enn 4 MB som er maksgrensen.");
      }

      const { error, url } = await uploadImage(formData);

      if (error) {
        throw new Error(error);
      }

      return url;
    };

    const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setIsLoading(true)

          try {
            const url = await uploadFileToAzure(file);
    
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            setImgs((prev) => [...prev, url]);
            toast.success("Filen ble opplastet");
          } catch (e) {
            if (e instanceof Error) {
              toast.error(e.message)
            } else {
              console.error("Error uploading file: ", e);
              toast.error("Det oppstod en feil");
            }
          }
          setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className={cn("flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer dark:bg-slate-950 dark:text-white dark:border-indigo-950 dark:hover:border-indigo-900", !isLoading && " dark:hover:bg-slate-900")}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-6">
                    {isLoading
                        ? <Loader2 size={48} className="text-gray-500 dark:text-white animate-spin" />
                        : <Upload size={48} className="text-gray-500 dark:text-white" />
                    }
                   <div className="space-y-2 text-center">
                   <p className="mb-2 text-sm text-gray-500 dark:text-white"><span className="font-semibold">Trykk</span> eller dra og slipp for å laste opp</p>
                   <p className="text-xs text-gray-500 dark:text-white">JPG, JPEG eller PNG</p>
                   </div> 
                </div>
                <input
                    id="dropzone-file"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={upload}
                    disabled={isLoading}
                />
            </label>
        </div> 
    );
};


export default FileUpload;