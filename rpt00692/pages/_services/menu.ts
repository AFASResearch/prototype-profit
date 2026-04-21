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
    id: 'rpt00692',
    description: 'RPT00692 — Periodetoekenning omzet',
    entries: [
      { id: 'rpt00692-toekenningsregels', description: 'Alle periodetoekenningsregels', link: 'rpt00692-toekenningsregels' },
      { id: 'rpt00692-abonnement-cyclus', description: 'Periodeafsluiting', link: 'rpt00692-abonnement-cyclus/1' },
      { id: 'rpt00692-genereer-wizard', description: 'Genereer periodetoekenningsregels (wizard)', link: 'rpt00692-genereer-wizard/1?inEditMode=true' },
      { id: 'rpt00692-facturering-voorraad', description: 'Facturering/voorraad — Periodetoekenning', link: 'rpt00692-facturering-voorraad/1' },
      { id: 'rpt00692-saldoverklaring', description: 'Saldoverklaring Te factureren omzet', link: 'rpt00692-saldoverklaring/1?inEditMode=true' },
      { id: 'rpt00692-abonnement-eigenschappen', description: 'Eigenschappen abonnement (US09 + KPI K004)', link: 'rpt00692-abonnement-eigenschappen/1' },
      { id: 'rpt00692-boekingslayout-abonnement', description: 'Boekingslay-out abonnement (US07 Factuurmoment)', link: 'rpt00692-boekingslayout-abonnement/1' },
      { id: 'rpt00692-verkooprelatieprofiel', description: 'Verkooprelatieprofiel (US07 Factuurmoment)', link: 'rpt00692-verkooprelatieprofiel/1' },
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
