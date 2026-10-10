import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { SSAOPass } from 'three/addons/postprocessing/SSAOPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { box, dreamModel, furnish } from '../lib/houseModels'
import { createMaterials } from '../lib/realisticMaterials'
import { roomArchitecture, detailedFurniture } from '../lib/interiorDetails'
import { STYLES, FLOORS } from '../lib/villa'
import { roomType } from '../lib/rooms'

export default function VillaView({ data, floor=0, compact=false, onLighting }) {
  const host=useRef(null), api=useRef({}), move=useRef({forward:0,turn:0})
  const [mode,setMode]=useState(compact?'model':'render'),[target,setTarget]=useState(''),[failed,setFailed]=useState(false),[all,setAll]=useState(false),[quality,setQuality]=useState('balanced'),[wide,setWide]=useState(false),[notice,setNotice]=useState('')
  const walk=mode==='walk',interior=mode!=='model'&&floor!==2
  const visible=data.rooms.filter(r=>r.floor===floor)
  const selected=visible.find(r=>r.id===target)||visible[0]
  useEffect(()=>{setTarget('');move.current={forward:0,turn:0}},[floor])
  useEffect(()=>{
    const el=host.current
    let renderer
    try {renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'})} catch {setFailed(true);return}
    renderer.setPixelRatio(compact?1:Math.min(devicePixelRatio,quality==='high'?2:1.25));renderer.shadowMap.enabled=!compact;renderer.shadowMap.type=T.PCFShadowMap
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=data.lighting==='sera'?1.15:1.1;renderer.outputColorSpace=T.SRGBColorSpace
    renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Villa 3D: trascina per guardarti intorno');el.appendChild(renderer.domElement)
    const scene=new T.Scene(),night=data.lighting==='sera',palette=STYLES[data.style]||STYLES.caldo
    scene.background=new T.Color(night?'#172832':'#dde8ec');scene.fog=new T.Fog(scene.background,80,200)
    let env=null
    if(interior){const environment=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);env=pmrem.fromScene(environment,.035);scene.environment=env.texture;scene.environmentIntensity=night?.22:.65;environment.dispose();pmrem.dispose()}
    scene.add(new T.HemisphereLight(night?0x90b2cd:0xe7f3ff,0x93826d,night?.25:.65))
    const camera=new T.PerspectiveCamera(interior?68:45,1,.035,interior?100:350)
    const sun=new T.DirectionalLight(night?0x95b1d4:0xffedcc,night?.65:3.4)
    const cx=selected?selected.x+selected.w/2:24,cz=selected?selected.y+selected.l/2:24
    sun.position.set(cx-9,18,cz-15);sun.target.position.set(cx,0,cz);sun.castShadow=true
    sun.shadow.mapSize.set(quality==='high'?2048:1024,quality==='high'?2048:1024)
    const shadowSize=interior?Math.max(selected?.w||10,selected?.l||10):55
    Object.assign(sun.shadow.camera,{left:-shadowSize,right:shadowSize,top:shadowSize,bottom:-shadowSize,far:100});sun.shadow.normalBias=.025;sun.shadow.bias=-.00015;scene.add(sun,sun.target)
    const orbit=new OrbitControls(camera,renderer.domElement);orbit.maxPolarAngle=Math.PI*.52;orbit.minDistance=interior?.6:4;orbit.maxDistance=150;orbit.enabled=!walk
    let ready=false,dead=false,composer=null,ao=null,output=null
    if(quality==='high'&&interior&&!compact){composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));ao=new SSAOPass(scene,camera,1,1,32);ao.kernelRadius=.55;ao.minDistance=.0001;ao.maxDistance=.012;output=new OutputPass();composer.addPass(ao);composer.addPass(output)}
    const render=()=>{if(ready&&!dead){if(composer)composer.render();else renderer.render(scene,camera)}}
    const materials=createMaterials(renderer,()=>render())
    const showAll=all&&!walk
    const rooms=showAll?data.rooms:interior&&selected?[selected]:visible
    const lot=data.lot||48
    if(floor===2 || showAll)box(scene,lot/2,-.45,lot/2,lot,.2,lot,'#a1b68b')
    else box(scene,lot/2,-.95,lot/2,lot,.1,lot,'#c3c4ae')
    for(const r of rooms) {
      const h=showAll && r.floor!==2?(r.floor+1)*6:0
      const g=new T.Group();g.position.set(r.x+r.w/2,h,r.y+r.l/2);scene.add(g)
      const outdoors=r.floor===2
      const roomDreams=Object.entries(data.dreams).filter(([,v])=>v.included&&v.roomId===r.id)
      const sunken=roomDreams.find(([id])=>id==='salotto-ribassato')?.[1]
      let pit=null
      if(sunken){const scale=Math.min(Math.min(r.w,r.l)/6*(sunken.scale||1),1.5),size=Math.min(3.5*scale,r.w*.85,r.l*.85),x=Math.max(-r.w/2+size/2,Math.min(r.w/2-size/2,(sunken.u??.5)*r.w-r.w/2)),z=Math.max(-r.l/2+size/2,Math.min(r.l/2-size/2,(sunken.v??.5)*r.l-r.l/2));pit={x,z,size,scale};const left=x-size/2+r.w/2,right=r.w/2-x-size/2,back=z-size/2+r.l/2,front=r.l/2-z-size/2;box(g,-r.w/2+left/2,-.06,0,left,.12,r.l,palette.floor);box(g,r.w/2-right/2,-.06,0,right,.12,r.l,palette.floor);box(g,x,-.06,-r.l/2+back/2,size,.12,back,palette.floor);box(g,x,-.06,r.l/2-front/2,size,.12,front,palette.floor);box(g,x,-.72,z,size,.12,size,palette.floor)}
      else box(g,0,-.06,0,r.w,.12,r.l,outdoors?'#91a27e':palette.floor)
      // UV della faccia superiore in metri: venature sempre alla stessa scala.
      g.traverse(o=>{if(o.isMesh){const uv=o.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*r.w/3,uv.getY(i)*r.l/3);o.material.dispose();o.material=materials.get(outdoors?'stone':data.style==='moderno'||['bagno','spa'].includes(r.type)?'stone':'wood',outdoors?'#929d7d':'#eee4d2')}})
      roomArchitecture(g,r,palette,materials,{interior,night})
      const hasBed=roomDreams.some(([id])=>id==='baldacchino')
      if(!(interior&&detailedFurniture(g,r,palette,materials,{sunken:!!pit,hasBed,night}))&&!pit)furnish(g,r,palette,hasBed)
      for(const [id,d]of roomDreams){const model=dreamModel(id);const scale=Math.min(r.w,r.l)/6*(d.scale||1);model.scale.setScalar(Math.min(scale,id==='baldacchino'?1:1.5));model.position.set((d.u??.5)*r.w-r.w/2,.03,(d.v??.5)*r.l-r.l/2);if(id==='salotto-ribassato'&&pit){model.position.set(pit.x,-.65,pit.z);model.scale.setScalar(pit.size/3.5)}model.rotation.y=(d.rotation||0)*Math.PI/180;g.add(model)}
      if(interior&&!outdoors){const light=new T.PointLight(night?0xffd9a0:0xfff2dc,night?22:12,Math.max(r.w,r.l)*2,2);light.position.set(0,2.6,0);g.add(light)}
      if(!interior&&!target&&!compact){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=90;const ctx=canvas.getContext('2d');ctx.fillStyle='#f9f6ee';ctx.fillRect(0,0,512,90);ctx.fillStyle='#263b31';ctx.textAlign='center';ctx.font='600 29px sans-serif';ctx.fillText(r.name||roomType(r.type).name,256,56,490);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false}));sprite.scale.set(Math.min(r.w,5),Math.min(r.w,5)*90/512,1);sprite.position.set(0,3.2,0);g.add(sprite)}
    }
    let yaw=0,pitch=0,drag=null,keys=new Set(),frame
    const enter=()=>{if(!selected)return;camera.position.set(selected.x+selected.w/2,1.65,selected.y+selected.l*.8);yaw=0;pitch=0;camera.rotation.order='YXZ';camera.rotation.set(0,0,0)}
    const reset=()=>{if(walk){enter();return}if(interior&&selected){camera.position.set(cx+selected.w*.32,1.75,cz+selected.l*.41);orbit.target.set(cx-selected.w*.12,1.1,cz-selected.l*.19);orbit.update();render();return}const focus=target&&selected&&!showAll?[selected]:rooms;const minX=focus.length?Math.min(...focus.map(r=>r.x)):0,maxX=focus.length?Math.max(...focus.map(r=>r.x+r.w)):lot,minZ=focus.length?Math.min(...focus.map(r=>r.y)):0,maxZ=focus.length?Math.max(...focus.map(r=>r.y+r.l)):lot;const centerX=(minX+maxX)/2,centerZ=(minZ+maxZ)/2;const dist=Math.max(maxX-minX,maxZ-minZ,8)*Math.max(1,el.clientHeight/el.clientWidth)*.67;camera.position.set(centerX+dist,dist*.95+(showAll?15:3),centerZ+dist);orbit.target.set(centerX,showAll?6:0,centerZ);orbit.update();render()}
    api.current={reset,download(){render();renderer.domElement.toBlob(blob=>{if(!blob){setNotice('Immagine non disponibile. Riprova.');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='casa-nostra-render.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setNotice('Immagine pronta nei download.')},'image/png')}}
    const resize=()=>{if(!el.clientWidth)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();composer?.setSize(el.clientWidth,el.clientHeight);if(!walk)reset();else render()}
    const down=e=>{if(!walk)return;renderer.domElement.focus();drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)}
    const pointer=e=>{if(!drag)return;yaw-=(e.clientX-drag.x)*.005;pitch=Math.max(-1,Math.min(1,pitch-(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY}}
    const up=()=>{drag=null}
    const keydown=e=>{if(!walk||!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();keys.add(e.key)}
    const keyup=e=>keys.delete(e.key)
    const stop=()=>{keys.clear();move.current={forward:0,turn:0}}
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',pointer);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);renderer.domElement.addEventListener('keydown',keydown);renderer.domElement.addEventListener('keyup',keyup);renderer.domElement.addEventListener('blur',stop);window.addEventListener('blur',stop)
    let last=performance.now()
    const animate=now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(walk){const forward=move.current.forward+(keys.has('w')||keys.has('ArrowUp')?1:0)-(keys.has('s')||keys.has('ArrowDown')?1:0),turn=move.current.turn+(keys.has('a')||keys.has('ArrowLeft')?1:0)-(keys.has('d')||keys.has('ArrowRight')?1:0);yaw+=turn*dt*1.3;camera.rotation.set(pitch,yaw,0);const bounds=interior&&selected?{x:selected.x+.25,z:selected.y+.25,w:selected.w-.5,l:selected.l-.5}:{x:0,z:0,w:lot,l:lot};camera.position.x=Math.max(bounds.x,Math.min(bounds.x+bounds.w,camera.position.x-Math.sin(yaw)*forward*dt*2.6));camera.position.z=Math.max(bounds.z,Math.min(bounds.z+bounds.l,camera.position.z-Math.cos(yaw)*forward*dt*2.6))}render();frame=requestAnimationFrame(animate)}
    const contextLost=e=>{e.preventDefault();setFailed(true)};renderer.domElement.addEventListener('webglcontextlost',contextLost)
    const observer=new ResizeObserver(resize);observer.observe(el);orbit.addEventListener('change',render);ready=true;resize();reset();if(walk){enter();frame=requestAnimationFrame(animate)}
    return()=>{dead=true;cancelAnimationFrame(frame);stop();observer.disconnect();window.removeEventListener('blur',stop);orbit.dispose();scene.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.filter(Boolean).forEach(m=>{m.map?.dispose();m.dispose()})});materials.dispose();env?.dispose();ao?.dispose();output?.dispose();composer?.dispose();renderer.dispose();renderer.domElement.remove();api.current={}}
  },[data.rooms,data.dreams,data.style,data.lighting,data.lot,floor,mode,target,all,quality,compact])
  const hold=(key,value)=>({onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);move.current[key]=value},onPointerUp:()=>{move.current[key]=0},onPointerCancel:()=>{move.current[key]=0},onLostPointerCapture:()=>{move.current[key]=0}})
  return <section className={'villa-view '+(compact?'compact':'')+(wide?' wide':'')}>
    {!compact&&<><div className="viewer-toolbar"><div><span className="eyebrow">{FLOORS.find(f=>f.id===floor)?.name}</span><h2>{mode==='model'?'Tutti gli spazi, insieme':selected?.name||'La tua casa'}</h2></div><div className="view-modes" aria-label="Modalità 3D">{[['render','Render stanza'],['model','Plastico'],['walk','Visita']].map(([id,label])=><button key={id} aria-pressed={mode===id} onClick={()=>{setMode(id);setAll(false)}}>{label}</button>)}</div></div>
      <div className="render-controls"><label>Ambiente<select value={target||((mode!=='model'&&selected)?selected.id:'')} onChange={e=>{setAll(false);setTarget(e.target.value)}}>{mode==='model'&&<option value="">Tutto il piano</option>}{visible.map(r=><option key={r.id} value={r.id}>{r.name||roomType(r.type).name}</option>)}</select></label>{onLighting&&<label>Luce<select value={data.lighting} onChange={e=>onLighting(e.target.value)}><option value="giorno">Luce naturale</option><option value="sera">Atmosfera serale</option></select></label>}<label>Qualità<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="balanced">Fluida</option><option value="high">Alta definizione</option></select></label></div></>}
    {failed?<p className="local-notice" role="alert">La vista 3D non è disponibile. Puoi continuare con Disegna e le altre schede. Ricarica l’app per riprovare.</p>:<div className="render-stage"><div className="villa-canvas" ref={host}/>{!compact&&<span className="render-caption">{walk?'Visita libera nella stanza':mode==='model'?'Plastico della disposizione':'Render 3D interattivo'} · {data.lighting==='sera'?'sera':'giorno'}</span>}{walk&&<div className="walk-pad" aria-label="Comandi per camminare"><button {...hold('turn',1)} aria-label="Gira a sinistra">↶</button><button {...hold('forward',1)} aria-label="Cammina avanti">↑</button><button {...hold('forward',-1)} aria-label="Cammina indietro">↓</button><button {...hold('turn',-1)} aria-label="Gira a destra">↷</button></div>}</div>}
    {!compact&&!failed&&<>
      <div className="viewer-options"><button className="btn secondary small" onClick={()=>api.current.reset?.()}>Ripristina inquadratura</button><button className="btn secondary small" onClick={()=>setWide(!wide)}>{wide?'Vista compatta':'Amplia la vista'}</button><button className="btn secondary small" onClick={()=>api.current.download?.()}>Salva immagine</button>{mode==='model'&&<label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> Tutti i livelli separati</label>}</div>
      <p className="muted">{walk?'Trascina per guardarti intorno. Tieni premute le frecce per camminare, oppure usa WASD dopo aver toccato la vista. Cambia ambiente dal selettore.':'Trascina per cambiare inquadratura · pizzica o usa la rotella per avvicinarti.'}</p><p role="status" className="muted">{notice}</p>
      <details className="render-info"><summary>Come leggere questa anteprima</summary><p>Geometrie e materiali sono una visualizzazione delle tue scelte. Arredi e desideri speciali sono modelli illustrativi; proporzioni e fattibilità vanno definite nel progetto architettonico. La visita resta entro la stanza selezionata, senza collisioni con gli arredi.</p></details>
    </>}
  </section>
}
