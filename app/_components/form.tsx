"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { CalendarIcon, Loader2, Trash, Receipt } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@/types";
import FileUpload from "./upload";

const Schema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  ccEmail: z.union([z.literal(""), z.string().email()]),
  amount: z.string(),
  date: z.date(),
  group: z.string().nonempty(),
  budgetType: z.enum([
    "Sosialbudsjett",
    "Gruppebudsjett",
    "Godkjent søknad til HS",
    "Godkjent søknad fra Idkom",
  ]),
  description: z.string().nonempty(),
  accountNumber: z
    .string()
    .regex(
      /^\d{4}\s\d{2}\s\d{5}$/,
      "Kontonummer må være i formatet xxxx xx xxxxx"
    ),
});

interface SendFormProps {
  userToken: string;
  user: User | null;
}

export default function SendForm({ userToken, user }: SendFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  const ccEmailOptions = [
    "okonomiansvarlig.index@tihlde.org",
    "okonomiansvarlig.sosialen@tihlde.org",
    "okonomiansvarlig.nok@tihlde.org",
    "okonomiansvarlig.kok@tihlde.org",
    "okonomiansvarlig.promo@tihlde.org",
    "okonomiansvarlig.forvaltningsgruppen@tihlde.org",
    "okonomiansvarlig.beta@tihlde.org",
    "okonomiansvarlig.drift@tihlde.org",
    "okonomiansvarlig.fadderkom@tihlde.org",
    "okonomiansvarlig.idkom@tihlde.org",
    "okonomiansvarlig.jentekom@tihlde.org",
    "okonomiansvarlig.jubkom@tihlde.org",
    "okonomiansvarlig.native@tihlde.org",
    "okonomiansvarlig.okom@tihlde.org",
    "okonomiansvarlig.redaksjonen@tihlde.org",
    "okonomiansvarlig.semikolon@tihlde.org",
    "okonomiansvarlig.basket@tihlde.org",
    "okonomiansvarlig.biljard@tihlde.org",
    "okonomiansvarlig.diskgolf@tihlde.org",
    "okonomiansvarlig.handball@tihlde.org",
    "okonomiansvarlig.klatring@tihlde.org",
    "okonomiansvarlig.plask@tihlde.org",
    "okonomiansvarlig.poker@tihlde.org",
    "okonomiansvarlig.fotball.herrer@tihlde.org",
    "okonomiansvarlig.fotball.damer@tihlde.org",
    "okonomiansvarlig.rettogvrang@tihlde.org",
    "okonomiansvarlig.smash@tihlde.org",
    "okonomiansvarlig.spring@tihlde.org",
    "okonomiansvarlig.podden@tihlde.org",
    "okonomiansvarlig.klask@tihlde.org",
    "okonomiansvarlig.fotballogf1@tihlde.org",
    "okonomiansvarlig.golf@tihlde.org",
    "okonomiansvarlig.startup@tihlde.org",
    "okonomiansvarlig.bh@tihlde.org",
    "okonomiansvarlig.ski@tihlde.org",
    "okonomiansvarlig.utveksling@tihlde.org",
    "okonomiansvarlig.turtorial@tihlde.org",
    "okonomiansvarlig.volley@tihlde.org",
  ];

  const groupOptions = [
    "Beta",
    "Drift",
    "FadderKom",
    "IdKom",
    "JenteKom",
    "JubKom",
    "Native",
    "Økom",
    "Redaksjonen",
    "Semikolon",
    "HS",
    "Fondet",
    "Index",
    "Sosialen",
    "NoK",
    "KoK",
    "Promo",
  ];

  const budgetTypeOptions = [
    "Sosialbudsjett",
    "Gruppebudsjett",
    "Godkjent søknad til HS",
    "Godkjent søknad fra Idkom",
  ] as const;

  const formatAccountNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Limit to 11 digits
    const limited = digits.slice(0, 11);

    // Format as xxxx xx xxxxx
    if (limited.length <= 4) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 4)} ${limited.slice(4)}`;
    } else {
      return `${limited.slice(0, 4)} ${limited.slice(4, 6)} ${limited.slice(
        6
      )}`;
    }
  };

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: user?.first_name + " " + user?.last_name || "",
      email: user?.email || "",
      ccEmail: "",
      accountNumber: "",
      amount: "",
      group: "",
      budgetType: "Sosialbudsjett",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    try {
      if (images.length === 0) {
        toast.error("Du må laste opp minst én kvittering.");
        return;
      }

      const data = new FormData();
      data.append("name", values.name);
      data.append("email", values.email);
      if (values.ccEmail) {
        data.append("ccEmail", values.ccEmail);
      }
      data.append("amount", values.amount);
      data.append("date", values.date.toISOString());
      data.append("group", values.group);
      data.append("budgetType", values.budgetType);
      data.append("description", values.description);
      data.append("accountNumber", values.accountNumber.replace(/\s/g, ""));
      data.append("receipts", JSON.stringify(images));
      data.append("username", user?.user_id || "");
      data.append("study", user?.study.group.name || "");
      data.append("year", user?.studyyear.group.name || "");

      const response = await fetch("/api/send", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Det skjedde en feil. Prøv igjen senere.");
      }

      toast.success("Utleggskjemaet ble sendt inn!");
      setImages([]);
      form.reset({
        amount: "",
        date: set(new Date(), { hours: 0, minutes: 0, seconds: 0 }),
        group: "",
        budgetType: "Sosialbudsjett",
        description: "",
        accountNumber: "",
        ccEmail: "",
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Det skjedde en feil. Prøv igjen senere.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
  };

  return (
    <Card className="w-full max-w-5xl">
      <CardHeader className="relative">
        <Receipt className="absolute top-6 right-6 w-8 h-8 text-muted-foreground opacity-50" />
        <CardTitle>Send utleggskjema til TIHLDE!</CardTitle>
        <CardDescription>
          Fyll ut skjemaet og last opp kvitteringer, for å få refundert pengene.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Fullt navn <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      E-post <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background"
                        {...field}
                        required
                        type="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sum (NOK) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kontonummer <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="bg-background"
                        {...field}
                        required
                        type="text"
                        inputMode="numeric"
                        onChange={(e) => {
                          const formatted = formatAccountNumber(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>
                      Dato <span className="text-red-500">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "h-10 w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: nb })
                            ) : (
                              <span>Velg en dato</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={nb}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Dato for utlegget</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ccEmail"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>Kopi til økonomiansvarlig (valgfritt)</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Ingen kopi</option>
                        {ccEmailOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Legg til økonomiansvarlig på kopi for utlegget.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>
                      Gruppe <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="">Velg gruppe</option>
                        {groupOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetType"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>
                      Budsjetttype <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        {budgetTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Hva utlegget er for <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FileUpload userToken={userToken} setImages={setImages} />

            {images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <Image src={url} alt="receipt" height={200} width={400} />
                    <button
                      onClick={() => removeImage(url)}
                      type="button"
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                    >
                      <Trash className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 md:pt-6">
              <Button
                className="w-full md:w-auto"
                type="submit"
                disabled={isLoading}
                variant="action"
                size="lg"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Send inn utleggskjema"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
