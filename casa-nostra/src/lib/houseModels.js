import * as T from 'three'

export function box(g,x,y,z,w,h,d,color, options={}) {
  const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.72,...options})); mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh
}
function cylinder(g,x,y,z,r,h,color,r2=r) {
  const m=new T.Mesh(new T.CylinderGeometry(r,r2,h,24),new T.MeshStandardMaterial({color,roughness:.7}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m
}
function ball(g,x,y,z,r,color) {
  const m=new T.Mesh(new T.SphereGeometry(r,12,10),new T.MeshStandardMaterial({color,roughness:.9}));m.position.set(x,y,z);m.castShadow=true;g.add(m);return m
}
function path(g,points,r,color) {
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)))
  const m=new T.Mesh(new T.TubeGeometry(curve,36,r,8,false),new T.MeshStandardMaterial({color,roughness:.4}));g.add(m);return m
}
function shelves(g,x=0,z=0,color='#856342') {
  box(g,x,1,z,2,2,.18,color)
  for(let y=.2;y<2;y+=.45) {box(g,x,y,z+.28,2,.07,.7,color);for(let i=0;i<5;i++)box(g,x-.75+i*.35,y+.17,z+.3,.22,.28,.25,['#d9b268','#e2ddd0','#647e70'][i%3])}
}
function tree(g,x=0,z=0,scale=1) {
  cylinder(g,x,1.3*scale,z,.18*scale,2.6*scale,'#806044')
  ball(g,x,3*scale,z,1.25*scale,'#5d8254');ball(g,x+.7*scale,2.7*scale,z,.8*scale,'#7b985c')
}
function stairs(g,x=0,z=0,width=1) {
  for(let i=0;i<12;i++)box(g,x,.12+i*.12,z-i*.22,width,.24+i*.24,.23,'#c6b395')
}

// Ogni idea ha una geometria propria; misure indicative, non modelli strutturali.
export function dreamModel(id) {
  const g=new T.Group()
  switch(id) {
    case 'scivolo':
      stairs(g,-.65,1, .9);path(g,[[.6,2.8,-1.4],[.6,2.2,-.8],[.6,.5,.8],[.6,.15,1.7]],.38,'#d2ac62');break
    case 'porta-segreta':
      shelves(g,-.6,0);{const door=new T.Group();shelves(door,.85,0);door.rotation.y=-.65;g.add(door)}box(g,.5,1,-.5,1.1,2.1,.1,'#263d37');break
    case 'salotto-ribassato':
      box(g,0,.04,0,3.4,.08,3.4,'#8b7664');box(g,0,.2,-1.3,3,.4,.7,'#c9bdb0');box(g,-1.3,.2,0,.7,.4,3,'#c9bdb0');box(g,1.3,.2,0,.7,.4,3,'#c9bdb0');box(g,0,.24,0,1.1,.45,.8,'#735343');break
    case 'frigo':
      box(g,0,1.3,-1.2,2.8,2.6,.12,'#b8ced2');box(g,-1.35,1.3,0,.12,2.6,2.4,'#dce6e7');shelves(g,0,-1);box(g,1.3,1.3,0,.08,2.6,2.4,'#afd9e1',{transparent:true,opacity:.35});break
    case 'bonsai':cylinder(g,0,.3,0,.75,.6,'#b79c79');tree(g,0,0,.55);break
    case 'avventura':
      box(g,0,.15,0,3,.3,2.5,'#d9a976');box(g,-1.3,1.3,-1.3,.15,2.6,2.5,'#c4a47a');for(let i=0;i<12;i++)ball(g,-1.17,.4+(i%4)*.5,-1+(i%3)*.65,.12,['#cd8667','#8daf9d','#dfca75'][i%3]);path(g,[[.7,2.8,-.8],[.7,.6,-.8]],.04,'#a17849');for(let i=0;i<15;i++)box(g,(i%5)*.45-.9,.42,Math.floor(i/5)*.45-.4,.4,.3,.4,['#8fae9b','#d1ae81'][i%2]);break
    case 'vialetto':
      box(g,0,.05,0,2.7,.1,4,'#b6b1a5');for(let i=0;i<7;i++)path(g,[[-1.1,.12,-1.7+i*.5],[1.1,.12,-1.7+i*.5]],.025,'#e5b360');break
    case 'bilico':
      box(g,0,1.7,0,2.5,3.4,.25,'#564437').rotation.y=.55;box(g,.75,1.4,.6,.05,.9,.07,'#ccb477');break
    case 'fiume': {
      const shape=new T.Shape();shape.absellipse(0,0,2.5,1.8,0,Math.PI*2,false,0);const hole=new T.Path();hole.absellipse(0,0,1.25,.65,0,Math.PI*2,true,0);shape.holes.push(hole)
      const river=new T.Mesh(new T.ShapeGeometry(shape,48),new T.MeshStandardMaterial({color:'#4ca7bb',metalness:.3,roughness:.18,side:T.DoubleSide}));river.rotation.x=-Math.PI/2;river.position.y=.15;g.add(river);tree(g,0,0,.4);box(g,0,.4,1.2,1.1,.12,1.6,'#c2a27a');for(const x of [-2.7,2.7])for(const z of [-2,2])box(g,x,1.8,z,.07,3.6,.07,'#a4ada3');box(g,0,3.6,0,5.5,.08,4.2,'#c1dce0',{transparent:true,opacity:.2});break
    }
    case 'scalinata':for(const side of [-1,1])for(let i=0;i<12;i++){const a=i*Math.PI/22;const step=box(g,side*(.6+Math.cos(a)*1.15),.12+i*.12,1.3-i*.24,1,.24+i*.24,.3,'#c6b395');step.rotation.y=side*a*.4}box(g,0,2.8,-1.5,2.4,.18,.8,'#c6b395');break
    case 'baldacchino':
      cylinder(g,0,.35,0,1.4,.7,'#c2ac91');cylinder(g,0,.75,0,1.35,.15,'#eee4d5');for(const x of [-1.4,1.4])for(const z of [-1.4,1.4])box(g,x,1.4,z,.05,2.8,.05,'#7e6242');box(g,0,2.8,0,3,.05,3,'#ece2cf');for(const x of [-1.4,1.4])box(g,x,1.6,0,.03,2.4,2.7,'#ece2cf',{transparent:true,opacity:.4});break
    case 'dispensa':shelves(g,0,-1.1);{const s=new T.Group();shelves(s);s.rotation.y=Math.PI/2;s.position.x=-1.2;g.add(s)}box(g,.6,.8,.5,1,.08,1.3,'#c8b395');break
    case 'prese':box(g,0,.45,0,.6,.45,.08,'#ded4c1');for(const x of [-.12,.12])for(const y of [.39,.48])cylinder(g,x,y,.06,.025,.03,'#6e675a').rotation.x=Math.PI/2;break
    case 'scala-albero':tree(g);for(let i=0;i<22;i++){const a=i*.26;box(g,Math.cos(a)*1.1,.1+i*.14,Math.sin(a)*1.1,.85,.1,.35,'#b49772').rotation.y=-a}break
    case 'casa-albero':tree(g,0,0,1.2);box(g,0,2,0,3,.2,3,'#a5865c');box(g,0,3,0,2,1.8,2,'#c5a174');box(g,0,3,.99,.65,.8,.05,'#456a70');{const roof=new T.Mesh(new T.ConeGeometry(1.8,1,4),new T.MeshStandardMaterial({color:'#727956'}));roof.position.y=4.4;roof.rotation.y=Math.PI/4;g.add(roof)}for(let i=0;i<8;i++)box(g,1.4,.15+i*.25,1.5-i*.18,.7,.12,.25,'#a5865c');break
    case 'garage-interrato':
      box(g,0,.12,0,4,.24,3.4,'#7d827f');box(g,0,.6,0,1.6,.7,2.9,'#c4d1d5');box(g,0,1.08,-.1,1.4,.5,1.5,'#4f727c');for(const x of [-.85,.85])for(const z of [-.9,.9])cylinder(g,x,.35,z,.3,.15,'#343d3b').rotation.z=Math.PI/2;{const ramp=box(g,2,.5,0,1.1,.15,4,'#a7a89f');ramp.rotation.x=.2}break
  }
  return g
}

export function furnish(g,room,palette,hasBed) {
  const w=room.w,l=room.l;const c=palette.fabric;const wood=palette.floor
  const furniture=new T.Group();g.add(furniture)
  if(['soggiorno','taverna'].includes(room.type)) {box(furniture,0,.35,-l*.25,Math.min(3,w*.6),.7,.9,c);box(furniture,0,.85,-l*.3,Math.min(3,w*.6),.65,.25,c);box(furniture,0,.3,0,1.4,.5,.8,wood);box(furniture,0,1.2,l*.4,2,.9,.06,'#29342f')}
  if(['camera','cameretta'].includes(room.type) && !hasBed) {box(furniture,0,.3,0,1.9,.6,2.2,wood);box(furniture,0,.67,0,1.85,.15,2.1,c);box(furniture,0,.8,-.65,1.6,.15,.5,'#f2eadc');box(furniture,0,.85,-1.1,2,.8,.15,palette.accent)}
  if(room.type==='cucina') {box(furniture,0,.5,-l*.38,w*.8,1,.7,palette.wall);box(furniture,0,1.05,-l*.38,w*.8,.1,.75,'#71736d');box(furniture,0,.5,0,2.2,1,1.1,wood);box(furniture,0,1.05,0,2.3,.1,1.2,'#e5dfd2')}
  if(room.type==='studio') {box(furniture,0,.75,0,2,.12,1,wood);box(furniture,-.8,.35,0,.1,.7,.8,'#4d5951');box(furniture,.8,.35,0,.1,.7,.8,'#4d5951');box(furniture,0,1.1,-.25,.8,.5,.07,'#283e41')}
  if(room.type==='bagno') {box(furniture,0,.4,0,1.6,.8,.8,'#efeee5');box(furniture,0,.84,0,1.35,.06,.6,'#8ac1c8');box(furniture,-w*.3,.85,-l*.35,.6,.3,.5,'#f3eee2')}
  if(room.type==='cinema') {box(furniture,0,1.6,-l*.42,w*.8,2,.1,'#253743');for(let i=0;i<6;i++){let x=(i%3-1)*1.4,z=Math.floor(i/3)*1.7;box(furniture,x,.45,z,1,.8,1,palette.accent);box(furniture,x,1,z+.4,1,.7,.2,palette.accent)}}
  if(room.type==='palestra') {for(const x of [-1.4,1.4]){box(furniture,x,.2,0,1,.35,2,'#43544e');box(furniture,x,1,-.8,.08,1.7,.1,'#9aa59c');box(furniture,x,1.4,-.8,1,.1,.15,'#505d54')}}
  if(room.type==='piscina') {box(furniture,0,.02,0,w*.94,.1,l*.92,'#6ab5c6',{roughness:.15,metalness:.3});for(const x of [-w*.4,w*.4])box(furniture,x,.2,l*.55,.7,.3,1.5,'#dfcdae')}
  if(room.type==='giardino')for(const x of [-w*.3,w*.3])tree(furniture,x,-l*.3)
  if(room.type==='orto')for(let i=0;i<4;i++){box(furniture,0,.15,i*.9-l*.35,w*.85,.3,.65,'#795b40');for(let j=0;j<5;j++)ball(furniture,-w*.3+j*w*.15,.4,i*.9-l*.35,.17,'#74944c')}
  if(room.type==='campetto'){box(furniture,0,.04,0,w*.95,.05,l*.95,'#698970');for(const z of [-l*.4,l*.4]){box(furniture,0,1,z,2.8,.06,.06,'#f4eee2');for(const x of [-1.4,1.4])box(furniture,x,.5,z,.06,1,.06,'#f4eee2')}}
  if(room.type==='barbecue'){box(furniture,0,.5,0,2,1,.8,'#c6b79e');box(furniture,0,1.1,0,1,.1,.7,'#343c34');box(furniture,0,1.7,-.3,.8,1.2,.25,'#857968')}
  if(room.type==='terrazzo'){box(furniture,0,.75,0,2.5,.15,1.3,wood);box(furniture,-w*.4,1,-l*.3,1.6,2,.65,'#af9f86');box(furniture,-w*.4,.7,-l*.3+.34,.9,.6,.05,'#714630')}
}
