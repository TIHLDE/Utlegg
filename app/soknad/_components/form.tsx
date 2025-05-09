"use client";

import FileUpload from "@/app/_components/upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Membership, User } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { File, FormInput, Loader2, Trash } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const Schema = z.object({
    name: z.string({ required_error: "Du må fylle inn navn" }).nonempty(),
    email: z.string({ required_error: "Du må fylle inn e-post" }).email(),
    purpose: z.string({ required_error: "Du må fylle inn formål" }).nonempty(),
    description: z.string({ required_error: "Du må fylle inn beskrivelse" }).nonempty(),
    reason: z.string({ required_error: "Du må fylle inn begrunnelse" }).nonempty(),
    amount: z.number({ required_error: "Du må fylle inn beløp" }).positive(),
    summary: z.string().optional(),
    group: z.string({ required_error: "Du må velge gruppe" }).nonempty(),
});

interface FormProps {
    user: User;
    memberships: Membership[];
    userToken: string;
};

export default function ApplicationForm({
    user,
    memberships,
    userToken,
}: FormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [files, setFiles] = useState<string[]>([]);

    const form = useForm<z.infer<typeof Schema>>({
        resolver: zodResolver(Schema),
        defaultValues: {
            name: user?.first_name + " " + user?.last_name || "",
            email: user?.email || "",
        }
    });

    const onSubmit = async (values: z.infer<typeof Schema>) => {
        setIsLoading(true);
        try {
            if (files.length === 0) {
                toast.error("Du må laste opp minst én fil med budsjett.");
                return;
            }

            const data = new FormData();
            data.append("name", values.name);
            data.append("email", values.email);
            data.append("purpose", values.purpose);
            data.append("description", values.description);
            data.append("reason", values.reason);
            data.append("amount", values.amount.toString());
            data.append("summary", values.summary || "");
            data.append("group", values.group);
            data.append("files", JSON.stringify(files));
            data.append("username", user?.user_id || "");
            data.append("study", user?.study.group.name || "");
            data.append("year", user?.studyyear.group.name || "");

            const response = await fetch("/api/application", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error("Noe gikk galt. Prøv igjen senere.");
            }

            toast.success("Søknaden ble sendt inn!");
            setFiles([]);
            form.reset();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Det skjedde en feil. Prøv igjen senere.");
            }
        } finally {
            setIsLoading(false);
        };
    };

    const removeFile = (url: string) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== url));
    };
    
    return (
        <Card className="w-full max-w-5xl">
            <CardHeader>
                <CardTitle>
                    Send inn søknad om økonomisk støtte til HS!
                </CardTitle>
                <CardDescription>
                    Fyll ut skjemaet under for å sende inn en søknad. OBS! TIHLDE støtter ikke søknader om merch eller annet som blir egeneie.
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
                                                className="bg-background"
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
                                name="group"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gruppe</FormLabel>
                                        <Select
                                            onValueChange={field.onChange} 
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Velg en gruppe" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {memberships.map((membership, index) => (
                                                    <SelectItem
                                                        key={index}
                                                        value={membership.group.name}
                                                    >
                                                        {membership.group.name}
                                                    </SelectItem>
                                                ))}
                                                <SelectItem value="Ingen gruppe">
                                                    Ingen gruppe
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Velg gruppen du ønsker å søke støtte for. Hvis du ikke er medlem av noen gruppe, kan du velge "Ingen gruppe".
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Totalt søknadsbeløp <span className="text-red-500">*</span>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                className="bg-background"
                                                {...field}
                                                required
                                                type="number"
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value);
                                                    field.onChange(isNaN(value) ? 0 : value);
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
                            name="purpose"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Formål med søknaden <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            required
                                            className="resize-none min-h-40"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Skriv en kort forklaring om hvorfor dere søker støtte.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Beskrivelse av arrangement/produkt <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            required
                                            className="resize-none min-h-40"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Beskriv arrangementet/produktet dere ønsker å søke støtte til. Dersom det er et arrangement, inkludér hvor mange deltakere som er tiltenkt, i tillegg til andre viktige detaljer.
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Begrunnelse for støtte <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            required
                                            className="resize-none min-h-40"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Hvorfor bør søknaden godkjennes?
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="reason"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Oppsummering
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            required
                                            className="resize-none min-h-40"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <FormDescription>
                                        Eventuelt om du har noe ekstra å legge til
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        <FileUpload
                            userToken={userToken}
                            setFiles={setFiles}
                            title="Legg ved budsjett"
                            description="Legg ved en eller flere filer som viser budsjett for arrangementet/produktet dere søker støtte til. Dette kan være en PDF, Excel-fil eller lignende."
                        />

                        {files.length > 0 && (
                            <div className="w-full space-y-2">
                                {files.map((file, index) => (
                                    <div
                                        className="flex items-center justify-between border p-4 rounded-lg"
                                        key={index}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 rounded-lg bg-card bg-gray-700">
                                                <File className="text-white" />
                                            </div>

                                            <h1 className="font-medium text-sm truncate max-w-xs lg:max-w-3xl">
                                                {file}
                                            </h1>
                                        </div>

                                        <button
                                            onClick={() => removeFile(file)}
                                            type="button"
                                            className="p-1 bg-red-500 rounded-lg"
                                        >
                                            <Trash className="text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="pt-4 md:pt-6 flex justify-end">
                            <Button
                                className="w-full md:w-auto"
                                type="submit"
                                disabled={isLoading}
                                variant="action"
                                size="lg"
                            >
                                {isLoading
                                    ? <Loader2 className="animate-spin" />
                                    : "Send inn søknad"
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>   
    )
};