import "./globals.css"
import Navbar from "@/components/Navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
