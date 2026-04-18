export default function (services) {
    let { data: { dataType, createModel, createProperty, constant }, rest } = services;
    let mainModel = createModel({
        properties: {
            Id: createProperty(dataType.text()),
            Boekjaar: createProperty(dataType.number({ digitGrouping: false })),
            Periode: createProperty(dataType.text()),
        }
    });
    mainModel.properties.Boekjaar.config.locked = constant(true);
    mainModel.properties.Periode.config.locked = constant(true);
    return {
        id: 'rpt00692-journaliseer-wizard',
        type: 'wizard',
        title: constant('Journaliseer toekenningsregels'),
        completeAction: {
            label: 'Voltooien',
            async execute() { return true; }
        },
        async initialize(context) {
            let response = await rest.executeGetQuery({ url: '/api/rpt00692-journaliseer-wizard' });
            for (let [key, value] of Object.entries(response)) {
                let prop = mainModel.properties[key];
                if (prop) {
                    prop.setUserValue(value, true);
                }
            }
        },
        steps: [
            {
                title: 'Periode',
                content: [
                    {
                        type: 'fieldGroup',
                        title: 'Periode',
                        fields: [
                            { labelText: constant('Boekjaar'), property: mainModel.properties.Boekjaar },
                            { labelText: constant('Periode'), property: mainModel.properties.Periode },
                        ]
                    }
                ]
            },
            {
                title: 'Toekenningsregels',
                content: [
                    {
                        id: 'selectie',
                        type: 'multiSelectList',
                        title: constant('Toekenningsregels Te journaliseren'),
                        selectAllOnByDefault: true,
                        languageInfo: { itemNamePlural: 'regels' },
                        columns: [
                            { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
                            { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
                            { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                            { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
                            { key: 'status', header: 'Status', dataType: dataType.text(), sortable: true },
                        ],
                        actions: [
                            {
                                id: 'journaliseer',
                                name: 'Journaliseer',
                                isMultiselect: true,
                                async execute() { return true; }
                            }
                        ],
                        itemsLoader: rest.createItemsLoader({
                            url: '/api/rpt00692-journaliseer-wizard/selectie',
                            idFieldKeys: ['abonnementsregel']
                        })
                    }
                ]
            }
        ]
    };
}
