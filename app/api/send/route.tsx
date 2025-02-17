"use server";

import ReactPDF from "@react-pdf/renderer";

import Pdf from "../../template/pdf";
import { v4 as uuidv4 } from "uuid";
import { resend } from "@/lib/resend";
import path from "path";
import fs from 'fs/promises';


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

        const uuid = uuidv4();
        const storePath = path.join(process.cwd(), "public");
        const fileName = `${email}_${uuid}.pdf`;
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

        const file = await fs.readFile(fullPath);

        const { error } = await resend.emails.send({
            from: "TIHLDE Utlegg <updates@quicksend.tihlde.org>",
            to: "finansminister@tihlde.org",
            subject: "Utlegg fra TIHLDE",
            text: `Hei Finansminister!,\n\n${name} har sendt inn en kvitteringen for et utlegg.\n\n Epost: ${email}\n\nMvh\nTIHLDE Quicksend`,
            attachments: [
                {
                    content: file.toString("base64"),
                    filename: "utlegg.pdf",
                }
            ]
        });

        // Send copy to user
        const { error: userError } = await resend.emails.send({
            from: "TIHLDE Utlegg <updates@quicksend.tihlde.org>",
            to: email,
            subject: "Kvittering for utlegg",
            text: `Hei ${name},\n\nHer er kvitteringen for utlegget ditt.\n\nMvh\nTIHLDE Quicksend`,
            attachments: [
                {
                    content: file.toString("base64"),
                    filename: "utlegg.pdf",
                }
            ]
        });

        if (error || userError) {
            return new Response(null, { status: 500 });
        }

        await fs.unlink(fullPath);
    } catch {
        return new Response(null, { status: 500 });
    };

    return new Response(null, { status: 200 });
};