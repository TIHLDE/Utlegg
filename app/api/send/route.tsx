"use server";

import ReactPDF from "@react-pdf/renderer";

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
    const urls = formData.get("receipts") as string;
    const username = formData.get("username") as string;
    const study = formData.get("study") as string;
    const year = formData.get("year") as string;
    const ccEmail = formData.get("ccEmail") as string | null;
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
        signature={`${username}: ${study} - ${year}`}
        receipts={urlsArray}
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
          `Beløp: ${amount} NOK`,
          `Kontonummer: ${accountNumber}`,
          `Dato: ${formattedDate}`,
          `Studie: ${study}`,
          `Årskull: ${year}`,
          " ",
          "Årsak til utlegg:",
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
          `Beløp: ${amount} NOK`,
          `Kontonummer: ${accountNumber}`,
          `Dato: ${formattedDate}`,
          " ",
          "Årsak:",
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
