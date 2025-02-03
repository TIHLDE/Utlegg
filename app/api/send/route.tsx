"use server";

import ReactPDF from "@react-pdf/renderer";

import Pdf from "../../template/pdf";


export async function POST(req: Request) {
    const formData = await req.formData();

    ReactPDF.render(
        <Pdf
            name={formData.get("name") as string}
            email={formData.get("email") as string}
            amount={formData.get("amount") as string}
            date={formData.get("date") as string}
            description={formData.get("description") as string}
            accountNumber={formData.get("accountNumber") as string}
        />,
        `pdfs/test.pdf`
    );

    return new Response(null, { status: 200 });
};