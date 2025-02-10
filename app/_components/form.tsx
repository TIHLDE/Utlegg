"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, set } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { nb } from "date-fns/locale";
import { toast } from "sonner";
import FileUpload from "./file-upload";
import { useState } from "react";

const Schema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    amount: z.string(),
    date: z.date(),
    description: z.string().nonempty(),
    accountNumber: z.string().length(11),
    receipt: z.string().url(),
});

interface SendFormProps {
    userToken: string;
};

export default function SendForm({
    userToken
}: SendFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    const form = useForm<z.infer<typeof Schema>>({
        resolver: zodResolver(Schema),
    });

    const onSubmit = async (values: z.infer<typeof Schema>) => {
        setIsLoading(true);
        try {
            const data = new FormData();
            data.append("name", values.name);
            data.append("email", values.email);
            data.append("amount", values.amount);
            data.append("date", values.date.toISOString());
            data.append("description", values.description);
            data.append("accountNumber", values.accountNumber);
            data.append("receipt", values.receipt);

            const response = await fetch("/api/send", {
                method: "POST",
                body: data
            });

            if (!response.ok) {
                throw new Error("Det skjedde en feil. Prøv igjen senere.");
            }
            
            toast.success("Utleggskjemaet ble sendt inn!");
            form.reset({
                name: "",
                email: "",
                amount: "",
                date: set(new Date(), { hours: 0, minutes: 0, seconds: 0 }),
                description: "",
                accountNumber: "",
                receipt: ""
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

    return (
        <Card className="w-full max-w-5xl">
            <CardHeader>
                <CardTitle>
                    Send utleggskjema til TIHLDE!
                </CardTitle>
                <CardDescription>
                    Fyll ut skjemaet og last opp kvitteringer, for å få refundert pengene.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        className="space-y-6"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
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
                                            <Input
                                                {...field}
                                                required
                                            />
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
                                            <Input
                                                {...field}
                                                required
                                            />
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
                                                {...field}
                                                required
                                                type="number"
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
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
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
                                    <FormDescription>
                                        Dato for utlegget
                                    </FormDescription>
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
                                            className="resize-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        /> 

                        <FileUpload
                            form={form}
                            name="receipt"
                            userToken={userToken}
                        /> 

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            variant="action"
                            size="lg"
                        >
                            {isLoading
                                ? <Loader2 className="animate-spin" />
                                : "Send inn utleggskjema"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};