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
      Boekjaar: createProperty(dataType.number({ digitGrouping: false })),
      Periode: createProperty(dataType.text()),
    }
  });

  mainModel.properties.Boekjaar.config.locked = constant(true);
  mainModel.properties.Periode.config.locked = constant(true);

  return {
    id: 'rpt00692-genereer-wizard',
    type: 'wizard',
    title: constant('Genereer periodetoekenningsregels'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize(context) {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00692-genereer-wizard' });
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          prop.setUserValue(value, true);
        }
      }
    },
    steps: [
      {
        title: 'Toekenbare regels',
        content: [
          {
            type: 'fieldGroup',
            title: 'Periode',
            fields: [
              { labelText: constant('Boekjaar'), property: mainModel.properties.Boekjaar },
              { labelText: constant('Periode'), property: mainModel.properties.Periode },
            ]
          },
          ({
            id: 'preview',
            type: 'multiSelectList',
            title: constant('Toekenbare abonnementsregels'),
            selectAllOnByDefault: true,
            languageInfo: { itemNamePlural: 'regels' },
            columns: [
              { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
              { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
              { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'factuurmoment', header: 'Factuurmoment', dataType: dataType.text(), sortable: true },
              { key: 'geparkeerd', header: 'Geparkeerd', dataType: dataType.yesNo(), sortable: true },
            ],
            actions: [
              {
                id: 'genereer',
                name: 'Genereer',
                isMultiselect: true,
                async execute() { return true; }
              }
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-genereer-wizard/preview',
              idFieldKeys: ['abonnementsregel']
            })
          } as any)
        ]
      }
    ]
  };
}
