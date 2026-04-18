export default function (services) {
    let { data: { dataType, createModel, createProperty, constant }, rest } = services;
    let mainModel = createModel({
        properties: {
            Id: createProperty(dataType.text()),
            Boekjaar: createProperty(dataType.number({ digitGrouping: false })),
            Periode: createProperty(dataType.text()),
            BegindatumPeriode: createProperty(dataType.date()),
            EinddatumPeriode: createProperty(dataType.date()),
            DirectJournaliseren: createProperty(dataType.yesNo()),
        }
    });
    mainModel.properties.Boekjaar.config.locked = constant(true);
    mainModel.properties.Periode.config.locked = constant(true);
    mainModel.properties.BegindatumPeriode.config.locked = constant(true);
    mainModel.properties.EinddatumPeriode.config.locked = constant(true);
    return {
        id: 'rpt00692-genereer-wizard',
        type: 'wizard',
        title: constant('Genereer periodetoekenningsregels'),
        completeAction: {
            label: 'Voltooien',
            async execute() { return true; }
        },
        async initialize(context) {
            let response = await rest.executeGetQuery({ url: '/api/rpt00692-genereer-wizard' });
            let dateProps = new Set(['BegindatumPeriode', 'EinddatumPeriode']);
            for (let [key, value] of Object.entries(response)) {
                let prop = mainModel.properties[key];
                if (prop) {
                    let v = dateProps.has(key) && typeof value === 'string' ? new Date(value) : value;
                    prop.setUserValue(v, true);
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
                            { labelText: constant('Begindatum periode'), property: mainModel.properties.BegindatumPeriode },
                            { labelText: constant('Einddatum periode'), property: mainModel.properties.EinddatumPeriode },
                        ]
                    },
                    {
                        type: 'fieldGroup',
                        title: 'Opties',
                        fields: [
                            { labelText: constant('Direct journaliseren'), property: mainModel.properties.DirectJournaliseren, controlInfo: { yesNo: { showFalseValue: true } } },
                        ]
                    }
                ]
            },
            {
                title: 'Toekenbare regels',
                content: [
                    {
                        id: 'preview',
                        type: 'multiSelectList',
                        title: constant('Toekenbare abonnementsregels'),
                        selectAllOnByDefault: true,
                        languageInfo: { itemNamePlural: 'regels' },
                        columns: [
                            { key: 'abonnementsregel', header: 'Abonnementsregel', dataType: dataType.text(), sortable: true },
                            { key: 'abonnement', header: 'Abonnement', dataType: dataType.text(), sortable: true },
                            { key: 'omschrijving', header: 'Omschrijving', dataType: dataType.text(), sortable: true },
                            { key: 'bedrag', header: 'Bedrag', dataType: dataType.currencyAmount(), sortable: true },
                            { key: 'factuurmoment', header: 'Factuurmoment', dataType: dataType.text(), sortable: true },
                            { key: 'geparkeerd', header: 'Geparkeerd', dataType: dataType.yesNo(), sortable: true },
                        ],
                        actions: [
                            {
                                id: 'genereer',
                                name: 'Genereer',
                                isMultiselect: true,
                                async execute() { return true; }
                            }
                        ],
                        itemsLoader: rest.createItemsLoader({
                            url: '/api/rpt00692-genereer-wizard/preview',
                            idFieldKeys: ['abonnementsregel']
                        })
                    }
                ]
            }
        ]
    };
}
