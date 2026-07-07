import type { Foto } from "@/lib/types/card";

export function Galeria({ fotos, limite }: { fotos: Foto[]; limite: number }) {
  const visiveis = fotos.slice(0, limite);
  if (visiveis.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-2">
      {visiveis.map((foto, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={foto.url + i}
          src={foto.url}
          alt={foto.alt ?? ""}
          className="aspect-square w-full rounded-lg object-cover"
        />
      ))}
    </div>
  );
}
