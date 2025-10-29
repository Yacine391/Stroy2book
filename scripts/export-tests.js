/* eslint-disable */
const fs = require('fs')
const path = require('path')
const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')
const pdfParse = require('pdf-parse')
const AdmZip = require('adm-zip')
const { Document, Packer, Paragraph, HeadingLevel, ImageRun, TextRun } = require('docx')

async function buildExportHtml(cover, contentMarkdown) {
  const mod = await import('../lib/export-html.ts')
  return await mod.buildExportHtml(cover, contentMarkdown)
}

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAE0lEQVR42mP8z8DAwMDAwMABAAKWAQJ6mQnXAAAAAElFTkSuQmCC'

async function testPDF() {
  const html = await buildExportHtml({
    title: 'Titre Test',
    subtitle: 'Sous-titre',
    author: 'Auteur Test',
    imageBase64: tinyPngBase64,
    includeIllustrationInPDF: true,
    imagePosition: { x: 0, y: 0, scale: 1 },
    colors: { primary: '#ffffff', secondary: '#000000', text: '#111827' }
  }, '# Introduction\n\nBonjour PDF test.')

  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME
  const executablePath = isLambda ? await chromium.executablePath() : process.env.CHROME_EXECUTABLE_PATH || '/usr/bin/google-chrome'

  let browser
  try {
    browser = await puppeteer.launch({ args: chromium.args, defaultViewport: chromium.defaultViewport, executablePath, headless: true })
  } catch (e) {
    console.log('Skip PDF test (no chrome in env):', String(e).slice(0, 120))
    return { ok: true, skipped: true }
  }
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const pdfBuffer = await page.pdf({ printBackground: true, preferCSSPageSize: true, format: 'A4' })
  await browser.close()

  const data = await pdfParse(pdfBuffer)
  const hasTitle = /Titre Test/.test(data.text)
  const containsImageMarker = pdfBuffer.includes(Buffer.from('Image'))
  return { ok: hasTitle && containsImageMarker, hasTitle, containsImageMarker }
}

async function testDOCX() {
  const doc = new Document({ creator: 'HB Creator', title: 'Test', description: 'DOCX test', sections: [{ children: [] }] })
  const imgRun = new ImageRun({ data: Buffer.from(tinyPngBase64, 'base64'), transformation: { width: 600, height: 900 } })
  doc.addSection({ children: [
    new Paragraph({ text: 'Titre Test', heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun('Bonjour DOCX test.')] }),
    new Paragraph({ children: [imgRun] }),
  ]})
  const buffer = await Packer.toBuffer(doc)
  const zip = new AdmZip(buffer)
  const entries = zip.getEntries().map(e => e.entryName)
  const hasImage = entries.some(n => n.startsWith('word/media/'))
  const hasDoc = entries.includes('word/document.xml')
  return { ok: hasImage && hasDoc, hasImage, hasDoc }
}

async function testEPUB() {
  const content = [{ title: 'Chapitre 1', content: '<h1>Chapitre 1</h1><p>Bonjour EPUB test.</p>' }]
  const mod = await import('epub-gen-memory')
  const EPub = mod.EPub || (mod.default && mod.default.EPub) || mod
  const { epub } = await new EPub({ title: 'Titre Test', author: 'Auteur', cover: `data:image/png;base64,${tinyPngBase64}` }, content).promise
  const buffer = epub
  const zip = new AdmZip(buffer)
  const names = zip.getEntries().map(e => e.entryName)
  const hasImages = names.some(n => n.toLowerCase().includes('image'))
  const hasContent = names.some(n => n.toLowerCase().includes('xhtml') || n.toLowerCase().includes('html'))
  return { ok: hasContent, hasImages, hasContent }
}

;(async () => {
  const results = { pdf: await testPDF(), docx: await testDOCX(), epub: await testEPUB() }
  console.log(JSON.stringify(results, null, 2))
  const allOk = results.pdf.ok && results.docx.ok && results.epub.ok
  process.exit(allOk ? 0 : 1)
})()
