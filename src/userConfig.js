// userConfig.js

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
const LIST_ORDER = "C.pd_suggest desc,C.pd_sold desc";

// 페이지당 표시할 상품 수와 페이지 번호를 설정하세요.
const LIST_NUM = "10";
const PAGE_NUM = "1";
// --- 사용자 설정 변수 끝 ---

module.exports = {
    TARGET_MAIN_CATEGORY,
    TARGET_SUB_CATEGORY_NAME,
    SEARCH_KEYWORD,
    LIST_ORDER,
    LIST_NUM,
    PAGE_NUM
};