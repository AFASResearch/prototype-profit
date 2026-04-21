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
      // --- Tab Abonnementen: bestaande velden ---
      begindatumFactCyclus: createProperty(dataType.enumeration({
        options: [
          { key: '01', name: 'Volgens cyclus' },
          { key: '02', name: 'Volgens contract' },
        ]
      })),
      cyclus: createProperty(dataType.enumeration({
        options: [
          { key: 'M1', name: 'Maand' },
          { key: 'K1', name: 'Kwartaal' },
          { key: 'H1', name: 'Halfjaar' },
          { key: 'J1', name: 'Jaar' },
        ]
      })),
      voorstelDatumVerlenging: createProperty(dataType.enumeration({
        options: [
          { key: '01', name: 'Volgens cyclus' },
          { key: '02', name: 'Handmatig' },
        ]
      })),
      cyclusVerlenging: createProperty(dataType.enumeration({
        options: [
          { key: 'M1', name: 'Maand' },
          { key: 'K1', name: 'Kwartaal' },
          { key: 'H1', name: 'Halfjaar' },
          { key: 'J1', name: 'Jaar' },
        ]
      })),
      methodeVerdeling: createProperty(dataType.enumeration({
        options: [
          { key: 'G', name: 'Geen' },
          { key: 'P', name: 'Pro-rata' },
          { key: 'E', name: 'Evenredig' },
          { key: '4', name: '4-weken' },
        ]
      })),
      // --- Periodetoekenning (nieuw) ---
      periodetoekenningToepassen: createProperty(dataType.boolean()),
      teFacturerenOmzetRekening: createProperty(dataType.text()),
    }
  });

  const ptAan = createExpression([mainModel.properties.periodetoekenningToepassen], v => !!v);
  mainModel.properties.teFacturerenOmzetRekening.config.makeMandatory(ptAan);
  mainModel.properties.teFacturerenOmzetRekening.config.active = ptAan;

  return {
    id: 'rpt00692-facturering-voorraad',
    type: 'detail',
    title: constant('Facturering/voorraad'),
    blueprint: {
      sections: [
        // --- Algemeen ---
        { id: 'algemeen', sectionName: 'Algemeen', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Abonnementen ---
        {
          id: 'abonnementen',
          sectionName: 'Abonnementen',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Abonnementen',
              fields: [
                { labelText: constant('Begindatum fact cyclus'), property: mainModel.properties.begindatumFactCyclus },
                { labelText: constant('Cyclus'), property: mainModel.properties.cyclus },
                { labelText: constant('Voorstel datum verlenging'), property: mainModel.properties.voorstelDatumVerlenging },
                { labelText: constant('Cyclus'), property: mainModel.properties.cyclusVerlenging },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Transitorische boeking',
              fields: [
                { labelText: constant('Methode verdeling'), property: mainModel.properties.methodeVerdeling },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Periodetoekenning', // nieuw
              fields: [
                { labelText: constant('Periodetoekenning toepassen'), property: mainModel.properties.periodetoekenningToepassen, getMicroCopyText() { return 'Activeert periodetoekenning voor abonnementen. Zonder deze instelling is de functionaliteit niet beschikbaar.'; } } as any,
                { labelText: constant('Te factureren abonnementen omzet'), property: mainModel.properties.teFacturerenOmzetRekening, getMicroCopyText() { return 'Grootboekrekening waarop omzet tijdelijk staat totdat toekenning plaatsvindt.'; } } as any,
              ]
            }
          ]
        },
        // --- Ordermanagement ---
        { id: 'ordermanagement', sectionName: 'Ordermanagement', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Concepten ---
        { id: 'concepten', sectionName: 'Concepten', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Voorraad ---
        { id: 'voorraad', sectionName: 'Voorraad', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Confrontatie ---
        { id: 'confrontatie', sectionName: 'Confrontatie', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Beoordelen inkoop ---
        { id: 'beoordelen-inkoop', sectionName: 'Beoordelen inkoop', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestelportal OutSite ---
        { id: 'bestelportal-outsite', sectionName: 'Bestelportal OutSite', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Inkoopaanvraag ---
        { id: 'inkoopaanvraag', sectionName: 'Inkoopaanvraag', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Projecten ---
        { id: 'projecten', sectionName: 'Projecten', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-facturering-voorraad',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-facturering-voorraad',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
