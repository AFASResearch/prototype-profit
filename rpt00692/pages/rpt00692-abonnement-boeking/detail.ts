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
      // --- Tab Algemeen (bestaand) ---
      abonnement: createProperty(dataType.text()),
      debiteur: createProperty(dataType.text()),
      omschrijving: createProperty(dataType.text()),
      // --- Tab Cyclus ---
      cyclusFacturering: createProperty(dataType.text()),
      factuurmoment: createProperty(dataType.enumeration({ // nieuw
        options: [
          { key: '1', name: 'Aantal dagen vóór begindatumcyclus' },
          { key: '2', name: 'Aantal dagen ná begindatumcyclus' },
          { key: '3', name: 'Aantal dagen vóór einddatumcyclus' },
          { key: '4', name: 'Aantal dagen ná einddatumcyclus' },
        ]
      })),
      cyclusverlenging: createProperty(dataType.text()),
      begindatumFactuurcyclus: createProperty(dataType.date()),
      datumVerlenging: createProperty(dataType.date()),
      aantalDagen: createProperty(dataType.number({ digitGrouping: false })), // gewijzigd: hernoemd van "Aantal dagen vooraf"
      methodeVerdeling: createProperty(dataType.text()),
    }
  });

  // Tooltip: Factuurmoment
  // "Bepaalt wanneer de factuur wordt aangemaakt ten opzichte van de cyclus."

  return {
    id: 'rpt00692-abonnement-boeking',
    type: 'detail',
    title: constant('Abonnementen (Profit) — Abonnement: 4244'),
    blueprint: {
      sections: [
        // --- Tab Algemeen (bestaand) ---
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                { labelText: constant('Abonnement'), property: mainModel.properties.abonnement },
                { labelText: constant('Debiteur'), property: mainModel.properties.debiteur },
                { labelText: constant('Omschrijving'), property: mainModel.properties.omschrijving },
              ]
            }
          ]
        },
        // --- Tab Cyclus (kop van de boekingslayout) ---
        {
          id: 'cyclus',
          sectionName: 'Cyclus',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              fields: [
                { labelText: constant('Cyclus facturering'), property: mainModel.properties.cyclusFacturering },
                { labelText: constant('Cyclusverlenging'), property: mainModel.properties.cyclusverlenging },
                {
                  labelText: constant('Factuurmoment'), // nieuw
                  property: mainModel.properties.factuurmoment,
                  getMicroCopyText() { return 'Bepaalt wanneer de factuur wordt aangemaakt ten opzichte van de cyclus.'; }
                },
                {
                  labelText: constant('Aantal dagen'), // gewijzigd: hernoemd van "Aantal dagen vooraf"
                  property: mainModel.properties.aantalDagen,
                  getMicroCopyText() { return 'Aantal dagen verschuiving ten opzichte van de gekozen referentiedatum.'; }
                },
                { labelText: constant('Begindatum factuurcyclus'), property: mainModel.properties.begindatumFactuurcyclus },
                { labelText: constant('Datum verlenging'), property: mainModel.properties.datumVerlenging },
                { labelText: constant('Methode verdeling'), property: mainModel.properties.methodeVerdeling },
              ]
            },
            // Embedded list: abonnementsregels (regeldeel boekingslayout)
            {
              id: 'abonnementsregels',
              type: 'list',
              title: constant('Abonnementsregels'),
              languageInfo: { itemNamePlural: 'regels' },
              columns: [
                { key: 'code', header: 'Code', dataType: dataType.text(), sortable: true },
                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                { key: 'aantal', header: 'Aantal', dataType: dataType.number({ digitGrouping: false }), sortable: true },
                { key: 'begin', header: 'Begin', dataType: dataType.date(), sortable: true },
                { key: 'orgPrijs', header: 'Org. prijs', dataType: dataType.currencyAmount(), sortable: true },
                { key: 'afwPrijs', header: 'Afw. prijs', dataType: dataType.currencyAmount(), sortable: false },
                { key: 'kortingPerc', header: 'Korting (%)', dataType: dataType.percentage(), sortable: false },
                { key: 'korting', header: 'Korting', dataType: dataType.currencyAmount(), sortable: false },
              ],
              actions: [],
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00692-abonnement-boeking/regels',
                idFieldKeys: ['code']
              })
            } as any
          ]
        },
        // --- Tab Extra (bestaand, placeholder) ---
        { id: 'extra', sectionName: 'Extra', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Tab Verbijzondering (bestaand, placeholder) ---
        { id: 'verbijzondering', sectionName: 'Verbijzondering', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-boeking',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-boeking',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
