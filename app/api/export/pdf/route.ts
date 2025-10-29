import { NextRequest, NextResponse } from 'next/server'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { buildExportHtml } from '@/lib/export-html'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { cover, content, illustrations } = body as { cover: any, content: string, illustrations?: { src: string; caption?: string }[] }
    if (!cover || !content) {
      return NextResponse.json({ error: 'cover and content required' }, { status: 400 })
    }

    const html = await buildExportHtml(cover, content, illustrations)

    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME
    const executablePath = isLambda
      ? await chromium.executablePath()
      : process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome'

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: true,
    })

    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: 'A4'
    })
    await browser.close()

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="export.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (e: any) {
    console.error('PDF export error:', e)
    return NextResponse.json({ error: e?.message || 'pdf error' }, { status: 500 })
  }
}
