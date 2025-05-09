"use server";

import { Button } from "@/components/ui/button";
import { ArrowRight, HandCoins, ReceiptText } from "lucide-react";
import Link from "next/link";

export default async function SendPage() {  
  return (
    <div className="flex items-center justify-center mt-12 md:mt-20 pb-12">
      <div className="max-w-4xl w-full mx-auto grid md:grid-cols-2 gap-4 md:gap-12">
        <Link
          className="rounded-lg border p-6 bg-card space-y-6 hover:bg-background transition-all duration-200 ease-in-out"
          href="/utlegg"
        >
          <div className="flex items-center space-x-2">
            <ReceiptText />
            <h2 className="text-3xl font-bold">Utlegg</h2>
          </div>
          <p className="font-medium text-muted-foreground">
            Har du hatt utlegg i forbindelse med TIHLDE? Send inn kvitteringer og få refundert utleggene dine.
          </p>

          <div className="pt-4 flex justify-end">
            <Button
              variant="action"
            >
              Gå til søknad
              <ArrowRight />  
            </Button>  
          </div>          
        </Link>
        <Link
          className="rounded-lg border p-6 bg-card space-y-6 hover:bg-background transition-all duration-200 ease-in-out"
          href="/soknad"
        >
          <div className="flex items-center space-x-2">
            <HandCoins />
            <h2 className="text-3xl font-bold">Søknad</h2>
          </div>
          <p className="font-medium text-muted-foreground">
            Ønsker du å søke om økonomisk støtte? Send inn en søknad til HS og få svar på om du får støtte.
          </p>      

          <div className="pt-4 flex justify-end">
            <Button
              variant="action"
            >
              Gå til søknad
              <ArrowRight />  
            </Button> 
          </div>      
        </Link>
      </div>
    </div>
  );
};