export function Linha({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null;
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2 text-[13px] first:border-t-0">
      <span className="text-ink-soft">{label}</span>
      <span className="text-right font-bold text-ink">{valor}</span>
    </div>
  );
}
