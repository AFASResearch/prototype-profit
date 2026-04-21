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
      Abonnementnummer: createProperty(dataType.text()),
      Debiteur: createProperty(dataType.text()),
      Omschrijving: createProperty(dataType.text()),
      BegindatumCyclus: createProperty(dataType.date()),
      EinddatumCyclus: createProperty(dataType.date()),
      Factuurmoment: createProperty(dataType.text()),
      AantalDagen: createProperty(dataType.number({ digitGrouping: false })),
    }
  });

  // Alle overzichtsvelden zijn alleen-lezen op dit tabblad
  mainModel.properties.Abonnementnummer.config.locked = constant(true);
  mainModel.properties.Debiteur.config.locked = constant(true);
  mainModel.properties.Omschrijving.config.locked = constant(true);
  mainModel.properties.BegindatumCyclus.config.locked = constant(true);
  mainModel.properties.EinddatumCyclus.config.locked = constant(true);
  mainModel.properties.Factuurmoment.config.locked = constant(true);
  mainModel.properties.AantalDagen.config.locked = constant(true);

  return {
    id: 'rpt00692-abonnement-eigenschappen',
    type: 'detail',
    title: constant('Eigenschappen abonnement – EnYoi Glasvezel internet'),
    blueprint: {
      sections: [
        // --- Overzicht met KPI K004 (US08) ---
        {
          id: 'overzicht',
          sectionName: 'Overzicht',
          elements: [
            {
              type: 'fieldGroup',
              title: 'Abonnement',
              fields: [
                { labelText: constant('Abonnementnummer'), property: mainModel.properties.Abonnementnummer },
                { labelText: constant('Debiteur'), property: mainModel.properties.Debiteur },
                { labelText: constant('Omschrijving'), property: mainModel.properties.Omschrijving },
                { labelText: constant('Begindatum cyclus'), property: mainModel.properties.BegindatumCyclus },
                { labelText: constant('Einddatum cyclus'), property: mainModel.properties.EinddatumCyclus },
                { labelText: constant('Factuurmoment'), property: mainModel.properties.Factuurmoment },
                { labelText: constant('Aantal dagen'), property: mainModel.properties.AantalDagen },
              ]
            }
          ]
        },
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
                { key: 'verkooprelatie', header: 'Verkooprelatie', dataType: dataType.text(), sortable: true },
                { key: 'verkooprelatienr', header: 'Verkooprelatienr.', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'abonnementsnr', header: 'Abonnementsnr.', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'soort', header: 'Soort', dataType: dataType.text(), sortable: true },
                { key: 'item', header: 'Item', dataType: dataType.text(), sortable: true },
                { key: 'begin', header: 'Begin', dataType: dataType.date(), sortable: true },
                { key: 'eind', header: 'Eind', dataType: dataType.date(), sortable: true },
                { key: 'cyclus', header: 'Cyclus', dataType: dataType.text(), sortable: true },
                { key: 'aantal', header: 'Aantal', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'orgPrijs', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
              ],
              actions: [],
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00692-abonnement-eigenschappen/toekenningsregels',
                idFieldKeys: ['abonnementsnr']
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
