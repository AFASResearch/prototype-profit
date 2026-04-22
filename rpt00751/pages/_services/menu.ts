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
    id: 'rpt00751',
    description: 'RPT00751 — Integratierekening inhuur derden',
    entries: [
      { id: 'rpt00751-integratie-financieel', description: 'Integratie financieel', link: 'rpt00751-integratie-financieel/1' },
      { id: 'rpt00751-integratiegroep', description: 'Integratiegroep', link: 'rpt00751-integratiegroep/1' },
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
