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
    id: 'rfi00731',
    description: 'RFI00731 — Inhoudingsplicht België',
    entries: [
      { id: 'rfi00731-crediteur-pw', description: 'Crediteur — Inhoudingsplicht (PW)', link: 'rfi00731-crediteur-pw' },
      { id: 'rfi00731-crediteur-insite', description: 'Crediteur — InSite (Profit 8)', link: 'rfi00731-crediteur-insite' },
      { id: 'rfi00731-inkoopfactuur', description: 'Inkoopfactuur — Inhoudingsplicht', link: 'rfi00731-inkoopfactuur' },
      { id: 'rfi00731-instantie', description: 'Instantie inhoudingsplicht', link: 'rfi00731-instantie' },
      { id: 'rfi00731-w15-profit7', description: 'W15 — Crediteur InSite (Profit 7)', link: 'rfi00731-w15-profit7' },
      { id: 'rfi00731-w15-profit8', description: 'W15 — Crediteur InSite (Profit 8)', link: 'rfi00731-w15-profit8' },
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
