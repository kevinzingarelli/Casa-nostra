// Tipi di stanza disponibili. Ogni tipo ha un colore (per la planimetria)
// e dimensioni di default in metri.
export const ROOM_TYPES = [
  { id: 'soggiorno', name: 'Soggiorno', color: '#2e3fa8', w: 5, l: 4 },
  { id: 'cucina', name: 'Cucina', color: '#b45309', w: 4, l: 3 },
  { id: 'camera', name: 'Camera', color: '#7c3aed', w: 4, l: 3.5 },
  { id: 'cameretta', name: 'Cameretta', color: '#0891b2', w: 3, l: 3 },
  { id: 'bagno', name: 'Bagno', color: '#0d9488', w: 2.5, l: 2 },
  { id: 'studio', name: 'Studio', color: '#be185d', w: 3, l: 3 },
  { id: 'ingresso', name: 'Ingresso', color: '#65758b', w: 2.5, l: 2 },
  { id: 'corridoio', name: 'Corridoio', color: '#9a9ca1', w: 4, l: 1.5 },
  { id: 'lavanderia', name: 'Lavanderia', color: '#15803d', w: 2.5, l: 2 },
  { id: 'garage', name: 'Garage', color: '#475569', w: 5, l: 5 },
  { id: 'terrazzo', name: 'Terrazzo', color: '#ca8a04', w: 4, l: 3 },
  { id: 'cabina', name: 'Cabina armadio', color: '#9333ea', w: 2.5, l: 2 },
]

export function roomType(id) {
  return ROOM_TYPES.find((r) => r.id === id) || ROOM_TYPES[0]
}

// Area totale (m²) calpestabile = somma area stanze "interne".
// Terrazzo e garage contano a metà nel costo di costruzione (gestito nei costi).
export function roomArea(room) {
  return Math.round(room.w * room.l * 10) / 10
}
