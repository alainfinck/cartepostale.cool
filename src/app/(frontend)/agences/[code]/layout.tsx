/**
 * Layout dédié aux pages agence (marque blanche).
 * Pas de Navbar/Footer du site principal : le menu = header agence dans AgencePublicClient.
 */
export default function AgencyPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div data-template="agency" className="agency-page-template">
      {children}
    </div>
  )
}
