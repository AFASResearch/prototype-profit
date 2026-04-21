import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { DetailPage } from '@afas/blueprint/interfaces/detail-page';

export default function (services: BlueprintFactories): DetailPage {
  let {
    data: { dataType, createModel, createProperty, constant, createExpression },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),

      // --- Algemeen ---
      Omschrijving: createProperty(dataType.text()),
      Opslagpercentage: createProperty(dataType.text()),
      Factuursjabloon: createProperty(dataType.text()),
      Confrontatie: createProperty(dataType.text()),

      // --- Integratie ---
      RekKostprijs: createProperty(dataType.text()),
      RekDekkingKp: createProperty(dataType.text()),
      RekInkoop: createProperty(dataType.text()),
      RekVerkoop: createProperty(dataType.text()),
      RekConfrontatie: createProperty(dataType.text()),
      RekDekkingKpInkopen: createProperty(dataType.text()), // nieuw

      // --- Integratie BTW-plicht ---
      BtwVerlegdBinnRekInkoop: createProperty(dataType.text()),
      BtwVerlegdBinnRekDekkingKp: createProperty(dataType.text()),
      BtwVerlegdEuRekInkoop: createProperty(dataType.text()),
      BtwVerlegdEuRekDekkingKp: createProperty(dataType.text()),
      BtwBuitenEuRekInkoop: createProperty(dataType.text()),
      BtwBuitenEuRekDekkingKp: createProperty(dataType.text()),
      BtwPlichtigEuRekInkoop: createProperty(dataType.text()),
      BtwPlichtigEuRekDekkingKp: createProperty(dataType.text()),
      BtwOverigRekInkoop: createProperty(dataType.text()),
      BtwOverigRekDekkingKp: createProperty(dataType.text()),

      // --- Integratie intercompany ---
      RekKostprijsIC: createProperty(dataType.text()),
      RekDekkingKpIC: createProperty(dataType.text()),
      RekVerkoopIC: createProperty(dataType.text()),
      RekDekkingKpInkopenIC: createProperty(dataType.text()), // nieuw

      // --- Instelling (voor conditionele zichtbaarheid) ---
      DekkingInhuurDerdenSplitsen: createProperty(dataType.yesNo()),
    }
  });

  // Nieuwe velden: conditioneel actief als DekkingInhuurDerdenSplitsen = Ja
  mainModel.properties.RekDekkingKpInkopen.config.active = createExpression(
    [mainModel.properties.DekkingInhuurDerdenSplitsen], (v) => v === true
  );
  mainModel.properties.RekDekkingKpInkopenIC.config.active = createExpression(
    [mainModel.properties.DekkingInhuurDerdenSplitsen], (v) => v === true
  );

  return {
    id: 'poa442793-integratiegroep',
    type: 'detail',
    title: constant('Integratiegroep'),
    blueprint: {
      sections: [
        // --- Tabblad: Algemeen ---
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                { labelText: constant('Omschrijving'), property: mainModel.properties.Omschrijving },
                { labelText: constant('Opslagpercentage'), property: mainModel.properties.Opslagpercentage },
                { labelText: constant('Factuursjabloon'), property: mainModel.properties.Factuursjabloon },
                { labelText: constant('Confrontatie'), property: mainModel.properties.Confrontatie },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Integratie',
              fields: [
                { labelText: constant('Rek. kostprijs'), property: mainModel.properties.RekKostprijs },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.RekDekkingKp },
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.RekInkoop },
                { labelText: constant('Rek. verkoop'), property: mainModel.properties.RekVerkoop },
                { labelText: constant('Rek. confrontatie'), property: mainModel.properties.RekConfrontatie },
                {
                  labelText: constant('Rek. dekking kp inkopen'), // nieuw
                  property: mainModel.properties.RekDekkingKpInkopen,
                  getMicroCopyText() { return 'Rekening voor dekking kostprijs bij nacalculatieregels met "inkopen" (inhuur derden)'; }
                },
              ]
            }
          ]
        },
        // --- Tabblad: Integratie BTW-plicht ---
        {
          id: 'integratie-btw-plicht',
          sectionName: 'Integratie BTW-plicht',
          isEditable: constant(false),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Verlegd binnenland',
              fields: [
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.BtwVerlegdBinnRekInkoop },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.BtwVerlegdBinnRekDekkingKp },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Verlegd binnen EU',
              fields: [
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.BtwVerlegdEuRekInkoop },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.BtwVerlegdEuRekDekkingKp },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Buiten EU',
              fields: [
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.BtwBuitenEuRekInkoop },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.BtwBuitenEuRekDekkingKp },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'BTW plichtig binnen EU',
              fields: [
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.BtwPlichtigEuRekInkoop },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.BtwPlichtigEuRekDekkingKp },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Overig',
              fields: [
                { labelText: constant('Rek. inkoop'), property: mainModel.properties.BtwOverigRekInkoop },
                { labelText: constant('Rek. dekking kp'), property: mainModel.properties.BtwOverigRekDekkingKp },
              ]
            }
          ]
        },
        // --- Tabblad: Werksoort (bestaand, view) ---
        {
          id: 'werksoort',
          sectionName: 'Werksoort',
          elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }]
        },
        // --- Tabblad: Kosten (bestaand, view) ---
        {
          id: 'kosten',
          sectionName: 'Kosten',
          elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }]
        },
        // --- Tabblad: Integratie intercompany ---
        {
          id: 'integratie-intercompany',
          sectionName: 'Integratie intercompany',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Integratie intercompany',
              fields: [
                { labelText: constant('Rek. kostprijs IC'), property: mainModel.properties.RekKostprijsIC },
                { labelText: constant('Rek. dekking kp IC'), property: mainModel.properties.RekDekkingKpIC },
                { labelText: constant('Rek. verkoop IC'), property: mainModel.properties.RekVerkoopIC },
                {
                  labelText: constant('Rek. dekking kp inkopen IC'), // nieuw
                  property: mainModel.properties.RekDekkingKpInkopenIC,
                  getMicroCopyText() { return 'Rekening voor dekking kostprijs bij intercompany nacalculatieregels met "inkopen"'; }
                },
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
            url: '/api/poa442793-integratiegroep',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/poa442793-integratiegroep',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
