import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthProvider, useAuth } from './context/AuthContext'
import ConfigNotice from './components/ConfigNotice'
import Login from './components/Login'
import ProjectList from './components/ProjectList'
import ProjectEditor from './components/ProjectEditor'

function Root() {
  const { user, loading } = useAuth()
  const [openId, setOpenId] = useState(null)

  if (loading) {
    return (
      <div className="center-screen">
        <span className="spinner dark" />
      </div>
    )
  }

  if (!user) return <Login />

  if (openId) {
    return <ProjectEditor projectId={openId} onBack={() => setOpenId(null)} />
  }
  return <ProjectList onOpen={setOpenId} />
}

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigNotice />
  }
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
