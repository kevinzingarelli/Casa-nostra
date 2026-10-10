import {useState} from 'react'
export default function ReleaseNote(){
  const [read,setRead]=useState(()=>{try{return localStorage.getItem('casa-nostra:read:2.0')==='yes'}catch{return false}})
  return <details className="release-note"><summary>{!read?'● ':''}🏡 La villa da esplorare · v2.0 · {new Date(__BUILD_TIME__).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}</summary><p>Tre livelli e giardino, sedici desideri in 3D, visita interna, finiture e luce giorno/sera. Versioni confrontabili e importazione delle copie.</p><p>Provati salvataggio locale, recupero delle versioni e formati telefono. Il servizio condiviso richiede un archivio cloud attivo.</p><label style={{display:'flex',alignItems:'center',gap:10,minHeight:44}}><input type="checkbox" checked={read} onChange={e=>{setRead(e.target.checked);try{localStorage.setItem('casa-nostra:read:2.0',e.target.checked?'yes':'no')}catch{}}}/>Letto</label></details>
}
