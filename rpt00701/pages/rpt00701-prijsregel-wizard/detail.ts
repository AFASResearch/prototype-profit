import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { WizardPage } from '@afas/blueprint/interfaces/page';

export default function (services: BlueprintFactories): WizardPage {
  let {
    data: { dataType, createModel, createProperty, constant },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
      Prijsregel: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: '01-01-2026 (€ 132,50)' },
          { key: '2', name: '01-07-2026 (€ 135,00)' },
        ]
      })),
      NieuwePrijs: createProperty(dataType.currencyAmount()),
    }
  });

  mainModel.properties.Prijsregel.config.makeMandatory();
  mainModel.properties.NieuwePrijs.config.locked = constant(true);

  return {
    id: 'rpt00701-prijsregel-wizard',
    type: 'wizard',
    title: constant('Prijsregel kiezen'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize(context) {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00701-prijsregel-wizard' });
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          prop.setUserValue(value, true);
        }
      }
    },
    steps: [
      {
        title: 'Prijsregel kiezen',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Prijsregel kiezen',
            fields: [
              {
                labelText: constant('Prijsregel'),
                property: mainModel.properties.Prijsregel,
                getMicroCopyText() { return 'Kies de prijsregel waarop de nieuwe prijs wordt toegepast'; }
              },
              {
                labelText: constant('Nieuwe prijs'),
                property: mainModel.properties.NieuwePrijs,
                getMicroCopyText() { return 'De prijs die je hebt ingevoerd op de abonnementsregel'; }
              }
            ]
          }
        ]
      }
    ]
  };
}
