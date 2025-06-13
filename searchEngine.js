const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const fs = require("fs");
const readline = require("readline");

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
    "uhd": "1915"
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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("검색어 입력: ", (cmd) => {
    rl.question("카테고리 입력 (주요구성, 모니터, 주변기기, 소프트웨어 등): ", (categoryInput) => {
        const categoryKey = categoryInput.toLowerCase();
        const category = categoryMap[categoryKey];

        if (!category) {
            console.log("유효하지 않은 카테고리입니다.");
            rl.close();
            return;
        }

        let cate1 = category.cate1;
        let cate2 = category.cate2;

        if (categoryKey === "주요구성") {
            rl.question("PC주요구성 세부 카테고리 입력 (cpu, ram, 메인보드, vga, ssd, hdd, odd, 케이스, 파워, 쿨러, 조립비): ", (detailInput) => {
                const detailKey = detailInput.toLowerCase();
                const detailCate2 = pcmainDetailMap[detailKey];
                if (!detailCate2) {
                    console.log("유효하지 않은 PC주요구성 세부 카테고리입니다.");
                    rl.close();
                    return;
                }
                cate2 = detailCate2;
                fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
            });
        } else if (categoryKey === "모니터") {
            rl.question("모니터 세부 카테고리 입력 (24인치, 27인치, 30인치, 144hz, uhd): ", (monitorInput) => {
                const monitorKey = monitorInput.toLowerCase();
                const detailCate2 = monitorDetailMap[monitorKey];
                if (!detailCate2) {
                    console.log("유효하지 않은 모니터 세부 카테고리입니다.");
                    rl.close();
                    return;
                }
                cate2 = detailCate2;
                fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
            });
        } else if (categoryKey === "주변기기") {
            rl.question("주변기기 세부 카테고리 입력 (키보드, 마우스, 키보드/마우스, 마우스주변기기, 헤드셋, 스피커, 마우스패드, 공유기, 컨트롤러, 외장하드, 케이블, usb메모리, 네트워크장비, 이어폰, 키보드용품, 기타상품, 미니pc): ", (peripheralInput) => {
                const peripheralKey = peripheralInput.toLowerCase();
                const detailCate2 = peripheralDetailMap[peripheralKey];
                if (!detailCate2) {
                    console.log("유효하지 않은 주변기기 세부 카테고리입니다.");
                    rl.close();
                    return;
                }
                cate2 = detailCate2;
                fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
            });
        } else if (categoryKey === "소프트웨어") {
            rl.question("소프트웨어 세부 카테고리 입력 (운영체제, 오피스, 백신): ", (softwareInput) => {
                const softwareKey = softwareInput.toLowerCase();
                const detailCate2 = softwareDetailMap[softwareKey];
                if (!detailCate2) {
                    console.log("유효하지 않은 소프트웨어 세부 카테고리입니다.");
                    rl.close();
                    return;
                }
                cate2 = detailCate2;
                fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
            });
        } else if (categoryKey === "개인방송장비") {
            rl.question("개인방송장비 세부 카테고리 입력 (마이크, 웹캠, 사운드카드, 캡쳐보드, 휴대폰주변기기, 네트워크장비): ", (broadcastInput) => {
                const broadcastKey = broadcastInput.trim();
                const detailCate2 = broadcastDetailMap[broadcastKey];
                if (!detailCate2) {
                    console.log("유효하지 않은 개인방송장비 세부 카테고리입니다.");
                    rl.close();
                    return;
                }
                cate2 = detailCate2;
                fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
            });
        } else {
            fetchAndSave(cmd, cate1, cate2).then(() => rl.close());
        }
    });
});

async function fetchAndSave(cmd, cate1, cate2) {
    console.log(`${cmd} / cate1: ${cate1}, cate2: ${cate2}에 대한 검색결과 조회 중...`);

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
        "page": "1",
        "list_order": "C.pd_suggest desc,C.pd_sold desc",
        "se_type": "",
        "list_num": "100",
        "view_no": "Y"
    });

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": "https://www.smtcom.co.kr",
        "Referer": "https://www.smtcom.co.kr/skin/shop/basic/estimate_search_new_top2.php",
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "ko,en-US;q=0.9,en;q=0.8"
    };

    try {
        const response = await axios.post(url, payload.toString(), {
            headers,
            responseType: "arraybuffer"
        });

        const decodedBody = iconv.decode(response.data, "euc-kr");
        fs.writeFileSync("results/estimate_result.html", decodedBody, "utf-8");

        const $ = cheerio.load(decodedBody);
        const products = [];

        $("div.OECR_P_1").each((i, elem) => {
            const nameTag = $(elem).find("td.name a");
            const name = nameTag.text().trim();
            const link = nameTag.attr("href") ? "https://www.smtcom.co.kr" + nameTag.attr("href") : "";

            const imgTag = $(elem).find("div.ORB_P_img img");
            const image = imgTag.attr("src") ? "https://www.smtcom.co.kr" + imgTag.attr("src") : "";

            const spec = $(elem).find("div.ORB_product_spec td").text().trim();
            const price = $(elem).find("span.OPP_price").text().trim().replace(/,/g, "");

            products.push({ name, link, image, spec, price });
        });

        fs.writeFileSync("results/products.json", JSON.stringify(products, null, 4), "utf-8");
        console.log("총 추출된 상품 개수:", products.length);
    } catch (error) {
        console.error("에러 발생:", error.message);
    }
}
