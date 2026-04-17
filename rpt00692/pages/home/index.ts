import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { DetailPage } from '@afas/blueprint/interfaces/detail-page';

export default function (services: BlueprintFactories): DetailPage {
  let {
    data: { constant },
    rest
  } = services;

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
