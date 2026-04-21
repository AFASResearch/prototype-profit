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

      // --- Onderhanden werk ---
      OhwIntegratieGebruiken: createProperty(dataType.yesNo()),
      OhwSplitsen: createProperty(dataType.yesNo()),
      DekkingOpbrengstSplitsen: createProperty(dataType.yesNo()),
      DekkingInhuurDerdenSplitsen: createProperty(dataType.yesNo()), // nieuw
      ResultaatSplitsen: createProperty(dataType.yesNo()),
      MethodeAfmelding: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: 'OHW afmelden per regel (1)' },
          { key: '2', name: 'OHW afmelden per project (2)' },
        ]
      })),
    }
  });

  return {
    id: 'poa442793-integratie-financieel',
    type: 'detail',
    title: constant('Integratie financieel'),
    blueprint: {
      sections: [
        {
          id: 'integratie',
          sectionName: 'Integratie',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Onderhanden werk',
              fields: [
                { labelText: constant('OHW-integratie gebruiken'), property: mainModel.properties.OhwIntegratieGebruiken },
                { labelText: constant('OHW splitsen'), property: mainModel.properties.OhwSplitsen },
                { labelText: constant('Dekking opbrengst splitsen'), property: mainModel.properties.DekkingOpbrengstSplitsen },
                { labelText: constant('Dekking inhuur derden splitsen'), property: mainModel.properties.DekkingInhuurDerdenSplitsen }, // nieuw
                { labelText: constant('Resultaat splitsen'), property: mainModel.properties.ResultaatSplitsen },
                { labelText: constant('Methode afmelding'), property: mainModel.properties.MethodeAfmelding },
              ]
            }
          ]
        },
        {
          id: 'grondslagen-1',
          sectionName: 'Grondslagen 1',
          elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }]
        },
        {
          id: 'grondslagen-2',
          sectionName: 'Grondslagen 2',
          elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }]
        }
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/poa442793-integratie-financieel',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/poa442793-integratie-financieel',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
