// scraper.js
const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

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

        allProducts = allProducts.concat(products);
        return products.length > 0;

    } catch (error) {
        // 에러 로그는 여전히 필요할 수 있어 주석 처리로 남겨둡니다. 필요하면 주석을 해제하세요.
        // console.error(`Error occurred while fetching (Category: ${categoryName}, Sub-category: ${subCategoryName} / CMD: ${cmd}, Cate1: ${cate1}, Cate2: ${cate2}):`, error.message);
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

// 외부에서 allProducts를 가져갈 수 있도록 getter 함수 추가
function getAllProducts() {
    return allProducts;
}

// allProducts를 재설정하는 함수 (새로운 검색 전에 초기화 목적)
function resetAllProducts() {
    allProducts = [];
}

module.exports = {
    fetchAndSave,
    getAllProducts,
    resetAllProducts
};