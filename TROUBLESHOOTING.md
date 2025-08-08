# 🔧 Устранение неполадок

## Проблема: Расширение не работает на x.com

### Шаг 1: Проверьте установку расширения

1. Откройте `chrome://extensions/`
2. Найдите "Marcos Builder AI" в списке
3. Убедитесь, что расширение **включено** (переключатель должен быть синим)
4. Если расширение не видно, нажмите "Загрузить распакованное расширение" и выберите папку `dist`

### Шаг 2: Проверьте консоль браузера

1. Откройте x.com или test-twitter.html
2. Нажмите F12 для открытия DevTools
3. Перейдите на вкладку **Console**
4. Ищите сообщения:
   ```
   [Smart Contract Detector] Content script loaded on https://x.com/...
   [Smart Contract Detector] Styles injected successfully
   [Smart Contract Detector] Ready to detect smart contracts
   ```

### Шаг 3: Если сообщений нет

**Проблема**: Content script не загружается

**Решение**:
1. Обновите расширение в `chrome://extensions/` (кнопка обновления)
2. Перезагрузите страницу x.com
3. Проверьте консоль снова

### Шаг 4: Если сообщения есть, но контракты не подчеркиваются

**Проблема**: CSS стили не применяются

**Решение**:
1. Проверьте, что в консоли есть сообщение "Styles injected successfully"
2. Откройте DevTools → Elements
3. Найдите элемент с классом `smart-contract-highlighted`
4. Проверьте, что стили применяются

### Шаг 5: Тестирование на локальной странице

1. Откройте `test-twitter.html` в браузере
2. Эта страница имитирует x.com с контрактами
3. Проверьте, работает ли расширение здесь

## 🔍 Пошаговая диагностика

### 1. Проверка загрузки расширения

```javascript
// В консоли браузера выполните:
chrome.runtime.getManifest()
```

Должен вернуть информацию о манифесте.

### 2. Проверка content script

```javascript
// В консоли браузера выполните:
console.log('Content script test');
```

Если видите это сообщение, content script работает.

### 3. Проверка детекции контрактов

Откройте `test-twitter.html` и проверьте консоль на сообщения:
```
[Smart Contract Detector] Starting page scan...
[Smart Contract Detector] Found contracts in text node: [...]
[Smart Contract Detector] Scanned X text nodes
```

### 4. Проверка стилей

В DevTools → Elements найдите:
```html
<span class="smart-contract-highlighted" data-contract-type="solana">
  7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
</span>
```

## 🐛 Частые проблемы

### Проблема 1: "Extension not found"

**Причина**: Расширение не загружено
**Решение**: 
1. Проверьте папку `dist` - она должна содержать файлы
2. Загрузите расширение заново в `chrome://extensions/`

### Проблема 2: "Content script not loading"

**Причина**: Ошибка в манифесте или content script
**Решение**:
1. Проверьте `dist/manifest.json`
2. Убедитесь, что content script указан правильно
3. Пересоберите проект: `npm run build`

### Проблема 3: "Styles not applied"

**Причина**: CSS не инжектируется
**Решение**:
1. Проверьте, что стили инжектируются в `content.ts`
2. Убедитесь, что нет конфликтов с другими расширениями

### Проблема 4: "No contracts detected"

**Причина**: Паттерны не совпадают
**Решение**:
1. Проверьте паттерны в `content.ts`
2. Убедитесь, что контракты не фильтруются как системные
3. Добавьте больше логирования

## 🔧 Ручная проверка

### 1. Проверка паттернов

```javascript
// В консоли браузера:
const solanaPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;
const testAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
console.log(testAddress.match(solanaPattern));
```

### 2. Проверка фильтрации

```javascript
// В консоли браузера:
const systemAddresses = [
  '11111111111111111111111111111111',
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
];
console.log('System addresses filtered:', systemAddresses);
```

### 3. Проверка DOM элементов

```javascript
// В консоли браузера:
const highlightedElements = document.querySelectorAll('.smart-contract-highlighted');
console.log('Highlighted elements:', highlightedElements.length);
```

## 📊 Логи для отладки

### Успешная работа:
```
[Smart Contract Detector] Content script loaded on https://x.com/...
[Smart Contract Detector] Styles injected successfully
[Smart Contract Detector] Ready to detect smart contracts
[Smart Contract Detector] Starting page scan...
[Smart Contract Detector] Found contracts in text node: [...]
[Smart Contract Detector] Scanned 150 text nodes
[ServiceWorker] Contracts detected: [...]
```

### Проблемы:
```
Error: Extension not found
Error: Content script failed to load
Error: Styles not injected
Error: No contracts detected
```

## 🚀 Быстрое решение

Если ничего не работает:

1. **Удалите расширение** из Chrome
2. **Пересоберите проект**:
   ```bash
   npm run build
   ```
3. **Загрузите заново** в `chrome://extensions/`
4. **Откройте test-twitter.html** для тестирования
5. **Проверьте консоль** на сообщения

## 📞 Поддержка

Если проблема не решается:

1. Проверьте все логи в консоли
2. Убедитесь, что нет конфликтов с другими расширениями
3. Попробуйте в режиме инкогнито
4. Проверьте, что Chrome обновлен до последней версии 