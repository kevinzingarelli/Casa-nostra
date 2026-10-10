import { Component } from 'react'

// Una vista opzionale non deve rendere inaccessibili pianta, dati ed esportazione.
export default class ViewBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="local-notice" role="alert"><h2>La vista 3D non si è caricata</h2><p>Puoi continuare con la pianta e le altre viste. Se hai appena aggiornato l’app, ricarica la pagina: le modifiche salvate restano conservate.</p><button className="btn secondary" onClick={() => location.reload()}>Ricarica l’app</button></section>
    return this.props.children
  }
}
