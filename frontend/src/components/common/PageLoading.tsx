export function PageLoading() {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0e1a',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        animation: 'fadeIn .3s ease both',
      }}>
        {/* Animated logo */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '11px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-.01em',
          animation: 'glow 2.5s ease-in-out infinite',
          boxShadow: '0 0 20px rgba(99,102,241,.5)',
          userSelect: 'none',
        }}>
          H
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#f9fafb',
          letterSpacing: '.05em',
          opacity: 0.8,
        }}>
          HYTICON
        </div>

        {/* Spinner */}
        <div style={{
          width: '22px',
          height: '22px',
          borderRadius: '50%',
          border: '2.5px solid rgba(255,255,255,.08)',
          borderTopColor: '#6366f1',
          animation: 'spin .7s linear infinite',
        }} />
      </div>
    </div>
  )
}
