/** Soft blurred color fields behind every page; the glass surfaces pick these up. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-32 left-1/4 size-[38rem] rounded-full bg-blue-200/50 blur-[130px]" />
      <div className="absolute top-1/3 -left-20 size-[32rem] rounded-full bg-indigo-100/60 blur-[120px]" />
      <div className="absolute top-1/2 right-10 size-[42rem] rounded-full bg-slate-300/40 blur-[140px]" />
      <div className="absolute -bottom-20 left-1/3 size-[36rem] rounded-full bg-cyan-100/50 blur-[130px]" />
    </div>
  );
}
