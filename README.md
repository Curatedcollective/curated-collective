Curated Collective — local dev README

Quick start

1) Ensure Node >= 20 and PostgreSQL available (or use offline mode).

2) Install dependencies:

```powershell
npm install
```

3) Optional: create `session` table required by the session store:

```powershell
# set DATABASE_URL then run
$env:DATABASE_URL = "postgres://USER:PASSWORD@HOST:5432/DBNAME"
npm run create-session-table
```

4) Start server (development):

```powershell
# offline (no DB)
Remove-Item Env:DATABASE_URL -ErrorAction SilentlyContinue
npm run start:dev

# or with DB
$env:DATABASE_URL = "postgres://USER:PASSWORD@HOST:5432/DBNAME"
npm run start:dev
```

5) Verify Veil and login:

```powershell
curl -i http://localhost:8080/health
curl -i http://localhost:8080/debug/routes
# open in browser: http://localhost:8080/api/veil/login
curl -i -X POST http://localhost:8080/api/veil/login -H "Content-Type: application/json" -d '{"word":"Judy Green"}' -c cookies.txt
curl -i http://localhost:8080/api/auth/user -b cookies.txt
```

Persisting assistant personas (local, interactive)

```powershell
# upsert Draco
npm run upsert-draco
# upsert Aster
npm run upsert-aster
```

Production / Domain

- Point `CURATEDCOLLECTIVE.SOCIAL` to your host IP and configure a reverse proxy (nginx) with SSL.
- See `nginx/curatedcollective.conf` for an example reverse-proxy + SSL location.

Safety

- All upsert scripts are interactive and require you to run them locally to persist agents into the DB.
- The assistant will not write to your DB without you running these scripts.
