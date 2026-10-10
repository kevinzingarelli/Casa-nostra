import test from 'node:test'
import assert from 'node:assert/strict'
import { listLocalProjects, saveLocalProject } from '../src/lib/localProjects.js'
import { DREAM_IDEAS, initialDreams } from '../src/lib/dreams.js'

const memory = (initial = null) => ({ value: initial, getItem() { return this.value }, setItem(key, value) { this.value = value } })
test('un aggiornamento conserva gli altri progetti e i campi non riconosciuti', () => {
  const storage = memory()
  const first = { id: 'a', extra: 'da conservare', data: { rooms: [], dreams: initialDreams() } }
  saveLocalProject(first, storage)
  saveLocalProject({ id: 'b', data: { rooms: [{ id: 'r' }] } }, storage)
  saveLocalProject({ ...first, name: 'Aggiornato' }, storage)
  const rows = listLocalProjects(storage)
  assert.equal(rows.length, 2)
  assert.equal(rows.find(p => p.id === 'a').extra, 'da conservare')
  assert.deepEqual(rows.find(p => p.id === 'b').data.rooms, [{ id: 'r' }])
})
test('un archivio non leggibile non viene sovrascritto', () => {
  for (const original of ['{rotto', '{"vecchio":"dato"}']) {
    const storage = memory(original)
    assert.throws(() => saveLocalProject({ id: 'nuovo' }, storage))
    assert.equal(storage.value, original)
  }
})
test('note e scelte restano distinte tra progetti', () => {
  const a = initialDreams(); const b = initialDreams()
  a.scivolo.note = 'Accanto alla scala'; a.bonsai.included = false
  assert.equal(b.scivolo.note, '')
  assert.equal(b.bonsai.included, true)
  assert.equal(DREAM_IDEAS.length, 16)
  assert.equal(new Set(DREAM_IDEAS.map(i => i.id)).size, 16)
})
test('un errore di spazio disponibile non viene nascosto', () => {
  const storage = memory(); storage.setItem = () => { throw new Error('Quota esaurita') }
  assert.throws(() => saveLocalProject({ id: 'a' }, storage), /Quota esaurita/)
})
