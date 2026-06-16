import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, LayoutGrid, Box, Receipt, Plus, Trash2, Minus, Hammer, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ROOM_TYPES, roomType } from '../lib/rooms'
import { computeCost, formatEUR, DEFAULT_MATERIALS, suggestedWindows } from '../lib/costs'
import FloorPlan from './FloorPlan'
import MaterialsPanel from './MaterialsPanel'
import Summary from './Summary'
import Sheet from './Sheet'
import ConstructionAnimation from './ConstructionAnimation'

const LOT = 22

export default function ProjectEditor({ projectId, onBack }) {
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

  const applyingRemote = useRef(false)
  const pendingSave = useRef(false)
  const lastUpdatedAt = useRef(null)

  // ---- Caricamento iniziale ----
  useEffect(() => {
    let active = true
    async function load() {
      const { data, error } = await supabase.from('projects').select('*').eq('id', projectId).single()
      if (!active) return
      if (error) { setError('Impossibile aprire il progetto.'); setLoaded(true); return }
      applyData(data)
      setLoaded(true)
    }
    load()
    return () => { active = false }
  }, [projectId])

  function applyData(row) {
    setName(row.name || 'Casa senza nome')
    setHouseType(row.house_type || 'villa')
    const d = row.data || {}
    setRooms(Array.isArray(d.rooms) ? d.rooms : [])
    setMaterials({ ...DEFAULT_MATERIALS, ...(d.materials || {}) })
    lastUpdatedAt.current = row.updated_at
  }

  // ---- Salvataggio automatico (debounce) ----
  useEffect(() => {
    if (!loaded) return
    if (applyingRemote.current) { applyingRemote.current = false; return }
    pendingSave.current = true
    const id = setTimeout(save, 700)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, materials, name, houseType, loaded])

  async function save() {
    const updated_at = new Date().toISOString()
    const { error } = await supabase
      .from('projects')
      .update({ name, house_type: houseType, data: { rooms, materials }, updated_at })
      .eq('id', projectId)
    pendingSave.current = false
    if (!error) lastUpdatedAt.current = updated_at
  }

  // ---- Realtime: modifiche degli altri ----
  useEffect(() => {
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
  }, [projectId])

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
        <button className="back" onClick={onBack} aria-label="Indietro"><ChevronLeft size={24} /></button>
        <span className="title">{name}</span>
        {liveEdit && (
          <span className="chip live"><Users size={12} /> aggiornato</span>
        )}
      </div>

      <div className="screen">
        <div className="tabs">
          <button className={'tab' + (tab === 'plan' ? ' active' : '')} onClick={() => setTab('plan')}><LayoutGrid /> Planimetria</button>
          <button className={'tab' + (tab === 'mat' ? ' active' : '')} onClick={() => setTab('mat')}><Box /> Materiali</button>
          <button className={'tab' + (tab === 'sum' ? ' active' : '')} onClick={() => setTab('sum')}><Receipt /> Riepilogo</button>
        </div>

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
            <div className="cb-label">Costo stimato</div>
            <div className="cb-amount num">{formatEUR(cost.total)}</div>
          </div>
          <button className="cb-btn" onClick={() => setBuilding(true)} disabled={rooms.length === 0}>
            <Hammer size={16} /> Costruisci
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
