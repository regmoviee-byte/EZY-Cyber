// EZY: Cyber Character Sheet - Utility Functions
// Вспомогательные функции общего назначения

// ═══════════════════════════════════════════════════════════════════════
// УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЦВЕТОВ ТЕМЫ
// ═══════════════════════════════════════════════════════════════════════

function getThemeColors() {
    const isLightTheme = document.body.classList.contains('light-theme');
    
    if (isLightTheme) {
        return {
            bg: '#d2d2d2',
            panel: '#e8e8e8',
            panelAlt: '#e0e0e0',
            accent: '#4a4a4a',
            accent2: '#666666',
            text: '#2d2d2d',
            muted: '#6e6e73',
            danger: '#8b0000',
            success: '#006400',
            warning: '#8b5a00',
            border: 'rgba(74, 74, 74, 0.4)',
            shadow: '0 0 22px rgba(74, 74, 74, 0.2)',
            // Дополнительные цвета для инлайн-стилей
            bgLight: 'rgba(74, 74, 74, 0.1)',
            bgMedium: 'rgba(74, 74, 74, 0.2)',
            bgDark: 'rgba(74, 74, 74, 0.3)',
            successLight: 'rgba(0, 100, 0, 0.1)',
            dangerLight: 'rgba(139, 0, 0, 0.1)',
            warningLight: 'rgba(139, 90, 0, 0.1)',
            accentLight: 'rgba(74, 74, 74, 0.1)'
        };
    } else {
        return {
            bg: '#0a0712',
            panel: '#171125',
            panelAlt: '#211630',
            accent: '#b667ff',
            accent2: '#ff6acb',
            text: '#f3e8ff',
            muted: '#a394c4',
            danger: '#ff5b87',
            success: '#7df4c6',
            warning: '#ffa500',
            border: 'rgba(182, 103, 255, 0.38)',
            shadow: '0 0 22px rgba(182, 103, 255, 0.28)',
            // Дополнительные цвета для инлайн-стилей
            bgLight: document.body.classList.contains('light-theme') ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.2)',
            bgMedium: document.body.classList.contains('light-theme') ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.3)',
            bgDark: document.body.classList.contains('light-theme') ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.5)',
            successLight: 'rgba(125, 244, 198, 0.1)',
            dangerLight: 'rgba(255, 91, 135, 0.1)',
            warningLight: 'rgba(255, 165, 0, 0.1)',
            accentLight: 'rgba(182, 103, 255, 0.1)'
        };
    }
}

// Функции сохранения и загрузки
function saveState() {
    try {
        localStorage.setItem('ezyCyberCharacter', JSON.stringify(state));
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem('ezyCyberCharacter');
        if (saved) {
            const loadedState = JSON.parse(saved);
            
            // Глубокое слияние: сохраняем avatar отдельно
            const avatarBackup = loadedState.avatar;
            Object.assign(state, loadedState);
            
            // Принудительно восстанавливаем avatar
            if (avatarBackup) {
                state.avatar = avatarBackup;
                console.log('Avatar loaded from localStorage:', avatarBackup.substring(0, 50) + '...');
            } else {
                console.log('No avatar found in localStorage');
            }
        }
        
        // Инициализируем armorInventory, если его нет
        if (!state.armorInventory) {
            state.armorInventory = [];
            console.log('Инициализирован armorInventory');
        }
        
        // Инициализируем implants правильной структурой, если это массив или undefined
        if (!state.implants || Array.isArray(state.implants)) {
            state.implants = {
                head: { installed: false, parts: { main: null } },
                arms: {
                    installed: false,
                    parts: {
                        wristLeft: null, wristRight: null,
                        forearmLeft: null, forearmRight: null,
                        shoulderLeft: null, shoulderRight: null
                    }
                },
                legs: {
                    installed: false,
                    parts: {
                        footLeft: null, footRight: null,
                        shinLeft: null, shinRight: null,
                        thighLeft: null, thighRight: null
                    }
                },
                spine: {
                    installed: false,
                    parts: {
                        cervical: null, thoracicLeft: null,
                        thoracicRight: null, lumbar: null, sacral: null
                    }
                },
                organs: { installed: false, parts: { main: null } },
                neuromodule: { installed: false, parts: { main: null } }
            };
            console.log('Инициализирован implants с правильной структурой');
        }
        
        // Инициализируем property, если его нет
        if (!state.property) {
            state.property = { 
                housing: [], 
                commercialProperty: [], 
                vehicles: [] 
            };
        }
        
        // Инициализируем массивы, если их нет
        if (!state.property.housing) {
            state.property.housing = [];
        }
        if (!state.property.commercialProperty) {
            state.property.commercialProperty = [];
        }
        if (!state.property.vehicles) {
            state.property.vehicles = [];
        }
        
        // Добавляем стартовое жилье, если его нет
        if (state.property.housing.length === 0) {
            state.property.housing.push({
                id: 'default-apartment',
                name: '11-метров',
                description: 'Эта квартира есть у всех По-умолчанию. Обычный человек имеет палку в углу над сортиром, называемую "душевая точка", кровать, встроенную в стену, в виде полки, кухню с 1 коморкой и микроволновкой и огромную телепанель на половину стены, по которой весь световой день крутится реклама, если житель дома. Корпорации сами решают, когда световой день кончился и пора спать…и это может быть время, никак не связанное с солнцем. Вот главная причина, почему люди так любят наушники или импланты с шумоподавлением. Ходит теория, что корпорации специально крутят эту рекламу, чтобы люди покупали больше шумодавов, ведь раз в год выходит новая модель, а старая начинает тупить пропускать излишний звук! Тем не менее, эти 11 квадратов — твоя заслуженная квартира!',
                area: '11 м²',
                rentPrice: 0,
                buyPrice: 0,
                type: 'apartment',
                isDefault: true,
                isOwned: true,
                purchasePrice: 0
            });
            console.log('Добавлено стартовое жилье: 11-метров');
        }
        
        // Добавляем стартовый транспорт, если его нет
        if (state.property.vehicles.length === 0) {
            
            // Добавляем стартовый транспорт - Компактный Микромобиль
            state.property.vehicles.push({
                id: 'default-vehicle',
                name: "Компактный Микромобиль",
                description: "Обычный городской автомобиль для одинокого человека на обычном двигателе.",
                hp: 50,
                currentHp: 50,
                seats: 1,
                mechanicalSpeed: 20,
                narrativeSpeed: "160 км/ч",
                price: 15000,
                catalogPrice: 15000,
                purchasePrice: 0, // Бесплатно для пользователя
                category: "ground",
                modules: [],
                trunk: [], // Багажник транспорта
                isDefault: true,
                itemType: 'free_default'
            });
            
            console.log('Добавлен стартовый транспорт: Компактный Микромобиль');
        } else {
            // Добавляем trunk к существующим транспортам, если его нет
            state.property.vehicles.forEach(vehicle => {
                if (!vehicle.trunk) {
                    vehicle.trunk = [];
                }
            });
        }
        
        updateUIFromState();
        
        // Загружаем профессиональные навыки, заметки и счетчики
        loadProfessionalSkills();
        loadNotes();
        loadCounters();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Автосохранение с debounce
let saveTimeout;
window.scheduleSave = function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveState, 300);
}

// Генерация уникальных ID
window.generateId = function() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Форматирование времени
function formatTime() {
    const now = new Date();
    return now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Обнаружение сенсорных устройств
function detectTouchDevice() {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        document.body.classList.add('touch-device');
        initializeTouchEnhancements();
    }
}

// Инициализация улучшений для сенсорных устройств
function initializeTouchEnhancements() {
    // Добавляем поддержку свайпов для модальных окон
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    document.addEventListener('touchstart', (e) => {
        if (e.target.closest('.modal')) {
            startY = e.touches[0].clientY;
            isDragging = true;
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const diffY = startY - currentY;
        
        if (Math.abs(diffY) > 50) {
            const modal = e.target.closest('.modal-overlay');
            if (modal && diffY > 0) {
                // Свайп вверх - ничего не делаем
            } else if (modal && diffY < 0) {
                // Свайп вниз - закрываем модальное окно
                modal.remove();
            }
            isDragging = false;
        }
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
    });
}

// Создание числовых полей с кнопками +/-
function createNumericInput(inputId, min = 0, max = 999, step = 1) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // Проверяем, не создан ли уже контейнер
    if (input.parentElement.classList.contains('numeric-input-container')) return;
    
    // Проверяем, не созданы ли уже кнопки (для предотвращения дубликатов)
    if (input.parentElement.querySelector('.numeric-input-button')) return;
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'numeric-input-container';
    
    // Обертываем input в контейнер
    input.parentNode.insertBefore(container, input);
    container.appendChild(input);
    
    // Создаем кнопку минус слева
    const minusButton = document.createElement('button');
    minusButton.className = 'numeric-input-button';
    minusButton.innerHTML = '−';
    minusButton.onclick = () => {
        const currentValue = parseInt(input.value) || min;
        const newValue = Math.max(min, currentValue - step);
        input.value = newValue;
        input.dispatchEvent(new Event('change'));
    };
    
    // Создаем кнопку плюс справа
    const plusButton = document.createElement('button');
    plusButton.className = 'numeric-input-button';
    plusButton.innerHTML = '+';
    plusButton.onclick = () => {
        const currentValue = parseInt(input.value) || min;
        const newValue = Math.min(max, currentValue + step);
        input.value = newValue;
        input.dispatchEvent(new Event('change'));
    };
    
    // Вставляем кнопки в правильном порядке: минус, input, плюс
    container.insertBefore(minusButton, input);
    container.appendChild(plusButton);
    
    // Добавляем валидацию для ввода только цифр
    input.addEventListener('input', function(e) {
        // Удаляем все символы кроме цифр
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    input.addEventListener('keypress', function(e) {
        // Разрешаем только цифры, Backspace, Delete, Tab, Escape, Enter
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Настройка валидации для числовых полей
function setupNumericValidation(input) {
    input.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    input.addEventListener('keypress', function(e) {
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });
}

// Инициализация числовых полей
function initNumericInputs() {
    // Находим все поля, которые должны быть числовыми
    const numericInputs = document.querySelectorAll('input[data-numeric="true"], .stat-value, .professional-skill-level');
    
    numericInputs.forEach(input => {
        // Возвращаем тип text для идеального центрирования
        input.type = 'text';
        input.inputMode = 'numeric';
        
        // Устанавливаем центрирование
        input.style.textAlign = 'center';
        
        // Добавляем валидацию только цифр
        setupNumericValidation(input);
    });
}

// Функция для автоматического изменения высоты textarea
function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(textarea.scrollHeight, 24) + 'px';
}

// Инициализация автоматического изменения высоты для профессиональных навыков
function initializeProfessionalSkillsTextareas() {
    for (let i = 0; i < 4; i++) {
        const textarea = document.getElementById(`professionalSkillName${i}`);
        if (textarea) {
            textarea.addEventListener('input', () => autoResizeTextarea(textarea));
            textarea.addEventListener('paste', () => {
                setTimeout(() => autoResizeTextarea(textarea), 10);
            });
        }
    }
}

// Обновление UI из состояния
function updateUIFromState() {
    // Обновляем все поля из state
    const characterName = document.getElementById('characterName');
    const experiencePoints = document.getElementById('experiencePoints');
    const roleplayPoints = document.getElementById('roleplayPoints');
    const awareness = document.getElementById('awareness');
    const reputationSlider = document.getElementById('reputationSlider');
    const reputationValue = document.getElementById('reputationValue');
    
    if (characterName) characterName.value = state.characterName || '';
    if (experiencePoints) experiencePoints.value = state.experiencePoints || 0;
    if (roleplayPoints) roleplayPoints.value = state.roleplayPoints || 0;
    if (reputationSlider) reputationSlider.value = state.reputation || 0;
    if (reputationValue) reputationValue.textContent = state.reputation || 0;
    
    // Обновляем осознанность
    const awarenessCurrent = document.getElementById('awarenessCurrent');
    const awarenessMax = document.getElementById('awarenessMax');
    if (awarenessCurrent) awarenessCurrent.value = state.awareness.current || 50;
    if (awarenessMax) awarenessMax.value = state.awareness.max || 50;
    
    // Обновляем характеристики
    const statINT = document.getElementById('statINT');
    const statDEX = document.getElementById('statDEX');
    const statBODY = document.getElementById('statBODY');
    const statREA = document.getElementById('statREA');
    const statTECH = document.getElementById('statTECH');
    const statCHA = document.getElementById('statCHA');
    const statWILL = document.getElementById('statWILL');
    
    if (statINT) statINT.value = state.stats.INT || 5;
    if (statDEX) statDEX.value = state.stats.DEX || 5;
    if (statBODY) statBODY.value = state.stats.BODY || 5;
    if (statREA) statREA.value = state.stats.REA || 5;
    if (statTECH) statTECH.value = state.stats.TECH || 5;
    if (statCHA) statCHA.value = state.stats.CHA || 5;
    if (statWILL) statWILL.value = state.stats.WILL || 5;
    
    // Обновляем вычисляемые характеристики
    updateDerivedStats();
    
    // Принудительно обновляем все производные характеристики
    calculateAndUpdateHealth();
    updateAwarenessMax();
    
    // Принудительно обновляем все отображения
    updateMoneyDisplay();
    
    // Пересчитываем нагрузку из инвентаря при загрузке
    if (typeof recalculateAndUpdateLoad === 'function') {
        recalculateAndUpdateLoad();
    } else {
        updateLoadDisplay();
    }
    
    // Обновляем удачу
    const luckCurrent = document.getElementById('luckCurrent');
    const luckMax = document.getElementById('luckMax');
    if (luckCurrent) luckCurrent.value = state.luck.current || 1;
    if (luckMax) luckMax.value = state.luck.max || 1;
    
    // Обновляем здоровье
    const healthCurrent = document.getElementById('healthCurrent');
    const healthMax = document.getElementById('healthMax');
    if (healthCurrent) healthCurrent.value = state.health.current || 25;
    if (healthMax) healthMax.value = state.health.max || 38;
    
    // Обновляем деку
    const deckName = document.getElementById('deckName');
    const deckOperative = document.getElementById('deckOperative');
    const deckGrid = document.getElementById('deckGrid');
    const deckMemory = document.getElementById('deckMemory');
    const deckVersion = document.getElementById('deckVersion');
    
    if (deckName) deckName.value = state.deck.name || '';
    if (deckOperative) deckOperative.value = state.deck.operative || '';
    if (deckGrid) deckGrid.value = state.deck.grid || '';
    if (deckMemory) deckMemory.value = state.deck.memory || '';
    if (deckVersion) deckVersion.value = state.deck.version || '';
    
    // Обновляем предысторию
    const backstoryText = document.getElementById('backstoryText');
    if (backstoryText) {
        backstoryText.value = state.backstory || '';
        // Обновляем красивое отображение предыстории
        if (typeof updateBackstoryDisplay === 'function') {
            updateBackstoryDisplay();
        }
    }
    
    // Обновляем броню
    const armorHeadOS = document.getElementById('armorHeadOS');
    const armorHeadType = document.getElementById('armorHeadType');
    const armorBodyOS = document.getElementById('armorBodyOS');
    const armorBodyType = document.getElementById('armorBodyType');
    const armorArmsOS = document.getElementById('armorArmsOS');
    const armorArmsType = document.getElementById('armorArmsType');
    const armorLegsOS = document.getElementById('armorLegsOS');
    const armorLegsType = document.getElementById('armorLegsType');
    
    if (armorHeadOS) armorHeadOS.value = state.armor.head.os || 0;
    if (armorHeadType) armorHeadType.textContent = state.armor.head.os > 0 ? state.armor.head.type || 'Лёгкая' : '';
    if (armorBodyOS) armorBodyOS.value = state.armor.body.os || 0;
    if (armorBodyType) armorBodyType.textContent = state.armor.body.os > 0 ? state.armor.body.type || 'Лёгкая' : '';
    if (armorArmsOS) armorArmsOS.value = state.armor.arms.os || 0;
    if (armorArmsType) armorArmsType.textContent = state.armor.arms.os > 0 ? state.armor.arms.type || 'Лёгкая' : '';
    if (armorLegsOS) armorLegsOS.value = state.armor.legs.os || 0;
    if (armorLegsType) armorLegsType.textContent = state.armor.legs.os > 0 ? state.armor.legs.type || 'Лёгкая' : '';
    
    // Обновляем описание брони
    const armorDescription = document.getElementById('armorDescription');
    if (armorDescription) armorDescription.value = state.armor.description || '';
    
    // Обновляем штраф от брони
    if (typeof updateArmorPenalty === 'function') updateArmorPenalty();
    
    // Обновляем инвентарь брони
    if (typeof renderArmorInventory === 'function') renderArmorInventory();
    
    // Обновляем кнопки снятия брони
    if (typeof updateArmorRemoveButtons === 'function') updateArmorRemoveButtons();
    
    // Обновляем критические травмы
    if (typeof renderInjuries === 'function') renderInjuries();
    
    // Обновляем жилье
    if (typeof renderHousing === 'function') renderHousing();
    
    // Обновляем коммерческую недвижимость
    if (typeof renderCommercialProperty === 'function') renderCommercialProperty();
    
    // Обновляем транспорт
    if (typeof renderTransport === 'function') renderTransport();
    
    // Обновляем снаряжение
    if (typeof renderGear === 'function') renderGear();
    
    // Обновляем оружие
    if (typeof renderWeapons === 'function') renderWeapons();
    
    // Обновляем боеприпасы
    if (typeof renderAmmo === 'function') renderAmmo();
    
    // Обновляем программы деки
    if (typeof renderDeckPrograms === 'function') renderDeckPrograms();
    
    // Обновляем щепки деки
    if (typeof renderDeckChips === 'function') renderDeckChips();
    
    // Обновляем снаряжение для деки
    if (typeof renderDeckGear === 'function') renderDeckGear();
    
    // Обновляем коллекцию дек
    if (typeof renderDecksCollection === 'function') renderDecksCollection();
}

// Экспорт и импорт данных
function exportData() {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ezy-cyber-character-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedState = JSON.parse(e.target.result);
                    Object.assign(state, importedState);
                    saveState();
                    location.reload();
                } catch (error) {
                    showAlertModal('Ошибка', 'Ошибка при импорте файла');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Функция clearAllData перенесена в scripts.js для более полной очистки

// Универсальные функции для модальных окон (замена alert/confirm/prompt)

function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.tabIndex = -1; // Позволяет модальному окну получать фокус
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1.5rem;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="pill-button secondary-button" onclick="closeConfirmModal(false, this.closest('.modal-overlay'))">Отмена</button>
                    <button class="pill-button danger-button" onclick="closeConfirmModal(true, this.closest('.modal-overlay'))">Да</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Сохраняем функции обратного вызова
    modal.onConfirm = onConfirm;
    modal.onCancel = onCancel;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeConfirmModal(false, modal);
        }
    });
    
    // Обработка клавиши Enter для подтверждения
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            closeConfirmModal(true, modal);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeConfirmModal(false, modal);
        }
    });
    
    // Фокусируемся на модальном окне для обработки клавиш
    setTimeout(() => {
        modal.focus();
    }, 100);
}

function closeConfirmModal(result, modalElement = null) {
    const modal = modalElement || document.querySelector('.modal-overlay:last-child');
    if (modal) {
        modal.remove();
        if (result && modal.onConfirm) {
            modal.onConfirm();
        } else if (!result && modal.onCancel) {
            modal.onCancel();
        }
    }
}

function showPromptModal(title, message, defaultValue = '', onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closePromptModal(null)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">${message}</p>
                <input type="text" id="promptInput" value="${defaultValue}" style="width: 100%; padding: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text};">
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="pill-button secondary-button" onclick="closePromptModal(null)">Отмена</button>
                    <button class="pill-button primary-button" onclick="closePromptModal(document.getElementById('promptInput').value)">ОК</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = document.getElementById('promptInput');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // Обработка Enter и Escape
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            closePromptModal(document.getElementById('promptInput').value);
        } else if (e.key === 'Escape') {
            closePromptModal(null);
        }
    });
    
    // Сохраняем функции обратного вызова
    modal.onConfirm = onConfirm;
    modal.onCancel = onCancel;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePromptModal(null);
        }
    });
}

function closePromptModal(result) {
    const modal = document.querySelector('.modal-overlay:last-child');
    if (modal) {
        modal.remove();
        if (result !== null && modal.onConfirm) {
            modal.onConfirm(result);
        } else if (result === null && modal.onCancel) {
            modal.onCancel();
        }
    }
}

function showAlertModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1.5rem;">${message}</p>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="pill-button primary-button" onclick="closeModal(this.parentElement.parentElement.parentElement)">ОК</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Обработка клавиши Enter для закрытия окна
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            closeModal(modal.querySelector('.icon-button'));
        } else if (e.key === 'Escape') {
            e.preventDefault();
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Алиас для showModal (используем window для глобальной области видимости)
window.showModal = showAlertModal;

// ============================================================================
// СИСТЕМА ТОРГА ПРИ ПОКУПКЕ
// ============================================================================

// Проверяет, доступен ли торг (есть навык и он включён)
function canBargain() {
    // Проверяем наличие навыка "Торг"
    const bargainSkill = state.skills.find(s => s.name === 'Торг' || (s.customName && s.customName === 'Торг'));
    
    // Торг доступен если: есть навык, уровень > 0, и торг включён
    const result = bargainSkill && bargainSkill.level > 0 && state.bargainEnabled;
    console.log('canBargain():', { 
        bargainSkill: bargainSkill ? { name: bargainSkill.name, level: bargainSkill.level } : null,
        bargainEnabled: state.bargainEnabled,
        result 
    });
    return result;
}

// ============================================================================
// СИСТЕМА СОСТОЯНИЯ СВОРАЧИВАНИЯ ЭЛЕМЕНТОВ
// ============================================================================

// Инициализация состояния сворачивания
function initializeCollapsedItemsState() {
    if (!state.collapsedItems) {
        state.collapsedItems = {
            commercialProperty: [],
            vehicles: [],
            housing: [],
            gear: [],
            armor: [],
            weapons: [],
            drugs: [],
            implants: [],
            deckPrograms: [],
            deckChips: []
        };
    }
}

// Добавить элемент в список свернутых
function addCollapsedItem(category, index) {
    initializeCollapsedItemsState();
    if (!state.collapsedItems[category].includes(index)) {
        state.collapsedItems[category].push(index);
        scheduleSave();
    }
}

// Удалить элемент из списка свернутых
function removeCollapsedItem(category, index) {
    initializeCollapsedItemsState();
    const itemIndex = state.collapsedItems[category].indexOf(index);
    if (itemIndex > -1) {
        state.collapsedItems[category].splice(itemIndex, 1);
        scheduleSave();
    }
}

// Проверить, свернут ли элемент
function isItemCollapsed(category, index) {
    initializeCollapsedItemsState();
    return state.collapsedItems[category].includes(index);
}

// Переключить состояние сворачивания элемента
function toggleCollapsedItem(category, index) {
    if (isItemCollapsed(category, index)) {
        removeCollapsedItem(category, index);
        return false; // Элемент развернут
    } else {
        addCollapsedItem(category, index);
        return true; // Элемент свернут
    }
}

// Получить стиль отображения для элемента
function getCollapsedDisplayStyle(category, index) {
    return isItemCollapsed(category, index) ? 'none' : 'block';
}

// Обновить состояние сворачивания для массива элементов (при удалении элементов)
function updateCollapsedItemsAfterRemoval(category, removedIndex) {
    initializeCollapsedItemsState();
    state.collapsedItems[category] = state.collapsedItems[category]
        .map(index => index > removedIndex ? index - 1 : index)
        .filter(index => index >= 0);
    scheduleSave();
}

console.log('Utils.js loaded - вспомогательные функции загружены');

// Функция обновления отображения нагрузки (копия из deck.js для совместимости)
function updateLoadDisplay() {
    // Не пересчитываем нагрузку автоматически - только обновляем отображение
    
    // Обновляем отображение нагрузки
    const currentLoadEl = document.getElementById('currentLoad');
    const maxLoadEl = document.getElementById('maxLoad');
    
    if (currentLoadEl) currentLoadEl.textContent = state.load.current;
    if (maxLoadEl) maxLoadEl.textContent = state.load.max;
    
    // Показываем штраф под "Скорость перемещения" только если нагрузка меньше 0
    const speedWarningEl = document.getElementById('speedWarning');
    
    if (state.load.current < 0) {
        const penalty = Math.ceil(Math.abs(state.load.current) / 5);
        
        if (speedWarningEl) {
            speedWarningEl.textContent = `Штраф ${penalty} от перегрузки!`;
            speedWarningEl.style.display = 'block';
            speedWarningEl.style.color = 'var(--danger)';
            speedWarningEl.style.fontSize = '0.8rem';
            speedWarningEl.style.fontWeight = '600';
            speedWarningEl.style.marginTop = '0.25rem';
        }
    } else if (speedWarningEl) {
        speedWarningEl.style.display = 'none';
    }
}