import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  const columns = [
    { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
    { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
    { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
    { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
    { key: 'status', header: 'Status', dataType: dataType.text(), sortable: true },
    { key: 'redencode', header: 'Redencode', dataType: dataType.text(), sortable: true },
    { key: 'aangemaakt', header: 'Aangemaakt op', dataType: dataType.text(), sortable: true },
    { key: 'aanmakerNaam', header: 'Aangemaakt door', dataType: dataType.text(), sortable: true },
  ];

  const idFieldKeys = ['abonnementsregel'];

  return {
    id: 'rpt00692-toekenningsregels',
    type: 'list',
    title: constant('Periodetoekenningsregels'),
    blueprint: {
      defaultSection: 'alle',
      sections: [
        {
          content: {
            id: 'alle',
            type: 'list',
            title: constant('Alle periodetoekenningsregels'),
            languageInfo: { itemNamePlural: 'toekenningsregels' },
            columns,
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-toekenningsregels',
              idFieldKeys
            })
          }
        },
        {
          content: {
            id: 'te-journaliseren',
            type: 'list',
            title: constant('Te journaliseren periodetoekenningsregels'),
            languageInfo: { itemNamePlural: 'toekenningsregels' },
            columns,
            actions: [
              {
                id: 'journaliseren',
                name: 'Journaliseren',
                isPrimary: true,
                isMultiselect: true,
                async execute(context: any) {
                  let confirmed = await context.confirm({ title: 'Bevestiging', message: 'Weet je zeker dat je de geselecteerde toekenningen wilt journaliseren?' });
                  if (!confirmed) return false;
                  return true;
                },
                scheduleListRefresh: [1000, 5000]
              },
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-toekenningsregels/te-journaliseren',
              idFieldKeys
            })
          }
        },
        {
          content: {
            id: 'gejournaliseerd',
            type: 'list',
            title: constant('Gejournaliseerde periodetoekenningsregels'),
            languageInfo: { itemNamePlural: 'toekenningsregels' },
            columns,
            actions: [
              {
                id: 'terugdraaien',
                name: 'Journaliseren ongedaan maken',
                isPrimary: true,
                isMultiselect: true,
                async execute(context: any) {
                  let confirmed = await context.confirm({ title: 'Bevestiging', message: 'Weet je zeker dat je de geselecteerde toekenningen wilt terugdraaien?' });
                  if (!confirmed) return false;
                  return true;
                },
                scheduleListRefresh: [1000, 5000]
              },
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-toekenningsregels/gejournaliseerd',
              idFieldKeys
            })
          }
        },
      ]
    }
  };
}
