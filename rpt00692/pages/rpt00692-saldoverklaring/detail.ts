import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { WizardPage } from '@afas/blueprint/interfaces/page';

export default function (services: BlueprintFactories): WizardPage {
  let {
    data: { dataType, createModel, createProperty, constant, createBig },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
      Administratie: createProperty(dataType.text()),
      Boekjaar: createProperty(dataType.number({ digitGrouping: false })),
      Periode: createProperty(dataType.enumeration({
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
      Grootboeksaldo: createProperty(dataType.currencyAmount()),
      TotaalGefactureerd: createProperty(dataType.currencyAmount()),
      TotaalToegerekend: createProperty(dataType.currencyAmount()),
      TotaalTeruggedraaid: createProperty(dataType.currencyAmount()),
      TotaalHandmatig: createProperty(dataType.currencyAmount()),
      Verschil: createProperty(dataType.currencyAmount()),
    }
  });

  mainModel.properties.Administratie.config.makeMandatory();
  mainModel.properties.Boekjaar.config.makeMandatory();
  mainModel.properties.Periode.config.makeMandatory();
  mainModel.properties.Grootboeksaldo.config.locked = constant(true);
  mainModel.properties.TotaalGefactureerd.config.locked = constant(true);
  mainModel.properties.TotaalToegerekend.config.locked = constant(true);
  mainModel.properties.TotaalTeruggedraaid.config.locked = constant(true);
  mainModel.properties.TotaalHandmatig.config.locked = constant(true);
  mainModel.properties.Verschil.config.locked = constant(true);

  return {
    id: 'rpt00692-saldoverklaring',
    type: 'wizard',
    title: constant('Saldoverklaring Te factureren abonnementen omzet'),
    completeAction: {
      label: 'Sluiten',
      async execute() { return true; }
    },
    async initialize(context) {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00692-saldoverklaring/init' });
      let currencyProps = new Set(['Grootboeksaldo', 'TotaalGefactureerd', 'TotaalToegerekend', 'TotaalTeruggedraaid', 'TotaalHandmatig', 'Verschil']);
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          let v = currencyProps.has(key) && typeof value === 'number' ? createBig(value) : value;
          prop.setUserValue(v, true);
        }
      }
    },
    steps: [
      // Stap 1 – Periode kiezen
      {
        title: 'Periode',
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
              { labelText: constant('Periode'), property: mainModel.properties.Periode },
            ]
          }
        ]
      },
      // Stap 2 – Saldoverklaring
      {
        title: 'Saldoverklaring',
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
              { labelText: constant('Periode'), property: mainModel.properties.Periode },
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Telling',
            fields: [
              { labelText: constant('Grootboeksaldo'), property: mainModel.properties.Grootboeksaldo },
              { labelText: constant('Totaal gefactureerd'), property: mainModel.properties.TotaalGefactureerd },
              { labelText: constant('Totaal toegerekend'), property: mainModel.properties.TotaalToegerekend },
              { labelText: constant('Totaal teruggedraaid'), property: mainModel.properties.TotaalTeruggedraaid },
              { labelText: constant('Totaal handmatig geboekt'), property: mainModel.properties.TotaalHandmatig },
              { labelText: constant('Verschil'), property: mainModel.properties.Verschil },
            ]
          },
          {
            id: 'saldoverklaring',
            type: 'list',
            title: constant('Saldoverklaring per abonnementsregel'),
            languageInfo: { itemNamePlural: 'regels' },
            columns: [
              { key: 'administratie', header: 'Administratie', dataType: dataType.text(), sortable: true },
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
          }
        ]
      }
    ]
  };
}
