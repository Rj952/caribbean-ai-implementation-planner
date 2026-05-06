// Browser-side text extraction from uploaded plans.
// Supports: .docx (mammoth), .pdf (pdfjs-dist), .txt and .md (FileReader).

import mammoth from 'mammoth';

/**
 * Extract plain text from a File object.
 * Returns { text, kind, words } where kind is 'docx' | 'pdf' | 'text'.
 */
export async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();
  let text = '';
  let kind = 'text';

  if (name.endsWith('.docx')) {
    kind = 'docx';
    const buf = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buf });
    text = result.value || '';
  } else if (name.endsWith('.pdf')) {
    kind = 'pdf';
    text = await extractPdfText(file);
  } else if (name.endsWith('.txt') || name.endsWith('.md')) {
    kind = 'text';
    text = await file.text();
  } else if (name.endsWith('.doc')) {
    throw new Error(
      'Legacy .doc files are not supported in the browser. Please save as .docx and try again.'
    );
  } else {
    // Try reading as text as a last resort
    try {
      text = await file.text();
      kind = 'text';
    } catch {
      throw new Error(
        `Unsupported file type: ${file.name}. Please upload .docx, .pdf, .txt, or .md.`
      );
    }
  }

  const words = countWords(text);
  return { text, kind, words };
}

async function extractPdfText(file) {
  // Dynamic import keeps pdf.js out of the initial bundle
  const pdfjs = await import('pdfjs-dist/build/pdf.mjs');
  // Use the worker that ships with pdfjs-dist via a CDN to avoid bundling complexity
  const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
  if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  }

  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let out = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strs = content.items.map(it => ('str' in it ? it.str : ''));
    out += strs.join(' ') + '\n\n';
  }
  return out;
}

function countWords(text) {
  if (!text) return 0;
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}
