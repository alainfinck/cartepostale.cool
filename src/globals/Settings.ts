import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'exitIntentEnabled',
      type: 'checkbox',
      label: 'Activer le modal "Carte Pro Gratuite" (Exit Intent)',
      defaultValue: true,
    },
  ],
}
