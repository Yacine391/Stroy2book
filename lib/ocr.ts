export interface OcrResult {
  text: string;
  confidence?: number;
}

async function ocrViaOcrSpace(base64Png: string): Promise<OcrResult | null> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey) return null;

  try {
    const form = new FormData();
    form.append('base64Image', `data:image/png;base64,${base64Png}`);
    form.append('language', 'eng');
    form.append('scale', 'true');
    form.append('isTable', 'false');
    form.append('OCREngine', '2');

    const res = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: { apikey: apiKey },
      body: form as any
    });

    if (!res.ok) return null;
    const data = await res.json();

    const parsed = data?.ParsedResults?.[0];
    const text = (parsed?.ParsedText as string | undefined)?.trim() || '';
    const conf = parsed?.FileParseExitCode ? Number(parsed?.MeanConfidence || 0) : undefined;
    return { text, confidence: conf };
  } catch (err) {
    console.warn('OCR.space error:', err);
    return null;
  }
}

async function ocrViaTesseract(base64Png: string): Promise<OcrResult | null> {
  try {
    const Tesseract = await import('tesseract.js');
    const buf = Buffer.from(base64Png, 'base64');
    const { data } = await (Tesseract as any).recognize(buf, 'eng', { logger: () => {} });
    const text = (data?.text || '').trim();
    const confidence = Array.isArray((data as any)?.words) && (data as any).words.length
      ? (data as any).words.reduce((sum: number, w: any) => sum + (w.confidence || 0), 0) / (data as any).words.length
      : undefined;
    return { text, confidence };
  } catch (err) {
    console.warn('Tesseract OCR error:', err);
    return null;
  }
}

export async function detectTextInImage(base64Png: string): Promise<OcrResult> {
  const space = await ocrViaOcrSpace(base64Png);
  if (space) return space;
  const tess = await ocrViaTesseract(base64Png);
  if (tess) return tess;
  return { text: '' };
}
