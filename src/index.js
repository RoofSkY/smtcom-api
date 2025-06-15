// index.js
const userConfig = require('./userConfig');
const categories = require('./categories');
const scraper = require('./scraper');

async function startSearch() {
    const {
        TARGET_MAIN_CATEGORY,
        TARGET_SUB_CATEGORY_NAME,
        SEARCH_KEYWORD,
        LIST_ORDER,
        LIST_NUM,
        PAGE_NUM
    } = userConfig;

    const { ALL_CATEGORIES_DETAIL_MAP } = categories;

    // 검색 전에 allProducts 배열 초기화
    scraper.resetAllProducts();

    const mainCategory = ALL_CATEGORIES_DETAIL_MAP[TARGET_MAIN_CATEGORY];

    if (!mainCategory) {
        console.error(`Error: "${TARGET_MAIN_CATEGORY}" main category not found. Please check TARGET_MAIN_CATEGORY variable in userConfig.js.`);
        return;
    }

    const selectedCategory = mainCategory.find(cat => cat.name === TARGET_SUB_CATEGORY_NAME);

    if (!selectedCategory) {
        console.error(`Error: "${TARGET_SUB_CATEGORY_NAME}" sub-category not found in "${TARGET_MAIN_CATEGORY}". Please check TARGET_SUB_CATEGORY_NAME variable in userConfig.js.`);
        return;
    }

    if (selectedCategory.isGroup && selectedCategory.subCategories) {
        for (const subCat of selectedCategory.subCategories) {
            const effectiveCate1 = subCat.cate1 || selectedCategory.cate1;
            await scraper.fetchAndSave(
                SEARCH_KEYWORD,
                effectiveCate1,
                subCat.cate2,
                LIST_ORDER,
                LIST_NUM,
                PAGE_NUM,
                TARGET_MAIN_CATEGORY,
                `${selectedCategory.name} - ${subCat.name}`
            );
        }
    } else {
        await scraper.fetchAndSave(
            SEARCH_KEYWORD,
            selectedCategory.cate1,
            selectedCategory.cate2,
            LIST_ORDER,
            LIST_NUM,
            PAGE_NUM,
            TARGET_MAIN_CATEGORY,
            selectedCategory.name
        );
    }

    const finalProducts = scraper.getAllProducts();

    if (finalProducts.length > 0) {
        console.log(JSON.stringify(finalProducts, null, 4));
    } else {
        console.log(JSON.stringify([], null, 4));
    }
}

// 프로그램 시작
startSearch();