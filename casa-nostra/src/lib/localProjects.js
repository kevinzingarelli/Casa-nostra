const KEY = 'casa-nostra:projects:v1'
export function listLocalProjects(storage = localStorage) {
  const raw = storage.getItem(KEY)
  if (!raw) return []
  const parsed = JSON.parse(raw)
  if (!Array.isArray(parsed)) throw new Error('Archivio locale non leggibile. I dati sono conservati: non verranno sovrascritti.')
  return parsed
}
export function saveLocalProject(project, storage = localStorage) {
  const projects = listLocalProjects(storage)
  const index = projects.findIndex(p => p.id === project.id)
  if (index < 0) projects.unshift(project)
  else projects[index] = project
  storage.setItem(KEY, JSON.stringify(projects))
}
export function createLocalProject() {
  return {
    id: crypto.randomUUID(), name: 'La casa dei sogni', house_type: 'villa', updated_at: new Date().toISOString(),
    data: { rooms: [
      { id: crypto.randomUUID(), type: 'soggiorno', x: 2, y: 2, w: 7, l: 6 },
      { id: crypto.randomUUID(), type: 'cucina', x: 9, y: 2, w: 5, l: 6 },
      { id: crypto.randomUUID(), type: 'camera', x: 2, y: 8, w: 5, l: 5 },
      { id: crypto.randomUUID(), type: 'bagno', x: 7, y: 8, w: 3, l: 3 },
      { id: crypto.randomUUID(), type: 'studio', x: 10, y: 8, w: 4, l: 5 },
    ], materials: {} },
  }
}
export function downloadProject(project) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url; link.download = 'casa-nostra-progetto.json'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
