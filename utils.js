// EZY: Cyber Character Sheet - Utility Functions
// Вспомогательные функции общего назначения

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
        
        // Добавляем стартовый транспорт, если его нет
        if (!state.property || !state.property.vehicles || state.property.vehicles.length === 0) {
            if (!state.property) {
                state.property = { vehicles: [], realEstate: [] };
            }
            if (!state.property.vehicles) {
                state.property.vehicles = [];
            }
            
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
                isDefault: true,
                itemType: 'free_default'
            });
            
            console.log('Добавлен стартовый транспорт: Компактный Микромобиль');
        }
        
        updateUIFromState();
        
        // Загружаем профессиональные навыки и заметки
        loadProfessionalSkills();
        loadNotes();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
    }
}

// Автосохранение с debounce
let saveTimeout;
function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveState, 300);
}

// Генерация уникальных ID
function generateId() {
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
    if (backstoryText) backstoryText.value = state.backstory || '';
    
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
    if (armorHeadType) armorHeadType.value = state.armor.head.type || 'Лёгкая';
    if (armorBodyOS) armorBodyOS.value = state.armor.body.os || 0;
    if (armorBodyType) armorBodyType.value = state.armor.body.type || 'Лёгкая';
    if (armorArmsOS) armorArmsOS.value = state.armor.arms.os || 0;
    if (armorArmsType) armorArmsType.value = state.armor.arms.type || 'Лёгкая';
    if (armorLegsOS) armorLegsOS.value = state.armor.legs.os || 0;
    if (armorLegsType) armorLegsType.value = state.armor.legs.type || 'Лёгкая';
    
    // Обновляем описание брони
    const armorDescription = document.getElementById('armorDescription');
    if (armorDescription) armorDescription.value = state.armor.description || '';
    
    // Обновляем штраф от брони
    if (typeof updateArmorPenalty === 'function') updateArmorPenalty();
    
    // Обновляем критические травмы
    if (typeof renderInjuries === 'function') renderInjuries();
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

function clearAllData() {
    showConfirmModal('Подтверждение', 'Вы уверены, что хотите очистить все данные?', () => {
        localStorage.removeItem('ezyCyberCharacter');
        location.reload();
    });
}

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
                <p style="color: var(--text); margin-bottom: 1.5rem;">${message}</p>
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
                <p style="color: var(--text); margin-bottom: 1rem;">${message}</p>
                <input type="text" id="promptInput" value="${defaultValue}" style="width: 100%; padding: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
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
                <p style="color: var(--text); margin-bottom: 1.5rem;">${message}</p>
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

console.log('Utils.js loaded - вспомогательные функции загружены');