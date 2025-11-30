import { Card, CardHeader, Input, Spinner, Text } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import React, { useEffect, useState } from 'react';

interface Item {
  title: string;
  summary: string;
  content: string;
  permalink: string;
  date: string;
  tags?: string[];
  categories?: string[];
}

export const SearchBox: React.FC = () => {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);

  const [indexReady, setIndexReady] = useState<boolean>(false);

  useEffect(() => {
    // Load fallback items for substring search
    setLoading(true);
    fetch('/index.json')
      .then(r => r.json())
      .then((data: Item[]) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Detect Pagefind client
    const check = () => {
      // @ts-expect-error runtime global
      if (window.pagefind) setIndexReady(true);
    };
    // In case defer script hasn't loaded yet
    const t = setInterval(() => {
      // @ts-expect-error runtime global
      if (window.pagefind) { setIndexReady(true); clearInterval(t); }
    }, 300);
    check();
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!q.trim()) { setResults([]); return; }
      // Prefer Pagefind if available
      // @ts-expect-error runtime global
      const pf = (window.pagefind || null);
      if (pf && indexReady) {
        try {
          const res = await pf.search(q);
          const top = res.results.slice(0, 20);
          const mapped: Item[] = [];
          for (const r of top) {
            const data = await r.data();
            mapped.push({
              title: data.meta?.title || data.title || data.url,
              summary: '',
              content: '',
              permalink: data.url,
              date: data.meta?.date || '',
              tags: data.meta?.tags || [],
              categories: data.meta?.categories || []
            });
          }
          setResults(mapped);
          return;
        } catch {
          // fall through to substring
        }
      }
      // Fallback substring search
      const lower = q.toLowerCase();
      setResults(items.filter(i =>
        i.title.toLowerCase().includes(lower) ||
        i.summary.toLowerCase().includes(lower) ||
        i.content.toLowerCase().includes(lower)
      ).slice(0, 20));
    };
    run();
  }, [q, indexReady, items]);

  return (
    <div className={`search-box${open ? ' expanded' : ''}`}>
      <div className="search-input-wrap">
        <SearchRegular className="search-icon" />
        <Input
          size="small"
          placeholder="Search articles..."
          value={q}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(_,data) => setQ(data.value)}
        />
        {loading && <Spinner size="tiny" />}    
      </div>

      {open && q && results.length > 0 && (
        <Card className="search-card">
          <CardHeader header={<Text weight="semibold">Search results</Text>} />
          <ul className="search-results">
            {results.map(r => (
              <li key={r.permalink}>
                <a href={r.permalink}>
                  <span className="search-title">{r.title}</span>
                  <span className="search-meta">{r.date}</span>
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {open && q && !loading && results.length === 0 && (
        <Card className="search-card">
          <div className="search-empty">No results</div>
        </Card>
      )}
    </div>
  );
};

export default SearchBox;
