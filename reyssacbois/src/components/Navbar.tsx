import NavbarClient from "@/components/NavbarClient"
import { getAdminUserFromCookieStore } from "@/lib/adminAuth"

export default async function Navbar() {
  const user = await getAdminUserFromCookieStore()
  return <NavbarClient isAuthed={!!user} />
}
