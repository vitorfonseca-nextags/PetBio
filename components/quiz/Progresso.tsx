export function Progresso({ atual, total }: { atual: number; total: number }) {
  return (
    <div className="space-y-1 py-4">
      <p className="text-xs font-medium text-neutral-500">
        Passo {atual + 1} de {total}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full rounded-full bg-emerald-700 transition-all"
          style={{ width: `${((atual + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
