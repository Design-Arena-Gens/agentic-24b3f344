import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url, selector } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let validUrl: URL;
    try {
      validUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Fetch the webpage
    const response = await axios.get(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // If selector is provided, scope to that element
    const root = selector ? $(selector) : $('body');

    if (selector && root.length === 0) {
      return NextResponse.json(
        { error: 'Selector not found on page' },
        { status: 404 }
      );
    }

    // Extract data
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';

    const headings: string[] = [];
    root.find('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    const paragraphs: string[] = [];
    root.find('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) paragraphs.push(text);
    });

    const links: Array<{ text: string; href: string }> = [];
    root.find('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href) {
        try {
          const absoluteUrl = new URL(href, validUrl).toString();
          links.push({ text, href: absoluteUrl });
        } catch {
          links.push({ text, href });
        }
      }
    });

    const images: Array<{ alt: string; src: string }> = [];
    root.find('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      const alt = $(el).attr('alt') || '';
      if (src) {
        try {
          const absoluteUrl = new URL(src, validUrl).toString();
          images.push({ alt, src: absoluteUrl });
        } catch {
          images.push({ alt, src });
        }
      }
    });

    return NextResponse.json({
      title,
      headings,
      paragraphs,
      links,
      images,
      metadata: {
        description: metaDescription,
        keywords: metaKeywords,
      },
    });
  } catch (error) {
    console.error('Scraping error:', error);

    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        return NextResponse.json(
          { error: 'Website not found' },
          { status: 404 }
        );
      }
      if (error.code === 'ETIMEDOUT') {
        return NextResponse.json(
          { error: 'Request timeout - website took too long to respond' },
          { status: 408 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch website: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
