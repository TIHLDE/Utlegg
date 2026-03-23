"use server";

import ReactPDF from "@react-pdf/renderer";
import { heicTo } from "heic-to";

import Pdf from "../../template/pdf";
import path from "path";
import fs from "fs/promises";
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
    const group = formData.get("group") as string;
    const budgetType = formData.get("budgetType") as string;
    const urls = formData.get("receipts") as string;
    const username = formData.get("username") as string;
    const study = formData.get("study") as string;
    const year = formData.get("year") as string;
    const ccEmail = formData.get("ccEmail") as string | null;
    const urlsArray = JSON.parse(urls) as string[];

    const normalizedReceipts = await Promise.all(
      urlsArray.map(async (receiptUrl) => {
        const response = await fetch(receiptUrl);

        if (!response.ok) {
          throw new Error(`Kunne ikke hente kvittering: ${receiptUrl}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        let buffer = Buffer.from(arrayBuffer);
        let mimeType =
          response.headers.get("content-type") ||
          (receiptUrl.toLowerCase().endsWith(".png")
            ? "image/png"
            : receiptUrl.toLowerCase().endsWith(".jpg") ||
              receiptUrl.toLowerCase().endsWith(".jpeg")
            ? "image/jpeg"
            : receiptUrl.toLowerCase().endsWith(".webp")
            ? "image/webp"
            : receiptUrl.toLowerCase().endsWith(".gif")
            ? "image/gif"
            : receiptUrl.toLowerCase().endsWith(".bmp")
            ? "image/bmp"
            : "");

        const shouldConvertToJpeg =
          mimeType.includes("heic") ||
          mimeType.includes("heif") ||
          receiptUrl.toLowerCase().endsWith(".heic") ||
          receiptUrl.toLowerCase().endsWith(".heif");

        if (shouldConvertToJpeg) {
          const heicBlob = new Blob([buffer], {
            type: mimeType || "image/heic",
          });

          const convertedBlob = await heicTo({
            blob: heicBlob,
            type: "image/jpeg",
            quality: 0.9,
          });

          const convertedArrayBuffer = await convertedBlob.arrayBuffer();
          buffer = Buffer.from(convertedArrayBuffer);
          mimeType = "image/jpeg";
        }

        if (!mimeType) {
          mimeType = "image/jpeg";
        }

        const base64Data = buffer.toString("base64");
        return `data:${mimeType};base64,${base64Data}`;
      })
    );
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
        group={group}
        budgetType={budgetType}
        signature={`${username}: ${study} - ${year}`}
        receipts={normalizedReceipts}
      />,
      fullPath
    );
    console.log("PDF generert vellykket med kvitteringsbilder");

    console.log("Leser PDF-fil...");
    const fileBuffer = await fs.readFile(fullPath);
    console.log("PDF-fil lest, størrelse:", fileBuffer.length, "bytes");

    const file = new File([new Uint8Array(fileBuffer)], fileName, {
      type: "application/pdf",
    });

    console.log("Laster opp PDF til server...");
    const { error: uploadError, data } = await uploadFile(file);

    if (uploadError || !data) {
      console.error("PDF-opplastning feilet:", uploadError);
      return new Response(null, { status: 500 });
    }

    const fileUrl = data;
    console.log("PDF lastet opp, URL:", fileUrl);

    // Parse date without timezone conversion to avoid day shift
    const [dateYear, dateMonth, dateDay] = date.split("-").map(Number);
    const dateObj = new Date(dateYear, dateMonth - 1, dateDay);
    const formattedDate = dateObj.toLocaleDateString("nb-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const financeRecipients = [
      "finansminister@tihlde.org",
      ...(ccEmail ? [ccEmail] : []),
    ];

    const [{ error: recieverError }, { error: userError }] = await Promise.all([
      sendEmail(
        financeRecipients,
        "Nytt utlegg til godkjenning",
        [
          "Hei Finansminister!",
          `${name} har sendt inn et nytt utlegg. Se detaljer nedenfor:`,
          " ",
          "--- UTLEGGSDETALJER ---",
          `Navn: ${name}`,
          `E-post: ${email}`,
          `Gruppe: ${group}`,
          `Budsjetttype: ${budgetType}`,
          `Beløp: ${amount} NOK`,
          `Kontonummer: ${accountNumber}`,
          `Dato: ${formattedDate}`,
          `Studie: ${study}`,
          `Årskull: ${year}`,
          " ",
          "Hva utlegget er for:",
          description,
          " ",
          `Antall kvitteringer: ${urlsArray.length}`,
          " ",
          "PDF-skjema og kvitteringsbilder er vedlagt som filer.",
        ],
        [...urlsArray, fileUrl] // Images first, then PDF
      ),
      sendEmail(
        [email],
        "Kvittering for utlegg",
        [
          `Hei ${name},`,
          " ",
          "Takk for at du sendte inn utlegget ditt. Her er en oppsummering:",
          " ",
          "--- DITT UTLEGG ---",
          `Gruppe: ${group}`,
          `Budsjetttype: ${budgetType}`,
          `Beløp: ${amount} NOK`,
          `Kontonummer: ${accountNumber}`,
          `Dato: ${formattedDate}`,
          " ",
          "Hva utlegget er for:",
          description,
          " ",
          `Kvitteringer: ${urlsArray.length} stk`,
          " ",
          "Utlegget er sendt til finansministeren. Du vil få returnert pengene dine så snart som mulig.",
          "Hvis det er noen problemer med utlegget, vil du bli kontaktet av finansministeren.",
          " ",
          "PDF-skjema og kvitteringsbilder er vedlagt som filer til denne e-posten.",
        ],
        [...urlsArray, fileUrl] // Images first, then PDF
      ),
    ]);

    if (recieverError) {
      console.error("E-post til finansminister feilet:", recieverError);
      return new Response(null, { status: 500 });
    }

    if (userError) {
      console.error("E-post til bruker feilet:", userError);
      return new Response(null, { status: 500 });
    }

    console.log("Begge e-poster sendt vellykket");

    console.log("Sletter midlertidig PDF-fil...");
    await fs.unlink(fullPath);
    console.log("Midlertidig fil slettet");
  } catch (error) {
    console.error("Error in SEND request: ", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(null, { status: 200 });
}
