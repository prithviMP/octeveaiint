"use client";

import { IdCard, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { IconCapsule } from "@/components/ui/IconCapsule";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextField } from "@/components/ui/TextField";
import { WizardActionBar } from "@/components/layout/WizardActionBar";
import { WizardStepper } from "@/components/layout/WizardStepper";
import { NAME_MAX_LENGTH, useInterviewDraft, validateName } from "@/hooks/useInterviewDraft";

export function NameStep() {
  const router = useRouter();
  const { draft, update } = useInterviewDraft();
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? validateName(draft.name) : null;

  return (
    <div className="flex flex-col gap-8">
      <WizardStepper current={1} />
      <form
        id="name-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (validateName(draft.name)) return;
          update({ name: draft.name.trim() });
          router.push("/subjects");
        }}
        className="mx-auto flex w-full max-w-xl flex-col gap-6"
      >
        <GlassPanel tier="deck" className="flex flex-col gap-8 p-6 sm:p-10">
          <SectionHeader
            as="h1"
            size="lg"
            eyebrow="Candidate identity"
            eyebrowDot="accent"
            title="What should we call you?"
            description="Your name personalises the interview session and appears on your results."
            action={<IconCapsule icon={IdCard} className="hidden md:inline-flex md:self-start" />}
          />
          <TextField
            label="Full name or handle"
            value={draft.name}
            onValueChange={(name) => update({ name })}
            placeholder="e.g. Rahul Sharma"
            icon={User}
            maxLength={NAME_MAX_LENGTH}
            showCounter
            clearable
            autoFocus
            autoComplete="name"
            hint="1 to 100 characters."
            error={error}
          />
          <div className="glass-inset flex gap-3 rounded-2xl p-4">
            <Lock size={16} className="mt-0.5 shrink-0 text-slate-500" aria-hidden />
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-medium text-slate-800">No account needed</span>
              <span className="text-slate-500">
                No email or phone number. Your setup choices are kept only in this browser.
              </span>
            </div>
          </div>
        </GlassPanel>
        <WizardActionBar
          summary={draft.name.trim() ? `Practising as ${draft.name.trim()}` : "Step 1 of 3"}
          back={{ href: "/", label: "Home" }}
          next={{ label: "Continue to subjects", type: "submit", form: "name-form" }}
        />
      </form>
    </div>
  );
}
