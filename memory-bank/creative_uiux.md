🎨🎨🎨 ENTERING CREATIVE PHASE: UI/UX DESIGN

## Component Description
Popup и Advanced страницы расширения Chrome для выводимых данных анализа токена на gmgn.ai.

## Requirements & Constraints
- Popup размер ~300x500, легковесный.
- Две основные вкладки/состояния: Базовый анализ и Расширенный анализ.
- Совместимость Manifest V3 (React используется в popup.html).
- Поддержка тёмной/светлой темы.
- Быстрый рендер (bundle < 150 KB gzip).

## Options
### Option A: React + TailwindCSS + Vite
- Использовать React (functional components) + TailwindCSS для стилей.
- Vite + vite-plugin-crx-mv3 для сборки.

### Option B: Lit (Web Components) + Pure CSS
- Использовать Lit для легковесных компонентов.
- Стили в Shadow DOM, минимальная зависимость.

### Option C: Vanilla HTML/CSS + Alpine.js
- Минимальный JS, Alpine.js для реактивности.
- Очень низкий размер бандла.

## Analysis
| Опция | Pros | Cons |
|-------|------|------|
| A | Большая экосистема, знакома большинству dev, Tailwind utility-first => быстрая разработка UI, HotReload из Vite | Больше размер бандла, Tailwind требует build-time, React в popup может быть избыточен |
| B | Web Components нативны, очень низкий runtime, Shadow DOM защитит стили | Более высокая сложность, меньше комьюнити, Lit добавляет собственный рантайм (~6kb) |
| C | Самый маленький размер, простая интеграция, нет сборщика | Мало структурности, сложнее поддерживать большие UI, нет TS-типизации |

## Recommended Approach
**Option A** (React + TailwindCSS + Vite) выбран, т.к. ускоряет разработку, предоставляет богатую экосистему компонентов, а Vite обеспечивает быстрый dev server. Размер можно оптимизировать с tree-shaking и code-splitting (advanced анализ будет dynamic import).

## Implementation Guidelines
1. `vite.config.ts` используется пример из [tutorial.getting-started](chrome-samples/functional-samples/tutorial.getting-started) с добавлением `pluginReact()` и MV3 preset.
2. Создать `popup/index.html` с root `<div id="root"></div>` и скриптом `/src/popup/main.tsx`.
3. В `main.tsx` рендерить `<App />`, использовать React Router с двумя путями `/` (Basic) и `/advanced`.
4. Tailwind: `@apply` utilities, классы `dark:` для темы.
5. Кнопка «Расширенный анализ» → `navigate('/advanced')`.
6. Использовать компонент `<Indicator loading>` для состояния загрузки.
7. Доступность: aria-labels, tab-order.

## Verification Checkpoint
- Layout помещается в 300×500.
- Светлая/тёмная тема переключаются.
- Basic/Advanced страницы переключаются без перезагрузки.

🎨🎨🎨 EXITING CREATIVE PHASE 