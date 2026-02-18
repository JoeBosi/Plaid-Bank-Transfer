# Pre-Deploy Checklist - Render
# Author: Giuseppe Bosi

## ✅ Verifiche Automatiche

### Backend
- [x] `backend/package.json` esiste con script `start`
- [x] `backend/server.js` esiste e funziona localmente
- [x] Health check `/api/info` implementato
- [x] Porta 4001 configurata
- [x] Tutte le dipendenze in `dependencies`

### Frontend  
- [x] `frontend/package.json` esiste con script `build`
- [x] Script `start` senza comandi Windows-specific
- [x] App React funziona localmente
- [x] Tutte le dipendenze in `dependencies`

### Configurazione Render
- [x] `render.yaml` configurato correttamente
- [x] Health checks configurati
- [x] Variabili d'ambiente preparate
- [x] Piano gratuito selezionato

### Git
- [x] `.gitignore` configurato correttamente
- [x] Nessuna credenziale nel repo
- [x] Branch `main` pronto per deploy

## 🚀 Passi Finali

1. **Push su GitHub**
   ```bash
   git add .
   git commit -m "Ready for Render deploy"
   git push origin main
   ```

2. **Deploy su Render**
   - Vai su https://dashboard.render.com/
   - New + → Blueprint
   - Seleziona repository
   - Apply Blueprint

3. **Configurazione Post-Deploy**
   - Imposta `PLAID_CLIENT_ID` e `PLAID_SECRET` nel backend
   - Imposta `REACT_APP_API_URL` nel frontend
   - Testa entrambi i servizi

## ⚠️ Note Importanti

- Il frontend userà la porta 3000 in locale, 80/443 in produzione
- Il backend userà sempre la porta 4001
- Render assegna URL automatici dopo il deploy
- I log sono disponibili in tempo reale

## 🔍 Test Post-Deploy

1. Backend: `https://plaid-backend.onrender.com/api/info`
2. Frontend: `https://plaid-frontend.onrender.com`
3. Test completo: connessione Plaid

## 📞 Supporto

- Render docs: https://render.com/docs
- Dashboard: https://dashboard.render.com/
- Status: https://status.render.com/
