import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  return {
    id: 'rpt00692-saldoverklaring',
    type: 'list',
    title: constant('Saldoverklaring Te factureren abonnementen omzet'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'saldoverklaring',
            type: 'list',
            title: constant('Saldoverklaring per abonnementsregel'),
            languageInfo: {
              itemNamePlural: 'regels'
            },
            columns: [
              { key: 'administratie', header: 'Administratie', dataType: dataType.text(), sortable: true },
              { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
              { key: 'datumVan', header: 'Datum van', dataType: dataType.date(), sortable: true },
              { key: 'datumTot', header: 'Datum tot', dataType: dataType.date(), sortable: true },
              { key: 'gefactureerd', header: 'Gefactureerd', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'toegerekend', header: 'Toegerekend', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'teruggedraaid', header: 'Teruggedraaid', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'openstaand', header: 'Openstaand saldo', dataType: dataType.currencyAmount(), sortable: true },
            ],
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-saldoverklaring',
              idFieldKeys: ['abonnementsregel']
            })
          }
        }
      ]
    }
  };
}
