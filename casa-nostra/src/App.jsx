import { useState } from 'react'
import { isSupabaseConfigured } from './lib/supabase'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import ProjectList from './components/ProjectList'
import ProjectEditor from './components/ProjectEditor'
import LocalProjects from './components/LocalProjects'

function Root({ onLocal }) {
  const { user, loading } = useAuth()
  const [openId, setOpenId] = useState(null)

  if (loading) {
    return (
      <div className="center-screen">
        <span className="spinner dark" />
        <p>Controllo l’accesso ai progetti condivisi…</p>
        <button className="btn secondary" style={{ maxWidth: 320 }} onClick={onLocal}>Progetta su questo dispositivo</button>
      </div>
    )
  }

  if (!user) return <Login onLocal={onLocal} />

  if (openId) {
    return <ProjectEditor projectId={openId} onBack={() => setOpenId(null)} />
  }
  return <ProjectList onOpen={setOpenId} />
}

export default function App() {
  const [local, setLocal] = useState(false)
  const [localId, setLocalId] = useState(null)
  if (local) return localId
    ? <ProjectEditor projectId={localId} local onBack={() => setLocalId(null)} />
    : <LocalProjects onOpen={setLocalId} onBack={() => setLocal(false)} />
  if (!isSupabaseConfigured) {
    return <LocalProjects onOpen={id => { setLocal(true); setLocalId(id) }} onBack={() => setLocal(true)} />
  }
  return (
    <AuthProvider>
      <Root onLocal={() => setLocal(true)} />
    </AuthProvider>
  )
}
