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
      // FOD
      StatusFOD: createProperty(dataType.text()),
      LaatsteControleFOD: createProperty(dataType.text()),
      GeldigTmFOD: createProperty(dataType.text()),
      // RSZ
      StatusRSZ: createProperty(dataType.text()),
      LaatsteControleRSZ: createProperty(dataType.text()),
      GeldigTmRSZ: createProperty(dataType.text()),
    }
  });

  mainModel.properties.StatusFOD.config.locked = constant(true);
  mainModel.properties.LaatsteControleFOD.config.locked = constant(true);
  mainModel.properties.GeldigTmFOD.config.locked = constant(true);
  mainModel.properties.StatusRSZ.config.locked = constant(true);
  mainModel.properties.LaatsteControleRSZ.config.locked = constant(true);
  mainModel.properties.GeldigTmRSZ.config.locked = constant(true);

  return {
    id: 'rfi00731-w15-profit7',
    type: 'detail',
    title: constant('Crediteur — InSite (Profit 7)'),
    blueprint: {
      sections: [
        {
          id: 'fod',
          sectionName: 'FOD Financiën',
          elements: [
            {
              type: 'fieldGroup',
              title: 'FOD Financiën',
              fields: [
                { labelText: constant('Status'), property: mainModel.properties.StatusFOD },
                { labelText: constant('Laatste controle'), property: mainModel.properties.LaatsteControleFOD },
                { labelText: constant('Geldig t/m'), property: mainModel.properties.GeldigTmFOD },
              ]
            },
            {
              type: 'text',
              text: constant('Knop: [Nieuw] — misleidende naam, start een consultatie')
            }
          ]
        },
        {
          id: 'rsz',
          sectionName: 'Rijksdienst voor Sociale Zekerheid (RSZ)',
          elements: [
            {
              type: 'fieldGroup',
              title: 'Rijksdienst voor Sociale Zekerheid (RSZ)',
              fields: [
                { labelText: constant('Status'), property: mainModel.properties.StatusRSZ },
                { labelText: constant('Laatste controle'), property: mainModel.properties.LaatsteControleRSZ },
                { labelText: constant('Geldig t/m'), property: mainModel.properties.GeldigTmRSZ },
              ]
            },
            {
              type: 'text',
              text: constant('Knop: [Nieuw] — misleidende naam, start een consultatie')
            }
          ]
        }
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, { url: '/api/rfi00731-w15-profit7', idProperties: [mainModel.properties.Id], idValues: ['1'] })
        }
      }
    }
  };
}
