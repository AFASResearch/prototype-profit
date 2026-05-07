import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { ListPage } from '@afas/blueprint/interfaces/list-page';

export default function (services: BlueprintFactories): ListPage {
  let {
    data: { constant, dataType },
    rest
  } = services;

  return {
    id: 'rpt00701-verkoopprijs-item',
    type: 'list',
    title: constant('Verkoopprijs (item)'),
    blueprint: {
      sections: [
        {
          content: {
            id: 'main',
            type: 'list',
            title: constant('Verkoopprijs (item)'),
            languageInfo: { itemNamePlural: 'verkoopprijzen' },
            columns: [
              { key: 'huidigePrijs', header: 'Huidige prijs', dataType: dataType.yesNo(), sortable: true },
              { key: 'prijslijst', header: 'Prs.lst.', dataType: dataType.text(), sortable: true },
              { key: 'prijslijstVerkoop', header: 'Prijslijst verkoop', dataType: dataType.text(), sortable: true },
              { key: 'begin', header: 'Begin', dataType: dataType.date(), sortable: true },
              { key: 'verkoopprijs', header: 'Vrk.prijs', dataType: dataType.currencyAmount(), sortable: true },
              { key: 'valuta', header: 'Val.', dataType: dataType.text(), sortable: true },
              { key: 'eenheid', header: 'Eenheid', dataType: dataType.text(), sortable: true },
              { key: 'debiteur', header: 'Deb.', dataType: dataType.text(), sortable: true },
              { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
              { key: 'project', header: 'Prj.', dataType: dataType.text(), sortable: true },
              { key: 'projectNaam', header: 'Project', dataType: dataType.text(), sortable: true },
              { key: 'dim1', header: 'Dim. 1', dataType: dataType.text(), sortable: true },
              { key: 'dim2', header: 'Dim. 2', dataType: dataType.text(), sortable: true },
            ],
            actions: [
              {
                id: 'nieuw',
                name: 'Nieuw',
                isPrimary: true,
                async execute(context: any) {
                  let result = await context.startDialog(
                    { routePattern: 'rpt00701-nieuwe-verkoopprijs/:id', routeParameters: { id: '1' } },
                    {},
                    { editMode: 'Edit' }
                  );
                  return !!result;
                }
              },
              {
                id: 'onderhouden',
                name: '1. Onderhouden',
                isPrimary: true,
                isSingleSelect: true,
                async execute(context: any) {
                  let selected = Object.values(context.getListState()?.selectedItems ?? {})[0] as any;
                  if (!selected) return false;
                  let result = await context.startDialog(
                    { routePattern: 'rpt00701-nieuwe-verkoopprijs/:id', routeParameters: { id: selected.id } },
                    {},
                    { editMode: 'Edit' }
                  );
                  return !!result;
                }
              },
            ],
            itemsLoader: rest.createItemsLoader({
              url: '/api/rpt00701-verkoopprijs-item',
              idFieldKeys: ['id']
            })
          }
        }
      ]
    }
  };
}
