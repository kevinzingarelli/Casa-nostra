import test from 'node:test'
import assert from 'node:assert/strict'
import {makeVilla,normalizeData,captureVersion,restoreVersion,validateImport,projectStats} from '../src/lib/villa.js'
import {dreamModel} from '../src/lib/houseModels.js'
import {DREAM_IDEAS} from '../src/lib/dreams.js'

test('villa completa: ambienti nei limiti e tutte le idee hanno una collocazione',()=>{
  const d=makeVilla();assert.equal(d.rooms.length,29);assert.deepEqual([...new Set(d.rooms.map(r=>r.floor))].sort(),[-1,0,1,2]);
  for(const r of d.rooms){assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=d.lot&&r.y+r.l<=d.lot)}
  for(const idea of DREAM_IDEAS){assert.ok(d.rooms.some(r=>r.id===d.dreams[idea.id].roomId));const model=dreamModel(idea.id);assert.ok(model.children.length>0,idea.id);model.traverse(o=>{o.geometry?.dispose();o.material?.dispose()})}
  assert.equal(projectStats(d).rooms,23)
})
test('i progetti precedenti mantengono misure note e campi sconosciuti',()=>{
  const raw={custom:{source:'prima'},rooms:[{id:'a',x:2,y:3,w:4,l:5}],dreams:{bonsai:{included:false,note:'Nota precedente'}},materials:{tetto:'coppi'}}
  const d=normalizeData(raw);assert.equal(d.rooms[0].floor,0);assert.equal(d.lot,22);assert.deepEqual(d.custom,raw.custom);assert.deepEqual(d.dreams,raw.dreams);assert.equal(raw.rooms[0].floor,undefined)
})
test('versioni isolate, ripristino conserva la versione abbandonata',()=>{
  const d=makeVilla();const first=captureVersion(d,'Originale');d.versions.push(first);d.rooms[0].w=12;d.dreams.bonsai.note='Modifica nuova';
  assert.equal(first.data.rooms[0].w,10);assert.equal(first.data.dreams.bonsai.note,'');assert.equal(first.data.versions,undefined)
  const restored=restoreVersion(d,first.id);assert.equal(restored.rooms[0].w,10);assert.equal(restored.versions.length,2);assert.equal(restored.versions[1].data.rooms[0].w,12);assert.equal(restored.versions[1].data.dreams.bonsai.note,'Modifica nuova');restored.rooms[0].w=9;assert.equal(first.data.rooms[0].w,10)
})
test('importazione sempre come copia; file rotti rifiutati',()=>{
  const row={id:'originale',name:'Villa',data:makeVilla()};const imported=validateImport(row);assert.notEqual(imported.id,row.id);assert.equal(row.name,'Villa');assert.throws(()=>validateImport({name:'Rotto',data:{rooms:[{x:Infinity,y:0,w:2,l:2}]}}));assert.throws(()=>validateImport({name:'Rotto',data:{rooms:[{x:0,y:0,w:200,l:2}]}}));assert.throws(()=>validateImport(null))
})
