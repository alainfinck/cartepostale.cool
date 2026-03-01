/**
 * Layout minimal pour le widget embed : pas de padding, fond transparent.
 * Le widget est auto-suffisant (carte avec ombre).
 */
export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return <div className="p-0 m-0 min-h-0">{children}</div>
}
