import { OfertaForm } from "@/components/ofertas/OfertaForm";
import { Suspense } from "react";

export default function NovaOfertaPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Nova Oferta</h1>
      <p className="text-muted-foreground">Cadastre manualmente uma oferta para acompanhar no seu catálogo.</p>
      <Suspense fallback={<div>Carregando formulário...</div>}>
        <OfertaForm />
      </Suspense>
    </div>
  );
}
