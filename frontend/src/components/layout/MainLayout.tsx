import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <>
      {/* Inject responsive layout styles */}
      <style>{`
        .main-layout-wrapper {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: #0a0e1a;
        }
        /* Desktop: sidebar always visible via media query,
           we reserve 240px on the left */
        @media (min-width: 768px) {
          .main-layout-sidebar {
            transform: translateX(0) !important;
            position: fixed !important;
          }
          .main-layout-content {
            margin-left: 240px;
          }
        }
        @media (max-width: 767px) {
          .main-layout-content {
            margin-left: 0;
          }
        }
      `}</style>

      <div className="main-layout-wrapper">
        {/* Sidebar — receives open/close state for mobile drawer */}
        <div className="main-layout-sidebar">
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main content area */}
        <div
          className="main-layout-content"
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <Header onMenuClick={() => setIsSidebarOpen(true)} />

          <main style={{
            flex: 1,
            overflowY: 'auto',
            background: '#0a0e1a',
          }}>
            <div style={{
              padding: 'clamp(16px, 3vw, 28px)',
              minHeight: '100%',
            }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
