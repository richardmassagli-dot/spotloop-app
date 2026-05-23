import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { LocaleProvider } from './context/LocaleContext.jsx'
import { useAuth } from './context/AuthContext.jsx'
import App from './App.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'
import AdminSpots from './pages/admin/AdminSpots.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import { Spinner, C } from './components/ui.jsx'

function BootFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        minHeight: '100dvh',
        gap: 12,
        background: C.bg,
      }}
    >
      <Spinner size={40} color={C.blue} />
      <span style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>Spotloop startet…</span>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <BootFallback />;
  }
  return user ? children : <Navigate to="/" replace />;
}

function showFatalError(err) {
  const msg = err?.message || String(err || 'Unbekannter Fehler')
  const root = document.getElementById('root')
  if (!root) return
  root.innerHTML =
    '<div style="min-height:100dvh;padding:28px 22px;font-family:system-ui,sans-serif;background:#F7F9FF;color:#0A1628;box-sizing:border-box">' +
    '<p style="font-size:22px;font-weight:800;margin:0 0 8px">Spotloop</p>' +
    '<p style="font-size:14px;line-height:1.5;color:#64748B;margin:0 0 16px">' +
    msg +
    '</p>' +
    '<button type="button" onclick="location.reload()" style="width:100%;padding:14px;border:none;border-radius:12px;background:#1B4FD8;color:#fff;font-size:15px;font-weight:700">Neu laden</button>' +
    '</div>'
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  showFatalError(new Error('#root fehlt in index.html'))
} else {
  try {
    const root = createRoot(rootEl)
    root.render(
      <div
        className="app-frame"
        style={{ minHeight: '100dvh', background: '#F7F9FF', display: 'flex', flexDirection: 'column' }}
      >
        <AppErrorBoundary>
          <LocaleProvider>
            <AuthProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/admin/spots" element={<ProtectedRoute><AdminSpots /></ProtectedRoute>} />
                  <Route path="/*" element={<App />} />
                </Routes>
              </BrowserRouter>
            </AuthProvider>
          </LocaleProvider>
        </AppErrorBoundary>
      </div>,
    )
  } catch (err) {
    showFatalError(err)
  }
}
