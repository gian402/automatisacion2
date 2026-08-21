import { useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
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
      background: '#0a0e1a',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        animation: 'slideUp .3s ease both',
        maxWidth: '400px',
        width: '100%',
      }}>
        {/* Decorative 404 */}
        <div style={{
          position: 'relative',
          marginBottom: '8px',
          userSelect: 'none',
        }}>
          <span style={{
            fontSize: 'clamp(80px, 20vw, 140px)',
            fontWeight: 800,
            color: 'rgba(99,102,241,.08)',
            lineHeight: 1,
            letterSpacing: '-6px',
            fontVariantNumeric: 'tabular-nums',
            display: 'block',
          }}>
            404
          </span>

          {/* Icon overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'rgba(99,102,241,.12)',
            border: '1px solid rgba(99,102,241,.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            boxShadow: '0 0 20px rgba(99,102,241,.2)',
          }}>
            <FileQuestion style={{ width: '24px', height: '24px' }} />
          </div>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#f9fafb',
          marginBottom: '8px',
          letterSpacing: '-.3px',
        }}>
          Página no encontrada
        </h1>

        {/* Description */}
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}>
          La dirección que buscas no existe o fue movida.
          <br />
          Verifica la URL o regresa al inicio.
        </p>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          flexWrap: 'wrap',
        }}>
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            style={{ gap: '6px' }}
          >
            <ArrowLeft style={{ width: '14px', height: '14px' }} />
            Volver
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(ROUTES.DASHBOARD)}
            style={{ gap: '6px' }}
          >
            <Home style={{ width: '14px', height: '14px' }} />
            Ir al inicio
          </Button>
        </div>

        {/* Subtle branding */}
        <div style={{
          marginTop: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          opacity: 0.35,
        }}>
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '9px',
            fontWeight: 800,
            color: '#fff',
          }}>H</div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '.05em' }}>
            HYTICON
          </span>
        </div>
      </div>
    </div>
  )
}
