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
      Percentage: createProperty(dataType.number()),
      VastBedrag: createProperty(dataType.currencyAmount()),
      OverNemenVanArtikel: createProperty(dataType.yesNo()),
      Peildatum: createProperty(dataType.text()),
      OokOverNemenAlsLeeg: createProperty(dataType.yesNo()),
      MetBegindatum: createProperty(dataType.yesNo()),
      Begindatum: createProperty(dataType.text()),
      Afronding: createProperty(dataType.text()),
    }
  });

  // Nieuw: Begindatum is actief en verplicht als MetBegindatum = Ja
  mainModel.properties.Begindatum.config.active = mainModel.properties.MetBegindatum;
  mainModel.properties.Begindatum.config.makeMandatory();

  return {
    id: 'rpt00701-collectief-wijzigen',
    type: 'detail',
    title: constant('Wijzigen afwijkende prijzen abonnementsregels'),
    blueprint: {
      sections: [
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                {
                  labelText: constant('Percentage'),
                  property: mainModel.properties.Percentage
                },
                {
                  labelText: constant('Vast bedrag'),
                  property: mainModel.properties.VastBedrag
                },
                {
                  labelText: constant('Overnemen van artikel'),
                  property: mainModel.properties.OverNemenVanArtikel
                },
                {
                  labelText: constant('Peildatum'),
                  property: mainModel.properties.Peildatum
                },
                {
                  labelText: constant('Ook overnemen als afwijkende prijs leeg is'),
                  property: mainModel.properties.OokOverNemenAlsLeeg
                },
                {
                  labelText: constant('Met begindatum'), // nieuw
                  property: mainModel.properties.MetBegindatum
                },
                {
                  labelText: constant('Begindatum'), // nieuw
                  property: mainModel.properties.Begindatum
                }
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Afronding',
              fields: [
                {
                  labelText: constant('Afronding'),
                  property: mainModel.properties.Afronding
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
            url: '/api/rpt00701-collectief-wijzigen',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00701-collectief-wijzigen',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
