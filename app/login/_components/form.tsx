"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth/actions";
import { SigninInputSchema } from "@/lib/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, Loader2 } from "lucide-react";
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
        console.log("INSIDE LOGIN FUNCTION: ", formData.get("username"), formData.get("password"));
        const response = await login(formData);
        console.log("RESPONSE: ", response)
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