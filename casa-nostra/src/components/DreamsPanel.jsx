import { DREAM_IDEAS, DREAM_SOURCE } from '../lib/dreams'
import { FLOORS } from '../lib/villa'
import { roomType } from '../lib/rooms'
export default function DreamsPanel({ dreams, rooms = [], onChange }) {
  const count = DREAM_IDEAS.filter(idea => dreams[idea.id]?.included).length
  return <section className="dreams-panel">
    <div className="dream-heading"><span className="eyebrow">La casa che immagini</span><h2>I tuoi desideri</h2>
      <p>{count} idee nella tua casa. Puoi cambiare la selezione e aggiungere una nota a ciascuna.</p>
      <a href={DREAM_SOURCE} target="_blank" rel="noreferrer">Rivedi il post di imprenditore.it ↗</a>
    </div>
    <p className="dream-note">Ogni idea ha una rappresentazione 3D concettuale. Scegli l’ambiente, regola posizione e dimensione e guardala in «Esplora 3D». Costi e fattibilità restano da valutare.</p>
    {DREAM_IDEAS.map((idea, index) => {
      const value = dreams[idea.id] || { included: false, note: '' }
      return <article className={'card dream-card' + (value.included ? ' included' : '')} key={idea.id}>
        <label className="dream-choice"><span className="dream-number">{String(index + 1).padStart(2, '0')}</span>
          <span><small>{idea.area}</small><strong>{idea.name}</strong></span>
          <input type="checkbox" checked={value.included} onChange={e => onChange(idea.id, { ...value, included: e.target.checked })} aria-label={'Includi: ' + idea.name} />
        </label>
        <p>{idea.description}</p>
        {value.included&&<div className="dream-placement"><label>In quale ambiente?<select value={value.roomId||''} onChange={e=>onChange(idea.id,{...value,roomId:e.target.value})}><option value="">Da collocare</option>{rooms.map(r=><option key={r.id} value={r.id}>{r.name||roomType(r.type).name} · {FLOORS.find(f=>f.id===r.floor)?.name}</option>)}</select></label>{value.roomId&&<div className="measure-grid">{[['u','Da sinistra',0,1,.05,.5],['v','Dall’alto',0,1,.05,.5],['rotation','Rotazione',0,360,15,0],['scale','Dimensione',.25,2,.25,1]].map(([key,label,min,max,step,def])=><label key={key}>{label}: {key==='rotation'?(value[key]??def)+'°':key==='scale'?(value[key]??def)+'×':Math.round((value[key]??def)*100)+'%'}<input aria-label={label+': '+idea.name} type="range" min={min} max={max} step={step} value={value[key]??def} onChange={e=>onChange(idea.id,{...value,[key]:Number(e.target.value)})}/></label>)}</div>}</div>}
        <label className="dream-label">Come la immagini?
          <textarea rows="2" value={value.note} placeholder="Posizione, stile o un dettaglio da ricordare…" onChange={e => onChange(idea.id, { ...value, note: e.target.value })} aria-label={'Nota: ' + idea.name} />
        </label>
      </article>
    })}
  </section>
}
