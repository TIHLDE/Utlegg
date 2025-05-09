"use server";


export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        return new Response(null, { status: 200 });
    } catch (error) {
        console.error("Error in POST request for application:", error);
        return new Response("Internal Server Error", { status: 500 });
    };
};