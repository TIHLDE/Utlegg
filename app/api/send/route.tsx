"use server";

import ReactPDF from "@react-pdf/renderer";

import Pdf from "../../template/pdf";
import path from "path";
import fs from 'fs/promises';
import { sendEmail, uploadFile } from "./util";


export async function POST(req: Request) {
    try {
        const formData = await req.formData();
    
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const amount = formData.get("amount") as string;
        const date = formData.get("date") as string;
        const description = formData.get("description") as string;
        const accountNumber = formData.get("accountNumber") as string;
        const urls = formData.get("receipts") as string;
        const username = formData.get("username") as string;
        const study = formData.get("study") as string;
        const year = formData.get("year") as string;

        const urlsArray = JSON.parse(urls) as string[];    

        const storePath = path.join(process.cwd(), "public");
        const fileName = `-${username}.pdf`;
        const fullPath = path.join(storePath, fileName);
    
        await ReactPDF.render(
            <Pdf
                name={name}
                email={email}
                amount={amount}
                date={date}
                description={description}
                accountNumber={accountNumber}
                urls={urlsArray}
                signature={`${username}: ${study} - ${year}`}
            />,
            fullPath
        );

        const fileBuffer = await fs.readFile(fullPath);

        const file = new File([new Uint8Array(fileBuffer)], fileName, { type: "application/pdf" });

        const { error: uploadError, data } = await uploadFile(file);

        if (uploadError || !data) {
            return new Response(null, { status: 500 });
        }

        const fileUrl = data;

        const { error: recieverError } = await sendEmail(
            ["mathias.strom03@gmail.com"],
            "Utlegg til godkjenning",
            [
                "Hei Finansminister!",
                `${name} har sendt inn et utlegg. Alle detaljer er i vedlegget.`
            ],
            [fileUrl]
        );

        const { error: userError } = await sendEmail(
            [email],
            "Kvittering for utlegg",
            [
                `Hei ${name},`,
                "Her er kvitteringen for utlegget ditt. Utlegget er sendt til finansministeren. Du vil få returnert pengene dine så snart som mulig.",
                "Hvis det er noen problemer med utlegget, vil du bli kontaktet av finansministeren.",
            ],
            [fileUrl]
        );

        if (recieverError || userError) {
            return new Response(null, { status: 500 });
        }

        await fs.unlink(fullPath);
    } catch (error) {
        console.error("Error in SEND request: ", error);
        return new Response(null, { status: 500 });
    };

    return new Response(null, { status: 200 });
};
