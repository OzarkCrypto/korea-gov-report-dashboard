"use client";

import React, { useState } from 'react';

interface Agency {
  name: string;
  desc: string;
  url: string;
  rating: number;
  freq: string;
  tags: string[];
  searchKey: string;
}

interface Report {
  title: string;
  url: string;
  date?: string;
}

interface Category {
  title: string;
  icon: string;
  items: Agency[];
}

const agencies: Record<string, Category> = {
  macro: {
    title: "거시경제·금융",
    icon: "📊",
    items: [
      { name: "한국은행", desc: "금융안정보고서, 통화신용정책보고서, 경제전망", url: "https://www.bok.or.kr/portal/bbs/B0000232/list.do?menuNo=200761", rating: 3, freq: "분기", tags: ["금리", "환율", "통화정책"], searchKey: "한국은행 보고서" },
      { name: "한국은행 ECOS", desc: "경제통계시스템 - 금리, 환율, 통화량 등", url: "https://ecos.bok.or.kr/", rating: 3, freq: "실시간", tags: ["통계", "데이터"], searchKey: "한국은행 ECOS 통계" },
      { name: "기획재정부 (그린북)", desc: "최근 경제동향 - 월간 경제상황 종합분석", url: "https://www.moef.go.kr/sn/economic/econEstimate", rating: 3, freq: "월간", tags: ["경제동향", "정책"], searchKey: "기획재정부 그린북 최근경제동향" },
      { name: "기획재정부 (레드북)", desc: "재정동향 - 세입세출, 국가채무 현황", url: "https://www.moef.go.kr/sn/fiscal/fiscalList", rating: 3, freq: "월간", tags: ["재정", "세금"], searchKey: "기획재정부 재정동향 레드북" },
      { name: "금융위원회", desc: "금융정책, 규제 변화, 금융시장 동향", url: "https://www.fsc.go.kr/no010101", rating: 3, freq: "수시", tags: ["금융규제", "핀테크"], searchKey: "금융위원회 보도자료" },
      { name: "금융감독원", desc: "금융시장 동향, 감독정보, 금융통계", url: "https://www.fss.or.kr/fss/kr/promo/bodobbs_list.jsp?id=PR0301", rating: 3, freq: "수시", tags: ["감독", "공시"], searchKey: "금융감독원 보도자료" },
      { name: "한국개발연구원 (KDI)", desc: "KDI 경제전망, 정책연구 보고서", url: "https://www.kdi.re.kr/research/reportList", rating: 3, freq: "분기", tags: ["전망", "정책연구"], searchKey: "KDI 한국개발연구원 보고서" },
      { name: "한국금융연구원", desc: "금융시장 분석, 금융브리프, 주간금융동향", url: "https://www.kif.re.kr/kif3/publication/pub_list.aspx?menuid=12", rating: 2, freq: "주간", tags: ["금융분석"], searchKey: "한국금융연구원 금융브리프" },
      { name: "자본시장연구원", desc: "자본시장 이슈, 조사보고서, 금융투자 동향", url: "https://www.kcmi.re.kr/publications/pub_list_01", rating: 2, freq: "수시", tags: ["증권", "자산운용"], searchKey: "자본시장연구원 보고서" },
      { name: "한국조세재정연구원", desc: "조세/재정 정책 분석, 세법 개정 분석", url: "https://www.kipf.re.kr/kor/Publication/PubList/PublicationList.aspx?type=1", rating: 2, freq: "수시", tags: ["세제", "재정"], searchKey: "한국조세재정연구원 보고서" },
      { name: "국회예산정책처", desc: "예산분석, 경제전망, 재정동향", url: "https://www.nabo.go.kr/Sub/01Report/01_01_Board.jsp", rating: 3, freq: "수시", tags: ["예산", "재정전망"], searchKey: "국회예산정책처 보고서" },
      { name: "예금보험공사", desc: "금융안정리포트, 부실금융기관 동향", url: "https://www.kdic.or.kr/board/boardList.do?boardId=11", rating: 2, freq: "분기", tags: ["금융안정"], searchKey: "예금보험공사 금융안정리포트" },
    ]
  },
  industry: {
    title: "산업·기술",
    icon: "🏭",
    items: [
      { name: "산업통상자원부", desc: "산업동향, 에너지정책, 통상정책 보도자료", url: "https://www.motie.go.kr/motie/ne/presse/press1/bbs/bbsList.do?bbs_cd_n=16", rating: 3, freq: "수시", tags: ["산업정책", "에너지"], searchKey: "산업통상자원부 보도자료" },
      { name: "산업연구원 (KIET)", desc: "산업경제분석, 산업동향, 업종별 심층분석", url: "https://www.kiet.re.kr/research/researchList", rating: 3, freq: "월간", tags: ["산업분석", "섹터"], searchKey: "산업연구원 KIET 보고서" },
      { name: "과학기술정보통신부", desc: "AI/데이터/통신 정책, ICT 동향", url: "https://www.msit.go.kr/bbs/list.do?sCode=user&mId=113&mPid=112", rating: 3, freq: "수시", tags: ["AI", "통신", "규제"], searchKey: "과학기술정보통신부 보도자료" },
      { name: "정보통신기획평가원 (IITP)", desc: "ICT R&D 이슈, 기술동향 분석, 주간기술동향", url: "https://www.iitp.kr/kr/1/knowledge/publicationList.it", rating: 3, freq: "주간", tags: ["IT", "반도체", "R&D"], searchKey: "IITP 정보통신기획평가원 주간기술동향" },
      { name: "한국과학기술기획평가원", desc: "기술수준평가, 미래기술 전망", url: "https://www.kistep.re.kr/reportList.es?mid=a10305010000", rating: 2, freq: "연간", tags: ["미래기술", "R&D"], searchKey: "KISTEP 한국과학기술기획평가원 보고서" },
      { name: "정보통신정책연구원 (KISDI)", desc: "통신/미디어/플랫폼 정책 연구", url: "https://www.kisdi.re.kr/report/list.do", rating: 2, freq: "수시", tags: ["미디어", "플랫폼"], searchKey: "KISDI 정보통신정책연구원 보고서" },
      { name: "한국전자통신연구원 (ETRI)", desc: "ICT 기술 동향, 연구보고서", url: "https://www.etri.re.kr/kor/sub6/sub6_0101.etri", rating: 2, freq: "수시", tags: ["통신기술"], searchKey: "ETRI 한국전자통신연구원 보고서" },
      { name: "소프트웨어정책연구소", desc: "SW/AI 산업 동향, 정책 이슈", url: "https://spri.kr/posts?board=issue_reports", rating: 2, freq: "월간", tags: ["SW", "AI"], searchKey: "소프트웨어정책연구소 SPRi 보고서" },
      { name: "한국로봇산업진흥원", desc: "로봇산업 동향, 시장분석", url: "https://www.kiria.org/portal/contents/sub05/robotData/robotDataList.do", rating: 2, freq: "분기", tags: ["로봇", "자동화"], searchKey: "한국로봇산업진흥원 로봇산업 동향" },
      { name: "한국반도체산업협회", desc: "반도체 산업 동향, 수출입 통계", url: "https://www.ksia.or.kr/sub02/sub01_01.php", rating: 3, freq: "월간", tags: ["반도체"], searchKey: "한국반도체산업협회 반도체 동향" },
    ]
  },
  trade: {
    title: "무역·통상",
    icon: "🌏",
    items: [
      { name: "KOTRA", desc: "해외시장 동향, 국가별 리포트, 수출지원정보", url: "https://dream.kotra.or.kr/kotranews/cms/news/actionKotraBoardList.do?MENU_ID=280&CONTENTS_NO=1", rating: 3, freq: "일간", tags: ["해외시장", "수출"], searchKey: "KOTRA 해외시장뉴스" },
      { name: "한국무역협회 (KITA)", desc: "무역통계, 품목별 동향, 무역뉴스", url: "https://www.kita.net/cmmrcInfo/cmmrcNews/cmmrcNews/cmmrcNewsList.do", rating: 3, freq: "일간", tags: ["무역", "수출입"], searchKey: "한국무역협회 KITA 무역뉴스" },
      { name: "대외경제정책연구원 (KIEP)", desc: "세계경제 전망, 통상이슈, 지역연구", url: "https://www.kiep.go.kr/gallery.es?mid=a10101010000", rating: 3, freq: "수시", tags: ["세계경제", "통상"], searchKey: "KIEP 대외경제정책연구원 보고서" },
      { name: "한국수출입은행", desc: "해외경제연구소 보고서, 국가신용도", url: "https://keri.koreaexim.go.kr/HPHKII012M02", rating: 2, freq: "수시", tags: ["국가리스크", "해외투자"], searchKey: "한국수출입은행 해외경제연구소" },
      { name: "관세청", desc: "수출입 무역통계 속보", url: "https://unipass.customs.go.kr/ets/index.do", rating: 3, freq: "일간", tags: ["수출입", "선행지표"], searchKey: "관세청 수출입 무역통계" },
      { name: "무역위원회", desc: "반덤핑, 세이프가드, 무역구제 정보", url: "https://www.ktc.go.kr/board.es?mid=a10202010000", rating: 2, freq: "수시", tags: ["무역구제", "관세"], searchKey: "무역위원회 무역구제" },
      { name: "FTA종합지원센터", desc: "FTA 활용, 원산지, 관세율 정보", url: "https://www.ftahub.go.kr/main/", rating: 2, freq: "수시", tags: ["FTA", "관세"], searchKey: "FTA종합지원센터 FTA 동향" },
    ]
  },
  realestate: {
    title: "부동산·건설",
    icon: "🏠",
    items: [
      { name: "한국부동산원", desc: "부동산 통계, 시장동향, 가격지수", url: "https://www.reb.or.kr/r-one/portal/stat/pstatsList.do", rating: 3, freq: "주간", tags: ["부동산", "가격지수"], searchKey: "한국부동산원 부동산 시장동향" },
      { name: "국토교통부", desc: "부동산 정책, 주택시장 동향", url: "https://www.molit.go.kr/USR/NEWS/m_71/lst.jsp", rating: 3, freq: "수시", tags: ["정책", "규제"], searchKey: "국토교통부 부동산 보도자료" },
      { name: "국토연구원", desc: "부동산/국토 정책 연구", url: "https://www.krihs.re.kr/publica/researchReportList.do", rating: 2, freq: "수시", tags: ["정책연구"], searchKey: "국토연구원 보고서" },
      { name: "주택금융연구원", desc: "주택금융 동향, 모기지 시장 분석", url: "https://www.hf.go.kr/research/selectBbsList.do?bbsId=BBSMSTR_000000000061", rating: 2, freq: "분기", tags: ["주택금융", "모기지"], searchKey: "주택금융연구원 주택금융 동향" },
      { name: "한국건설산업연구원", desc: "건설경기 전망, 건설산업 동향", url: "https://www.cerik.re.kr/report/list?searchCate1=01", rating: 2, freq: "분기", tags: ["건설경기"], searchKey: "한국건설산업연구원 건설경기 전망" },
      { name: "LH 토지주택연구원", desc: "주택/도시 연구, 부동산 시장 분석", url: "https://www.lh.or.kr/menu.es?mid=a60304010000", rating: 2, freq: "수시", tags: ["주택", "도시"], searchKey: "LH 토지주택연구원 보고서" },
      { name: "서울부동산정보광장", desc: "서울 부동산 실거래가, 통계", url: "https://land.seoul.go.kr/land/rtms/rtmsNews.do", rating: 3, freq: "실시간", tags: ["서울", "실거래"], searchKey: "서울부동산정보광장 실거래" },
    ]
  },
  commodity: {
    title: "에너지·원자재",
    icon: "⛽",
    items: [
      { name: "한국석유공사 (KNOC)", desc: "유가동향, 석유시장 분석, 페트로넷", url: "https://www.petronet.co.kr/main.jsp", rating: 3, freq: "일간", tags: ["유가", "정유"], searchKey: "한국석유공사 페트로넷 유가동향" },
      { name: "에너지경제연구원", desc: "에너지 시장 분석, 정책연구", url: "https://www.keei.re.kr/main.nsf/index.html?open&p=issue&s=list", rating: 3, freq: "수시", tags: ["에너지", "정책"], searchKey: "에너지경제연구원 보고서" },
      { name: "한국가스공사", desc: "LNG 시장 동향, 가스 가격", url: "https://www.kogas.or.kr/portal/content/market/marketList", rating: 2, freq: "월간", tags: ["LNG", "가스"], searchKey: "한국가스공사 LNG 시장동향" },
      { name: "한국전력거래소", desc: "전력시장 동향, SMP 가격, 전력통계", url: "https://www.kpx.or.kr/menu.es?mid=a10206010000", rating: 3, freq: "일간", tags: ["전력", "SMP"], searchKey: "한국전력거래소 전력시장 동향" },
      { name: "한국광물자원공사", desc: "광물자원 시장, 금속 가격 동향", url: "https://www.kores.or.kr/views/cms/komine/un/un01/un0105.jsp", rating: 2, freq: "월간", tags: ["광물", "2차전지"], searchKey: "한국광물자원공사 광물시장 동향" },
      { name: "한국에너지공단", desc: "신재생에너지 동향, 에너지효율", url: "https://www.energy.or.kr/web/kem_home_new/new_main.asp", rating: 2, freq: "수시", tags: ["신재생", "태양광"], searchKey: "한국에너지공단 신재생에너지 동향" },
      { name: "전력통계정보시스템 (EPSIS)", desc: "전력수급, 발전량, 전력거래 통계", url: "https://epsis.kpx.or.kr/", rating: 3, freq: "실시간", tags: ["전력통계"], searchKey: "EPSIS 전력통계" },
      { name: "오피넷 (유가정보)", desc: "국내 유류 가격, 주유소별 가격", url: "https://www.opinet.co.kr/", rating: 3, freq: "실시간", tags: ["유류가격"], searchKey: "오피넷 유가정보" },
    ]
  },
  sector: {
    title: "섹터별",
    icon: "🔬",
    items: [
      { name: "식품의약품안전처", desc: "신약/의료기기 허가, 안전정보", url: "https://www.mfds.go.kr/brd/m_99/list.do", rating: 3, freq: "일간", tags: ["바이오", "제약"], searchKey: "식품의약품안전처 허가 보도자료" },
      { name: "건강보험심사평가원", desc: "의약품 급여, 의료정책, 약가", url: "https://www.hira.or.kr/bbsDummy.do?pgmid=HIRAA020041000000", rating: 3, freq: "수시", tags: ["약가", "의료"], searchKey: "건강보험심사평가원 약가 보도자료" },
      { name: "한국바이오협회", desc: "바이오산업 통계, 동향", url: "https://www.koreabio.org/board/list.php?code=notice", rating: 2, freq: "수시", tags: ["바이오"], searchKey: "한국바이오협회 바이오산업 동향" },
      { name: "한국자동차연구원", desc: "자동차산업 동향, 전기차 시장", url: "https://www.katech.re.kr/pub/reportList", rating: 3, freq: "월간", tags: ["자동차", "EV"], searchKey: "한국자동차연구원 자동차산업 동향" },
      { name: "한국해양수산개발원 (KMI)", desc: "해운/조선/수산 동향", url: "https://www.kmi.re.kr/web/trebook/list.do", rating: 2, freq: "수시", tags: ["해운", "조선"], searchKey: "KMI 한국해양수산개발원 보고서" },
      { name: "한국농촌경제연구원", desc: "농산물 가격 전망, 농업 동향", url: "https://www.krei.re.kr/krei/researchReportList.do", rating: 2, freq: "수시", tags: ["농산물", "식품"], searchKey: "한국농촌경제연구원 농업 전망" },
      { name: "한국문화관광연구원", desc: "관광산업 동향, 콘텐츠 시장", url: "https://www.kcti.re.kr/web/board/reportList.do", rating: 2, freq: "수시", tags: ["관광", "콘텐츠"], searchKey: "한국문화관광연구원 관광 동향" },
      { name: "한국섬유산업연합회", desc: "섬유/패션 산업 동향", url: "https://www.kofoti.or.kr/bbs/list.asp?BoardID=report", rating: 2, freq: "월간", tags: ["섬유", "패션"], searchKey: "한국섬유산업연합회 섬유산업 동향" },
      { name: "한국디스플레이산업협회", desc: "디스플레이 산업 동향", url: "https://www.kdia.org/ko/library/industrynews", rating: 2, freq: "월간", tags: ["디스플레이", "OLED"], searchKey: "한국디스플레이산업협회 OLED 동향" },
      { name: "대한화장품산업연구원", desc: "화장품 산업 동향, 수출입", url: "https://www.kcii.re.kr/kor/portal/report/report1.asp", rating: 2, freq: "월간", tags: ["화장품", "K뷰티"], searchKey: "대한화장품산업연구원 화장품 동향" },
    ]
  },
  stats: {
    title: "통계·데이터",
    icon: "📈",
    items: [
      { name: "통계청 KOSIS", desc: "고용, 소비, 생산 등 전체 국가통계", url: "https://kosis.kr/", rating: 3, freq: "실시간", tags: ["국가통계"], searchKey: "통계청 KOSIS 통계" },
      { name: "통계청 경제활동인구조사", desc: "고용률, 실업률, 취업자 수", url: "https://kostat.go.kr/board.es?mid=a10301010000", rating: 3, freq: "월간", tags: ["고용", "노동"], searchKey: "통계청 경제활동인구조사 고용" },
      { name: "통계청 소비자물가", desc: "CPI, 물가상승률, 품목별 물가", url: "https://kostat.go.kr/board.es?mid=a10301020000", rating: 3, freq: "월간", tags: ["물가", "인플레이션"], searchKey: "통계청 소비자물가 CPI" },
      { name: "통계청 산업활동동향", desc: "생산, 소비, 투자, 경기지수", url: "https://kostat.go.kr/board.es?mid=a10301060000", rating: 3, freq: "월간", tags: ["경기", "생산"], searchKey: "통계청 산업활동동향" },
      { name: "공정거래위원회", desc: "시장분석, 기업결합, 독점 규제", url: "https://www.ftc.go.kr/www/selectReportUserList.do?key=10", rating: 2, freq: "수시", tags: ["M&A", "규제"], searchKey: "공정거래위원회 기업결합 보도자료" },
      { name: "국민연금연구원", desc: "연금/인구 연구, 장기전망", url: "https://institute.nps.or.kr/jsppage/research/list_n.jsp", rating: 2, freq: "수시", tags: ["연금", "인구"], searchKey: "국민연금연구원 연금 보고서" },
      { name: "한국노동연구원", desc: "노동시장 분석, 임금 동향", url: "https://www.kli.re.kr/klireport/index.do", rating: 2, freq: "수시", tags: ["노동", "임금"], searchKey: "한국노동연구원 노동시장 보고서" },
      { name: "중소벤처기업연구원", desc: "중소기업 동향, 벤처 생태계", url: "https://www.kosbi.re.kr/kosbi/kr/selectReportList.do?bbsNo=6", rating: 2, freq: "수시", tags: ["중소기업", "벤처"], searchKey: "중소벤처기업연구원 중소기업 동향" },
    ]
  },
};

const StarRating = ({ rating }: { rating: number }) => (
  <span className="text-xs text-amber-500">{"★".repeat(rating)}{"☆".repeat(3-rating)}</span>
);

const FrequencyBadge = ({ freq }: { freq: string }) => {
  const colors: Record<string, string> = {
    "실시간": "bg-emerald-100 text-emerald-700",
    "일간": "bg-blue-100 text-blue-700",
    "주간": "bg-violet-100 text-violet-700",
    "월간": "bg-orange-100 text-orange-700",
    "분기": "bg-rose-100 text-rose-700",
    "연간": "bg-gray-100 text-gray-600",
    "수시": "bg-cyan-100 text-cyan-700",
  };
  return (
    <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${colors[freq] || colors["수시"]}`}>
      {freq}
    </span>
  );
};

const ReportItem = ({ report }: { report: Report }) => (
  <a
    href={report.url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-start gap-2 px-3 py-2 hover:bg-blue-50 rounded transition-colors group"
  >
    <span className="text-blue-400 mt-0.5">•</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-700 group-hover:text-blue-600 line-clamp-2">{report.title}</p>
      {report.date && <p className="text-[10px] text-gray-400 mt-0.5">{report.date}</p>}
    </div>
    <svg className="w-3 h-3 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  </a>
);

const AgencyRow = ({ 
  agency, 
  isExpanded, 
  onToggle, 
  reports, 
  isLoading, 
  error 
}: { 
  agency: Agency;
  isExpanded: boolean;
  onToggle: () => void;
  reports: Report[] | undefined;
  isLoading: boolean;
  error: string | null;
}) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <div
      onClick={onToggle}
      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer group transition-colors"
    >
      <svg 
        className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm truncate group-hover:text-blue-600">{agency.name}</span>
          <StarRating rating={agency.rating} />
        </div>
        <p className="text-xs text-gray-500 truncate">{agency.desc}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="hidden sm:flex gap-1">
          {agency.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded">
              {tag}
            </span>
          ))}
        </div>
        <FrequencyBadge freq={agency.freq} />
        <a
          href={agency.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="기관 페이지로 이동"
        >
          <svg className="w-4 h-4 text-gray-400 hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
    
    {isExpanded && (
      <div className="bg-gray-50 border-t border-gray-100">
        <div className="px-3 py-2 flex items-center justify-between border-b border-gray-100">
          <span className="text-xs font-medium text-gray-600">최신 보고서</span>
          <a 
            href={agency.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-blue-500 hover:text-blue-700"
          >
            전체보기 →
          </a>
        </div>
        {isLoading ? (
          <div className="px-3 py-4 text-center">
            <div className="inline-block w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500 mt-2">보고서 검색 중...</p>
          </div>
        ) : error ? (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-red-500">{error}</p>
            <a 
              href={agency.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              직접 방문하기
            </a>
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="py-1">
            {reports.map((report, idx) => (
              <ReportItem key={idx} report={report} />
            ))}
          </div>
        ) : (
          <div className="px-3 py-4 text-center">
            <p className="text-xs text-gray-500">검색 결과가 없습니다</p>
            <a 
              href={agency.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
            >
              직접 방문하기
            </a>
          </div>
        )}
      </div>
    )}
  </div>
);

export default function GovReportDashboard() {
  const [activeTab, setActiveTab] = useState("macro");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
  const [reportsCache, setReportsCache] = useState<Record<string, Report[]>>({});
  const [loadingAgency, setLoadingAgency] = useState<string | null>(null);
  const [errorAgency, setErrorAgency] = useState<Record<string, string | null>>({});

  const tabs = Object.entries(agencies).map(([key, value]) => ({
    id: key,
    title: value.title,
    icon: value.icon,
    count: value.items.length,
  }));

  const fetchReports = async (agency: Agency) => {
    if (reportsCache[agency.name]) return;
    
    setLoadingAgency(agency.name);
    setErrorAgency(prev => ({ ...prev, [agency.name]: null }));
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{
            role: "user",
            content: `"${agency.searchKey}" 최신 보고서 3개를 검색해서 JSON으로만 응답해줘. 형식: [{"title":"보고서 제목","url":"링크","date":"날짜"}]. 다른 설명 없이 JSON 배열만 출력.`
          }]
        })
      });
      
      const data = await response.json();
      
      let text = "";
      if (data.content) {
        for (const block of data.content) {
          if (block.type === "text") {
            text += block.text;
          }
        }
      }
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const reports = JSON.parse(jsonMatch[0]);
        setReportsCache(prev => ({ ...prev, [agency.name]: reports.slice(0, 3) }));
      } else {
        throw new Error("결과를 파싱할 수 없습니다");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setErrorAgency(prev => ({ ...prev, [agency.name]: "보고서를 가져올 수 없습니다" }));
    } finally {
      setLoadingAgency(null);
    }
  };

  const handleToggle = (agency: Agency) => {
    if (expandedAgency === agency.name) {
      setExpandedAgency(null);
    } else {
      setExpandedAgency(agency.name);
      fetchReports(agency);
    }
  };

  const filterItems = (items: Agency[]) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(term) ||
        item.desc.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term))
    );
  };

  const getAllFilteredItems = () => {
    if (!searchTerm) return null;
    const results: { category: string; icon: string; items: Agency[] }[] = [];
    Object.entries(agencies).forEach(([, category]) => {
      const filtered = filterItems(category.items);
      if (filtered.length > 0) {
        results.push({ category: category.title, icon: category.icon, items: filtered });
      }
    });
    return results;
  };

  const filteredResults = getAllFilteredItems();
  const currentCategory = agencies[activeTab];
  const filteredItems = filterItems(currentCategory.items);
  const totalAgencies = Object.values(agencies).reduce((sum, cat) => sum + cat.items.length, 0);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-4">
        <header className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇰🇷</span>
            <h1 className="text-lg font-bold text-gray-900">정부기관 투자 보고서</h1>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{totalAgencies}개 기관</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>실시간</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>일간</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>주간</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>월간</span>
          </div>
        </header>

        <div className="relative mb-3">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="기관명, 키워드 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">✕</button>
          )}
        </div>

        {searchTerm && filteredResults ? (
          <div className="space-y-4">
            <p className="text-xs text-gray-500">
              &quot;{searchTerm}&quot; 검색 결과: <span className="font-medium text-gray-700">{filteredResults.reduce((sum, r) => sum + r.items.length, 0)}개</span>
            </p>
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <div key={result.category} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                    <span>{result.icon}</span>
                    <span className="font-medium text-sm">{result.category}</span>
                    <span className="text-xs text-gray-500">({result.items.length})</span>
                  </div>
                  <div>
                    {result.items.map((agency) => (
                      <AgencyRow 
                        key={agency.name} 
                        agency={agency}
                        isExpanded={expandedAgency === agency.name}
                        onToggle={() => handleToggle(agency)}
                        reports={reportsCache[agency.name]}
                        isLoading={loadingAgency === agency.name}
                        error={errorAgency[agency.name]}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <span className="text-xs">{tab.icon}</span>
                  <span>{tab.title}</span>
                  <span className={`text-[10px] px-1 rounded ${activeTab === tab.id ? "bg-gray-700" : "bg-gray-200"}`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {filteredItems.map((agency) => (
                <AgencyRow 
                  key={agency.name} 
                  agency={agency}
                  isExpanded={expandedAgency === agency.name}
                  onToggle={() => handleToggle(agency)}
                  reports={reportsCache[agency.name]}
                  isLoading={loadingAgency === agency.name}
                  error={errorAgency[agency.name]}
                />
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p>검색 결과가 없습니다</p>
                </div>
              )}
            </div>
          </>
        )}

        <footer className="mt-4 pt-3 border-t border-gray-100 text-center text-[10px] text-gray-400">
          ★★★ 투자 필수 참고 · 클릭하면 최신 보고서 3개 표시 · 2025년 1월 업데이트
        </footer>
      </div>
    </div>
  );
}
