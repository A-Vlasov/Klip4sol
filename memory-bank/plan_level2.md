# 📝 ПЛАН РЕАЛИЗАЦИИ (PLAN MODE) — CRYPTO TOKEN ANALYZER CHROME EXTENSION

> **Уровень сложности:** Level 2 — Simple Enhancement  
> **Дата:** 2024-12-28  
> **Автор плана:** AI (PLAN MODE)

---

## 1. КРАТКИЙ ОБЗОР ИЗМЕНЕНИЙ
Расширение Chrome для сайта **gmgn.ai** будет анализировать данные токена, представлять поверхностную информацию и, при запросе, выводить расширенный анализ. Проект строится с нуля, используя **Manifest V3** и лучшие практики из официальной документации и репозитория **chrome-samples**.

### Основные компоненты:
1. **manifest.json** — конфигурация MV3.
2. **Content Script** — парсинг страницы gmgn.ai, извлечение адреса токена.
3. **Background Service Worker** — сетевые вызовы (fetch RPC / API blockchain) для получения данных токена и холдеров.
4. **Popup UI** — React-интерфейс с базовым и расширенным режимами.
5. **Options Page** — глобальные настройки (RPC-endpoint, сеть, тема).
6. **Shared Utils** — Web3 helperы, форматирование чисел, кэширование.

---

## 2. ФАЙЛЫ ДЛЯ СОЗДАНИЯ / ИЗМЕНЕНИЯ
| Тип | Путь | Назначение |
|-----|------|------------|
| Новый | `manifest.json` | Декларация MV3, permissions, action. |
| Новый | `src/content/content.ts` | Сбор DOM-данных на gmgn.ai, отправка в background. |
| Новый | `src/background/serviceWorker.ts` | Получение данных Web3, кэш, отправка UI. |
| Новый | `src/popup/App.tsx` | UI поверхностного анализа. |
| Новый | `src/popup/Advanced.tsx` | UI расширенного анализа. |
| Новый | `src/options/Options.tsx` | Страница настроек. |
| Новый | `src/styles/*` | TailwindCSS или CSS-модули. |
| Новый | `vite.config.ts` | Сборка React + MV3 (шаблон chrome-sample/vite). |
| Новый | `package.json` | Список зависимостей (react, vite, web3.js/ethers). |
| Новый | `README.md` | Инструкции по сборке и установке. |

> **Примечание:** в случае изменения существующих примеров из `chrome-samples`, они копируются в `src/lib/chrome-samples/` для参考.

---

## 3. ШАГИ ИМПЛЕМЕНТАЦИИ
1. **Инициализация проекта**  
   a. `npm init -y`  
   b. Добавить dev-deps: `vite`, `typescript`, `@types/chrome`, `tailwindcss`  
   c. Настроить `vite.config.ts` для output в `dist/` в формате MV3.
2. **Создание manifest.json**  
   - `manifest_version`: 3  
   - Permissions: `storage`, `activeTab`, `scripting`, `webRequest`, `https://*/`  
   - `action`: popup `index.html`.
3. **Content Script**  
   - Слушать изменения DOM (MutationObserver) на странице gmgn.ai.  
   - Извлекать контракт токена (address) из URL/DOM.  
   - Отправлять message в background: `{type:"TOKEN_DETECTED", address}`.
4. **Background Service Worker**  
   - Принимать сообщение, вызывать Web3 API:  
     • MarketCap (MC) через API gmgn или chain explorer  
     • Holders via API (e.g., Covalent, Moralis)  
     • LP status (проверка LP токена)  
   - Кэшировать результат в `chrome.storage`.
5. **Popup UI (React)**  
   - Отображать базовые данные: MC, 10 holders, dev holding %, LP burned %.  
   - Кнопка «Расширенный анализ» → грузит дополнительные данные (bytecode size, аудит, токеномика).  
   - UI дизайн: Tailwind, светлая/тёмная тема, responsive 300×500.
6. **Advanced Analysis Component**  
   - Отдельный React-route или modal.  
   - Показ детальных метрик: функции контракта (read/write), распределение холдеров, риски (honeypot check).
7. **Options Page**  
   - Выбор сети (ETH, BSC, др.)  
   - Кастомный RPC endpoint  
   - Theme toggle.  
8. **Сборка & тестирование**  
   - `npm run build` → output `/dist`  
   - Загрузить unpacked extension в Chrome  
   - Проверка на gmgn.ai demo page.
9. **Документация**  
   - Обновить README с инструкциями установки  
   - Скриншоты UI, GIF demo.

---

## 4. ПОТЕНЦИАЛЬНЫЕ СЛОЖНОСТИ
| # | Риск | Возможное решение |
|---|------|-------------------|
| 1 | Изменения DOM-структуры gmgn.ai | Использовать более устойчивые селекторы, fallback к URL-парсингу. |
| 2 | Ограничения CORS/permissions | Направлять запросы из background с `host_permissions`, использовать fetch с `mode: "cors"`. |
| 3 | Ограничения API (rate limits) | Локальный cache + exponential backoff. |
| 4 | Ограничения Manifest V3 (service worker idle) | Использовать `alarms`/`storage` для wake-up, хранить state в `storage`. |
| 5 | Размер bundle для popup | Code-splitting, dynamic import AdvancedAnalysis. |

---

## 5. СТРАТЕГИЯ ТЕСТИРОВАНИЯ
1. **Unit**: Web3 utility functions (Jest).  
2. **Integration**: Messaging content ↔ background (Chrome Extension testing library).  
3. **E2E**: Puppeteer скрипт, загружающий extension, открывающий gmgn.ai и проверяющий отображение MC.  
4. **UI**: React Testing Library snapshot тесты.  
5. **Manual**: Проверка разных токенов и сетей.

---

## 6. ЗАВИСИМОСТИ
- `react`, `react-dom`  
- `vite` + `vite-plugin-crx-mv3` (сборка MV3)  
- `ethers` или `web3.js` для работы с блокчейном  
- `tailwindcss` (или MUI) для UI  
- `@types/chrome` для TypeScript типов  
- API ключи: Covalent/Moralis (для holders/MC), возможно gmgn.ai API

---

## 7. ТРЕБУЕМЫЕ CREATIVE КОМПОНЕНТЫ ⚙️
- **UI/UX Design (🎨)**: подбор цветовой схемы, макет popup & advanced page.  
- **Algorithm Design (⚙️)**: логика анализа LP burned и вычисления dev holding.  

> Эти компоненты потребуют переключения в CREATIVE MODE после утверждения плана.

---

## 8. ЧЕК-ЛИСТ ПЛАНА (PLAN MODE)
- [x] Обзор изменений  
- [x] Список файлов  
- [x] Шаги имплементации  
- [x] Возможные риски  
- [x] Стратегия тестирования  
- [x] Зависимости  
- [x] Creative-требующие компоненты обозначены  

**План завершён и готов к проверке.**  
Следующий шаг — **CREATIVE MODE** для дизайна UI и алгоритмов анализа. 