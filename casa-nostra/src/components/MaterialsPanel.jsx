import { Layers, Box, Triangle, Thermometer, Square, Sun, Flame, Check, Leaf, Minus, Plus } from 'lucide-react'
import { MATERIAL_GROUPS, optionById, totalArea, formatEUR } from '../lib/costs'

const ICONS = { layers: Layers, box: Box, triangle: Triangle, thermometer: Thermometer, square: Square, sun: Sun, flame: Flame }

export default function MaterialsPanel({ rooms, materials, onChange, onWindows }) {
  const area = totalArea(rooms)
  const windows = materials.windows ?? 8

  function lineAmount(group, opt) {
    if (group.unit === 'm2') return opt.price * area
    if (group.unit === 'unit') return opt.price * windows
    return opt.price
  }

  return (
    <div className="fade-up">
      {area === 0 && (
        <div className="alert info" style={{ marginBottom: 18 }}>
          Aggiungi prima qualche stanza: i costi a m² si calcolano sulla superficie della casa.
        </div>
      )}

      {MATERIAL_GROUPS.map((group) => {
        const Icon = ICONS[group.icon] || Box
        const selected = optionById(group.id, materials[group.id])
        const groupSum = lineAmount(group, selected)
        return (
          <div className="opt-group" key={group.id}>
            <div className="grp-head">
              <div className="gi"><Icon size={17} /></div>
              <h3>{group.label}</h3>
              <span className="grp-sum">{formatEUR(groupSum)}</span>
            </div>

            {group.id === 'finestre' && (
              <div className="opt" style={{ justifyContent: 'space-between' }}>
                <div className="o-body">
                  <h4>Numero di finestre</h4>
                  <p>Influisce sul costo totale degli infissi</p>
                </div>
                <div className="stepper" style={{ width: 130, height: 44 }}>
                  <button onClick={() => onWindows(Math.max(0, windows - 1))} aria-label="Meno"><Minus size={18} /></button>
                  <span className="val num">{windows}</span>
                  <button onClick={() => onWindows(windows + 1)} aria-label="Più"><Plus size={18} /></button>
                </div>
              </div>
            )}

            {group.options.map((opt) => {
              const active = selected.id === opt.id
              return (
                <div key={opt.id}>
                  <button
                    className={'opt' + (active ? ' active' : '')}
                    style={{ width: '100%', textAlign: 'left' }}
                    onClick={() => onChange(group.id, opt.id)}
                  >
                    <span className="check">{active && <Check size={13} />}</span>
                    <span className="o-body">
                      <h4>{opt.name}</h4>
                      <p>{opt.desc}</p>
                    </span>
                    <span className="o-price">{formatEUR(lineAmount(group, opt))}</span>
                  </button>
                  {active && opt.eco && (
                    <div className="eco-note">
                      <Leaf size={15} />
                      <p>{opt.eco}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
