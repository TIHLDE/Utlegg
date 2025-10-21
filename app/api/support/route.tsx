"use server";

import { sendEmail } from "../send/util";

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

    const budgetImages = JSON.parse(budgetImagesStr) as string[];

    // Build email content for the finance minister
    const financeEmailContent = [
      "Hei Finansminister!",
      `${name} har sendt inn en søknad om støtte. Se detaljer nedenfor:`,
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
        `Antall budsjettbilder: ${budgetImages.length}`
      );
    }

    if (summary) {
      financeEmailContent.push(" ", "OPPSUMMERING:", summary);
    }

    if (budgetImages.length > 0) {
      financeEmailContent.push(" ", "Budsjettbilder er vedlagt som filer.");
    }

    // Build email content for the user
    const userEmailContent = [
      `Hei ${name},`,
      " ",
      "Takk for at du sendte inn søknaden om støtte. Her er en oppsummering:",
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
      "Søknaden er sendt til finansministeren. Du vil få svar så snart som mulig.",
      "Hvis det er noen spørsmål om søknaden, vil du bli kontaktet av finansministeren."
    );

    if (budgetImages.length > 0) {
      userEmailContent.push(
        " ",
        "Budsjettbilder er vedlagt til denne e-posten."
      );
    }

    // Send emails
    const [{ error: receiverError }, { error: userError }] = await Promise.all([
      sendEmail(
        ["finansminister@tihlde.org"],
        "Ny søknad om støtte",
        financeEmailContent,
        budgetImages
      ),
      sendEmail(
        [email],
        "Kvittering for søknad om støtte",
        userEmailContent,
        budgetImages
      ),
    ]);

    if (receiverError) {
      console.error("E-post til finansminister feilet:", receiverError);
      return new Response(null, { status: 500 });
    }

    if (userError) {
      console.error("E-post til bruker feilet:", userError);
      return new Response(null, { status: 500 });
    }

    console.log("Begge e-poster sendt vellykket");
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
