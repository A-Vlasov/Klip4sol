import { useEffect, useState, useRef } from 'react';
import type { TokenAnalysis, RuntimeMessage } from '../utils/messages';

// Types for navigation
type Page = 'dashboard' | 'details' | 'settings' | 'history';

// History item type
interface HistoryItem {
  address: string;
  name: string;
  symbol: string;
  timestamp: number;
}

const formatShortNumber = (num: number | undefined) => {
  if (num === undefined || num === null) return '--';
  if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const trendArrow = (change: number | undefined) => {
  if (change === undefined) return null;
  if (change > 0) return <span className="dynamic-up ml-1">▲</span>;
  if (change < 0) return <span className="dynamic-down ml-1">▼</span>;
  return null;
};

const DynamicCard = ({
  title,
  price,
  priceChange,
  volume,
  swaps,
  buys,
  sells,
  net,
  maxVolume
}: {
  title: string;
  price?: number;
  priceChange?: number;
  volume?: number;
  swaps?: number;
  buys?: number;
  sells?: number;
  net?: number;
  maxVolume: number;
}) => (
  <div className="dynamic-card flex-1 min-w-0 flex flex-col items-center py-2">
    <div className="dynamic-title mb-1">{title}</div>
    <div className="flex items-end gap-1 mb-2 w-full justify-center">
      <span className="dynamic-price font-bold text-lg dynamic-price-pretty" title={price !== undefined ? `$${price}` : ''}>{formatPricePretty(price)}</span>
      {priceChange !== undefined && (
        <span className="flex items-center ml-2 dynamic-change-block">
          {priceChange > 0 && <span className="dynamic-up-arrow">▲</span>}
          {priceChange < 0 && <span className="dynamic-down-arrow">▼</span>}
          {priceChange === 0 && <span className="dynamic-zero-arrow">–</span>}
          <span className={`dynamic-change-value ${priceChange > 0 ? 'text-green-400' : priceChange < 0 ? 'text-red-400' : ''}`}>{priceChange > 0 ? '+' : priceChange < 0 ? '' : ''}{priceChange.toFixed(2)}%</span>
        </span>
      )}
    </div>
    <div className="dynamic-bar minimal-bar mb-2 w-3/4" />
    <div className="flex flex-col gap-1 w-full items-center">
      <div className="flex justify-between w-full text-xs text-gray-400/80 font-medium">
        <span>Volume</span>
        <span className="dynamic-compact-value text-white font-semibold">{formatShortNumber(volume)}</span>
      </div>
      <div className="flex justify-between w-full text-xs text-gray-400/80 font-medium">
        <span>Trades</span>
        <span className="dynamic-compact-value text-white font-semibold">{formatShortNumber(swaps)}</span>
      </div>
      <div className="flex justify-between w-full text-xs text-gray-400/80 font-medium">
        <span>Flow</span>
        <span className="dynamic-compact-value text-white font-semibold">{net === undefined ? '--' : formatShortNumber(net)}</span>
      </div>
    </div>
  </div>
);

const formatPriceCompact = (price: number | undefined) => {
  if (price === undefined || price === null) return '--';
  if (price > 0 && price < 0.0001) return '$<0.0001';
  if (price < 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
};

const formatPriceFull = (price: number | undefined) => {
  if (price === undefined || price === null) return '--';
  if (price > 0 && price < 0.00000001) return `$${price.toFixed(10)}`;
  if (price > 0 && price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
};

const formatPricePretty = (price: number | undefined) => {
  if (price === undefined || price === null) return '--';
  if (price > 0 && price < 0.0001) {
    const str = price.toFixed(10).replace(/0+$/, '');
    const [main, tail] = [str.slice(0, 7), str.slice(7)];
    if (tail.replace(/0/g, '').length > 0) {
      // there are significant digits after zeros
      return <span>$0.0000<span className="muted">...{tail.replace(/^0+/, '')}</span></span>;
    } else {
      return `$${str}`;
    }
  }
  if (price < 0.01) return `$${price.toFixed(6)}`;
  return `$${price.toFixed(4)}`;
};

const MiniStatsTooltip = ({ analysis }: { analysis: TokenAnalysis | null }) => {
  if (!analysis || !analysis.tokenInfo) return null;
  const t = analysis.tokenInfo;
  return (
    <div className="mini-stats-tooltip">
      <div>Market Cap: <b>{formatShortNumber(t.marketCap)}</b></div>
      <div>Holders: <b>{formatShortNumber(t.holder_count)}</b></div>
      <div>Bundlers: <b>{formatShortNumber(t.bundlers)}</b></div>
    </div>
  );
};

const SecurityStatus = ({ analysis }: { analysis: TokenAnalysis | null }) => {
  if (!analysis?.securityInfo) return null;
  
  const { status, score, risk_factors, rugged, liquidity, detectedAt } = analysis.securityInfo;
  if (!status || status === 'unknown') return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'text-green-400';
      case 'caution': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'safe': return 'Safe';
      case 'caution': return 'Caution';
      case 'danger': return 'Danger';
      default: return 'Unknown';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-green-400/10 border-green-400/20';
      case 'caution': return 'bg-yellow-400/10 border-yellow-400/20';
      case 'danger': return 'bg-red-400/10 border-red-400/20';
      default: return 'bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className={`security-status mb-4 p-3 rounded-lg border ${getStatusBgColor(status)}`}>
      <div className="security-header flex items-center justify-between mb-2">
        <span className="security-label text-sm font-medium">Security Status</span>
        <span className={`security-value text-sm font-bold ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </span>
      </div>
      
      <div className="security-details space-y-2">
        {score > 0 && (
          <div className="security-score flex items-center justify-between text-xs">
            <span className="text-gray-300">Risk Score:</span>
            <span className={`font-medium ${score < 1000 ? 'text-green-400' : score < 5000 ? 'text-yellow-400' : 'text-red-400'}`}>
              {score.toLocaleString()}
            </span>
          </div>
        )}
        
        {rugged !== undefined && (
          <div className="security-rugged flex items-center justify-between text-xs">
            <span className="text-gray-300">Rugged:</span>
            <span className={rugged ? 'text-red-400 font-medium' : 'text-green-400 font-medium'}>
              {rugged ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        
        {liquidity && (
          <div className="security-liquidity flex items-center justify-between text-xs">
            <span className="text-gray-300">Liquidity:</span>
            <span className="text-white font-medium">
              ${liquidity.toLocaleString()}
            </span>
          </div>
        )}
        
        {detectedAt && (
          <div className="security-detected flex items-center justify-between text-xs">
            <span className="text-gray-300">Detected:</span>
            <span className="text-gray-400">
              {new Date(detectedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
      
      {risk_factors && risk_factors.length > 0 && (
        <div className="security-risks mt-3 pt-3 border-t border-gray-600/30">
          <div className="risks-label text-xs font-medium text-gray-300 mb-2">Risk Factors:</div>
          <div className="risks-list space-y-1">
            {risk_factors.slice(0, 3).map((factor, index) => {
              // Дополнительная защита - убеждаемся, что factor это строка
              let factorText: string;
              if (typeof factor === 'string') {
                factorText = factor;
              } else if (typeof factor === 'object' && factor !== null) {
                const obj = factor as any;
                factorText = obj.name || obj.description || obj.value || JSON.stringify(obj);
              } else {
                factorText = String(factor);
              }
              
              return (
                <div key={index} className="risk-factor text-xs text-gray-400 flex items-start">
                  <span className="text-red-400 mr-1">•</span>
                  <span>{factorText}</span>
                </div>
              );
            })}
            {risk_factors.length > 3 && (
              <div className="risk-factor text-xs text-gray-500">
                +{risk_factors.length - 3} more risks
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Функция для определения категории токена
const getTokenCategory = (analysis: TokenAnalysis | null): 'Safe' | 'Caution' | 'Danger' => {
  if (!analysis?.tokenInfo) return 'Caution';
  
  const t = analysis.tokenInfo;
  let score = 0;
  
  // Оценка на основе базовых метрик
  if (t.holder_count && t.holder_count > 100) score += 1; // Много холдеров
  if (t.liquidity && t.liquidity > 10000) score += 1; // Высокая ликвидность
  if (t.marketCap && t.marketCap > 100000) score += 1; // Приличная капитализация
  
  if (score >= 2) return 'Safe';
  if (score >= 1) return 'Caution';
  return 'Danger';
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Safe': return 'text-green-400';
    case 'Caution': return 'text-yellow-400';
    case 'Danger': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const TokenCategory = ({ analysis }: { analysis: TokenAnalysis | null }) => {
  if (!analysis?.tokenInfo) return null;
  
  const category = getTokenCategory(analysis);
  const t = analysis.tokenInfo;
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Safe': return '🟢';
      case 'Caution': return '🟡';
      case 'Danger': return '🔴';
      default: return '⚪';
    }
  };
  
  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'Safe': return 'Low risk token with good fundamentals';
      case 'Caution': return 'Moderate risk, proceed with care';
      case 'Danger': return 'High risk, potential scam detected';
      default: return 'Risk level unknown';
    }
  };
  
  const getCategoryBgColor = (category: string) => {
    switch (category) {
      case 'Safe': return 'bg-green-400/10 border-green-400/30';
      case 'Caution': return 'bg-yellow-400/10 border-yellow-400/30';
      case 'Danger': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-gray-400/10 border-gray-400/30';
    }
  };
  
  return (
    <div className={`token-category mb-4 p-3 rounded-lg border ${getCategoryBgColor(category)}`}>
      <div className="category-header flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(category)}</span>
          <span className="text-sm font-medium">Token Category</span>
        </div>
        <span className={`category-label text-sm font-bold ${getCategoryColor(category)}`}>
          {category}
        </span>
      </div>
      
      <div className="category-description text-xs text-gray-300 mb-3">
        {getCategoryDescription(category)}
      </div>
      
      <div className="category-metrics space-y-1">
        <div className="metric flex items-center justify-between text-xs">
          <span className="text-gray-400">Holders:</span>
          <span className={`font-medium ${t.holder_count && t.holder_count > 100 ? 'text-green-400' : 'text-gray-400'}`}>
            {t.holder_count?.toLocaleString() || 0}
          </span>
        </div>
        <div className="metric flex items-center justify-between text-xs">
          <span className="text-gray-400">Liquidity:</span>
          <span className={`font-medium ${t.liquidity && t.liquidity > 10000 ? 'text-green-400' : 'text-gray-400'}`}>
            ${t.liquidity?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<TokenAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [lastCA, setLastCA] = useState<string | null>(null);
  const [showCAAlert, setShowCAAlert] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    console.log('[Popup] Requesting analysis data');
    
    // Загружаем историю из storage
    chrome.storage.local.get(['analysisHistory'], (result) => {
      if (result.analysisHistory) {
        setHistory(result.analysisHistory);
      }
    });
    
    chrome.runtime.sendMessage({ type: 'GET_ANALYSIS' } as RuntimeMessage, (resp) => {
      console.log('[Popup] Received response from background:', resp);
      if (resp) {
        console.log('[Popup] Setting analysis data:', resp);
        setAnalysis(resp);
        if (resp.tokenInfo?.address && resp.tokenInfo.address !== lastCA) {
          setLastCA(resp.tokenInfo.address);
          setShowCAAlert(true);
          setTimeout(() => setShowCAAlert(false), 2000);
          
          // Add to history
          if (resp.tokenInfo.address && resp.tokenInfo.name) {
            const newHistoryItem: HistoryItem = {
              address: resp.tokenInfo.address,
              name: resp.tokenInfo.name,
              symbol: resp.tokenInfo.symbol || '',
              timestamp: Date.now()
            };
            setHistory(prev => {
              const filtered = prev.filter(item => item.address !== resp.tokenInfo.address);
              const newHistory = [newHistoryItem, ...filtered].slice(0, 10); // Keep last 10
              
              // Сохраняем в storage
              chrome.storage.local.set({ analysisHistory: newHistory });
              
              return newHistory;
            });
          }
        }
      } else {
        console.log('[Popup] No analysis data received');
      }
    });
    const listener = (msg: RuntimeMessage) => {
      console.log('[Popup] Received runtime message:', msg);
      if (msg.type === 'ANALYSIS_READY') {
        console.log('[Popup] Setting analysis from ANALYSIS_READY:', (msg as any).analysis);
        setAnalysis((msg as any).analysis);
        setLoading(false);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '--';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString();
  };
  const formatPercent = (num: number | undefined) => {
    if (num === undefined || num === null) return '--';
    return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // --- Legacy fields ---
  const t = analysis?.tokenInfo;
  const holders = analysis?.topBuyers;
  const holdersMeta = analysis?.topBuyersMeta;
  const social = t?.link || {}; // Используем поле link вместо social_links
  const links = t?.link || {};

  // Market Cap
  const marketCap = t?.marketCap || t?.market_cap;
  // Top Holders (number of unique holders or top-10)
  const topHolders = holdersMeta?.holder_count || t?.holder_count || (holders ? holders.length : undefined);
  // Dev Holding (search for holder with dev/team tag, if any)
  let devHolding = '--';
  if (holders && holders.length > 0) {
    const dev = holders.find(h => h.tags && h.tags.some(tag => tag.toLowerCase().includes('dev') || tag.toLowerCase().includes('team')));
    if (dev) devHolding = dev.wallet;
  }
  // LP Burned (no direct field, leave as "--")
  const lpBurned = '--';

  // Bottom navigation component
  const BottomNav = () => (
    <div className="bottom-navbar">
      <button
        className={`nav-item ${currentPage === 'dashboard' ? 'nav-item-active' : ''}`}
        onClick={() => setCurrentPage('dashboard')}
      >
        <img src={chrome.runtime.getURL('images/scan.png')} alt="scan" className="nav-icon-img" />
        <span className="nav-label text-[0.7rem] font-semibold">Scan</span>
      </button>
      <button
        className={`nav-item ${currentPage === 'history' ? 'nav-item-active' : ''}`}
        onClick={() => setCurrentPage('history')}
      >
        <img src={chrome.runtime.getURL('images/history.png')} alt="history" className="nav-icon-img" />
        <span className="nav-label text-[0.7rem] font-semibold">History</span>
      </button>
      <button
        className={`nav-item ${currentPage === 'settings' ? 'nav-item-active' : ''}`}
        onClick={() => setCurrentPage('settings')}
      >
        <img src={chrome.runtime.getURL('images/settings.png')} alt="settings" className="nav-icon-img" />
        <span className="nav-label text-[0.7rem] font-semibold">Settings</span>
      </button>
    </div>
  );

  // Карточка метрики
  const StatCard = ({ icon, label, value, valueClass }: { icon: string; label: string; value: string; valueClass?: string }) => (
    <div className="stat-card flex flex-col items-center justify-center rounded-lg border border-[#353535] bg-[#121212] py-3 px-2 text-center shadow-md">
      <span className="text-xl mb-1">{icon}</span>
      <span className="text-xs font-semibold text-gray-200 mb-0.5">{label}</span>
      <span className={`text-sm font-semibold ${valueClass ?? ''}`}>{value}</span>
    </div>
  );

  // --- DashboardPage redesign ---
  const DashboardPage = () => {
    const data = analysis?.tokenInfo;
    const inputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="flex flex-col gap-4 px-4 pb-0 pt-2 w-full h-full text-gray-200 animate-fade">
        {/* Header Logo (bigger) */}
        <div className="flex flex-col items-center mb-1">
          <img src="../icons/icon128.png" alt="logo" className="w-16 h-16 mb-2" />
          <span className="text-[11px] text-gray-400 font-medium">
            • Connected <span className="mx-1">•</span> AI <span className="mx-1">•</span> <span className="text-[#b9b9ff]">v1.2</span>
          </span>
        </div>

        {/* Address input */}
        <div className="relative">
          <input
            ref={inputRef}
            defaultValue={data?.address || ''}
            className="w-full rounded-md bg-[#0d0d0d] border border-[#353535] py-2 pl-3 pr-8 text-sm placeholder-gray-500 focus:outline-none focus:border-[#7B4FFF]"
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-lg"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            ×
          </button>
        </div>

        {/* Analyze Contract button (more subtle) */}
        <button
          className="w-full text-center rounded-md bg-gradient-to-r from-[#41316a] to-[#2d2d2d] text-[#d4c4ff] font-semibold py-2 shadow"
          onClick={() => {
            const addr = (inputRef.current?.value || '').trim();
            if (!addr) return;

            // Отправляем запрос на анализ в background-script
            setLoading(true);
            chrome.runtime.sendMessage({ type: 'GET_ANALYSIS', address: addr } as RuntimeMessage, (resp) => {
              if (resp) {
                setAnalysis(resp);
                // Обновляем историю (дублируем логику из useEffect)
                if (resp.tokenInfo?.address && resp.tokenInfo.name) {
                  const newHistoryItem: HistoryItem = {
                    address: resp.tokenInfo.address,
                    name: resp.tokenInfo.name,
                    symbol: resp.tokenInfo.symbol || '',
                    timestamp: Date.now()
                  };
                  setHistory(prev => {
                    const filtered = prev.filter(item => item.address !== resp.tokenInfo!.address);
                    const newHistory = [newHistoryItem, ...filtered].slice(0, 10);
                    chrome.storage.local.set({ analysisHistory: newHistory });
                    return newHistory;
                  });
                }
              }
              setLoading(false);
            });
          }}
        >
          Analyze Contract
        </button>

        {/* Stats grid (show only if analysis loaded) */}
        {analysis && data && (
          <div className="grid grid-cols-3 gap-3 text-[13px]">
            <StatCard icon="🛡️" label="Honeypot" value={analysis.securityInfo?.status || '--'} valueClass={analysis.securityInfo?.status==='safe'?'text-green-400':analysis.securityInfo?.status==='danger'?'text-red-400':'text-yellow-400'} />
            <StatCard icon="🔒" label="LP Lock" value="--" />
            <StatCard icon="📊" label="Score" value={`${analysis.securityInfo?.score !== undefined ? analysis.securityInfo.score : '--'}`} />
            <StatCard icon="👤" label="Holders" value={formatNumber(data.holder_count)} />
            <StatCard icon="💰" label="Volume" value={`$${formatNumber(data.volume_24h)}`} />
            <StatCard icon="💎" label="Token" value={data.name || '--'} />
            <StatCard icon="🔄" label="Buy/Sell" value={`${formatNumber(data.buys_24h)}/${formatNumber(data.sells_24h)}`} />
            <StatCard icon="🎒" label="Top Wallet" value={analysis.topBuyers?.[0]?.wallet ? analysis.topBuyers[0].wallet.slice(0,4)+'…' : '--'} />
            <StatCard icon="✅" label="Rugged" value={analysis.securityInfo?.rugged ? 'Yes' : 'No'} valueClass={analysis.securityInfo?.rugged?'text-red-400':'text-green-400'} />
          </div>
        )}

        {/* Quick actions */}
        <div className="flex justify-around gap-2 mt-4">
          <button
            className="action-btn flex-1 text-center py-2"
            onClick={() => {
              const addr = (inputRef.current?.value || '').trim();
              if (addr) window.open(`https://dexscreener.com/search?q=${addr}`, '_blank');
            }}
          >
            View on DEX
          </button>
          <button
            className="action-btn flex-1 text-center py-2"
            onClick={() => {
              const addr = (inputRef.current?.value || '').trim();
              if (addr) window.open(`https://app.uniswap.org/#/swap?outputCurrency=${addr}`, '_blank');
            }}
          >
            Buy
          </button>
          <button
            className="action-btn flex-1 text-center py-2"
            onClick={() => {
              const addr = (inputRef.current?.value || '').trim();
              if (addr) window.open(`https://twitter.com/search?q=${addr}`, '_blank');
            }}
          >
            Search on X
          </button>
        </div>
      </div>
    );
  };

  // Details page component
  const DetailsPage = () => {
    if (!analysis?.tokenInfo) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading detailed analysis...</p>
        </div>
      );
    }

    const t = analysis.tokenInfo;
    const social = t.link || {}; // Используем поле link вместо social_links
    const links = t.link || {};

    return (
      <div className="details-page">
        <h2 className="page-title mb-4">Detailed Analysis</h2>
        
        {/* Extended Stats */}
        <div className="extended-stats-grid mb-4">
          <div className="stat-card">
            <div className="stat-label">FDV</div>
            <div className="stat-value">{formatShortNumber(t.fdv)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Supply</div>
            <div className="stat-value">{formatShortNumber(t.total_supply)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Bundlers</div>
            <div className="stat-value">{formatShortNumber(t.bundlers)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Circulating</div>
            <div className="stat-value">{formatShortNumber(t.circulating_supply)}</div>
          </div>
        </div>

        {/* Dynamics Section */}
        <div className="dynamics-section mb-4">
          <h3 className="section-title text-base font-semibold mb-2">Dynamics (price/volume/trades)</h3>
          <div className="flex gap-3 text-sm">
            <DynamicCard
              title="1m"
              price={t.price_1m}
              priceChange={t.price_1m && t.price_24h ? ((t.price_1m - t.price_24h) / t.price_24h) * 100 : undefined}
              volume={t.volume_1m}
              swaps={t.swaps_1m}
              buys={t.buys_1m}
              sells={t.sells_1m}
              net={t.net_in_volume_1m}
              maxVolume={Math.max(t.volume_1m || 0, t.volume_1h || 0, t.volume_24h || 0)}
            />
            <DynamicCard
              title="1h"
              price={t.price_1h}
              priceChange={t.price_1h && t.price_24h ? ((t.price_1h - t.price_24h) / t.price_24h) * 100 : undefined}
              volume={t.volume_1h}
              swaps={t.swaps_1h}
              buys={t.buys_1h}
              sells={t.sells_1h}
              net={t.net_in_volume_1h}
              maxVolume={Math.max(t.volume_1m || 0, t.volume_1h || 0, t.volume_24h || 0)}
            />
            <DynamicCard
              title="24h"
              price={t.price_24h}
              priceChange={t.price_24h && t.price_1h ? ((t.price_24h - t.price_1h) / t.price_1h) * 100 : undefined}
              volume={t.volume_24h}
              swaps={t.swaps_24h}
              buys={t.buys_24h}
              sells={t.sells_24h}
              net={t.net_in_volume_24h}
              maxVolume={Math.max(t.volume_1m || 0, t.volume_1h || 0, t.volume_24h || 0)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="social-links-section mb-4">
          <h3 className="section-title text-base font-semibold mb-2">Links</h3>
          <div className="flex flex-wrap gap-2">
            {social.website && <a href={social.website} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">Website</a>}
            {social.twitter_username && <a href={`https://twitter.com/${social.twitter_username}`} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">Twitter</a>}
            {social.discord && <a href={social.discord} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">Discord</a>}
            {social.github && <a href={social.github} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">GitHub</a>}
            {social.medium && <a href={social.medium} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">Medium</a>}
            {social.reddit && <a href={social.reddit} target="_blank" rel="noreferrer" className="btn-main text-[0.98rem] py-2 px-4">Reddit</a>}
          </div>
        </div>

        {/* Holder Distribution Chart */}
        {holders && holders.length > 0 && (
          <div className="holder-chart-section mb-4">
            <h3 className="section-title text-base font-semibold mb-2">Top Holders Distribution</h3>
            <div className="holder-chart">
              <svg width="100%" height="120" className="chart-svg">
                {holders.slice(0, 5).map((holder, index) => {
                  const percentage = (index + 1) * 20; // Упрощённая логика
                  const barHeight = 20 + (index * 15);
                  return (
                    <g key={index}>
                      <rect
                        x="10"
                        y={10 + (index * 25)}
                        width={`${percentage}%`}
                        height="20"
                        fill="#7B4FFF"
                        opacity={0.8 - (index * 0.1)}
                        rx="3"
                      />
                      <text
                        x="15"
                        y={25 + (index * 25)}
                        fill="white"
                        fontSize="10"
                        className="chart-text"
                      >
                        {holder.wallet.slice(0, 6)}...{holder.wallet.slice(-4)} ({percentage}%)
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Settings page component
  const SettingsPage = () => {
    const [settings, setSettings] = useState({
      showMarketCap: true,
      showHolders: true,
      showPriceDynamics: true,
      showVolumeData: true,
      showSecurityStatus: true,
      showTokenCategory: true,
      caDetectionAlerts: true,
      priceChangeNotifications: false,
      volumeSpikeAlerts: false
    });

    const handleSettingChange = (key: string, value: boolean) => {
      setSettings(prev => ({ ...prev, [key]: value }));
      // TODO: Сохранить в chrome.storage
    };

    return (
      <div className="settings-page">
        <h2 className="page-title mb-4">Settings</h2>
        
        <div className="settings-section mb-4">
          <h3 className="settings-heading mb-2">Display Options</h3>
          <div className="settings-options">
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showMarketCap}
                onChange={(e) => handleSettingChange('showMarketCap', e.target.checked)}
              />
              <span>Show market cap</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showHolders}
                onChange={(e) => handleSettingChange('showHolders', e.target.checked)}
              />
              <span>Show holders count</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showPriceDynamics}
                onChange={(e) => handleSettingChange('showPriceDynamics', e.target.checked)}
              />
              <span>Show price dynamics</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showVolumeData}
                onChange={(e) => handleSettingChange('showVolumeData', e.target.checked)}
              />
              <span>Show volume data</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showSecurityStatus}
                onChange={(e) => handleSettingChange('showSecurityStatus', e.target.checked)}
              />
              <span>Show security status</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.showTokenCategory}
                onChange={(e) => handleSettingChange('showTokenCategory', e.target.checked)}
              />
              <span>Show token category</span>
            </label>
          </div>
        </div>

        <div className="settings-section mb-4">
          <h3 className="settings-heading mb-2">Notifications</h3>
          <div className="settings-options">
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.caDetectionAlerts}
                onChange={(e) => handleSettingChange('caDetectionAlerts', e.target.checked)}
              />
              <span>CA detection alerts</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.priceChangeNotifications}
                onChange={(e) => handleSettingChange('priceChangeNotifications', e.target.checked)}
              />
              <span>Price change notifications</span>
            </label>
            <label className="setting-item">
              <input 
                type="checkbox" 
                checked={settings.volumeSpikeAlerts}
                onChange={(e) => handleSettingChange('volumeSpikeAlerts', e.target.checked)}
              />
              <span>Volume spike alerts</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const HistoryPage = () => {
    if (history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center mt-12 text-gray-400 text-sm">
          No history? Either a fresh start or a missed opportunity.
        </div>
      );
    }
    return (
      <div className="history-list px-4 py-2">
        {history.map((item, idx) => (
          <div key={idx} className="history-item flex flex-col mb-2 p-2 rounded-md bg-[#22173A] cursor-pointer"
            onClick={() => {
              setCurrentPage('dashboard');
              chrome.runtime.sendMessage({ type: 'GET_ANALYSIS', address: item.address } as RuntimeMessage);
            }}
          >
            <span className="text-[#BFAFFF] font-semibold">{item.name} ({item.symbol})</span>
            <span className="text-gray-500 text-xs">{item.address.slice(0,6)}...{item.address.slice(-4)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-2 pb-24 w-[440px] h-full flex flex-col overflow-y-auto">
      {/* Pages */}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'settings' && <SettingsPage />}
      <BottomNav />
    </div>
  );
};

export default App; 