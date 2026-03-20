"use server";

import ActionCardLink from "./_components/action-card-link";
import { BadgeDollarSign, FileText, Receipt, Trophy } from "lucide-react";

export default async function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] mt-12 md:mt-20 pb-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 md:mb-12">Søknadsportal</h1>
      <div className="grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <ActionCardLink
          href="/utlegg"
          title="Sende inn utlegg"
          description="Fyll ut skjemaet og last opp kvittering for refusjon."
          icon={Receipt}
          ctaLabel="Send inn"
        />
        <ActionCardLink
          href="/soknad-om-stotte"
          title="Søke støtte fra HS"
          description="Send inn søknad om økonomisk støtte til arrangement."
          icon={BadgeDollarSign}
          ctaLabel="Send inn"
        />
        <ActionCardLink
          href="/idrettslag-stotte"
          title="Søke støtte for idrettsgruppe"
          description="Søk støtte til aktivitet, utstyr eller arrangement til idrettsgruppen."
          icon={Trophy}
          ctaLabel="Send inn"
        />
        <ActionCardLink
          href="/sak-til-hs"
          title="Sende en sak til HS"
          description="Send inn en sak du ønsker at HS skal behandle."
          icon={FileText}
          ctaLabel="Send inn"
        />
      </div>
    </div>
  );
}
