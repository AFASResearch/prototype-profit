export default function (services) {
    let { data: { constant, dataType }, rest } = services;
    let regelcode = new URLSearchParams(globalThis.location?.search).get('regelcode');
    let itemsUrl = regelcode
        ? `/api/rpt00701-abonnementstarieven?regelcode=${encodeURIComponent(regelcode)}`
        : '/api/rpt00701-abonnementstarieven';
    return {
        id: 'rpt00701-abonnementstarieven',
        type: 'list',
        title: constant('Abonnementstarieven'),
        blueprint: {
            sections: [
                {
                    content: ({
                        id: 'abonnementstarieven',
                        type: 'list',
                        title: constant('Abonnementstarieven'),
                        languageInfo: {
                            itemNamePlural: 'abonnementstarieven'
                        },
                        columns: [
                            { key: 'abonr', header: 'Abo.nr.', dataType: dataType.text(), sortable: true },
                            { key: 'regelnr', header: 'Regelnr.', dataType: dataType.number(), sortable: true },
                            { key: 'naam', header: 'Naam', dataType: dataType.text(), sortable: true },
                            { key: 'abonregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
                            { key: 'begindatum', header: 'Begindatum', dataType: dataType.date(), sortable: true },
                            { key: 'einddatum', header: 'Einddatum', dataType: dataType.date(), sortable: true },
                            { key: 'prijs', header: 'Prijs', dataType: dataType.currencyAmount() },
                            { key: 'huidigePrijs', header: 'Huidige prijs', dataType: dataType.yesNo() },
                        ],
                        filters: [
                            { key: 'huidigePrijs', label: 'Huidige prijs', dataType: dataType.yesNo(), defaultValue: true }
                        ],
                        actions: [
                            {
                                id: 'onderhouden',
                                name: 'Onderhouden abonnementstarieven',
                                isPrimary: true,
                                isMultiselect: true,
                                async execute(context) {
                                    context.navigate({ routePattern: 'rpt00701-onderhouden/:id', routeParameters: { id: '1' } });
                                    return true;
                                },
                                scheduleListRefresh: [1000, 5000]
                            },
                            {
                                id: 'verwijderen',
                                name: 'Verwijderen',
                                isPrimary: false,
                                isMultiselect: true,
                                async execute(context) {
                                    let confirmed = await context.confirm({
                                        message: 'Weet je zeker dat je de geselecteerde Abonnementstarieven wilt verwijderen?'
                                    });
                                    if (!confirmed)
                                        return false;
                                    return true;
                                },
                                scheduleListRefresh: [1000, 5000]
                            }
                        ],
                        itemsLoader: rest.createItemsLoader({
                            url: itemsUrl,
                            idFieldKeys: ['abonr', 'abonregel', 'begindatum']
                        })
                    })
                }
            ]
        }
    };
}
