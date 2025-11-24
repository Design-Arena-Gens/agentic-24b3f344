'use client';

import { useState } from 'react';

interface ScrapedData {
  title: string;
  headings: string[];
  paragraphs: string[];
  links: Array<{ text: string; href: string }>;
  images: Array<{ alt: string; src: string }>;
  metadata: {
    description?: string;
    keywords?: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapedData | null>(null);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, selector }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape website');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🕷️ Web Scraping Agent
          </h1>
          <p className="text-xl text-gray-600">
            Extract data from any website instantly
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="selector" className="block text-sm font-semibold text-gray-700 mb-2">
                CSS Selector (optional)
              </label>
              <input
                id="selector"
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="e.g., .article, #content, div.main"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to scrape the entire page
              </p>
            </div>

            <button
              onClick={handleScrape}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Scraping...
                </span>
              ) : (
                'Start Scraping'
              )}
            </button>
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 font-medium">❌ {error}</p>
            </div>
          )}
        </div>

        {result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Scraped Data</h2>

            <div className="space-y-6">
              {result.title && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Page Title</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{result.title}</p>
                </div>
              )}

              {result.metadata.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Meta Description</h3>
                  <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{result.metadata.description}</p>
                </div>
              )}

              {result.headings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Headings ({result.headings.length})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {result.headings.map((heading, idx) => (
                        <li key={idx} className="text-gray-900 border-l-4 border-indigo-500 pl-3">
                          {heading}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {result.paragraphs.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Paragraphs ({result.paragraphs.length})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <div className="space-y-3">
                      {result.paragraphs.slice(0, 10).map((para, idx) => (
                        <p key={idx} className="text-gray-700 text-sm leading-relaxed">
                          {para}
                        </p>
                      ))}
                      {result.paragraphs.length > 10 && (
                        <p className="text-gray-500 italic">
                          ... and {result.paragraphs.length - 10} more
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {result.links.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Links ({result.links.length})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {result.links.slice(0, 20).map((link, idx) => (
                        <li key={idx} className="text-sm">
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {link.text || link.href}
                          </a>
                        </li>
                      ))}
                      {result.links.length > 20 && (
                        <p className="text-gray-500 italic">
                          ... and {result.links.length - 20} more
                        </p>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              {result.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Images ({result.images.length})
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {result.images.slice(0, 10).map((img, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          <span className="font-medium">Alt:</span> {img.alt || '(no alt text)'} <br />
                          <span className="font-medium">Src:</span>{' '}
                          <a
                            href={img.src}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:underline break-all"
                          >
                            {img.src}
                          </a>
                        </li>
                      ))}
                      {result.images.length > 10 && (
                        <p className="text-gray-500 italic">
                          ... and {result.images.length - 10} more
                        </p>
                      )}
                    </ul>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={() => {
                    const dataStr = JSON.stringify(result, null, 2);
                    const dataBlob = new Blob([dataStr], { type: 'application/json' });
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'scraped-data.json';
                    link.click();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
                >
                  📥 Download JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
