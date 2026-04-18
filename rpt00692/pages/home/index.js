export default function (services) {
    let { data: { constant }, rest } = services;
    return {
        id: 'home',
        type: 'detail',
        title: constant('Home'),
        blueprint: {
            sections: [
                {
                    id: 'algemeen',
                    sectionName: 'Algemeen',
                    elements: [
                        {
                            type: 'text',
                            text: constant(`
### Welcome
You just initialized this Podium JS Project.
                        `)
                        }
                    ]
                }
            ]
        },
        models: {}
    };
}
