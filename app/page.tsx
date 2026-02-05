"use server";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] mt-12 md:mt-20 pb-12">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12">Jeg vil</h1>
      <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
        <Link href="/utlegg">
          <Button
            variant="action"
            size="lg"
            className="w-full sm:w-auto px-12 py-8 text-xl transition-opacity hover:opacity-80"
          >
            Sende inn utlegg
          </Button>
        </Link>
        <Link href="/soknad-om-stotte">
          <Button
            variant="action"
            size="lg"
            className="w-full sm:w-auto px-12 py-8 text-xl transition-opacity hover:opacity-80"
          >
            Søke støtte fra HS
          </Button>
        </Link>
        <Link href="/idrettslag-stotte">
          <Button
            variant="action"
            size="lg"
            className="w-full sm:w-auto px-12 py-8 text-xl transition-opacity hover:opacity-80"
          >
            Søke støtte for idrettslag
          </Button>
        </Link>
      </div>
    </div>
  );
}
