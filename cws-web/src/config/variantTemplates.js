export const CATEGORY_SUGGESTIONS = {
    Biryani: {
        variants: ['Small', 'Medium', 'Large', 'Family Pack'],
        modifiers: ['Extra raita', 'Extra gravy', 'Less spicy', 'No onion'],
    },
    Dosa: {
        variants: ['Plain', 'Masala', 'Butter', 'Ghee'],
        modifiers: ['Extra chutney', 'Podi', 'Cheese'],
    },
    Idli: {
        variants: ['2 pcs', '4 pcs', '6 pcs'],
        modifiers: ['Extra chutney', 'Sambar extra'],
    },
    Poori: {
        variants: ['1 pc', '2 pcs', 'Plate'],
        modifiers: ['Extra kurma'],
    },
    Meals: {
        variants: ['Full', 'Half'],
        modifiers: ['Extra rice', 'Extra curry', 'Extra rasam'],
    },
    Beverages: {
        variants: ['Regular', 'Large'],
        modifiers: ['Less sugar', 'No sugar', 'No ice'],
    },
    Food: {
        variants: [],
        modifiers: ['Extra gravy', 'Less spicy'],
    },
}

export function suggestFor(name = '', category = '') {
    const n = name.toLowerCase()
    if (category && CATEGORY_SUGGESTIONS[category]) return CATEGORY_SUGGESTIONS[category]
    if (n.includes('biriyani') || n.includes('biryani')) return CATEGORY_SUGGESTIONS.Biryani
    if (n.includes('dosa')) return CATEGORY_SUGGESTIONS.Dosa
    if (n.includes('idli')) return CATEGORY_SUGGESTIONS.Idli
    if (n.includes('poori') || n.includes('puri')) return CATEGORY_SUGGESTIONS.Poori
    if (n.includes('meals')) return CATEGORY_SUGGESTIONS.Meals
    if (n.includes('tea') || n.includes('coffee') || n.includes('juice')) return CATEGORY_SUGGESTIONS.Beverages
    return null
}