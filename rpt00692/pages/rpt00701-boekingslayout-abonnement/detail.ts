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

      // --- Boekingslay-out ---
      Verkooprelatie: createProperty(dataType.text()),
      FactuurNaarAfwijkende: createProperty(dataType.yesNo()),
      Contactpersoon: createProperty(dataType.text()),
      Betaalvoorwaarde: createProperty(dataType.text()),
      BegindatumAbonnement: createProperty(dataType.date()),
      Project: createProperty(dataType.text()),
      Projectfase: createProperty(dataType.text()),
      UitsluitenVerzamelfactuur: createProperty(dataType.yesNo()),
      Administratie: createProperty(dataType.text()),
      BegindatumCyclus: createProperty(dataType.date()),
      EinddatumCyclus: createProperty(dataType.date()),
      Factuurmoment: createProperty(dataType.enumeration({ options: [{ key: '1', name: 'Aantal dagen voor begindatumcyclus' }, { key: '2', name: 'Aantal dagen na begindatumcyclus' }, { key: '3', name: 'Aantal dagen voor einddatumcyclus' }, { key: '4', name: 'Aantal dagen na einddatumcyclus' }, { key: '5', name: 'Midden van de factuurperiode' }] })), // nieuw
      AantalDagen: createProperty(dataType.number({ digitGrouping: false })), // nieuw
      ItemcodeVerkoop: createProperty(dataType.text()),
      KortingPercentageVerkoop: createProperty(dataType.percentage()),
      OrgVerkoopprijs: createProperty(dataType.currencyAmount()),
      KortingsbedragVerkoop: createProperty(dataType.currencyAmount()),
      AfwVerkoopprijs: createProperty(dataType.currencyAmount()),
      Verkoopbedrag: createProperty(dataType.currencyAmount()),
    }
  });

  mainModel.properties.Verkooprelatie.config.makeMandatory();
  mainModel.properties.BegindatumAbonnement.config.makeMandatory();
  mainModel.properties.BegindatumCyclus.config.makeMandatory();
  mainModel.properties.Factuurmoment.config.makeMandatory();
  mainModel.properties.AantalDagen.config.active = createExpression(
    [mainModel.properties.Factuurmoment], (v) => v !== '5'
  );
  mainModel.properties.ItemcodeVerkoop.config.locked = constant(true);
  mainModel.properties.KortingPercentageVerkoop.config.locked = constant(true);
  mainModel.properties.OrgVerkoopprijs.config.locked = constant(true);
  mainModel.properties.KortingsbedragVerkoop.config.locked = constant(true);
  mainModel.properties.AfwVerkoopprijs.config.locked = constant(true);
  mainModel.properties.Verkoopbedrag.config.locked = constant(true);

  return {
    id: 'rpt00701-boekingslayout-abonnement',
    type: 'detail',
    title: constant('Abonnement'),
    blueprint: ({
      hideTableOfContents: true,
      sections: [
        {
          id: 'boekingslayout',
          sectionName: 'Abonnement',
          isEditable: constant(true),
          elements: [
            {
              type: 'fieldGroup',
              title: 'Algemeen',
              fields: [
                { labelText: constant('Verkooprelatie'), property: mainModel.properties.Verkooprelatie },
                { labelText: constant('Factuur naar afwijkende'), property: mainModel.properties.FactuurNaarAfwijkende },
                { labelText: constant('Contactpersoon'), property: mainModel.properties.Contactpersoon },
                { labelText: constant('Betaalvoorwaarde'), property: mainModel.properties.Betaalvoorwaarde },
                { labelText: constant('Begindatum abonnement'), property: mainModel.properties.BegindatumAbonnement },
                { labelText: constant('Project'), property: mainModel.properties.Project },
                { labelText: constant('Projectfase'), property: mainModel.properties.Projectfase },
                { labelText: constant('Uitsluiten verzamelfactuur'), property: mainModel.properties.UitsluitenVerzamelfactuur },
                { labelText: constant('Administratie'), property: mainModel.properties.Administratie },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Cyclus',
              fields: [
                { labelText: constant('Begindatum cyclus'), property: mainModel.properties.BegindatumCyclus },
                { labelText: constant('Einddatum cyclus'), property: mainModel.properties.EinddatumCyclus },
              ]
            },
            {
              type: 'fieldGroup',
              title: 'Factuurmoment',
              fields: [
                { labelText: constant('Factuurmoment'), property: mainModel.properties.Factuurmoment,
                  getMicroCopyText() { return 'Bepaalt wanneer de factuur wordt aangemaakt ten opzichte van de cyclus.'; } } as any,
                { labelText: constant('Aantal dagen'), property: mainModel.properties.AantalDagen,
                  getMicroCopyText() { return 'Aantal dagen verschuiving ten opzichte van de gekozen referentiedatum.'; } } as any,
              ]
            },
            ({
              id: 'regels',
              type: 'list',
              title: constant('Regels'),
              languageInfo: { itemNamePlural: 'regels' },
              columns: [
                { key: 'code', header: 'Code', dataType: dataType.text(), sortable: true },
                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), editable: true },
                { key: 'aantal', header: 'Aantal', dataType: dataType.number({ digitGrouping: false }), editable: true },
                { key: 'begin', header: 'Begin', dataType: dataType.date(), editable: true },
                { key: 'orgPrijs', header: 'Org. prijs', dataType: dataType.currencyAmount() },
                { key: 'afwPrijs', header: 'Afw. prijs', dataType: dataType.currencyAmount(), editable: true },
                { key: 'kortingPercentage', header: 'Korting %', dataType: dataType.percentage(), editable: true },
                { key: 'korting', header: 'Korting', dataType: dataType.currencyAmount(), editable: true },
              ],
              actions: [
                {
                  id: 'tussenvoegen',
                  name: 'Tussenvoegen',
                  isPrimary: true,
                  async execute() { return true; }
                },
                {
                  id: 'samenstellingsregels',
                  name: 'Samenstellingsregels',
                  isPrimary: true,
                  async execute() { return true; }
                },
                {
                  id: 'eigenschappen-item',
                  name: 'Eigenschappen item',
                  isPrimary: true,
                  async execute() { return true; }
                },
                {
                  id: 'verwijderen',
                  name: 'Verwijderen',
                  type: 'delete' as const,
                  async execute() { return true; }
                },
                {
                  id: 'open-prijsregel',
                  name: 'Abonnementstarief',
                  isPrimary: true,
                  isRowAction: true,
                  isSingleSelect: true,
                  async execute(context: any, filter: any) {
                    let regelcode = filter?.items?.[0]?.values?.code ?? filter?.values?.[0] ?? '7007';
                    context.navigate({ routePattern: 'rpt00701-abonnementstarieven', routeParameters: {}, queryString: { regelcode } });
                    return true;
                  }
                },
              ],
              inlineEdit: {
                editableColumns: ['omschrijving', 'aantal', 'begin', 'afwPrijs', 'kortingPercentage', 'korting'],
                async updater(context: any, filter: any, value: any, columnKey: string) {
                  await rest.fetch('/api/rpt00701-boekingslayout-abonnement/regels/update', { method: 'PATCH', body: { filter, columnKey, value } });
                  return true;
                },
                getItemFields(item: any) {
                  return [
                    { linkedColumnKey: 'omschrijving', field: { labelText: constant('Omschrijving'), property: createProperty(dataType.text()) } },
                    { linkedColumnKey: 'aantal', field: { labelText: constant('Aantal'), property: createProperty(dataType.number({ digitGrouping: false })) } },
                    { linkedColumnKey: 'begin', field: { labelText: constant('Begin'), property: createProperty(dataType.date()) } },
                    { linkedColumnKey: 'afwPrijs', field: { labelText: constant('Afw. prijs'), property: createProperty(dataType.currencyAmount()) } },
                    { linkedColumnKey: 'kortingPercentage', field: { labelText: constant('Korting %'), property: createProperty(dataType.percentage()) } },
                    { linkedColumnKey: 'korting', field: { labelText: constant('Korting'), property: createProperty(dataType.currencyAmount()) } },
                  ];
                }
              },
              itemsLoader: rest.createItemsLoader({
                url: '/api/rpt00701-boekingslayout-abonnement/regels',
                idFieldKeys: ['code']
              })
            } as any),
          ]
        },
      ]
    }) as any,
    models: {
      main: {
        model: mainModel,
        hooks: {
          initializer: rest.getQueryModelHook(mainModel, {
            url: '/api/rpt00701-boekingslayout-abonnement',
            idProperties: [mainModel.properties.Id],
            idValues: ['1']
          }),
          updater: rest.patchQueryModelHook(mainModel, {
            url: '/api/rpt00701-boekingslayout-abonnement',
            idProperties: [mainModel.properties.Id],
            valueProperties: Object.values(mainModel.properties)
          })
        }
      }
    }
  };
}
