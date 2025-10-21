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
import { Loader2, Trash, HandHeart } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
import type { User } from "@/types";
import FileUpload from "../../_components/upload";

const Schema = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
  groupName: z.string().nonempty(),
  purpose: z.string().nonempty(),
  eventDescription: z.string().nonempty(),
  justification: z.string().nonempty(),
  totalAmount: z.string(),
  budgetLink: z.string().optional(),
  summary: z.string().optional(),
});

interface SupportFormProps {
  userToken: string;
  user: User | null;
}

export default function SupportForm({ userToken, user }: SupportFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: user?.first_name + " " + user?.last_name || "",
      email: user?.email || "",
      groupName: "",
      purpose: "",
      eventDescription: "",
      justification: "",
      totalAmount: "",
      budgetLink: "",
      summary: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof Schema>) => {
    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("name", values.name);
      data.append("email", values.email);
      data.append("groupName", values.groupName);
      data.append("purpose", values.purpose);
      data.append("eventDescription", values.eventDescription);
      data.append("justification", values.justification);
      data.append("totalAmount", values.totalAmount);
      data.append("budgetLink", values.budgetLink || "");
      data.append("summary", values.summary || "");
      data.append("budgetImages", JSON.stringify(images));
      data.append("username", user?.user_id || "");
      data.append("study", user?.study.group.name || "");
      data.append("year", user?.studyyear.group.name || "");

      const response = await fetch("/api/support", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error("Det skjedde en feil. Prøv igjen senere.");
      }

      toast.success("Søknaden om støtte ble sendt inn!");
      setImages([]);
      form.reset({
        groupName: "",
        purpose: "",
        eventDescription: "",
        justification: "",
        totalAmount: "",
        budgetLink: "",
        summary: "",
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
        <HandHeart className="absolute top-6 right-6 w-8 h-8 text-muted-foreground opacity-50" />
        <CardTitle>Søknad om støtte</CardTitle>
        <CardDescription>
          Fyll ut skjemaet for å søke om økonomisk støtte til din gruppe eller
          arrangement.
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
                      Navn <span className="text-red-500">*</span>
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

            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Navn på gruppe <span className="text-red-500">*</span>
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
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Formål med søknad <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-24"
                    />
                  </FormControl>
                  <FormDescription>
                    Beskriv formålet med søknaden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Beskrivelse av arrangement/produkt{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-32"
                    />
                  </FormControl>
                  <FormDescription>
                    Gi en detaljert beskrivelse av arrangementet eller produktet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Begrunnelse for støtte{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      required
                      className="resize-none min-h-32"
                    />
                  </FormControl>
                  <FormDescription>
                    Forklar hvorfor dere trenger økonomisk støtte
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Totalt søknadsbeløp (NOK){" "}
                    <span className="text-red-500">*</span>
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
              name="budgetLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lenke til budsjett (valgfritt)</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-background"
                      {...field}
                      type="url"
                      placeholder="https://..."
                    />
                  </FormControl>
                  <FormDescription>
                    Du kan laste opp budsjettbilder nedenfor eller oppgi en
                    lenke her
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Budsjett (bilder)</FormLabel>
              <FormDescription className="mb-2">
                Last opp bilder av budsjett eller regneark
              </FormDescription>
              <FileUpload userToken={userToken} setImages={setImages} />
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

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oppsummering (valgfritt)</FormLabel>
                  <FormControl>
                    <Textarea {...field} className="resize-none min-h-24" />
                  </FormControl>
                  <FormDescription>
                    En kort oppsummering av søknaden
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  "Send inn søknad"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
