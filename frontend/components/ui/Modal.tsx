"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Id of the element that labels the dialog. */
  labelledBy: string;
  className?: string;
  children: ReactNode;
}

/** Glass dialog over a blurred backdrop. Uses the native <dialog> for focus trapping and Escape handling. */
export function Modal({ open, onClose, labelledBy, className, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    if (!dialog.open) dialog.showModal();
    // Hidden routes stay mounted under cacheComponents; an open modal would keep the next page inert.
    return () => dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "glass-deck m-auto w-[min(92vw,30rem)] rounded-[2rem] bg-white/80 p-0 text-slate-800 backdrop:bg-slate-900/25 backdrop:backdrop-blur-md open:animate-fade-up",
        className,
      )}
    >
      {open && <div className="p-7 sm:p-8">{children}</div>}
    </dialog>
  );
}
