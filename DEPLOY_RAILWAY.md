# Deploy su Railway - Plaid-Bank-Transfer
# Author: Giuseppe Bosi

## Prerequisiti
- Account Railway (https://railway.app/)
- Repository GitHub collegato
- Credenziali Plaid (CLIENT_ID e SECRET)

## Passaggi per il Deploy

### 1. Collega Repository a Railway
1. Vai su https://railway.app/dashboard
2. Clicca "New Project" → "Deploy from GitHub repo"
3. Seleziona il repository `Plaid-Bank-Transfer`
4. Railway rileverà automaticamente il Dockerfile

### 2. Configura Variabili d'Ambiente
Nel dashboard Railway, vai su Settings → Variables e aggiungi:

**Backend Variables:**
```
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox
SENTRY_DSN=your_sentry_dsn (opzionale)
NODE_ENV=production
```

**Frontend Variables:**
```
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_ENV=production
REACT_APP_SENTRY_DSN=your_sentry_dsn (opzionale)
```

### 3. Deploy Automatico
- Railway farà il deploy automatico dopo il push
- Il build richiederà 5-10 minuti
- L'app sarà disponibile su: `https://your-app-name.railway.app`

### 4. Verifica Deploy
1. Controlla che il backend risponda: `https://your-app.railway.app/api/info`
2. Apri l'URL principale per verificare il frontend
3. Testa la connessione con Plaid

## Architettura Deploy
- **Single Service**: Backend + Frontend in un container
- **Backend**: Porta 4001 (API REST)
- **Frontend**: Servito come file statici da Express
- **Health Check**: `/api/info`

## Troubleshooting

### Build Fallito
- Controlla il log su Railway
- Verifica che tutte le dipendenze siano in package.json

### Variabili Mancanti
- Assicurati che tutte le env variables siano configurate
- Riavvia il deploy dopo averle aggiunte

### Frontend Non Carica
- Verifica `REACT_APP_API_URL` sia corretto
- Controlla i log per errori di connessione

## Comandi Utili
```bash
# Push con trigger deploy
git add .
git commit -m "Deploy to Railway"
git push

# Check deploy status
railway logs
```

## Costi
- Piano gratuito: 500 ore/mese
- Sufficente per development e testing
- Per produzione: considera piano a pagamento
