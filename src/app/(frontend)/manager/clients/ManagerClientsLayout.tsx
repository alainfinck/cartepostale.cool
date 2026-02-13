'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Sticker } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ManagerClientsClient } from './ManagerClientsClient'
import ManagerStickers from '../ManagerStickers'
import type { UsersResult } from '@/actions/manager-actions'

const TABS = [
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stickers' as const, label: 'Stickers', icon: Sticker },
] as const

type TabId = (typeof TABS)[number]['id']

export function ManagerClientsLayout({ initialData }: { initialData: UsersResult }) {
  const searchParams = useSearchParams()
  const tab = (searchParams.get('tab') as TabId) || 'dashboard'
  const safeTab = TABS.some((t) => t.id === tab) ? tab : 'dashboard'

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-0">
      {/* Left tabs */}
      <nav className="flex lg:flex-col gap-1 shrink-0 lg:w-52 border-b lg:border-b-0 lg:border-r border-border pb-4 lg:pb-0 lg:pr-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = safeTab === id
          const href = id === 'dashboard' ? '/manager/clients' : '/manager/clients?tab=stickers'
          return (
            <Link
              key={id}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {safeTab === 'dashboard' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
              <p className="text-muted-foreground">Liste des utilisateurs inscrits.</p>
            </div>
            <ManagerClientsClient initialData={initialData} />
          </>
        )}
        {safeTab === 'stickers' && <ManagerStickers />}
      </div>
    </div>
  )
}
