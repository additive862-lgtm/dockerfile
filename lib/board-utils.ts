export interface TabItem {
    name: string;
    key: string;
}

// Map categories to their tabs
export const TAB_CONFIG: Record<string, TabItem[]> = {
    'church': [
        { name: '전체', key: 'all' },
        { name: '한국교회사', key: 'korea' },
        { name: '세계교회사', key: 'world' }
    ],
    'bible': [
        { name: '전체', key: 'all' },
        { name: '구약', key: 'old' },
        { name: '신약', key: 'new' }
    ]
};

// Functions map
const CATEGORY_MAPPING: Record<string, Record<string, string>> = {
    'church': {
        'korea': 'church-korea',
        'world': 'church-world',
    },
    'bible': {
        'old': 'bible-old',
        'new': 'bible-new',
    }
};

// Function to get the DB category key based on route category and tab
export function getMappedCategory(category: string, tab?: string, settings?: any): string | string[] {
    // If settings are provided from DB, use them
    if (settings && settings.categories && settings.categories.length > 0) {
        const subCategories = settings.categories.map((c: string) => {
            const [name, key] = c.split(':');
            return { name, key: key || name };
        });

        // If tab is 'all' or undefined, return all keys
        if (!tab || tab === 'all') {
            return subCategories.map((sc: any) => sc.key);
        }

        // Return specific key
        const found = subCategories.find((sc: any) => sc.key === tab);
        return found ? found.key : subCategories.map((sc: any) => sc.key);
    }

    // Fallback to hardcoded mapping
    const mapping = CATEGORY_MAPPING[category];
    if (!mapping) return category;

    if (!tab || tab === 'all') {
        return Object.values(mapping);
    }

    return mapping[tab] || Object.values(mapping);
}

// Check if a DB category belongs to a route category
export function isValidCategoryForRoute(routeCategory: string, postCategory: string, settings?: any): boolean {
    if (routeCategory === postCategory) return true;

    if (settings && settings.categories) {
        return settings.categories.some((c: string) => {
            const [, key] = c.split(':');
            return (key || c.split(':')[0]) === postCategory;
        });
    }

    const mapping = CATEGORY_MAPPING[routeCategory];
    if (!mapping) return false;

    return Object.values(mapping).includes(postCategory);
}

// Get display name for a db category
export function getCategoryDisplayName(category: string, settings?: any): string {
    // 1. Try to resolve from dynamic settings
    if (settings && settings.categories && settings.categories.length > 0) {
        for (const c of settings.categories) {
            const [label, key] = c.split(':');
            if ((key || label) === category) return label;
        }
    }

    // 2. Fallback to hardcoded map
    const displayMap: Record<string, string> = {
        'church-korea': '한국교회사',
        'church-world': '세계교회사',
        'bible-old': '구약',
        'bible-new': '신약',
        'free-board': '자유게시판',
        'gallery': '갤러리',
        'qna': '질문과 답변',
        'daily-homily': '매일의 강론',
        'story-spring': '이야기 샘',
        'mamdo-commentary': '맘도 성서 해설'
    };
    return displayMap[category] || category;
}

