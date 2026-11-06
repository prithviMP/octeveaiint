"use client";

import { Rocket } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { TextField } from "@/components/ui/TextField";
import { NAME_MAX_LENGTH, useInterviewDraft, validateName } from "@/hooks/useInterviewDraft";

/** Quick start: type a name here and jump straight to subject selection. */
export function CtaStrip() {
  const router = useRouter();
  const { update } = useInterviewDraft();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <GlassPanel tier="card" className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <Badge tone="white" mono dot="warning" className="w-fit">
          Quick start
        </Badge>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Ready to test your instincts?</h2>
        <p className="text-sm text-slate-500">Enter your name and pick your subjects next.</p>
      </div>
      <form
        className="flex w-full flex-col gap-2 sm:flex-row sm:items-start md:max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          const problem = validateName(name);
          setError(problem);
          if (problem) return;
          update({ name: name.trim() });
          router.push("/subjects");
        }}
      >
        <TextField
          value={name}
          onValueChange={(value) => {
            setName(value);
            if (error) setError(null);
          }}
          placeholder="Your name, e.g. Rahul"
          aria-label="Your name"
          maxLength={NAME_MAX_LENGTH}
          error={error}
          size="md"
          className="flex-1"
          autoComplete="name"
        />
        <Button type="submit" trailingIcon={Rocket}>
          Launch
        </Button>
      </form>
    </GlassPanel>
  );
}
