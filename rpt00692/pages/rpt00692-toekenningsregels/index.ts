import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  return {
    id: 'rpt00692-toekenningsregels',
    type: 'list',
    title: constant('Alle periodetoekenningsregels'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'alle',
            type: 'list',
            title: constant('Alle periodetoekenningsregels'),
            languageInfo: { itemNamePlural: 'toekenningsregels' },
            columns: [
              { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
              { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
              { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'aangemaakt', header: 'Aangemaakt op', dataType: dataType.date(), sortable: true },
              { key: 'aanmakerNaam', header: 'Aangemaakt door', dataType: dataType.text(), sortable: true },
            ],
            actions: [
              {
                id: 'verwijder',
                name: 'Verwijder toekenningsregels',
                isPrimary: true,
                isMultiselect: true,
                async execute(context: any) {
                  let confirmed = await context.confirm({
                    title: 'Bevestiging',
                    message: 'Weet je zeker dat je de geselecteerde toekenningen wilt verwijderen? De bijbehorende journaalposten worden teruggedraaid.'
                  });
                  if (!confirmed) return false;
                  return true;
                },
                scheduleListRefresh: [1000, 5000]
              },
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-toekenningsregels',
              idFieldKeys: ['abonnementsregel']
            })
          }
        }
      ]
    }
  };
}
