import { DREAM_IDEAS, DREAM_SOURCE } from '../lib/dreams'
export default function DreamsPanel({ dreams, onChange }) {
  const count = DREAM_IDEAS.filter(idea => dreams[idea.id]?.included).length
  return <section className="dreams-panel">
    <div className="dream-heading"><span className="eyebrow">La casa che immagini</span><h2>I tuoi desideri</h2>
      <p>{count} idee nella tua casa. Puoi cambiare la selezione e aggiungere una nota a ciascuna.</p>
      <a href={DREAM_SOURCE} target="_blank" rel="noreferrer">Rivedi il post di imprenditore.it ↗</a>
    </div>
    <p className="dream-note">Le 16 idee del post sono selezionate alla creazione del progetto. Sono ispirazioni concettuali: costi e fattibilità sono da valutare. Non sono ancora rappresentate nella vista 3D né incluse nella stima.</p>
    {DREAM_IDEAS.map((idea, index) => {
      const value = dreams[idea.id] || { included: false, note: '' }
      return <article className={'card dream-card' + (value.included ? ' included' : '')} key={idea.id}>
        <label className="dream-choice"><span className="dream-number">{String(index + 1).padStart(2, '0')}</span>
          <span><small>{idea.area}</small><strong>{idea.name}</strong></span>
          <input type="checkbox" checked={value.included} onChange={e => onChange(idea.id, { ...value, included: e.target.checked })} aria-label={'Includi: ' + idea.name} />
        </label>
        <p>{idea.description}</p>
        <label className="dream-label">Come la immagini?
          <textarea rows="2" value={value.note} placeholder="Posizione, stile o un dettaglio da ricordare…" onChange={e => onChange(idea.id, { ...value, note: e.target.value })} aria-label={'Nota: ' + idea.name} />
        </label>
      </article>
    })}
  </section>
}
