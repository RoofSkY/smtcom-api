const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

const categoryMap = {
    "주요구성": { cate1: "17", cate2: null },
    "모니터": { cate1: "1", cate2: null },
    "주변기기": { cate1: "94", cate2: null },
    "소프트웨어": { cate1: "1922", cate2: null },
    "개인방송장비": { cate1: "252", cate2: null }
};

const pcmainDetailMap = {
    "cpu": "18",
    "ram": "19",
    "메인보드": "20",
    "vga": "21",
    "ssd": "28",
    "hdd": "22",
    "odd": "23",
    "케이스": "24",
    "파워": "25",
    "쿨러": "1879",
    "조립비": "1843"
}

const monitorDetailMap = {
    "24인치": "1911",
    "27인치": "1912",
    "30인치": "1913",
    "144hz": "1914",
    "uhd": "1915",
    "주변기기": "2",
    "터치모니터": "2023"
};

const peripheralDetailMap = {
    "키보드": "1898",
    "마우스": "1899",
    "키보드/마우스": "1900",
    "마우스주변기기": "1978",
    "헤드셋": "1901",
    "스피커": "1902",
    "마우스패드": "1903",
    "공유기": "1904",
    "컨트롤러": "95",
    "외장하드": "97",
    "케이블": "98",
    "usb메모리": "99",
    "네트워크장비": "1957",
    "이어폰": "1960",
    "키보드용품": "1977",
    "기타상품": "1984",
    "미니pc": "2024"
};

const softwareDetailMap = {
    "운영체제": "1924",
    "오피스": "1925",
    "백신": "1926"
};

const broadcastDetailMap = {
    "마이크": "1909",
    "웹캠": "1905",
    "사운드카드": "1906",
    "캡쳐보드": "1907",
    "휴대폰주변기기": "1988",
    "네트워크장비": "255"
};

const searchWord = "5600"; // 검색어
const cate1 = "17"; // 주요구성 카테고리
const cate2 = "18"; // CPU 세부 카테고리 (예시로 CPU를 사용)
const listOrder = "C.pd_suggest desc,C.pd_sold desc"; // 정렬 기준
/*
인기상품순: C.pd_suggest desc,C.pd_sold desc
최신상품순: pd_date desc
낮은가격순: C.pd_sobija_price asc
높은가격순: C.pd_sobija_price desc
*/
const listNum = "10"; // 페이지당 표시할 상품 수
const pageNum = "1"; // 페이지 번호


fetchAndSave(searchWord, cate1, cate2, listOrder, listNum, pageNum);

async function fetchAndSave(cmd, cate1, cate2) {
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

            products.push({ name, link, image, spec: cleanedSpec, price }); // spec에 cleanedSpec을 사용하도록 수정
        });

        // 파일 저장 없이 JSON 텍스트로 콘솔 출력
        console.log(JSON.stringify(products, null, 4));
    } catch (error) {
        console.error("에러 발생:", error.message);
    }
}

function cleanProductInfo(infoString) {
    // 탭, 줄 바꿈 및 여러 개의 공백을 하나의 공백으로 줄이고, 문자열 양 끝 공백 제거
    let cleanedString = infoString.replace(/[\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();

    // "상품정보" 키워드 이후의 모든 내용을 제거
    const keyword = "상품정보";
    const keywordIndex = cleanedString.indexOf(keyword);

    if (keywordIndex !== -1) {
        cleanedString = cleanedString.substring(0, keywordIndex).trim();
    }

    // 최종적으로 중복되는 '/ ' 패턴으로 시작하는 부분 제거
    // 이는 'AMD / ... / AMD / ...' 와 같이 내용 자체가 반복될 경우를 처리
    const parts = cleanedString.split(' / ');
    const uniqueParts = [];
    const seen = new Set();

    for (const part of parts) {
        // 이미 본적이 있는 부분이고, 그 부분이 첫 번째 부분이 아니라면 (반복 시작으로 간주)
        if (seen.has(part) && uniqueParts.length > 0) {
            break;
        }
        uniqueParts.push(part);
        seen.add(part);
    }

    return uniqueParts.join(' / ').trim();
}