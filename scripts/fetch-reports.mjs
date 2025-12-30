import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const sources = {
  "한국은행": {
    url: "https://www.bok.or.kr/portal/bbs/B0000232/list.do?menuNo=200761",
    selector: ".bd-line tbody tr",
    titleSel: "td.title a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.bok.or.kr"
  },
  "기획재정부 (그린북)": {
    url: "https://www.moef.go.kr/sn/economic/econEstimate",
    selector: ".boardList tbody tr",
    titleSel: "td.title a, td a.title",
    dateSel: "td.date, td:nth-child(4)",
    baseUrl: "https://www.moef.go.kr"
  },
  "금융위원회": {
    url: "https://www.fsc.go.kr/no010101",
    selector: ".board_list tbody tr, .tb_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td.date, td:last-child",
    baseUrl: "https://www.fsc.go.kr"
  },
  "금융감독원": {
    url: "https://www.fss.or.kr/fss/bbs/B0000188/list.do?menuNo=200218",
    selector: ".bd-line tbody tr",
    titleSel: "td.title a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.fss.or.kr"
  },
  "한국개발연구원 (KDI)": {
    url: "https://www.kdi.re.kr/research/reportList",
    selector: ".board_list li, .research-list li, .list-item",
    titleSel: "a .tit, .title a, a",
    dateSel: ".date, .info .date",
    baseUrl: "https://www.kdi.re.kr"
  },
  "국회예산정책처": {
    url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp?bid=19",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp"
  },
  "한국금융연구원": {
    url: "https://www.kif.re.kr/kif3/publication/pub_list.aspx?menuid=12",
    selector: ".board_list tbody tr, .list-body li",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.kif.re.kr"
  },
  "산업통상자원부": {
    url: "https://www.motie.go.kr/motie/ne/presse/press1/bbs/bbsList.do?bbs_cd_n=16",
    selector: ".board_list tbody tr",
    titleSel: "td.title a",
    dateSel: "td.date",
    baseUrl: "https://www.motie.go.kr"
  },
  "산업연구원 (KIET)": {
    url: "https://www.kiet.re.kr/research/researchList",
    selector: ".research_list li, .list-wrap li",
    titleSel: ".tit a, a",
    dateSel: ".date",
    baseUrl: "https://www.kiet.re.kr"
  },
  "과학기술정보통신부": {
    url: "https://www.msit.go.kr/bbs/list.do?sCode=user&mId=113&mPid=112",
    selector: ".board_list tbody tr",
    titleSel: "td.title a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.msit.go.kr"
  },
  "정보통신기획평가원 (IITP)": {
    url: "https://www.iitp.kr/kr/1/knowledge/publicationList.it?searchClassCode=CT01",
    selector: ".board_list tbody tr, table tbody tr",
    titleSel: "td a, .title a",
    dateSel: "td:last-child",
    baseUrl: "https://www.iitp.kr"
  },
  "KOTRA": {
    url: "https://dream.kotra.or.kr/kotranews/cms/news/actionKotraBoardList.do?MENU_ID=280",
    selector: ".board-list tbody tr, .news-list li",
    titleSel: "td a, .tit a",
    dateSel: ".date, td:nth-child(4)",
    baseUrl: "https://dream.kotra.or.kr"
  },
  "한국무역협회 (KITA)": {
    url: "https://www.kita.net/cmmrcInfo/cmmrcNews/cmmrcNews/cmmrcNewsList.do",
    selector: ".board_list tbody tr, .news-list li",
    titleSel: "td a, .tit a",
    dateSel: ".date, td.date",
    baseUrl: "https://www.kita.net"
  },
  "대외경제정책연구원 (KIEP)": {
    url: "https://www.kiep.go.kr/gallery.es?mid=a10101010000&bid=0001",
    selector: ".bd-list li, table tbody tr",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.kiep.go.kr"
  },
  "관세청": {
    url: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2889&bbsId=1362",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td.date, td:nth-child(5)",
    baseUrl: "https://www.customs.go.kr"
  },
  "한국부동산원": {
    url: "https://www.reb.or.kr/r-one/na/ntt/selectNttList.do?mi=10629&bbsId=1028",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td.date, td:nth-child(5)",
    baseUrl: "https://www.reb.or.kr"
  },
  "국토교통부": {
    url: "https://www.molit.go.kr/USR/NEWS/m_71/lst.jsp",
    selector: ".board_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.molit.go.kr"
  },
  "한국전력거래소": {
    url: "https://www.kpx.or.kr/board.es?mid=a10206010000&bid=0033",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td.date, td:nth-child(5)",
    baseUrl: "https://www.kpx.or.kr"
  },
  "식품의약품안전처": {
    url: "https://www.mfds.go.kr/brd/m_99/list.do",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.mfds.go.kr"
  },
  "건강보험심사평가원": {
    url: "https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020041000000",
    selector: ".board_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.hira.or.kr"
  },
  "통계청 경제활동인구조사": {
    url: "https://kostat.go.kr/board.es?mid=a10301010000&bid=210",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
  "통계청 소비자물가": {
    url: "https://kostat.go.kr/board.es?mid=a10301020000&bid=211",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
  "통계청 산업활동동향": {
    url: "https://kostat.go.kr/board.es?mid=a10301060000&bid=215",
    selector: ".board_list tbody tr",
    titleSel: "td.title a, td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
};

async function fetchWithRetry(url, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (i === retries) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

async function scrapeSource(name, config) {
  try {
    console.log(`  Fetching: ${config.url.slice(0, 60)}...`);
    const html = await fetchWithRetry(config.url);
    const $ = cheerio.load(html);
    
    const items = [];
    const selectors = config.selector.split(',').map(s => s.trim());
    
    for (const selector of selectors) {
      $(selector).each((i, el) => {
        if (items.length >= 3) return false;
        
        const titleSelectors = config.titleSel.split(',').map(s => s.trim());
        let title = '';
        let href = '';
        
        for (const ts of titleSelectors) {
          const titleEl = $(el).find(ts).first();
          if (titleEl.length) {
            title = titleEl.text().trim().replace(/\s+/g, ' ');
            href = titleEl.attr('href') || '';
            if (title && title.length > 3) break;
          }
        }
        
        const dateSelectors = config.dateSel.split(',').map(s => s.trim());
        let date = '';
        
        for (const ds of dateSelectors) {
          const dateEl = $(el).find(ds).first();
          if (dateEl.length) {
            date = dateEl.text().trim();
            const dateMatch = date.match(/\d{4}[.-]\d{2}[.-]\d{2}|\d{2}[.-]\d{2}[.-]\d{2}/);
            if (dateMatch) {
              date = dateMatch[0];
              break;
            }
          }
        }
        
        let url = href;
        if (href && !href.startsWith('http')) {
          if (href.startsWith('/')) {
            const base = new URL(config.baseUrl);
            url = base.origin + href;
          } else {
            url = config.baseUrl + '/' + href;
          }
        }
        
        if (title && title.length > 3 && !title.includes('등록된') && !title.includes('없습니다')) {
          items.push({ title, url: url || config.url, date });
        }
      });
      
      if (items.length > 0) break;
    }
    
    return items.slice(0, 3);
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("정부기관 보고서 수집");
  console.log("시간:", new Date().toISOString());
  console.log("=".repeat(50));
  
  const results = {};
  let successCount = 0;
  
  for (const [name, config] of Object.entries(sources)) {
    console.log(`\n[${name}]`);
    
    const items = await scrapeSource(name, config);
    results[name] = items;
    
    if (items.length > 0) {
      console.log(`  ✓ ${items.length}개 수집`);
      successCount++;
    } else {
      console.log(`  ✗ 실패`);
    }
    
    await new Promise(r => setTimeout(r, 800));
  }
  
  const output = {
    lastUpdated: new Date().toISOString(),
    reports: results
  };
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'reports.json'), JSON.stringify(output, null, 2));
  
  console.log("\n" + "=".repeat(50));
  console.log(`완료: ${successCount}/${Object.keys(sources).length} 성공`);
}

main().catch(console.error);
