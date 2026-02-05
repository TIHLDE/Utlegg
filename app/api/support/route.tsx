"use server";

import ReactPDF from "@react-pdf/renderer";
import SupportPdf from "../../template/support-pdf";
import path from "path";
import fs from "fs/promises";
import { sendEmail, uploadFile } from "../send/util";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const groupName = formData.get("groupName") as string;
    const purpose = formData.get("purpose") as string;
    const eventDescription = formData.get("eventDescription") as string;
    const justification = formData.get("justification") as string;
    const totalAmount = formData.get("totalAmount") as string;
    const budgetLink = formData.get("budgetLink") as string;
    const summary = formData.get("summary") as string;
    const budgetImagesStr = formData.get("budgetImages") as string;
    const username = formData.get("username") as string;
    const study = formData.get("study") as string;
    const year = formData.get("year") as string;
    const formType = (formData.get("formType") as string) || "support";

    const budgetImages = JSON.parse(budgetImagesStr) as string[];

    // Determine email recipient based on form type
    const isidrettslag = formType === "idrettslag";
    const recipientEmails = isidrettslag
      ? ["lederidkom@tihlde.org"]
      : ["finansminister@tihlde.org", "hs@tihlde.org"];

    // Generate PDF
    const storePath = path.join(process.cwd(), "public");
    const fileName = `-support-${username}.pdf`;
    const fullPath = path.join(storePath, fileName);

    await ReactPDF.render(
      <SupportPdf
        name={name}
        email={email}
        groupName={groupName}
        purpose={purpose}
        eventDescription={eventDescription}
        justification={justification}
        totalAmount={totalAmount}
        budgetLink={budgetLink}
        summary={summary}
        signature={`${username}: ${study} - ${year}`}
        budgetImages={budgetImages}
      />,
      fullPath,
    );
    console.log("PDF generert vellykket med budsjettbilder");

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

    // Build email content for the recipient
    const recipientTitle = isidrettslag
      ? "Hei Leder IdKom!"
      : "Hei Finansminister!";
    const formTypeLabel = isidrettslag
      ? "søknad om støtte for idrettslag"
      : "søknad om støtte";
    const financeEmailContent = [
      recipientTitle,
      `${name} har sendt inn en ${formTypeLabel}. Se detaljer nedenfor:`,
      " ",
      "--- SØKNADSDETALJER ---",
      `Navn: ${name}`,
      `E-post: ${email}`,
      `Gruppe: ${groupName}`,
      `Studie: ${study}`,
      `Årskull: ${year}`,
      `Totalt søknadsbeløp: ${totalAmount} NOK`,
      " ",
      "FORMÅL MED SØKNAD:",
      purpose,
      " ",
      "BESKRIVELSE AV ARRANGEMENT/PRODUKT:",
      eventDescription,
      " ",
      "BEGRUNNELSE FOR STØTTE:",
      justification,
    ];

    if (budgetLink) {
      financeEmailContent.push(" ", `Lenke til budsjett: ${budgetLink}`);
    }

    if (budgetImages.length > 0) {
      financeEmailContent.push(
        " ",
        `Antall budsjettbilder: ${budgetImages.length}`,
      );
    }

    if (summary) {
      financeEmailContent.push(" ", "OPPSUMMERING:", summary);
    }

    financeEmailContent.push(" ", "PDF-skjema er vedlagt.");

    if (budgetImages.length > 0) {
      financeEmailContent.push(
        "Budsjettbilder er også vedlagt som separate filer.",
      );
    }

    // Build email content for the user
    const recipientName = isidrettslag ? "Leder IdKom" : "finansministeren";
    const userEmailContent = [
      `Hei ${name},`,
      " ",
      `Takk for at du sendte inn søknaden om støtte${isidrettslag ? " for idrettslag" : ""}. Her er en oppsummering:`,
      " ",
      "--- DIN SØKNAD ---",
      `Gruppe: ${groupName}`,
      `Totalt søknadsbeløp: ${totalAmount} NOK`,
      " ",
      "FORMÅL:",
      purpose,
      " ",
      "BESKRIVELSE:",
      eventDescription,
      " ",
      "BEGRUNNELSE:",
      justification,
    ];

    if (summary) {
      userEmailContent.push(" ", "OPPSUMMERING:", summary);
    }

    userEmailContent.push(
      " ",
      `Søknaden er sendt til ${recipientName}. Du vil få svar så snart som mulig.`,
      `Hvis det er noen spørsmål om søknaden, vil du bli kontaktet av ${recipientName}.`,
      " ",
      "PDF-skjema er vedlagt til denne e-posten.",
    );

    if (budgetImages.length > 0) {
      userEmailContent.push(
        "Budsjettbilder er også vedlagt som separate filer.",
      );
    }

    // Send emails with PDF and images attached
    const attachments = [...budgetImages, fileUrl];
    const emailSubject = isidrettslag
      ? "Ny søknad om støtte - idrettslag"
      : "Ny søknad om støtte";
    const [{ error: receiverError }, { error: userError }] = await Promise.all([
      sendEmail(
        recipientEmails,
        emailSubject,
        financeEmailContent,
        attachments,
      ),
      sendEmail(
        [email],
        `Kvittering for søknad om støtte${isidrettslag ? " - idrettslag" : ""}`,
        userEmailContent,
        attachments,
      ),
    ]);

    if (receiverError) {
      console.error(`E-post til mottaker feilet:`, receiverError);
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
    console.error("Error in SUPPORT request: ", error);
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
