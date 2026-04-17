import type { ApplicationMenuGroup, ApplicationMenuService } from '@afas/blueprint/services/application-menu-service-interfaces';

export const groups: ApplicationMenuGroup[] = [
  {
    id: 'home',
    description: 'Home',
    entries: [
      {
        id: 'home',
        description: 'Home',
        link: 'home'
      }
    ]
  },
  {
    id: 'rpt00701',
    description: 'RPT00701 — Abonnementsprijzen',
    entries: [
      { id: 'rpt00701-abonnementsprijzen', description: 'Abonnementsprijzen', link: 'rpt00701-abonnementsprijzen' },
      { id: 'rpt00701-collectief-wijzigen', description: 'Collectief wijzigen', link: 'rpt00701-collectief-wijzigen/1' },
      { id: 'rpt00701-wizard', description: 'Abonnementen factureren (wizard)', link: 'rpt00701-wizard/1?inEditMode=true' },
      { id: 'rpt00701-te-corrigeren', description: 'Te corrigeren factuurregels', link: 'rpt00701-te-corrigeren' },
    ]
  }
];

export default async function (): Promise<ApplicationMenuService> {
  return {
    getAllEntries() {
      return groups;
    },
    getFavoriteMenuEntries() {
      return groups;
    },
    updateFavoriteMenuEntries() {
      return;
    },
    wait(): Promise<void> {
      return Promise.resolve();
    },
    hasMainMenu: true
  };
}
