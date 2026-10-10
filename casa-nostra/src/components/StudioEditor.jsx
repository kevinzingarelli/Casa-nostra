import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { supabase, PROJECTS_TABLE } from '../lib/supabase'
import { listLocalProjects, saveLocalProject, downloadProject } from '../lib/localProjects'
import { normalizeData, makeVilla, captureVersion, FLOORS, STYLES, projectStats } from '../lib/villa'
import { ROOM_TYPES, roomType } from '../lib/rooms'
import { DREAM_IDEAS } from '../lib/dreams'
import FloorPlan from './FloorPlan'
import DreamsPanel from './DreamsPanel'
import MaterialsPanel from './MaterialsPanel'
import VersionsPanel from './VersionsPanel'
import ViewBoundary from './ViewBoundary'
const VillaView=lazy(()=>import('./VillaView'))

export default function StudioEditor({projectId,local=false,onBack}) {
  const [row,setRow]=useState(null),[tab,setTab]=useState('view'),[floor,setFloor]=useState(0),[selected,setSelected]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState(''),[conflict,setConflict]=useState(false),[add,setAdd]=useState(false),[invite,setInvite]=useState('')
  const base=useRef(null),current=useRef(null),queue=useRef(Promise.resolve()),dirty=useRef(false),alive=useRef(true)
  current.current=row
  useEffect(()=>{alive.current=true;let cancelled=false;(async()=>{try{const result=local?{data:listLocalProjects().find(p=>p.id===projectId)}:await supabase.from(PROJECTS_TABLE).select('*').eq('id',projectId).single();if(result.error||!result.data)throw new Error('Non riesco ad aprire il progetto. I dati non sono stati modificati.');if(cancelled)return;const next={...result.data,data:normalizeData(result.data.data)};base.current=next;setRow(next)}catch(e){setError(e.message)}})();return()=>{cancelled=true;alive.current=false}},[projectId,local])
  function update(data){dirty.current=true;setRow(r=>({...r,data}));setMessage('Modifiche da salvare')}
  function save(snapshot=current.current){
    const run=async()=>{if(!snapshot||conflict)return false;if(JSON.stringify(snapshot)===JSON.stringify(base.current)){dirty.current=false;return true}
      try{
        const next={...snapshot,updated_at:new Date(Math.max(Date.now(),Date.parse(base.current.updated_at||0)+1||0)).toISOString()}
        if(local){const stored=listLocalProjects().find(p=>p.id===projectId);if(stored&&stored.updated_at!==base.current.updated_at)throw Object.assign(new Error('Il progetto è cambiato in un’altra scheda.'),{conflict:true});saveLocalProject(next)}
        else{
          const result=await supabase.from(PROJECTS_TABLE).update({name:next.name,house_type:next.house_type,data:next.data,updated_at:next.updated_at}).eq('id',projectId).eq('updated_at',base.current.updated_at).select('*').maybeSingle()
          if(result.error)throw result.error;if(!result.data)throw Object.assign(new Error('Il progetto è cambiato su un altro dispositivo. Le tue modifiche restano qui.'),{conflict:true})
          next.updated_at=result.data.updated_at
          try{saveLocalProject({...next,id:'backup-'+projectId,name:next.name+' · copia offline'})}catch{/* Il cloud è confermato; nessuna falsa segnalazione di mancato salvataggio. */}
        }
        base.current=next
        dirty.current=current.current!==snapshot
        if(alive.current){setMessage(dirty.current?'Modifiche da salvare':local?'Salvato sul dispositivo':'Salvato online');setError('')}
        return true
      }catch(e){dirty.current=true;if(alive.current){setError(e.message||'Salvataggio non riuscito. Esporta una copia e riprova.');setMessage('Da salvare');if(e.conflict)setConflict(true)}return false}
    };queue.current=queue.current.then(run,run);return queue.current
  }
  useEffect(()=>{if(!row||!dirty.current||conflict)return;if(local){save(row);return}const timer=setTimeout(()=>save(row),700);return()=>clearTimeout(timer)},[row,conflict])
  useEffect(()=>{const warn=e=>{if(dirty.current){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[])
  useEffect(()=>{if(local||!row)return;let cancelled=false;const poll=async()=>{if(dirty.current)return;const {data,error}=await supabase.from(PROJECTS_TABLE).select('*').eq('id',projectId).single();if(!cancelled&&!error&&data&&data.updated_at!==base.current.updated_at&&!dirty.current){const next={...data,data:normalizeData(data.data)};base.current=next;setRow(next);setMessage('Aggiornato dall’altro dispositivo')}};const timer=setInterval(poll,12000);return()=>{cancelled=true;clearInterval(timer)}},[local,!!row,projectId])
  async function leave(){if(!dirty.current||await save())onBack()}
  async function share(){setError('');const {data,error}=await supabase.rpc('casa_nostra_create_invite',{project:projectId});if(error)setError('Solo il proprietario può creare un invito. '+error.message);else setInvite(data)}
  function keepConflict(){try{saveLocalProject({...row,id:crypto.randomUUID(),name:row.name+' · modifiche da unire',updated_at:new Date().toISOString()});dirty.current=false;onBack()}catch(e){setError(e.message)}}
  if(!row)return <div className="auth-wrap"><p>{error||'Apro la tua casa…'}</p><button className="btn secondary" onClick={onBack}>Torna ai progetti</button></div>
  const d=row.data,rooms=d.rooms.filter(r=>r.floor===floor),room=d.rooms.find(r=>r.id===selected),stats=projectStats(d)
  const changeRoom=(id,patch)=>update({...d,rooms:d.rooms.map(r=>r.id===id?{...r,...patch}:r)})
  function fullVilla(){const villa=makeVilla();for(const[id,old]of Object.entries(d.dreams)){if(villa.dreams[id])villa.dreams[id]={...villa.dreams[id],included:old.included,note:old.note||''}}update({...d,...villa,materials:d.materials,versions:[...d.versions,captureVersion(d,'Prima della villa completa')]});setFloor(0);setTab('view')}
  function removeRoom(){update({...d,rooms:d.rooms.filter(r=>r.id!==room.id),versions:[...d.versions,captureVersion(d,'Prima di togliere '+(room.name||roomType(room.type).name))]});setSelected('')}
  function newRoom(type){const t=roomType(type),r={id:crypto.randomUUID(),type,name:t.name,floor,x:1,y:1,w:t.w,l:t.l};update({...d,rooms:[...d.rooms,r]});setSelected(r.id);setAdd(false)}
  function numberRoom(key,value){const n=Number(value);if(!Number.isFinite(n))return;const next={...room,[key]:n};next.w=Math.max(1,Math.min(d.lot,next.w));next.l=Math.max(1,Math.min(d.lot,next.l));next.x=Math.max(0,Math.min(d.lot-next.w,next.x));next.y=Math.max(0,Math.min(d.lot-next.l,next.y));changeRoom(room.id,next)}
  const unplaced=DREAM_IDEAS.filter(i=>d.dreams[i.id]?.included&&!d.rooms.some(r=>r.id===d.dreams[i.id]?.roomId)).length
  return <div className="app studio"><header className="topbar"><button className="back" onClick={leave} aria-label="Torna ai progetti">←</button><span className="title">{row.name}</span><span className="version-badge">v2.0</span></header><main className="screen">
    <div className="editor-meta"><span role="status">{message||(local?'Su questo dispositivo':'Progetto online')}</span><button onClick={()=>downloadProject(row)}>Esporta copia</button></div>
    {!local&&PROJECTS_TABLE==='casa_nostra_projects'&&<details className="share-panel"><summary>Progetta insieme ad Asia</summary><p>Genera un codice e condividilo con chi vuoi invitare. Potrà leggere e modificare questa casa dal proprio account. Il codice scade dopo 7 giorni.</p><button className="btn secondary" onClick={share}>Genera codice di invito</button>{invite&&<label>Codice da copiare<input className="input" readOnly value={invite} onFocus={e=>e.target.select()}/></label>}</details>}
    {error&&<div className="alert error" role="alert"><p>{error}</p>{conflict?<button className="btn secondary" onClick={keepConflict}>Conserva le mie modifiche in una copia</button>:<button className="btn secondary" onClick={()=>save()}>Riprova il salvataggio</button>}</div>}
    <div className="studio-heading"><span className="eyebrow">Spazio alla vostra immaginazione</span><h1>La casa, come la volete.</h1><p>{stats.rooms} ambienti interni · {stats.area} m² · {stats.dreams} desideri</p></div>
    {d.lot===22&&<div className="local-notice"><p>Puoi partire dalla nuova villa su tre livelli e giardino. Conserveremo questa pianta tra le versioni e manterremo le note dei tuoi desideri.</p><button className="btn secondary" onClick={fullVilla}>Prova la villa completa</button></div>}
    <nav className="studio-tabs" aria-label="Viste del progetto">{[['view','Esplora 3D'],['plan','Disegna'],['dreams','Desideri'],['versions','Confronta'],['style','Stile e materiali']].map(([id,label])=><button key={id} aria-current={tab===id?'page':undefined} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    <div className="floor-tabs" aria-label="Piani della villa">{FLOORS.map(f=><button key={f.id} aria-pressed={floor===f.id} onClick={()=>{setFloor(f.id);setSelected('')}}>{f.name}<small>{d.rooms.filter(r=>r.floor===f.id).length}</small></button>)}</div>
    {tab==='view'&&<><ViewBoundary><Suspense fallback={<p role="status">Preparo la tua villa…</p>}><VillaView data={d} floor={floor}/></Suspense></ViewBoundary>{unplaced>0&&<button className="btn secondary" onClick={()=>setTab('dreams')}>{unplaced} desideri da collocare negli ambienti</button>}</>}
    {tab==='plan'&&<section><FloorPlan rooms={rooms} lot={d.lot} selectedId={selected} onSelect={setSelected} onMove={(id,x,y)=>changeRoom(id,{x,y})}/>
      {room&&<div className="card panel-pad room-fields"><label>Nome dell’ambiente<input className="input" value={room.name||roomType(room.type).name} onChange={e=>changeRoom(room.id,{name:e.target.value})}/></label><label>Piano<select value={room.floor} onChange={e=>{changeRoom(room.id,{floor:Number(e.target.value)});setFloor(Number(e.target.value))}}>{FLOORS.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}</select></label><div className="measure-grid">{[['w','Larghezza'],['l','Profondità'],['x','Posizione X'],['y','Posizione Y']].map(([key,label])=><label key={key}>{label} (m)<input type="number" min={['w','l'].includes(key)?1:0} max={d.lot} step="0.5" value={room[key]} onChange={e=>numberRoom(key,e.target.value)}/></label>)}</div><p className="muted">{room.w*room.l} m² · Puoi anche trascinare l’ambiente sulla pianta.</p></div>}
      {room&&<div className="room-remove"><button className="btn secondary" onClick={removeRoom}>Togli questo ambiente dalla pianta</button><p className="muted">Una copia della pianta attuale resterà tra le versioni.</p></div>}
      <button className="btn secondary" onClick={()=>setAdd(!add)}>Aggiungi un ambiente</button>{add&&<div className="type-grid">{ROOM_TYPES.map(t=><button className="type-pick" key={t.id} onClick={()=>newRoom(t.id)}>{t.name}</button>)}</div>}
      <div className="room-list">{rooms.map(r=><button key={r.id} className={'room-row '+(selected===r.id?'selected':'')} onClick={()=>setSelected(r.id)}><span className="room-dot" style={{background:roomType(r.type).color}}/><span>{r.name||roomType(r.type).name}<small>{r.w} × {r.l} m</small></span></button>)}</div>
      <p className="dream-note">Lotto di lavoro {d.lot} × {d.lot} m. Le stanze possono sovrapporsi durante le prove: la disposizione definitiva va verificata.</p>
    </section>}
    {tab==='dreams'&&<DreamsPanel dreams={d.dreams} rooms={d.rooms} onChange={(id,value)=>update({...d,dreams:{...d.dreams,[id]:value}})}/>}
    {tab==='versions'&&<ViewBoundary><VersionsPanel data={d} floor={floor} onChange={update}/></ViewBoundary>}
    {tab==='style'&&<section><div className="dream-heading"><h2>L’atmosfera di casa</h2><p>Finiture e luce cambiano subito nella vista 3D e restano nelle versioni.</p></div><div className="style-grid">{Object.entries(STYLES).map(([id,p])=><button className={'card style-pick '+(d.style===id?'active':'')} key={id} onClick={()=>update({...d,style:id})}><span style={{background:`linear-gradient(135deg,${p.wall} 33%,${p.floor} 33%,${p.floor} 66%,${p.accent} 66%)`}}/>{p.name}</button>)}</div><label className="field">Luce<select value={d.lighting} onChange={e=>update({...d,lighting:e.target.value})}><option value="giorno">Giorno</option><option value="sera">Sera, luci calde</option></select></label><label className="field">Nome del progetto<input className="input" value={row.name} onChange={e=>{dirty.current=true;setRow({...row,name:e.target.value})}}/></label><MaterialsPanel rooms={d.rooms.filter(r=>r.floor!==2)} materials={d.materials} onChange={(g,o)=>update({...d,materials:{...d.materials,[g]:o}})} onWindows={n=>update({...d,materials:{...d.materials,windows:n}})}/><p className="dream-note">Il listino storico riguarda solo una stima parziale dei materiali. Non comprende terreno, esterni, arredi, spa e desideri speciali e non rappresenta il budget della villa.</p></section>}
    <footer className="app-footer">Casa Nostra · un prodotto Kesia s.r.l.</footer>
  </main></div>
}
