import type { BlueprintFactories } from '@afas/blueprint-factories/interfaces';
import type { StartMenuPage } from '@afas/blueprint/interfaces/page';

export default function (factories: BlueprintFactories): StartMenuPage {
  return {
    id: 'menu',
    type: 'startMenu'
  };
}
