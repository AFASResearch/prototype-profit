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
      // --- Veldgroep Abonnement ---
      abonnement: createProperty(dataType.text()),
      debiteur: createProperty(dataType.text()),
      artikelgroep: createProperty(dataType.text()),
      facturatiemethode: createProperty(dataType.text()),
      begindatum: createProperty(dataType.text()),
      einddatum: createProperty(dataType.text()),
      // --- Veldgroep Cyclus ---
      cyclus: createProperty(dataType.text()),
      begindatumCyclus: createProperty(dataType.text()),
      einddatumCyclus: createProperty(dataType.text()),
      aantalDagenAchteraf: createProperty(dataType.number()),
    }
  });

  // Alle velden zijn readonly
  mainModel.properties.abonnement.config.locked = constant(true);
  mainModel.properties.debiteur.config.locked = constant(true);
  mainModel.properties.artikelgroep.config.locked = constant(true);
  mainModel.properties.facturatiemethode.config.locked = constant(true);
  mainModel.properties.begindatum.config.locked = constant(true);
  mainModel.properties.einddatum.config.locked = constant(true);
  mainModel.properties.cyclus.config.locked = constant(true);
  mainModel.properties.begindatumCyclus.config.locked = constant(true);
  mainModel.properties.einddatumCyclus.config.locked = constant(true);
  mainModel.properties.aantalDagenAchteraf.config.locked = constant(true);

  return {
    id: 'rpt00692-abonnement-kpi',
    type: 'detail',
    title: constant('Abonnement — AB-1001 Facilicom BV'),
    blueprint: {
      sections: [
        // --- Tab Algemeen ---
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          isEditable: constant(false),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Abonnement',
              fields: [
                { labelText: constant('Abonnement'), property: mainModel.properties.abonnement },
                { labelText: constant('Debiteur'), property: mainModel.properties.debiteur },
                { labelText: constant('Artikelgroep'), property: mainModel.properties.artikelgroep },
                { labelText: constant('Facturatiemethode'), property: mainModel.properties.facturatiemethode },
                { labelText: constant('Begindatum'), property: mainModel.properties.begindatum },
                { labelText: constant('Einddatum'), property: mainModel.properties.einddatum },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Cyclus',
              fields: [
                { labelText: constant('Cyclus'), property: mainModel.properties.cyclus },
                { labelText: constant('Begindatum cyclus'), property: mainModel.properties.begindatumCyclus },
                { labelText: constant('Einddatum cyclus'), property: mainModel.properties.einddatumCyclus },
                { labelText: constant('Aantal dagen achteraf'), property: mainModel.properties.aantalDagenAchteraf },
              ]
            },
            {
              type: 'dataVisualizations',
              visualizations: [
                // K004 — Dagen tot facturering (Value)
                {
                  type: 'valueVisualization',
                  key: 'dagen-tot-facturering',
                  title: 'Dagen tot facturering',
                  primary: {
                    key: 'dagenTotFacturering',
                    dataType: dataType.number(),
                    suffix: 'dagen'
                  },
                  data: rest.getQuery({ url: '/api/rpt00692-abonnement-kpi-values' })
                }
              ]
            } as any
          ]
        },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-kpi',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          })
        }
      }
    }
  };
}
