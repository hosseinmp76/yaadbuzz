import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import OrgPage from './pages/OrgPage'
import TeamPage from './pages/TeamPage'
import MemberPage from './pages/MemberPage'
import JoinPage from './pages/JoinPage'
import YearbookPage from './pages/YearbookPage'
import AboutPage from './pages/AboutPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import PreferencesPage from './pages/PreferencesPage'
import SourcePage from './pages/SourcePage'
import { Seo } from './seo/Seo'

function Protected({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth()
  if (!accessToken) return <Navigate to="/login" replace />
  return (
    <>
      <Seo title="Yaadbuzz" path="/app" noIndex />
      {children}
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/source" element={<SourcePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
      <Route path="/join" element={<Protected><JoinPage /></Protected>} />
      <Route path="/app" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/preferences" element={<Protected><PreferencesPage /></Protected>} />
      <Route path="/orgs/:orgId" element={<Protected><OrgPage /></Protected>} />
      <Route path="/teams/:teamId" element={<Protected><TeamPage /></Protected>} />
      <Route path="/teams/:teamId/yearbook" element={<Protected><YearbookPage /></Protected>} />
      <Route path="/members/:memberId" element={<Protected><MemberPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
