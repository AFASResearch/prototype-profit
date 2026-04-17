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
      Administratie: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: '1 — Hoofdadministratie' },
          { key: '2', name: '2 — Nevenadministratie' },
          { key: '3', name: '3 — Holding BV' },
        ]
      })),
      Boekjaar: createProperty(dataType.number({ digitGrouping: false })),
      PeriodeVan: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: 'Januari (1)' },
          { key: '2', name: 'Februari (2)' },
          { key: '3', name: 'Maart (3)' },
          { key: '4', name: 'April (4)' },
          { key: '5', name: 'Mei (5)' },
          { key: '6', name: 'Juni (6)' },
          { key: '7', name: 'Juli (7)' },
          { key: '8', name: 'Augustus (8)' },
          { key: '9', name: 'September (9)' },
          { key: '10', name: 'Oktober (10)' },
          { key: '11', name: 'November (11)' },
          { key: '12', name: 'December (12)' },
        ]
      })),
      PeriodeTot: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: 'Januari (1)' },
          { key: '2', name: 'Februari (2)' },
          { key: '3', name: 'Maart (3)' },
          { key: '4', name: 'April (4)' },
          { key: '5', name: 'Mei (5)' },
          { key: '6', name: 'Juni (6)' },
          { key: '7', name: 'Juli (7)' },
          { key: '8', name: 'Augustus (8)' },
          { key: '9', name: 'September (9)' },
          { key: '10', name: 'Oktober (10)' },
          { key: '11', name: 'November (11)' },
          { key: '12', name: 'December (12)' },
        ]
      })),
    }
  });

  mainModel.properties.Administratie.config.makeMandatory();
  mainModel.properties.Boekjaar.config.makeMandatory();
  mainModel.properties.PeriodeVan.config.makeMandatory();
  mainModel.properties.PeriodeTot.config.makeMandatory();

  return {
    id: 'rpt00692-saldoverklaring',
    type: 'wizard',
    title: constant('Saldoverklaring Te factureren abonnementen omzet'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize(context) {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00692-saldoverklaring-wizard' });
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          prop.setUserValue(value, true);
        }
      }
    },
    steps: [
      {
        title: 'Selectie',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Administratie',
            fields: [
              { labelText: constant('Administratie'), property: mainModel.properties.Administratie },
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Periode',
            fields: [
              { labelText: constant('Boekjaar'), property: mainModel.properties.Boekjaar },
              { labelText: constant('Periode van'), property: mainModel.properties.PeriodeVan },
              { labelText: constant('Periode tot'), property: mainModel.properties.PeriodeTot },
            ]
          }
        ]
      },
      {
        title: 'Saldoverklaring',
        content: [
          ({
            id: 'saldoverklaring',
            type: 'list',
            title: constant('Saldoverklaring per abonnementsregel'),
            languageInfo: { itemNamePlural: 'regels' },
            columns: [
              { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
              { key: 'datumVan', header: 'Datum van', dataType: dataType.date(), sortable: true },
              { key: 'datumTot', header: 'Datum tot', dataType: dataType.date(), sortable: true },
              { key: 'gefactureerd', header: 'Gefactureerd', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'toegerekend', header: 'Toegerekend', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'teruggedraaid', header: 'Teruggedraaid', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'openstaand', header: 'Openstaand saldo', dataType: dataType.currencyAmount(), sortable: true },
            ],
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00692-saldoverklaring',
              idFieldKeys: ['abonnementsregel']
            })
          } as any)
        ]
      }
    ]
  };
}
