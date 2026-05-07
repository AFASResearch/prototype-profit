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
      Begindatum: createProperty(dataType.date()),
    }
  });

  mainModel.properties.Begindatum.config.makeMandatory();

  return {
    id: 'rpt00701-onderhouden',
    type: 'detail',
    title: constant('Onderhouden abonnementstarieven'),
    blueprint: ({
      hideTableOfContents: true,
      sections: [
        {
          id: 'boekingslayout',
          sectionName: '',
          isEditable: constant(true),
          elements: [
            // === REGELS ===
            {
              id: 'regels',
              type: 'list',
              title: constant('Abonnementstarieven'),
              languageInfo: { itemNamePlural: 'abonnementstarieven' },
              columns: [
                { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
                { key: 'regelnr', header: 'Regelnr.', dataType: dataType.number(), sortable: true },
                { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
                { key: 'itemcode', header: 'Itemcode', dataType: dataType.text(), sortable: true },
                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                { key: 'prijsHdg', header: 'Prijs huidig', dataType: dataType.currencyAmount() },
                { key: 'begindatumHdg', header: 'Begindatum huidig', dataType: dataType.date() },
                { key: 'einddatumHdg', header: 'Einddatum huidig', dataType: dataType.date(), editable: true },
                { key: 'begindatumNw', header: 'Begindatum nieuw', dataType: dataType.date(), editable: true },
                { key: 'einddatumNw', header: 'Einddatum nieuw', dataType: dataType.date(), editable: true },
                { key: 'prijsNw', header: 'Prijs nieuw', dataType: dataType.currencyAmount(), editable: true },
              ],
              actions: [
                {
                  id: 'nieuw',
                  name: 'Nieuw',
                  isPrimary: true,
                  async execute(context: any) {
                    let result = await context.startDialog(
                      { routePattern: 'rpt00701-nieuw-abonnementstarief/:id', routeParameters: { id: '1' } },
                      {},
                      { editMode: 'Edit' }
                    );
                    return !!result;
                  },
                  scheduleListRefresh: [1000, 5000]
                },
                { id: 'tussenvoegen', name: 'Tussenvoegen', isPrimary: true, async execute() { return false; } },
                { id: 'historie', name: '1. Historie', isPrimary: true, async execute() { return false; } },
              ],
              inlineEdit: {
                editableColumns: ['einddatumHdg', 'begindatumNw', 'einddatumNw', 'prijsNw'],
                async updater(_context: any, filter: any, value: any, columnKey: string) {
                  return true;
                },
                getItemFields(_item: any) {
                  return [
                    { linkedColumnKey: 'einddatumHdg', field: { labelText: constant('Einddatum huidig'), property: createProperty(dataType.date()) } },
                    { linkedColumnKey: 'begindatumNw', field: { labelText: constant('Begindatum nieuw'), property: createProperty(dataType.date()) } },
                    { linkedColumnKey: 'einddatumNw', field: { labelText: constant('Einddatum nieuw'), property: createProperty(dataType.date()) } },
                    { linkedColumnKey: 'prijsNw', field: { labelText: constant('Prijs nieuw'), property: createProperty(dataType.currencyAmount()) } },
                  ];
                }
              },
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00701-onderhouden/regels',
                idFieldKeys: ['itemcode']
              })
            } as any
          ]
        }
      ]
    }) as any,
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00701-onderhouden',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00701-onderhouden',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
