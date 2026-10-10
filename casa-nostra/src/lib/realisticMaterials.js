import * as T from 'three'

// Texture PBR locali CC0: nessun servizio esterno è necessario durante la visita.
export function createMaterials(renderer, onLoad) {
  const resources=new Set(), textures=new Map(), loader=new T.TextureLoader()
  let disposed=false
  function map(kind,channel,repeat=[1,1]) {
    const key=`${kind}-${channel}-${repeat.join('-')}`
    if(textures.has(key))return textures.get(key)
    const texture=loader.load(`/materials/${kind}-${channel}.jpg`,t=>{if(disposed)t.dispose();else onLoad()},undefined,()=>onLoad())
    texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(...repeat)
    texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())
    if(channel==='color')texture.colorSpace=T.SRGBColorSpace
    textures.set(key,texture);return texture
  }
  const fabricCanvas=document.createElement('canvas');fabricCanvas.width=fabricCanvas.height=128
  const ctx=fabricCanvas.getContext('2d');ctx.fillStyle='#aaa';ctx.fillRect(0,0,128,128)
  for(let i=0;i<128;i+=4){ctx.fillStyle='#bbb';ctx.fillRect(i,0,1,128);ctx.fillStyle='#999';ctx.fillRect(0,i,128,1)}
  const weave=new T.CanvasTexture(fabricCanvas);weave.wrapS=weave.wrapT=T.RepeatWrapping;weave.repeat.set(12,12);textures.set('weave',weave)
  const cache=new Map()
  function get(kind,color='#ffffff',repeat=[1,1]) {
    const key=`${kind}:${color}:${repeat.join(',')}`
    if(cache.has(key))return cache.get(key)
    let settings={color,roughness:.8}
    if(kind==='wood'||kind==='stone')settings={color,map:map(kind,'color',repeat),normalMap:map(kind,'normal',repeat),normalScale:new T.Vector2(.35,.35),roughnessMap:map(kind,'rough',repeat),roughness:kind==='wood'?.6:.7}
    if(kind==='fabric')settings={color,roughness:.94,bumpMap:weave,bumpScale:.006,sheen:.5,sheenColor:new T.Color(color)}
    if(kind==='metal')settings={color,metalness:.88,roughness:.25}
    if(kind==='glass')settings={color,metalness:0,roughness:.07,transmission:.94,thickness:.06,ior:1.5,transparent:true,opacity:1}
    if(kind==='window')settings={color,roughness:.3,transparent:true,opacity:.25}
    if(kind==='water')settings={color,metalness:.12,roughness:.12,clearcoat:1,ior:1.33}
    const material=new T.MeshPhysicalMaterial(settings);resources.add(material);cache.set(key,material);return material
  }
  return {get,dispose(){disposed=true;resources.forEach(r=>r.dispose());textures.forEach(t=>t.dispose())}}
}
