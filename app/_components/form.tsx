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
  amount: z.string(),
  date: z.date(),
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
      accountNumber: "",
      amount: "",
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
      data.append("amount", values.amount);
      data.append("date", values.date.toISOString());
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
        description: "",
        accountNumber: "",
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    Dato <span className="text-red-500">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Årsak for utlegg <span className="text-red-500">*</span>
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
