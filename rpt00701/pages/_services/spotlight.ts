import { SpotlightEntry, SpotlightService } from '@afas/blueprint/interfaces/interfaces';
import { groups } from './menu.js';

export default async function (): Promise<SpotlightService> {
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
