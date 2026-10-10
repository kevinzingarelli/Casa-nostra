import { useState } from 'react'
import { Home, Plus, ArrowLeft } from 'lucide-react'
import { listLocalProjects, createLocalProject, saveLocalProject } from '../lib/localProjects'
import { validateImport } from '../lib/villa'
import ReleaseNote from './ReleaseNote'
export default function LocalProjects({ onOpen, onBack }) {
  const [error, setError] = useState('')
  const [state] = useState(() => { try { return { projects: listLocalProjects() } } catch (e) { return { projects: [], error: e.message } } })
  const projects = state.projects
  function create() {
    try { const project = createLocalProject(); saveLocalProject(project); onOpen(project.id) }
    catch (e) { setError('Impossibile salvare sul dispositivo. ' + e.message) }
  }
  async function importFile(e) { try { const file=e.target.files[0]; if(!file)return; if(file.size>4000000)throw new Error('Il file supera 4 MB.');const p=validateImport(JSON.parse(await file.text()));saveLocalProject(p);onOpen(p.id) } catch(err){setError(err.message)} }
  return <div className="app"><header className="topbar"><button className="icon-btn" onClick={onBack} aria-label="Torna all’accesso"><ArrowLeft /></button><span className="title">Casa Nostra</span></header>
    <main className="screen"><div className="list-head"><span className="eyebrow">Spazio per immaginare</span><h1>La casa dei tuoi sogni</h1><p>Disegna gli spazi. Giraci intorno. Conserva le idee.</p></div>
      <div className="local-notice">Su questo dispositivo · I progetti restano in questo browser. Esporta una copia per conservarli; per ritrovarli su altri dispositivi usa l’accesso ai progetti condivisi.</div>
      {(error || state.error) && <p role="alert" className="alert error">{error || state.error}</p>}
      {projects.map(project => <button key={project.id} className="card local-project" onClick={() => onOpen(project.id)}><Home /><span><strong>{project.name}</strong><small>{project.data?.rooms?.length || 0} stanze · Apri il progetto</small></span><span aria-hidden="true">↗</span></button>)}
      <button className="btn accent" style={{ marginTop: 22 }} onClick={create} disabled={!!state.error}><Plus size={18} />{projects.length ? 'Nuovo progetto' : 'Inizia a immaginare'}</button>
      <p className="muted" style={{ marginTop: 12 }}>I nuovi progetti partono da una villa modificabile: tre livelli, giardino e 16 desideri già collocati. I tuoi progetti precedenti restano come li hai salvati.</p>
      <label className="import-label">Importa una copia del progetto<input aria-label="Importa progetto JSON" type="file" accept=".json,application/json" onChange={importFile}/></label>
      <ReleaseNote/>
      <footer className="app-footer">Casa Nostra · un prodotto Kesia s.r.l.</footer>
    </main></div>
}
