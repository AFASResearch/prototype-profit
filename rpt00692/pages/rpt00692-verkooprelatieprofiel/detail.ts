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
      // --- Factureren: bestaande velden ---
      aantalExemplaren: createProperty(dataType.number({ digitGrouping: false })),
      bijlageSamenvoegen: createProperty(dataType.yesNo()),
      ordermanagement: createProperty(dataType.enumeration({
        options: [
          { key: 'O', name: "Op basis van 'oorspronkelijke verkooprelatie' (O)" },
          { key: 'A', name: "Op basis van 'afwijkende verkooprelatie' (A)" },
        ]
      })),
      overige: createProperty(dataType.enumeration({
        options: [
          { key: 'O', name: "Op basis van 'oorspronkelijke verkooprelatie' (O)" },
          { key: 'A', name: "Op basis van 'afwijkende verkooprelatie' (A)" },
        ]
      })),
      bankrekeningVerkoopfactuur: createProperty(dataType.text()),
      gRekeningEFactuur: createProperty(dataType.text()),
      facturatieFrequentie: createProperty(dataType.text()),
      extraDagenFacturatieFrequentie: createProperty(dataType.number({ digitGrouping: false })),
      voorkeurPortal: createProperty(dataType.text()),
      // --- Abonnementen: nieuw (US07, §3.4a) ---
      factuurmoment: createProperty(dataType.enumeration({
        options: [
          { key: '1', name: 'Aantal dagen voor begindatumcyclus' },
          { key: '2', name: 'Aantal dagen na begindatumcyclus' },
          { key: '3', name: 'Aantal dagen voor einddatumcyclus' },
          { key: '4', name: 'Aantal dagen na einddatumcyclus' },
          { key: '5', name: 'Midden van de factuurperiode' },
        ]
      })),
      aantalDagen: createProperty(dataType.number({ digitGrouping: false })),
    }
  });

  // Aantal dagen zichtbaar als factuurmoment gevuld is en niet Midden
  const nietMidden = createExpression(
    [mainModel.properties.factuurmoment],
    v => v != null && v !== '' && v !== '5'
  );
  mainModel.properties.aantalDagen.config.active = nietMidden;

  return {
    id: 'rpt00692-verkooprelatieprofiel',
    type: 'detail',
    title: constant('Standaard verkooprelatieprofiel (*****)'),
    blueprint: {
      sections: [
        // --- Algemeen ---
        { id: 'algemeen', sectionName: 'Algemeen', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Factureren ---
        {
          id: 'factureren',
          sectionName: 'Factureren',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Verkoopfacturen',
              fields: [
                { labelText: constant('Aantal exemplaren afdrukken'), property: mainModel.properties.aantalExemplaren },
                { labelText: constant('Bijlage samenvoegen met .pdf verkoopfactuur'), property: mainModel.properties.bijlageSamenvoegen },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Btw- en betaalinstellingen',
              fields: [
                { labelText: constant('Ordermanagement'), property: mainModel.properties.ordermanagement },
                { labelText: constant('Overige'), property: mainModel.properties.overige },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Bankrek. verkoopfactuur',
              fields: [
                { labelText: constant('Bankrek. verkoopfactuur'), property: mainModel.properties.bankrekeningVerkoopfactuur },
                { labelText: constant('G-rekening e-factuur'), property: mainModel.properties.gRekeningEFactuur },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Frequentie',
              fields: [
                { labelText: constant('Facturatie frequentie'), property: mainModel.properties.facturatieFrequentie },
                { labelText: constant('Extra dagen facturatie frequentie'), property: mainModel.properties.extraDagenFacturatieFrequentie },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Verstrekking OutSite',
              fields: [
                { labelText: constant('Voorkeur Portal'), property: mainModel.properties.voorkeurPortal },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Abonnementen', // nieuw US07
              fields: [
                { labelText: constant('Factuurmoment'), property: mainModel.properties.factuurmoment, getMicroCopyText() { return 'Standaard factuurmoment voor nieuwe abonnementen van debiteuren met dit profiel. Laat leeg om de omgevingsinstelling te gebruiken.'; } } as any,
                { labelText: constant('Aantal dagen'), property: mainModel.properties.aantalDagen, getMicroCopyText() { return 'Standaard aantal dagen verschuiving voor nieuwe abonnementen van debiteuren met dit profiel.'; } } as any,
              ]
            },
          ]
        },
        // --- Rapport ---
        { id: 'rapport', sectionName: 'Rapport', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Rapport factuur ---
        { id: 'rapport-factuur', sectionName: 'Rapport factuur', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Berichtsjabloon ---
        { id: 'berichtsjabloon', sectionName: 'Berichtsjabloon', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Berichtsjabloon factuur ---
        { id: 'berichtsjabloon-factuur', sectionName: 'Berichtsjabloon factuur', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Verzamelfactuur ---
        { id: 'verzamelfactuur', sectionName: 'Verzamelfactuur', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Verzamelen per onderdeel ---
        { id: 'verzamelen-per-onderdeel', sectionName: 'Verzamelen per onderdeel', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Verdichten factuur ---
        { id: 'verdichten-factuur', sectionName: 'Verdichten factuur', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-verkooprelatieprofiel',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-verkooprelatieprofiel',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
