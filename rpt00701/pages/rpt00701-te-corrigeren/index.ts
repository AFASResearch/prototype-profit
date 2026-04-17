import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  return {
    id: 'rpt00701-te-corrigeren',
    type: 'list',
    title: constant('Te corrigeren factuurregels'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'main',
            type: 'list',
            title: constant('Te corrigeren factuurregels'),
            languageInfo: {
              itemNamePlural: 'factuurregels'
            },
            columns: [
              { key: 'bronfactuur', header: 'Bronfactuur', dataType: dataType.text(), sortable: true },
              { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
              { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'periodevn', header: 'Periode van', dataType: dataType.text(), sortable: true },
              { key: 'periodetm', header: 'Periode t/m', dataType: dataType.text(), sortable: true },
              { key: 'oudeprijs', header: 'Oude prijs', dataType: dataType.currencyAmount() },
              { key: 'oudbedrag', header: 'Oud bedrag', dataType: dataType.currencyAmount() },
              { key: 'nieuweprijs', header: 'Nieuwe prijs', dataType: dataType.currencyAmount() },
              { key: 'corrbedrag', header: 'Correctiebedrag', dataType: dataType.currencyAmount() },
              { key: 'status', header: 'Status', dataType: dataType.text(), sortable: true },
              { key: 'meenemen', header: 'Meenemen', dataType: dataType.yesNo() },
            ],
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-te-corrigeren',
              idFieldKeys: ['bronfactuur', 'periodevn']
            })
          }
        }
      ]
    }
  };
}
