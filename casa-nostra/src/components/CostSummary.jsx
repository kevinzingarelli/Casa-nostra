import { useState } from 'react'
import { computeCost, formatEUR } from '../lib/costs'

export const EXTRA_COSTS = [['terreno','Terreno'],['esterni','Giardino, piscina e opere esterne'],['arredi','Arredi e finiture interne'],['speciali','Spa, cinema e desideri speciali'],['oneri','IVA, acquisto e altri oneri'],['imprevisti','Margine per imprevisti']]

export default function CostSummary({data,onChange}) {
  const [open,setOpen]=useState(false)
  const estimate=computeCost(data.rooms.filter(r=>r.floor!==2),data.materials)
  const extras=data.costExtras||{}
  const provided=EXTRA_COSTS.filter(([id])=>extras[id]!==''&&extras[id]!=null&&Number.isFinite(Number(extras[id])))
  const total=estimate.total+provided.reduce((sum,[id])=>sum+Math.max(0,Number(extras[id])),0)
  const missing=EXTRA_COSTS.length-provided.length
  return <section className="cost-summary" aria-label="Riepilogo dei costi">
    <div className="cost-summary-bar"><div><span>{missing?'Stima parziale':'Stima complessiva'} · indicativa</span><strong>{formatEUR(total)}</strong></div><button aria-expanded={open} aria-controls="cost-detail" onClick={()=>setOpen(!open)}>{open?'Chiudi dettagli':'Dettaglio costi'} <span aria-hidden="true">{open?'−':'↗'}</span></button></div>
    {open&&<div id="cost-detail" className="cost-detail"><h2>Da cosa nasce la stima</h2><p className="muted">Il listino storico dell’app non è un preventivo aggiornato. Il calcolo di base è semplificato sulla superficie degli interni; terreno, arredi ed extra vanno aggiunti qui.</p>
      <dl>{estimate.lines.map(line=><div className="cost-line" key={line.groupId}><dt>{line.groupLabel}<small>{line.detail}</small></dt><dd>{formatEUR(line.amount)}</dd></div>)}</dl>
      <h3>Completa le spese mancanti</h3><p className="muted">Usa preventivi o tue ipotesi. Un campo vuoto resta «da stimare»; inserisci 0 solo se la voce non è prevista. Evita di contare due volte la stessa spesa.</p>
      <div className="extra-cost-grid">{EXTRA_COSTS.map(([id,label])=><label key={id}>{label} (€)<input type="number" min="0" step="100" inputMode="decimal" placeholder="Da stimare" value={extras[id]??''} onChange={e=>{const value=e.target.value; if(value!==''&&(!Number.isFinite(Number(value))||Number(value)<0))return;onChange({...data,costExtras:{...extras,[id]:value===''?'':Number(value)}})}}/></label>)}</div>
      <p className="cost-completeness">{missing?`${missing} voci ancora da stimare. Il numero in alto non è il costo finale della casa.`:'Tutte le categorie compilate. Importi e fattibilità restano da verificare con i professionisti.'}</p>
    </div>}
  </section>
}
