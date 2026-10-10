# Piano: Villa completa e condivisa

**Creato:** 2026-10-10
**Stato:** Quattro interventi implementati e pubblicati; quinto preparato, bloccato dalla quota cloud e in attesa della scelta di Kevin sull’archivio separato.
**Richiesta:** Realizzare i cinque miglioramenti proposti in chat.

## Cosa realizza
Villa modificabile su più livelli, esterni, sedici desideri visibili e posizionabili, visita interna con arredi e finiture, versioni confrontabili e salvataggio condiviso.

## Stato attuale
v1.1.0: editor 2D, volumi 3D, desideri testuali e archivio locale. Cloud storico irraggiungibile; verificare stato Supabase prima di intervenire.

## Cosa cambia
Nuovi moduli villa, versioni e modelli 3D; modifica editor, viste, archivio e stile. Nessun file o dato da eliminare. I vecchi progetti rimangono apribili e conservano i campi sconosciuti.

## Scelte e motivazioni
Proposta spaziale modificabile, non progetto edilizio. Geometrie procedurali per i desideri; nessun acquisto di asset. Versioni come copie immutabili, ripristino con copia di sicurezza. Condivisione autenticata con conflitti espliciti, nessuna lettura pubblica dei progetti.

## Domande aperte
Nessuna per gli interventi approvati. Eventuali costi o credenziali nuove saranno segnalati solo se necessari.

## Passi
1. Modello dati multi-piano, esterni, proposta villa e compatibilità locale.
2. Rappresentazioni dei sedici desideri, assegnazione stanza e posizione.
3. Vista 3D arredata e visita navigabile con comandi touch/tastiera, finiture e luce.
4. Copie di versione e confronto con anteprime, recupero senza perdita.
5. Recupero cloud e accesso tra dispositivi, backup locale e gestione conflitti.
6. Test dati, build, prove UI desktop e mobile emulato, pubblicazione e verifica online.

## Come verificare
- [x] Vecchi progetti e note conservati.
- [x] Piani, esterni e sedici desideri visualizzati e modificabili.
- [x] Visita con ingresso in stanza, movimento e uscita.
- [x] Versioni isolate e confronto funzionante.
- [ ] Scrittura e lettura condivisa verificate; nessuna sovrascrittura silenziosa.
- [x] Build, test e UI a 320/390/560 pixel.

## È finito quando
Le cinque funzioni sono utilizzabili e verificate online; eventuali limiti reali sono distinti da ciò che è concluso.

## Note di implementazione
La riattivazione gratuita autorizzata da Kevin è stata impedita da Supabase: due progetti gratuiti già attivi (Boschetto e Casa Points). Proposto un archivio separato nel progetto Casa Points, consenso pendente. SQL predisposto, non eseguito; condivisione non attiva. Rapporto: `casa-nostra/reports/verifica-v2-2026-10-10.md`.
