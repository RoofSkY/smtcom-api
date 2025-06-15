const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

// --- 사용자 설정 변수 ---
// 검색할 상위 카테고리를 여기에 입력하세요. (예: "PC 주요구성", "모니터 및 주변기기")
const TARGET_MAIN_CATEGORY = "PC 주요구성";

// 검색할 상세 카테고리 이름을 여기에 입력하세요. (예: "CPU", "소프트웨어", "모니터", "키보드")
const TARGET_SUB_CATEGORY_NAME = "CPU";

// 실제 검색에 사용할 키워드를 여기에 입력하세요. (비워두면 카테고리 전체 검색)
const SEARCH_KEYWORD = "";

// 정렬 방식을 여기에 입력하세요. (예: "C.pd_suggest desc,C.pd_sold desc")
/*
인기상품순: C.pd_suggest desc,C.pd_sold desc
최신상품순: pd_date desc
낮은가격순: C.pd_sobija_price asc
높은가격순: C.pd_sobija_price desc
*/
const listOrder = "C.pd_suggest desc,C.pd_sold desc";

// 페이지당 표시할 상품 수와 페이지 번호를 설정하세요.
const listNum = "10";
const pageNum = "1";
// --- 사용자 설정 변수 끝 ---


// 모든 카테고리 상세 정보를 포함하는 단일 맵
// isGroup: true 인 경우, 해당 그룹 내 모든 하위 cate2들을 순서대로 검색
const allCategoriesDetailMap = {
    "PC 주요구성": [
        { name: "CPU", cate1: "17", cate2: "18" },
        { name: "쿨러/튜닝", cate1: "17", cate2: "1879" },
        { name: "메인보드", cate1: "17", cate2: "20" },
        { name: "메모리", cate1: "17", cate2: "19" },
        { name: "그래픽카드", cate1: "17", cate2: "21" },
        { name: "SSD", cate1: "17", cate2: "28" },
        { name: "HDD", cate1: "17", cate2: "22" },
        { name: "케이스", cate1: "17", cate2: "24" },
        { name: "파워", cate1: "17", cate2: "25" },
        { name: "조립비", cate1: "17", cate2: "1843" },
        {
            name: "소프트웨어", cate1: "1922", isGroup: true,
            subCategories: [
                { name: "운영체제", cate2: "1924" },
                { name: "오피스", cate2: "1925" },
                { name: "백신", cate2: "1926" }
            ]
        }
    ],
    "모니터 및 주변기기": [
        {
            name: "모니터", cate1: "1", isGroup: true,
            subCategories: [
                { name: "144hz", cate2: "1914" },
                { name: "24인치", cate2: "1911" },
                { name: "27인치", cate2: "1912" },
                { name: "30인치", cate2: "1913" },
                { name: "UHD", cate2: "1915" },
                { name: "주변기기", cate2: "2" }, // 모니터 주변기기
                { name: "터치모니터", cate2: "2023" }
            ]
        },
        {
            name: "키보드", cate1: "94", isGroup: true,
            subCategories: [
                { name: "키보드", cate2: "1898" },
                { name: "키보드/마우스", cate2: "1900" },
                { name: "키보드용품", cate2: "1977" }
            ]
        },
        {
            name: "마우스", cate1: "94", isGroup: true,
            subCategories: [
                { name: "마우스", cate2: "1899" },
                { name: "마우스주변기기", cate2: "1978" },
                { name: "마우스패드", cate2: "1903" }
            ]
        },
        { name: "스피커", cate1: "94", cate2: "1902" },
        { name: "헤드셋", cate1: "94", cate2: "1901" },
        { name: "이어폰", cate1: "94", cate2: "1960" },
        { name: "공유기/무선랜", cate1: "94", cate2: "1904" },
        {
            name: "IP공유기/허브", cate1: "94", isGroup: true, // 그룹 자체는 cate1: 94로 표시
            subCategories: [
                { name: "주변기기-네트워크장비", cate1: "94", cate2: "1957" }, // cate1: 94 유지
                { name: "개인방송장비-네트워크장비", cate1: "252", cate2: "255" } // cate1: 252로 변경
            ]
        },
        { name: "케이블", cate1: "94", cate2: "98" },
        { name: "컨트롤러", cate1: "94", cate2: "95" }
    ]
};

let allProducts = []; // 모든 검색 결과를 저장할 배열

async function fetchAndSave(cmd, cate1, cate2, listOrder, listNum, pageNum, categoryName, subCategoryName) {
    const url = "https://www.smtcom.co.kr/skin/shop/basic/estimate_search_new2.php";
    const payload = new URLSearchParams({
        "pd_ment": "Y",
        "chkk[제조회사]": "",
        "search": cmd,
        "depth": "2",
        "cate1": cate1,
        "cate2": cate2,
        "cate3": "",
        "cate4": "",
        "page": pageNum,
        "list_order": listOrder,
        "se_type": "",
        "list_num": listNum,
        "view_no": "Y"
    });

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://www.smtcom.co.kr",
        "Referer": "https://www.smtcom.co.kr/skin/shop/basic/estimate_search_new_top2.php",
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*; q = 0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ko,en-US;q=0.9,en;q=0.8"
    };

    try {
        const response = await axios.post(url, payload.toString(), {
            headers,
            responseType: "arraybuffer"
        });

        const decodedBody = iconv.decode(response.data, "euc-kr");

        const $ = cheerio.load(decodedBody);
        const products = [];

        $("div.OECR_P_1").each((i, elem) => {
            const nameTag = $(elem).find("td.name a");
            const name = nameTag.text().trim();
            const link = nameTag.attr("href") ? "https://www.smtcom.co.kr" + nameTag.attr("href") : "";

            const imgTag = $(elem).find("div.ORB_P_img img");
            const image = imgTag.attr("src") ? "https://www.smtcom.co.kr" + imgTag.attr("src") : "";

            const spec = $(elem).find("div.ORB_product_spec td").text().trim();
            const cleanedSpec = cleanProductInfo(spec);

            const price = $(elem).find("span.OPP_price").text().trim().replace(/,/g, "");

            products.push({
                category: categoryName,
                subCategory: subCategoryName,
                name,
                link,
                image,
                spec: cleanedSpec,
                price
            });
        });

        allProducts = allProducts.concat(products); // 전체 결과 배열에 추가
        // console.log(`[${categoryName} - ${subCategoryName} / Cate1: ${cate1} / Cate2: ${cate2}] 검색 완료 (${products.length}개)`);
        return products.length > 0;

    } catch (error) {
        // console.error(`에러 발생 (카테고리: ${categoryName}, 서브카테고리: ${subCategoryName} / CMD: ${cmd}, Cate1: ${cate1}, Cate2: ${cate2}):`, error.message);
        return false;
    }
}

function cleanProductInfo(infoString) {
    let cleanedString = infoString.replace(/[\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
    const keyword = "상품정보";
    const keywordIndex = cleanedString.indexOf(keyword);

    if (keywordIndex !== -1) {
        cleanedString = cleanedString.substring(0, keywordIndex).trim();
    }

    const parts = cleanedString.split(' / ');
    const uniqueParts = [];
    const seen = new Set();

    for (const part of parts) {
        if (seen.has(part) && uniqueParts.length > 0) {
            break;
        }
        uniqueParts.push(part);
        seen.add(part);
    }

    return uniqueParts.join(' / ').trim();
}

async function startSearch() {
    // console.log("\n--- 상품 검색을 시작합니다 ---");

    const mainCategory = allCategoriesDetailMap[TARGET_MAIN_CATEGORY];

    if (!mainCategory) {
        console.error(`Error: "${TARGET_MAIN_CATEGORY}" main category not found. Please check TARGET_MAIN_CATEGORY variable.`);
        return;
    }

    const selectedCategory = mainCategory.find(cat => cat.name === TARGET_SUB_CATEGORY_NAME);

    if (!selectedCategory) {
        console.error(`Error: "${TARGET_SUB_CATEGORY_NAME}" sub-category not found in "${TARGET_MAIN_CATEGORY}". Please check TARGET_SUB_CATEGORY_NAME variable.`);
        // console.log(`Available sub-categories in "${TARGET_MAIN_CATEGORY}":`);
        // mainCategory.forEach(cat => console.log(`- ${cat.name}`));
        return;
    }

    // console.log(`\nSearching "${TARGET_MAIN_CATEGORY}" - "${selectedCategory.name}" for "${SEARCH_KEYWORD || 'all'}"...`);
    allProducts = [];
    let productsFoundTotal = 0; // 이 변수는 더 이상 사용되지 않지만, 로직 흐름 유지를 위해 남겨둡니다.

    if (selectedCategory.isGroup && selectedCategory.subCategories) {
        for (const subCat of selectedCategory.subCategories) {
            const effectiveCate1 = subCat.cate1 || selectedCategory.cate1;
            const found = await fetchAndSave(
                SEARCH_KEYWORD,
                effectiveCate1,
                subCat.cate2,
                listOrder,
                listNum,
                pageNum,
                TARGET_MAIN_CATEGORY,
                `${selectedCategory.name} - ${subCat.name}`
            );
            if (found) {
                productsFoundTotal++;
            }
        }
    } else {
        const found = await fetchAndSave(
            SEARCH_KEYWORD,
            selectedCategory.cate1,
            selectedCategory.cate2,
            listOrder,
            listNum,
            pageNum,
            TARGET_MAIN_CATEGORY,
            selectedCategory.name
        );
        if (found) {
            productsFoundTotal++;
        }
    }
    // console.log(`총 ${productsFoundTotal}개의 상품이 검색되었습니다.`);

    if (allProducts.length > 0) {
        console.log(JSON.stringify(allProducts, null, 4));
    } else {
        // 검색된 상품이 없거나 오류가 발생했을 때만 메시지 출력
        console.log(JSON.stringify([], null, 4)); // 빈 배열 출력 또는 특정 오류 메시지를 JSON으로 출력
    }
}

// 프로그램 시작
startSearch();