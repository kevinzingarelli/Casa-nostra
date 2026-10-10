export const DREAM_SOURCE = 'https://www.instagram.com/p/DeT0d0bDPH8/'
export const DREAM_IDEAS = [
  { id: 'scivolo', name: 'Scale con uno scivolo', area: 'Ingresso', description: 'Una discesa giocosa accanto alla scala principale.' },
  { id: 'porta-segreta', name: 'Porta segreta nella libreria', area: 'Studio', description: 'Una libreria che nasconde il passaggio verso una stanza.' },
  { id: 'salotto-ribassato', name: 'Salotto ribassato', area: 'Living', description: 'Divani raccolti in uno spazio più basso rispetto al pavimento.' },
  { id: 'frigo', name: 'Frigorifero in cui entrare', area: 'Cucina', description: 'Una stanza refrigerata con scaffali a vista.' },
  { id: 'bonsai', name: 'Bonsai nel corridoio', area: 'Passaggi', description: 'Un piccolo albero protagonista di un angolo della casa.' },
  { id: 'avventura', name: 'Stanza avventura per i bambini', area: 'Giochi', description: 'Arrampicata, corde e una vasca di cubi morbidi.' },
  { id: 'vialetto', name: 'Vialetto riscaldato', area: 'Esterni', description: 'Il percorso di ingresso con riscaldamento integrato.' },
  { id: 'bilico', name: 'Porta gigante a bilico', area: 'Ingresso', description: 'Una porta d’ingresso ampia che ruota su un perno.' },
  { id: 'fiume', name: 'Fiume lento al coperto', area: 'Benessere', description: 'Un percorso d’acqua tra vegetazione e ponticelli, sotto una copertura vetrata.' },
  { id: 'scalinata', name: 'Doppia scalinata', area: 'Ingresso', description: 'Due rampe curve che incorniciano un ingresso a doppia altezza.' },
  { id: 'baldacchino', name: 'Letto circolare a baldacchino', area: 'Camera', description: 'Un letto rotondo con tende che lo avvolgono.' },
  { id: 'dispensa', name: 'Dispensa di snack in cui entrare', area: 'Cucina', description: 'Una stanza dedicata alle scorte, con scaffali e piano di appoggio.' },
  { id: 'prese', name: 'Prese che si mimetizzano', area: 'Dettagli', description: 'Prese elettriche integrate nella finitura delle pareti.' },
  { id: 'scala-albero', name: 'Scala attorno a un albero', area: 'Ingresso', description: 'La scala avvolge un albero al centro della casa.' },
  { id: 'casa-albero', name: 'Casa sull’albero per i bambini', area: 'Giardino', description: 'Una piccola casa tra i rami, con terrazza e accesso dedicato.' },
  { id: 'garage-interrato', name: 'Garage sotterraneo', area: 'Garage', description: 'Un’autorimessa sotto il giardino, raggiungibile da una rampa.' },
]
export function initialDreams() {
  return Object.fromEntries(DREAM_IDEAS.map(idea => [idea.id, { included: true, note: '' }]))
}
