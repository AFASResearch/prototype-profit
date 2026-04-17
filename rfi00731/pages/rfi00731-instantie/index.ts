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
      Crediteur: createProperty(dataType.text()),
      Afdeling: createProperty(dataType.text()),
      Bankrekening: createProperty(dataType.text()),
      Berichtsjabloon: createProperty(dataType.text()),
      Percentage: createProperty(dataType.percentage()),
    }
  });

  // Percentage is verborgen in Profit 8 (W07)
  mainModel.properties.Percentage.config.active = constant(false);

  mainModel.properties.Crediteur.config.locked = constant(true);
  mainModel.properties.Afdeling.config.locked = constant(true);
  mainModel.properties.Bankrekening.config.locked = constant(true);
  mainModel.properties.Berichtsjabloon.config.locked = constant(true);

  return {
    id: 'rfi00731-instantie',
    type: 'detail',
    title: constant('Instantie inhoudingsplicht (Profit 8)'),
    blueprint: {
      sections: [
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          elements: [
            {
              type: 'text',
              text: constant('Profit 8: Percentage is verborgen (W07). Percentage wordt nu per crediteur vastgelegd.')
            },
            {
              type: 'fieldGroup',
              title: 'Instantie inhoudingsplicht',
              fields: [
                { labelText: constant('Crediteur'), property: mainModel.properties.Crediteur },
                { labelText: constant('Afdeling'), property: mainModel.properties.Afdeling },
                { labelText: constant('Bankrekening'), property: mainModel.properties.Bankrekening },
                { labelText: constant('Berichtsjabloon'), property: mainModel.properties.Berichtsjabloon },
                { labelText: constant('Percentage'), property: mainModel.properties.Percentage },
              ]
            }
          ]
        }
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, { url: '/api/rfi00731-instantie', idProperties: [mainModel.properties.Id], idValues: ['1'] })
        }
      }
    }
  };
}
