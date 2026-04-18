import { groups } from './menu.js';
export default async function () {
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
