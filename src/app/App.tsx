import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../pages/Dashboard'
import { GroupPage } from '../pages/Group'
import { InvitePage } from '../pages/Invite'
import { LoginPage } from '../pages/Login'
import { NotFoundPage } from '../pages/NotFound'
import { RegisterPage } from '../pages/Register'

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/group/:groupId" element={<GroupPage />} />
        <Route path="/invite/:inviteCode" element={<InvitePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
