// ============================================================
// HYTICON — LoginPage
// Diseño final: limpio, corporativo, sin excesos visuales
// ============================================================

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FormField } from '@/components/ui/FormField'
import { ROUTES } from '@/router/routes'

// ── Schema ────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Ingresa un correo válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    ROUTES.DASHBOARD

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch {
      setApiError('Credenciales incorrectas. Verifica tu correo y contraseña.')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Panel izquierdo — decorativo (oculto en mobile) */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 flex-col justify-between bg-[#0f172a] p-12">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb]">
            <span className="text-base font-bold text-white">H</span>
          </div>
          <span className="text-base font-semibold tracking-wide text-white">HYTICON</span>
        </div>

        {/* Mensaje central */}
        <div>
          <ShieldCheck className="mb-6 h-12 w-12 text-[#2563eb]" />
          <h2 className="text-2xl font-semibold text-white leading-snug">
            Sistema de<br />Cotizaciones
          </h2>
          <p className="mt-3 text-sm text-[#64748b] leading-relaxed max-w-xs">
            Gestiona, genera y da seguimiento a cotizaciones
            de forma estructurada y profesional.
          </p>

          {/* Características */}
          <ul className="mt-8 flex flex-col gap-3">
            {[
              'Generación de cotizaciones en PDF',
              'Control de estados y seguimiento',
              'Catálogo de productos y servicios',
              'Historial de auditoría completo',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[#94a3b8]">
                <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer del panel */}
        <p className="text-xs text-[#334155]">
          TI & Seguridad Electrónica — Uso interno
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[400px]">
          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb]">
              <span className="text-base font-bold text-white">H</span>
            </div>
            <span className="text-base font-semibold tracking-wide text-[#0f172a]">HYTICON</span>
          </div>

          {/* Título */}
          <div className="mb-7">
            <h1 className="text-xl font-semibold text-[#0f172a]">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-[#94a3b8]">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            {/* Correo */}
            <FormField
              id="email"
              label="Correo electrónico"
              required
              error={errors.email?.message}
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@hyticon.com"
                  className="pl-9"
                  error={!!errors.email}
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                />
              </div>
            </FormField>

            {/* Contraseña */}
            <FormField
              id="password"
              label="Contraseña"
              required
              error={errors.password?.message}
            >
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94a3b8]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-10"
                  error={!!errors.password}
                  autoComplete="current-password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-[#94a3b8] hover:text-[#475569] focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye className="h-4 w-4" />
                  }
                </button>
              </div>
            </FormField>

            {/* Error de API */}
            {apiError && (
              <div
                className="flex items-start gap-2 rounded-[6px] border border-[#fecaca] bg-[#fff1f2] px-3 py-2.5"
                role="alert"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#dc2626] text-[9px] font-bold text-white">!</span>
                <p className="text-xs text-[#b91c1c]">{apiError}</p>
              </div>
            )}

            {/* Divisor */}
            <div className="h-px bg-[#f1f5f9]" />

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Verificando…' : 'Ingresar al sistema'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-[#cbd5e1]">
            © {new Date().getFullYear()} HYTICON · Sistema de Cotizaciones
          </p>
        </div>
      </div>
    </div>
  )
}
