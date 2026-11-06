"use client";

import { ArrowRight, CircleAlert, CircleCheck, Timer } from "lucide-react";
import { formatDuration } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface SubmitConfirmModalProps {
  open: boolean;
  answered: number;
  total: number;
  elapsedMs: number;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function SubmitConfirmModal({
  open,
  answered,
  total,
  elapsedMs,
  submitting,
  error,
  onClose,
  onConfirm,
}: SubmitConfirmModalProps) {
  return (
    <Modal open={open} onClose={submitting ? () => {} : onClose} labelledBy="submit-title">
      <div className="flex flex-col items-center gap-5 text-center">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          <CircleCheck size={13} aria-hidden />
          Final confirmation
        </span>
        <div className="flex flex-col gap-2">
          <h2 id="submit-title" className="text-xl font-semibold tracking-tight text-slate-900">
            Submit your interview?
          </h2>
          <p className="text-sm leading-relaxed text-slate-600">
            You answered {answered} of {total} questions. Once submitted, your score is calculated and your answers
            can&apos;t be changed.
          </p>
        </div>
        <div className="glass-inset flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-slate-600">
          <Timer size={13} aria-hidden />
          Time spent: <span className="font-mono font-semibold text-slate-800">{formatDuration(elapsedMs)}</span>
        </div>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 text-sm text-rose-600">
            <CircleAlert size={14} aria-hidden />
            {error}
          </p>
        )}
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-center">
          <Button variant="text" onClick={onClose} disabled={submitting}>
            Keep reviewing
          </Button>
          <Button onClick={onConfirm} loading={submitting} trailingIcon={ArrowRight} size="lg">
            Submit and view results
          </Button>
        </div>
      </div>
    </Modal>
  );
}
