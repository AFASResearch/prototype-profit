let groups = [];
export async function loadMenuConfig() {
    try {
        const res = await fetch('/api/menu-config');
        if (res.ok) {
            return await res.json();
        }
    }
    catch { /* ignore */ }
    return getFallbackGroups();
}
function getFallbackGroups() {
    return [
        {
            id: 'home',
            description: 'Home',
            entries: [
                { id: 'home', description: 'Home', link: 'home' }
            ]
        }
    ];
}
export default async function () {
    groups = await loadMenuConfig();
    return {
        getAllEntries() {
            return groups;
        },
        getFavoriteMenuEntries() {
            return groups;
        },
        updateFavoriteMenuEntries() {
            return;
        },
        wait() {
            return Promise.resolve();
        },
        hasMainMenu: true
    };
}
