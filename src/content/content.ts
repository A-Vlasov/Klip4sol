/// <reference types="chrome" />
export {};
(() => {
  // Домен X / Twitter?
  const IS_TWITTER = /twitter\.com$/.test(window.location.hostname) || /x\.com$/.test(window.location.hostname);
  // Разрешаем автоматическое сканирование только внутри X/Twitter
  const ENABLE_PAGE_SCAN = IS_TWITTER;
  // Инжектируем стили для выделения и меню
  const injectStyles = () => {
    const styles = `
      .smart-contract-highlighted {
        text-decoration: none !important;
        color: #BFAFFF !important;
        border-bottom: 2px dashed #7B4FFF !important;
        background: rgba(123,79,255,0.08) !important;
        cursor: pointer !important;
        border-radius: 3px !important;
        transition: background 0.2s;
      }
      .smart-contract-menu {
        position: absolute;
        background: #18122B;
        color: #fff;
        border: 1px solid #2D1B4A;
        border-radius: 8px;
        padding: 12px;
        font-size: 13px;
        z-index: 10000;
        box-shadow: 0 4px 12px #7B4FFF33;
        min-width: 200px;
        max-width: 280px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .smart-contract-menu .menu-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #2D1B4A;
      }
      .smart-contract-menu .network-badge {
        background: #7B4FFF;
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
      }
      .smart-contract-menu .address-display {
        font-family: monospace;
        font-size: 12px;
        color: #ccc;
        word-break: break-all;
      }
      .smart-contract-menu .info-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
      }
      .smart-contract-menu .label {
        color: #888;
      }
      .smart-contract-menu .value {
        color: #fff;
        font-weight: 500;
      }
      .smart-contract-menu .menu-buttons {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }
      .smart-contract-menu button {
        background: #4CAF50;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        flex: 1;
      }
      .smart-contract-menu button.buy {
        background: #ff5722;
      }
      .smart-contract-menu button.details {
        background: #607d8b;
      }
      .smart-contract-menu button.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .smart-contract-menu button.copy {
        background: #2196F3;
      }
      .smart-contract-menu button.close-btn {
        position: absolute;
        top: 4px;
        right: 8px;
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 16px;
        height: 16px;
        flex: none;
      }
    `;
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.appendChild(style);
  };
  injectStyles();

  // Глобальная переменная для текущего меню
  let currentMenu: HTMLElement | null = null;

  // Функция для определения типа сети по адресу
  const getNetworkType = (address: string): string => {
    if (/^[1-9A-HJ-NP-Za-km-z]{40,50}$/.test(address)) {
      return "Solana";
    } else if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return "EVM";
    } else if (/^[0-9a-fA-F]{48}$/.test(address)) {
      return "TON";
    }
    return "Unknown";
  };

  // Функция для получения короткого адреса
  const getShortAddress = (address: string): string => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  // Паттерны для детекции
  const contractPatterns = {
    solana: /[1-9A-HJ-NP-Za-km-z]{40,50}/g,
    evm: /0x[a-fA-F0-9]{40}/g,
    ton: /[0-9a-fA-F]{48}/g
  };

  const isSystemAddress = (address: string, type: string): boolean => {
    const systemAddresses = {
      solana: [
        '11111111111111111111111111111111',
        'So11111111111111111111111111111111111111112',
        'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
      ],
      evm: [
        '0x0000000000000000000000000000000000000000',
        '0x1111111111111111111111111111111111111111',
      ],
      ton: [
        '0000000000000000000000000000000000000000000000000000000000000000',
      ]
    };
    return systemAddresses[type as keyof typeof systemAddresses]?.includes(address) || false;
  };

  // Helper to format big numbers like 1.2K, 3.4M
  const formatShortNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '--';
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const timeAgo = (unix: number | undefined): string => {
    if (!unix || unix <= 0) return '--';
    const tsMs = unix > 1e12 ? unix : unix * 1000; // если секунд – умножаем
    const diff = Date.now() - tsMs;
    if (diff < 0) return 'just now';
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  };

  // Контракты, для которых мы уже запрашивали анализ, чтобы не спамить бекграунд
  const requestedAnalyses = new Set<string>();

  // Функция для создания меню токена
  const createTokenMenu = (address: string) => {
    const networkType = getNetworkType(address);
    const shortAddress = getShortAddress(address);
    
    const menu = document.createElement('div');
    menu.className = 'smart-contract-menu';
    menu.style.background = '#1a1a1a'; // Тёмный фон
    menu.style.border = '1px solid #333';
    menu.style.boxShadow = '0 4px 12px rgba(123, 79, 255, 0.2)'; // Фиолетовый акцент в тени
    
    menu.innerHTML = `
      <!-- no close btn -->
      <div class="menu-header" style="background: linear-gradient(to right, #1a1a1a, #2a2a2a); border-bottom: 1px solid #7B4FFF; padding:4px 0;">
        <span style="color: #fff; font-weight:600; font-size:14px;">Smart Contract</span>
        <span class="network-badge" style="background: #7B4FFF; color: #fff;">${networkType}</span>
      </div>
      <div class="address-display" style="color: #ccc; font-family: monospace;">${shortAddress}</div>
      <div class="analysis-section p-2" style="min-width:180px;">
        <div class="info-row"><span class="label">Loading...</span></div>
      </div>
      <div class="menu-buttons flex gap-2 mt-2">
        <button class="copy" style="background: #7B4FFF;">Copy</button>
        <button class="buy disabled" style="background: #ff5722;">Buy</button>
        <button class="details disabled" style="background: #607d8b;">Details</button>
      </div>
    `;
    
    // Обработчики кнопок
    const copyBtn = menu.querySelector('.copy') as HTMLButtonElement;
    const buyBtn = menu.querySelector('.buy') as HTMLButtonElement;
    const detailsBtn = menu.querySelector('.details') as HTMLButtonElement;
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(address);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 1000);
    });
    
    buyBtn.addEventListener('click', () => {
      const url = buyBtn.getAttribute('data-url');
      if (url) {
        window.open(url, '_blank');
      }
    });

    detailsBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({
        type: 'CONTRACT_CLICKED',
        address: address,
        contractType: networkType.toLowerCase()
      });
      hideMenu();
    });
    
    // Добавляем обработчики для меню, чтобы оно не скрывалось при наведении
    menu.addEventListener('mouseenter', () => {
      // Меню остается открытым при наведении на него
    });
    
    menu.addEventListener('mouseleave', () => {
      hideMenu();
    });
    
    // Привязываем адрес к меню, чтобы позже обновлять информацию
    menu.setAttribute('data-address', address.toLowerCase());
    
    return menu;
  };

  // Функция для показа меню
  const showMenu = (target: HTMLElement, address: string) => {
    console.log('[Content] showMenu for', address);
    hideMenu();
    
    const menu = createTokenMenu(address);
    document.body.appendChild(menu);
    
    // Позиционирование
    const rect = target.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    
    let left = rect.left + window.scrollX;
    let top = rect.bottom + window.scrollY + 4;
    
    // Проверяем, чтобы меню не выходило за границы экрана
    if (left + menuRect.width > window.innerWidth) {
      left = window.innerWidth - menuRect.width - 10;
    }
    
    if (top + menuRect.height > window.innerHeight + window.scrollY) {
      top = rect.top + window.scrollY - menuRect.height - 4;
    }
    
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    
    currentMenu = menu;

    // Убираем внешние fallback-запросы — ждём ответ от нашего service-worker
  };

  // ================= Dexscreener on-the-fly fetch ==================
  interface DexPair { priceUsd: string; fdv: number; liquidity: { usd: number }; }
  const fetchDexscreener = async (addr: string): Promise<DexPair | null> => {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${addr}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data.pairs && data.pairs.length) return data.pairs[0];
      return null;
    } catch (e) {
      console.warn('[Dexscreener] fetch failed', e);
      return null;
    }
  };

  // ============== GMGN fetch ==============
  const fetchGmgn = async (addr: string): Promise<any | null> => {
     return new Promise(resolve => {
       chrome.runtime.sendMessage({ type: 'FETCH_GMGN', address: addr }, (response) => {
         if (chrome.runtime.lastError) {
           console.warn('[GMGN] message failed', chrome.runtime.lastError);
           resolve(null);
         } else {
           console.log('[Content] GMGN response from background', response);
           resolve(response);
         }
       });
     });
   };

  // Функция для скрытия меню
  const hideMenu = () => {
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
    }
  };

  // Добавляем обработчики для скрытия меню
  document.addEventListener('scroll', hideMenu);
  document.addEventListener('click', (e) => {
    if (currentMenu && !currentMenu.contains(e.target as Node)) {
      hideMenu();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideMenu();
    }
  });

  // Функция для создания span с адресом
  const createAddressSpan = (address: string, type: string) => {
    const span = document.createElement('span');
    span.textContent = address;
    span.style.cursor = 'pointer';
    span.style.borderBottom = '1px dashed #4CAF50';
    span.style.padding = '1px 2px';
    span.style.borderRadius = '3px';
    span.style.transition = 'background 0.2s';
    span.classList.add('smart-contract-highlighted');
    span.setAttribute('data-contract-type', type);
    span.setAttribute('data-contract-address', address);
    
    // Наведение для меню только на сам адрес
    span.addEventListener('mouseenter', () => {
      span.style.background = 'rgba(76,175,80,0.1)';

      // Показываем меню
      showMenu(span, address);

      console.log('[Content] Hover on address:', address);

      // Автоматически запрашиваем анализ, если ещё не запрашивали
      const addrKey = address.toLowerCase();
        console.log('[Content] send CONTRACT_ANALYZE', address);
        chrome.runtime.sendMessage({
          type: 'CONTRACT_ANALYZE',
          address: address,
          contractType: type
        });
      // Добавляем метку, но не блокируем повторные запросы — можем использовать для логики rate-limit при необходимости
        requestedAnalyses.add(addrKey);
    });
    
    span.addEventListener('mouseleave', () => {
      span.style.background = 'transparent';
      const delay = 300;
      const menuRef = currentMenu; // menu that was open at moment of leave
      setTimeout(() => {
        if (currentMenu === menuRef && currentMenu && !currentMenu.matches(':hover')) {
        hideMenu();
      }
      }, delay);
    });
    
    return span;
  };

  // Основная функция сканирования
  const scanPageForContracts = () => {
    if (!ENABLE_PAGE_SCAN) return;
    console.log('🔍 Starting page scan...');
    
    // Сканируем расширенный набор элементов
    const addressElements = document.querySelectorAll('[data-address], [data-contract], [data-token], code, pre, .contract-address, .address, .token-address, .contract, span, div');
    console.log(`🔍 Found ${addressElements.length} elements to scan`);
    
    let foundContracts = 0;
    
    addressElements.forEach((element, index) => {
      const text = element.textContent || '';
      
      Object.entries(contractPatterns).forEach(([type, pattern]) => {
        // На X/Twitter допускаем только Solana-адреса
        if (IS_TWITTER && type !== 'solana') return;
        const matches = text.match(pattern);
        if (matches) {
          matches.forEach(address => {
            if (!isSystemAddress(address, type)) {
              console.log(`🎯 Highlighting ${type} address: ${address}`);
              
              // Создаем span с адресом и заменяем текст
              const addressSpan = createAddressSpan(address, type);
              
              // Заменяем адрес в тексте на span
              const newText = text.replace(address, addressSpan.outerHTML);
              element.innerHTML = newText;
              
              foundContracts++;
            } else {
              console.log(`🚫 Skipped system address: ${address}`);
            }
          });
        }
      });
    });
    
    console.log(`🎉 Scan complete! Found ${foundContracts} contracts to highlight`);
  };

  // Обработка сообщений
  chrome.runtime.onMessage.addListener((message) => {
    console.log('📨 Received message:', message);
    if (message.type === 'SCAN_PAGE') {
      if (ENABLE_PAGE_SCAN) {
      console.log('🚀 Starting scan from message...');
      scanPageForContracts();
      }
    } else if (message.type === 'CONTRACT_ANALYSIS_READY') {
      const { address, analysis } = message as any;
      console.log('[Content] CONTRACT_ANALYSIS_READY for', address, analysis);
      // Находим меню, связанное с этим адресом
      const menu = document.querySelector(`.smart-contract-menu[data-address="${address.toLowerCase()}"]`) as HTMLElement | null;
      if (!menu) {
        console.warn('[Content] Menu not found for address', address);
      }
      if (menu) {
        const analysisSection = menu.querySelector('.analysis-section') as HTMLElement | null;
        if (analysisSection) {
          // Формируем HTML с информацией
          const price = analysis?.tokenInfo?.price;
          const marketCap = analysis?.tokenInfo?.marketCap;
          const holders = analysis?.tokenInfo?.holder_count;
          const bundlers = analysis?.tokenInfo?.bundlers;
          const createdTs = analysis?.tokenInfo?.open_timestamp;

          const securityStatus = analysis?.securityInfo?.status;
          const securityScore = analysis?.securityInfo?.score;

          analysisSection.innerHTML = `
            <div class="info-row"><span class="label">Price:</span><span class="value">${price !== undefined ? `$${price.toFixed(6)}` : '--'}</span></div>
            <div class="info-row"><span class="label">MCap:</span><span class="value">${formatShortNumber(marketCap)}</span></div>
            <div class="info-row"><span class="label">Holders:</span><span class="value">${formatShortNumber(holders)}</span></div>
            <div class="info-row"><span class="label">Bundlers:</span><span class="value">${formatShortNumber(bundlers)}</span></div>
            <div class="info-row"><span class="label">Created:</span><span class="value">${timeAgo(createdTs)}</span></div>
            ${securityStatus ? `<div class="info-row"><span class="label">Security:</span><span class="value">${securityStatus} ${securityScore ? `(${securityScore})` : ''}</span></div>` : ''}
          `;

          // Обновляем кнопки
          const buyBtn = menu.querySelector('.buy') as HTMLButtonElement | null;
          const detailsBtn = menu.querySelector('.details') as HTMLButtonElement | null;

          if (buyBtn) {
            let buyUrl: string | null = null;
            if (analysis?.tokenInfo?.link && typeof analysis.tokenInfo.link === 'string') {
              buyUrl = analysis.tokenInfo.link;
            } else if (analysis?.tokenInfo?.link?.buy_url) {
              buyUrl = analysis.tokenInfo.link.buy_url;
            } else if (analysis?.tokenInfo?.address) {
              buyUrl = `https://dexscreener.com/search?q=${analysis.tokenInfo.address}`;
            }
            if (buyUrl) {
              buyBtn.setAttribute('data-url', buyUrl);
              buyBtn.classList.remove('disabled');
            }
          }

          if (detailsBtn) {
            detailsBtn.classList.remove('disabled');
          }
        }
      }
    }
  });

  // Автоматическое сканирование при загрузке страницы (кроме twitter/x.com — там работает специальный обработчик)
  if (ENABLE_PAGE_SCAN) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scanPageForContracts);
  } else {
    scanPageForContracts();
  }
  }

  // =========================  X.COM / TWITTER SUPPORT  =========================

  // Собираем все текстовые узлы (DFS)
  const collectTextNodesDFS = (element: Node, nodes: Text[] = []): Text[] => {
    if (element.nodeType === Node.TEXT_NODE) {
      nodes.push(element as Text);
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      element.childNodes.forEach(child => collectTextNodesDFS(child, nodes));
    }
    return nodes;
  };

  const processTweetElement = (tweetElem: HTMLElement) => {
    if (tweetElem.classList.contains('smart-contract-processed')) return;
    tweetElem.classList.add('smart-contract-processed');

    // Собираем все текстовые узлы твита
    const textNodes = collectTextNodesDFS(tweetElem);
    if (textNodes.length === 0) return;

    // Склеиваем текст
    const fullText = textNodes.map(n => n.textContent).join('');
    if (!fullText) return;

    // Находим все совпадения для наших паттернов
    interface MatchInfo { start: number; end: number; value: string; addrType: string; }
    const matches: MatchInfo[] = [];
    Object.entries(contractPatterns).forEach(([type, pattern]) => {
      // На X/Twitter вводим фильтр: только Solana адреса
      if (IS_TWITTER && type !== 'solana') return;
      let m: RegExpExecArray | null;
      const regex = new RegExp(pattern.source, 'g');
      while ((m = regex.exec(fullText)) !== null) {
        // Дополнительная проверка для Solana длины
        if (type === 'solana' && (m[0].length < 32 || m[0].length > 50)) continue;
        matches.push({ start: m.index, end: m.index + m[0].length, value: m[0], addrType: type });
      }
    });

    if (matches.length === 0) return;

    // Сортируем по позиции
    matches.sort((a, b) => a.start - b.start);

    // Формируем фрагменты
    const fragments: Array<{ type: 'text' | 'address'; value: string; addrType?: string }> = [];
    let lastIndex = 0;
    for (const match of matches) {
      if (match.start > lastIndex) {
        fragments.push({ type: 'text', value: fullText.slice(lastIndex, match.start) });
      }
      fragments.push({ type: 'address', value: match.value, addrType: match.addrType });
      lastIndex = match.end;
    }
    if (lastIndex < fullText.length) {
      fragments.push({ type: 'text', value: fullText.slice(lastIndex) });
    }

    // Удаляем старые текстовые узлы
    textNodes.forEach(node => {
      if (node.parentNode) node.parentNode.removeChild(node);
    });

    // Вставляем новые фрагменты в общего родителя
    const frag = document.createDocumentFragment();
    fragments.forEach(fragItem => {
      if (fragItem.type === 'text') {
        frag.appendChild(document.createTextNode(fragItem.value));
      } else {
        const span = createAddressSpan(fragItem.value, fragItem.addrType!);
        frag.appendChild(span);
      }
    });

    // Выбираем родителя для вставки — родитель первого текстового узла, если он существует и является ELEMENT_NODE
    let parentNode: Node = tweetElem;
    if (textNodes[0] && textNodes[0].parentNode && textNodes[0].parentNode !== tweetElem) {
      parentNode = textNodes[0].parentNode;
    }

    parentNode.insertBefore(frag, parentNode.firstChild);
  };

  const initTwitterObserver = () => {
    if (!ENABLE_PAGE_SCAN) return;
    if (!IS_TWITTER) return;
    
    // Обрабатываем уже существующие твиты
    document.querySelectorAll('[data-testid="tweetText"]').forEach(el => {
      processTweetElement(el as HTMLElement);
    });

    // Наблюдаем за новыми твитами
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          const elem = node as HTMLElement;
          if (elem.matches && elem.matches('[data-testid="tweetText"]')) {
            processTweetElement(elem);
          } else if (elem.querySelectorAll) {
            elem.querySelectorAll('[data-testid="tweetText"]').forEach(child => {
              processTweetElement(child as HTMLElement);
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  // Запускаем Twitter поддержку после основного сканирования
  if (ENABLE_PAGE_SCAN) initTwitterObserver();
})(); 