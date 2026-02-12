'use client'

import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { getAllUsers, type UsersResult } from '@/actions/manager-actions'
import type { User } from '@/payload-types'

export function ManagerClientsClient({ initialData }: { initialData: UsersResult }) {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(async () => {
      const result = await getAllUsers({ search: value || undefined, limit: 50 })
      setData(result)
    })
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email, nom, société..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {isPending && (
            <span className="text-sm text-muted-foreground">Chargement…</span>
          )}
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Société</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Cartes créées</TableHead>
                <TableHead>Inscrit le</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              ) : (
                data.docs.map((user: User) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name ?? '—'}</TableCell>
                    <TableCell>{user.company ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.plan ?? 'free'}</TableCell>
                    <TableCell className="text-right">{user.cardsCreated ?? 0}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {data.totalDocs} client{data.totalDocs !== 1 ? 's' : ''} au total
        </p>
      </CardContent>
    </Card>
  )
}
