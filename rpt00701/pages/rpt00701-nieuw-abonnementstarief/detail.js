export default function (services) {
    let { data: { dataType, createModel, createProperty, constant, createBig } } = services;
    let mainModel = createModel({
        properties: {
            Id: createProperty(dataType.text()),
            Abonnementsregel: createProperty(dataType.enumeration({
                options: [
                    { key: 'AB-1001-1', name: 'AB-1001 / 1 - Schoonmaak kantoor' },
                    { key: 'AB-1001-2', name: 'AB-1001 / 2 - Beveiliging receptie' },
                    { key: 'AB-1002-1', name: 'AB-1002 / 1 - Catering lunch' },
                ]
            })),
            HuidigePrijs: createProperty(dataType.currencyAmount()),
            Begindatum: createProperty(dataType.date()),
            Einddatum: createProperty(dataType.date()),
            Prijs: createProperty(dataType.currencyAmount()),
        }
    });
    mainModel.properties.Abonnementsregel.config.makeMandatory();
    mainModel.properties.HuidigePrijs.config.locked = constant(true);
    mainModel.properties.Begindatum.config.makeMandatory();
    mainModel.properties.Prijs.config.makeMandatory();
    return {
        id: 'rpt00701-nieuw-abonnementstarief',
        type: 'wizard',
        title: constant('Nieuw abonnementstarief'),
        completeAction: {
            label: 'Voltooien',
            async execute() { return true; }
        },
        async initialize() {
            mainModel.properties.Id.setUserValue('1', true);
            mainModel.properties.Abonnementsregel.setUserValue('AB-1001-1', true);
            mainModel.properties.HuidigePrijs.setUserValue(createBig('132.50'), true);
            mainModel.properties.Begindatum.setUserValue(new Date('2026-07-01T00:00:00Z'), true);
            mainModel.properties.Prijs.setUserValue(createBig('135.00'), true);
        },
        steps: [
            {
                title: 'Nieuw abonnementstarief',
                model: mainModel,
                content: [
                    {
                        type: 'fieldGroup',
                        title: 'Abonnementstarief',
                        fields: [
                            { labelText: constant('Abonnementsregel'), property: mainModel.properties.Abonnementsregel },
                            { labelText: constant('Huidige prijs'), property: mainModel.properties.HuidigePrijs },
                            { labelText: constant('Begindatum'), property: mainModel.properties.Begindatum },
                            { labelText: constant('Einddatum'), property: mainModel.properties.Einddatum },
                            { labelText: constant('Prijs'), property: mainModel.properties.Prijs },
                        ]
                    }
                ]
            }
        ]
    };
}
