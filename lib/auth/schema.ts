import { z } from "zod";

export const SigninInputSchema = z.object({
    username: z.string(),
    password: z.string(),
});