// ============================================================
// HYTICON — Página 404
// ============================================================

import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1f5f9]">
          <FileQuestion className="h-8 w-8 text-[#94a3b8]" />
        </div>
        <h1 className="text-4xl font-bold text-[#0f172a]">404</h1>
        <p className="mt-2 text-sm font-medium text-[#0f172a]">Página no encontrada</p>
        <p className="mt-1 text-sm text-[#475569]">
          La dirección que buscas no existe o fue movida.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" size="md" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate(ROUTES.DASHBOARD)}>
            Ir al inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
