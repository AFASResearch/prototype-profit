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
      Inhoudingsplicht: createProperty(dataType.text()),
      BedragFOD: createProperty(dataType.currencyAmount()),
      BedragRSZ: createProperty(dataType.currencyAmount()),
      KenmerkBetalingRSZ: createProperty(dataType.text()),
    }
  });

  mainModel.properties.Inhoudingsplicht.config.locked = constant(true);
  mainModel.properties.BedragFOD.config.locked = constant(true);
  mainModel.properties.BedragRSZ.config.locked = constant(true);
  mainModel.properties.KenmerkBetalingRSZ.config.locked = constant(true);

  return {
    id: 'rfi00731-inkoopfactuur',
    type: 'detail',
    title: constant('Factuur AF0126-00809 — Totaal: 9.368,94 | Saldo: 9.368,94 | Vervaldatum: 08-03-2026'),
    blueprint: {
      sections: [
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'mutaties',
          sectionName: 'Mutaties',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'opmerking',
          sectionName: 'Opmerking.',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'betalingen',
          sectionName: 'Betalingen',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'dossier',
          sectionName: 'Dossier',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'valuta',
          sectionName: 'Valuta',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'betaaltermijnen',
          sectionName: 'Betaaltermijnen',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'inhoudingsplicht',
          sectionName: 'Inhoudingsplicht',
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                { labelText: constant('Inhoudingsplicht'), property: mainModel.properties.Inhoudingsplicht },
                { labelText: constant('Bedrag FOD'), property: mainModel.properties.BedragFOD },
                { labelText: constant('Bedrag RSZ/RSVZ'), property: mainModel.properties.BedragRSZ },
                { labelText: constant('Kenmerk betaling RSZ/RSVZ'), property: mainModel.properties.KenmerkBetalingRSZ },
              ]
            }
          ]
        },
        {
          id: 'betalingsgegevens',
          sectionName: 'Betalingsgegevens',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        },
        {
          id: 'pb',
          sectionName: 'PB',
          elements: [
            {
              type: 'fieldGroup',
              fields: []
            }
          ]
        }
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, { url: '/api/rfi00731-inkoopfactuur', idProperties: [mainModel.properties.Id], idValues: ['1'] })
        }
      }
    }
  };
}
