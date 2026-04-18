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
  },
  {
    id: 'rpt00692',
    description: 'RPT00692 — Periodetoekenning omzet',
    entries: [
      { id: 'rpt00692-toekenningsregels', description: 'Periodetoekenningsregels', link: 'rpt00692-toekenningsregels' },
      { id: 'rpt00692-abonnement-cyclus', description: 'Periodeafsluiting', link: 'rpt00692-abonnement-cyclus/1' },
      { id: 'rpt00692-genereer-wizard', description: 'Genereer periodetoekenningsregels (wizard)', link: 'rpt00692-genereer-wizard/1?inEditMode=true' },
      { id: 'rpt00692-journaliseer-wizard', description: 'Journaliseer toekenningsregels (wizard)', link: 'rpt00692-journaliseer-wizard/1?inEditMode=true' },
      { id: 'rpt00692-terugdraaien-wizard', description: 'Journaliseren ongedaan maken (wizard)', link: 'rpt00692-terugdraaien-wizard/1?inEditMode=true' },
      { id: 'rpt00692-facturering-voorraad', description: 'Facturering/voorraad — Periodetoekenning', link: 'rpt00692-facturering-voorraad/1' },
      { id: 'rpt00692-saldoverklaring', description: 'Saldoverklaring Te factureren omzet', link: 'rpt00692-saldoverklaring' },
<<<<<<< HEAD
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
=======
>>>>>>> 5495691 (feat: add ontwerp and presentatie action buttons per project)
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
