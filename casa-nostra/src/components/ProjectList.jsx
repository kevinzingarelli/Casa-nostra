import { useEffect, useState } from 'react'
import { Home, Building2, Plus, MoreVertical, Trash2, Pencil, LogOut, HousePlus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { computeCost, formatEUR, totalArea } from '../lib/costs'
import Sheet from './Sheet'

export default function ProjectList({ onOpen }) {
  const { user, signOut } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [actionsFor, setActionsFor] = useState(null)
  const [renameFor, setRenameFor] = useState(null)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('villa')
  const [busy, setBusy] = useState(false)

  const displayName = user?.user_metadata?.display_name || 'a casa'

  async function load() {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false })
    if (!error) setProjects(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const ch = supabase
      .channel('projects-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  async function createProject() {
    if (busy) return
    setBusy(true)
    const name = newName.trim() || (newType === 'villa' ? 'La nostra villa' : 'Il nostro appartamento')
    const { data, error } = await supabase
      .from('projects')
      .insert({ owner: user.id, name, house_type: newType, data: { rooms: [], materials: {} } })
      .select()
      .single()
    setBusy(false)
    if (!error && data) {
      setCreateOpen(false)
      setNewName('')
      onOpen(data.id)
    }
  }

  async function removeProject(id) {
    setActionsFor(null)
    setProjects((p) => p.filter((x) => x.id !== id))
    await supabase.from('projects').delete().eq('id', id)
  }

  async function doRename() {
    const id = renameFor.id
    const name = newName.trim() || renameFor.name
    setRenameFor(null)
    setProjects((p) => p.map((x) => (x.id === id ? { ...x, name } : x)))
    await supabase.from('projects').update({ name, updated_at: new Date().toISOString() }).eq('id', id)
  }

  return (
    <div className="app">
      <div className="screen">
        <div className="list-head">
          <div className="row-between" style={{ alignItems: 'flex-start' }}>
            <div>
              <div className="eyebrow">Bentornato, {displayName}</div>
              <h1 style={{ marginTop: 6 }}>Le vostre case</h1>
            </div>
            <button className="icon-btn" onClick={signOut} aria-label="Esci"><LogOut size={18} /></button>
          </div>
          <p>Progetta, confronta e sogna. Ogni modifica è condivisa in tempo reale.</p>
        </div>

        {loading ? (
          <div className="center-screen" style={{ minHeight: 240 }}>
            <span className="spinner dark" />
          </div>
        ) : projects.length === 0 ? (
          <div className="empty">
            <div className="ic"><HousePlus size={30} /></div>
            <h3>Nessuna casa, per ora</h3>
            <p>Crea il primo progetto e inizia a costruire la casa dei vostri sogni.</p>
            <button className="btn accent" style={{ maxWidth: 240, margin: '0 auto' }} onClick={() => setCreateOpen(true)}>
              <Plus size={18} /> Nuova casa
            </button>
          </div>
        ) : (
          <>
            {projects.map((p) => {
              const d = p.data || {}
              const rooms = Array.isArray(d.rooms) ? d.rooms : []
              const cost = computeCost(rooms, d.materials || {})
              const isApt = p.house_type === 'appartamento'
              return (
                <div className="card project-card" key={p.id}>
                  <button style={{ display: 'contents' }} onClick={() => onOpen(p.id)}>
                    <span className={'proj-thumb' + (isApt ? ' apt' : '')}>
                      {isApt ? <Building2 size={24} /> : <Home size={24} />}
                    </span>
                    <span className="proj-meta">
                      <h3>{p.name}</h3>
                      <span className="sub">{rooms.length} stanze · {totalArea(rooms)} m²</span>
                    </span>
                  </button>
                  <span className="proj-cost">{rooms.length ? formatEUR(cost.total) : '—'}</span>
                  <button className="btn ghost" onClick={() => setActionsFor(p)} aria-label="Opzioni">
                    <MoreVertical size={20} />
                  </button>
                </div>
              )
            })}
            <button className="btn" style={{ marginTop: 18 }} onClick={() => setCreateOpen(true)}>
              <Plus size={18} /> Nuova casa
            </button>
          </>
        )}
      </div>

      {/* Crea progetto */}
      <Sheet open={createOpen} onClose={() => setCreateOpen(false)} title="Nuova casa" subtitle="Dai un nome e scegli il tipo. Potrai cambiare tutto dopo.">
        <div className="field">
          <label>Nome del progetto</label>
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Es. Casa al mare" autoCapitalize="sentences" />
        </div>
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 8 }}>Tipo</label>
        <div className="type-grid" style={{ marginBottom: 20 }}>
          <button className="type-pick" style={{ borderColor: newType === 'villa' ? 'var(--ink)' : 'var(--line)', boxShadow: newType === 'villa' ? '0 0 0 1px var(--ink)' : 'none' }} onClick={() => setNewType('villa')}>
            <span className="tp-dot" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}><Home size={16} /></span>
            <span>Villa singola</span>
          </button>
          <button className="type-pick" style={{ borderColor: newType === 'appartamento' ? 'var(--ink)' : 'var(--line)', boxShadow: newType === 'appartamento' ? '0 0 0 1px var(--ink)' : 'none' }} onClick={() => setNewType('appartamento')}>
            <span className="tp-dot" style={{ background: 'var(--cost-tint)', color: 'var(--cost)' }}><Building2 size={16} /></span>
            <span>Appartamento</span>
          </button>
        </div>
        <button className="btn accent" onClick={createProject} disabled={busy}>
          {busy ? <span className="spinner" /> : 'Crea e inizia'}
        </button>
      </Sheet>

      {/* Azioni progetto */}
      <Sheet open={!!actionsFor} onClose={() => setActionsFor(null)} title={actionsFor?.name}>
        <button className="opt" style={{ width: '100%', marginBottom: 10 }} onClick={() => { setRenameFor(actionsFor); setNewName(actionsFor.name); setActionsFor(null) }}>
          <span className="check" style={{ border: 'none', background: 'var(--accent-tint)', color: 'var(--accent)' }}><Pencil size={14} /></span>
          <span className="o-body"><h4>Rinomina</h4></span>
        </button>
        <button className="opt" style={{ width: '100%' }} onClick={() => removeProject(actionsFor.id)}>
          <span className="check" style={{ border: 'none', background: 'var(--danger-tint)', color: 'var(--danger)' }}><Trash2 size={14} /></span>
          <span className="o-body"><h4 style={{ color: 'var(--danger)' }}>Elimina progetto</h4><p>Questa azione non si può annullare</p></span>
        </button>
      </Sheet>

      {/* Rinomina */}
      <Sheet open={!!renameFor} onClose={() => setRenameFor(null)} title="Rinomina progetto">
        <div className="field">
          <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
        </div>
        <button className="btn accent" onClick={doRename}>Salva</button>
      </Sheet>
    </div>
  )
}
