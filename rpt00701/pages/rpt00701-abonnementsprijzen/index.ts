import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  return {
    id: 'rpt00701-abonnementsprijzen',
    type: 'list',
    title: constant('Verkoopprijzen abonnementen'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'main',
            type: 'list',
            title: constant('Verkoopprijzen abonnementen'),
            languageInfo: {
              itemNamePlural: 'abonnementsprijzen'
            },
            columns: [
              { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
              { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
              { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'begindatum', header: 'Begindatum', dataType: dataType.text(), sortable: true },
              { key: 'einddatum', header: 'Einddatum', dataType: dataType.text(), sortable: true },
              { key: 'prijs', header: 'Prijs', dataType: dataType.currencyAmount() },
            ],
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-abonnementsprijzen',
              idFieldKeys: ['abonr', 'abonregel', 'begindatum']
            })
          }
        }
      ]
    }
  };
}
