🎨🎨🎨 ENTERING CREATIVE PHASE: ALGORITHM DESIGN

## Component Description
Алгоритм вычисления:
1. Процент LP токенов, которые сожжены (LP burned)
2. Доля токенов, удерживаемых разработчиком (Dev holding)

## Requirements & Constraints
- Поддержка сетей EVM: Ethereum, BSC, Polygon.
- Минимум 1 API-запрос на токен (экономия rate limit).
- Ответ < 1 c для базового анализа (кэшировать).
- Безопасное обращение к RPC (public endpoints или пользовательский).

## Options
### Option A: Использовать внешние API (Covalent/Moralis) для holders + LP
- Запрос на endpoint `/token_holders_v2/` → возвращает держателей + LP pool.
- Процент LP burned = LP balance адреса 0xdead / total LP supply.
- Dev holding = баланс владельца контракта * 100 / total_supply.

### Option B: Прямое обращение к блокчейну через `ethers.js`
- Вызов `totalSupply()`, `balanceOf(address)` для owner и dead адреса.
- LP адрес ищется через событие `PairCreated` в UniswapV2Factory.

### Option C: Гибрид (on-chain для критичных, API для bulk)
- Если API доступно → быстрый fetch
- Фолбек → on-chain RPC вызовы.

## Analysis
| Опция | Time | Calls | Pros | Cons |
|-------|------|-------|------|------|
| A | ~300ms | 1 HTTP | Простая реализация, нет RPC | Лимиты/платность API, зависит от provider |
| B | ~800ms | 3-5 RPC | Нет сторонних API, децентрализовано | Сложнее, медленнее, нужно найти LP адрес |
| C | ~400ms | 1-5 | Лучше из обоих миров, graceful fallback | Сложность реализации, двойная логика |

## Recommended Approach
**Option C** — гибрид.
- По умолчанию пользуемся Covalent (бесплатный 25k calls/мес) или gmgn.ai internal API.
- Если ошибка/лимит → переходим на on-chain.

## Implementation Guidelines
1. **LP Burned**
   - Получаем LP token address (через API или PairCreated).  
   - totalLP = ERC20(LP).totalSupply().  
   - burnedLP = ERC20(LP).balanceOf(0x000000000000000000000000000000000000dEaD).  
   - lpBurnedPercent = burnedLP / totalLP * 100.
2. **Dev Holding**
   - ownerAddr = ERC20(token).owner() | `tx.to` of contract creation.  
   - totalSupply = ERC20(token).totalSupply().  
   - devBalance = ERC20(token).balanceOf(ownerAddr).  
   - devHoldingPercent = devBalance / totalSupply * 100.
3. **Caching**
   - Сохраняем `{address, lpBurned, devHolding, timestamp}` в `chrome.storage.local`.  
   - TTL 10 мин.
4. **Error Handling**
   - Если API fail → fallback RPC.  
   - Если RPC fail → показать N/A, логировать в background.

## Verification Checkpoint
- Алгоритм возвращает оба процента < 1 с.
- Fallback работает при отключённом интернете API.
- Точность ±0.1% в сравнении с BscScan.

🎨🎨🎨 EXITING CREATIVE PHASE 