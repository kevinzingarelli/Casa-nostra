# Ripresa Casa Nostra

Creato: 10/10/2026. Perimetro autorizzato dalla richiesta di Kevin: aggiungere le idee del post Instagram e lavorare sull'app fino a consegnare un link accessibile.

## Risultato
Ripubblicare il progetto Vercel esistente, aggiungere i 16 desideri verificati nel carosello DeT0d0bDPH8, permettere la progettazione immediata sul dispositivo e mostrare le stanze anche in 3D schematico. Conservare l'accesso ai progetti Supabase senza modificare dati reali.

## Stato e scelte
Versione iniziale React/Vite del 16 giugno, planimetria 2D, collegamento Supabase, homepage 404. Vercel conserva le variabili di produzione come segreti non esportabili. Il funzionamento cloud sarà verificato sul rilascio; le prove di modifica usano progetti locali isolati. Nessun nuovo servizio a pagamento. Il 3D rappresenta solo i volumi delle stanze, non la fattibilità delle idee concettuali del post. Nessun prezzo inventato per gli extra.

## Interventi
- Configurazione Vercel e ignorati Git: build Vite corretta, protezione file locali.
- Archivio idee e pannello Desideri: catalogo completo, selezione, note, fonte.
- Archivio locale e scelta di accesso: progetti sul dispositivo chiaramente distinti dal cloud, esportazione backup JSON.
- Editor: salvataggio locale/cloud, gestione errori senza sovrascrivere un caricamento fallito, conservazione campi esistenti.
- Vista 3D: volumi collegati alla planimetria, rotazione e zoom, alternative in caso WebGL assente.
- Novità e documentazione: versione e limiti verificati.

## Verifica
Build, test isolamento/salvataggio e catalogo, prova browser su desktop e 320/390/560px: aprire progetto, aggiungere/spostare stanza, vista 3D, desideri e note, ricaricare e ritrovare i dati, esportare. Pubblicazione Vercel Ready e ripetizione del gesto sul link definitivo. Nessuna cancellazione di dati veri.

## Completamento
Link funzionante; 16 idee presenti; dati locali persistenti e dichiarati come locali; esito cloud dichiarato secondo le prove. Nessun file da eliminare.
