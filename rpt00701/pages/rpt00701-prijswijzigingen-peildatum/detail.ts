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
      PeildatumToepassen: createProperty(dataType.yesNo()),
      Peildatum: createProperty(dataType.date()),
    }
  });

  const peildatumToepassen = createExpression([mainModel.properties.PeildatumToepassen], value => !!value);
  mainModel.properties.Peildatum.config.active = peildatumToepassen;
  mainModel.properties.Peildatum.config.makeMandatory(peildatumToepassen);

  return {
    id: 'rpt00701-prijswijzigingen-peildatum',
    type: 'wizard',
    title: constant('Prijzen abonnementsregels'),
    completeAction: {
      label: 'OK',
      async execute(context: any) {
        context.navigate({ routePattern: 'rpt00701-prijswijzigingen', routeParameters: {} });
        return true;
      }
    },
    async initialize() {
      mainModel.properties.PeildatumToepassen.setUserValue(true, true);
      mainModel.properties.Peildatum.setUserValue(new Date(), true);
    },
    steps: [
      {
        title: 'Prijzen abonnementsregels',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Peildatum',
            fields: [
              {
                labelText: constant('Peildatum toepassen'),
                property: mainModel.properties.PeildatumToepassen
              },
              {
                labelText: constant('Peildatum'),
                property: mainModel.properties.Peildatum,
                getMicroCopyText() { return 'De weergave toont alleen regels die geldig zijn op deze datum'; }
              }
            ]
          }
        ]
      }
    ]
  };
}
