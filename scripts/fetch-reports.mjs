import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const sources = {
  // === 거시경제·금융 ===
  "한국은행": {
    url: "https://www.bok.or.kr/portal/bbs/B0000232/list.do?menuNo=200761",
    selector: ".bd-line tbody tr",
    titleSel: "td.title a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.bok.or.kr"
  },
  "기획재정부 (그린북)": {
    url: "https://www.moef.go.kr/sn/economic/econEstimate",
    selector: ".type01 tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(1)",
    baseUrl: "https://www.moef.go.kr"
  },
  "금융위원회": {
    url: "https://www.fsc.go.kr/no010101",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
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
    selector: ".list-item, .research-item",
    titleSel: "a .tit, .tit, a",
    dateSel: ".date, .info",
    baseUrl: "https://www.kdi.re.kr"
  },
  "국회예산정책처": {
    url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp?bid=19",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.nabo.go.kr"
  },
  "한국금융연구원": {
    url: "https://www.kif.re.kr/kif3/publication/pub_list.aspx?menuid=12",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(3)",
    baseUrl: "https://www.kif.re.kr"
  },
  "자본시장연구원": {
    url: "https://www.kcmi.re.kr/publications/pub_list_01",
    selector: ".bbs_list li, table tbody tr",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.kcmi.re.kr"
  },

  // === 산업·기술 ===
  "산업통상자원부": {
    url: "https://www.motie.go.kr/motie/ne/presse/press1/bbs/bbsList.do?bbs_cd_n=16",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.motie.go.kr"
  },
  "산업연구원 (KIET)": {
    url: "https://www.kiet.re.kr/research/researchList",
    selector: ".list-item, .research-item, li",
    titleSel: ".tit a, a .tit, a",
    dateSel: ".date",
    baseUrl: "https://www.kiet.re.kr"
  },
  "과학기술정보통신부": {
    url: "https://www.msit.go.kr/bbs/list.do?sCode=user&mId=113&mPid=112",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.msit.go.kr"
  },
  "정보통신기획평가원 (IITP)": {
    url: "https://www.iitp.kr/kr/1/knowledge/publicationList.it",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.iitp.kr"
  },
  "소프트웨어정책연구소": {
    url: "https://spri.kr/posts?board=issue_reports",
    selector: ".post-item, .list-item, article",
    titleSel: "a .title, a",
    dateSel: ".date, time",
    baseUrl: "https://spri.kr"
  },

  // === 무역·통상 ===
  "KOTRA": {
    url: "https://dream.kotra.or.kr/kotranews/cms/news/actionKotraBoardList.do?MENU_ID=280",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://dream.kotra.or.kr"
  },
  "한국무역협회 (KITA)": {
    url: "https://www.kita.net/cmmrcInfo/cmmrcNews/cmmrcNews/cmmrcNewsList.do",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.kita.net"
  },
  "대외경제정책연구원 (KIEP)": {
    url: "https://www.kiep.go.kr/gallery.es?mid=a10101010000&bid=0001",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.kiep.go.kr"
  },
  "관세청": {
    url: "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2889&bbsId=1362",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.customs.go.kr"
  },

  // === 부동산·건설 ===
  "한국부동산원": {
    url: "https://www.reb.or.kr/r-one/na/ntt/selectNttList.do?mi=10629&bbsId=1028",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.reb.or.kr"
  },
  "국토교통부": {
    url: "https://www.molit.go.kr/USR/NEWS/m_71/lst.jsp",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.molit.go.kr"
  },
  "국토연구원": {
    url: "https://www.krihs.re.kr/publica/researchReportList.do",
    selector: ".bbs_list li, table tbody tr",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.krihs.re.kr"
  },

  // === 에너지·원자재 ===
  "한국석유공사 (KNOC)": {
    url: "https://www.knoc.co.kr/sub03/sub03_1_1.jsp",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:last-child",
    baseUrl: "https://www.knoc.co.kr"
  },
  "에너지경제연구원": {
    url: "https://www.keei.re.kr/keei/download/focus.html",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(3)",
    baseUrl: "https://www.keei.re.kr"
  },
  "한국전력거래소": {
    url: "https://www.kpx.or.kr/board.es?mid=a10206010000&bid=0033",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.kpx.or.kr"
  },
  "한국광물자원공사": {
    url: "https://www.kores.or.kr/views/cms/komine/un/un01/un0105.jsp",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:last-child",
    baseUrl: "https://www.kores.or.kr"
  },

  // === 섹터별 ===
  "식품의약품안전처": {
    url: "https://www.mfds.go.kr/brd/m_99/list.do",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(5)",
    baseUrl: "https://www.mfds.go.kr"
  },
  "건강보험심사평가원": {
    url: "https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020041000000",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.hira.or.kr"
  },
  "한국자동차연구원": {
    url: "https://www.katech.re.kr/board/board.do?menu_idx=95",
    selector: "table tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://www.katech.re.kr"
  },
  "한국해양수산개발원 (KMI)": {
    url: "https://www.kmi.re.kr/web/trebook/list.do?rbsIdx=322",
    selector: ".bbs_list li, table tbody tr",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.kmi.re.kr"
  },
  "한국농촌경제연구원": {
    url: "https://www.krei.re.kr/krei/researchReportList.do",
    selector: ".bbs_list li, table tbody tr",
    titleSel: "a",
    dateSel: ".date, td:last-child",
    baseUrl: "https://www.krei.re.kr"
  },

  // === 통계·데이터 ===
  "통계청 경제활동인구조사": {
    url: "https://kostat.go.kr/board.es?mid=a10301010000&bid=210",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
  "통계청 소비자물가": {
    url: "https://kostat.go.kr/board.es?mid=a10301020000&bid=211",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
  "통계청 산업활동동향": {
    url: "https://kostat.go.kr/board.es?mid=a10301060000&bid=215",
    selector: ".tb_list tbody tr",
    titleSel: "td a",
    dateSel: "td:nth-child(4)",
    baseUrl: "https://kostat.go.kr"
  },
  "공정거래위원회": {
    url: "https://www.ftc.go.kr/www/selectReportUserList.do?key=10",
    selector: ".tb_list tbody tr, table tbody tr",
    titleSel: "td a",
    dateSel: "td:last-child",
    baseUrl: "https://www.ftc.go.kr"
  },
};

async function scrapeWithPuppeteer(browser, name, config) {
  const page = await browser.newPage();
  
  try {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log(`  Loading: ${config.url.slice(0, 60)}...`);
    
    await page.goto(config.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 추가 대기 (동적 콘텐츠 로드)
    await page.waitForTimeout(2000);
    
    const html = await page.content();
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
            if (title && title.length > 5) break;
          }
        }
        
        // 날짜 찾기
        const dateSelectors = config.dateSel.split(',').map(s => s.trim());
        let date = '';
        
        for (const ds of dateSelectors) {
          const dateEl = $(el).find(ds).first();
          if (dateEl.length) {
            const rawDate = dateEl.text().trim();
            const dateMatch = rawDate.match(/\d{4}[.-]\d{2}[.-]\d{2}|\d{2}[.-]\d{2}[.-]\d{2}/);
            if (dateMatch) {
              date = dateMatch[0];
              break;
            }
          }
        }
        
        // URL 생성
        let url = href;
        if (href && !href.startsWith('http')) {
          if (href.startsWith('/')) {
            try {
              const base = new URL(config.baseUrl);
              url = base.origin + href;
            } catch {
              url = config.baseUrl + href;
            }
          } else if (href.startsWith('javascript:')) {
            url = config.url;
          } else {
            url = config.baseUrl + '/' + href;
          }
        }
        
        // 유효성 검사
        if (title && title.length > 5 && 
            !title.includes('등록된') && 
            !title.includes('없습니다') &&
            !title.includes('검색결과')) {
          items.push({ title, url: url || config.url, date });
        }
      });
      
      if (items.length > 0) break;
    }
    
    return items.slice(0, 3);
    
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  console.log("=".repeat(60));
  console.log("정부기관 보고서 수집 (Puppeteer)");
  console.log("시간:", new Date().toISOString());
  console.log("=".repeat(60));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });
  
  const results = {};
  let successCount = 0;
  let failCount = 0;
  
  try {
    for (const [name, config] of Object.entries(sources)) {
      console.log(`\n[${name}]`);
      
      const items = await scrapeWithPuppeteer(browser, name, config);
      results[name] = items;
      
      if (items.length > 0) {
        console.log(`  ✓ ${items.length}개 수집`);
        items.forEach((item, i) => {
          console.log(`    ${i+1}. ${item.title.slice(0, 50)}${item.title.length > 50 ? '...' : ''}`);
        });
        successCount++;
      } else {
        console.log(`  ✗ 수집 실패`);
        failCount++;
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  } finally {
    await browser.close();
  }
  
  // 결과 저장
  const output = {
    lastUpdated: new Date().toISOString(),
    reports: results
  };
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  const outputPath = path.join(publicDir, 'reports.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log("\n" + "=".repeat(60));
  console.log(`완료: 성공 ${successCount}개 / 실패 ${failCount}개`);
  console.log(`저장: ${outputPath}`);
  console.log("=".repeat(60));
}

main().catch(console.error);
