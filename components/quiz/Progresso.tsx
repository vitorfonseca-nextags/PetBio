export function Progresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="space-y-1.5 py-4">
      <p className="text-xs font-bold text-ink-soft">
        Passo {atual + 1} de {total}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
          style={{ width: `${((atual + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
