import { useState } from 'react'
import { Home } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  async function submit() {
    setError(''); setInfo('')
    if (!email || !password) { setError('Inserisci email e password.'); return }
    if (mode === 'signup' && password.length < 6) { setError('La password deve avere almeno 6 caratteri.'); return }
    setBusy(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email.trim(), password)
        if (error) setError(traduci(error.message))
      } else {
        const { data, error } = await signUp(email.trim(), password, name.trim() || 'Tu')
        if (error) { setError(traduci(error.message)); }
        else if (!data.session) {
          setInfo('Account creato. Controlla la tua email per confermare, poi accedi.')
          setMode('signin')
        }
      }
    } catch (e) {
      setError('Qualcosa è andato storto. Riprova tra un momento.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="brand-mark">
        <div className="brand-logo"><Home size={24} /></div>
      </div>
      <h1 className="auth-title">Casa Nostra</h1>
      <p className="auth-sub">
        Progettate insieme la casa dei vostri sogni: stanze, materiali e costi reali, in tempo reale.
      </p>

      <div className="auth-card card">
        {error && <div className="alert error">{error}</div>}
        {info && <div className="alert ok">{info}</div>}

        {mode === 'signup' && (
          <div className="field">
            <label>Come ti chiami</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Es. Marco" autoCapitalize="words" />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoCapitalize="none" autoCorrect="off" inputMode="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'Almeno 6 caratteri' : '••••••••'} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>

        <button className="btn" onClick={submit} disabled={busy}>
          {busy ? <span className="spinner" /> : mode === 'signin' ? 'Accedi' : 'Crea account'}
        </button>

        <div className="auth-switch">
          {mode === 'signin' ? (
            <>Non hai un account? <button onClick={() => { setMode('signup'); setError(''); setInfo('') }}>Registrati</button></>
          ) : (
            <>Hai già un account? <button onClick={() => { setMode('signin'); setError(''); setInfo('') }}>Accedi</button></>
          )}
        </div>
      </div>
    </div>
  )
}

function traduci(msg) {
  const m = (msg || '').toLowerCase()
  if (m.includes('invalid login')) return 'Email o password non corretti.'
  if (m.includes('already registered')) return 'Questa email è già registrata. Prova ad accedere.'
  if (m.includes('email not confirmed')) return 'Devi prima confermare la tua email.'
  if (m.includes('rate limit')) return 'Troppi tentativi. Attendi qualche minuto.'
  return msg || 'Errore. Riprova.'
}
