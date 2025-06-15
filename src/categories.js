// categories.js

// 모든 카테고리 상세 정보를 포함하는 단일 맵
// isGroup: true 인 경우, 해당 그룹 내 모든 하위 cate2들을 순서대로 검색
const ALL_CATEGORIES_DETAIL_MAP = {
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

module.exports = {
    ALL_CATEGORIES_DETAIL_MAP
};