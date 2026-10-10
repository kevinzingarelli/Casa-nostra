import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ChevronLeft, LayoutGrid, Box, Receipt, Plus, Trash2, Minus, Hammer, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ROOM_TYPES, roomType } from '../lib/rooms'
import { computeCost, formatEUR, DEFAULT_MATERIALS, suggestedWindows } from '../lib/costs'
import FloorPlan from './FloorPlan'
import MaterialsPanel from './MaterialsPanel'
import Summary from './Summary'
import Sheet from './Sheet'
import ConstructionAnimation from './ConstructionAnimation'
import DreamsPanel from './DreamsPanel'
import { initialDreams } from '../lib/dreams'
import { listLocalProjects, saveLocalProject, downloadProject } from '../lib/localProjects'
const HouseView = lazy(() => import('./HouseView'))

const LOT = 22

export default function ProjectEditor({ projectId, onBack, local = false }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [houseType, setHouseType] = useState('villa')
  const [rooms, setRooms] = useState([])
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS)
  const [tab, setTab] = useState('plan')
  const [selectedId, setSelectedId] = useState(null)
  const [addOpen, setAddOpen] = useState(false)
  const [building, setBuilding] = useState(false)
  const [liveEdit, setLiveEdit] = useState(false)
  const [dreams, setDreams] = useState(initialDreams)
  const [saveStatus, setSaveStatus] = useState('')
  const original = useRef(null)
  const saved = useRef('')
  const saveQueue = useRef(Promise.resolve())
  const current = useRef(null)

  const applyingRemote = useRef(false)
  const pendingSave = useRef(false)
  const lastUpdatedAt = useRef(null)

  // ---- Caricamento iniziale ----
  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = local ? { data: listLocalProjects().find(p => p.id === projectId) } : await supabase.from('projects').select('*').eq('id', projectId).single()
        if (!active) return
        if (result.error || !result.data) throw new Error('Impossibile aprire il progetto. Riprova senza modificare i dati.')
        applyData(result.data)
        setLoaded(true)
      } catch (e) { if (active) setError(e.message) }
    }
    load()
    return () => { active = false }
  }, [projectId, local])

  function applyData(row) {
    original.current = row
    setName(row.name || 'Casa senza nome')
    setHouseType(row.house_type || 'villa')
    const d = row.data || {}
    setRooms(Array.isArray(d.rooms) ? d.rooms : [])
    setMaterials({ ...DEFAULT_MATERIALS, ...(d.materials || {}) })
    setDreams(d.dreams || initialDreams())
    saved.current = JSON.stringify({ name: row.name || 'Casa senza nome', houseType: row.house_type || 'villa', rooms: Array.isArray(d.rooms) ? d.rooms : [], materials: { ...DEFAULT_MATERIALS, ...(d.materials || {}) }, dreams: d.dreams || initialDreams() })
    lastUpdatedAt.current = row.updated_at
  }
  current.current = { name, houseType, rooms, materials, dreams }

  // ---- Salvataggio automatico (debounce) ----
  useEffect(() => {
    if (!loaded) return
    if (applyingRemote.current) { applyingRemote.current = false; return }
    if (JSON.stringify(current.current) === saved.current) return
    pendingSave.current = true
    setSaveStatus('Salvataggio…')
    if (local) { save(); return }
    const id = setTimeout(save, 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, materials, name, houseType, dreams, loaded])

  function save() {
    if (!original.current) return Promise.resolve(false)
    const snapshot = { ...current.current }
    const serialized = JSON.stringify(snapshot)
    const run = async () => {
      const updated_at = new Date().toISOString()
      const row = { ...original.current, name: snapshot.name, house_type: snapshot.houseType, data: { ...original.current.data, rooms: snapshot.rooms, materials: snapshot.materials, dreams: snapshot.dreams }, updated_at }
      try {
        if (local) saveLocalProject(row)
        else {
          const result = await supabase.from('projects').update({ name: row.name, house_type: row.house_type, data: row.data, updated_at }).eq('id', projectId).select('id').single()
          if (result.error || !result.data) throw new Error('Salvataggio non confermato')
        }
        original.current = row; saved.current = serialized; lastUpdatedAt.current = updated_at
        pendingSave.current = JSON.stringify(current.current) !== serialized
        setSaveStatus(pendingSave.current ? 'Salvataggio…' : local ? 'Salvato sul dispositivo' : 'Salvato online')
        setError(''); return true
      } catch {
        pendingSave.current = true; setSaveStatus('Da salvare')
        setError('Non è stato possibile salvare. Riprova oppure esporta una copia prima di uscire.'); return false
      }
    }
    saveQueue.current = saveQueue.current.then(run, run)
    return saveQueue.current
  }
  async function leave() { if (JSON.stringify(current.current) === saved.current && !pendingSave.current) onBack(); else if (await save()) onBack() }
  function exportCopy() { downloadProject({ ...original.current, name, house_type: houseType, data: { ...original.current?.data, rooms, materials, dreams } }) }
  useEffect(() => {
    const warn = e => { if (pendingSave.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [])

  // ---- Realtime: modifiche degli altri ----
  useEffect(() => {
    if (local) return
    const ch = supabase
      .channel('project-' + projectId)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${projectId}` },
        (payload) => {
          const row = payload.new
          if (pendingSave.current) return
          if (!row || row.updated_at === lastUpdatedAt.current) return
          applyingRemote.current = true
          applyData(row)
          setLiveEdit(true)
          setTimeout(() => setLiveEdit(false), 2500)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [projectId, local])

  // ---- Azioni stanze ----
  function addRoom(typeId) {
    const t = roomType(typeId)
    const n = rooms.length
    const x = Math.min(LOT - t.w, (n % 4) * 4.5 + 1)
    const y = Math.min(LOT - t.l, Math.floor(n / 4) * 4.5 + 1)
    const room = { id: crypto.randomUUID(), type: typeId, w: t.w, l: t.l, x, y }
    setRooms((r) => [...r, room])
    setMaterials((m) => ({ ...m, windows: m.windows ?? suggestedWindows([...rooms, room]) }))
    setSelectedId(room.id)
    setAddOpen(false)
  }

  function moveRoom(id, x, y) {
    setRooms((r) => r.map((rm) => (rm.id === id ? { ...rm, x, y } : rm)))
  }

  function resizeRoom(id, key, delta) {
    setRooms((r) =>
      r.map((rm) => {
        if (rm.id !== id) return rm
        let v = Math.round((rm[key] + delta) * 2) / 2
        v = Math.max(1, Math.min(LOT, v))
        const next = { ...rm, [key]: v }
        // mantieni dentro il lotto
        next.x = Math.min(next.x, LOT - next.w)
        next.y = Math.min(next.y, LOT - next.l)
        return next
      })
    )
  }

  function deleteRoom(id) {
    setRooms((r) => r.filter((rm) => rm.id !== id))
    setSelectedId(null)
  }

  const cost = computeCost(rooms, materials)
  const selected = rooms.find((r) => r.id === selectedId)

  if (!loaded) {
    if (error) return <div className="auth-wrap"><p role="alert" className="alert error">{error}</p><button className="btn" onClick={onBack}>Torna ai progetti</button></div>
    return (
      <div className="center-screen">
        <span className="spinner dark" />
        <span>Apertura progetto…</span>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="topbar">
        <button className="back" onClick={leave} aria-label="Indietro"><ChevronLeft size={24} /></button>
        <span className="title">{name}</span>
        {liveEdit && (
          <span className="chip live"><Users size={12} /> aggiornato</span>
        )}
      </div>

      <div className="screen">
        <div className="editor-meta"><span role="status">{saveStatus || (local ? 'Su questo dispositivo' : 'Progetto condiviso')}</span><button onClick={exportCopy}>Esporta copia</button></div>
        {error && <div role="alert" className="alert error">{error}<button className="btn secondary" onClick={save}>Riprova il salvataggio</button></div>}
        <div className="tabs">
          <button className={'tab' + (tab === 'plan' ? ' active' : '')} onClick={() => setTab('plan')}><LayoutGrid /> Planimetria</button>
          <button className={'tab' + (tab === 'mat' ? ' active' : '')} onClick={() => setTab('mat')}><Box /> Materiali</button>
          <button className={'tab' + (tab === 'sum' ? ' active' : '')} onClick={() => setTab('sum')}><Receipt /> Riepilogo</button>
          <button className={'tab' + (tab === 'view' ? ' active' : '')} onClick={() => setTab('view')}><Box /> Vista 3D</button>
          <button className={'tab' + (tab === 'dreams' ? ' active' : '')} onClick={() => setTab('dreams')}><Plus /> Desideri</button>
        </div>
        {tab === 'view' && <Suspense fallback={<p>Preparo la vista 3D…</p>}><HouseView rooms={rooms} /></Suspense>}
        {tab === 'dreams' && <DreamsPanel dreams={dreams} onChange={(id, value) => setDreams(previous => ({ ...previous, [id]: value }))} />}

        {tab === 'plan' && (
          <div className="fade-up">
            <FloorPlan rooms={rooms} selectedId={selectedId} onSelect={setSelectedId} onMove={moveRoom} />

            {selected && (
              <div className="card dim-editor" style={{ marginTop: 14 }}>
                <div className="row-between" style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="room-dot" style={{ background: roomType(selected.type).color }} />
                    <strong style={{ fontSize: 16 }}>{roomType(selected.type).name}</strong>
                  </div>
                  <button className="btn danger small" onClick={() => deleteRoom(selected.id)}>
                    <Trash2 size={15} /> Elimina
                  </button>
                </div>
                <div className="dim-grid">
                  <Dim label="Larghezza" value={selected.w} onMinus={() => resizeRoom(selected.id, 'w', -0.5)} onPlus={() => resizeRoom(selected.id, 'w', 0.5)} />
                  <Dim label="Lunghezza" value={selected.l} onMinus={() => resizeRoom(selected.id, 'l', -0.5)} onPlus={() => resizeRoom(selected.id, 'l', 0.5)} />
                </div>
                <p className="muted" style={{ marginTop: 12 }}>Area stanza: <strong className="num">{Math.round(selected.w * selected.l * 10) / 10} m²</strong></p>
              </div>
            )}

            <button className="btn secondary" style={{ marginTop: 14 }} onClick={() => setAddOpen(true)}>
              <Plus size={18} /> Aggiungi stanza
            </button>

            {rooms.length > 0 && (
              <>
                <div className="eyebrow" style={{ margin: '22px 0 10px' }}>Stanze ({rooms.length})</div>
                <div className="card">
                  {rooms.map((r, i) => {
                    const t = roomType(r.type)
                    return (
                      <button
                        key={r.id}
                        className="room-row"
                        style={{ width: '100%', textAlign: 'left', borderTop: i ? '1px solid var(--line-soft)' : 'none', background: r.id === selectedId ? 'var(--surface-2)' : 'transparent' }}
                        onClick={() => setSelectedId(r.id)}
                      >
                        <span className="room-dot" style={{ background: t.color }} />
                        <span className="r-info">
                          <h4>{t.name}</h4>
                          <span>{r.w}×{r.l}m · {Math.round(r.w * r.l * 10) / 10} m²</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'mat' && (
          <MaterialsPanel
            rooms={rooms}
            materials={materials}
            onChange={(g, o) => setMaterials((m) => ({ ...m, [g]: o }))}
            onWindows={(n) => setMaterials((m) => ({ ...m, windows: n }))}
          />
        )}

        {tab === 'sum' && (
          <Summary rooms={rooms} materials={materials} houseType={houseType} onBuild={() => setBuilding(true)} />
        )}
      </div>

      {/* Barra costo sempre visibile */}
      <div className="cost-bar">
        <div className="cost-bar-inner">
          <div className="cb-left">
            <div className="cb-label">Stima base · extra esclusi</div>
            <div className="cb-amount num">{formatEUR(cost.total)}</div>
          </div>
          <button className="cb-btn" onClick={() => setTab('view')} disabled={rooms.length === 0}>
            <Box size={16} /> Guarda in 3D
          </button>
        </div>
      </div>

      {/* Sheet: aggiungi stanza */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Aggiungi una stanza" subtitle="Scegli il tipo: la sistemerai poi nella planimetria.">
        <div className="type-grid">
          {ROOM_TYPES.map((t) => (
            <button key={t.id} className="type-pick" onClick={() => addRoom(t.id)}>
              <span className="tp-dot" style={{ background: t.color + '22', color: t.color }}>
                <Plus size={16} />
              </span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>
      </Sheet>

      {/* Animazione costruzione */}
      {building && <ConstructionAnimation total={cost.total} onClose={() => setBuilding(false)} />}

      {error && <div className="alert error" style={{ margin: 16 }}>{error}</div>}
    </div>
  )
}

function Dim({ label, value, onMinus, onPlus }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', display: 'block', marginBottom: 7 }}>{label}</label>
      <div className="stepper">
        <button onClick={onMinus} aria-label={'Riduci ' + label}><Minus size={20} /></button>
        <span className="val">{value}<small> m</small></span>
        <button onClick={onPlus} aria-label={'Aumenta ' + label}><Plus size={20} /></button>
      </div>
    </div>
  )
}
