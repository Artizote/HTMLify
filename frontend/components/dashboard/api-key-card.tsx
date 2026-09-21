"use client";

import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DeleteAlertDialog } from "@/components/dashboard/delete-alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { revokeApiKey } from "@/lib/modules/user/user.api";

export function ApiKeyCard({ apiKey }: { apiKey: string }) {
  const [key, setKey] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(key);
      setCopied(true);
      toast.success("API key copied");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy API key");
    }
  };

  const handleRevoke = async () => {
    const { data, error } = await revokeApiKey();
    if (error || !data) {
      toast.error(error || "Failed to revoke API key");
      return false;
    }
    setKey(data.api_key);
    setVisible(false);
    return true;
  };

  return (
    <Card className="w-full max-w-4xl border-border/50 bg-background/50 shadow-lg backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Your API key</CardTitle>
        <CardDescription>
          Use this key to authenticate requests to the HTMLify API. Keep it
          secret. Revoking generates a new key and immediately invalidates the
          current one.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 h-fit">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="h-11 min-w-0 flex-1">
            <InputGroupAddon>
              <KeyRound />
            </InputGroupAddon>
            <InputGroupInput
              readOnly
              value={key}
              type={visible ? "text" : "password"}
              className="font-mono"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                type="button"
                aria-label={visible ? "Hide API key" : "Show API key"}
                onClick={() => setVisible((prev) => !prev)}
              >
                {visible ? <EyeOff /> : <Eye />}
              </InputGroupButton>
              <InputGroupButton
                type="button"
                aria-label="Copy API key"
                onClick={handleCopy}
              >
                {copied ? <Check /> : <Copy />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>

          <DeleteAlertDialog
            title="Revoke this API key?"
            description="This cannot be undone. The current key will stop working immediately and a new key will be issued."
            successMessage="API key revoked"
            onConfirm={handleRevoke}
            trigger={
              <Button variant="destructive" className="sm:shrink-0">
                Revoke key
              </Button>
            }
          />
        </div>

        <p className="text-sm text-muted-foreground">
          Anyone with this key can act as you. Revoke it if it leaks.
        </p>
      </CardContent>
    </Card>
  );
}
