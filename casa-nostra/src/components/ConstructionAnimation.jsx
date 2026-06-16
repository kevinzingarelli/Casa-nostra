import { useEffect, useMemo, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import { formatEUR } from '../lib/costs'

const ROW_H = 13
const BRICK_W = 26
const STEP = 28
const BRICK_H = 11

// aperture: porta e due finestre (i mattoni che le coprono vengono saltati)
const DOOR = { x1: 139, y1: 150, x2: 161, y2: 200 }
const WIN_L = { x1: 62, y1: 112, x2: 92, y2: 142 }
const WIN_R = { x1: 208, y1: 112, x2: 238, y2: 142 }

function overlaps(bx, by, rect) {
  return !(bx + BRICK_W <= rect.x1 || bx >= rect.x2 || by + BRICK_H <= rect.y1 || by >= rect.y2)
}

function buildBricks() {
  const bricks = []
  for (let r = 0; r < 8; r++) {
    const yTop = 200 - ROW_H * (r + 1)
    const offset = r % 2 === 0 ? 40 : 26
    for (let c = 0; c < 9; c++) {
      const x = offset + c * STEP
      if (x < 40 || x + BRICK_W > 260) continue
      if (overlaps(x, yTop, DOOR) || overlaps(x, yTop, WIN_L) || overlaps(x, yTop, WIN_R)) continue
      bricks.push({ x, y: yTop, delay: 1.0 + r * 0.26 + c * 0.015 })
    }
  }
  return bricks
}

export default function ConstructionAnimation({ total, onClose }) {
  const bricks = useMemo(buildBricks, [])
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(8)
  const [done, setDone] = useState(false)
  const timers = useRef([])

  useEffect(() => {
    const t = timers.current
    t.push(setTimeout(() => { setPhase(1); setProgress(45) }, 1000))
    t.push(setTimeout(() => { setProgress(78) }, 2800))
    t.push(setTimeout(() => { setPhase(2); setProgress(90) }, 3100))
    t.push(setTimeout(() => { setPhase(3); setProgress(100); setDone(true) }, 4700))
    return () => t.forEach(clearTimeout)
  }, [])

  const captions = [
    { t: 'Gettiamo le fondamenta', s: 'Posizioniamo la base sul terreno' },
    { t: 'Su con i muri', s: 'Mattone dopo mattone' },
    { t: 'Montiamo il tetto', s: 'La casa prende forma' },
    { t: 'Casa Nostra è pronta', s: 'Il vostro sogno, costruito' },
  ]
  const cap = captions[phase]

  return (
    <div className="build-overlay">
      <div className="build-stage">
        <svg viewBox="0 0 300 260" width="100%" role="img" aria-label="Costruzione della casa">
          {/* terreno */}
          <line x1="20" y1="201" x2="280" y2="201" stroke="var(--line)" strokeWidth="2" />
          {/* fondamenta che si disegnano */}
          <line
            x1="30" y1="200" x2="270" y2="200"
            stroke="var(--ink)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray="240" strokeDashoffset="240"
            style={{ animation: 'drawLine 0.8s ease-out forwards' }}
          />
          {/* mattoni */}
          {bricks.map((b, i) => (
            <rect
              key={i}
              className="brick"
              x={b.x} y={b.y} width={BRICK_W} height={BRICK_H} rx="2"
              fill="#c9714f" stroke="#a85a3c" strokeWidth="0.8"
              style={{ opacity: 0, animation: `brickIn 0.45s ease-out ${b.delay}s forwards` }}
            />
          ))}
          {/* tetto */}
          <polygon
            points="150,34 26,92 274,92"
            fill="#2e3fa8" stroke="#26358c" strokeWidth="2" strokeLinejoin="round"
            style={{ opacity: 0, animation: 'roofDrop 0.7s cubic-bezier(0.22,1,0.36,1) 3.2s forwards' }}
          />
          {/* porta */}
          <rect x="139" y="150" width="22" height="50" rx="2"
            fill="#7a4a32" stroke="#5e3826" strokeWidth="1.2"
            style={{ opacity: 0, animation: 'fadeUp 0.4s ease 3.6s forwards' }} />
          <circle cx="156" cy="176" r="1.6" fill="#f5d9a0"
            style={{ opacity: 0, animation: 'fadeUp 0.4s ease 3.8s forwards' }} />
          {/* finestre */}
          {[WIN_L, WIN_R].map((w, i) => (
            <g key={i} style={{ opacity: 0, animation: `fadeUp 0.4s ease ${3.7 + i * 0.1}s forwards` }}>
              <rect x={w.x1} y={w.y1} width={w.x2 - w.x1} height={w.y2 - w.y1} rx="2"
                fill="#dce6f5" stroke="#26358c" strokeWidth="1.5" />
              <line x1={(w.x1 + w.x2) / 2} y1={w.y1} x2={(w.x1 + w.x2) / 2} y2={w.y2} stroke="#26358c" strokeWidth="1" />
              <line x1={w.x1} y1={(w.y1 + w.y2) / 2} x2={w.x2} y2={(w.y1 + w.y2) / 2} stroke="#26358c" strokeWidth="1" />
            </g>
          ))}
        </svg>
      </div>

      <div className="build-caption">
        <div className="bc-phase">{cap.t}</div>
        <div className="bc-sub">{cap.s}</div>
        {!done && (
          <div className="build-progress"><i style={{ width: `${progress}%` }} /></div>
        )}
      </div>

      {done && (
        <div className="fade-up" style={{ marginTop: 26, textAlign: 'center', width: '100%', maxWidth: 360 }}>
          <div className="chip" style={{ marginBottom: 16 }}>Costo stimato totale</div>
          <div className="num" style={{ fontSize: 34, fontWeight: 700, color: 'var(--cost)', letterSpacing: '-0.02em' }}>
            {formatEUR(total)}
          </div>
          <button className="btn" style={{ marginTop: 22 }} onClick={onClose}>
            <Check size={18} /> Continua
          </button>
        </div>
      )}
    </div>
  )
}
