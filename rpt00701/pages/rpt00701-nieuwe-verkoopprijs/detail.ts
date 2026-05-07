import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { WizardPage } from '@afas/blueprint/interfaces/page';

export default function (services: BlueprintFactories): WizardPage {
  let {
    data: { dataType, createModel, createProperty, constant, createExpression },
    rest
  } = services;

  // Stap 1 — apart model zodat alleen Type gevalideerd wordt op stap 1
  let step1Model = createModel({
    properties: {
      Type: createProperty(dataType.enumeration({
        options: [
          { key: 'basis', name: 'Basisprijs' },
          { key: 'debiteur', name: 'Debiteur' },
          { key: 'prijslijst', name: 'Prijslijst' },
          { key: 'project', name: 'Project' },
        ]
      })),
    }
  });

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),

      // Stap 2 — Gemeenschappelijke velden
      TypeItem: createProperty(dataType.enumeration({
        options: [
          { key: 'Art', name: 'Artikel (Art)' },
          { key: 'Txt', name: 'Tekst (Txt)' },
          { key: 'Sub', name: 'Subtotaal (Sub)' },
        ]
      })),
      Itemcode: createProperty(dataType.text()),
      Eenheid: createProperty(dataType.text()),

      // Stap 2 — Project-specifiek
      Project: createProperty(dataType.text()),

      // Prijs/korting
      Valuta: createProperty(dataType.enumeration({
        options: [
          { key: 'EUR', name: 'Euro (EUR)' },
          { key: 'USD', name: 'US Dollar (USD)' },
          { key: 'GBP', name: 'Brits pond (GBP)' },
        ]
      })),
      HuidigeVerkoopprijs: createProperty(dataType.currencyAmount()),
      Verkoopprijs: createProperty(dataType.currencyAmount()),
      Begindatum: createProperty(dataType.date()),
      Einddatum: createProperty(dataType.date()),
    }
  });

  // Stap 1 verplicht
  step1Model.properties.Type.config.makeMandatory();

  // Stap 2 — Project: verplicht als type = project
  mainModel.properties.Project.config.active = createExpression(
    [step1Model.properties.Type], (t) => t === 'project'
  );
  mainModel.properties.Project.config.makeMandatory();

  // Stap 2 — Gemeenschappelijk
  mainModel.properties.TypeItem.config.makeMandatory();
  mainModel.properties.TypeItem.config.locked = constant(true);
  mainModel.properties.Itemcode.config.makeMandatory();
  mainModel.properties.Itemcode.config.locked = constant(true);
  mainModel.properties.Eenheid.config.locked = constant(true);

  // Prijs
  mainModel.properties.Valuta.config.makeMandatory();
  mainModel.properties.Valuta.config.locked = constant(true);
  mainModel.properties.HuidigeVerkoopprijs.config.locked = constant(true);
  mainModel.properties.Verkoopprijs.config.makeMandatory();
  mainModel.properties.Begindatum.config.makeMandatory();

  return {
    id: 'rpt00701-nieuwe-verkoopprijs',
    type: 'wizard',
    title: constant('Nieuwe verkoopprijs'),
    completeAction: {
      label: 'Voltooien',
      async execute() { return true; }
    },
    async initialize() {
      let response = await rest.executeGetQuery<Record<string, unknown>>({ url: '/api/rpt00701-nieuwe-verkoopprijs' });
      let dateProps = new Set(['Begindatum', 'Einddatum']);
      for (let [key, value] of Object.entries(response)) {
        let prop = (mainModel.properties as Record<string, any>)[key] ?? (step1Model.properties as Record<string, any>)[key];
        if (prop) {
          let v = dateProps.has(key) && typeof value === 'string' ? new Date(value) : value;
          prop.setUserValue(v, true);
        }
      }
    },
    steps: [
      // === Stap 1: Type ===
      {
        title: 'Nieuwe verkoopprijs',
        model: step1Model,
        content: [
          {
            type: 'fieldGroup',
            fields: [
              { labelText: constant('Type'), property: step1Model.properties.Type },
            ]
          },
        ]
      },
      // === Stap 2: Algemeen + Prijs/korting ===
      {
        title: 'Algemeen',
        model: mainModel,
        content: [
          {
            type: 'fieldGroup',
            title: 'Algemeen',
            fields: [
              { labelText: constant('Project'), property: mainModel.properties.Project },
              { labelText: constant('Type item'), property: mainModel.properties.TypeItem },
              { labelText: constant('Itemcode'), property: mainModel.properties.Itemcode },
              { labelText: constant('Eenheid'), property: mainModel.properties.Eenheid },
            ]
          },
          {
            type: 'fieldGroup',
            title: 'Prijs/korting',
            fields: [
              { labelText: constant('Valuta'), property: mainModel.properties.Valuta },
              { labelText: constant('Huidige verkoopprijs'), property: mainModel.properties.HuidigeVerkoopprijs },
              { labelText: constant('Verkoopprijs'), property: mainModel.properties.Verkoopprijs },
              { labelText: constant('Begindatum'), property: mainModel.properties.Begindatum },
              { labelText: constant('Einddatum'), property: mainModel.properties.Einddatum },
            ]
          }
        ]
      },
    ]
  };
}
