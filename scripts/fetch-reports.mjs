import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  timeout: 10000,
});

// 기관별 데이터 소스 정의
const sources = {
  // 거시경제·금융
  "한국은행": {
    type: "rss",
    url: "https://www.bok.or.kr/portal/bbs/B0000232/rss.do?menuNo=200761"
  },
  "기획재정부 (그린북)": {
    type: "scrape",
    url: "https://www.moef.go.kr/sn/economic/econEstimate",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td.title a, td:nth-child(2) a").text().trim(),
      url: "https://www.moef.go.kr" + ($(el).find("td.title a, td:nth-child(2) a").attr("href") || ""),
      date: $(el).find("td:last-child, td.date").text().trim()
    })
  },
  "금융위원회": {
    type: "rss",
    url: "https://www.fsc.go.kr/rss/no010101.do"
  },
  "금융감독원": {
    type: "scrape",
    url: "https://www.fss.or.kr/fss/kr/promo/bodobbs_list.jsp?id=PR0301",
    selector: "#content table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td.title a, td a").first().text().trim(),
      url: "https://www.fss.or.kr" + ($(el).find("td.title a, td a").first().attr("href") || ""),
      date: $(el).find("td").last().text().trim()
    })
  },
  "한국개발연구원 (KDI)": {
    type: "scrape",
    url: "https://www.kdi.re.kr/research/reportList",
    selector: ".research_list li, .list_wrap li",
    parseItem: ($, el) => ({
      title: $(el).find("a .tit, .title, a").first().text().trim(),
      url: "https://www.kdi.re.kr" + ($(el).find("a").first().attr("href") || ""),
      date: $(el).find(".date, .info span").first().text().trim()
    })
  },
  "국회예산정책처": {
    type: "scrape",
    url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp",
    selector: ".board_list tbody tr, table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.nabo.go.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").eq(-1).text().trim()
    })
  },

  // 산업·기술
  "산업통상자원부": {
    type: "rss",
    url: "https://www.motie.go.kr/motie/rss/ne/presse/press1.do"
  },
  "산업연구원 (KIET)": {
    type: "scrape",
    url: "https://www.kiet.re.kr/research/researchList",
    selector: ".research_list li, .list_area li",
    parseItem: ($, el) => ({
      title: $(el).find(".tit, a").first().text().trim(),
      url: "https://www.kiet.re.kr" + ($(el).find("a").first().attr("href") || ""),
      date: $(el).find(".date, .info").first().text().trim()
    })
  },
  "과학기술정보통신부": {
    type: "rss", 
    url: "https://www.msit.go.kr/rss/bbs_113.do"
  },
  "정보통신기획평가원 (IITP)": {
    type: "scrape",
    url: "https://www.iitp.kr/kr/1/knowledge/publicationList.it",
    selector: ".board_list tbody tr, table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a, .title a").first().text().trim(),
      url: ($(el).find("td a, .title a").first().attr("href") || "").startsWith("http") 
        ? $(el).find("td a").first().attr("href") 
        : "https://www.iitp.kr" + $(el).find("td a").first().attr("href"),
      date: $(el).find("td").eq(-1).text().trim()
    })
  },

  // 무역·통상
  "KOTRA": {
    type: "rss",
    url: "https://dream.kotra.or.kr/kotranews/rss/news.do"
  },
  "한국무역협회 (KITA)": {
    type: "scrape",
    url: "https://www.kita.net/cmmrcInfo/cmmrcNews/cmmrcNews/cmmrcNewsList.do",
    selector: ".board_list tbody tr, .list_area li",
    parseItem: ($, el) => ({
      title: $(el).find("td a, .tit a").first().text().trim(),
      url: "https://www.kita.net" + ($(el).find("td a, .tit a").first().attr("href") || ""),
      date: $(el).find("td.date, .date").first().text().trim()
    })
  },
  "관세청": {
    type: "scrape",
    url: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2889&bbsId=1362",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.customs.go.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").eq(-2).text().trim()
    })
  },

  // 부동산·건설
  "한국부동산원": {
    type: "scrape",
    url: "https://www.reb.or.kr/r-one/portal/stat/pstatsList.do",
    selector: ".board_list tbody tr, table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.reb.or.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").last().text().trim()
    })
  },
  "국토교통부": {
    type: "rss",
    url: "https://www.molit.go.kr/rss/USR/NEWS/m_71.do"
  },

  // 에너지·원자재
  "한국석유공사 (KNOC)": {
    type: "scrape",
    url: "https://www.knoc.co.kr/sub03/sub03_1_1.jsp",
    selector: ".board_list tbody tr, table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.knoc.co.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").last().text().trim()
    })
  },
  "에너지경제연구원": {
    type: "scrape",
    url: "https://www.keei.re.kr/main.nsf/index.html?open&p=issue&s=list",
    selector: ".board_list li, .list_area li",
    parseItem: ($, el) => ({
      title: $(el).find("a").first().text().trim(),
      url: "https://www.keei.re.kr" + ($(el).find("a").first().attr("href") || ""),
      date: $(el).find(".date").first().text().trim()
    })
  },
  "한국전력거래소": {
    type: "scrape",
    url: "https://www.kpx.or.kr/menu.es?mid=a10206010000",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.kpx.or.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").last().text().trim()
    })
  },

  // 섹터별
  "식품의약품안전처": {
    type: "rss",
    url: "https://www.mfds.go.kr/rss/brd_m_99.do"
  },
  "한국자동차연구원": {
    type: "scrape",
    url: "https://www.katech.re.kr/pub/reportList",
    selector: ".board_list tbody tr, table tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://www.katech.re.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").last().text().trim()
    })
  },

  // 통계·데이터
  "통계청 경제활동인구조사": {
    type: "scrape",
    url: "https://kostat.go.kr/board.es?mid=a10301010000&bid=210",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://kostat.go.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").eq(-2).text().trim()
    })
  },
  "통계청 소비자물가": {
    type: "scrape", 
    url: "https://kostat.go.kr/board.es?mid=a10301020000&bid=211",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://kostat.go.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").eq(-2).text().trim()
    })
  },
  "통계청 산업활동동향": {
    type: "scrape",
    url: "https://kostat.go.kr/board.es?mid=a10301060000&bid=215",
    selector: ".board_list tbody tr",
    parseItem: ($, el) => ({
      title: $(el).find("td a").first().text().trim(),
      url: "https://kostat.go.kr" + ($(el).find("td a").first().attr("href") || ""),
      date: $(el).find("td").eq(-2).text().trim()
    })
  },
};

async function fetchRSS(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.slice(0, 3).map(item => ({
      title: item.title || "",
      url: item.link || "",
      date: item.pubDate ? new Date(item.pubDate).toLocaleDateString('ko-KR') : ""
    }));
  } catch (error) {
    console.error(`RSS fetch error for ${url}:`, error.message);
    return [];
  }
}

async function fetchScrape(config) {
  try {
    const response = await fetch(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      },
      timeout: 10000,
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const items = [];
    $(config.selector).each((i, el) => {
      if (i >= 3) return false;
      const item = config.parseItem($, el);
      if (item.title && item.title.length > 0) {
        items.push(item);
      }
    });
    
    return items;
  } catch (error) {
    console.error(`Scrape error for ${config.url}:`, error.message);
    return [];
  }
}

async function fetchAllReports() {
  const results = {};
  const entries = Object.entries(sources);
  
  console.log(`Fetching reports from ${entries.length} sources...`);
  
  for (const [name, config] of entries) {
    console.log(`Fetching: ${name}`);
    
    try {
      if (config.type === "rss") {
        results[name] = await fetchRSS(config.url);
      } else {
        results[name] = await fetchScrape(config);
      }
      
      console.log(`  ✓ ${results[name].length} items`);
    } catch (error) {
      console.error(`  ✗ Error: ${error.message}`);
      results[name] = [];
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function main() {
  console.log("Starting report fetch...");
  console.log("Time:", new Date().toISOString());
  
  const reports = await fetchAllReports();
  
  const output = {
    lastUpdated: new Date().toISOString(),
    reports: reports
  };
  
  // Save to public folder
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const outputPath = path.join(publicDir, 'reports.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log(`\nSaved to ${outputPath}`);
  console.log(`Total sources: ${Object.keys(reports).length}`);
  
  const successCount = Object.values(reports).filter(r => r.length > 0).length;
  console.log(`Successful: ${successCount}`);
}

main().catch(console.error);
