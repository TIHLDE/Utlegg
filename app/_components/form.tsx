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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { nb } from "date-fns/locale";
import { toast } from "sonner";

const Schema = z.object({
    name: z.string().nonempty(),
    email: z.string().email(),
    amount: z.string(),
    date: z.date(),
    description: z.string().nonempty(),
    accountNumber: z.string().length(11),
    // receipt: z.array(z.string()),
});

export default function SendForm() {
    const form = useForm<z.infer<typeof Schema>>({
        resolver: zodResolver(Schema),
    });

    const onSubmit = async (values: z.infer<typeof Schema>) => {
        try {
            const data = new FormData();
            data.append("name", values.name);
            data.append("email", values.email);
            data.append("amount", values.amount);
            data.append("date", values.date.toISOString());
            data.append("description", values.description);
            data.append("accountNumber", values.accountNumber);

            const response = await fetch("/api/send", {
                method: "POST",
                body: data
            });

            if (!response.ok) {
                throw new Error("Det skjedde en feil. Prøv igjen senere.");
            }
            
            toast.success("Utleggskjemaet ble sendt inn!");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Det skjedde en feil. Prøv igjen senere.");
            }
        };
    };

    return (
        <Card className="w-full max-w-3xl">
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

                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Send inn utleggskjema
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};