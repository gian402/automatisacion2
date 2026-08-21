import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/router/routes'

const schema = z.object({
  email:    z.string().min(1, 'Requerido').email('Correo inválido'),
  password: z.string().min(1, 'Requerido').min(6, 'Mínimo 6 caracteres'),
})
type Form = z.infer<typeof schema>

export default function LoginPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [showPass, setShowPass] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? ROUTES.DASHBOARD

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: Form) => {
    setApiError(null)
    try {
      await login(data)
      navigate(from, { replace: true })
    } catch {
      setApiError('Correo o contraseña incorrectos.')
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        @keyframes lp-spin  { to { transform: rotate(360deg); } }
        @keyframes lp-in    { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lp-fade  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes lp-glow  { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lp {
          display: flex;
          height: 100vh;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          background: #080c14;
        }

        /* ─── Panel izquierdo ─── */
        .lp-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          animation: lp-fade .8s ease both;
        }
        .lp-left img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transform: scale(1.03);
          transition: transform 8s ease;
        }
        .lp-left:hover img { transform: scale(1); }
        .lp-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, transparent 55%, #080c14 100%);
          pointer-events: none;
        }

        /* Logo sobre imagen */
        .lp-logo {
          position: absolute;
          top: 28px; left: 28px;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: lp-in .6s .1s ease both;
        }
        .lp-logo-icon {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: #2563eb;
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 800; color: #fff;
          box-shadow: 0 0 16px rgba(37,99,235,.5);
        }
        .lp-logo-name {
          font-size: 12px; font-weight: 700;
          color: rgba(255,255,255,.9);
          letter-spacing: .16em;
          text-transform: uppercase;
          text-shadow: 0 1px 6px rgba(0,0,0,.6);
        }

        /* ─── Panel derecho ─── */
        .lp-right {
          width: 400px;
          flex-shrink: 0;
          position: relative;
          background: #080c14;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 48px;
          height: 100vh;
          z-index: 2;
        }
        .lp-right::before {
          content: '';
          position: absolute;
          top: -80px; left: 50%;
          transform: translateX(-50%);
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%);
          pointer-events: none;
          animation: lp-glow 4s ease-in-out infinite;
        }
        .lp-right::after {
          content: '';
          position: absolute;
          left: 0; top: 15%; bottom: 15%;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(37,99,235,.3) 40%, rgba(37,99,235,.3) 60%, transparent);
        }

        .lp-form-wrap {
          position: relative;
          z-index: 1;
          animation: lp-in .65s .25s ease both;
        }

        .lp-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .lp-title {
          font-size: 30px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 8px;
        }
        .lp-sub {
          font-size: 13px;
          color: #334155;
          margin-bottom: 36px;
          font-weight: 400;
        }

        .lp-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 18px;
        }
        .lp-label {
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: .07em;
        }
        .lp-input-wrap { position: relative; }
        .lp-input {
          width: 100%;
          height: 46px;
          padding: 0 14px;
          font-size: 14px;
          color: #e2e8f0;
          font-family: inherit;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 10px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .lp-input::placeholder { color: rgba(100,116,139,.5); }
        .lp-input:hover { border-color: rgba(255,255,255,.12); }
        .lp-input:focus {
          border-color: rgba(37,99,235,.7);
          background: rgba(37,99,235,.05);
          box-shadow: 0 0 0 3px rgba(37,99,235,.12), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .lp-input.err { border-color: rgba(239,68,68,.4); }
        .lp-input.err:focus {
          border-color: rgba(239,68,68,.7);
          box-shadow: 0 0 0 3px rgba(239,68,68,.1);
        }
        .lp-input.pr { padding-right: 46px; }

        .lp-eye {
          position: absolute;
          right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none;
          cursor: pointer;
          color: rgba(100,116,139,.6);
          display: flex; align-items: center;
          padding: 3px;
          transition: color .15s;
        }
        .lp-eye:hover { color: #94a3b8; }

        .lp-ferr {
          font-size: 11px;
          color: #f87171;
          font-weight: 500;
        }

        .lp-alert {
          display: flex; align-items: center; gap: 9px;
          padding: 11px 14px;
          background: rgba(239,68,68,.07);
          border: 1px solid rgba(239,68,68,.18);
          border-radius: 10px;
          margin-bottom: 18px;
        }
        .lp-alert-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #ef4444;
          flex-shrink: 0;
          box-shadow: 0 0 6px rgba(239,68,68,.8);
        }
        .lp-alert p { font-size: 13px; color: #fca5a5; }

        .lp-btn {
          width: 100%;
          height: 48px;
          border-radius: 10px;
          border: none;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 6px;
          color: #fff;
          background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%);
          box-shadow: 0 4px 20px rgba(37,99,235,.35), inset 0 1px 0 rgba(255,255,255,.1);
          transition: all .2s ease;
          position: relative;
          overflow: hidden;
        }
        .lp-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.08) 0%, transparent 60%);
          pointer-events: none;
        }
        .lp-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(37,99,235,.45), inset 0 1px 0 rgba(255,255,255,.12);
        }
        .lp-btn:active:not(:disabled) {
          transform: scale(.99) translateY(0);
          box-shadow: 0 4px 16px rgba(37,99,235,.3);
        }
        .lp-btn:disabled {
          background: rgba(30,41,59,.8);
          color: #334155;
          box-shadow: none;
          cursor: not-allowed;
        }

        .lp-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: lp-spin .65s linear infinite;
        }

        .lp-footer {
          margin-top: 28px;
          font-size: 11px;
          color: rgba(30,41,59,.9);
          letter-spacing: .02em;
        }

        @media (max-width: 768px) {
          .lp-left { display: none; }
          .lp-right { width: 100%; padding: 0 28px; }
        }
      `}</style>

      <div className="lp">

        <div className="lp-left">
          <img src="/login-fondo.jpg" alt="" />
          <div className="lp-logo">
            <div className="lp-logo-icon">H</div>
            <span className="lp-logo-name">HYTICON</span>
          </div>
        </div>

        <div className="lp-right">
          <div className="lp-form-wrap">

            <p className="lp-eyebrow">Bienvenido</p>
            <h1 className="lp-title">Iniciar sesión</h1>
            <p className="lp-sub">Accede a tu cuenta corporativa</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>

              <div className="lp-field">
                <label htmlFor="email" className="lp-label">Correo electrónico</label>
                <div className="lp-input-wrap">
                  <input
                    id="email" type="email"
                    autoComplete="email" autoFocus
                    placeholder="usuario@hyticon.com"
                    className={`lp-input${errors.email ? ' err' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <span className="lp-ferr">{errors.email.message}</span>}
              </div>

              <div className="lp-field">
                <label htmlFor="password" className="lp-label">Contraseña</label>
                <div className="lp-input-wrap">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`lp-input pr${errors.password ? ' err' : ''}`}
                    {...register('password')}
                  />
                  <button type="button" tabIndex={-1} className="lp-eye"
                    onClick={() => setShowPass(v => !v)}
                    aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <span className="lp-ferr">{errors.password.message}</span>}
              </div>

              {apiError && (
                <div className="lp-alert" role="alert">
                  <span className="lp-alert-dot" />
                  <p>{apiError}</p>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="lp-btn">
                {isSubmitting
                  ? <><span className="lp-spinner" />Verificando…</>
                  : <>Entrar <ArrowRight size={15} /></>}
              </button>

            </form>

            <p className="lp-footer">© {new Date().getFullYear()} HYTICON · Uso interno</p>
          </div>
        </div>

      </div>
    </>
  )
}
