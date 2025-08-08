# GMGN Token Analyzer - Chrome Extension

Chrome расширение для анализа токенов Solana с использованием GMGN.ai API.

## Возможности

- **Анализ токенов Solana** - получение информации о цене, market cap, объеме торгов
- **Топ покупатели** - список крупнейших покупателей токена
- **Информация о безопасности** - проверка honeypot, верификации, ликвидности
- **Статистика** - количество холдеров, транзакций, сожженных токенов
- **Автоматическое обнаружение** - автоматическое определение адреса токена на странице

## Поддерживаемые сайты

- pump.fun
- gmgn.ai
- birdeye.so
- dexscreener.com
- solscan.io
- solana.fm
- jup.ag

## Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd crypto-chrome
```

2. Установите зависимости:
```bash
npm install
```

3. Соберите расширение:
```bash
npm run build
```

4. Загрузите в Chrome:
   - Откройте `chrome://extensions/`
   - Включите "Режим разработчика"
   - Нажмите "Загрузить распакованное расширение"
   - Выберите папку `dist`

## Использование

1. Перейдите на сайт с токеном Solana (например, pump.fun)
2. Расширение автоматически обнаружит адрес токена на странице
3. Нажмите на иконку расширения в панели инструментов
4. Просмотрите анализ токена:
   - **Основная информация**: название, символ, цена, market cap
   - **Статистика**: холдеры, транзакции, ликвидность
   - **Безопасность**: honeypot, верификация, уровень риска
   - **Топ покупатели**: список крупнейших покупателей

## API Endpoints

Расширение использует следующие эндпоинты GMGN.ai:

- `GET /v1/tokens/sol/{address}` - основная информация о токене
- `GET /v1/tokens/top_buyers/sol/{address}` - топ покупатели
- `GET /v1/tokens/security/sol/{address}` - информация о безопасности
- `GET /v1/sol/tokens/realtime_token_price?address={address}` - цена в реальном времени

## Разработка

### Структура проекта

```
src/
├── background/          # Service Worker
├── content/            # Content Script
├── popup/              # Popup UI
├── utils/              # Общие типы и утилиты
└── server/             # Локальный сервер (не используется)

gmgnai-wrapper-main/    # Python wrapper для GMGN API
```

### Команды

```bash
npm run dev          # Режим разработки
npm run build        # Сборка для продакшена
npm run preview      # Предварительный просмотр
```

### Тестирование API

Откройте `test-gmgn-api.html` в браузере для тестирования GMGN API.

## Технологии

- **Frontend**: React + TypeScript + TailwindCSS
- **Build**: Vite
- **API**: GMGN.ai (Solana token analytics)
- **Manifest**: V3

## Лицензия

MIT License 