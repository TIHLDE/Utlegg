"use client";

import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";


interface FileUploadProps<TFormValues extends FieldValues> {
    form: UseFormReturn<TFormValues>;
    name: Path<TFormValues>;
    userToken: string;
};

const FileUpload = <TFormValues extends FieldValues>({ form, name, userToken }: FileUploadProps<TFormValues>) => {
    const url = form.watch(name);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const removeFile = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        form.setValue(name, "");
    };

    const uploadFileToLepton = async (file: File) => {
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
      return data;
    };

    const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          setIsLoading(true);


          try {
            const data = await uploadFileToLepton(file);
            console.log("DATA: ", data)
    
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            form.setValue(name, data.url);
            toast.success("Filen ble opplastet");
          } catch (e) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            toast.error(e.detail || "Det oppstod en feil");
          }
          setIsLoading(false);
        }
    };

    if (url && !isLoading) {
        return (
            <div className="w-full border p-6 flex items-center justify-center relative">
                <Image
                    src={url}
                    alt="Uploaded file"
                    className="object-cover"
                    width={200}
                    height={200}
                />

                <Button
                    className="absolute top-2 right-2"
                    onClick={removeFile}
                    variant="destructive"
                    size="icon"
                >
                    <X />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 space-y-6">
                    <Upload size={48} className="text-gray-500 dark:text-gray-400" />
                   <div className="space-y-2 text-center">
                   <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Trykk</span> eller dra og slipp for å laste opp</p>
                   <p className="text-xs text-gray-500 dark:text-gray-400">JPG, JPEG eller PNG</p>
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