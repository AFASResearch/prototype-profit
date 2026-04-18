import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { DetailPage } from '@afas/blueprint/interfaces/detail-page';

export default function (services: BlueprintFactories): DetailPage {
  let {
    data: { dataType, createModel, createProperty, constant },
    rest
  } = services;

  let mainModel = createModel({
    properties: {
      Id: createProperty(dataType.text()),
      // --- Tab Algemeen (bestaand) ---
      status: createProperty(dataType.text()),
      administratie: createProperty(dataType.text()),
      periodeafsluitingsplan: createProperty(dataType.text()),
      boekjaar: createProperty(dataType.text()),
      periode: createProperty(dataType.text()),
      begindatumPeriode: createProperty(dataType.text()),
      einddatumPeriode: createProperty(dataType.text()),
    }
  });

  return {
    id: 'rpt00692-abonnement-cyclus',
    type: 'detail',
    title: constant('Periodeafsluiting 2026 – April (1)'),
    blueprint: {
      sections: [
        // --- Bestaand tabblad: Algemeen ---
        {
          id: 'algemeen',
          sectionName: 'Algemeen',
          isEditable: constant(false),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                { labelText: constant('Status'), property: mainModel.properties.status },
                { labelText: constant('Administratie'), property: mainModel.properties.administratie },
                { labelText: constant('Periodeafsluitingsplan'), property: mainModel.properties.periodeafsluitingsplan },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Periode',
              fields: [
                { labelText: constant('Boekjaar'), property: mainModel.properties.boekjaar },
                { labelText: constant('Periode'), property: mainModel.properties.periode },
                { labelText: constant('Begindatum periode'), property: mainModel.properties.begindatumPeriode },
                { labelText: constant('Einddatum periode'), property: mainModel.properties.einddatumPeriode },
              ]
            }
          ]
        },
        // --- Bestaand tabblad: Overlopende posten ---
        { id: 'overlopende-posten', sectionName: 'Overlopende posten', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestaand tabblad: Financiële mutaties ---
        { id: 'financiele-mutaties', sectionName: 'Financiële mutaties', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestaand tabblad: Finance audit-regels ---
        { id: 'finance-audit-regels', sectionName: 'Finance audit-regels', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestaand tabblad: Finance audit-resultaat ---
        { id: 'finance-audit-resultaat', sectionName: 'Finance audit-resultaat', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestaand tabblad: Genegeerd auditresultaat ---
        { id: 'genegeerd-auditresultaat', sectionName: 'Genegeerd auditresultaat', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- Bestaand tabblad: Draaiboekregels ---
        { id: 'draaiboekregels', sectionName: 'Draaiboekregels', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
        // --- NIEUW tabblad: Periodetoekenningsregels (weergave met acties) --- // gewijzigd
        ({
          id: 'periodetoekenningsregels',
          sectionName: 'Periodetoekenningsregels',
          elements: [
            {
              id: 'toekenningsregels',
              type: 'list',
              title: constant('Periodetoekenningsregels abonnementen'),
              languageInfo: {
                itemNamePlural: 'toekenningsregels'
              },
              columns: [
                { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
                { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
                { key: 'aangemaakt', header: 'Aangemaakt op', dataType: dataType.date(), sortable: true },
                { key: 'aanmakerNaam', header: 'Aangemaakt door', dataType: dataType.text(), sortable: true },
              ],
              actions: [
                {
                  id: 'genereer',
                  name: 'Genereer periodetoekenningsregels',
                  isPrimary: true,
                  getMicroCopyText() { return 'Maak regels aan en journaliseer ze direct voor deze periode.'; },
                  async execute(context: any) {
                    let result = await context.startDialog({ routePattern: 'rpt00692-genereer-wizard/:id', routeParameters: { id: '1' } }, {}, { editMode: 'Add' });
                    return !!result;
                  },
                  scheduleListRefresh: [1000, 3000, 8000, 15000]
                },
                {
                  id: 'verwijder',
                  name: 'Verwijder toekenningsregels',
                  isPrimary: true,
                  isMultiselect: true,
                  getMicroCopyText() { return 'Verwijder geselecteerde regels en draai de journaalpost terug.'; },
                  async execute(context: any) {
                    let confirmed = await context.confirm({
                      title: 'Bevestiging',
                      message: 'Weet je zeker dat je de geselecteerde toekenningen wilt verwijderen? De bijbehorende journaalposten worden teruggedraaid.'
                    });
                    if (!confirmed) return false;
                    return true;
                  },
                  scheduleListRefresh: [1000, 5000]
                },
              ],
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00692-toekenningsregels',
                idFieldKeys: ['abonnementsregel']
              })
            } as any
          ]
        }) as any,
        // --- Bestaand tabblad: Dossier ---
        { id: 'dossier', sectionName: 'Dossier', elements: [{ type: 'text', text: constant('Geen gegevens beschikbaar in mockup.') }] },
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-cyclus',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00692-abonnement-cyclus',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
