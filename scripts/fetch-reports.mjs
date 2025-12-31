import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

// === 정적 HTML 사이트 (Puppeteer 불필요) ===
const staticSources = {
  "국회예산정책처": {
    url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp?bid=19",
    parse: ($) => {
      const items = [];
      $('a.tit').each((i, el) => {
        if (i >= 3) return false;
        const title = $(el).attr('title') || $(el).text().trim();
        const href = $(el).attr('href');
        const url = href ? 'https://www.nabo.go.kr' + href : '';
        items.push({ title, url, date: '' });
      });
      return items;
    }
  },
  "한국전력거래소": {
    url: "https://www.kpx.or.kr/board.es?mid=a10206010000&bid=0033",
    parse: ($) => {
      const items = [];
      $('a[href*="act=view"]').each((i, el) => {
        if (i >= 3) return false;
        const title = $(el).text().trim().replace(/새글/g, '').trim();
        const href = $(el).attr('href');
        const url = href ? 'https://www.kpx.or.kr' + href : '';
        if (title.length > 3) {
          items.push({ title, url, date: '' });
        }
      });
      return items;
    }
  }
};

// === JavaScript 렌더링 필요한 사이트 ===
const dynamicSources = {
  "한국은행": {
    url: "https://www.bok.or.kr/portal/bbs/B0000232/list.do?menuNo=200761",
    waitFor: ".bd-line tbody tr",
    parse: ($) => {
      const items = [];
      $('.bd-line tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('td.title a, td a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('td').eq(4).text().trim();
        if (title && title.length > 3) {
          items.push({ 
            title, 
            url: href?.startsWith('http') ? href : 'https://www.bok.or.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "한국개발연구원 (KDI)": {
    url: "https://www.kdi.re.kr/research/reportList",
    waitFor: ".research-list li, .board_list li, .list-wrap li",
    parse: ($) => {
      const items = [];
      $('.research-list li, .board_list li, .list-wrap li, .bbs-list li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('a').first();
        const title = titleEl.find('.tit, .title').text().trim() || titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('.date, .info .date').first().text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://www.kdi.re.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "금융감독원": {
    url: "https://www.fss.or.kr/fss/bbs/B0000188/list.do?menuNo=200218",
    waitFor: ".bd-line tbody tr",
    parse: ($) => {
      const items = [];
      $('.bd-line tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('td.title a, td a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 3) {
          items.push({ 
            title, 
            url: href?.startsWith('http') ? href : 'https://www.fss.or.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "통계청 경제활동인구조사": {
    url: "https://kostat.go.kr/board.es?mid=a10301010000&bid=210",
    waitFor: ".board_list tbody tr, .bbs-list li",
    parse: ($) => {
      const items = [];
      $('.board_list tbody tr, .bbs-list li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('td a, a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://kostat.go.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "통계청 소비자물가": {
    url: "https://kostat.go.kr/board.es?mid=a10301020000&bid=211",
    waitFor: ".board_list tbody tr, .bbs-list li",
    parse: ($) => {
      const items = [];
      $('.board_list tbody tr, .bbs-list li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('td a, a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('td').eq(3).text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://kostat.go.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "대외경제정책연구원 (KIEP)": {
    url: "https://www.kiep.go.kr/gallery.es?mid=a10101010000&bid=0001",
    waitFor: ".bd-list li, .board_list li",
    parse: ($) => {
      const items = [];
      $('.bd-list li, .board_list li, .bbs-list li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('.date').first().text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://www.kiep.go.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "산업연구원 (KIET)": {
    url: "https://www.kiet.re.kr/research/reportList",
    waitFor: ".research-list li, .list-wrap li",
    parse: ($) => {
      const items = [];
      $('.research-list li, .list-wrap li, .board_list li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('a').first();
        const title = titleEl.find('.tit').text().trim() || titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('.date').first().text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://www.kiet.re.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "한국금융연구원": {
    url: "https://www.kif.re.kr/kif3/publication/pub_list.aspx?menuid=12",
    waitFor: ".board_list tbody tr, .list-body li",
    parse: ($) => {
      const items = [];
      $('.board_list tbody tr, .list-body li, table tbody tr').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('.date, td:last-child').first().text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://www.kif.re.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  },
  "자본시장연구원": {
    url: "https://www.kcmi.re.kr/publications/pub_list_01",
    waitFor: ".board_list li, .pub-list li",
    parse: ($) => {
      const items = [];
      $('.board_list li, .pub-list li, .list-wrap li').each((i, el) => {
        if (i >= 3) return false;
        const titleEl = $(el).find('a').first();
        const title = titleEl.text().trim();
        const href = titleEl.attr('href');
        const date = $(el).find('.date').first().text().trim();
        if (title && title.length > 5) {
          items.push({ 
            title: title.slice(0, 100), 
            url: href?.startsWith('http') ? href : 'https://www.kcmi.re.kr' + (href || ''),
            date 
          });
        }
      });
      return items;
    }
  }
};

// 정적 사이트 fetch
async function fetchStatic(name, config) {
  try {
    const response = await fetch(config.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    return config.parse($);
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  }
}

// 동적 사이트 fetch (Puppeteer)
async function fetchDynamic(browser, name, config) {
  let page;
  try {
    page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 요소 대기
    try {
      await page.waitForSelector(config.waitFor, { timeout: 10000 });
    } catch (e) {
      // 셀렉터 못찾아도 계속 진행
    }
    
    // 추가 대기
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.content();
    const $ = cheerio.load(html);
    return config.parse($);
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    return [];
  } finally {
    if (page) await page.close();
  }
}

async function main() {
  console.log("=".repeat(50));
  console.log("정부기관 보고서 수집 (Puppeteer)");
  console.log("시간:", new Date().toISOString());
  console.log("=".repeat(50));
  
  const results = {};
  
  // 1. 정적 사이트 먼저 처리
  console.log("\n[정적 사이트 크롤링]");
  for (const [name, config] of Object.entries(staticSources)) {
    console.log(`\n${name}`);
    const items = await fetchStatic(name, config);
    results[name] = items;
    console.log(`  → ${items.length}개 수집`);
  }
  
  // 2. 동적 사이트 (Puppeteer)
  console.log("\n[동적 사이트 크롤링 - Puppeteer]");
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    for (const [name, config] of Object.entries(dynamicSources)) {
      console.log(`\n${name}`);
      const items = await fetchDynamic(browser, name, config);
      results[name] = items;
      console.log(`  → ${items.length}개 수집`);
      
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
  
  fs.writeFileSync(path.join(publicDir, 'reports.json'), JSON.stringify(output, null, 2));
  
  const successCount = Object.values(results).filter(r => r.length > 0).length;
  const totalCount = Object.keys(results).length;
  
  console.log("\n" + "=".repeat(50));
  console.log(`완료: ${successCount}/${totalCount} 성공`);
  console.log("=".repeat(50));
}

main().catch(console.error);
