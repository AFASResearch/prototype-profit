import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let { data: { constant, dataType }, rest } = services;

  return {
    id: 'rpt00701-prijswijzigingen',
    type: 'list',
    title: constant('Prijswijzigingen abonnementsregels'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'prijswijzigingen',
            type: 'list',
            title: constant('Prijswijzigingen abonnementsregels'),
            languageInfo: { itemNamePlural: 'regels' },
            columns: [
              { key: 'peildatum', header: 'Peildatum', dataType: dataType.date(), sortable: false },
              { key: 'abonr', header: 'Abo.nr.', dataType: dataType.number({ digitGrouping: false }), sortable: true },
              { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
              { key: 'vrkrel', header: 'Vrk.rel.', dataType: dataType.number({ digitGrouping: false }), sortable: true },
              { key: 'item', header: 'Item', dataType: dataType.text(), sortable: true },
              { key: 'code', header: 'Code', dataType: dataType.number({ digitGrouping: false }), sortable: true },
              { key: 'aantal', header: 'Aant.', dataType: dataType.number({ digitGrouping: false }), sortable: true },
              { key: 'waardeBV', header: 'Waarde BV', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'afwPrijs', header: 'Afw. prijs', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'begin', header: 'Begin', dataType: dataType.date(), sortable: true },
              { key: 'eind', header: 'Eind', dataType: dataType.date(), sortable: true },
              { key: 'begindatumTarief', header: 'Begindatum tarief', dataType: dataType.date(), sortable: true },
              { key: 'einddatumTarief', header: 'Einddatum tarief', dataType: dataType.date(), sortable: true },
            ],
            actions: [
              {
                id: 'afwijkendePrijzenWijzigen',
                name: 'afwijkende prijzen vastleggen',
                isMultiselect: true,
                activeWithoutSelection: true,
                showLabel: true,
                isPrimary: true,
                async execute(context: any) {
                  let result = await context.startDialog(
                    { routePattern: 'rpt00701-collectief-wijzigen/:id', routeParameters: { id: '1' } },
                    {},
                    { editMode: 'Edit' }
                  );
                  return !!result;
                },
                scheduleListRefresh: [1000, 5000]
              }
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-prijswijzigingen',
              idFieldKeys: ['abonr', 'code']
            })
          }
        }
      ]
    }
  };
}
