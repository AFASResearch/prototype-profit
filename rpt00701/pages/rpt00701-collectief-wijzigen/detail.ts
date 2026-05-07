import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { WizardPage } from '@afas/blueprint/interfaces/page';

export default function (services: BlueprintFactories): WizardPage {
  let {
    data: { dataType, createModel, createProperty, constant, createExpression },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
      // Bestaande velden
      Percentage: createProperty(dataType.percentage()),
      VastBedrag: createProperty(dataType.currencyAmount()),
      OverNemenVanArtikel: createProperty(dataType.yesNo()),
      Peildatum: createProperty(dataType.date()),
      OokOverNemenAlsLeeg: createProperty(dataType.yesNo()),
      // Nieuwe velden (RPT00701)
      MetBegindatum: createProperty(dataType.yesNo()),
      Begindatum: createProperty(dataType.date()),
      // Bestaand veld
      Afronding: createProperty(dataType.enumeration({
        options: [
          { key: 'geen', name: 'Geen' },
          { key: '5cent', name: '5 cent' },
          { key: '10cent', name: '10 cent' },
          { key: '50cent', name: '50 cent' },
          { key: 'euro', name: 'hele euro' },
          { key: '5euro', name: 'Vijf euro' },
        ]
      })),
    }
  });

  // Percentage gevuld → Vast bedrag en Overnemen van artikel locked
  mainModel.properties.VastBedrag.config.locked = createExpression(
    [mainModel.properties.Percentage], (p) => !!p
  );
  mainModel.properties.OverNemenVanArtikel.config.locked = createExpression(
    [mainModel.properties.Percentage, mainModel.properties.VastBedrag],
    (p, v) => !!p || !!v
  );
  // Vast bedrag gevuld → Percentage locked
  mainModel.properties.Percentage.config.locked = createExpression(
    [mainModel.properties.VastBedrag], (v) => !!v
  );

  // Nieuw: Begindatum is actief en verplicht als Met begindatum = Ja
  mainModel.properties.Begindatum.config.active = mainModel.properties.MetBegindatum;
  mainModel.properties.Begindatum.config.makeMandatory();

  return {
    id: 'rpt00701-collectief-wijzigen',
    type: 'wizard',
    title: constant('Wijzigingen prijzen abonnementsregels'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize() {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00701-collectief-wijzigen' });
      let dateProps = new Set(['Peildatum', 'Begindatum']);
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          let v = dateProps.has(key) && typeof value === 'string' ? new Date(value) : value;
          prop.setUserValue(v, true);
        }
      }
    },
    steps: [
      {
        title: 'Wijzigingen prijzen abonnementsregels',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Algemeen',
            fields: [
              { labelText: constant('Percentage'), property: mainModel.properties.Percentage },
              { labelText: constant('Vast bedrag'), property: mainModel.properties.VastBedrag },
              { labelText: constant('Overnemen van artikel'), property: mainModel.properties.OverNemenVanArtikel },
              { labelText: constant('Peildatum'), property: mainModel.properties.Peildatum },
              { labelText: constant('Ook overnemen als afwijkende prijs leeg is'), property: mainModel.properties.OokOverNemenAlsLeeg },
              { labelText: constant('Met begindatum'), property: mainModel.properties.MetBegindatum, getMicroCopyText() { return 'Maak een Abonnementstarief aan met een begindatum in plaats van de afwijkende prijs direct te wijzigen'; } },
              { labelText: constant('Begindatum'), property: mainModel.properties.Begindatum, getMicroCopyText() { return 'Datum waarop de nieuwe prijs ingaat'; } }
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Afronding',
            fields: [
              { labelText: constant('Afronding'), property: mainModel.properties.Afronding }
            ]
          }
        ]
      }
    ]
  };
}
