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
      // --- Tab Integratie: bestaande velden ---
      rekEmballage: createProperty(dataType.text()),
      rekVerwijderingsbijdrage: createProperty(dataType.text()),
      // --- Abonnementen ---
      transitorischeBoeking: createProperty(dataType.yesNo()),
      // --- Periodetoekenning (nieuw) ---
      periodetoekenningToepassen: createProperty(dataType.yesNo()),
      startperiodeBoekjaar: createProperty(dataType.number({ digitGrouping: false })),
      startperiodePeriode: createProperty(dataType.number({ digitGrouping: false })),
    }
  });

  mainModel.properties.startperiodeBoekjaar.config.makeMandatory();
  mainModel.properties.startperiodePeriode.config.makeMandatory();

  let periodetoekenningActief = createExpression(
    [mainModel.properties.periodetoekenningToepassen],
    (actief) => actief === true
  );

  mainModel.properties.startperiodeBoekjaar.config.active = periodetoekenningActief;
  mainModel.properties.startperiodePeriode.config.active = periodetoekenningActief;

  return {
    id: 'rpt00692-artikelgroep',
    type: 'detail',
    title: constant('Eigenschappen artikelgroep'),
    blueprint: {
      sections: [
        // --- Algemeen ---
        { id: 'algemeen', sectionName: 'Algemeen', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Integratie ---
        {
          id: 'integratie',
          sectionName: 'Integratie',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Integratie vervolg',
              fields: [
                { labelText: constant('Rek. emballage'), property: mainModel.properties.rekEmballage },
                { labelText: constant('Rek. verwijderingsbijdrage'), property: mainModel.properties.rekVerwijderingsbijdrage },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Abonnementen',
              fields: [
                { labelText: constant('Transitorische boeking maken van verkoopomzet'), property: mainModel.properties.transitorischeBoeking, controlInfo: { yesNo: { showFalseValue: true } } } as any,
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Periodetoekenning abonnementen',
              fields: [
                { labelText: constant('Periodetoekenning toepassen'), property: mainModel.properties.periodetoekenningToepassen, controlInfo: { yesNo: { showFalseValue: true } }, getMicroCopyText() { return 'Als actief en methode is achteraf factureren, dan komen regels in aanmerking voor periodetoekenning'; } } as any,
                { labelText: constant('Startperiode (boekjaar)'), property: mainModel.properties.startperiodeBoekjaar, getMicroCopyText() { return 'Boekjaar vanaf wanneer periodetoekenning actief is. Vóór deze periode blijft transitorisch journaliseren van toepassing.'; } } as any,
                { labelText: constant('Startperiode (periode)'), property: mainModel.properties.startperiodePeriode, getMicroCopyText() { return 'Periode vanaf wanneer periodetoekenning actief is.'; } } as any,
              ]
            }
          ]
        },
        // --- Artikel ---
        { id: 'artikel', sectionName: 'Artikel', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Samenstelling ---
        { id: 'samenstelling', sectionName: 'Samenstelling', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Marges ---
        { id: 'marges', sectionName: 'Marges', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Integratie intercompany ---
        { id: 'integratie-intercompany', sectionName: 'Integratie intercompany', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-artikelgroep',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-artikelgroep',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
