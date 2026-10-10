import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

function mesh(g,geometry,material,x,y,z){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
function block(g,x,y,z,w,h,d,material,round=0){return mesh(g,round?new RoundedBoxGeometry(w,h,d,2,Math.min(round,w/3,h/3,d/3)):new T.BoxGeometry(w,h,d),material,x,y,z)}
function cyl(g,x,y,z,r,h,material,rTop=r){return mesh(g,new T.CylinderGeometry(rTop,r,h,32),material,x,y,z)}

export function cushion(g,x,y,z,w,d,material){return block(g,x,y,z,w,.22,d,material,.1)}

export function plant(g,x,z,m,height=1.8){
  cyl(g,x,.22,z,.27,.44,m.get('stone','#d8cdbb'),.32)
  const stem=m.get('plain','#685442'),leaf=m.get('plain','#486342')
  for(let i=0;i<7;i++){
    const a=i*2.4,top=.65+height*(i+1)/8,tx=x+Math.cos(a)*.35,tz=z+Math.sin(a)*.35
    const curve=new T.CatmullRomCurve3([new T.Vector3(x,.4,z),new T.Vector3(x,top*.7,z),new T.Vector3(tx,top,tz)])
    mesh(g,new T.TubeGeometry(curve,8,.017,5,false),stem,0,0,0)
    const blade=mesh(g,new T.SphereGeometry(.25,10,8),leaf,tx,top,tz);blade.scale.set(.6,1.7,.12);blade.rotation.set(.35,a,.35)
  }
}
function lamp(g,x,z,m,night){
  const metal=m.get('metal','#8e8066');cyl(g,x,.035,z,.22,.07,metal);cyl(g,x,.88,z,.018,1.7,metal)
  const shade=m.get('fabric','#ede1ca');cyl(g,x,1.65,z,.36,.43,shade,.24)
  if(night){const bulb=new T.PointLight('#ffcc8e',9,5,2);bulb.position.set(x,1.52,z);g.add(bulb)}
}
function coffee(g,x,z,m){
  const wood=m.get('wood','#cbb395'),stone=m.get('stone','#ded5c2')
  cyl(g,x,.25,z,.38,.5,wood);cyl(g,x,.51,z,.68,.07,stone)
  block(g,x-.15,.57,z,.34,.035,.24,m.get('plain','#73775f'),.008)
  cyl(g,x+.25,.63,z-.18,.07,.19,m.get('plain','#b99479'),.05)
}

export function roomArchitecture(g,r,p,m,{interior,night}) {
  const wall=m.get('plain',p.wall),trim=m.get('wood','#b49b79'),frame=m.get('metal','#514d43')
  const h=3.1,w=r.w,l=r.l
  if(r.floor===2)return
  // Grande vetrata con spallette, davanzale e montanti reali.
  const windowW=w*.72
  block(g,0,.32,-l/2,w,.64,.18,wall)
  block(g,0,2.94,-l/2,w,.32,.18,wall)
  for(const x of [-1,1])block(g,x*(w/2-(w-windowW)/4),1.72,-l/2,(w-windowW)/2,2.16,.18,wall)
  const glass=block(g,0,1.72,-l/2+.01,windowW,2.16,.025,m.get(interior?'glass':'window','#edf3ef'));glass.castShadow=false
  for(let i=0;i<=3;i++)block(g,-windowW/2+windowW*i/3,1.72,-l/2+.035,.055,2.2,.08,frame)
  for(const y of [.63,2.81])block(g,0,y,-l/2+.04,windowW+.06,.06,.1,frame)
  block(g,0,.6,-l/2+.09,windowW+.2,.06,.28,m.get('stone','#e2d7c2'))
  block(g,-w/2,(interior?h:1.2)/2,0,.16,interior?h:1.2,l,wall)
  if(interior){block(g,w/2,h/2,0,.16,h,l,wall);block(g,0,h+.04,0,w,.08,l,wall)}
  for(const x of [-w/2+.1,w/2-.1])block(g,x,.06,0,.035,.12,l,trim)
  block(g,0,.06,-l/2+.12,w,.12,.035,trim)
  // Tende a pieghe; modelli sottili, non pannelli opachi davanti alla vetrata.
  if(interior){
    const cloth=m.get('fabric','#e7dfcf')
    for(const side of [-1,1])for(let i=0;i<9;i++){
      const curtain=block(g,side*(windowW/2-.4)+i*.06,1.5,-l/2+.22+Math.sin(i*1.8)*.055,.075,2.7,.04,cloth,.015);curtain.castShadow=false
    }
    block(g,0,2.92,-l/2+.23,windowW+.5,.03,.04,frame)
    for(const x of [-w*.28,w*.28])for(const z of [-l*.2,l*.2]){
      cyl(g,x,3.045,z,.08,.015,m.get('plain','#e2caa1'))
      if(night){const light=new T.PointLight('#ffd4a0',8,Math.max(w,l)*.85,2);light.position.set(x,2.8,z);g.add(light)}
    }
  }
}

export function detailedFurniture(g,r,p,m,{sunken,hasBed,night}) {
  const w=r.w,l=r.l,wood=m.get('wood','#cbb291'),fabric=m.get('fabric',p.fabric),dark=m.get('plain','#292d2a'),stone=m.get('stone','#ebe3d1')
  const f=new T.Group();g.add(f)
  // Le proporzioni restano all'interno anche delle stanze più piccole.
  const scale=Math.min(1,w/5,l/5);f.scale.setScalar(scale)
  const rw=w/scale,rl=l/scale
  const supported=['soggiorno','taverna','camera','cameretta','cucina','studio','bagno'].includes(r.type)
  if(!supported)return false
  if(['soggiorno','taverna'].includes(r.type)){
    if(!sunken){
      block(f,0,.03,0,3.7,.025,3.2,m.get('fabric','#c8bba1'),.01)
      block(f,0,.29,-1.15,3.1,.35,1.1,fabric,.14)
      block(f,0,.68,-1.58,3.12,.7,.24,fabric,.1)
      for(const x of [-1.45,1.45])block(f,x,.58,-1.12,.24,.48,1.05,fabric,.1)
      for(const x of [-.92,0,.92]){cushion(f,x,.52,-1.08,.87,.8,fabric);block(f,x,.87,-1.38,.65,.55,.18,m.get('fabric',p.accent),.09).rotation.x=-.18}
      coffee(f,.15,.4,m)
    }
    block(f,-rw/2+.25,1.3,0,.16,2.6,3.7,wood)
    for(let z=-1.8;z<1.8;z+=.14)block(f,-rw/2+.35,1.3,z,.06,2.6,.06,wood)
    block(f,-rw/2+.46,1.6,0,.08,1.18,2.1,dark,.02)
    block(f,-rw/2+.55,.27,0,.65,.42,3.6,wood,.03)
    plant(f,rw*.32,-rl*.32,m);lamp(f,-rw*.25,-rl*.28,m,night)
    const chair=new T.Group();chair.position.set(rw*.3,0,rl*.08);chair.rotation.y=-.7;f.add(chair)
    block(chair,0,.42,0,.9,.2,.85,m.get('fabric',p.accent),.1);block(chair,0,.77,.35,.9,.7,.2,m.get('fabric',p.accent),.1)
    for(const x of [-.33,.33])for(const z of [-.28,.28])block(chair,x,.18,z,.04,.36,.04,wood)
  }
  if(['camera','cameretta'].includes(r.type)){
    block(f,0,.025,.15,3.7,.025,3.9,m.get('fabric','#c6bbab'),.01)
    if(!hasBed){
      block(f,0,.22,0,2.05,.38,2.32,wood,.06);block(f,0,.5,0,2,.26,2.24,fabric,.12)
      block(f,0,.76,-1.2,2.35,1.35,.18,m.get('fabric',p.accent),.05)
      for(const x of [-.48,.48])cushion(f,x,.71,-.65,.8,.5,m.get('fabric','#f2eadc'))
      block(f,0,.655,.4,2.02,.055,1.2,m.get('fabric','#afaa92'),.02)
    }
    for(const x of [-1.7,1.7]){block(f,x,.29,-.75,.65,.58,.6,wood,.04);cyl(f,x,.72,-.75,.11,.3,stone);cyl(f,x,.95,-.75,.21,.25,m.get('fabric','#ead8b4'),.16)}
    plant(f,rw*.32,-rl*.3,m)
    block(f,0,1.7,-rl/2+.22,2.5,.03,.14,m.get('metal','#bba377'))
  }
  if(r.type==='cucina'){
    for(let x=-rw*.37;x<rw*.38;x+=.65){block(f,x,.45,-rl*.37,.63,.9,.68,wood,.018);block(f,x,.55,-rl*.37+.35,.36,.025,.025,m.get('metal','#776c58'))}
    block(f,0,.94,-rl*.37,rw*.85,.07,.8,stone,.02)
    block(f,0,1.35,-rl*.42,rw*.88,.72,.05,stone)
    block(f,0,.48,.1,2.5,.96,1.12,wood,.04);block(f,0,.99,.1,2.64,.09,1.24,stone,.035)
    block(f,-.6,1.045,.1,.62,.01,.46,dark,.04)
    for(const x of [-.8,-.4])for(const z of [0,.22])cyl(f,x,1.052,z,.08,.01,m.get('metal','#5d635e'))
    for(const x of [-.75,.75]){cyl(f,x,.73,1.1,.28,.13,m.get('fabric',p.accent));for(const dx of [-.18,.18])for(const dz of [-.18,.18])block(f,x+dx,.35,1.1+dz,.035,.7,.035,m.get('metal','#5a5347'));cyl(f,x,2.65,.1,.23,.3,m.get('metal','#b29a70'),.1)}
    plant(f,rw*.35,-rl*.25,m,.9)
  }
  if(r.type==='studio'){
    block(f,0,.76,0,2.1,.065,.92,wood,.035)
    for(const x of [-.9,.9])block(f,x,.37,0,.045,.74,.75,m.get('metal','#4b5148'))
    block(f,0,1.16,-.18,.8,.48,.04,dark,.025);block(f,0,.94,-.18,.04,.36,.05,m.get('metal','#555'))
    block(f,0,.8,.15,.5,.02,.16,dark,.01)
    block(f,0,.44,.9,.65,.16,.6,fabric,.06);block(f,0,.82,1.15,.65,.7,.12,fabric,.06)
    plant(f,rw*.33,-rl*.33,m)
  }
  if(r.type==='bagno'){
    block(f,0,.45,0,1.75,.8,.85,stone,.2);block(f,0,.87,0,1.45,.03,.62,m.get('water','#aad4d0'),.12)
    block(f,-rw*.32,.72,-rl*.32,.9,.3,.54,wood,.04);block(f,-rw*.32,.9,-rl*.32,1,.1,.6,stone,.08)
    const mirror=block(f,-rw*.32,1.7,-rl/2+.2,1,1.05,.025,m.get('metal','#c5d4cd'),.06);mirror.castShadow=false
    plant(f,rw*.3,-rl*.3,m,.7)
  }
  return true
}
