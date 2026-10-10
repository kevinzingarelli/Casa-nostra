import { initialDreams } from './dreams.js'
import { DEFAULT_MATERIALS } from './costs.js'

export const FLOORS = [{ id: -1, name: 'Interrato' }, { id: 0, name: 'Piano terra' }, { id: 1, name: 'Primo piano' }, { id: 2, name: 'Giardino' }]
export const STYLES = {
  caldo: { name: 'Mediterraneo caldo', wall: '#f0e4d1', floor: '#cda87a', fabric: '#eee4d0', accent: '#75846b' },
  moderno: { name: 'Contemporaneo', wall: '#e9e8e3', floor: '#aeb2b1', fabric: '#65737d', accent: '#bc9159' },
  naturale: { name: 'Legno e natura', wall: '#e5e8d8', floor: '#94704e', fabric: '#9aa785', accent: '#695140' },
}
export function makeVilla() {
  const spec = [
    ['garage','Garage interrato',-1,8,8,10,8],['cinema','Sala cinema',-1,18,8,8,8],['studio','Studio registrazione',-1,8,16,6,7],['palestra','Palestra',-1,14,16,6,7],['taverna','Tavernetta',-1,20,16,6,7],
    ['soggiorno','Living',0,8,8,8,8],['cucina','Cucina',0,16,8,6,8],['dispensa','Dispensa',0,22,8,4,4],['dispensa','Frigorifero a stanza',0,22,12,4,4],
    ['studio','Ufficio e libreria',0,8,16,6,7],['ingresso','Ingresso e scale',0,14,16,8,7],['bagno','Bagno ospiti',0,22,16,4,3],['lavanderia','Lavanderia',0,22,19,4,4],
    ['spa','Spa e fiume coperto',0,28,8,12,15],['terrazzo','Terrazzo con camino',0,8,25,18,5],
    ['camera','Suite principale',1,8,8,8,8],['cabina','Cabina armadio',1,16,8,5,4],['bagno','Bagno suite',1,21,8,5,4],['cameretta','Camera bambini',1,16,12,5,4],['camera','Camera ospiti',1,21,12,5,4],['giochi','Stanza avventura',1,8,16,6,7],['corridoio','Galleria e scale',1,14,16,8,7],['bagno','Bagno piano',1,22,16,4,3],
    ['piscina','Piscina',2,28,26,12,6],['giardino','Giardino degli alberi',2,5,33,14,10],['campetto','Campetto',2,23,34,16,10],['orto','Orto',2,2,8,4,9],['barbecue','Barbecue',2,8,30,8,3],['vialetto','Vialetto di ingresso',2,17,2,6,5],
  ]
  const rooms = spec.map(([type,name,floor,x,y,w,l],i) => ({ id: crypto.randomUUID(), type,name,floor,x,y,w,l }))
  const assignments = {scivolo:10,'porta-segreta':9,'salotto-ribassato':5,frigo:8,bonsai:21,avventura:20,vialetto:28,bilico:10,fiume:13,scalinata:10,baldacchino:15,dispensa:7,prese:5,'scala-albero':21,'casa-albero':24,'garage-interrato':0}
  const dreams = initialDreams()
  for (const [id,index] of Object.entries(assignments)) dreams[id] = { ...dreams[id], roomId: rooms[index].id, u: .5, v: .5, rotation: 0, scale: 1 }
  dreams.scivolo.u=.2; dreams.scalinata.u=.7; dreams.bilico.v=.9; dreams.prese.u=.9; dreams.prese.v=.15;dreams.bonsai.u=.15;dreams.bonsai.v=.2;dreams.bonsai.scale=.5
  return { schema:2, rooms, dreams, materials:{}, lot:48, style:'caldo', lighting:'giorno', versions:[] }
}
export function normalizeData(raw = {}) {
  return { ...raw, schema:2, rooms:(raw.rooms || []).map(r => ({ ...r, floor:r.floor ?? 0 })), materials:{...DEFAULT_MATERIALS,...raw.materials}, dreams:raw.dreams || initialDreams(), lot:raw.lot || 22, style:raw.style || 'caldo', lighting:raw.lighting || 'giorno', versions:raw.versions || [] }
}
export function captureVersion(data, name) {
  const { versions, ...content } = normalizeData(data)
  return { id:crypto.randomUUID(), name:name.trim() || 'Alternativa', created_at:new Date().toISOString(), data:structuredClone(content) }
}
export function restoreVersion(data, id) {
  const source = data.versions.find(v => v.id === id)
  if (!source) throw new Error('Versione non trovata')
  return { ...structuredClone(source.data), versions:[...data.versions, captureVersion(data, 'Prima del ripristino')] }
}
export function projectStats(data) {
  const rooms=data.rooms || []
  return { rooms:rooms.filter(r=>r.floor!==2).length, area:Math.round(rooms.filter(r=>r.floor!==2).reduce((s,r)=>s+r.w*r.l,0)), outside:Math.round(rooms.filter(r=>r.floor===2).reduce((s,r)=>s+r.w*r.l,0)), dreams:Object.values(data.dreams || {}).filter(d=>d.included).length }
}
export function validateImport(row) {
  if (!row || typeof row.name !== 'string' || !Array.isArray(row.data?.rooms) || row.data.rooms.length>150) throw new Error('Questo file non è un progetto Casa Nostra valido.')
  const lot = row.data.lot || 22
  if (!Number.isFinite(lot) || lot<10 || lot>200) throw new Error('Dimensione lotto non valida.')
  for(const r of row.data.rooms) if (![r.x,r.y,r.w,r.l].every(Number.isFinite) || r.w<=0 || r.l<=0 || r.x<0 || r.y<0 || r.x+r.w>lot || r.y+r.l>lot || ![-1,0,1,2].includes(r.floor ?? 0)) throw new Error('Una stanza contiene misure non valide.')
  return { ...row, id:crypto.randomUUID(), name:row.name+' · copia importata', data:normalizeData(row.data), updated_at:new Date().toISOString() }
}
