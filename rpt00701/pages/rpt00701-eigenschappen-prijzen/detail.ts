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
    }
  });

  function prijsKolommen() {
    let columns: any[] = [
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
    ];

    columns.push(
      { key: 'dim1', header: 'Dim. 1', dataType: dataType.text(), sortable: true },
      { key: 'dim2', header: 'Dim. 2', dataType: dataType.text(), sortable: true },
    );

    return columns;
  }

  function kortingKolommen() {
    return [
      { key: 'huidigePrijs', header: 'Huidige prijs', dataType: dataType.yesNo(), sortable: true },
      { key: 'prijslijst', header: 'Prs.lst.', dataType: dataType.text(), sortable: true },
      { key: 'prijslijstVerkoop', header: 'Prijslijst', dataType: dataType.text(), sortable: true },
      { key: 'begin', header: 'Begin', dataType: dataType.date(), sortable: true },
      { key: 'korting', header: 'Korting %', dataType: dataType.percentage(), sortable: true },
      { key: 'debiteur', header: 'Deb.', dataType: dataType.text(), sortable: true },
      { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
      { key: 'dim1', header: 'Dim. 1', dataType: dataType.text(), sortable: true },
      { key: 'dim2', header: 'Dim. 2', dataType: dataType.text(), sortable: true },
    ];
  }

  function abonnementstariefKolommen() {
    return [
      { key: 'huidigePrijs', header: 'Huidige prijs', dataType: dataType.yesNo(), sortable: true },
      { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
      { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
      { key: 'regelnr', header: 'Regelnr.', dataType: dataType.number(), sortable: true },
      { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
      { key: 'begindatum', header: 'Begindatum', dataType: dataType.date(), sortable: true },
      { key: 'einddatum', header: 'Einddatum', dataType: dataType.date(), sortable: true },
      { key: 'prijs', header: 'Prijs', dataType: dataType.currencyAmount(), sortable: true },
    ];
  }

  function lijstSectie(id: string, sectionName: string, title: string, columns: any[], url: string, dialogRoute = 'rpt00701-nieuwe-verkoopprijs', allowNew = true) {
    return {
      id,
      sectionName,
      elements: [
        {
          id,
          type: 'list',
          title: constant(title),
          languageInfo: { itemNamePlural: 'regels' },
          columns,
          actions: [
            ...(allowNew ? [{
              id: 'nieuw',
              name: 'Nieuw',
              isPrimary: true,
              async execute(context: any) {
                let result = await context.startDialog(
                  { routePattern: `${dialogRoute}/:id`, routeParameters: { id: '1' } },
                  {},
                  { editMode: 'Edit' }
                );
                return !!result;
              }
            }] : []),
            {
              id: 'onderhouden',
              name: allowNew ? '1. Onderhouden' : 'Onderhouden',
              isPrimary: true,
              isSingleSelect: true,
              async execute(context: any) {
                let selected = Object.values(context.getListState()?.selectedItems ?? {})[0] as any;
                if (!selected) return false;
                let result = await context.startDialog(
                  { routePattern: `${dialogRoute}/:id`, routeParameters: { id: selected.id } },
                  {},
                  { editMode: 'Edit' }
                );
                return !!result;
              }
            },
          ],
          itemsLoader: rest.createItemsLoader({
            url,
            idFieldKeys: ['id']
          })
        } as any
      ]
    } as any;
  }

  return {
    id: 'rpt00701-eigenschappen-prijzen',
    type: 'detail',
    title: constant('Eigenschappen prijzen/kortingen Artikel'),
    blueprint: {
      sections: [
        lijstSectie('inkoopprijs', 'Inkoopprijs', 'Inkoopprijs (item)', prijsKolommen(), '/api/rpt00701-eigenschappen-prijzen/inkoopprijs'),
        lijstSectie('verkoopprijs-actie', 'Verkoopprijs (actie)', 'Verkoopprijs (actie)', prijsKolommen(), '/api/rpt00701-eigenschappen-prijzen/verkoopprijs-actie'),
        lijstSectie('verkoopkorting', 'Verkoopkorting', 'Verkoopkorting (item)', kortingKolommen(), '/api/rpt00701-eigenschappen-prijzen/verkoopkorting'),
        lijstSectie('verkoopkorting-actie', 'Verkoopkorting (actie)', 'Verkoopkorting (actie)', kortingKolommen(), '/api/rpt00701-eigenschappen-prijzen/verkoopkorting-actie'),
        lijstSectie('kostprijs', 'Kostprijs', 'Kostprijs (item)', prijsKolommen(), '/api/rpt00701-eigenschappen-prijzen/kostprijs'),
        lijstSectie('inkoopkorting', 'Inkoopkorting', 'Inkoopkorting (item)', kortingKolommen(), '/api/rpt00701-eigenschappen-prijzen/inkoopkorting'),
        lijstSectie('inkoopkorting-actie', 'Inkoopkorting (actie)', 'Inkoopkorting (actie)', kortingKolommen(), '/api/rpt00701-eigenschappen-prijzen/inkoopkorting-actie'),
        lijstSectie('verkoopprijs', 'Verkoopprijs', 'Verkoopprijs (item)', prijsKolommen(), '/api/rpt00701-verkoopprijs-item'),
        lijstSectie('abonnementstarieven', 'Abonnementstarieven', 'Abonnementstarieven', abonnementstariefKolommen(), '/api/rpt00701-abonnementstarieven', 'rpt00701-onderhouden', false),
        lijstSectie('inkoopprijs-actie', 'Inkoopprijs (actie)', 'Inkoopprijs (actie)', prijsKolommen(), '/api/rpt00701-eigenschappen-prijzen/inkoopprijs-actie'),
        lijstSectie('verrekenprijs', 'Verrekenprijs', 'Verrekenprijs (item)', prijsKolommen(), '/api/rpt00701-eigenschappen-prijzen/verrekenprijs'),
      ]
    },
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00701-eigenschappen-prijzen',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          })
        }
      }
    }
  };
}
