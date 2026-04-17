import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { DetailPage } from '@afas/blueprint/interfaces/detail-page';

export default function (services: BlueprintFactories): DetailPage {
  let {
    data: { dataType, createModel, createProperty, constant },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      // Dummy ID voor mockup
      Id: createProperty(dataType.text()),

      // FOD Financiën
      StatusFOD: createProperty(dataType.text()),
      LaatsteControleFOD: createProperty(dataType.text()),
      GeldigTmFOD: createProperty(dataType.text()),
      PercInhoudingFiscaal: createProperty(dataType.percentage()),

      // RSZ/RSVZ
      StatusRSZ: createProperty(dataType.text()),
      LaatsteControleRSZ: createProperty(dataType.text()),
      GeldigTmRSZ: createProperty(dataType.text()),
      PercInhoudingSociaal: createProperty(dataType.percentage()),
      RaadplegingsnummerRSZ: createProperty(dataType.text()),

      // Foutdetail
      Foutdetail: createProperty(dataType.text()),
    }
  });

  // Alle velden readonly (informatie uit webservice)
  mainModel.properties.StatusFOD.config.locked = constant(true);
  mainModel.properties.LaatsteControleFOD.config.locked = constant(true);
  mainModel.properties.GeldigTmFOD.config.locked = constant(true);
  mainModel.properties.PercInhoudingFiscaal.config.locked = constant(true);
  mainModel.properties.StatusRSZ.config.locked = constant(true);
  mainModel.properties.LaatsteControleRSZ.config.locked = constant(true);
  mainModel.properties.GeldigTmRSZ.config.locked = constant(true);
  mainModel.properties.PercInhoudingSociaal.config.locked = constant(true);
  mainModel.properties.RaadplegingsnummerRSZ.config.locked = constant(true);
  mainModel.properties.Foutdetail.config.locked = constant(true);

  return {
    id: 'rfi00731-crediteur-pw',
    type: 'detail',
    title: constant('Crediteur — Inhoudingsplicht'),
    blueprint: {
      sections: [
        {
          id: 'inhoudingsplicht',
          sectionName: 'Inhoudingsplicht',
          elements: [
            {
              type: 'fieldGroup',
              title: 'FOD Financiën',
              fields: [
                { labelText: constant('Status FOD'), property: mainModel.properties.StatusFOD },
                { labelText: constant('Laatste controle FOD'), property: mainModel.properties.LaatsteControleFOD },
                { labelText: constant('Geldig t/m FOD'), property: mainModel.properties.GeldigTmFOD },
                { labelText: constant('Perc. inhouding fiscaal'), property: mainModel.properties.PercInhoudingFiscaal },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'RSZ/RSVZ',
              fields: [
                { labelText: constant('Status RSZ/RSVZ'), property: mainModel.properties.StatusRSZ },
                { labelText: constant('Laatste controle RSZ'), property: mainModel.properties.LaatsteControleRSZ },
                { labelText: constant('Geldig t/m RSZ'), property: mainModel.properties.GeldigTmRSZ },
                { labelText: constant('Perc. inhouding sociaal'), property: mainModel.properties.PercInhoudingSociaal },
                { labelText: constant('Raadplegingsnummer RSZ'), property: mainModel.properties.RaadplegingsnummerRSZ },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Foutdetail',
              fields: [
                { labelText: constant('Foutdetail'), property: mainModel.properties.Foutdetail },
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
          initializer: rest.getQueryModelHook(mainModel, { url: '/api/rfi00731-crediteur-pw', idProperties: [mainModel.properties.Id], idValues: ['1'] })
        }
      }
    }
  };
}
