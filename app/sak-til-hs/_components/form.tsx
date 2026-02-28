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
import { Button } from "@/components/ui/button";
import { Loader2, Trash, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@/types";
import FileUpload from "../../_components/upload";

const Schema = z.object({
    contactName: z.string().nonempty(),
    contactEmail: z.string().email(),
    caseName: z.string().nonempty(),
    caseType: z.enum(["Diskusjonssak", "Vedtakssak", "Orienteringssak"]),
    background: z.string().nonempty(),
    assessment: z.string().nonempty(),
    recommendation: z.string().optional(),
});

interface SakTilHsFormProps {
    userToken: string;
    user: User | null;
}

export default function SakTilHsForm({ user, userToken }: SakTilHsFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      contactName: user?.first_name ? `${user.first_name} ${user.last_name}` : "",
      contactEmail: user?.email || "",
      caseName: "",
      caseType: "Diskusjonssak",
      background: "",
      assessment: "",
      recommendation: "",
    },
  });

  // Watching the caseType to control the visibility of the recommendation field
  const selectedCaseType = form.watch("caseType");

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    try {
      const data = new FormData();
      
      data.append("contactName", values.contactName);
      data.append("username", user?.user_id || "");
      data.append("contactEmail", values.contactEmail);      
      data.append("caseName", values.caseName);
      data.append("caseType", values.caseType);
      data.append("background", values.background);
      data.append("assessment", values.assessment);
      data.append("images", JSON.stringify(images));

      if (values.caseType === "Vedtakssak" && values.recommendation) {
        data.append("recommendation", values.recommendation);
      }
      data.append("formType", "sak-til-hs");

      const response = await fetch("/api/hs-case", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Det skjedde en feil. Prøv igjen senere.");
      }

      toast.success("Saken ble sendt inn til HS!");
      setImages([]);
      form.reset({
        caseName: "",
        caseType: "Diskusjonssak",
        background: "",
        assessment: "",
        recommendation: "",
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
        <FileText className="absolute top-6 right-6 w-8 h-8 text-muted-foreground opacity-50" />
        <CardTitle>Send inn sak til HS</CardTitle>
        <CardDescription>
          Fyll ut skjemaet for å melde inn en diskusjons-, vedtaks- eller orienteringssak til Hovedstyret.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            
          <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Navn på kontaktperson <span className="text-red-500">*</span>
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
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      E-post til kontaktperson <span className="text-red-500">*</span>
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
                name="caseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Navn på saken <span className="text-red-500">*</span>
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
                name="caseType"
                render={({ field }) => (
                  <FormItem className="flex flex-col h-full">
                    <FormLabel>
                      Type sak <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        required
                      >
                        <option value="Diskusjonssak">Diskusjonssak</option>
                        <option value="Vedtakssak">Vedtakssak</option>
                        <option value="Orienteringssak">Orienteringssak</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Kort beskrivelse / bakgrunn for saken <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-32"
                      placeholder="Hvorfor løftes denne saken? Hva er konteksten?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assessment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Saksbehandlers vurdering <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-32"
                      placeholder="Hva mener du om saken? Hva ønsker du at HS skal gjøre (f.eks. diskutere spesifikke punkter)?"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedCaseType === "Vedtakssak" && (
              <FormField
                control={form.control}
                name="recommendation"
                render={({ field }) => (
                  <FormItem className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <FormLabel>
                      Saksbehandlers innstilling <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        required
                        className="resize-none min-h-24 border-blue-500 focus-visible:ring-blue-500"
                        placeholder="Forslag til konkret vedtak (f.eks: 'HS vedtar at...')"
                      />
                    </FormControl>
                    <FormDescription>
                      Siden dette er en vedtakssak må du komme med et konkret forslag til vedtak som HS kan stemme over.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

<div>
              <FormLabel>Eventuelle vedlegg (bilder)</FormLabel>
              <FormDescription className="mb-2">
                Last opp bilder for å støtte din sak
              </FormDescription>
              <FileUpload
                userToken={userToken}
                setImages={setImages}
                labelText="vedlegg"
              />
            </div>

            {images.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((url, index) => (
                  <div key={index} className="relative">
                    <Image src={url} alt="budget" height={200} width={400} />
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
                  "Send inn sak til HS"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}