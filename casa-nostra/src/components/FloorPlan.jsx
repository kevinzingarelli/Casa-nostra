import { useRef } from 'react'
import { roomType, roomArea } from '../lib/rooms'

export default function FloorPlan({ rooms, selectedId, onSelect, onMove, lot = 22 }) {
  const LOT = lot
  const canvasRef = useRef(null)
  const drag = useRef(null)

  function startDrag(e, room) {
    e.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const pxPerM = rect.width / LOT
    drag.current = {
      id: room.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: room.x,
      origY: room.y,
      pxPerM,
      moved: false,
      w: room.w,
      l: room.l,
    }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch {}
  }

  function moveDrag(e) {
    const d = drag.current
    if (!d || e.pointerId !== d.pointerId) return
    const dxM = (e.clientX - d.startX) / d.pxPerM
    const dyM = (e.clientY - d.startY) / d.pxPerM
    if (Math.abs(e.clientX - d.startX) > 4 || Math.abs(e.clientY - d.startY) > 4) d.moved = true
    let nx = d.origX + dxM
    let ny = d.origY + dyM
    nx = Math.max(0, Math.min(LOT - d.w, nx))
    ny = Math.max(0, Math.min(LOT - d.l, ny))
    // arrotonda a 0.5m per un posizionamento ordinato
    nx = Math.round(nx * 2) / 2
    ny = Math.round(ny * 2) / 2
    onMove(d.id, nx, ny)
  }

  function endDrag(e) {
    const d = drag.current
    if (!d) return
    if (!d.moved) onSelect(d.id)
    drag.current = null
  }

  return (
    <>
      <div className="plan-canvas" ref={canvasRef}>
        {rooms.map((room) => {
          const t = roomType(room.type)
          const color = t.color
          const sel = room.id === selectedId
          return (
            <div
              key={room.id}
              className={'room-rect' + (sel ? ' selected' : '')}
              style={{
                left: `${(room.x / LOT) * 100}%`,
                top: `${(room.y / LOT) * 100}%`,
                width: `${(room.w / LOT) * 100}%`,
                height: `${(room.l / LOT) * 100}%`,
                background: color + '16',
                borderColor: color,
                color: 'var(--ink)',
              }}
              onPointerDown={(e) => startDrag(e, room)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              <span className="r-name">{room.name || t.name}</span>
              <span className="r-dim">{room.w}×{room.l}m</span>
            </div>
          )
        })}
      </div>
      <p className="plan-hint">
        {rooms.length === 0
          ? 'Aggiungi la prima stanza per iniziare'
          : 'Trascina le stanze col dito · tocca per selezionare'}
      </p>
    </>
  )
}
