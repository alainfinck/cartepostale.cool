'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Mail, Users, Building2, Image as ImageIcon, Cloud, LogOut, Menu, BarChart3, Sticker } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const nav = [
  { href: '/manager/cartes', label: 'Cartes postales', icon: Mail },
  { href: '/manager/stats', label: 'Statistiques', icon: BarChart3 },
  { href: '/manager/galerie', label: 'Galerie', icon: ImageIcon },
  { href: '/manager/stickers', label: 'Stickers', icon: Sticker },
  { href: '/manager/r2', label: 'Bucket R2', icon: Cloud },
  { href: '/manager/clients', label: 'Clients', icon: Users },
  { href: '/manager/leads', label: 'Leads', icon: Mail },
  { href: '/manager/agences', label: 'Agences', icon: Building2 },
]

export function ManagerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const sidebar = (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-semibold text-foreground">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {nav.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/manager' && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link href="/">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-3">
            <LogOut className="h-4 w-4" />
            Retour au site
          </Button>
        </Link>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Mobile header with menu */}
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            {sidebar}
          </SheetContent>
        </Sheet>
        <span className="font-semibold text-foreground">Admin</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{sidebar}</div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
