import { Hammer, Ruler, DoorOpen } from 'lucide-react'
import { computeCost, formatEUR } from '../lib/costs'

export default function Summary({ rooms, materials, houseType, onBuild }) {
  const cost = computeCost(rooms, materials)

  return (
    <div className="fade-up">
      <div className="card" style={{ padding: 16, marginBottom: 18 }}>
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DoorOpen size={16} color="var(--ink-soft)" />
            <span className="muted">Tipo</span>
          </div>
          <strong style={{ fontSize: 14 }}>{houseType === 'appartamento' ? 'Appartamento' : 'Villa singola'}</strong>
        </div>
        <div className="divider" style={{ margin: '12px 0' }} />
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DoorOpen size={16} color="var(--ink-soft)" />
            <span className="muted">Stanze</span>
          </div>
          <strong className="num" style={{ fontSize: 14 }}>{rooms.length}</strong>
        </div>
        <div className="divider" style={{ margin: '12px 0' }} />
        <div className="row-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Ruler size={16} color="var(--ink-soft)" />
            <span className="muted">Superficie</span>
          </div>
          <strong className="num" style={{ fontSize: 14 }}>{cost.area} m²</strong>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 10 }}>Stima dei costi</div>
      <div className="card" style={{ padding: '4px 16px 16px' }}>
        {cost.lines.map((l) => (
          <div className="brk-row" key={l.groupId}>
            <div className="bl">
              {l.groupLabel}
              <small>{l.optionName} · {l.detail}</small>
            </div>
            <div className="bv">{formatEUR(l.amount)}</div>
          </div>
        ))}
        <div className="brk-total">
          <div className="tl">Totale stimato</div>
          <div className="tv">{formatEUR(cost.total)}</div>
        </div>
      </div>

      <button className="btn accent" style={{ marginTop: 16 }} onClick={onBuild} disabled={rooms.length === 0}>
        <Hammer size={18} /> Animazione illustrativa
      </button>

      <div className="disclaimer">
        <strong>Stime indicative.</strong> I prezzi sono valori orientativi medi per il mercato italiano e servono per sognare e confrontare scelte, non come preventivo. I costi reali dipendono da zona, terreno, impresa e periodo. Per cifre attendibili serve un geometra o un\u2019impresa edile.
      </div>
    </div>
  )
}
