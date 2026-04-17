import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { WizardPage } from '@afas/blueprint/interfaces/page';

export default function (services: BlueprintFactories): WizardPage {
  let {
    data: { dataType, createModel, createProperty, constant },
    rest
  } = services;

  // Model stap 1: wizardparameters
  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
      // Bestaande velden
      Administratie: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: 'Hoofdadministratie' },
          { key: '2', name: 'Nevenadministratie' },
          { key: '3', name: 'Holding BV' },
        ]
      })),
      Peildatum: createProperty(dataType.date()),
      Factuurdatum: createProperty(dataType.date()),
      // Nieuwe velden (RPT00701)
      IndexcorrectiesMeenemen: createProperty(dataType.yesNo()),
      StartdatumIndexering: createProperty(dataType.date()),
      // Bestaande velden (opties)
      MeenemenTeCrediterenRegels: createProperty(dataType.yesNo()),
      AutomatischVerstrekken: createProperty(dataType.yesNo()),
    }
  });

  // Configuratie
  mainModel.properties.Administratie.config.makeMandatory();
  mainModel.properties.Peildatum.config.makeMandatory();
  mainModel.properties.Factuurdatum.config.makeMandatory();

  // Startdatum indexering: actief en verplicht als Indexcorrecties meenemen = Ja
  mainModel.properties.StartdatumIndexering.config.active = mainModel.properties.IndexcorrectiesMeenemen;
  mainModel.properties.StartdatumIndexering.config.makeMandatory();

  return {
    id: 'rpt00701-wizard',
    type: 'wizard',
    title: constant('Abonnementen factureren'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize(context) {
      // Laad mock-data in het model
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00701-wizard' });
      let dateProps = new Set(['Peildatum', 'Factuurdatum', 'StartdatumIndexering']);
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key];
        if (prop) {
          // Date-properties verwachten een Date-object, geen string
          let v = dateProps.has(key) && typeof value === 'string' ? new Date(value) : value;
          prop.setUserValue(v, true);
        }
      }
    },
    steps: [
      // Stap 1 – Instellingen
      {
        title: 'Instellingen',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Facturering',
            fields: [
              { labelText: constant('Administratie'), property: mainModel.properties.Administratie },
              { labelText: constant('Peildatum'), property: mainModel.properties.Peildatum },
              { labelText: constant('Factuurdatum'), property: mainModel.properties.Factuurdatum },
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Indexcorrecties',
            fields: [
              { labelText: constant('Indexcorrecties meenemen'), property: mainModel.properties.IndexcorrectiesMeenemen }, // nieuw
              { labelText: constant('Startdatum indexering'), property: mainModel.properties.StartdatumIndexering }, // nieuw
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Opties',
            fields: [
              { labelText: constant('Meenemen te crediteren regels'), property: mainModel.properties.MeenemenTeCrediterenRegels }, // bestaand
              { labelText: constant('Automatisch verstrekken'), property: mainModel.properties.AutomatischVerstrekken }, // bestaand
            ]
          }
        ]
      },
      // Stap 2 – Abonnementenselectie
      {
        title: 'Abonnementenselectie',
        content: [
          ({
            id: 'selectie',
            type: 'multiSelectList',
            title: constant('Abonnementen'),
            selectAllOnByDefault: true,
            languageInfo: { itemNamePlural: 'abonnementen' },
            columns: [
              { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
              { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
              { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'periodevn', header: 'Periode van', dataType: dataType.text(), sortable: true },
              { key: 'periodetm', header: 'Periode t/m', dataType: dataType.text(), sortable: true },
              { key: 'prijs', header: 'Prijs', dataType: dataType.currencyAmount() },
            ],
            actions: [
              {
                id: 'deselecteren',
                name: 'Deselecteren',
                isMultiselect: true,
                async execute() { return true; }
              }
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-wizard/selectie',
              idFieldKeys: ['abonr', 'abonregel']
            })
          } as any)
        ]
      },
      // Stap 3 – Overzichten: Te corrigeren factuurregels
      {
        title: 'Overzichten',
        content: [
          {
            id: 'te-corrigeren',
            type: 'list',
            title: constant('Te corrigeren factuurregels'),
            languageInfo: { itemNamePlural: 'factuurregels' },
            columns: [
              { key: 'bronfactuur', header: 'Bronfactuur', dataType: dataType.text(), sortable: true },
              { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
              { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
              { key: 'periodevn', header: 'Periode van', dataType: dataType.text(), sortable: true },
              { key: 'periodetm', header: 'Periode t/m', dataType: dataType.text(), sortable: true },
              { key: 'oudeprijs', header: 'Oude prijs', dataType: dataType.currencyAmount() },
              { key: 'oudbedrag', header: 'Oud bedrag', dataType: dataType.currencyAmount() },
              { key: 'nieuweprijs', header: 'Nieuwe prijs', dataType: dataType.currencyAmount() },
              { key: 'corrbedrag', header: 'Correctiebedrag', dataType: dataType.currencyAmount() },
              { key: 'status', header: 'Status', dataType: dataType.text(), sortable: true },
              { key: 'meenemen', header: 'Meenemen', dataType: dataType.yesNo() },
            ],
            actions: [],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-wizard/te-corrigeren',
              idFieldKeys: ['bronfactuur', 'abonregel', 'periodevn']
            })
          }
        ]
      }
    ]
  };
}
