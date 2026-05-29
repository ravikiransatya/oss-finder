import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import DashboardPage from './pages/DashboardPage'
import BookmarksPage from './pages/BookmarksPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import BuildProjectsPage from './pages/BuildProjectsPage'
import ProjectBuilderPage from './pages/ProjectBuilderPage'
import GitHubCallback from './pages/GitHubCallback'
import VerifyEmailPage from './pages/VerifyEmailPage'
import GoogleCallback from './pages/GoogleCallback'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AboutPage from './pages/AboutPage'
import BlogPage from './pages/BlogPage'
import ChangelogPage from './pages/ChangelogPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import SecurityPage from './pages/SecurityPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="auth/callback" element={<GitHubCallback />} />
          <Route path="auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="auth/google/callback" element={<GoogleCallback />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/reset-password" element={<ResetPasswordPage />} />
          <Route path="build" element={<BuildProjectsPage />} />
          <Route path="build/:projectId" element={<ProjectBuilderPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="changelog" element={<ChangelogPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="security" element={<SecurityPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
