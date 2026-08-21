// ============================================================
// HYTICON — PageLoading
// Pantalla de carga mientras se verifica sesión o carga chunk
// ============================================================

export function PageLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e2e8f0] border-t-[#2563eb]" />
        <p className="text-sm text-[#94a3b8]">Cargando…</p>
      </div>
    </div>
  )
}
