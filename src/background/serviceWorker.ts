/// <reference types="chrome" />
import type { TokenAnalysis, RuntimeMessage, RugcheckData } from '../utils/messages';

// Base URL of local FastAPI back-end
const API_BASE = 'http://213.159.215.121:8000/api';

// Получить основную информацию о токене
async function fetchTokenInfo(address: string): Promise<any> {
  console.log(`[API] Fetching token info for: ${address}`);
  console.log(`[API] Request URL: ${API_BASE}/token/${address}`);
  
  try {
    const res = await fetch(`${API_BASE}/token/${address}`);
    console.log(`[API] Token info response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Token info error: ${res.status} - ${errorText}`);
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    
    const data = await res.json();
    console.log(`[API] Token info data received:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Token info fetch failed:`, error);
    throw error;
  }
}

// Получить топ покупателей
async function fetchTopBuyers(address: string): Promise<any> {
  console.log(`[API] Fetching top buyers for: ${address}`);
  try {
    const res = await fetch(`${API_BASE}/token/${address}/top-buyers`);
    console.log(`[API] Top buyers response status: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Top buyers error: ${res.status} - ${errorText}`);
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    const data = await res.json();
    console.log(`[API] Top buyers data received:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Top buyers fetch failed:`, error);
    throw error;
  }
}

// Получить информацию о безопасности
async function fetchSecurityInfo(address: string): Promise<any> {
  console.log(`[API] Fetching security info for: ${address}`);
  try {
    const res = await fetch(`${API_BASE}/token/${address}/security`);
    console.log(`[API] Security response status: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Security error: ${res.status} - ${errorText}`);
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    const data = await res.json();
    console.log(`[API] Security data received:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Security fetch failed:`, error);
    throw error;
  }
}

// Получить цену токена
async function fetchTokenPrice(address: string): Promise<any> {
  console.log(`[API] Fetching token price for: ${address}`);
  try {
    const res = await fetch(`${API_BASE}/token/${address}/price`);
    console.log(`[API] Price response status: ${res.status}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Price error: ${res.status} - ${errorText}`);
      throw new Error(`Server error: ${res.status} - ${errorText}`);
    }
    const data = await res.json();
    console.log(`[API] Price data received:`, data);
    return data;
  } catch (error) {
    console.error(`[API] Price fetch failed:`, error);
    throw error;
  }
}

// Получить данные rugcheck
async function fetchRugcheckData(address: string): Promise<RugcheckData> {
  console.log(`[API] Fetching rugcheck data for: ${address}`);
  console.log(`[API] Request URL: ${API_BASE}/token/${address}/rugcheck`);
  
  try {
    const res = await fetch(`${API_BASE}/token/${address}/rugcheck`);
    console.log(`[API] Rugcheck response status: ${res.status}`);
    console.log(`[API] Rugcheck response status: ${res.status}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[API] Rugcheck error: ${res.status} - ${errorText}`);
      throw new Error(`Rugcheck API error: ${res.status} - ${errorText}`);
    }
    
        const data = await res.json();
    console.log('[Rugcheck] Raw data:', data);
    // Обрабатываем risk_factors - если это объекты, извлекаем строки
    let risk_factors: string[] = [];
    if (data.risks && Array.isArray(data.risks)) {
      risk_factors = data.risks.map((risk: any) => {
        if (typeof risk === 'string') {
          return risk;
        } else if (typeof risk === 'object' && risk !== null) {
          // Если это объект, пытаемся извлечь строку
          return risk.name || risk.description || risk.value || JSON.stringify(risk);
        }
        return String(risk);
      });
    }

    return {
      status: data.status || 'unknown',
      score: data.score || 0,
      risk_factors: risk_factors,
      message: data.message,
      rugged: data.rugged,
      mint: data.mint,
      name: data.name,
      symbol: data.symbol,
      liquidity: data.liquidity,
      detectedAt: data.detectedAt,
      links: data.links,
    };
  } catch (error) {
    console.error(`[API] Rugcheck fetch failed:`, error);
    throw error;
  }
}

// Helper: отправить сообщение во все вкладки, где присутствует content-script
function broadcastMessage(msg: any) {
  try {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        if (tab.id !== undefined) {
          chrome.tabs.sendMessage(tab.id, msg, () => {
            // Игнорируем ошибки «Could not establish connection. Receiving end does not exist.» — значит на вкладке нет content-script
          });
        }
      });
    });
  } catch (e) {
    console.warn('[ServiceWorker] broadcastMessage failed', e);
  }
}

// Основная функция анализа токена
async function fetchTokenAnalysis(address: string): Promise<TokenAnalysis> {
  try {
    console.log(`[Analyzer] Fetching analysis for token: ${address}`);
    // Параллельно запрашиваем все данные
    const [tokenInfo, topBuyers, securityInfo, priceInfo, rugcheckData] = await Promise.allSettled([
      fetchTokenInfo(address),
      fetchTopBuyers(address),
      fetchSecurityInfo(address),
      fetchTokenPrice(address),
      fetchRugcheckData(address)
    ]);

    console.log('[Analyzer] Raw responses:', {
      tokenInfo: tokenInfo.status === 'fulfilled' ? tokenInfo.value : null,
      topBuyers: topBuyers.status === 'fulfilled' ? topBuyers.value : null,
      securityInfo: securityInfo.status === 'fulfilled' ? securityInfo.value : null,
      priceInfo: priceInfo.status === 'fulfilled' ? priceInfo.value : null,
      rugcheckData: rugcheckData.status === 'fulfilled' ? rugcheckData.value : null
    });

    const analysis: TokenAnalysis = {};

    // Основная информация о токене
    if (tokenInfo.status === 'fulfilled') {
      const data = tokenInfo.value;
      console.log('[Analyzer] Token info data:', data);
      
      // Преобразуем данные в нужный формат
      analysis.tokenInfo = {
        name: data.name,
        symbol: data.symbol,
        address: data.address,
        logo: data.logo,
        decimals: data.decimals,
        marketCap: data.market_cap,
        fdv: data.fdv,
        price: data.price,
        // Динамика цен
        price_1m: data.price_1m,
        price_5m: data.price_5m,
        price_1h: data.price_1h,
        price_6h: data.price_6h,
        price_24h: data.price_24h,
        // Объемы
        volume_1m: data.volume_1m,
        volume_5m: data.volume_5m,
        volume_1h: data.volume_1h,
        volume_6h: data.volume_6h,
        volume_24h: data.volume_24h,
        // Сделки
        swaps_1m: data.swaps_1m,
        swaps_5m: data.swaps_5m,
        swaps_1h: data.swaps_1h,
        swaps_6h: data.swaps_6h,
        swaps_24h: data.swaps_24h,
        // Покупки
        buys_1m: data.buys_1m,
        buys_5m: data.buys_5m,
        buys_1h: data.buys_1h,
        buys_6h: data.buys_6h,
        buys_24h: data.buys_24h,
        // Продажи
        sells_1m: data.sells_1m,
        sells_5m: data.sells_5m,
        sells_1h: data.sells_1h,
        sells_6h: data.sells_6h,
        sells_24h: data.sells_24h,
        // Чистый объем
        net_in_volume_1m: data.net_in_volume_1m,
        net_in_volume_5m: data.net_in_volume_5m,
        net_in_volume_1h: data.net_in_volume_1h,
        net_in_volume_6h: data.net_in_volume_6h,
        net_in_volume_24h: data.net_in_volume_24h,
        // Дополнительная информация
        holder_count: data.holder_count,
        total_supply: data.total_supply,
        max_supply: data.max_supply,
        liquidity: data.liquidity,
        biggest_pool_address: data.biggest_pool_address,
        open_timestamp: data.open_timestamp,
        // Социальные ссылки из поля link
        social_links: data.link || {},
        link: data.link || {},
        bundlers: data.bundlers,
        circulating_supply: data.circulating_supply
      };
      
      analysis.stats = {
        holders: data.holder_count || 0,
        transactions24h: data.swaps_24h || 0,
        liquidity: data.liquidity || 0,
        burnedTokens: 0 // нет в API
      };
    }

    // Топ покупатели
    if (topBuyers.status === 'fulfilled' && topBuyers.value) {
      const buyersData = topBuyers.value;
      console.log('[Analyzer] Top buyers data:', buyersData);
      
      if (buyersData.holderInfo) {
        analysis.topBuyers = buyersData.holderInfo.map((holder: any) => ({
          wallet: holder.wallet_address || holder.wallet,
          status: holder.status,
          tags: holder.tags,
          maker_token_tags: holder.maker_token_tags
        }));
        analysis.topBuyersMeta = {
          holder_count: buyersData.holder_count,
          statusNow: buyersData.statusNow
        };
      }
    }

    // Безопасность (используем rugcheck данные)
    if (rugcheckData.status === 'fulfilled') {
      analysis.securityInfo = rugcheckData.value;
    } else if (securityInfo.status === 'fulfilled') {
      analysis.securityInfo = securityInfo.value;
    }

    // Цена (дополнительно)
    if (priceInfo.status === 'fulfilled' && priceInfo.value) {
      const priceData = priceInfo.value;
      console.log('[Analyzer] Price data:', priceData);
      
      if (!analysis.tokenInfo) analysis.tokenInfo = {};
      analysis.tokenInfo.price = priceData.usd_price || priceData.price;
    }

    console.log('[Analyzer] Final analysis:', analysis);
    return analysis;
  } catch (error) {
    console.error('[Analyzer] Error fetching token analysis:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

chrome.runtime.onMessage.addListener((message: RuntimeMessage, sender, sendResponse) => {
  console.log('[ServiceWorker] Received message:', message);
  
  if (message.type === 'TOKEN_DETECTED') {
    console.log('[ServiceWorker] Processing TOKEN_DETECTED for address:', (message as any).address);
    const address = (message as any).address;
    
    // Сохраняем адрес в storage
    chrome.storage.local.set({ lastToken: address });
    
    // Выполняем анализ
    fetchTokenAnalysis(address).then((analysis) => {
      // Сохраняем результат анализа
      chrome.storage.local.set({ [`analysis_${address}`]: analysis });
      
      // Отправляем сообщение о готовности
      const readyMsg: RuntimeMessage = {
        type: 'ANALYSIS_READY',
        address: address,
        analysis: analysis,
      } as any;
      chrome.runtime.sendMessage(readyMsg);
    }).catch((error) => {
      console.error('[ServiceWorker] Analysis failed:', error);
    });
  }
  
  if (message.type === 'GET_ANALYSIS') {
    // Если передан адрес из истории, используем его, иначе получаем из storage
    const addressToAnalyze = (message as any).address;
    
    if (addressToAnalyze) {
      console.log(`[ServiceWorker] Analyzing address: ${addressToAnalyze}`);
      fetchTokenAnalysis(addressToAnalyze).then(sendResponse);
      return true; // Keep message channel open for async response
    } else {
      // Получаем последний адрес из storage
      chrome.storage.local.get('lastToken', (result) => {
        if (result.lastToken) {
          console.log(`[ServiceWorker] Analyzing last token: ${result.lastToken}`);
          fetchTokenAnalysis(result.lastToken).then(sendResponse);
        } else {
          console.log('[ServiceWorker] No address to analyze');
          sendResponse(null);
        }
      });
      return true; // Keep message channel open for async response
    }
  }

  // Обработка уведомлений о смарт-контрактах
  if (message.type === 'SHOW_NOTIFICATION') {
    const { title, message: msg, contracts } = message as any;
    
    // Создаем уведомление
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: msg,
      priority: 1
    });

    // Сохраняем информацию о контрактах
    chrome.storage.local.set({ 
      detectedContracts: contracts,
      lastDetectionTime: Date.now()
    });
  }

  // Обработка анализа контракта
  if (message.type === 'CONTRACT_ANALYZE') {
    const { address, contractType } = message as any;
    console.log(`[ServiceWorker] Analyzing contract: ${address} (${contractType})`);
    
    // Асинхронно выполняем анализ контракта
    fetchTokenAnalysis(address).then((analysis) => {
      // Сохраняем результат
      chrome.storage.local.set({ [`contract_analysis_${address}`]: analysis });
      
      // Отправляем результат всем контекстам (popup + content)
      chrome.runtime.sendMessage({
        type: 'CONTRACT_ANALYSIS_READY',
        address,
        analysis,
        contractType
      });
      broadcastMessage({
        type: 'CONTRACT_ANALYSIS_READY',
        address,
        analysis,
        contractType
      });

      // Подтверждаем отправителю, что анализ завершён
      try {
        sendResponse?.({ status: 'done' });
      } catch (e) {
        // ignore if channel already closed
      }
    }).catch((error) => {
      console.error('[ServiceWorker] Contract analysis failed:', error);
      try {
        sendResponse?.({ status: 'error', message: String(error) });
      } catch {}
    });

    // Возвращаем true, чтобы оставить порт открытым, пока не вызовем sendResponse
    return true;
  }

  // Обработка клика по контракту
  if (message.type === 'CONTRACT_CLICKED') {
    const { address, contractType } = message as any;
    console.log(`[ServiceWorker] Contract clicked: ${address} (${contractType})`);
    
    // Сохраняем адрес, чтобы popup мог загрузить анализ
    chrome.storage.local.set({ lastToken: address });

    // Если анализ уже сохранён ранее, ничего не делаем. Если нет, запрашиваем анализ в фоне
    chrome.storage.local.get(`contract_analysis_${address}`, (res) => {
      if (!res[`contract_analysis_${address}`]) {
        fetchTokenAnalysis(address).then((analysis) => {
          chrome.storage.local.set({ [`contract_analysis_${address}`]: analysis });
        });
      }
    });

    // Открываем popup с информацией о контракте
    chrome.action.openPopup();
  }

  // Обработка обнаруженных контрактов
  if (message.type === 'CONTRACTS_DETECTED') {
    const { contracts } = message as any;
    console.log(`[ServiceWorker] Contracts detected:`, contracts);
    
    // Сохраняем информацию о контрактах
    chrome.storage.local.set({ 
      detectedContracts: contracts,
      lastDetectionTime: Date.now()
    });
  }
});

export {}; 