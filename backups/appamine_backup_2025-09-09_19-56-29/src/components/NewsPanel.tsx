import { useState, useEffect } from 'react';
import { Bell, ExternalLink, RefreshCw, X } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  category: string;
  url: string;
  isNew: boolean;
  timestamp?: string;
  contentSnippet?: string;
}

// Données simulées des actualités du site al-wajeez
const mockNewsData: NewsItem[] = [
  {
    id: '1',
    title: 'افتتاح السنة الدراسية الجديدة 2024-2025',
    date: '2024-09-15',
    category: 'أخبار تعليمية',
    url: 'https://al-wajeez.vercel.app/',
    isNew: false
  },
  {
    id: '2',
    title: 'إطلاق برنامج التوجيه والإرشاد المدرسي',
    date: '2024-09-10',
    category: 'توجيه وإرشاد',
    url: 'https://al-wajeez.vercel.app/',
    isNew: false
  },
  {
    id: '3',
    title: 'ورشة عمل حول تطوير المهارات الدراسية',
    date: '2024-09-08',
    category: 'تطوير مهني',
    url: 'https://al-wajeez.vercel.app/',
    isNew: false
  },
  {
    id: '4',
    title: 'نتائج الامتحانات النهائية للفصل الثاني',
    date: '2024-09-05',
    category: 'نتائج دراسية',
    url: 'https://al-wajeez.vercel.app/',
    isNew: false
  }
];

function NewsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [news, setNews] = useState<NewsItem[]>(mockNewsData);
  const [newNewsCount, setNewNewsCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);

  const getTodayDateString = (): string => new Date().toISOString().split('T')[0];
  const resolveUrl = (baseUrl: string, href: string | null | undefined): string | null => {
    if (!href) return null;
    try {
      return new URL(href, baseUrl).toString();
    } catch {
      return href || null;
    }
  };
  const formatDateTime = (iso?: string, fallbackDate?: string): string => {
    try {
      const d = iso ? new Date(iso) : fallbackDate ? new Date(`${fallbackDate}T00:00:00`) : null;
      if (!d || isNaN(d.getTime())) return fallbackDate || '';
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mi = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
    } catch {
      return fallbackDate || '';
    }
  };
  // Concrete detection can be re-enabled later if needed

  useEffect(() => {
    // Charger les données depuis le localStorage
    loadNewsFromStorage();
    
    // Vérifier les nouvelles actualités au démarrage
    checkForNews();
    
    // Vérifier toutes les 24 heures
    const interval = setInterval(() => {
      checkForNews();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Compter uniquement les mises à jour du jour
    const today = getTodayDateString();
    const count = news.filter(item => item.isNew && item.date === today).length;
    setNewNewsCount(count);
  }, [news]);

  const loadNewsFromStorage = () => {
    try {
      const savedNews = localStorage.getItem('newsData');
      const savedCheckTime = localStorage.getItem('lastNewsCheck');
      
      if (savedNews) {
        setNews(JSON.parse(savedNews));
      }
      
      if (savedCheckTime) {
        setLastCheck(new Date(parseInt(savedCheckTime)));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des actualités:', error);
    }
  };

  const saveNewsToStorage = () => {
    try {
      localStorage.setItem('newsData', JSON.stringify(news));
      localStorage.setItem('lastNewsCheck', Date.now().toString());
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des actualités:', error);
    }
  };

  const checkForNews = async () => {
    setIsChecking(true);
    try {
      const baseOrigin = 'https://al-wajeez.vercel.app/';
      const maxPagesToCrawl = 20;
      const maxDepth = 2;
      const visited = new Set<string>();
      const queue: Array<{ url: string; depth: number }> = [{ url: baseOrigin, depth: 0 }];
      const fetchOptions: RequestInit = {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };
      const skipLink = (href: string): boolean => {
        const lower = href.toLowerCase();
        if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:') || lower.startsWith('#')) return true;
        if (/\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z|png|jpe?g|gif|svg|webp|mp4|mp3|wav)(\?|$)/i.test(lower)) return true;
        return false;
      };
      const allExtracted: NewsItem[] = [];
      const seen = new Set<string>();

      while (queue.length > 0 && visited.size < maxPagesToCrawl) {
        const current = queue.shift()!;
        if (visited.has(current.url)) continue;
        visited.add(current.url);

        try {
          const res = await fetch(current.url, fetchOptions);
          const contentType = res.headers.get('content-type') || '';
          if (!res.ok || !contentType.includes('text/html')) continue;
          const html = await res.text();

          const pageItems = extractNewsFromSite(html, current.url);
          for (const it of pageItems) {
            const k = `${it.title}::${it.url}`;
            if (!seen.has(k)) {
              seen.add(k);
              allExtracted.push(it);
            }
          }

          if (current.depth < maxDepth) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const anchors = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
            for (const a of anchors) {
              const raw = a.getAttribute('href') || '';
              if (!raw || skipLink(raw)) continue;
              const abs = resolveUrl(current.url, raw);
              if (!abs || !abs.startsWith(baseOrigin)) continue;
              // target only HTML pages
              if (!/\.html?(\?|$)/i.test(abs) && /\.[a-z0-9]{2,4}(\?|$)/i.test(abs)) continue;
              if (!visited.has(abs)) queue.push({ url: abs, depth: current.depth + 1 });
            }
          }
        } catch {
          // skip on errors
        }
      }

      if (allExtracted.length > 0) {
        const today = getTodayDateString();
        setNews(prev => {
          const existing = new Set(prev.map(p => `${p.title}::${p.url}`));
          const incoming = allExtracted
            .filter(n => !existing.has(`${n.title}::${n.url}`))
            .map(n => ({ ...n, isNew: true, date: today }));
          return incoming.length ? [...incoming, ...prev] : prev;
        });
      }

      setLastCheck(new Date());
      saveNewsToStorage();
      if (allExtracted.length > 0) showNotification(allExtracted.length);
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setLastCheck(new Date());
      saveNewsToStorage();
    } finally {
      setIsChecking(false);
    }
  };

  const extractNewsFromSite = (htmlContent: string, pageUrl: string): NewsItem[] => {
    const extractedNews: NewsItem[] = [];
    const baseUrl = pageUrl || 'https://al-wajeez.vercel.app/';
    
    try {
      // Créer un DOM parser pour analyser le HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extraire les titres
      const titles = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

      const extractPublishedAt = (root: Element): Date | null => {
        const timeEl = root.closest('article')?.querySelector('time[datetime]')
          || root.querySelector('time[datetime]')
          || root.parentElement?.querySelector('time[datetime]');
        if (timeEl) {
          const dt = (timeEl as HTMLTimeElement).getAttribute('datetime');
          if (dt) {
            const d = new Date(dt);
            if (!isNaN(d.getTime())) return d;
          }
        }
        const metaSelectors = [
          'meta[property="article:published_time"]',
          'meta[name="date"]',
          'meta[name="pubdate"]',
        ];
        for (const sel of metaSelectors) {
          const m = doc.querySelector(sel) as HTMLMetaElement | null;
          const content = m?.getAttribute('content');
          if (content) {
            const d = new Date(content);
            if (!isNaN(d.getTime())) return d;
          }
        }
        // Chercher date/heure dans les frères suivants
        const dateRegexes = [
          /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
          /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,
        ];
        const timeRegex = /(\d{1,2}):(\d{2})/;
        let sibling: Element | null = root.nextElementSibling;
        let steps = 0;
        let foundDate: string | null = null;
        let foundTime: string | null = null;
        while (sibling && steps < 3 && (!foundDate || !foundTime)) {
          const text = (sibling.textContent || '').trim();
          if (text) {
            for (const r of dateRegexes) {
              const m = text.match(r);
              if (m) {
                if (r === dateRegexes[0]) {
                  const yyyy = m[1].padStart(4, '0');
                  const mm = m[2].padStart(2, '0');
                  const dd = m[3].padStart(2, '0');
                  foundDate = `${yyyy}-${mm}-${dd}`;
                } else {
                  const dd = m[1].padStart(2, '0');
                  const mm = m[2].padStart(2, '0');
                  const yyyy = m[3].padStart(4, '0');
                  foundDate = `${yyyy}-${mm}-${dd}`;
                }
                break;
              }
            }
            const tm = text.match(timeRegex);
            if (tm) {
              const hh = tm[1].padStart(2, '0');
              const mi = tm[2].padStart(2, '0');
              foundTime = `${hh}:${mi}`;
            }
          }
          sibling = sibling.nextElementSibling;
          steps += 1;
        }
        if (foundDate) {
          const iso = new Date(`${foundDate}T${foundTime || '00:00'}:00`).toISOString();
          const d = new Date(iso);
          if (!isNaN(d.getTime())) return d;
        }
        return null;
      };
      
      // Analyser les titres pour trouver des actualités
      titles.forEach((title, index) => {
        const titleText = title.textContent?.trim();
        if (titleText && titleText.length > 10 && titleText.length < 200) {
          // Vérifier si le titre contient des mots-clés pertinents
          const relevantKeywords = [
            'أخبار', 'تحديث', 'جديد', 'إعلان', 'مؤتمر', 'ورشة', 'برنامج',
            'إطلاق', 'افتتاح', 'نتائج', 'توجيه', 'إرشاد', 'تعليم', 'مدرسة',
            'طالب', 'معلم', 'دراسة', 'امتحان', 'مشروع', 'فعالية'
          ];
          
          const hasRelevantContent = relevantKeywords.some(keyword => 
            titleText.includes(keyword)
          );
          
          if (hasRelevantContent) {
            // Chercher le contenu associé
            let content = '';
            let nextElement = title.nextElementSibling;
            let contentCount = 0;
            
            while (nextElement && contentCount < 3) {
              if (nextElement.tagName === 'P' && nextElement.textContent) {
                content += nextElement.textContent.trim() + ' ';
                contentCount++;
              }
              nextElement = nextElement.nextElementSibling;
            }
            
            // Résoudre un lien pertinent proche du titre
            let foundUrl: string | null = null;
            const wrappingAnchor = (title as Element).closest?.('a[href]') as HTMLAnchorElement | null;
            if (wrappingAnchor?.getAttribute('href')) {
              foundUrl = resolveUrl(baseUrl, wrappingAnchor.getAttribute('href'));
            }
            if (!foundUrl) {
              const innerAnchor = title.querySelector('a[href]') as HTMLAnchorElement | null;
              if (innerAnchor?.getAttribute('href')) {
                foundUrl = resolveUrl(baseUrl, innerAnchor.getAttribute('href'));
              }
            }
            if (!foundUrl) {
              const parentAnchor = title.parentElement?.querySelector('a[href]') as HTMLAnchorElement | null;
              if (parentAnchor?.getAttribute('href')) {
                foundUrl = resolveUrl(baseUrl, parentAnchor.getAttribute('href'));
              }
            }
            if (!foundUrl) {
              let sibling: Element | null = title.nextElementSibling;
              let steps = 0;
              while (sibling && steps < 3 && !foundUrl) {
                const sibAnchor = sibling.querySelector('a[href]') as HTMLAnchorElement | null;
                if (sibAnchor?.getAttribute('href')) {
                  foundUrl = resolveUrl(baseUrl, sibAnchor.getAttribute('href'));
                  break;
                }
                sibling = sibling.nextElementSibling;
                steps += 1;
              }
            }
            const finalUrl = foundUrl ?? baseUrl;

            const publishedAt = extractPublishedAt(title) || new Date();
            const timestampIso = publishedAt.toISOString();

            // Créer une actualité
            const newsItem: NewsItem = {
              id: `extracted-${Date.now()}-${index}`,
              title: titleText,
              date: timestampIso.split('T')[0],
              category: determineCategory(titleText, content),
              url: finalUrl,
              isNew: true,
              timestamp: timestampIso,
              contentSnippet: content.trim()
            };
            
            extractedNews.push(newsItem);
          }
        }
      });
      
      // Pas de création générique, on conserve uniquement les items détectés
      
    } catch (error) {
      console.error('Erreur lors de l\'extraction des actualités:', error);
      
      // En cas d'erreur, ne rien ajouter
    }
    
    return extractedNews;
  };

  const determineCategory = (title: string, content: string): string => {
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('أخبار') || text.includes('خبر')) return 'أخبار عامة';
    if (text.includes('مؤتمر') || text.includes('ورشة')) return 'مؤتمرات وورش عمل';
    if (text.includes('برنامج') || text.includes('إطلاق')) return 'برامج ومشاريع';
    if (text.includes('نتائج') || text.includes('امتحان')) return 'نتائج دراسية';
    if (text.includes('توجيه') || text.includes('إرشاد')) return 'توجيه وإرشاد';
    if (text.includes('تعليم') || text.includes('مدرسة')) return 'أخبار تعليمية';
    if (text.includes('طالب') || text.includes('معلم')) return 'أخبار الطلاب والمعلمين';
    
    return 'أخبار عامة';
  };

  const showNotification = (count: number) => {
    // Créer une notification toast
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <Bell class="w-5 h-5 animate-pulse" />
        <span>خبر عاجل! ${count} جديد</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
      toast.style.transform = 'translateX(full)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  };

  const markNewsAsRead = (newsId: string) => {
    setNews(prev => prev.map(item => 
      item.id === newsId ? { ...item, isNew: false } : item
    ));
    saveNewsToStorage();
  };

  const markAllAsRead = () => {
    setNews(prev => prev.map(item => ({ ...item, isNew: false })));
    saveNewsToStorage();
  };

  const formatLastCheck = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'منذ لحظات';
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <>
      {/* Icône dans l'en-tête du Dashboard */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        <span>أخبار عاجلة</span>
        {newNewsCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-400 text-red-700 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
            {newNewsCount}
          </span>
        )}
      </button>

      {/* Panneau des actualités */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-4xl max-h-[85vh] overflow-hidden mx-auto">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">أخبار عاجلة</h2>
                    <p className="text-blue-100">آخر التحديثات من موقع الواجز</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={checkForNews}
                    disabled={isChecking}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm">
                <span>آخر فحص: {formatLastCheck(lastCheck)}</span>
                {newNewsCount > 0 && (
                  <span className="bg-red-500 px-3 py-1 rounded-full text-sm font-bold">
                    {newNewsCount} جديد
                  </span>
                )}
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {(() => {
                const today = getTodayDateString();
                const latest = news
                  .filter(item => item.isNew && item.date === today)
                  .sort((a, b) => {
                    const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
                    const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
                    return tb - ta;
                  });
                if (latest.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>لا توجد تحديثات جديدة حالياً</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-4">
                    {latest.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        item.isNew
                          ? 'bg-red-50 border-red-200 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {item.isNew && (
                              <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full font-bold">
                                جديد
                              </span>
                            )}
                            <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                              item.isNew
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.category}
                            </span>
                            <span className="text-sm text-gray-500">{formatDateTime(item.timestamp, item.date)}</span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {item.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </a>
                          
                          {item.isNew && (
                            <button
                              onClick={() => markNewsAsRead(item.id)}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
                            >
                              مقروء
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Actions */}
            {newNewsCount > 0 && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {newNewsCount} أخبار جديدة
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    تحديد الكل كمقروء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default NewsPanel; 