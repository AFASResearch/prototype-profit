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
      // Bestaande velden factuurwizard stap 1
      Debiteur: createProperty(dataType.text()),
      Factuurdatum: createProperty(dataType.text()),
      Peildatum: createProperty(dataType.text()),
      Boekingsperiode: createProperty(dataType.text()),
      // Nieuwe velden (RPT00701)
      IndexcorrectiesMeenemen: createProperty(dataType.yesNo()),
      StartdatumIndexering: createProperty(dataType.text()),
    }
  });

  // Bestaande velden: verplicht
  mainModel.properties.Debiteur.config.makeMandatory();
  mainModel.properties.Factuurdatum.config.makeMandatory();
  mainModel.properties.Peildatum.config.makeMandatory();

  // Startdatum indexering is actief en verplicht als Indexcorrecties meenemen = Ja
  mainModel.properties.StartdatumIndexering.config.active = mainModel.properties.IndexcorrectiesMeenemen;
  mainModel.properties.StartdatumIndexering.config.makeMandatory();

  return {
    id: 'rpt00701-wizard-stap1',
    type: 'detail',
    title: constant('Abonnementen factureren – Stap 1'),
    blueprint: {
      sections: [
        {
          id: 'parameters',
          sectionName: 'Parameters',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Facturering',
              fields: [
                {
                  labelText: constant('Debiteur'),
                  property: mainModel.properties.Debiteur
                },
                {
                  labelText: constant('Factuurdatum'),
                  property: mainModel.properties.Factuurdatum
                },
                {
                  labelText: constant('Peildatum'),
                  property: mainModel.properties.Peildatum
                },
                {
                  labelText: constant('Boekingsperiode'),
                  property: mainModel.properties.Boekingsperiode
                }
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Indexcorrecties',
              fields: [
                {
                  labelText: constant('Indexcorrecties meenemen'), // nieuw
                  property: mainModel.properties.IndexcorrectiesMeenemen
                },
                {
                  labelText: constant('Startdatum indexering'), // nieuw
                  property: mainModel.properties.StartdatumIndexering
                }
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
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00701-wizard-stap1',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00701-wizard-stap1',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
