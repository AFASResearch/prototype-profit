import type { ApplicationMenuGroup, ApplicationMenuService } from '@afas/blueprint/services/application-menu-service-interfaces';

export const groups: ApplicationMenuGroup[] = [
  {
    "id": "home",
    "description": "Home",
    "entries": [
      {
        "id": "home",
        "description": "Home",
        "link": "home"
      }
    ]
  },
  {
    "id": "rpt00701",
    "description": "RPT00701 — Abonnementsprijzen",
    "entries": [
      {
        "id": "rpt00701-abonnementstarieven",
        "description": "Abonnementstarieven (weergave)",
        "link": "rpt00701-abonnementstarieven"
      },
      {
        "id": "rpt00701-onderhouden",
        "description": "Onderhouden abonnementstarieven (boekingslay-out)",
        "link": "rpt00701-onderhouden/1"
      },
      {
        "id": "rpt00701-prijswijzigingen",
        "description": "Prijzen abonnementsregels",
        "link": "rpt00701-prijswijzigingen-peildatum/1?inEditMode=true"
      },
      {
        "id": "rpt00701-wizard",
        "description": "Abonnementen factureren (wizard)",
        "link": "rpt00701-wizard/1?inEditMode=true"
      },
      {
        "id": "rpt00701-boekingslayout-abonnement",
        "description": "Boekingslay-out abonnement (+ Abonnementstarief)",
        "link": "rpt00701-boekingslayout-abonnement/1"
      },
      {
        "id": "rpt00701-abonnementsfactuur",
        "description": "Abonnementsfactuur (boekingslay-out)",
        "link": "rpt00701-abonnementsfactuur/1"
      },
      {
        "id": "rpt00701-prijsregel-wizard",
        "description": "Prijsregel kiezen (wizard)",
        "link": "rpt00701-prijsregel-wizard/1?inEditMode=true"
      },
      {
        "id": "rpt00701-te-corrigeren",
        "description": "Te corrigeren factuurregels",
        "link": "rpt00701-te-corrigeren"
      },
      {
        "id": "rpt00701-eigenschappen-prijzen",
        "description": "Eigenschappen prijzen/kortingen Artikel",
        "link": "rpt00701-eigenschappen-prijzen/1"
      },
      {
        "id": "rpt00701-verkoopprijs-item",
        "description": "Verkoopprijs (item) — weergave",
        "link": "rpt00701-verkoopprijs-item"
      },
      {
        "id": "rpt00701-collectief-wijzigen",
        "description": "Collectief wijzigen afwijkende prijzen (wizard)",
        "link": "rpt00701-collectief-wijzigen/1"
      }
    ]
  }
];

export async function loadMenuConfig(): Promise<ApplicationMenuGroup[]> {
  return groups;
}

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
