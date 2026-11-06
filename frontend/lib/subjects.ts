import {
  Atom,
  Boxes,
  Braces,
  Coffee,
  FileCode2,
  Layers,
  Network,
  Server,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface SubjectMeta {
  label: string;
  tagline: string;
  icon: LucideIcon;
}

const SUBJECT_META: Record<string, SubjectMeta> = {
  DSA: { label: "DSA", tagline: "Arrays, trees, graphs, and dynamic programming", icon: Network },
  LLD: { label: "LLD", tagline: "Design patterns, SOLID, and class modelling", icon: Boxes },
  HLD: { label: "HLD", tagline: "Scalability, caching, sharding, and availability", icon: Server },
  PYTHON: { label: "Python", tagline: "GIL, generators, decorators, and memory model", icon: FileCode2 },
  JAVA: { label: "Java", tagline: "JVM, garbage collection, and concurrency", icon: Coffee },
  JAVASCRIPT: { label: "JavaScript", tagline: "Event loop, closures, and prototypes", icon: Braces },
  REACT: { label: "React", tagline: "Hooks, reconciliation, and rendering", icon: Atom },
  NEXTJS: { label: "Next.js", tagline: "App Router, server components, and caching", icon: Layers },
  FASTAPI: { label: "FastAPI", tagline: "Pydantic, dependency injection, and async", icon: Zap },
};

const FALLBACK: SubjectMeta = { label: "", tagline: "Technical fundamentals", icon: FileCode2 };

export function getSubjectMeta(code: string): SubjectMeta {
  return SUBJECT_META[code] ?? { ...FALLBACK, label: code };
}

export function subjectLabel(code: string): string {
  return getSubjectMeta(code).label;
}
