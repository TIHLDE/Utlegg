"use client";

import Logo from "@/app/_components/logo";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth/actions";
import { SigninInputSchema } from "@/lib/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
        router.push("/");
      } catch {
        toast.error("Det oppstod en feil under innlogging. Prøv igjen senere.");
      } finally {
        setStatus("idle");
      }
    };

    return (
        <div className="max-w-md w-auto mx-auto space-y-12">
            <div className="space-y-8">
                <div
                    className="flex justify-center items-center shrink-0 ring-1 ring-indigo-950 shadow-xl rounded-xl w-12 h-12 shadow-indigo-900/30 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 text-white mx-auto"
                >
                    <Logo className="w-8 h-8" />
                </div>

                <div className="space-y-2 text-center">
                    <h1 className="text-3xl lg:text-4xl font-bold">
                        Velkommen tilbake!
                    </h1>
                    <p>
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
};