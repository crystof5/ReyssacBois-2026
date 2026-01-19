This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Installation

Installer les dépendances :

```bash
npm install
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Admin (/admin) — Supabase Auth

L’admin est accessible via `/admin` et protégée par **Supabase Auth** + une whitelist d’emails.

### Variables d’environnement requises

- **`NEXT_PUBLIC_SUPABASE_URL`**: URL du projet Supabase (ex: `https://xxxx.supabase.co`)
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: clé anon publique
- **`ADMIN_EMAILS`**: emails autorisés (séparés par des virgules), ex: `admin@reyssacbois.fr, autre@reyssacbois.fr`

## Formulaire de contact — SMTP + reCAPTCHA v3

- **Copie le fichier `env.example` vers `.env.local`** puis renseigne les valeurs.
- **Crée un reCAPTCHA v3** dans la console Google, ajoute les domaines autorisés, puis récupère:
  - **`NEXT_PUBLIC_RECAPTCHA_SITE_KEY`** (clé site)
  - **`RECAPTCHA_SECRET_KEY`** (clé secrète)

### Dépendances

L’admin utilise:

- `@supabase/supabase-js`
- `@supabase/ssr`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
