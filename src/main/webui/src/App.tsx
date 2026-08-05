import { lazy, Suspense, type ReactNode } from 'react'
import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './auth'
import LandingPage from './pages/LandingPage'
import { Seo } from './seo/Seo'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const TeamPage = lazy(() => import('./pages/TeamPage'))
const MemberPage = lazy(() => import('./pages/MemberPage'))
const JoinPage = lazy(() => import('./pages/JoinPage'))
const YearbookPage = lazy(() => import('./pages/YearbookPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'))
const AlternativesPage = lazy(() => import('./pages/AlternativesPage'))
const OAuthCallbackPage = lazy(() => import('./pages/OAuthCallbackPage'))
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'))
const SourcePage = lazy(() => import('./pages/SourcePage'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Protected({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  if (!accessToken) {
    return <Navigate to="/login" replace />
  }
  return (
    <>
      <Seo title="Yaadbuzz" path="/app" noIndex />
      {children}
    </>
  )
}

function LazyFallback() {
  return <p className="p-6 text-muted">…</p>
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/alternatives" element={<AlternativesPage />} />
          <Route path="/source" element={<SourcePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/set-password" element={<ResetPasswordPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/app" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/preferences" element={<Protected><PreferencesPage /></Protected>} />
          <Route path="/orgs/*" element={<Navigate to="/app" replace />} />
          <Route path="/teams/:teamId" element={<Protected><TeamPage /></Protected>} />
          <Route path="/teams/:teamId/yearbook" element={<Protected><YearbookPage /></Protected>} />
          <Route path="/members/:memberId" element={<Protected><MemberPage /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}
