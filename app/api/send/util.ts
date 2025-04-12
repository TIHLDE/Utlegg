import { TIHLDE_API_KEY } from "@/lib/constants";


export const sendEmail = async (
    emails: string[],
    title: string,
    paragraphs: string[],
    attachments: string[],
): Promise<{ error: string | null }> => {
    const headers = new Headers();
    headers.append("x-api-key", TIHLDE_API_KEY as string);
    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({
        emails,
        title,
        paragraphs,
        attachments,
        notification_type: "UTLEGG",
    })

    const response = await fetch("https://api.tihlde.org/apikeys/email/", {
        headers,
        method: "POST",
        body
    });

    if (response.status !== 201) {
        const error = await response.json();
        return { error: error.detail };
    }

    return { error: null };
};

export const uploadFile = async (file: File): Promise<{ error: string | null, data: string | null}> => {
    const headers = new Headers();
    headers.append("x-api-key", TIHLDE_API_KEY as string);

    const formData = new FormData();
    formData.append("FILES", file);
    formData.append("container_name", "utlegg");

    const response = await fetch("https://api.tihlde.org/apikeys/upload/", {
        headers,
        method: "POST",
        body: formData,
    });

    if (response.status !== 200) {
        const error = await response.json();
        return { error: error.message, data: null };
    }

    const data = await response.json() as { url: string };

    return { error: null, data: data.url };
};