"use server";

import ReactPDF from "@react-pdf/renderer";
import BoardCasePdf from "../../template/hs-case-pdf";
import path from "path";
import fs from "fs/promises";
import { sendEmail, uploadFile } from "../send/util";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const contactName = formData.get("contactName") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const username = formData.get("username") as string;
    const caseName = formData.get("caseName") as string;
    const caseType = formData.get("caseType") as string;
    const background = formData.get("background") as string;
    const assessment = formData.get("assessment") as string;
    const recommendation = formData.get("recommendation") as string;
    const imagesStr = formData.get("images") as string;
    const images = imagesStr ? JSON.parse(imagesStr) as string[] : [];

    const storePath = path.join(process.cwd(), "public");
    const fileName = `-hs-case-${username}.pdf`;
    const fullPath = path.join(storePath, fileName);

    await ReactPDF.render(
      <BoardCasePdf
        contactName={contactName}
        contactEmail={contactEmail}
        caseName={caseName}
        caseType={caseType}
        background={background}
        assessment={assessment}
        recommendation={recommendation}
        images={images}
      />,
      fullPath,
    );
    console.log("PDF for HS-sak generert vellykket");

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


    const hsEmailContent = [
      "Til Hovedstyret!",
      " ",
      `${contactName} har meldt inn en ny sak. Se detaljer nedenfor:`,
      " ",
      "--- SAKSDETALJER ---",
      `Saksbehandler: ${contactName}`,
      `E-post: ${contactEmail}`,
      `Navn på saken: ${caseName}`,
      `Type: ${caseType}`,
      " ",
      "BAKGRUNN:",
      background,
      " ",
      "VURDERING:",
      assessment,
    ];

    if (recommendation) {
      hsEmailContent.push(" ", "INNSTILLING:", recommendation);
    }

    hsEmailContent.push(" ", "Fullstendig saksdokument er vedlagt som PDF.");

    // E-post (kvittering) til brukeren som sendte inn saken
    const userEmailContent = [
      `Hei ${contactName},`,
      " ",
      "Takk for at du meldte inn saken. Den er nå videresendt til HS.",
      " ",
      "--- DIN INNMELDTE SAK ---",
      `Navn på saken: ${caseName}`,
      `Type: ${caseType}`,
      " ",
      "PDF-kopi av saksdokumentet er vedlagt til denne e-posten.",
    ];

    const attachments = [...images, fileUrl];

    const [{ error: receiverError }, { error: userError }] = await Promise.all([
      sendEmail(
        ["hs@tihlde.org"], 
        `Ny ${caseType.toLowerCase()} - ${caseName}`,
        hsEmailContent,
        attachments,
      ),
      sendEmail(
        [contactEmail], 
        `Kvittering for innsendt sak: ${caseName}`,
        userEmailContent,
        attachments,
      ),
    ]);

    if (receiverError) {
      console.error("E-post til HS feilet:", receiverError);
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
    console.error("Error in HS-CASE request: ", error);
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