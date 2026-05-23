import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import DashboardPage from './pages/DashboardPage'
import BookmarksPage from './pages/BookmarksPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import BuildProjectsPage from "./pages/BuildProjectsPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/"         element={<Layout />}>
          <Route index          element={<HomePage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="profile"   element={<ProfilePage />} />
          <Route path="login"     element={<LoginPage />} />
          <Route path="/build" element={<BuildProjectsPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
