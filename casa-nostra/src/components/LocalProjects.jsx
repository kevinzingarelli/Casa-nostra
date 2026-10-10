import { useState } from 'react'
import { Home, Plus, ArrowLeft } from 'lucide-react'
import { listLocalProjects, createLocalProject, saveLocalProject } from '../lib/localProjects'
export default function LocalProjects({ onOpen, onBack }) {
  const [error, setError] = useState('')
  const [state] = useState(() => { try { return { projects: listLocalProjects() } } catch (e) { return { projects: [], error: e.message } } })
  const projects = state.projects
  function create() {
    try { const project = createLocalProject(); saveLocalProject(project); onOpen(project.id) }
    catch (e) { setError('Impossibile salvare sul dispositivo. ' + e.message) }
  }
  return <div className="app"><header className="topbar"><button className="icon-btn" onClick={onBack} aria-label="Torna all’accesso"><ArrowLeft /></button><span className="title">Casa Nostra</span></header>
    <main className="screen"><div className="list-head"><span className="eyebrow">Spazio per immaginare</span><h1>La casa dei tuoi sogni</h1><p>Disegna gli spazi. Giraci intorno. Conserva le idee.</p></div>
      <div className="local-notice">Su questo dispositivo · I progetti restano in questo browser. Esporta una copia per conservarli; per ritrovarli su altri dispositivi usa l’accesso ai progetti condivisi.</div>
      {(error || state.error) && <p role="alert" className="alert error">{error || state.error}</p>}
      {projects.map(project => <button key={project.id} className="card local-project" onClick={() => onOpen(project.id)}><Home /><span><strong>{project.name}</strong><small>{project.data?.rooms?.length || 0} stanze · Apri il progetto</small></span><span aria-hidden="true">↗</span></button>)}
      <button className="btn accent" style={{ marginTop: 22 }} onClick={create} disabled={!!state.error}><Plus size={18} />{projects.length ? 'Nuovo progetto' : 'Inizia a immaginare'}</button>
      {!projects.length && <p className="muted" style={{ marginTop: 12 }}>Parti da cinque stanze di esempio da modificare e dalle 16 idee del post.</p>}
      <details className="release-note"><summary>Novità · v1.1.0 · 10 ottobre 2026</summary><p>Desideri dal post Instagram, vista 3D degli spazi e progetti salvati sul dispositivo con esportazione. Ripresa della pubblicazione.</p></details>
      <footer className="app-footer">Casa Nostra · un prodotto Kesia s.r.l.</footer>
    </main></div>
}
