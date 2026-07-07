export function MarcaDagua() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-40 flex flex-wrap content-around justify-around overflow-hidden opacity-10"
    >
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="-rotate-[30deg] whitespace-nowrap text-2xl font-bold text-neutral-900"
        >
          PetBio — prévia
        </span>
      ))}
    </div>
  );
}
