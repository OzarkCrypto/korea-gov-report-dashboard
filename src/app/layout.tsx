import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '한국 정부기관 투자 보고서 대시보드',
  description: '투자에 참고할 만한 한국 정부기관/공공기관 보고서 모음',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
