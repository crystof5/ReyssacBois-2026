import type { Metadata } from "next"
import Container from "@/components/ui/Container"
import LoginForm from "./LoginForm"
import { Suspense } from "react"
import { getAdminUserFromCookieStore } from "@/lib/adminAuth"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Connexion",
  // Sécurité SEO: `robots.txt` peut être contourné (URL découverte ailleurs).
  // On force donc un noindex explicite.
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  // Si déjà connecté, inutile d’afficher le login.
  const user = await getAdminUserFromCookieStore()
  if (user) {
    redirect("/admin")
  }

  return (
    <Container className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
        <p className="mt-2 text-sm text-gray-600">
          Accès réservé à l&apos;administration.
        </p>
        <div className="mt-6">
          <Suspense
            fallback={
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                Chargement…
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </Container>
  )
}


