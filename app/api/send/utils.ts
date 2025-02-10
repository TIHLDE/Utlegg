"use server";

import { getCurrentSession } from "@/lib/auth/auth";

import fs from 'fs';
import path from 'path';

const readPdfToBuffer = async (filePath: string) => {
    const fullPath = path.resolve(filePath);
    return fs.readFileSync(fullPath);
}

export const uploadFileToLepton = async (path: string): Promise<string> => {
    const token = await getCurrentSession();

    if (!token) {
        throw new Error("Du er ikke logget inn");
    }

    const headers = new Headers();
    headers.append("x-csrf-token", token);

    const file = await readPdfToBuffer(path);
    
    const formData = new FormData();
    // formData.append("file", file);
    const response = await fetch("https://api.tihlde.org/upload/", {
        method: "POST",
        body: formData,
        headers
    });
    const data = await response.json();

    return data.url as string;
};

