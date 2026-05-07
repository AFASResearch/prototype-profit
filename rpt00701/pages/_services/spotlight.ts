import { SpotlightEntry, SpotlightService } from '@afas/blueprint/interfaces/interfaces';
import { loadMenuConfig } from './menu.js';

export default async function (): Promise<SpotlightService> {
  const groups = await loadMenuConfig();
  let siteEntries: SpotlightEntry[] = groups.flatMap(group =>
    group.entries.map(entry => ({
      title: entry.description,
      url: entry.link,
      id: entry.id,
      secondary: false
    }))
  );
  return {
    getSiteEntries: () => Promise.resolve(siteEntries),
    load: parameters => Promise.resolve([])
  };
}
