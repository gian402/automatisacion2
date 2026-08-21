import { useNavigate } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routes'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
    }}>
      <div style={{ textAlign: 'center', padding: '24px' }}>
        {/* Icono */}
        <div style={{
          margin: '0 auto 24px',
          width: '64px', height: '64px',
          borderRadius: '16px',
          background: 'rgba(255,255,255,.05)',
          border: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#484f58',
        }}>
          <FileQuestion style={{ width: '28px', height: '28px' }} />
        </div>

        {/* Número */}
        <p style={{
          fontSize: '72px', fontWeight: 800,
          color: 'rgba(255,255,255,.06)',
          lineHeight: 1, letterSpacing: '-4px',
          marginBottom: '16px',
          fontVariantNumeric: 'tabular-nums',
        }}>404</p>

        <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f6fc', marginBottom: '8px' }}>
          Página no encontrada
        </h1>
        <p style={{ fontSize: '13px', color: '#484f58', marginBottom: '28px' }}>
          La dirección que buscas no existe o fue movida.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Button variant="secondary" size="md" onClick={() => navigate(-1)}>
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
