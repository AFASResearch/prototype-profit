export default function (services) {
    let { data: { dataType, createModel, createProperty, constant }, rest } = services;
    let mainModel = createModel({
        properties: {
            Id: createProperty(dataType.text()),
            // Kop - Algemeen
            Verkooprelatie: createProperty(dataType.text()),
            Factuurdatum: createProperty(dataType.date()),
            Opdrachtnummer: createProperty(dataType.text()),
            Btwplicht: createProperty(dataType.text()),
            // Staart - Totalen
            Totaalbedrag: createProperty(dataType.currencyAmount()),
            BtwBedrag: createProperty(dataType.currencyAmount()),
            Factuurtotaal: createProperty(dataType.currencyAmount()),
        }
    });
    mainModel.properties.Verkooprelatie.config.makeMandatory();
    mainModel.properties.Factuurdatum.config.makeMandatory();
    mainModel.properties.Btwplicht.config.makeMandatory();
    // Staart readonly
    mainModel.properties.Totaalbedrag.config.locked = constant(true);
    mainModel.properties.BtwBedrag.config.locked = constant(true);
    mainModel.properties.Factuurtotaal.config.locked = constant(true);
    return {
        id: 'rpt00701-abonnementsfactuur',
        type: 'detail',
        title: constant('Factuur F-2026-0412 – Facilicom BV'),
        blueprint: ({
            hideTableOfContents: true,
            sections: [
                {
                    id: 'factuur',
                    sectionName: 'Abonnementsfactuur',
                    isEditable: constant(true),
                    elements: [
                        {
                            type: 'fieldGroup',
                            title: 'Algemeen',
                            fields: [
                                { labelText: constant('Verkooprelatie'), property: mainModel.properties.Verkooprelatie },
                                { labelText: constant('Factuurdatum'), property: mainModel.properties.Factuurdatum },
                                { labelText: constant('Opdrachtnummer/referentie'), property: mainModel.properties.Opdrachtnummer },
                                { labelText: constant('Btw-plicht'), property: mainModel.properties.Btwplicht },
                            ]
                        },
                        {
                            id: 'regels',
                            type: 'list',
                            title: constant('Regels'),
                            languageInfo: { itemNamePlural: 'regels' },
                            columns: [
                                { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                                { key: 'aantal', header: 'Aantal', dataType: dataType.number({ digitGrouping: false }) },
                                { key: 'prijs', header: 'Prijs', dataType: dataType.currencyAmount() },
                                { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount() },
                            ],
                            actions: [
                                {
                                    id: 'nieuwe',
                                    name: 'Nieuw',
                                    isPrimary: true,
                                    async execute() { return true; }
                                },
                                {
                                    id: 'tussenvoegen',
                                    name: 'Tussenvoegen',
                                    isPrimary: true,
                                    async execute() { return true; }
                                },
                                {
                                    id: 'eigenschappen-item',
                                    name: '1. Eigenschappen item',
                                    isPrimary: true,
                                    async execute() { return true; }
                                },
                                {
                                    id: 'partijen',
                                    name: '3. Partijen',
                                    async execute() { return true; }
                                },
                                {
                                    id: 'serienummers',
                                    name: '4. Serienummers',
                                    async execute() { return true; }
                                },
                                {
                                    id: 'samenstelling',
                                    name: '5. Samenstelling',
                                    async execute() { return true; }
                                },
                                {
                                    id: 'art-dimensies',
                                    name: '6. Art.dimensies',
                                    async execute() { return true; }
                                },
                                {
                                    id: 'verwijderen',
                                    name: 'Verwijderen',
                                    type: 'delete',
                                    async execute() { return true; }
                                },
                            ],
                            itemsLoader: rest.createItemsLoader({
                                url: '/api/rpt00701-abonnementsfactuur/regels',
                                idFieldKeys: ['id']
                            })
                        },
                        {
                            type: 'fieldGroup',
                            title: 'Totalen',
                            fields: [
                                { labelText: constant('Totaalbedrag'), property: mainModel.properties.Totaalbedrag },
                                { labelText: constant('Btw-bedrag'), property: mainModel.properties.BtwBedrag },
                                { labelText: constant('Factuurtotaal'), property: mainModel.properties.Factuurtotaal },
                            ]
                        },
                    ]
                },
            ]
        }),
        models: {
            main: {
                model: mainModel,
                hooks: {
                    initializer: rest.getQueryModelHook(mainModel, {
                        url: '/api/rpt00701-abonnementsfactuur',
                        idProperties: [mainModel.properties.Id],
                        idValues: ['1']
                    }),
                    updater: rest.patchQueryModelHook(mainModel, {
                        url: '/api/rpt00701-abonnementsfactuur',
                        idProperties: [mainModel.properties.Id],
                        valueProperties: Object.values(mainModel.properties)
                    })
                }
            }
        }
    };
}
