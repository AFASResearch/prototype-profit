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
    id: 'poa442793',
    description: 'POA442793 — Integratierekening inhuur derden',
    entries: [
      { id: 'poa442793-integratie-financieel', description: 'Integratie financieel', link: 'poa442793-integratie-financieel/1' },
      { id: 'poa442793-integratiegroep', description: 'Integratiegroep', link: 'poa442793-integratiegroep/1' },
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
