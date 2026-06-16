import { Home, KeyRound } from 'lucide-react'

export default function ConfigNotice() {
  return (
    <div className="auth-wrap">
      <div className="brand-mark">
        <div className="brand-logo"><Home size={24} /></div>
      </div>
      <h1 className="auth-title">Quasi pronti</h1>
      <p className="auth-sub">
        L'app è online ma deve ancora essere collegata al database. Mancano due chiavi di configurazione.
      </p>
      <div className="auth-card card">
        <div className="alert info" style={{ marginBottom: 16 }}>
          <strong>Cosa fare ora</strong><br />
          Su Vercel, aggiungi due variabili d'ambiente e fai un nuovo deploy:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="opt">
            <div className="check"><KeyRound size={13} /></div>
            <div className="o-body">
              <h4>VITE_SUPABASE_URL</h4>
              <p>L'indirizzo del tuo progetto Supabase</p>
            </div>
          </div>
          <div className="opt">
            <div className="check"><KeyRound size={13} /></div>
            <div className="o-body">
              <h4>VITE_SUPABASE_ANON_KEY</h4>
              <p>La chiave pubblica "anon" del progetto</p>
            </div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 16 }}>
          Le trovi su Supabase in <strong>Project Settings → API</strong>. Dopo averle aggiunte su Vercel, vai su Deployments → Redeploy.
        </p>
      </div>
    </div>
  )
}
