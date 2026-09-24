"use client";

import { useState, useTransition } from "react";
import { LifeBuoy, Phone, Send, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { submitTalkRequest } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DSIGN_LINE_URL, DSIGN_PHONE_TEL } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Channel = "phone" | "line" | "email";

/**
 * The escape hatch behind every "Not sure? Talk to us" link (plan D19).
 * Framed as help, never a sell. The request is persisted server-side before
 * any email goes out, so it can never silently vanish — and if the email
 * notification fails, the dialog falls back to "call us now".
 */
export function TalkToUs({
  open,
  onOpenChange,
  surface,
  defaultContact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surface?: string;
  defaultContact?: string;
}) {
  const t = useTranslations("Guidance.talkDialog");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<Channel>("phone");
  const [contact, setContact] = useState(defaultContact ?? "");
  const [state, setState] = useState<
    "form" | "sent" | "sentNoEmail" | "error"
  >("form");

  const channels: Channel[] = ["phone", "line", "email"];

  function submit() {
    startTransition(async () => {
      const res = await submitTalkRequest({
        surface,
        message: message || undefined,
        contactChannel: channel,
        contactValue: contact,
      });
      if (res.success) {
        setState(res.data?.emailed ? "sent" : "sentNoEmail");
        setMessage("");
      } else {
        setState("error");
      }
    });
  }

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) setState("form");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <span className="mb-1 grid h-10 w-10 place-items-center rounded-full bg-info-soft text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <DialogTitle className="font-heading">
            {state === "sent" || state === "sentNoEmail"
              ? t("successTitle")
              : t("title")}
          </DialogTitle>
          <DialogDescription>
            {state === "form" && t("body")}
            {state === "sent" && t("successBody")}
            {state === "sentNoEmail" && t("successCallUs")}
            {state === "error" && t("errorBody")}
          </DialogDescription>
        </DialogHeader>

        {state === "form" ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="talk-message">{t("messageLabel")}</Label>
              <Textarea
                id="talk-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                rows={3}
                maxLength={2000}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("channelLabel")}</Label>
              <div className="flex gap-2">
                {channels.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChannel(c)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-1.5 text-sm transition-colors",
                      channel === c
                        ? "border-primary bg-info-soft font-medium text-brand"
                        : "text-muted-foreground hover:border-primary/50",
                    )}
                  >
                    {t(`channel_${c}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="talk-contact">{t("contactLabel")}</Label>
              <Input
                id="talk-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={submit}
                disabled={pending || contact.trim().length < 3}
                className="flex-1"
              >
                <Send className="mr-2 h-4 w-4" />
                {pending ? t("submitting") : t("submit")}
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <a href={DSIGN_PHONE_TEL}>
                  <Phone className="mr-2 h-4 w-4" />
                  {t("call")}
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant={state === "sent" ? "outline" : "default"}
              asChild
              className="flex-1"
            >
              <a href={DSIGN_PHONE_TEL}>
                <Phone className="mr-2 h-4 w-4" />
                {t("call")}
              </a>
            </Button>
            {DSIGN_LINE_URL ? (
              <Button variant="outline" asChild className="flex-1">
                <a href={DSIGN_LINE_URL} target="_blank" rel="noreferrer">
                  LINE
                </a>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
            >
              {t("close")}
            </Button>
          </div>
        )}

        <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
          {t("footer")}
        </p>
      </DialogContent>
    </Dialog>
  );
}
