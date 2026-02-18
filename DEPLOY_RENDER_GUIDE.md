# Deploy su Render - Plaid-Bank-Transfer
# Author: Giuseppe Bosi

## Prerequisiti
- Account Render (https://render.com/)
- Repository GitHub collegato
- Credenziali Plaid (CLIENT_ID e SECRET)

## Passaggi per il Deploy

### 1. Collega Repository a Render
1. Vai su https://dashboard.render.com/
2. Clicca "New +" → "Blueprint"
3. Seleziona il repository `Plaid-Bank-Transfer`
4. Render rileverà automaticamente il `render.yaml`
5. Clicca "Apply Blueprint"

### 2. Configura Variabili d'Ambiente
Dopo il deploy iniziale, configura le variabili:

**Backend (plaid-backend):**
Vai su Dashboard → plaid-backend → Environment
```
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
SENTRY_DSN=your_sentry_dsn (opzionale)
NODE_ENV=production (già impostato)
PORT=4001 (già impostato)
```

**Frontend (plaid-frontend):**
Vai su Dashboard → plaid-frontend → Environment
```
REACT_APP_API_URL=https://plaid-backend.onrender.com
REACT_APP_ENV=production (già impostato)
REACT_APP_SENTRY_DSN=your_sentry_dsn (opzionale)
```

### 3. Deploy Automatico
- Render farà il deploy automatico dopo ogni push
- Il primo build richiederà 5-10 minuti
- Gli URL saranno:
  - Backend: `https://plaid-backend.onrender.com`
  - Frontend: `https://plaid-frontend.onrender.com`

### 4. Verifica Deploy
1. Controlla che il backend risponda: `https://plaid-backend.onrender.com/api/info`
2. Apri l'URL del frontend
3. Testa la connessione con Plaid

## Architettura Deploy
- **Due servizi separati**: Backend e Frontend indipendenti
- **Backend**: Node.js su porta 4001 con health check `/api/info`
- **Frontend**: React statico servito da CDN
- **Auto-deploy**: Ogni push attiva rebuild automatico

## Troubleshooting

### Build Fallito
- Controlla la tab "Logs" in Render
- Verifica che `package.json` abbia gli script corretti
- Assicurati che tutte le dipendenze siano installabili

### Errore 502 Bad Gateway
- Il backend non è avviato correttamente
- Controlla le variabili d'ambiente
- Verifica i log per errori di startup

### Frontend Non Connette al Backend
- Verifica `REACT_APP_API_URL` sia corretto
- Assicurati che il backend sia online
- Controlla CORS configuration

### Plaid Link Non Funziona
- Verifica credenziali Plaid siano corrette
- Controlla che `PLAID_ENV` sia impostato correttamente
- Verifica redirect URLs in dashboard Plaid

## Comandi Utili
```bash
# Push con trigger deploy
git add .
git commit -m "Deploy to Render"
git push

# Check deploy status (su Render Dashboard)
# Vedi Logs, Metrics, Events
```

## Costi
- Piano gratuito: 750 ore/mese per servizio
- Sufficente per development e testing
- Per produzione: considera piano a pagamento ($7/mese)

## Best Practices
1. **Branch Strategy**: Usa `main` per produzione
2. **Environment Variables**: Mai commitare credenziali
3. **Monitoring**: Usa i log di Render per debugging
4. **Health Checks**: I servizi hanno già health check configurati
5. **Rollback**: Render supporta automatic rollback

## Note Importanti
- Il frontend viene servito come sito statico (molto veloce)
- Il backend ha health check per monitoraggio
- Entrambi i servizi hanno auto-restart su errori
- I log sono disponibili in tempo reale
