"use client";

import { SubjectCard } from "@/components/subjects/SubjectCard";
import type { SubjectCategory } from "@/types/api";

interface SubjectCategorySectionProps {
  category: SubjectCategory;
  selected: string[];
  onToggle: (code: string) => void;
}

export function SubjectCategorySection({ category, selected, onToggle }: SubjectCategorySectionProps) {
  const count = category.subjects.length;
  return (
    <section aria-labelledby={`category-${category.category}`} className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <h2 id={`category-${category.category}`} className="text-sm font-semibold tracking-tight text-slate-800">
          {category.category}
        </h2>
        <span className="font-mono text-[11px] text-slate-400">
          {count} {count === 1 ? "subject" : "subjects"}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {category.subjects.map((subject) => (
          <SubjectCard
            key={subject.code}
            subject={subject}
            selected={selected.includes(subject.code)}
            onToggle={() => onToggle(subject.code)}
          />
        ))}
      </div>
    </section>
  );
}
