import { lazy, Suspense, useState } from 'react'
import { captureVersion, restoreVersion, projectStats, STYLES } from '../lib/villa'
const VillaView=lazy(()=>import('./VillaView'))
export default function VersionsPanel({data,onChange,floor}) {
  const [name,setName]=useState(''),[left,setLeft]=useState('current'),[right,setRight]=useState(data.versions[0]?.id||'current')
  const options=[{id:'current',name:'Progetto attuale',data},...data.versions]
  const a=options.find(v=>v.id===left)||options[0],b=options.find(v=>v.id===right)||options[0]
  function save(){const version=captureVersion(data,name);onChange({...data,versions:[...data.versions,version]});setRight(version.id);setName('')}
  return <section><div className="dream-heading"><span className="eyebrow">Scegli insieme ad Asia</span><h2>Quale casa vi somiglia?</h2><p>Conserva una versione, modifica il progetto e confronta le due alternative.</p></div>
    <div className="card panel-pad"><label>Nome della versione<input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Es. Living aperto, legno naturale" maxLength={100}/></label><button className="btn accent" onClick={save}>Conserva questa versione</button></div>
    <div className="comparison-grid">{[[a,setLeft,'Alternativa A'],[b,setRight,'Alternativa B']].map(([version,set,label])=><article className="card panel-pad" key={label}><label>{label}<select value={version.id} onChange={e=>set(e.target.value)}>{options.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label><Suspense fallback={<p>Preparo il confronto…</p>}><VillaView data={version.data} floor={floor} compact/></Suspense><VersionStats data={version.data}/>{version.id!=='current'&&<><small>{new Date(version.created_at).toLocaleString('it-IT')}</small><button className="btn secondary" onClick={()=>onChange(restoreVersion(data,version.id))}>Riparti da questa versione</button></>}</article>)}</div>
    <p className="dream-note">Il confronto mostra il piano selezionato. Quando riparti da una versione, il progetto attuale viene conservato automaticamente come «Prima del ripristino».</p>
  </section>
}
function VersionStats({data}) {const s=projectStats(data);return <dl className="stats"><div><dt>Interni</dt><dd>{s.area} m²</dd></div><div><dt>Ambienti</dt><dd>{s.rooms}</dd></div><div><dt>Desideri</dt><dd>{s.dreams}</dd></div><div><dt>Stile</dt><dd>{STYLES[data.style]?.name||'Mediterraneo caldo'}</dd></div></dl>}
