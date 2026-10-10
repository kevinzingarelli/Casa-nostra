import { useEffect, useRef, useState } from 'react'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { box, dreamModel, furnish } from '../lib/houseModels'
import { STYLES, FLOORS } from '../lib/villa'
import { roomType } from '../lib/rooms'

export default function VillaView({ data, floor=0, compact=false }) {
  const host=useRef(null), api=useRef({}), move=useRef({forward:0,turn:0})
  const [walk,setWalk]=useState(false),[target,setTarget]=useState(''),[failed,setFailed]=useState(false),[all,setAll]=useState(false)
  const visible=data.rooms.filter(r=>r.floor===floor)
  const selected=visible.find(r=>r.id===target)||visible[0]
  useEffect(()=>{setTarget('');setWalk(false)},[floor])
  useEffect(()=>{
    const el=host.current
    let renderer
    try {renderer=new T.WebGLRenderer({antialias:true})} catch {setFailed(true);return}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap
    renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Villa 3D: trascina per guardarti intorno');el.appendChild(renderer.domElement)
    const scene=new T.Scene(),night=data.lighting==='sera',palette=STYLES[data.style]||STYLES.caldo
    scene.background=new T.Color(night?'#283b4b':'#e5ece6');scene.fog=new T.Fog(scene.background,100,220)
    scene.add(new T.HemisphereLight(night?0xabc7ef:0xffffff,0x66724f,night?1:1.7))
    const sun=new T.DirectionalLight(night?0xffd5a0:0xfff2dc,night?2:1.8);sun.position.set(-20,45,20);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-60;sun.shadow.camera.right=60;sun.shadow.camera.top=60;sun.shadow.camera.bottom=-60;sun.shadow.camera.far=140;scene.add(sun)
    const camera=new T.PerspectiveCamera(50,1,.05,350)
    const orbit=new OrbitControls(camera,renderer.domElement);orbit.maxPolarAngle=Math.PI/2.03;orbit.minDistance=4;orbit.maxDistance=150;orbit.enabled=!walk
    const showAll=all&&!walk
    const rooms=showAll?data.rooms:visible
    const lot=data.lot||48
    if(floor===2 || showAll)box(scene,lot/2,-.45,lot/2,lot,.2,lot,'#a1b68b')
    else box(scene,lot/2,-.95,lot/2,lot,.1,lot,'#d7dece')
    for(const r of rooms) {
      const h=showAll && r.floor!==2?(r.floor+1)*6:0
      const g=new T.Group();g.position.set(r.x+r.w/2,h,r.y+r.l/2);scene.add(g)
      const outdoors=r.floor===2
      const roomDreams=Object.entries(data.dreams).filter(([,v])=>v.included&&v.roomId===r.id)
      const sunken=roomDreams.find(([id])=>id==='salotto-ribassato')?.[1]
      let pit=null
      if(sunken){const scale=Math.min(Math.min(r.w,r.l)/6*(sunken.scale||1),1.5),size=Math.min(3.5*scale,r.w*.85,r.l*.85),x=Math.max(-r.w/2+size/2,Math.min(r.w/2-size/2,(sunken.u??.5)*r.w-r.w/2)),z=Math.max(-r.l/2+size/2,Math.min(r.l/2-size/2,(sunken.v??.5)*r.l-r.l/2));pit={x,z,size,scale};const left=x-size/2+r.w/2,right=r.w/2-x-size/2,back=z-size/2+r.l/2,front=r.l/2-z-size/2;box(g,-r.w/2+left/2,-.06,0,left,.12,r.l,palette.floor);box(g,r.w/2-right/2,-.06,0,right,.12,r.l,palette.floor);box(g,x,-.06,-r.l/2+back/2,size,.12,back,palette.floor);box(g,x,-.06,r.l/2-front/2,size,.12,front,palette.floor);box(g,x,-.72,z,size,.12,size,palette.floor)}
      else box(g,0,-.06,0,r.w,.12,r.l,outdoors?'#91a27e':palette.floor)
      if(!outdoors){
        // Pareti laterali in sezione, ingresso frontale aperto per esplorare.
        const wallH=walk?2.9:1.4
        box(g,-r.w/2,wallH/2,0,.12,wallH,r.l,palette.wall)
        box(g,0,.4,-r.l/2,r.w,.8,.12,palette.wall)
        box(g,0,1.5,-r.l/2,r.w*.7,1.35,.07,'#b8d4d5',{transparent:true,opacity:.28,roughness:.2})
        box(g,0,2.55,-r.l/2,r.w,.7,.12,palette.wall)
        if(walk){box(g,r.w/2,1.45,0,.12,2.9,r.l,palette.wall);box(g,0,2.95,0,r.w,.1,r.l,palette.wall)}
        // Listelli visibili anche senza texture esterne.
        if(data.style!=='moderno'&&!pit)for(let x=-r.w/2+.3;x<r.w/2;x+=.45)box(g,x,.008,0,.015,.012,r.l,'#9c805e')
      }
      if(!roomDreams.some(([id])=>id==='salotto-ribassato'))furnish(g,r,palette,roomDreams.some(([id])=>id==='baldacchino'))
      for(const [id,d]of roomDreams){const model=dreamModel(id);const scale=Math.min(r.w,r.l)/6*(d.scale||1);model.scale.setScalar(Math.min(scale,1.5));model.position.set((d.u??.5)*r.w-r.w/2,.03,(d.v??.5)*r.l-r.l/2);if(id==='salotto-ribassato'&&pit){model.position.set(pit.x,-.65,pit.z);model.scale.setScalar(pit.size/3.5)}model.rotation.y=(d.rotation||0)*Math.PI/180;g.add(model)}
      if((night||walk)&&!outdoors){const light=new T.PointLight(night?0xffd9a0:0xfff2dc,night?18:24,15,2);light.position.set(0,2.4,0);g.add(light)}
      if(!walk){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=90;const ctx=canvas.getContext('2d');ctx.fillStyle='#f9f6ee';ctx.fillRect(0,0,512,90);ctx.fillStyle='#263b31';ctx.textAlign='center';ctx.font='600 29px sans-serif';ctx.fillText(r.name||roomType(r.type).name,256,56,490);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),depthTest:false}));sprite.scale.set(Math.min(r.w,5),Math.min(r.w,5)*90/512,1);sprite.position.set(0,3.2,0);g.add(sprite)}
    }
    let yaw=0,pitch=0,drag=null,keys=new Set(),frame
    const render=()=>renderer.render(scene,camera)
    const enter=()=>{if(!selected)return;camera.position.set(selected.x+selected.w/2,1.65,selected.y+selected.l*.8);yaw=0;pitch=0;camera.rotation.order='YXZ';camera.rotation.set(0,0,0)}
    const reset=()=>{if(walk){enter();return}const focus=target&&selected&&!showAll?[selected]:rooms;const minX=focus.length?Math.min(...focus.map(r=>r.x)):0,maxX=focus.length?Math.max(...focus.map(r=>r.x+r.w)):lot,minZ=focus.length?Math.min(...focus.map(r=>r.y)):0,maxZ=focus.length?Math.max(...focus.map(r=>r.y+r.l)):lot;const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2;const dist=Math.max(maxX-minX,maxZ-minZ,8)*Math.max(1,el.clientHeight/el.clientWidth)*.67;camera.position.set(cx+dist,dist*.95+(showAll?15:3),cz+dist);orbit.target.set(cx,showAll?6:0,cz);orbit.update();render()}
    api.current={reset}
    const resize=()=>{if(!el.clientWidth)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();if(!walk)reset();else render()}
    const down=e=>{if(!walk)return;renderer.domElement.focus();drag={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId)}
    const pointer=e=>{if(!drag)return;yaw-=(e.clientX-drag.x)*.005;pitch=Math.max(-1,Math.min(1,pitch-(e.clientY-drag.y)*.004));drag={x:e.clientX,y:e.clientY}}
    const up=()=>{drag=null}
    const keydown=e=>{if(!walk||!['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();keys.add(e.key)}
    const keyup=e=>keys.delete(e.key)
    const stop=()=>{keys.clear();move.current={forward:0,turn:0}}
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',pointer);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);renderer.domElement.addEventListener('keydown',keydown);renderer.domElement.addEventListener('keyup',keyup);renderer.domElement.addEventListener('blur',stop);window.addEventListener('blur',stop)
    let last=performance.now()
    const animate=now=>{const dt=Math.min((now-last)/1000,.05);last=now;if(walk){const forward=move.current.forward+(keys.has('w')||keys.has('ArrowUp')?1:0)-(keys.has('s')||keys.has('ArrowDown')?1:0),turn=move.current.turn+(keys.has('a')||keys.has('ArrowLeft')?1:0)-(keys.has('d')||keys.has('ArrowRight')?1:0);yaw+=turn*dt*1.3;camera.rotation.set(pitch,yaw,0);camera.position.x=Math.max(0,Math.min(lot,camera.position.x-Math.sin(yaw)*forward*dt*2.6));camera.position.z=Math.max(0,Math.min(lot,camera.position.z-Math.cos(yaw)*forward*dt*2.6))}render();frame=requestAnimationFrame(animate)}
    const observer=new ResizeObserver(resize);observer.observe(el);orbit.addEventListener('change',render);resize();reset();if(walk){enter();frame=requestAnimationFrame(animate)}
    return()=>{cancelAnimationFrame(frame);stop();observer.disconnect();window.removeEventListener('blur',stop);orbit.dispose();scene.traverse(o=>{o.geometry?.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.filter(Boolean).forEach(m=>{m.map?.dispose();m.dispose()})});renderer.dispose();renderer.domElement.remove();api.current={}}
  },[data,floor,walk,target,all])
  const hold=(key,value)=>({onPointerDown:e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);move.current[key]=value},onPointerUp:()=>{move.current[key]=0},onPointerCancel:()=>{move.current[key]=0},onLostPointerCapture:()=>{move.current[key]=0}})
  return <section className={'villa-view '+(compact?'compact':'')}>
    {!compact&&<div className="viewer-toolbar"><div><span className="eyebrow">{FLOORS.find(f=>f.id===floor)?.name}</span><h2>{walk?'Dentro casa':'La villa prende forma'}</h2></div><button className="btn secondary small" disabled={!visible.length} onClick={()=>setWalk(!walk)}>{walk?'Esci dalla visita':'Entra nella casa'}</button></div>}
    {failed?<p role="alert">Vista 3D non disponibile su questo browser. La planimetria resta utilizzabile.</p>:<div className="villa-canvas" ref={host}/>}
    {!compact&&!failed&&<>
      <div className="viewer-options"><button className="btn secondary small" onClick={()=>api.current.reset?.()}>Rimetti al centro</button>{!walk&&<label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/> Tutti i livelli separati</label>}</div>
      {!walk&&<label className="field">Guarda da vicino<select value={target} onChange={e=>{setAll(false);setTarget(e.target.value)}}><option value="">Vista del piano</option>{visible.map(r=><option key={r.id} value={r.id}>{r.name||roomType(r.type).name}</option>)}</select></label>}
      {walk&&<><label className="field">Vai in una stanza<select value={selected?.id||''} onChange={e=>setTarget(e.target.value)}>{visible.map(r=><option key={r.id} value={r.id}>{r.name||roomType(r.type).name}</option>)}</select></label><div className="walk-pad" aria-label="Comandi per camminare"><button {...hold('turn',1)} aria-label="Gira a sinistra">↶</button><button {...hold('forward',1)} aria-label="Cammina avanti">↑</button><button {...hold('forward',-1)} aria-label="Cammina indietro">↓</button><button {...hold('turn',-1)} aria-label="Gira a destra">↷</button></div><p className="muted">Tieni premute le frecce per camminare. Trascina la vista per guardarti intorno. Sul computer puoi usare anche WASD o le frecce dopo aver toccato la vista.</p></>}
      <p className="dream-note">Modello concettuale arredato, con pareti in sezione e passaggio libero. Dimensioni, scale e desideri sono modificabili: non è una planimetria edilizia verificata.</p>
    </>}
  </section>
}
