export function PageLoading() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        {/* Logo animado */}
        <div style={{
          width: '36px', height: '36px',
          borderRadius: '9px',
          background: '#2563eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '15px', fontWeight: 800, color: '#fff',
          boxShadow: '0 0 20px rgba(37,99,235,.5)',
          animation: 'lp-glow 2s ease-in-out infinite',
        }}>H</div>
        <div style={{
          width: '24px', height: '24px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,.08)',
          borderTopColor: '#2563eb',
          animation: 'lp-spin .7s linear infinite',
        }} />
        <style>{`
          @keyframes lp-spin { to { transform: rotate(360deg); } }
          @keyframes lp-glow { 0%,100%{ box-shadow:0 0 12px rgba(37,99,235,.4); } 50%{ box-shadow:0 0 24px rgba(37,99,235,.7); } }
        `}</style>
      </div>
    </div>
  )
}
