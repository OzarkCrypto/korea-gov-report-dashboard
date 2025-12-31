import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// ============================================
// 사이트별 설정
// ============================================

// Puppeteer 필요 없는 사이트 (일반 HTTP로 작동)
const staticSources = {
  "국회예산정책처": {
    url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp?bid=19",
    parseFunc: ($) => {
      const items = [];
      $('a.tit').each((i, el) => {
        if (i >= 3) return false;
        const title = $(el).attr('title') || $(el).text().trim();
        const href = $(el).attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.nabo.go.kr' + href;
        // 날짜는 부모 요소에서 찾기
        const dateText = $(el).closest('li, tr, .item').find('.date, .reg_date, time').text().trim();
        const dateMatch = dateText.match(/\d{4}[-./]\d{2}[-./]\d{2}/);
        items.push({ title, url, date: dateMatch ? dateMatch[0] : '' });
      });
      return items;
    }
  },
  "한국전력거래소": {
    url: "https://www.kpx.or.kr/board.es?mid=a10206010000&bid=0033",
    parseFunc: ($) => {
      const items = [];
      $('.board_list tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td a').first();
        const title = linkEl.text().trim().replace(/새글/g, '').trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.kpx.or.kr' + href;
        const date = $(el).find('td').eq(4).text().trim();
        if (title && title.length > 2) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
};

// Puppeteer 필요한 사이트 (JavaScript 렌더링)
const dynamicSources = {
  "한국은행": {
    url: "https://www.bok.or.kr/portal/bbs/P0000559/list.do?menuNo=200690",
    waitFor: ".bd-line",
    parseFunc: ($) => {
      const items = [];
      $('.bd-line tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td.title a, td.subject a, td a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.bok.or.kr' + href;
        const date = $(el).find('td').last().text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "한국개발연구원 (KDI)": {
    url: "https://www.kdi.re.kr/research/reportList",
    waitFor: ".list-item, .research-list",
    parseFunc: ($) => {
      const items = [];
      $('.list-item, .research-item, li.item').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('a').first();
        const title = $(el).find('.tit, .title, h3, h4').first().text().trim() || linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.kdi.re.kr' + href;
        const date = $(el).find('.date, .info .date, span.date').text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "통계청 경제활동인구조사": {
    url: "https://kostat.go.kr/board.es?mid=a10301010000&bid=210",
    waitFor: ".board_list, table",
    parseFunc: ($) => {
      const items = [];
      $('.board_list tbody tr, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://kostat.go.kr' + href;
        const date = $(el).find('td').eq(3).text().trim() || $(el).find('td').eq(2).text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "통계청 소비자물가": {
    url: "https://kostat.go.kr/board.es?mid=a10301020000&bid=211",
    waitFor: ".board_list, table",
    parseFunc: ($) => {
      const items = [];
      $('.board_list tbody tr, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://kostat.go.kr' + href;
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "통계청 산업활동동향": {
    url: "https://kostat.go.kr/board.es?mid=a10301060000&bid=215",
    waitFor: ".board_list, table",
    parseFunc: ($) => {
      const items = [];
      $('.board_list tbody tr, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://kostat.go.kr' + href;
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "금융감독원": {
    url: "https://www.fss.or.kr/fss/bbs/B0000188/list.do?menuNo=200218",
    waitFor: ".bd-line, table",
    parseFunc: ($) => {
      const items = [];
      $('.bd-line tbody tr, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('td.title a, td a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.fss.or.kr' + href;
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "대외경제정책연구원 (KIEP)": {
    url: "https://www.kiep.go.kr/gallery.es?mid=a10101010000&bid=0001",
    waitFor: ".bd-list, .gallery-list, table",
    parseFunc: ($) => {
      const items = [];
      $('.bd-list li, .gallery-list li, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('a').first();
        const title = $(el).find('.tit, .title, h3').text().trim() || linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.kiep.go.kr' + href;
        const date = $(el).find('.date, .info').text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "한국금융연구원": {
    url: "https://www.kif.re.kr/kif3/publication/pub_list.aspx?menuid=12",
    waitFor: "table, .list",
    parseFunc: ($) => {
      const items = [];
      $('table tbody tr, .list-item').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('a').first();
        const title = linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.kif.re.kr' + href;
        const date = $(el).find('td').last().text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "산업연구원 (KIET)": {
    url: "https://www.kiet.re.kr/research/researchList",
    waitFor: ".list-item, .research-list",
    parseFunc: ($) => {
      const items = [];
      $('.list-item, .research-item, li').each((i, el) => {
        if (i >= 3) return false;
        const linkEl = $(el).find('a').first();
        const title = $(el).find('.tit, .title').text().trim() || linkEl.text().trim();
        const href = linkEl.attr('href') || '';
        const url = href.startsWith('http') ? href : 'https://www.kiet.re.kr' + href;
        const date = $(el).find('.date').text().trim();
        if (title && title.length > 3) {
          items.push({ title, url, date });
        }
      });
      return items;
    }
  },
  "에너지경제연구원": {
    url: "https://www.keei.re.kr/main.nsf/index.html",
    waitFor: "body",
    parseFunc: ($) => {
      const items = [];
      $('a').each((i, el) => {
        if (items.length >= 3) return false;
        const title = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (title.length > 10 && (title.includes('에너지') || title.includes('보고서'))) {
          const url = href.startsWith('http') ? href : 'https://www.keei.re.kr' + href;
          items.push({ title, url, date: '' });
        }
      });
      return items;
    }
  },
};

// ============================================
// 크롤링 함수
// ============================================

async function fetchStatic(name, config) {
  try {
    const response = await fetch(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    return config.parseFunc($);
  } catch (error) {
    console.error(`  Error (static): ${error.message}`);
    return [];
  }
}

async function fetchDynamic(browser, name, config) {
  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto(config.url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // 추가 대기
    try {
      await page.waitForSelector(config.waitFor, { timeout: 10000 });
    } catch (e) {
      // 셀렉터 못 찾아도 계속 진행
    }
    
    // 약간의 추가 대기 (동적 콘텐츠 로드)
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    return config.parseFunc($);
  } catch (error) {
    console.error(`  Error (dynamic): ${error.message}`);
    return [];
  } finally {
    if (page) await page.close();
  }
}

// ============================================
// 메인
// ============================================

async function main() {
  console.log("=".repeat(60));
  console.log("정부기관 보고서 수집 (Puppeteer 버전)");
  console.log("시간:", new Date().toISOString());
  console.log("=".repeat(60));
  
  const results = {};
  let successCount = 0;
  
  // 1. Static 사이트 먼저 처리
  console.log("\n[Static 사이트 처리]");
  for (const [name, config] of Object.entries(staticSources)) {
    console.log(`\n${name}`);
    console.log(`  URL: ${config.url.slice(0, 50)}...`);
    
    const items = await fetchStatic(name, config);
    results[name] = items;
    
    if (items.length > 0) {
      console.log(`  ✓ ${items.length}개 수집`);
      items.forEach((item, i) => console.log(`    ${i+1}. ${item.title.slice(0, 40)}...`));
      successCount++;
    } else {
      console.log(`  ✗ 실패`);
    }
  }
  
  // 2. Dynamic 사이트 처리 (Puppeteer)
  console.log("\n[Dynamic 사이트 처리 - Puppeteer]");
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });
  
  try {
    for (const [name, config] of Object.entries(dynamicSources)) {
      console.log(`\n${name}`);
      console.log(`  URL: ${config.url.slice(0, 50)}...`);
      
      const items = await fetchDynamic(browser, name, config);
      results[name] = items;
      
      if (items.length > 0) {
        console.log(`  ✓ ${items.length}개 수집`);
        items.forEach((item, i) => console.log(`    ${i+1}. ${item.title.slice(0, 40)}...`));
        successCount++;
      } else {
        console.log(`  ✗ 실패`);
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }
  } finally {
    await browser.close();
  }
  
  // 3. 결과 저장
  const output = {
    lastUpdated: new Date().toISOString(),
    reports: results
  };
  
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(publicDir, 'reports.json'), 
    JSON.stringify(output, null, 2),
    'utf-8'
  );
  
  const totalSources = Object.keys(staticSources).length + Object.keys(dynamicSources).length;
  console.log("\n" + "=".repeat(60));
  console.log(`완료: ${successCount}/${totalSources} 성공`);
  console.log("=".repeat(60));
}

main().catch(console.error);
