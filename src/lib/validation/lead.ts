import { z } from "zod";

// "Talk to us" request — the input is deliberately forgiving: the only hard
// requirement is a way to reach the person back. Error messages are i18n
// keys resolved by the form.
export const talkRequestSchema = z.object({
  surface: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  contactChannel: z.enum(["phone", "line", "email"]),
  contactValue: z.string().trim().min(3, "contactRequired").max(200),
});

export type TalkRequestInput = z.infer<typeof talkRequestSchema>;
