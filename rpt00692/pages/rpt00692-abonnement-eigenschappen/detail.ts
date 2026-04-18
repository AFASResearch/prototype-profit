import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { DetailPage } from '@afas/blueprint/interfaces/detail-page';

export default function (services: BlueprintFactories): DetailPage {
  let {
    data: { dataType, createModel, createProperty, constant },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
    }
  });

  return {
    id: 'rpt00692-abonnement-eigenschappen',
    type: 'detail',
    title: constant('Eigenschappen abonnement – EnYoi Glasvezel internet'),
    blueprint: {
      sections: [
        // --- NIEUW tabblad: Periodetoekenningsregels (US09) ---
        ({
          id: 'periodetoekenningsregels',
          sectionName: 'Periodetoekenningsregels',
          elements: [
            {
              id: 'toekenningsregels-abonnement',
              type: 'list',
              title: constant('Periodetoekenningsregels'),
              languageInfo: {
                itemNamePlural: 'toekenningsregels'
              },
              columns: [
                { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
                { key: 'item', header: 'Item', dataType: dataType.text(), sortable: true },
                { key: 'boekjaar', header: 'Boekjaar', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'periode', header: 'Periode', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
                { key: 'status', header: 'Status', dataType: dataType.text(), sortable: true },
                { key: 'aangemaakt', header: 'Aangemaakt op', dataType: dataType.date(), sortable: true },
                { key: 'aanmakerNaam', header: 'Aangemaakt door', dataType: dataType.text(), sortable: true },
              ],
              actions: [],
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00692-abonnement-eigenschappen/toekenningsregels',
                idFieldKeys: ['abonnementsregel']
              })
            } as any
          ]
        }) as any,
        // --- NIEUW tabblad: Transitorische journaalposten (US09) ---
        ({
          id: 'transitorische-journaalposten',
          sectionName: 'Transitorische journaalposten',
          elements: [
            {
              id: 'journaalposten-abonnement',
              type: 'list',
              title: constant('Transitorische journaalposten'),
              languageInfo: {
                itemNamePlural: 'journaalposten'
              },
              columns: [
                { key: 'boekstuknummer', header: 'Boekstuknummer', dataType: dataType.text(), sortable: true },
                { key: 'boekdatum', header: 'Boekdatum', dataType: dataType.date(), sortable: true },
                { key: 'boekjaar', header: 'Boekjaar', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'periode', header: 'Periode', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'grootboekrekening', header: 'Grootboekrekening', dataType: dataType.text(), sortable: true },
                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                { key: 'debet', header: 'Debet', dataType: dataType.currencyAmount(), sortable: true },
                { key: 'credit', header: 'Credit', dataType: dataType.currencyAmount(), sortable: true },
              ],
              actions: [],
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00692-abonnement-eigenschappen/journaalposten',
                idFieldKeys: ['boekstuknummer']
              })
            } as any
          ]
        }) as any,
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-eigenschappen',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-eigenschappen',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
