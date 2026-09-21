# Default login credentials (development only)

Change these in production. Configure via `server/.env`:

```env
SEED_DOCTOR_EMAIL=doctor@dentflow.com
SEED_DOCTOR_PASSWORD=Doctor@12345
SEED_DOCTOR_NAME=Dr. Clinic Owner
```

## Clinic staff dashboard

| Field | Value |
|-------|--------|
| URL | http://localhost:5173/clinic/login |
| Email | `doctor@dentflow.com` (or your `SEED_DOCTOR_EMAIL`) |
| Password | `Doctor@12345` (or your `SEED_DOCTOR_PASSWORD`) |
| Role | `DOCTOR` + clinic owner (`is_clinic_owner`) |

After login, add receptionists under **Team**.

## Patient portal

Patients **register** at http://localhost:5173/register — no default patient account.

## Forgot password (OTP)

Works for **patients**, **doctors**, and **receptionists**. OTP is **always sent by email** (SMTP required).

| Portal | Forgot password URL |
|--------|---------------------|
| Patient | http://localhost:5173/forgot-password |
| Clinic staff | http://localhost:5173/clinic/forgot-password |

Add to `server/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="DentFlow <your@gmail.com>"
```

For Gmail: enable 2FA → create an [App Password](https://myaccount.google.com/apppasswords).

## Google sign-in (all roles)

Works on patient login/register and clinic login.

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Authorized JavaScript origins: `http://localhost:5173`
4. Authorized redirect URIs: `http://localhost:5173` (not used for One Tap but required)

**Server** `server/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Client** `client/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

| Portal | Google behaviour |
|--------|------------------|
| Patient | New Google users auto-register as patients |
| Clinic | Only existing doctor/receptionist emails can sign in |
| All | Google links to an existing account with the same email |

## Apply seed

```bash
cd server
npm run db:migrate
npm run db:seed
```
