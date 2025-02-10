"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth/actions";
import { SigninInputSchema } from "@/lib/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";


export default function LoginForm() {
    const [status, setStatus] = useState<"idle" | "pending" | "error">("idle");
    const [disabled, setDisabled] = useState<boolean>(false);
    const router = useRouter();
  
    const form = useForm<z.infer<typeof SigninInputSchema>>({
      resolver: zodResolver(SigninInputSchema)
    });
  
    const onSubmit = async (values: z.infer<typeof SigninInputSchema>) => {
      try {
        setStatus("pending");
        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("password", values.password);
        const response = await login(formData);
        if (response.formError) {
          toast.error(response.formError);
          form.reset({
            password: "",
            username: ""
          });
          return;
        }
        toast.success("Du er nå logget inn.");
        setDisabled(true);
        router.push("/utlegg");
      } catch (error) {
        toast.error("Det oppstod en feil under innlogging. Prøv igjen senere.");
      } finally {
        setStatus("idle");
      }
    };

    return (
        <div className="max-w-md w-auto mx-auto space-y-12">
            <div className="space-y-8">
                <div
                    className="flex justify-center items-center shrink-0 bg-gradient-to-br ring-1 shadow-xl rounded-xl w-12 h-12 shadow-blue-500/30 from-sky-300/80 to-blue-400/80 text-blue-500 ring-blue-500/30 mx-auto"
                >
                </div>

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold">
                        Velkommen tilbake!
                    </h1>
                    <p className="">
                        Logg inn med din TIHLDE konto
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Brukernavn
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
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Passord
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        required
                                        type="password"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={disabled || status === "pending"}
                        className="w-full"
                        size="lg"
                        variant="action"
                    >
                        {status === "pending"
                            ? <Loader2 className="animate-spin" />
                            : "Logg inn"
                        }
                    </Button>
                </form>
            </Form>
        </div>
    );

    
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    Logg inn
                </CardTitle>
                <CardDescription>
                    Logg inn med din TIHLDE konto
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Brukernavn
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
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Passord
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            required
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            disabled={disabled || status === "pending"}
                        >
                            {status === "pending"
                                ? <Loader2 className="animate-spin" />
                                : "Logg inn"
                            }
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};