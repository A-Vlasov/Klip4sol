// Chrono X Chroma - Content Script
(function () {
    'use strict';

    // Color scheme for different post ages
    const COLOR_SCHEME = {
        VERY_RECENT: { bg: 'rgba(0, 255, 0, 0.1)', border: '2px solid #00ff00' }, // Green - under 5 minutes
        RECENT: { bg: 'rgba(255, 255, 0, 0.1)', border: '2px solid #ffff00' },     // Yellow - 5 minutes to 1 hour
        MODERATE: { bg: 'rgba(255, 165, 0, 0.1)', border: '2px solid #ffa500' },   // Orange - 1 hour to 6 hours
        OLD: { bg: 'rgba(255, 0, 0, 0.1)', border: '2px solid #ff0000' },          // Red - 6 hours to 1 day
        VERY_OLD: { bg: 'rgba(128, 0, 128, 0.1)', border: '2px solid #800080' }    // Purple - over 1 day
    };

    // Color scheme for smart contract addresses
    const CONTRACT_COLOR_SCHEME = {
        ETHEREUM: { bg: 'rgba(255, 0, 255, 0.15)', border: '2px solid #ff00ff', text: '#ff00ff' }, // Magenta for Ethereum
        SOLANA: { bg: 'rgba(0, 255, 255, 0.15)', border: '2px solid #00ffff', text: '#00ffff' }    // Cyan for Solana
    };

    // Regex patterns for address detection
    const ADDRESS_PATTERNS = {
        ETHEREUM: /0x[a-fA-F0-9]{40}/g,  // Ethereum address pattern
        SOLANA: /[1-9A-HJ-NP-Za-km-z]{32,44}/g  // Solana address pattern (base58)
    };

    // Extension settings
    let settings = {
        colorMode: 'both', // 'both', 'border', 'overlay', 'off'
        showLegend: true,
        removeCss: false,
        highlightContracts: true, // New setting for contract highlighting
        contractHighlightMode: 'both' // 'both', 'border', 'overlay', 'off'
    };

    // Migrate old settings format to new format
    function migrateOldSettings(items) {
        let colorMode = 'both'; // default

        // Convert old enableColorCoding + borderOnly to new colorMode
        if (items.enableColorCoding === false) {
            colorMode = 'off';
        } else if (items.borderOnly === true) {
            colorMode = 'border';
        } else if (items.enableColorCoding === true && items.borderOnly === false) {
            colorMode = 'both';
        }

        return {
            colorMode,
            showLegend: items.showLegend !== undefined ? items.showLegend : true,
            removeCss: items.removeCss !== undefined ? items.removeCss : false,
            highlightContracts: items.highlightContracts !== undefined ? items.highlightContracts : true,
            contractHighlightMode: items.contractHighlightMode !== undefined ? items.contractHighlightMode : 'both'
        };
    }

    // Load settings from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(null, function (items) {
            console.log('Content script loaded settings:', items);

            // Check if we have the new colorMode setting or need to migrate
            if (items.colorMode !== undefined) {
                // New format
                settings.colorMode = items.colorMode;
                settings.showLegend = items.showLegend !== undefined ? items.showLegend : true;
                settings.removeCss = items.removeCss !== undefined ? items.removeCss : false;
                settings.highlightContracts = items.highlightContracts !== undefined ? items.highlightContracts : true;
                settings.contractHighlightMode = items.contractHighlightMode !== undefined ? items.contractHighlightMode : 'both';
            } else {
                // Migrate from old format
                settings = migrateOldSettings(items);

                // Save migrated settings
                chrome.storage.sync.set(settings);
            }

            console.log('Content script using settings:', settings);
            applySettings();
        });
    }

    // Function to calculate post age category
    function getPostAgeCategory(datetime) {
        const now = new Date();
        const postTime = new Date(datetime);
        const diffInMinutes = (now - postTime) / (1000 * 60);

        if (diffInMinutes < 5) {
            return 'VERY_RECENT';
        } else if (diffInMinutes < 60) {
            return 'RECENT';
        } else if (diffInMinutes < 360) { // 6 hours
            return 'MODERATE';
        } else if (diffInMinutes < 1440) { // 24 hours
            return 'OLD';
        } else {
            return 'VERY_OLD';
        }
    }

    // Function to detect and highlight smart contract addresses
    function highlightContractAddresses(textNode) {
        if (!settings.highlightContracts || settings.contractHighlightMode === 'off') {
            return;
        }

        const text = textNode.textContent;
        let modified = false;
        let newHTML = text;

        // Check for Ethereum addresses
        const ethMatches = text.match(ADDRESS_PATTERNS.ETHEREUM);
        if (ethMatches) {
            ethMatches.forEach(address => {
                const colors = CONTRACT_COLOR_SCHEME.ETHEREUM;
                let style = '';
                
                if (settings.contractHighlightMode === 'both') {
                    style = `background-color: ${colors.bg}; border: ${colors.border}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                } else if (settings.contractHighlightMode === 'border') {
                    style = `border: ${colors.border}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                } else if (settings.contractHighlightMode === 'overlay') {
                    style = `background-color: ${colors.bg}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                }

                const highlightedAddress = `<span style="${style}" title="Ethereum Smart Contract Address">${address}</span>`;
                newHTML = newHTML.replace(address, highlightedAddress);
                modified = true;
            });
        }

        // Check for Solana addresses
        const solMatches = text.match(ADDRESS_PATTERNS.SOLANA);
        if (solMatches) {
            solMatches.forEach(address => {
                // Additional validation for Solana addresses (basic length check)
                if (address.length >= 32 && address.length <= 44) {
                    const colors = CONTRACT_COLOR_SCHEME.SOLANA;
                    let style = '';
                    
                    if (settings.contractHighlightMode === 'both') {
                        style = `background-color: ${colors.bg}; border: ${colors.border}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                    } else if (settings.contractHighlightMode === 'border') {
                        style = `border: ${colors.border}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                    } else if (settings.contractHighlightMode === 'overlay') {
                        style = `background-color: ${colors.bg}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                    }

                    const highlightedAddress = `<span style="${style}" title="Solana Smart Contract Address">${address}</span>`;
                    newHTML = newHTML.replace(address, highlightedAddress);
                    modified = true;
                }
            });
        }

        if (modified) {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = newHTML;
            textNode.parentNode.replaceChild(wrapper, textNode);
        }
    }

    // Собрать все текстовые узлы в порядке следования (DFS)
    function collectTextNodesDFS(element, nodes = []) {
        if (!element) return nodes;
        if (element.nodeType === Node.TEXT_NODE) {
            nodes.push(element);
        } else if (element.nodeType === Node.ELEMENT_NODE && element.childNodes) {
            element.childNodes.forEach(child => collectTextNodesDFS(child, nodes));
        }
        return nodes;
    }

    // Новый способ выделения адресов, даже если они разбиты между узлами
    function highlightContractAddressesSmart(postElement) {
        if (!settings.highlightContracts || settings.contractHighlightMode === 'off') return;

        // Собираем все текстовые узлы
        const textNodes = collectTextNodesDFS(postElement);
        if (textNodes.length === 0) return;

        // Склеиваем текст всех узлов
        let fullText = textNodes.map(n => n.textContent).join('');
        if (!fullText) return;

        // Ищем все адреса (Ethereum и Solana)
        let matches = [];
        let ethRegex = ADDRESS_PATTERNS.ETHEREUM;
        let solRegex = ADDRESS_PATTERNS.SOLANA;
        let m;
        while ((m = ethRegex.exec(fullText)) !== null) {
            matches.push({
                type: 'ETHEREUM',
                value: m[0],
                start: m.index,
                end: m.index + m[0].length
            });
        }
        while ((m = solRegex.exec(fullText)) !== null) {
            // Доп. проверка длины для Solana
            if (m[0].length >= 32 && m[0].length <= 44) {
                matches.push({
                    type: 'SOLANA',
                    value: m[0],
                    start: m.index,
                    end: m.index + m[0].length
                });
            }
        }
        if (matches.length === 0) return;

        // Сортируем по позиции
        matches.sort((a, b) => a.start - b.start);

        // Разбиваем fullText на фрагменты: обычный текст и адреса
        let fragments = [];
        let lastIndex = 0;
        for (let match of matches) {
            if (match.start > lastIndex) {
                fragments.push({ type: 'text', value: fullText.slice(lastIndex, match.start) });
            }
            fragments.push({ type: 'address', value: match.value, addrType: match.type });
            lastIndex = match.end;
        }
        if (lastIndex < fullText.length) {
            fragments.push({ type: 'text', value: fullText.slice(lastIndex) });
        }

        // Теперь заменяем содержимое всех текстовых узлов на новые фрагменты
        // Удаляем все текстовые узлы
        textNodes.forEach(node => {
            if (node.parentNode) node.parentNode.removeChild(node);
        });

        // Вставляем новые фрагменты в первый общий родитель
        let parent = postElement;
        // Находим первый элемент, который не текстовый узел
        for (let node of textNodes) {
            if (node.parentNode && node.parentNode !== postElement) {
                parent = node.parentNode;
                break;
            }
        }

        fragments.forEach(frag => {
            if (frag.type === 'text') {
                parent.appendChild(document.createTextNode(frag.value));
            } else if (frag.type === 'address') {
                const colors = CONTRACT_COLOR_SCHEME[frag.addrType];
                let style = '';
                if (settings.contractHighlightMode === 'both') {
                    style = `background-color: ${colors.bg}; border: ${colors.border}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                } else if (settings.contractHighlightMode === 'border') {
                    style = `border: ${colors.border}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                } else if (settings.contractHighlightMode === 'overlay') {
                    style = `background-color: ${colors.bg}; color: ${colors.text}; padding: 2px 4px; border-radius: 4px; font-weight: bold;`;
                }
                const span = document.createElement('span');
                span.setAttribute('style', style);
                span.setAttribute('title', frag.addrType + ' Smart Contract Address');
                span.textContent = frag.value;
                parent.appendChild(span);
            }
        });
    }

    // Function to apply color coding to a post
    function colorCodePost(postElement) {
        // Skip if already processed
        if (postElement.classList.contains('chrono-x-chroma')) {
            return;
        }

        // Check if color coding is enabled
        if (settings.colorMode === 'off' || settings.removeCss) {
            return;
        }

        // Find the time element with datetime attribute
        const timeElement = postElement.querySelector('time[datetime]');
        if (!timeElement) {
            return;
        }

        const datetime = timeElement.getAttribute('datetime');
        if (!datetime) {
            return;
        }

        // Get the age category and corresponding colors
        const ageCategory = getPostAgeCategory(datetime);
        const colors = COLOR_SCHEME[ageCategory];

        // Clear any existing styles first
        postElement.style.backgroundColor = '';
        postElement.style.border = '';

        // Apply styling based on colorMode
        if (settings.colorMode === 'both') {
            // Both border and background
            postElement.style.backgroundColor = colors.bg;
            postElement.style.border = colors.border;
        } else if (settings.colorMode === 'border') {
            // Border only
            postElement.style.border = colors.border;
        } else if (settings.colorMode === 'overlay') {
            // Background only
            postElement.style.backgroundColor = colors.bg;
        }

        // Always apply these styles regardless of mode (unless off)
        postElement.style.borderRadius = '8px';
        postElement.style.transition = 'all 0.3s ease';

        // Mark as processed
        postElement.classList.add('chrono-x-chroma');
        postElement.setAttribute('data-post-age', ageCategory.toLowerCase());

        // Process contract addresses in this post
        if (settings.highlightContracts) {
            highlightContractAddressesSmart(postElement);
        }
    }

    // Function to process all posts on the page
    function processAllPosts() {
        const posts = document.querySelectorAll('[data-testid="tweet"]');
        posts.forEach(post => {
            colorCodePost(post);
        });
    }

    // Function to create and show the legend
    function createLegend() {
        // Check if legend already exists
        if (document.getElementById('chrono-x-chroma-legend')) {
            return;
        }

        // Check if legend should be shown
        if (!settings.showLegend || settings.removeCss) {
            return;
        }

        const legend = document.createElement('div');
        legend.id = 'chrono-x-chroma-legend';
        legend.innerHTML = '+';

        // Create the legend popup
        const legendPopup = document.createElement('div');
        legendPopup.id = 'chrono-x-chroma-legend-popup';
        legendPopup.style.display = 'none';

        // Update legend content based on colorMode
        updateLegendContent();

        document.body.appendChild(legend);
        document.body.appendChild(legendPopup);

        // Add toggle functionality
        let isExpanded = false;
        legend.addEventListener('click', function () {
            if (isExpanded) {
                legendPopup.style.display = 'none';
                legend.innerHTML = '+';
                isExpanded = false;
            } else {
                legendPopup.style.display = 'block';
                legend.innerHTML = '−';
                isExpanded = true;
            }
        });
    }

    // Function to update legend content based on current settings
    function updateLegendContent() {
        const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');
        if (!legendPopup) return;

        let legendContent = '';

        // Post age legend
        if (settings.colorMode === 'border') {
            legendContent = `
                <div class="legend-section">
                    <div class="legend-title">Post Age</div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid #00ff00;"></div>
                        <span>Very Recent (&lt; 5 min)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid #ffff00;"></div>
                        <span>Recent (5 min - 1 hour)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid #ffa500;"></div>
                        <span>Moderate (1 - 6 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid #ff0000;"></div>
                        <span>Old (6 - 24 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="border: 2px solid #800080;"></div>
                        <span>Very Old (&gt; 1 day)</span>
                    </div>
                </div>
            `;
        } else if (settings.colorMode === 'overlay') {
            legendContent = `
                <div class="legend-section">
                    <div class="legend-title">Post Age</div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(0, 255, 0, 0.3);"></div>
                        <span>Very Recent (&lt; 5 min)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 255, 0, 0.3);"></div>
                        <span>Recent (5 min - 1 hour)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 165, 0, 0.3);"></div>
                        <span>Moderate (1 - 6 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 0, 0, 0.3);"></div>
                        <span>Old (6 - 24 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(128, 0, 128, 0.3);"></div>
                        <span>Very Old (&gt; 1 day)</span>
                    </div>
                </div>
            `;
        } else {
            // Both mode or default
            legendContent = `
                <div class="legend-section">
                    <div class="legend-title">Post Age</div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(0, 255, 0, 0.3); border: 2px solid #00ff00;"></div>
                        <span>Very Recent (&lt; 5 min)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 255, 0, 0.3); border: 2px solid #ffff00;"></div>
                        <span>Recent (5 min - 1 hour)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 165, 0, 0.3); border: 2px solid #ffa500;"></div>
                        <span>Moderate (1 - 6 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 0, 0, 0.3); border: 2px solid #ff0000;"></div>
                        <span>Old (6 - 24 hours)</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(128, 0, 128, 0.3); border: 2px solid #800080;"></div>
                        <span>Very Old (&gt; 1 day)</span>
                    </div>
                </div>
            `;
        }

        // Add contract address legend if enabled
        if (settings.highlightContracts && settings.contractHighlightMode !== 'off') {
            legendContent += `
                <div class="legend-section">
                    <div class="legend-title">Smart Contracts</div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(255, 0, 255, 0.3); border: 2px solid #ff00ff;"></div>
                        <span>Ethereum Address</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color" style="background: rgba(0, 255, 255, 0.3); border: 2px solid #00ffff;"></div>
                        <span>Solana Address</span>
                    </div>
                </div>
            `;
        }

        legendPopup.innerHTML = legendContent;
    }

    // Функция для выделения адресов в тексте твита
    function highlightContractsInTweetText(tweetTextElem) {
        if (!tweetTextElem) return;
        // Получаем весь текст
        let text = tweetTextElem.innerText || tweetTextElem.textContent;
        // Регулярка для Ethereum-адресов
        const ethRe = /0x[a-fA-F0-9]{40}/g;
        // Можно добавить Solana-адреса при необходимости
        // const solRe = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

        // Заменяем адреса на span
        let html = text.replace(ethRe, addr => `<span class="contract-highlight">${addr}</span>`);
        // Если нужно — добавить обработку Solana
        // html = html.replace(solRe, addr => `<span class="contract-highlight">${addr}</span>`);

        // Вставляем HTML обратно
        tweetTextElem.innerHTML = html;
    }

    function highlightContractAddressesInNode(node) {
        if (node.nodeType !== Node.TEXT_NODE) return;

        const ethRe = /0x[a-fA-F0-9]{40}/g;
        let text = node.textContent;
        let match;
        let lastIndex = 0;
        let parent = node.parentNode;
        let frag = document.createDocumentFragment();
        let found = false;

        while ((match = ethRe.exec(text)) !== null) {
            found = true;
            if (match.index > lastIndex) {
                frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            let span = document.createElement('span');
            span.className = 'contract-highlight';
            span.textContent = match[0];
            frag.appendChild(span);
            lastIndex = ethRe.lastIndex;
        }
        if (found && lastIndex < text.length) {
            frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        if (found) {
            parent.replaceChild(frag, node);
        }
    }

    function highlightContractsInTweet(tweetElem) {
        function walk(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                highlightContractAddressesInNode(node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                node.childNodes.forEach(walk);
            }
        }
        walk(tweetElem);
    }

    function highlightAllContractsTweets() {
        document.querySelectorAll('[data-testid="tweetText"]').forEach(highlightContractsInTweet);
    }

    highlightAllContractsTweets();

    const contractObserver = new MutationObserver(() => {
        highlightAllContractsTweets();
    });
    contractObserver.observe(document.body, { childList: true, subtree: true });

    // Observer to watch for new posts being added (for infinite scroll)
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function (node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is a post or contains posts
                        if (node.matches && node.matches('[data-testid="tweet"]')) {
                            colorCodePost(node);
                        } else if (node.querySelectorAll) {
                            const posts = node.querySelectorAll('[data-testid="tweet"]');
                            posts.forEach(post => {
                                colorCodePost(post);
                            });
                        }
                    }
                });
            }
        });
    });

    // Function to remove all styling from posts
    function removeAllStyling() {
        const posts = document.querySelectorAll('[data-testid="tweet"].chrono-x-chroma');
        posts.forEach(post => {
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
            post.classList.remove('chrono-x-chroma');
            post.removeAttribute('data-post-age');
        });

        // Remove contract address highlighting
        const highlightedAddresses = document.querySelectorAll('span[title*="Smart Contract Address"]');
        highlightedAddresses.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(span.textContent), span);
                if (parent.childNodes.length === 1 && parent.nodeType === Node.TEXT_NODE) {
                    parent.parentNode.replaceChild(parent, parent.firstChild);
                }
            }
        });
    }

    // Function to reapply styling to all posts (used when colorMode setting changes)
    function reapplyAllStyling() {
        // First, remove all existing styling and markers
        const posts = document.querySelectorAll('[data-testid="tweet"].chrono-x-chroma');
        posts.forEach(post => {
            // Remove the processed class so it gets reprocessed
            post.classList.remove('chrono-x-chroma');
            post.removeAttribute('data-post-age');
            // Clear existing styles
            post.style.backgroundColor = '';
            post.style.border = '';
            post.style.borderRadius = '';
            post.style.transition = '';
        });

        // Remove contract address highlighting
        const highlightedAddresses = document.querySelectorAll('span[title*="Smart Contract Address"]');
        highlightedAddresses.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(span.textContent), span);
                if (parent.childNodes.length === 1 && parent.nodeType === Node.TEXT_NODE) {
                    parent.parentNode.replaceChild(parent, parent.firstChild);
                }
            }
        });

        // Small delay to ensure DOM is updated, then reprocess
        setTimeout(() => {
            processAllPosts();
        }, 10);
    }

    // Function to hide/show legend
    function toggleLegend(show) {
        const legend = document.getElementById('chrono-x-chroma-legend');
        const legendPopup = document.getElementById('chrono-x-chroma-legend-popup');

        if (legend) {
            legend.style.display = show ? 'flex' : 'none';
        }
        if (legendPopup) {
            legendPopup.style.display = 'none'; // Always hide popup when toggling
        }
    }

    // Function to apply current settings
    function applySettings() {
        if (settings.removeCss) {
            // Remove all styling
            removeAllStyling();
            toggleLegend(false);
        } else {
            // Apply color coding if enabled
            if (settings.colorMode !== 'off') {
                // Reapply all styling with new mode
                reapplyAllStyling();
            } else {
                removeAllStyling();
            }

            // Show/hide legend
            toggleLegend(settings.showLegend);

            // Create legend if it doesn't exist and should be shown
            if (settings.showLegend && !document.getElementById('chrono-x-chroma-legend')) {
                createLegend();
            } else if (settings.showLegend) {
                // Update existing legend content
                updateLegendContent();
            }
        }
    }

    // Listen for messages from popup
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.action === 'updateSettings') {
                console.log('Content script received new settings:', request.settings);
                settings = request.settings;
                applySettings();
                sendResponse({ success: true });
            }
        });
    }

    // Function to initialize the extension
    function init() {
        // Process existing posts
        processAllPosts();

        // Create legend
        createLegend();

        // Start observing for new posts
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('Chrono X Chroma extension loaded with smart contract highlighting');
    }

    // Wait for the page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also run after a short delay to catch any posts that load after initial page load
    setTimeout(function () {
        processAllPosts();
    }, 2000);

})(); 