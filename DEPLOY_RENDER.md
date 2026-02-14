# Deploy on Render

**Author:** Giuseppe Bosi

This guide explains how to deploy Plaid-Bank-Transfer (backend + frontend) on [Render](https://render.com) using the Blueprint in this repo.

## Overview

- **Backend**: Node/Express Web Service (free tier; sleeps after ~15 min inactivity).
- **Frontend**: Static Site (React build), free.

The repo includes a `render.yaml` Blueprint that defines both services. You only need to connect the GitHub repo and set environment variables in the Render Dashboard.

## Steps

### 1. Connect the repo to Render

1. Go to [Render Dashboard](https://dashboard.render.com) and sign in (or sign up with GitHub).
2. Click **New** → **Blueprint**.
3. Connect your GitHub account if needed, then select the repository `Plaid-Bank-Transfer`.
4. Render will read `render.yaml` and create two services: **plaid-backend** and **plaid-frontend**.

### 2. Configure Backend environment variables

In the **plaid-backend** service → **Environment** tab, set:

| Key             | Value        | Notes                    |
|-----------------|-------------|---------------------------|
| `PLAID_CLIENT_ID` | your_client_id | From [Plaid Dashboard](https://dashboard.plaid.com/developers/keys) |
| `PLAID_SECRET`    | your_secret    | From Plaid Dashboard      |
| `PLAID_ENV`       | sandbox        | Or `development` / `production` |
| `SENTRY_DSN`      | (optional)     | For error tracking        |

Save. The backend will deploy (or redeploy) and get a URL like `https://plaid-backend-xxxx.onrender.com`.

### 3. Configure Frontend environment variables

In the **plaid-frontend** service → **Environment** tab, set:

| Key                   | Value                                      | Notes                          |
|-----------------------|--------------------------------------------|--------------------------------|
| `REACT_APP_API_URL`   | `https://plaid-backend-xxxx.onrender.com`   | **Use the exact backend URL**  |
| `REACT_APP_SENTRY_DSN`| (optional)                                 | For frontend error tracking    |
| `REACT_APP_ENV`       | production                                 | Already set in Blueprint       |

**Important:** Set `REACT_APP_API_URL` **after** the first backend deploy, so you can copy the backend URL. Then trigger a new deploy of the frontend (Manual Deploy or push a commit) so the build picks up the variable.

### 4. Deploy

- Backend and frontend deploy automatically on push to the default branch (if auto-deploy is on).
- Free-tier backend may take 30–60 seconds to wake up after sleep; the frontend will show errors until the backend is up.

## URLs after deploy

- **Frontend:** `https://plaid-frontend-xxxx.onrender.com` (or the custom name you see).
- **Backend API:** `https://plaid-backend-xxxx.onrender.com` (use this for `REACT_APP_API_URL`).

## Troubleshooting

- **Frontend shows "Failed to fetch" or network errors:** Ensure `REACT_APP_API_URL` is set to the backend URL (with `https://`, no trailing slash) and redeploy the frontend.
- **Backend "Application failed to respond":** Free tier sleeps after inactivity; wait 30–60 s and retry, or check Render logs for startup errors.
- **Plaid errors in production:** Use Plaid Dashboard to add your Render frontend URL to allowed redirect URIs and ensure you use the correct `PLAID_ENV` and keys for that environment.
