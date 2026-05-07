import { loadMenuConfig } from './menu.js';
export default async function () {
    const groups = await loadMenuConfig();
    let siteEntries = groups.flatMap(group => group.entries.map(entry => ({
        title: entry.description,
        url: entry.link,
        id: entry.id,
        secondary: false
    })));
    return {
        getSiteEntries: () => Promise.resolve(siteEntries),
        load: parameters => Promise.resolve([])
    };
}
