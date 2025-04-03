"use server";

import { BlobServiceClient } from "@azure/storage-blob";

interface FileUploadResponse {
  error: string | null;
  url: string | null;
}

export async function uploadImage(
  formData: FormData,
): Promise<FileUploadResponse> {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    return { error: "Kunne ikke koble til Azure", url: null };
  }

  const file = formData.get("file") as File;
  const containerName = "utlegg";

  if (!file) {
    return { error: "Ingen fil lagt ved", url: null };
  }

  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${new Date().getTime()}-${file.name}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: file.type || "image/jpeg" },
    });

    return { error: null, url: blockBlobClient.url };
  } catch (error) {
    console.error("Error uploading file: ", error);
    if (error instanceof Error) {
      return { error: error.message, url: null };
    }

    return { error: "Det skjedde en ukjent feil", url: null };
  }
}
