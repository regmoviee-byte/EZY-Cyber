// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ДЕКОЙ
// Управление декой, программами, щепками, улучшениями, магазин дек
// ============================================================================

// deck.js loading...
console.log('🔍 deck.js начал загружаться...');

// Функции для работы с секцией "Дека"
function toggleDeckSection(sectionType) {
    let containerId, toggleId;
    
    switch(sectionType) {
        case 'programs':
            containerId = 'deckProgramsContainer';
            toggleId = 'deckProgramsToggle';
            break;
        case 'chips':
            containerId = 'deckChipsContainer';
            toggleId = 'deckChipsToggle';
            break;
        case 'upgrades':
            containerId = 'deckUpgradesContainer';
            toggleId = 'deckUpgradesToggle';
            break;
        case 'installedChips':
            containerId = 'deckInstalledChipsContainer';
            toggleId = 'deckInstalledChipsToggle';
            break;
        default:
            return;
    }
    
    const container = document.getElementById(containerId);
    const toggle = document.getElementById(toggleId);
    
    if (!container || !toggle) return;
    
    const isVisible = container.style.display !== 'none';
    
    if (isVisible) {
        // Сворачиваем
        container.style.display = 'none';
        toggle.textContent = '▶';
    } else {
        // Разворачиваем
        container.style.display = 'block';
        toggle.textContent = '▼';
    }
}

function renderDeckPrograms() {
    const container = document.getElementById('deckProgramsContainer');
    if (!container) return;
    
    // Подсчитываем используемую память
    const usedMemory = state.deckPrograms.reduce((total, program) => total + (program.memory || 1), 0);
    const maxMemory = parseInt(state.deck.memory) + state.deckGear.filter(item => 
        item.deckGearType === 'upgrade' && 
        item.stat === 'memory' && 
        item.installedDeckId === 'main'
    ).length;
    
    if (state.deckPrograms.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Программы не установлены</p>';
        updateDeckCounters();
        return;
    }
    
    container.innerHTML = state.deckPrograms.map((program, index) => `
        <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <button onclick="removeDeckProgramWithChoice(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;">×</button>
            <div style="padding-right: 1.5rem;">
                <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${program.name}</div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem; margin-bottom: 0.25rem;">
                    Цена: ${program.price} уе | ОЗУ: ${program.ram} | Память: ${program.memory || 1} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}
                </div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; line-height: 1.3;">
                    ${program.description}
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем информацию об использовании памяти
    const memoryInfo = document.createElement('div');
    memoryInfo.style.cssText = 'margin-top: 0.5rem; padding: 0.75rem; background: rgba(91, 155, 255, 0.1); border: 1px solid #5b9bff; border-radius: 6px; text-align: center;';
    memoryInfo.innerHTML = `
        <div style="color: ${getThemeColors().accent}; font-size: 0.8rem;">
            Использовано памяти: <strong>${usedMemory}/${maxMemory}</strong>
            ${usedMemory > maxMemory ? '<span style="color: ${getThemeColors().danger};"> (ПРЕВЫШЕНО!)</span>' : ''}
        </div>
    `;
    container.appendChild(memoryInfo);
    
    // Обновляем счетчик в заголовке
    updateDeckCounters();
}

// Функция обновления отображения характеристик деки
function updateDeckDisplay() {
    // Блок Деки теперь содержит только кнопки и щепки памяти
    // Все управление деками происходит через поп-ап "Мои Деки"
    
    // Обновляем только щепки памяти
    renderDeckChips();
}

// Функция отображения улучшений деки
function renderDeckUpgrades() {
    const container = document.getElementById('deckUpgradesContainer');
    if (!container) return;
    
    const upgrades = [
        { name: 'Улучшение памяти', stat: 'memory', maxUpgrades: 5, priceMultiplier: 200 },
        { name: 'Улучшение ОЗУ', stat: 'ram', maxUpgrades: 5, priceMultiplier: 1000 },
        { name: 'Улучшение Видимости', stat: 'grid', maxUpgrades: 5, priceMultiplier: 100 }
    ];
    
    container.innerHTML = upgrades.map(upgrade => {
        const installedUpgrades = state.deckGear.filter(item => 
            item.deckGearType === 'upgrade' && 
            item.stat === upgrade.stat && 
            item.installedDeckId === 'main'
        );
        
        const upgradeCount = installedUpgrades.length;
        const canInstall = upgradeCount < upgrade.maxUpgrades;
        
        // Рассчитываем стоимость для следующего уровня
        let nextPrice = 0;
        if (canInstall) {
            if (upgrade.stat === 'memory') {
                const currentMemory = parseInt(state.deck.memory) + upgradeCount;
                nextPrice = (currentMemory + 1) * upgrade.priceMultiplier;
            } else if (upgrade.stat === 'ram') {
                const currentRam = parseInt(state.deckRam.current) + upgradeCount;
                nextPrice = (currentRam + 1) * upgrade.priceMultiplier;
            } else if (upgrade.stat === 'grid') {
                const currentGrid = parseInt(state.deck.grid) + upgradeCount;
                nextPrice = (currentGrid + 1) * upgrade.priceMultiplier;
            }
        }
        
        // Применяем скидку Чёрного хакера (5% за уровень)
        const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
        const discount = blackHackerLevel * 5;
        const originalPrice = nextPrice;
        nextPrice = calculateFinalPrice(nextPrice, discount);
        const hasDiscount = discount > 0;
        
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 193, 7, 0.1); border: 1px solid var(--warning); border-radius: 6px;">
                <div>
                    <div style="font-weight: 600; font-size: 0.9rem;">${upgrade.name}</div>
                    <div style="color: ${getThemeColors().muted}; font-size: 0.8rem;">Улучшений: ${upgradeCount}/${upgrade.maxUpgrades}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    ${canInstall ? `
                        ${hasDiscount ? `<span style="text-decoration: line-through; color: ${getThemeColors().muted}; font-size: 0.75rem;">${originalPrice}</span>` : ''}
                        <span style="color: ${hasDiscount ? 'var(--success)' : 'var(--accent)'}; font-size: 0.8rem; font-weight: ${hasDiscount ? '600' : 'normal'};">${nextPrice} уе${hasDiscount ? ` <span style="font-size: 0.7rem;">(-${discount}%)</span>` : ''}</span>
                        <button class="pill-button primary-button" onclick="installDeckUpgrade('${upgrade.stat}', ${nextPrice})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Улучшить</button>
                    ` : `
                        <span style="color: ${getThemeColors().muted}; font-size: 0.8rem;">Максимум улучшений</span>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// Функция отображения установленных щепок
function renderDeckInstalledChips() {
    const container = document.getElementById('deckInstalledChipsContainer');
    const countElement = document.getElementById('deckInstalledChipsCount');
    
    if (!container) return;
    
    // Подсчитываем слоты для щепок
    const chipSlotModules = state.deckGear.filter(item => 
        item.deckGearType === 'module' && 
        item.name === 'Дополнительный слот для Щепки' && 
        item.installedDeckId === 'main'
    );
    const chipSlots = 1 + chipSlotModules.length;
    
    // Подсчитываем установленные щепки
    const installedChips = state.deckChips.filter(chip => chip.installedDeckId === 'main');
    
    if (countElement) {
        countElement.textContent = `(${installedChips.length}/${chipSlots})`;
    }
    
    if (installedChips.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Щепки не установлены</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; gap: 0.5rem;">
            ${installedChips.map(chip => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 193, 7, 0.1); border: 1px solid var(--warning); border-radius: 6px;">
                    <div>
                        <div style="font-weight: 600; font-size: 0.9rem;">${chip.name}</div>
                        <div style="color: ${getThemeColors().muted}; font-size: 0.8rem;">${chip.description || 'Щепка памяти'}</div>
                    </div>
                    <button class="pill-button danger-button" onclick="removeChipFromDeck('${chip.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Удалить</button>
                </div>
            `).join('')}
        </div>
    `;
}

function renderDeckChips() {
    const container = document.getElementById('deckChipsContainer');
    if (!container) return;
    
    if (state.deckChips.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Щепки памяти не добавлены</p>';
        updateDeckCounters();
        return;
    }
    
    container.innerHTML = state.deckChips.map((chip, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; gap: 0.5rem; padding-right: 3rem;">
                <button onclick="editMemoryChip(${index})" style="background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer; font-size: 0.8rem;" title="Редактировать">&#x270F;&#xFE0F;</button>
                <button onclick="removeMemoryChip(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;">×</button>
            </div>
            <div>
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${chip.name}</div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem; margin-bottom: 0.5rem;">
                    ${chip.programs && chip.programs.length > 0 ? `
                        <div style="margin-bottom: 0.5rem;">
                            <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.25rem;">Программы:</div>
                            ${chip.programs.map(program => `
                                <div style="margin-bottom: 0.3rem; padding-left: 0.5rem;">
                                    <div style="font-weight: 600; color: ${getThemeColors().text};">• ${program.name}</div>
                                    ${program.description ? `<div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-top: 0.1rem; line-height: 1.3;">${program.description}</div>` : ''}
                </div>
                            `).join('')}
                        </div>
                    ` : chip.content ? `Содержимое: ${chip.content.substring(0, 50)}${chip.content.length > 50 ? '...' : ''}` : chip.description ? chip.description : 'Пустая щепка'}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${chip.installedDeckId ? `
                        <span style="color: ${getThemeColors().success}; font-size: 0.8rem;">Установлена на деку</span>
                    ` : `
                        <button class="pill-button primary-button" onclick="installChipOnDeck('${chip.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Установить на деку</button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
    
    // Обновляем счетчик в заголовке
    updateDeckCounters();
}

function updateDeckCounters() {
    // Обновляем счетчики в заголовках секций
    const programsCount = document.getElementById('deckProgramsCount');
    const chipsCount = document.getElementById('deckChipsCount');
    
    if (programsCount) {
        programsCount.textContent = `(${state.deckPrograms.length})`;
    }
    
    if (chipsCount) {
        chipsCount.textContent = `(${state.deckChips.length})`;
    }
}

// Вспомогательная функция для получения уровня профессионального навыка по имени
function getProfessionalSkillLevel(skillName) {
    if (!state.professionalSkills) return 0;
    const skill = state.professionalSkills.find(s => s && s.name === skillName);
    return skill && skill.level ? parseInt(skill.level) : 0;
}

// Функция расчёта скидки на программы
function calculateProgramDiscount(program) {
    let discount = 0;
    
    // Белый хакер: 10% скидка на Летальные программы за уровень
    if (program.lethal) {
        const whiteHackerLevel = getProfessionalSkillLevel('Белый хакер');
        discount += whiteHackerLevel * 10;
    }
    
    // Чёрный хакер: 10% скидка на Нелетальные программы за уровень
    if (!program.lethal) {
        const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
        discount += blackHackerLevel * 10;
    }
    
    return Math.min(discount, 100); // Максимум 100% скидка
}

// Функция расчёта скидки на снаряжение для Деки
function calculateDeckGearDiscount() {
    let discount = 0;
    
    // Чёрный хакер: 5% скидка на всё снаряжение для Деки за уровень
    const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
    discount += blackHackerLevel * 5;
    
    return Math.min(discount, 100); // Максимум 100% скидка
}

// Функция расчёта финальной цены с учётом скидки
function calculateFinalPrice(originalPrice, discount) {
    const price = parseInt(originalPrice) || 0;
    const discountPercent = parseInt(discount) || 0;
    
    // Проверяем входные данные
    if (isNaN(price) || isNaN(discountPercent)) {
        return price;
    }
    
    // Если скидка 0, возвращаем оригинальную цену
    if (discountPercent === 0) {
        return price;
    }
    
    const finalPrice = Math.floor(price * (100 - discountPercent) / 100);
    
    // Дополнительная проверка результата
    if (isNaN(finalPrice) || finalPrice === undefined || finalPrice === null || finalPrice < 0) {
        return price; // Fallback to original price
    }
    
    return finalPrice;
}

function showProgramShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3363-6531-4132-a138-663132646531/remote-control.png" alt="💾" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин программ</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleProgramsFreeMode()" id="programsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${STANDARD_PROGRAMS.map((program, index) => {
                        const discount = calculateProgramDiscount(program);
                        const originalPrice = parseInt(program.price) || 0;
                        let finalPrice = calculateFinalPrice(originalPrice, discount);
                        
                        // Дополнительная проверка на NaN или undefined
                        if (isNaN(finalPrice) || finalPrice === undefined || finalPrice === null) {
                            finalPrice = originalPrice; // Fallback to original price
                        }
                        
                        // Еще одна проверка - если finalPrice равен originalPrice при наличии скидки
                        if (discount > 0 && finalPrice === originalPrice) {
                            // Попробуем пересчитать
                            const recalculated = Math.floor(originalPrice * (100 - discount) / 100);
                            if (!isNaN(recalculated) && recalculated !== originalPrice) {
                                finalPrice = recalculated;
                            }
                        }
                        
                        const hasDiscount = discount > 0;
                        
                        return `
                            <div class="shop-item">
                                <div class="shop-item-header">
                                    <h4 class="shop-item-title">${program.name}</h4>
                                </div>
                                
                                <p class="shop-item-description">
                                    ${program.description}
                                </p>
                                
                                <div class="shop-item-stats">
                                    <div class="shop-stat">RAM: ${program.ram}</div>
                                    <div class="shop-stat">${program.lethal ? 'Смертельная' : 'Несмертельная'}</div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                                    <span class="program-price-display" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${originalPrice}">
                                        ${hasDiscount ? `<span style="text-decoration: line-through; color: ${getThemeColors().muted};">${originalPrice}</span> <span style="color: ${getThemeColors().success};">${finalPrice}</span> <span style="color: ${getThemeColors().success}; font-size: 0.75rem;">(-${discount}%)</span>` : finalPrice} уе
                                    </span>
                                    <button class="pill-button primary-button program-buy-button" onclick="buyProgram('${program.name.replace(/'/g, "\\'")}', ${finalPrice}, ${program.ram}, ${program.lethal}, '${program.description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" data-program-name="${program.name}" data-price="${finalPrice}" data-original-price="${originalPrice}" data-ram="${program.ram}" data-lethal="${program.lethal}" data-description="${program.description.replace(/'/g, "\\'").replace(/"/g, '\\"')}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                        Купить
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
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
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function getProgramFree(name, ram, lethal, description) {
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    // Показываем модал установки без списания денег
    showProgramInstallModal(name, 0, ram, lethal, description);
}

function toggleProgramsFreeMode() {
    const buyButtons = document.querySelectorAll('.program-buy-button');
    const priceDisplays = document.querySelectorAll('.program-price-display');
    const toggleButton = document.getElementById('programsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        // Отключаем бесплатный режим - возвращаем оригинальные цены
        buyButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const name = btn.getAttribute('data-program-name');
            const ram = btn.getAttribute('data-ram');
            const lethal = btn.getAttribute('data-lethal');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyProgram('${name}', ${price}, ${ram}, ${lethal}, '${description}')`);
        });
        
        // Возвращаем оригинальные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            display.textContent = originalPrice;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        // Включаем бесплатный режим - ставим цены 0
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-program-name');
            const ram = btn.getAttribute('data-ram');
            const lethal = btn.getAttribute('data-lethal');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyProgram('${name}', 0, ${ram}, ${lethal}, '${description}')`);
        });
        
        // Меняем цены визуально на 0
        priceDisplays.forEach(display => {
            display.textContent = '0';
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

function buyProgram(name, price, ram, lethal, description, catalogPrice = null) {
    console.log(`buyProgram called with: name=${name}, price=${price} (type: ${typeof price}), ram=${ram}, lethal=${lethal}`);
    console.log(`Price is NaN: ${isNaN(price)}, Price is undefined: ${price === undefined}`);
    
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши, мабой</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="pill-button" onclick="closeModal(this); setTimeout(() => showProgramInstallModal('${name.replace(/'/g, "\\'")}', 0, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}'), 100)">
                        Игнорировать
                    </button>
                    <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => showCustomPriceModal('${name.replace(/'/g, "\\'")}', ${price}, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}'), 100)">
                        Ввести сумму
                    </button>
                </div>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Показываем модал установки программы с выбором деки
    showProgramInstallModal(name, price, ram, lethal, description, catalogPrice);
}

function showCustomPriceModal(name, originalPrice, ram, lethal, description) {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Ввести свою цену</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p><strong>${name}</strong></p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Оригинальная цена: <strong style="color: ${getThemeColors().danger};">${originalPrice} уе</strong>
                    </p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Ваша цена</label>
                    <input type="number" class="input-field" id="customProgramPrice" value="${originalPrice}" min="0" placeholder="Введите цену">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="buyProgramWithCustomPrice('${name.replace(/'/g, "\\'")}', ${ram}, ${lethal}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">Купить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = document.getElementById('customProgramPrice');
        if (input) input.focus();
    }, 100);
}

function buyProgramWithCustomPrice(name, ram, lethal, description, catalogPrice = null) {
    const customPrice = parseInt(document.getElementById('customProgramPrice').value) || 0;
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < customPrice) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Даже на эту сумму не хватает денег!</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - customPrice;
    updateMoneyDisplay();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    // Показываем модал установки
    showProgramInstallModal(name, customPrice, ram, lethal, description, catalogPrice);
}

function showProgramInstallModal(name, price, ram, lethal, description, catalogPrice = null) {
    const content = `
                <div style="margin-bottom: 1rem;">
                    <p><strong>${name}</strong></p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Цена: <strong style="color: ${getThemeColors().accent};">${price} уе</strong> | 
                        RAM: <strong style="color: ${getThemeColors().success};">${ram}</strong> |
                        ${lethal ? '<strong style="color: ${getThemeColors().danger};">Смертельная</strong>' : '<strong style="color: ${getThemeColors().success};">Несмертельная</strong>'}
                    </p>
                    <p style="font-size: 0.9rem; color: ${getThemeColors().muted}; margin-bottom: 1rem;">
                        ${description}
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.75rem;">
                    <label class="field">
                        Установить на
                <select id="programInstallTarget" style="width: 100%;" onchange="toggleProgramInstallOptions()">
                            <option value="deck">Дека</option>
                            <option value="chip">Щепку памяти</option>
                </select>
            </label>
            
            <div id="deckSelectionContainer" style="display: none;">
                <label class="field">
                    Выберите деку
                    <select id="programDeckSelect" style="width: 100%;">
                        ${state.deck ? `<option value="main">Основная дека (${state.deck.name})</option>` : ''}
                        ${state.decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('')}
                        </select>
                    </label>
            </div>
        </div>
    `;
    
    const buttons = [
        {
            text: 'Установить',
            class: 'primary-button',
            onclick: `installProgram('${name.replace(/'/g, "\\'")}', ${price}, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}', ${catalogPrice || 'null'})`
        }
    ];
    
    showModal(`Установка программы: ${name}`, content, buttons);
    
    // Показываем выбор деки, так как по умолчанию выбрана "Дека"
    setTimeout(() => {
        toggleProgramInstallOptions();
    }, 100);
}

// Функция переключения опций установки программы
function toggleProgramInstallOptions() {
    const target = document.getElementById('programInstallTarget').value;
    const deckContainer = document.getElementById('deckSelectionContainer');
    
    if (deckContainer) {
    if (target === 'deck') {
            deckContainer.style.display = 'block';
        } else {
            deckContainer.style.display = 'none';
        }
    }
}

function installProgram(name, price, ram, lethal, description, catalogPrice = null) {
    const target = document.getElementById('programInstallTarget').value;
    
    if (target === 'deck') {
        // Получаем выбранную деку из окна установки
        const selectedDeckId = document.getElementById('programDeckSelect').value;
        
        // Закрываем только окно установки программы, а не весь магазин
        const installModal = document.querySelector('.modal-overlay:last-child');
        if (installModal) {
            installModal.remove();
        }
        
        // Устанавливаем программу на деку (это покажет уведомление об успешной установке)
        installProgramOnDeck(name, price, ram, lethal, description, catalogPrice, selectedDeckId);
    } else {
        // Установка на щепку - создаем новую щепку
        const currentMoney = parseInt(state.money) || 0;
        const chipCost = 10; // Стоимость создания щепки
        const totalCost = price + chipCost; // Общая стоимость программы + щепки
        
        if (currentMoney < totalCost) {
            showModal('Недостаточно денег', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег для покупки!</p>
                    <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Программа: ${price} уе + Щепка: ${chipCost} уе = ${totalCost} уе</p>
                    <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Доступно: ${currentMoney} уе</p>
                    <button class="pill-button" onclick="closeModal(this)">Понятно</button>
                </div>
            `);
            return;
        }
        
        // Списываем деньги за программу и щепку
        state.money = currentMoney - totalCost;
        updateMoneyDisplay();
        
        // Создаем новую щепку с программой
        const newChip = {
            id: generateId('chip'),
            name: 'Сам купил',
            programs: [{
                name: name,
                price: price,
                ram: ram,
                lethal: lethal,
                description: description
            }],
            content: '',
            installedDeckId: null
        };
        
        state.deckChips.push(newChip);
        renderDeckChips();
        
        // Добавляем в лог
        if (price > 0) {
            addToRollLog('purchase', {
                item: `Программа "${name}" + Щепка`,
                price: price + chipCost,
                category: 'Программа (на щепке)'
            });
        }
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        scheduleSave();
        
        showModal('Щепка создана', `&#x2705; Создана щепка "Сам купил" с программой ${name}!<br>Списано ${totalCost} уе (программа: ${price} уе + щепка: ${chipCost} уе).`);
    }
}

// Функция установки программы на конкретную деку
function installProgramOnDeck(name, price, ram, lethal, description, catalogPrice, deckId) {
    // Проверяем лимит памяти для выбранной деки
    const usedMemory = state.deckPrograms.reduce((total, program) => {
        if (program.installedDeckId == deckId) {
            return total + (program.memory || 1);
        }
        return total;
    }, 0);
    
    // Находим деку по ID (стартовая дека или купленная)
    let targetDeck = null;
    if (deckId === 'main' && state.deck) {
        targetDeck = state.deck;
    } else {
        console.log('Поиск деки с ID:', deckId, 'тип:', typeof deckId);
        console.log('Доступные деки:', state.decks.map(d => ({id: d.id, name: d.name, type: typeof d.id})));
        targetDeck = state.decks.find(d => d.id == deckId); // Используем == для сравнения строки и числа
    }
    
    if (!targetDeck) {
        showModal('Ошибка', 'Дека не найдена!');
        return;
    }
    
    const baseMemory = parseInt(targetDeck.memory);
    const memoryUpgrades = state.deckGear.filter(item => 
        item.deckGearType === 'upgrade' && 
        item.stat === 'memory' && 
        item.installedDeckId == deckId
    ).length;
    const maxMemory = baseMemory + memoryUpgrades;
    
    const programMemory = 1; // По умолчанию программа занимает 1 единицу памяти
    if (usedMemory + programMemory > maxMemory) {
        showModal('Недостаточно памяти', `Недостаточно памяти на деке. Использовано: ${usedMemory}/${maxMemory}`);
        return;
    }
    
    const newProgram = {
        id: generateId('program'),
        name: name,
        price: price,
        ram: ram,
        lethal: lethal,
        description: description,
        memory: programMemory,
        installedOn: 'deck',
        installedDeckId: deckId,
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.deckPrograms.push(newProgram);
    
    // Обновляем отображение программ (если это основная дека)
    if (deckId === 'main') {
        renderDeckPrograms();
    }
    
    // Обновляем отображение коллекции дек (если окно открыто)
    const deckCollectionModal = document.querySelector('.modal-overlay');
    if (deckCollectionModal && document.getElementById('deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    // Добавляем в лог (только если программа была куплена за деньги)
    if (price > 0) {
        addToRollLog('purchase', {
            item: name,
            price: price,
            category: 'Программа (на Деку)'
        });
    }
    
    scheduleSave();
    
    const deckName = deckId === 'main' ? state.deck.name : state.decks.find(d => d.id == deckId)?.name || 'Неизвестная дека';
    showModal('Программа установлена', `&#x2705; ${name} установлена на ${deckName}!`);
}

function removeDeckProgram(index) {
        state.deckPrograms.splice(index, 1);
        renderDeckPrograms();
        scheduleSave();
}

function addMemoryChip() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>💾 Добавить щепку памяти</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Стоимость создания щепки: <strong style="color: ${getThemeColors().accent};">10 уе</strong>
                    </p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Название щепки</label>
                    <input type="text" class="input-field" id="chipName" placeholder="Например: Рабочая щепка">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveMemoryChip()">Создать</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = document.getElementById('chipName');
        if (input) input.focus();
    }, 100);
}

function saveMemoryChip() {
    const name = document.getElementById('chipName').value.trim();
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название щепки!</p>
            </div>
        `);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    const chipCost = 10; // Стоимость создания щепки
    
    if (currentMoney < chipCost) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши для создания щепки!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Создание щепки стоит ${chipCost} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги за щепку
    state.money = currentMoney - chipCost;
    updateMoneyDisplay();
    
    const newChip = {
        id: generateId('chip'),
        name: name,
        program: null // Пустая щепка
    };
    
    state.deckChips.push(newChip);
    renderDeckChips();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Щепка создана', `&#x2705; Создана пустая щепка "${name}"!<br>Списано ${chipCost} уе за создание щепки.`);
}

function editMemoryChip(index) {
    const chip = state.deckChips[index];
    
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>&#x270F;&#xFE0F; Редактировать щепку</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label class="input-label">Название щепки</label>
                    <input type="text" class="input-field" id="editChipName" value="${chip.name}" placeholder="Введите название">
                </div>
                
                <div style="margin-top: 1.5rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin-bottom: 1rem;">Содержимое щепки</h4>
                    
                    ${chip.programs && chip.programs.length > 0 ? `
                        <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="color: ${getThemeColors().success}; font-weight: 600; margin-bottom: 0.5rem;">📀 Программы:</div>
                            ${chip.programs.map((program, progIndex) => `
                                <div style="margin-bottom: 0.5rem; padding: 0.5rem; background: rgba(125, 244, 198, 0.2); border-radius: 4px;">
                                    <div style="font-weight: 600;">${program.name}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.8rem;">ОЗУ: ${program.ram} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">${program.description}</div>
                                    <button class="pill-button danger-button" onclick="removeProgramFromChip(${index}, ${progIndex})" style="margin-top: 0.25rem; font-size: 0.7rem;">Удалить</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 1rem;">💾 Пустая щепка</div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label class="input-label">Записать программу</label>
                                <button class="pill-button primary-button" onclick="showProgramInstallModalForChip(${index})" style="width: 100%; margin-top: 0.5rem;">📀 Выбрать программу</button>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <label class="input-label">Или заполнить вручную</label>
                                <textarea class="input-field" id="editChipContent" rows="4" placeholder="Введите содержимое щепки...">${chip.content || ''}</textarea>
                            </div>
                        </div>
                    `}
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveEditedChip(${index})">Сохранить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Фокусируемся на поле ввода и выделяем текст
    setTimeout(() => {
        const input = document.getElementById('editChipName');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

function saveEditedChip(index) {
    const newName = document.getElementById('editChipName').value.trim();
    const content = document.getElementById('editChipContent') ? document.getElementById('editChipContent').value.trim() : '';
    
    if (!newName) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название щепки!</p>
            </div>
        `);
        return;
    }
    
    state.deckChips[index].name = newName;
    if (content) {
        state.deckChips[index].content = content;
    }
    
    // Обновляем отображение щепок и блока Дека
    renderDeckChips();
    updateDeckDisplay();
    
    // Если открыт поп-ап коллекции дек, обновляем его
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeMemoryChip(index) {
        state.deckChips.splice(index, 1);
        renderDeckChips();
        scheduleSave();
}

function showProgramInstallModalForChip(chipIndex) {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>📀 Выбрать программу для щепки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    ${STANDARD_PROGRAMS.map((program, index) => `
                        <div class="program-item">
                            <div class="program-info">
                                <div class="program-name">${program.name}</div>
                                <div class="program-details">
                                    Цена: ${program.price} уе | RAM: ${program.ram} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}
                                </div>
                                <div class="program-description" style="font-size: 0.8rem; color: ${getThemeColors().muted}; margin-top: 0.25rem;">
                                    ${program.description}
                                </div>
                            </div>
                            <div class="program-actions">
                                <button class="pill-button primary-button" onclick="installProgramOnChip(${chipIndex}, '${program.name}', ${program.price}, ${program.ram}, ${program.lethal}, '${program.description.replace(/'/g, "\\'")}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Записать на щепку</button>
                            </div>
                        </div>
                    `).join('')}
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
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function installProgramOnChip(chipIndex, name, price, ram, lethal, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Недостаточно денег для покупки программы!</p>
                <p style="color: ${getThemeColors().muted};">Требуется: ${price} уе | Доступно: ${currentMoney} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Записываем программу на щепку
    if (!state.deckChips[chipIndex].programs) {
        state.deckChips[chipIndex].programs = [];
    }
    
    state.deckChips[chipIndex].programs.push({
        name: name,
        price: price,
        ram: ram,
        lethal: lethal,
        description: description
    });
    
    // Обновляем отображение щепок и блока Дека
    renderDeckChips();
    updateDeckDisplay();
    
    // Если открыт поп-ап коллекции дек, обновляем его
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Программа (на щепку)'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Программа записана', `&#x2705; ${name} записана на щепку!`);
}

function removeProgramFromChip(chipIndex, programIndex) {
    const chip = state.deckChips[chipIndex];
    if (!chip || !chip.programs || !chip.programs[programIndex]) return;
    
    chip.programs.splice(programIndex, 1);
    
    // Обновляем отображение щепок и блока Дека
        renderDeckChips();
    updateDeckDisplay();
    
    // Если открыт поп-ап коллекции дек, обновляем его
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        showModal('Программа удалена', `&#x2705; Программа удалена с щепки!`);
}

// Функции для работы с киберимплантами
function renderImplants() {
    const container = document.getElementById('implantsContainer');
    if (!container) return;
    
    // Собираем все установленные модули из всех имплантов
    const installedModules = [];
    
    for (const [implantType, implant] of Object.entries(state.implants)) {
        if (!implant.parts) continue;
        
        for (const [partName, part] of Object.entries(implant.parts)) {
            if (!part || !part.modules) continue;
            
            for (const module of part.modules) {
                if (module) {
                    installedModules.push({
                        ...module,
                        implantType: implantType,
                        partName: partName,
                        implantName: getImplantName(implantType),
                        partDisplayName: getPartDisplayName(implantType, partName)
                    });
                }
            }
        }
    }
    
    if (installedModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Киберимпланты не установлены</p>';
        // Показываем кнопки управления
        const buttonContainer = container.parentElement.querySelector('div[style*="display: flex"]');
        if (buttonContainer) buttonContainer.style.display = 'flex';
        return;
    }
    
    // Скрываем кнопки управления когда есть установленные модули
    const buttonContainer = container.parentElement.querySelector('div[style*="display: flex"]');
    if (buttonContainer) buttonContainer.style.display = 'none';
    
    container.innerHTML = installedModules.map((module, index) => `
        <div class="implant-item" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
            <div class="implant-info">
                <div class="implant-name" style="color: ${getThemeColors().accent}; font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem;">${module.name}</div>
                <div class="implant-category" style="color: ${getThemeColors().success}; font-size: 0.9rem; margin-bottom: 0.5rem;">
                    📍 Место установки: ${module.implantName} → ${module.partDisplayName}
                </div>
                <div class="implant-details" style="color: ${getThemeColors().text}; font-size: 0.9rem; margin-bottom: 0.5rem;">
                    &#x26A0;&#xFE0F; Потеря осознанности: ${module.awarenessLoss}
                </div>
                <div class="implant-description" style="font-size: 0.9rem; color: ${getThemeColors().muted}; line-height: 1.4;">
                    ${module.description}
                </div>
            </div>
            <div class="implant-actions" style="margin-top: 1rem;">
                <button class="pill-button" onclick="showImplantsManagement()" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Управление</button>
            </div>
        </div>
    `).join('') + `
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
            <button class="pill-button primary-button" onclick="showImplantShop()" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить модуль</button>
            <button class="pill-button" onclick="showImplantPartsShop()" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить часть импланта</button>
            <button class="pill-button" onclick="showImplantsManagement()" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Управление имплантами</button>
        </div>
    `;
}

function showImplantShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6361-6133-4534-b338-616664333865/heart.png" alt="🦾" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин киберимплантов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleImplantModulesFreeMode()" id="implantModulesFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры по классификации -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${Object.keys(CYBERIMPLANTS_LIBRARY).map((category, idx) => `
                    <button class="pill-button implant-category-filter ${idx === 0 ? 'active' : ''}" onclick="filterImplantsByCategory('${category}')" data-category="${category}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        ${category}
                    </button>
                `).join('')}
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;" id="implantsShopContent">
                    <!-- Контент будет загружен через filterImplantsByCategory -->
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
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .implant-category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('implant-filter-styles')) {
        style.id = 'implant-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем первую категорию по умолчанию
    const firstCategory = Object.keys(CYBERIMPLANTS_LIBRARY)[0];
    filterImplantsByCategory(firstCategory);
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации имплантов по категории
function filterImplantsByCategory(category) {
    const container = document.getElementById('implantsShopContent');
    if (!container) return;
    
    document.querySelectorAll('.implant-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Проверяем, есть ли у игрока профессиональный навык "Глас народа"
    const hasJournalistSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && skill.name === 'Глас народа'
    );
    
    const implants = CYBERIMPLANTS_LIBRARY[category] || [];
    
    // Фильтруем импланты: показываем журналистские только если есть навык
    const availableImplants = implants.filter(implant => {
        if (implant.requiresProfSkill === 'Глас народа') {
            return hasJournalistSkill;
        }
        return true;
    });
    
    container.innerHTML = availableImplants.map(implant => {
        const isJournalistItem = implant.requiresProfSkill === 'Глас народа';
        
        return `
            <div class="shop-item" style="border: ${isJournalistItem ? '2px solid #5b9bff' : '1px solid var(--border)'};">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">
                        ${implant.name}${isJournalistItem ? ' <span style="color: #5b9bff; font-size: 0.75rem; font-weight: 600;">[Журналист]</span>' : ''}
                    </h4>
                </div>
                
                <p class="shop-item-description">
                    ${implant.description}
                </p>
                
                <div class="shop-item-stats">
                    <div class="shop-stat">Потеря осознанности: ${implant.awarenessLoss}</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="implant-module-price-display" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${implant.price}" data-awareness="${implant.awarenessLoss}">
                        ${implant.price} уе
                    </span>
                    <button class="pill-button primary-button implant-module-buy-button" onclick="buyAndInstallImplant('${category}', '${implant.name}', ${implant.price}, '${implant.awarenessLoss}', '${implant.description.replace(/'/g, "\\'")}')" data-category="${category}" data-name="${implant.name}" data-price="${implant.price}" data-awareness="${implant.awarenessLoss}" data-description="${implant.description.replace(/'/g, "\\'")}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterImplants(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const implantItems = document.querySelectorAll('.implant-item');
    const categorySections = document.querySelectorAll('.category-section');
    
    let visibleItems = 0;
    
    implantItems.forEach(item => {
        const name = item.dataset.name || '';
        const description = item.dataset.description || '';
        
        if (name.includes(searchLower) || description.includes(searchLower)) {
            item.style.display = 'block';
            visibleItems++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Скрываем категории без видимых элементов
    categorySections.forEach(section => {
        const visibleInSection = section.querySelectorAll('.implant-item[style*="block"], .implant-item:not([style*="none"])');
        if (visibleInSection.length === 0) {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
}

function buyAndInstallImplant(category, name, price, awarenessLoss, description, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Ха-ха, не так быстро, нищюк!</p>
                <button class="pill-button" onclick="closeModal(this)">
                    Закрыть
                </button>
            </div>
        `);
        return;
    }
    
    // Бросаем кубики для потери осознанности
    const lossRoll = rollDiceForAwarenessLoss(awarenessLoss);
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // НЕ теряем осознанность при покупке - только при установке
    // const currentAwareness = parseInt(state.awareness.current) || 50;
    // state.awareness.current = Math.max(0, currentAwareness - lossRoll);
    // const awarenessEl = document.getElementById('awarenessCurrent');
    // if (awarenessEl) awarenessEl.value = state.awareness.current;
    
    // Добавляем модуль в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: `${description} | Потеря осознанности: ${awarenessLoss}`,
        price: price,
        load: 1,
        type: 'implant',
        implantData: {
            category: category,
            name: name,
            price: price,
            awarenessLoss: awarenessLoss,
            description: description
        },
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Модуль импланта'
    });
    
    // НЕ закрываем магазин - оставляем его открытым
    // closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль куплен и готов к установке', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} куплен и добавлен в снаряжение!</p>
            <p style="color: ${getThemeColors().muted};">Осознанность будет потеряна при установке модуля</p>
            <p style="color: ${getThemeColors().muted};">Теперь установите его через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

function toggleImplantModulesFreeMode() {
    const buyButtons = document.querySelectorAll('.implant-module-buy-button');
    const priceDisplays = document.querySelectorAll('.implant-module-price-display');
    const toggleButton = document.getElementById('implantModulesFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        // Отключаем бесплатный режим
        buyButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const awareness = btn.getAttribute('data-awareness');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyAndInstallImplant('${category}', '${name}', ${price}, '${awareness}', '${description}')`);
        });
        
        // Возвращаем оригинальные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            display.textContent = `Цена: ${originalPrice} уе`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        // Включаем бесплатный режим
        buyButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            const name = btn.getAttribute('data-name');
            const awareness = btn.getAttribute('data-awareness');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyAndInstallImplant('${category}', '${name}', 0, '${awareness}', '${description}')`);
        });
        
        // Меняем цены визуально на 0
        priceDisplays.forEach(display => {
            display.textContent = `Цена: 0 уе`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

function renderImplants() {
    const container = document.getElementById('implantsContainer');
    if (!container) return;
    
    // Собираем все установленные модули из всех имплантов
    const installedModules = [];
    
    for (const [implantType, implant] of Object.entries(state.implants)) {
        for (const [partName, partData] of Object.entries(implant.parts)) {
            if (partData && partData.modules) {
                partData.modules.forEach((module, slotIndex) => {
                    if (module) {
                        const partDisplayName = getPartDisplayName(implantType, partName);
                        installedModules.push({
                            ...module,
                            location: `${getImplantTypeDisplayName(implantType)} → ${partDisplayName} → Слот ${slotIndex + 1}`
                        });
                    }
                });
            }
        }
    }
    
    if (installedModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Киберимпланты не установлены</p>';
        return;
    }
    
    container.innerHTML = installedModules.map((implant, index) => `
        <div class="implant-item" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().accentLight}; border-radius: 8px; margin-bottom: 0.5rem;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: ${getThemeColors().accent}; font-weight: 600;">${implant.name}</span>
                </div>
                <div style="color: white; font-weight: bold; font-size: 0.8rem; margin-top: 0.25rem;">${implant.location}</div>
                ${implant.description ? `<div style="color: ${getThemeColors().muted}; font-size: 0.8rem; margin-top: 0.25rem;">${implant.description}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function getImplantTypeDisplayName(implantType) {
    const typeNames = {
        'head': 'Кибер-голова',
        'arms': 'Кибер-рука',
        'legs': 'Кибер-нога',
        'spine': 'Кибер-спина',
        'organs': 'Кибер-внутренности',
        'neuromodule': 'Нейро-модуль'
    };
    return typeNames[implantType] || implantType;
}


function rollDiceForAwarenessLoss(awarenessLoss) {
    if (awarenessLoss === '0') return 0;
    
    const match = awarenessLoss.match(/(\d+)d(\d+)/);
    if (match) {
        const count = parseInt(match[1]);
        const sides = parseInt(match[2]);
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }
    
    return 0;
}


function giftImplant(category, name, price, awarenessLoss, description) {
    // Бросаем кубики для потери осознанности
    const lossRoll = rollDiceForAwarenessLoss(awarenessLoss);
    
    // Вычитаем из текущей осознанности
    const currentAwareness = parseInt(state.awareness.current) || 50;
    state.awareness.current = Math.max(0, currentAwareness - lossRoll);
    const awarenessEl = document.getElementById('awarenessCurrent');
    if (awarenessEl) awarenessEl.value = state.awareness.current;
    
    // Добавляем модуль в снаряжение
    const newGear = {
        name: name,
        description: `${description} | Потеря осознанности: ${awarenessLoss}`,
        price: price,
        load: 1,
        type: 'implant',
        implantData: {
            category: category,
            name: name,
            price: price,
            awarenessLoss: awarenessLoss,
            description: description
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль получен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлен в снаряжение!</p>
            <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: ${getThemeColors().muted};">Текущая осознанность: ${state.awareness.current}</p>
            <p style="color: ${getThemeColors().muted};">Теперь вы можете установить его через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

function addGiftedImplant() {
    // Показываем модал магазина, но без списания денег
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    let shopHTML = `
        <div class="modal" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>&#x1F381; Выберите подаренный имплант</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
    `;
    
    // Проходим по всем категориям
    for (const [category, implants] of Object.entries(CYBERIMPLANTS_LIBRARY)) {
        shopHTML += `
            <div class="category-section">
                <div class="category-title">${category}</div>
                <div style="display: grid; gap: 1rem;">
                    ${implants.map((implant) => `
                        <div class="implant-item">
                            <div class="implant-info">
                                <div class="implant-name">${implant.name}</div>
                                <div class="implant-details">
                                    Потеря осознанности: ${implant.awarenessLoss}
                                </div>
                                <div class="implant-description" style="font-size: 0.8rem; color: ${getThemeColors().muted}; margin-top: 0.25rem;">
                                    ${implant.description}
                                </div>
                            </div>
                            <div class="implant-actions">
                                <button class="pill-button success-button" onclick="installGiftedImplant('${category}', '${implant.name}', ${implant.price}, '${implant.awarenessLoss}', '${implant.description.replace(/'/g, "\\'")}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Установить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    shopHTML += `
            </div>
            <div class="modal-footer">
            </div>
        </div>
    `;
    
    modal.innerHTML = shopHTML;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function installGiftedImplant(category, name, price, awarenessLoss, description) {
    // Бросаем кубики для потери осознанности
    const lossRoll = rollDiceForAwarenessLoss(awarenessLoss);
    
    // Вычитаем из текущей осознанности
    const currentAwareness = parseInt(state.awareness.current) || 50;
    state.awareness.current = Math.max(0, currentAwareness - lossRoll);
    const awarenessEl = document.getElementById('awarenessCurrent');
    if (awarenessEl) awarenessEl.value = state.awareness.current;
    
    // Добавляем модуль в снаряжение
    const newGear = {
        name: name,
        description: `${description} | Потеря осознанности: ${awarenessLoss}`,
        price: price,
        load: 1,
        type: 'implant',
        implantData: {
            category: category,
            name: name,
            price: price,
            awarenessLoss: awarenessLoss,
            description: description
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль получен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлен в снаряжение!</p>
            <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: ${getThemeColors().muted};">Текущая осознанность: ${state.awareness.current}</p>
            <p style="color: ${getThemeColors().muted};">Теперь вы можете установить его через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

// Функция для управления имплантами (полная схема)
function showImplantsManagement() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    let managementHTML = `
        <div class="modal" style="max-width: 95vw; max-height: 95vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🦾 Управление имплантами</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; min-height: 600px;">
                    <!-- Левая панель: Схема тела -->
                    <div style="background: ${getThemeColors().bgLight}; border-radius: 12px; padding: 1rem; border: 1px solid var(--border);">
                        <h4 style="color: ${getThemeColors().accent}; text-align: center; margin-bottom: 1rem;">Схема тела</h4>
                        <div style="position: relative; height: 500px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 8px; border: 1px solid var(--border);">
                            <!-- ГОЛОВА -->
                            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: ${state.implants.head.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 50%; border: 2px solid ${state.implants.head.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.head.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.head.parts.main ? "selectImplant('head', 'main')" : 'showUnpurchasedError()'}" title="Кибер-голова">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.head.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.8rem; font-weight: bold;">ГОЛОВА</div>
                                ${!state.implants.head.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1.2rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- НЕЙРОМОДУЛЬ -->
                            <div style="position: absolute; top: 100px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; background: ${state.implants.neuromodule.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 50%; border: 2px solid ${state.implants.neuromodule.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.neuromodule.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.neuromodule.parts.main ? 'selectImplant(\'neuromodule\')' : 'showUnpurchasedError()'}" title="Нейромодуль">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.neuromodule.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.6rem; font-weight: bold;">НЕЙРО</div>
                                ${!state.implants.neuromodule.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- СПИНА - отдельные части -->
                            <div style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.cervical ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.cervical ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.cervical ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.cervical ? "selectImplant('spine', 'cervical')" : 'showUnpurchasedError()'}" title="Шейная">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.cervical ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">ШЕЙНАЯ</div>
                                ${!state.implants.spine.parts.cervical ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 170px; left: 30%; transform: translateX(-50%); width: 50px; height: 15px; background: ${state.implants.spine.parts.thoracicLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.thoracicLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.thoracicLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.thoracicLeft ? "selectImplant('spine', 'thoracicLeft')" : 'showUnpurchasedError()'}" title="Грудная левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.thoracicLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.25rem; font-weight: bold;">ГРУД Л</div>
                                ${!state.implants.spine.parts.thoracicLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 170px; right: 30%; transform: translateX(50%); width: 50px; height: 15px; background: ${state.implants.spine.parts.thoracicRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.thoracicRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.thoracicRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.thoracicRight ? "selectImplant('spine', 'thoracicRight')" : 'showUnpurchasedError()'}" title="Грудная правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.thoracicRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.25rem; font-weight: bold;">ГРУД П</div>
                                ${!state.implants.spine.parts.thoracicRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.lumbar ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.lumbar ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.lumbar ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.lumbar ? "selectImplant('spine', 'lumbar')" : 'showUnpurchasedError()'}" title="Поясничная">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.lumbar ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">ПОЯСНИЧ</div>
                                ${!state.implants.spine.parts.lumbar ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 210px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.sacral ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.sacral ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.sacral ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.sacral ? "selectImplant('spine', 'sacral')" : 'showUnpurchasedError()'}" title="Крестцовая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.sacral ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">КРЕСТЦОВ</div>
                                ${!state.implants.spine.parts.sacral ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ЛЕВАЯ РУКА - отдельные части -->
                            <div style="position: absolute; top: 160px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.wristLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.wristLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.wristLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.wristLeft ? "selectImplant('arms', 'wristLeft')" : 'showUnpurchasedError()'}" title="Кисть левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.wristLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">КИСТЬ</div>
                                ${!state.implants.arms.parts.wristLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.forearmLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.forearmLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.forearmLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.forearmLeft ? "selectImplant('arms', 'forearmLeft')" : 'showUnpurchasedError()'}" title="Предплечье левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.forearmLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.4rem; font-weight: bold;">ПРЕДПЛЕЧЬЕ</div>
                                ${!state.implants.arms.parts.forearmLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 220px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.shoulderLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.shoulderLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.shoulderLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.shoulderLeft ? "selectImplant('arms', 'shoulderLeft')" : 'showUnpurchasedError()'}" title="Плечо левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.shoulderLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ПЛЕЧО</div>
                                ${!state.implants.arms.parts.shoulderLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ПРАВАЯ РУКА - отдельные части -->
                            <div style="position: absolute; top: 160px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.wristRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.wristRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.wristRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.wristRight ? "selectImplant('arms', 'wristRight')" : 'showUnpurchasedError()'}" title="Кисть правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.wristRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">КИСТЬ</div>
                                ${!state.implants.arms.parts.wristRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.forearmRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.forearmRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.forearmRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.forearmRight ? "selectImplant('arms', 'forearmRight')" : 'showUnpurchasedError()'}" title="Предплечье правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.forearmRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.4rem; font-weight: bold;">ПРЕДПЛЕЧЬЕ</div>
                                ${!state.implants.arms.parts.forearmRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 220px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.shoulderRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.shoulderRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.shoulderRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.shoulderRight ? "selectImplant('arms', 'shoulderRight')" : 'showUnpurchasedError()'}" title="Плечо правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.shoulderRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ПЛЕЧО</div>
                                ${!state.implants.arms.parts.shoulderRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ВНУТРЕННОСТИ -->
                            <div style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: ${state.implants.organs.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 8px; border: 2px solid ${state.implants.organs.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.organs.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.organs.parts.main ? 'selectImplant(\'organs\')' : 'showUnpurchasedError()'}" title="Кибер-внутренности">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.organs.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.6rem; font-weight: bold;">ВНУТРЕННОСТИ</div>
                                ${!state.implants.organs.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ЛЕВАЯ НОГА - отдельные части -->
                            <div style="position: absolute; top: 380px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.footLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.footLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.footLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.footLeft ? "selectImplant('legs', 'footLeft')" : 'showUnpurchasedError()'}" title="Стопа левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.footLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">СТОПА</div>
                                ${!state.implants.legs.parts.footLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 410px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.shinLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.shinLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.shinLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.shinLeft ? "selectImplant('legs', 'shinLeft')" : 'showUnpurchasedError()'}" title="Голень левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.shinLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ГОЛЕНЬ</div>
                                ${!state.implants.legs.parts.shinLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 440px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.thighLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.thighLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.thighLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.thighLeft ? "selectImplant('legs', 'thighLeft')" : 'showUnpurchasedError()'}" title="Бедро левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.thighLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">БЕДРО</div>
                                ${!state.implants.legs.parts.thighLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ПРАВАЯ НОГА - отдельные части -->
                            <div style="position: absolute; top: 380px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.footRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.footRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.footRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.footRight ? "selectImplant('legs', 'footRight')" : 'showUnpurchasedError()'}" title="Стопа правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.footRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">СТОПА</div>
                                ${!state.implants.legs.parts.footRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 410px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.shinRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.shinRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.shinRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.shinRight ? "selectImplant('legs', 'shinRight')" : 'showUnpurchasedError()'}" title="Голень правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.shinRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ГОЛЕНЬ</div>
                                ${!state.implants.legs.parts.shinRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 440px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.thighRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.thighRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.thighRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.thighRight ? "selectImplant('legs', 'thighRight')" : 'showUnpurchasedError()'}" title="Бедро правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.thighRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">БЕДРО</div>
                                ${!state.implants.legs.parts.thighRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${getThemeColors().danger}; font-size: 1rem;">✖</div>' : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Правая панель: Детали импланта -->
                    <div style="background: ${getThemeColors().bgLight}; border-radius: 12px; padding: 1rem; border: 1px solid var(--border);">
                        <h4 style="color: ${getThemeColors().accent}; text-align: center; margin-bottom: 1rem;">Детали импланта</h4>
                        <div id="implantDetails">
                            <p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Выберите имплант на схеме тела</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
            </div>
        </div>
    `;
    
    modal.innerHTML = managementHTML;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

// Функция для выбора импланта
function selectImplant(implantType, partName = null) {
    const detailsContainer = document.getElementById('implantDetails');
    if (!detailsContainer) return;
    
    const implant = state.implants[implantType];
    if (!implant || !implant.installed) {
        detailsContainer.innerHTML = `
            <p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">
                Имплант не установлен. Купите части импланта в магазине.
            </p>
        `;
        return;
    }
    
    let detailsHTML = `
        <div style="margin-bottom: 1rem;">
            <h5 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">${getImplantName(implantType)}</h5>
            <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">${getImplantDescription(implantType)}</p>
        </div>
    `;
    
    // Если указана конкретная часть, показываем только её
    if (partName) {
        const partData = implant.parts[partName];
        if (!partData || !partData.slots) {
            detailsContainer.innerHTML = `
                <p style="color: ${getThemeColors().danger}; text-align: center; padding: 2rem;">
                    Эта часть импланта не куплена!
                </p>
            `;
            return;
        }
        
        const partDisplayName = getPartDisplayName(implantType, partName);
        detailsHTML += `
            <div style="background: ${getThemeColors().bgMedium}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                <h6 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">${partDisplayName}</h6>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    ${Array.from({length: partData.slots}, (_, i) => `
                        <div class="implant-slot" style="width: 40px; height: 40px; background: ${partData.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'rgba(182, 103, 255, 0.2)'}; border: 2px solid ${partData.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="manageSlot('${implantType}', '${partName}', ${i})">
                            ${partData.modules[i] ? '✓' : '○'}
                        </div>
                    `).join('')}
                </div>
                <p style="color: ${getThemeColors().muted}; font-size: 0.8rem;">Слотов: ${partData.modules.filter(m => m).length}/${partData.slots}</p>
                ${partData.modules.filter(m => m).length > 0 ? `
                    <div style="margin-top: 0.5rem;">
                        <h7 style="color: ${getThemeColors().success}; font-size: 0.8rem;">Установленные модули:</h7>
                        ${partData.modules.map((module, i) => module ? `
                            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; margin-top: 0.25rem;">
                                <div style="color: ${getThemeColors().success}; font-weight: bold; font-size: 0.8rem;">${module.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">${module.description}</div>
                            </div>
                        ` : '').join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else {
        // Показываем все части импланта
        for (const [partName, partData] of Object.entries(implant.parts)) {
            if (!partData || !partData.slots) continue; // Пропускаем не установленные части
            
            const partDisplayName = getPartDisplayName(implantType, partName);
            detailsHTML += `
                <div style="background: ${getThemeColors().bgMedium}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                    <h6 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">${partDisplayName}</h6>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${Array.from({length: partData.slots}, (_, i) => `
                            <div class="implant-slot" style="width: 40px; height: 40px; background: ${partData.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'rgba(182, 103, 255, 0.2)'}; border: 2px solid ${partData.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="manageSlot('${implantType}', '${partName}', ${i})">
                                ${partData.modules[i] ? '✓' : '○'}
                            </div>
                        `).join('')}
                    </div>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.8rem;">Слотов: ${partData.modules.filter(m => m).length}/${partData.slots}</p>
                    ${partData.modules.filter(m => m).length > 0 ? `
                        <div style="margin-top: 0.5rem;">
                            <h7 style="color: ${getThemeColors().success}; font-size: 0.8rem;">Установленные модули:</h7>
                            ${partData.modules.map((module, i) => module ? `
                                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; margin-top: 0.25rem;">
                                    <div style="color: ${getThemeColors().success}; font-weight: bold; font-size: 0.8rem;">${module.name}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">${module.description}</div>
                                </div>
                            ` : '').join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        }
    }
    
    detailsContainer.innerHTML = detailsHTML;
}

function showUnpurchasedError() {
    showModal('Часть не куплена', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">&#x274C; Эта часть импланта не куплена!</p>
            <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Купите её в магазине частей имплантов.</p>
        </div>
    `);
}

// Вспомогательные функции для имплантов
function getImplantName(type) {
    const names = {
        head: 'Кибер-голова',
        arms: 'Кибер-руки', 
        legs: 'Кибер-ноги',
        spine: 'Кибер-спина',
        organs: 'Кибер-внутренности',
        neuromodule: 'Нейромодуль'
    };
    return names[type] || type;
}

function getImplantDescription(type) {
    const descriptions = {
        head: 'Замена головы с сохранением мозга, слуха и зрения',
        arms: 'Замена рук с независимыми частями',
        legs: 'Замена ног с независимыми частями', 
        spine: 'Замена мышечного каркаса спины и тела',
        organs: 'Замена или дублирование внутренних органов',
        neuromodule: 'Нейросеть для передачи информации в мозг'
    };
    return descriptions[type] || '';
}

function getPartDisplayName(implantType, partName) {
    const partNames = {
        head: { 
            main: 'Полная замена головы'
        },
        arms: { 
            wristLeft: 'Кисть левая', 
            wristRight: 'Кисть правая',
            forearmLeft: 'Предплечье левое', 
            forearmRight: 'Предплечье правое',
            shoulderLeft: 'Плечо левое', 
            shoulderRight: 'Плечо правое'
        },
        legs: { 
            footLeft: 'Стопа левая', 
            footRight: 'Стопа правая',
            shinLeft: 'Голень левая', 
            shinRight: 'Голень правая',
            thighLeft: 'Бедро левое', 
            thighRight: 'Бедро правое'
        },
        spine: { cervical: 'Шейная', thoracicLeft: 'Грудная левая', thoracicRight: 'Грудная правая', lumbar: 'Поясничная', sacral: 'Крестцовая' },
        organs: { main: 'Внутренние органы' },
        neuromodule: { main: 'Нейронная сеть' }
    };
    return partNames[implantType]?.[partName] || partName;
}

function manageSlot(implantType, partName, slotIndex) {
    // Показываем модал для управления слотом
    showSlotManagement(implantType, partName, slotIndex);
}

function showSlotManagement(implantType, partName, slotIndex) {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    const implant = state.implants[implantType];
    const part = implant.parts[partName];
    
    // Проверяем, куплена ли эта конкретная часть
    if (!part || !part.slots) {
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>Ошибка</h3>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
                <div class="modal-body">
                    <p style="color: ${getThemeColors().danger}; text-align: center; padding: 2rem;">
                        Эта часть импланта не куплена!<br>
                        Купите "${getPartDisplayName(implantType, partName)}" в магазине частей имплантов.
                    </p>
                </div>
                <div class="modal-footer">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        return;
    }
    
    const currentModule = part.modules[slotIndex];
    
    let slotHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Управление слотом</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">
                    ${getImplantName(implantType)} → ${getPartDisplayName(implantType, partName)} → Слот ${slotIndex + 1}
                </p>
    `;
    
    if (currentModule) {
        slotHTML += `
            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: ${getThemeColors().success}; margin-bottom: 0.5rem;">Установленный модуль:</h5>
                <p style="color: ${getThemeColors().text}; font-weight: 600;">${currentModule.name}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">${currentModule.description}</p>
                <button class="pill-button danger-button" onclick="removeModuleFromSlot('${implantType}', '${partName}', ${slotIndex}); updateImplantManagementModal();" style="margin-top: 0.5rem;">Удалить модуль</button>
            </div>
        `;
    } else {
        slotHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">Свободный слот</h5>
                <div class="drop-zone" data-implant-type="${implantType}" data-part-name="${partName}" data-slot-index="${slotIndex}" style="background: rgba(125, 244, 198, 0.1); border: 2px dashed var(--success); border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 1rem; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                    <p style="color: ${getThemeColors().success}; font-weight: 600; margin: 0;">Перетащите модуль сюда</p>
                </div>
                <p style="color: ${getThemeColors().muted};">Или выберите модуль для установки:</p>
                <div id="availableModules" style="max-height: 300px; overflow-y: auto;">
                    <!-- Модули из снаряжения будут загружены здесь -->
                </div>
            </div>
        `;
    }
    
    slotHTML += `
            </div>
            <div class="modal-footer">
            </div>
        </div>
    `;
    
    modal.innerHTML = slotHTML;
    document.body.appendChild(modal);
    
    // Загружаем доступные модули
    loadAvailableModules(implantType, partName, slotIndex);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function loadAvailableModules(implantType, partName, slotIndex) {
    const container = document.getElementById('availableModules');
    if (!container) return;
    
    // Ищем модули в снаряжении
    const availableModules = state.gear.filter(item => item.type === 'implant');
    
    if (availableModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Нет доступных модулей в снаряжении</p>';
        return;
    }
    
    container.innerHTML = availableModules.map((module, index) => `
        <div class="draggable-module" draggable="true" data-module-index="${state.gear.findIndex(item => item === module)}" style="background: ${getThemeColors().bgMedium}; border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; cursor: grab;">
            <div style="color: ${getThemeColors().text}; font-weight: 600;">${module.implantData.name}</div>
            <div style="color: ${getThemeColors().muted}; font-size: 0.8rem;">${module.implantData.description}</div>
            <div style="margin-top: 0.5rem;">
                <button class="pill-button success-button" onclick="installModuleInSlot('${implantType}', '${partName}', ${slotIndex}, ${state.gear.findIndex(item => item === module)});" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                    Установить
                </button>
            </div>
        </div>
    `).join('');
    
    // Добавляем обработчики drag & drop
    addDragAndDropHandlers(implantType, partName, slotIndex);
}

function addDragAndDropHandlers(implantType, partName, slotIndex) {
    // Обработчики для перетаскиваемых модулей
    const draggableModules = document.querySelectorAll('.draggable-module');
    draggableModules.forEach(module => {
        module.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', module.dataset.moduleIndex);
            module.style.opacity = '0.5';
        });
        
        module.addEventListener('dragend', (e) => {
            module.style.opacity = '1';
        });
    });
    
    // Обработчики для drop zone
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.background = 'rgba(125, 244, 198, 0.3)';
            dropZone.style.borderColor = 'var(--success)';
        });
        
        dropZone.addEventListener('dragleave', (e) => {
            dropZone.style.background = 'rgba(125, 244, 198, 0.1)';
            dropZone.style.borderColor = 'var(--success)';
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.style.background = 'rgba(125, 244, 198, 0.1)';
            dropZone.style.borderColor = 'var(--success)';
            
            const moduleIndex = e.dataTransfer.getData('text/plain');
            if (moduleIndex) {
                installModuleInSlot(implantType, partName, slotIndex, parseInt(moduleIndex));
                // Обновляем содержимое модального окна вместо закрытия
                updateImplantManagementModal();
            }
        });
    }
}

function installModuleInSlot(implantType, partName, slotIndex, gearIndex) {
    const module = state.gear[gearIndex];
    if (!module) return;
    
    // Проверяем, нужно ли терять осознанность (исключаем очки с оптическими слотами)
    const isOpticalGlasses = module.name && module.name.includes('ОЧКИ С ОПТИЧЕСКИМИ СЛОТАМИ');
    let lossRoll = 0;
    
    if (!isOpticalGlasses && module.implantData && module.implantData.awarenessLoss) {
        // Бросаем кубики для потери осознанности
        lossRoll = rollDiceForAwarenessLoss(module.implantData.awarenessLoss);
        
        // Вычитаем из текущей осознанности
        const currentAwareness = parseInt(state.awareness.current) || 50;
        state.awareness.current = Math.max(0, currentAwareness - lossRoll);
        const awarenessEl = document.getElementById('awarenessCurrent');
        if (awarenessEl) awarenessEl.value = state.awareness.current;
    }
    
    // Устанавливаем модуль в слот
    state.implants[implantType].parts[partName].modules[slotIndex] = module.implantData;
    
    // Удаляем модуль из снаряжения
    state.gear.splice(gearIndex, 1);
    
    // Обновляем отображение
    renderGear();
    renderImplants();
    scheduleSave();
    
    // Обновляем слот в DOM
    const slotElement = document.querySelector(`[data-implant-type="${implantType}"][data-part-name="${partName}"][data-slot-index="${slotIndex}"]`);
    if (slotElement) {
        slotElement.style.background = 'rgba(125, 244, 198, 0.3)';
        slotElement.style.borderColor = 'var(--success)';
        slotElement.innerHTML = '✓';
    }
    
    // Обновляем блок "Детали импланта" в модале управления
    selectImplant(implantType, partName);
    
    // Показываем сообщение с потерей осознанности (если была)
    const awarenessMessage = lossRoll > 0 ? `<p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>` : '';
    showModal('Модуль установлен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${module.implantData.name} установлен в слот!</p>
            ${awarenessMessage}
        </div>
    `);
}

function removeModuleFromSlot(implantType, partName, slotIndex) {
    const module = state.implants[implantType].parts[partName].modules[slotIndex];
    if (!module) return;
    
    // Возвращаем модуль в снаряжение
    state.gear.push({
        name: module.name,
        description: `${module.description} | Потеря осознанности: ${module.awarenessLoss}`,
        price: module.price,
        load: 1,
        type: 'implant',
        implantData: module
    });
    
    // Удаляем модуль из слота
    state.implants[implantType].parts[partName].modules[slotIndex] = null;
    
    // Обновляем отображение
    renderGear();
    renderImplants();
    scheduleSave();
    
    // Обновляем блок "Детали импланта" в модале управления
    selectImplant(implantType, partName);
    
    showModal('Модуль удален', `&#x2705; ${module.name} возвращен в снаряжение!`);
}

// Магазин частей имплантов
function showImplantPartsShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    const implantParts = [
        {
            category: 'head',
            name: 'Кибер-Голова',
            description: 'Сложнейшая операция заменяет на имплант голову, сохраняя мозг, слуховой и зрительный каналы. Имеет 4 слота для зрения, 4 для слуха и 2 для лица.',
            price: 1000,
            awarenessLoss: '2d6',
            parts: [
                { name: 'main', displayName: 'Полная замена головы', slots: 10 }
            ]
        },
        {
            category: 'arms',
            name: 'Кибер-Рука',
            description: 'Замена человеческой руки. Состоит из 3х частей: кисть, предплечье и плечо, каждое можно устанавливать отдельно.',
            price: 100,
            awarenessLoss: '1d6',
            parts: [
                { name: 'wristLeft', displayName: 'Кисть левая', slots: 2 },
                { name: 'wristRight', displayName: 'Кисть правая', slots: 2 },
                { name: 'forearmLeft', displayName: 'Предплечье левое', slots: 2 },
                { name: 'forearmRight', displayName: 'Предплечье правое', slots: 2 },
                { name: 'shoulderLeft', displayName: 'Плечо левое', slots: 2 },
                { name: 'shoulderRight', displayName: 'Плечо правое', slots: 2 }
            ]
        },
        {
            category: 'legs',
            name: 'Кибер-Нога',
            description: 'Замена человеческой ноги. Состоит из 3х частей: стопа, голень и бедро, каждое можно устанавливать отдельно.',
            price: 100,
            awarenessLoss: '1d6',
            parts: [
                { name: 'footLeft', displayName: 'Стопа левая', slots: 2 },
                { name: 'footRight', displayName: 'Стопа правая', slots: 2 },
                { name: 'shinLeft', displayName: 'Голень левая', slots: 2 },
                { name: 'shinRight', displayName: 'Голень правая', slots: 2 },
                { name: 'thighLeft', displayName: 'Бедро левое', slots: 2 },
                { name: 'thighRight', displayName: 'Бедро правое', slots: 2 }
            ]
        },
        {
            category: 'spine',
            name: 'Кибер-Спина',
            description: 'Имплант, заменяющий мышечный каркас спины и тела. Состоит из 5 частей: шейная, грудная левая и правая, поясничная, крестцовая.',
            price: 500,
            awarenessLoss: '1d6',
            parts: [
                { name: 'cervical', displayName: 'Шейная', slots: 3 },
                { name: 'thoracicLeft', displayName: 'Грудная левая', slots: 3 },
                { name: 'thoracicRight', displayName: 'Грудная правая', slots: 3 },
                { name: 'lumbar', displayName: 'Поясничная', slots: 3 },
                { name: 'sacral', displayName: 'Крестцовая', slots: 3 }
            ]
        },
        {
            category: 'organs',
            name: 'Кибер-Внутренности',
            description: 'Имплант, замещающий внутренние органы, или дублирующий их. Возможно заменить вообще все органы кибернетическими.',
            price: 1000,
            awarenessLoss: '4d6',
            parts: [{ name: 'main', displayName: 'Внутренние органы', slots: 2 }]
        },
        {
            category: 'neuromodule',
            name: 'Нейро-модуль',
            description: 'Модуль нейронной сети, находящийся в шее на сочленении спинного и головного мозга. Позволяет передавать в мозг информацию.',
            price: 500,
            awarenessLoss: '1d6',
            parts: [{ name: 'main', displayName: 'Нейронная сеть', slots: 7 }]
        }
    ];
    
    let shopHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>🦾 Магазин частей имплантов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleImplantPartsFreeMode()" id="implantPartsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1.5rem;">
                    Выберите часть импланта для покупки. Каждая часть может быть установлена отдельно.
                </p>
                <div style="display: grid; gap: 1rem;">
    `;
    
    implantParts.forEach(implant => {
        shopHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 12px; padding: 1rem;">
                <h4 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">${implant.name}</h4>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">${implant.description}</p>
                <div style="display: grid; gap: 0.5rem;">
        `;
        
        implant.parts.forEach(part => {
            const partData = state.implants[implant.category].parts[part.name];
            const isPurchased = partData !== null && partData !== undefined;
            const purchasedText = isPurchased ? ' (куплена)' : '';
            
            shopHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                    <div>
                        <strong>${part.displayName}${purchasedText}</strong>
                        <div class="implant-part-price-display" style="color: ${getThemeColors().muted}; font-size: 0.8rem;" data-original-price="${implant.price}" data-slots="${part.slots}" data-awareness="${implant.awarenessLoss}">
                            ${part.slots} слотов | Цена: ${implant.price} уе | ПО: ${implant.awarenessLoss}
                        </div>
                    </div>
                    ${isPurchased ? 
                        `<div style="display: flex; gap: 0.5rem;">
                            <button class="pill-button" disabled style="font-size: 0.8rem; padding: 0.3rem 0.6rem; opacity: 0.6; cursor: not-allowed;">Куплено</button>
                            <button class="pill-button danger-button" onclick="removeImplantPart('${implant.category}', '${part.name}', '${implant.name}', '${part.displayName}', ${implant.price}, '${implant.awarenessLoss}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Удалить</button>
                        </div>` :
                        `<button class="pill-button primary-button implant-part-buy-button" onclick="buyImplantPart('${implant.category}', '${part.name}', '${implant.name}', '${part.displayName}', ${implant.price}, '${implant.awarenessLoss}', '${implant.description.replace(/'/g, "\\'")}', ${part.slots})" data-category="${implant.category}" data-part-name="${part.name}" data-implant-name="${implant.name}" data-display-name="${part.displayName}" data-price="${implant.price}" data-awareness-loss="${implant.awarenessLoss}" data-description="${implant.description.replace(/'/g, "\\'")}" data-slots="${part.slots}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>`
                    }
                </div>
            `;
        });
        
        shopHTML += `
                </div>
            </div>
        `;
    });
    
    shopHTML += `
                </div>
            </div>
            <div class="modal-footer">
            </div>
        </div>
    `;
    
    modal.innerHTML = shopHTML;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function buyImplantPart(category, partName, implantName, partDisplayName, price, awarenessLoss, description, slots, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Ха-ха, не так быстро, нищюк!</p>
                <button class="pill-button" onclick="closeModal(this)">
                    Закрыть
                </button>
            </div>
        `);
        return;
    }
    
    // Бросаем кубики для потери осознанности
    const lossRoll = rollDiceForAwarenessLoss(awarenessLoss);
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Вычитаем из текущей осознанности
    let currentAwareness;
    if (typeof state.awareness === 'object') {
        currentAwareness = parseInt(state.awareness.current) || 50;
        state.awareness.current = Math.max(0, currentAwareness - lossRoll);
    } else {
        // Для старых сохранений где awareness - число
        currentAwareness = parseInt(state.awareness) || 50;
        state.awareness = {
            current: Math.max(0, currentAwareness - lossRoll),
            max: parseInt(state.stats.INT || 5) * 10
        };
    }
    
    const awarenessEl = document.getElementById('awarenessCurrent');
    if (awarenessEl) awarenessEl.value = state.awareness.current;
    
    // Устанавливаем часть импланта
    state.implants[category].installed = true;
    state.implants[category].parts[partName] = {
        slots: slots,
        modules: new Array(slots).fill(null),
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: `${implantName} - ${partDisplayName}`,
        price: price,
        category: 'Киберимпланты'
    });
    
    // НЕ закрываем магазин - оставляем его открытым
    // closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Часть импланта установлена', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${partDisplayName} установлена!</p>
            <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: ${getThemeColors().muted};">Текущая осознанность: ${typeof state.awareness === 'object' ? state.awareness.current : state.awareness}</p>
            <p style="color: ${getThemeColors().muted};">Теперь вы можете установить модули через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

function removeImplantPart(category, partName, implantName, partDisplayName, price, awarenessLoss) {
    const partData = state.implants[category].parts[partName];
    
    // Проверяем, есть ли установленные модули
    if (partData && partData.modules && partData.modules.some(m => m !== null)) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">❌ Невозможно удалить!</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">В этой части импланта установлены модули. Сначала удалите все модули.</p>
            </div>
        `);
        return;
    }
    
    // Подтверждение удаления
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>⚠️ Подтверждение удаления</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    Вы уверены, что хотите удалить <strong style="color: ${getThemeColors().accent};">${partDisplayName}</strong>?
                </p>
                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().success}; font-weight: 600; margin-bottom: 0.5rem;">Вы получите обратно:</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem;"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Деньги: ${price} уе</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">🧠 Осознанность: ${awarenessLoss} (будет брошен кубик)</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button danger-button" onclick="confirmRemoveImplantPart('${category}', '${partName}', '${partDisplayName}', ${price}, '${awarenessLoss}')">Удалить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function confirmRemoveImplantPart(category, partName, partDisplayName, price, awarenessLoss) {
    // Бросаем кубики для возврата осознанности
    const awarenessReturn = rollDiceForAwarenessLoss(awarenessLoss);
    
    // Возвращаем деньги
    state.money = (parseInt(state.money) || 0) + price;
    updateMoneyDisplay();
    
    // Возвращаем осознанность
    let currentAwareness;
    if (typeof state.awareness === 'object') {
        currentAwareness = parseInt(state.awareness.current) || 50;
        const maxAwareness = parseInt(state.awareness.max) || 50;
        state.awareness.current = Math.min(maxAwareness, currentAwareness + awarenessReturn);
    } else {
        currentAwareness = parseInt(state.awareness) || 50;
        const maxAwareness = parseInt(state.stats.INT || 5) * 10;
        state.awareness = {
            current: Math.min(maxAwareness, currentAwareness + awarenessReturn),
            max: maxAwareness
        };
    }
    
    const awarenessEl = document.getElementById('awarenessCurrent');
    if (awarenessEl) awarenessEl.value = state.awareness.current;
    
    // Удаляем часть импланта
    delete state.implants[category].parts[partName];
    
    // Проверяем, остались ли еще части
    const remainingParts = Object.keys(state.implants[category].parts || {}).length;
    if (remainingParts === 0) {
        state.implants[category].installed = false;
    }
    
    scheduleSave();
    
    // Закрываем все модалы
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => modal.remove());
    
    showModal('Часть импланта удалена', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">✅ ${partDisplayName} удалена!</p>
            <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Возвращено денег: ${price} уе</p>
            <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">🧠 Восстановлено осознанности: ${awarenessReturn}</p>
            <p style="color: ${getThemeColors().muted};">Текущая осознанность: ${typeof state.awareness === 'object' ? state.awareness.current : state.awareness}</p>
        </div>
    `);
}

function toggleImplantPartsFreeMode() {
    const buyButtons = document.querySelectorAll('.implant-part-buy-button');
    const priceDisplays = document.querySelectorAll('.implant-part-price-display');
    const toggleButton = document.getElementById('implantPartsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            const partName = btn.getAttribute('data-part-name');
            const implantName = btn.getAttribute('data-implant-name');
            const displayName = btn.getAttribute('data-display-name');
            const price = btn.getAttribute('data-price');
            const awarenessLoss = btn.getAttribute('data-awareness-loss');
            const description = btn.getAttribute('data-description');
            const slots = btn.getAttribute('data-slots');
            btn.setAttribute('onclick', `buyImplantPart('${category}', '${partName}', '${implantName}', '${displayName}', ${price}, '${awarenessLoss}', '${description}', ${slots})`);
        });
        
        // Возвращаем обычные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            const slots = display.getAttribute('data-slots');
            const awareness = display.getAttribute('data-awareness');
            display.textContent = `${slots} слотов | Цена: ${originalPrice} уе | ПО: ${awareness}`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const category = btn.getAttribute('data-category');
            const partName = btn.getAttribute('data-part-name');
            const implantName = btn.getAttribute('data-implant-name');
            const displayName = btn.getAttribute('data-display-name');
            const awarenessLoss = btn.getAttribute('data-awareness-loss');
            const description = btn.getAttribute('data-description');
            const slots = btn.getAttribute('data-slots');
            btn.setAttribute('onclick', `buyImplantPart('${category}', '${partName}', '${implantName}', '${displayName}', 0, '${awarenessLoss}', '${description}', ${slots})`);
        });
        
        // Меняем цены визуально на 0
        priceDisplays.forEach(display => {
            const slots = display.getAttribute('data-slots');
            const awareness = display.getAttribute('data-awareness');
            display.textContent = `${slots} слотов | Цена: 0 уе | ПО: ${awareness}`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

// Функции для работы с оружием удалены - используется версия ниже

// Функции для работы с собственностью

// Функции для работы с жильем
function renderHousing() {
    const container = document.getElementById('housingContainer');
    if (!container) return;
    
    if (state.property.housing.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Жилье не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.property.housing.map((housing, index) => `
        <div class="property-item" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div class="property-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div class="property-name" style="cursor: pointer; color: ${getThemeColors().accent}; font-weight: 600; font-size: 1rem;" onclick="toggleHousingDescription(${index})" title="Кликните, чтобы свернуть/развернуть описание">${housing.name}</div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="renameHousing(${index})" title="Переименовать жилье" style="background: none; border: none; cursor: pointer; padding: 0;">
                        <img src="https://static.tildacdn.com/tild3539-3065-4366-b139-656331356537/write.png" style="width: 16px; height: 16px;">
                    </button>
                    ${housing.rentPrice > 0 && !housing.isOwned ? `
                        <button onclick="payHousingRent(${index})" title="Оплатить аренду (${housing.rentPrice.toLocaleString()} уе)" style="background: none; border: none; cursor: pointer; padding: 0;">
                            <img src="https://static.tildacdn.com/tild6363-3833-4263-a639-623835363566/money_1.png" style="width: 16px; height: 16px;">
                        </button>
                    ` : ''}
                    <button onclick="evictFromHousing(${index})" title="Выселиться из жилья" style="background: none; border: none; cursor: pointer; padding: 0;">
                        <img src="https://static.tildacdn.com/tild6365-3138-4434-b034-343265643662/exit.png" style="width: 16px; height: 16px;">
                    </button>
                </div>
            </div>
            <div id="housing-description-${index}" class="property-description" style="display: ${getCollapsedDisplayStyle('housing', index)}; color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0.5rem 0; line-height: 1.4;">${housing.description || 'Без описания'}</div>
            <div class="property-details">
                <div class="property-detail">
                    <span class="detail-label">Площадь:</span>
                    <span class="detail-value">${housing.area}</span>
                </div>
                <div class="property-detail">
                    <span class="detail-label">Тип:</span>
                    <span class="detail-value">${housing.type === 'apartment' ? 'Апартаменты' : housing.type === 'owned' ? 'Собственная квартира' : housing.type === 'penthouse' ? 'Пентхаус' : housing.type === 'house' ? 'Частный дом' : 'Неизвестно'}</span>
                </div>
                ${housing.isOwned ? `
                <div class="property-detail">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value" style="color: ${housing.isOwned ? 'var(--success)' : '#3b82f6'};">${housing.isOwned ? 'В собственности' : 'В аренде'}</span>
                </div>
                    ${housing.purchasePrice > 0 ? `
                        <div class="property-detail">
                            <span class="detail-label">Цена покупки:</span>
                            <span class="detail-value">${housing.purchasePrice.toLocaleString()} уе</span>
                        </div>
                    ` : ''}
                ` : `
                    <div class="property-detail">
                        <span class="detail-label">Статус:</span>
                        <span class="detail-value" style="color: #3b82f6;">Аренда</span>
                    </div>
                    <div class="property-detail">
                        <span class="detail-label">Аренда:</span>
                        <span class="detail-value">${housing.rentPrice.toLocaleString()} уе/мес</span>
                    </div>
                `}
            </div>
        </div>
    `).join('');
}

// Функция для сворачивания/разворачивания описания жилья
function toggleHousingDescription(index) {
    const descriptionElement = document.getElementById(`housing-description-${index}`);
    if (descriptionElement) {
        const isCollapsed = toggleCollapsedItem('housing', index);
        descriptionElement.style.display = isCollapsed ? 'none' : 'block';
    }
}

// Функция выселения из жилья
function evictFromHousing(index) {
    if (!state.property || !state.property.housing || index >= state.property.housing.length) {
        showToast('Ошибка: жилье не найдено', 3000);
        return;
    }
    
    const housing = state.property.housing[index];
    const housingName = housing.name;
    
    // Удаляем жилье из списка
    state.property.housing.splice(index, 1);
    
    // Обновляем состояние сворачивания
    updateCollapsedItemsAfterRemoval('housing', index);
    
    // Обновляем UI
    renderHousing();
    updateUIFromState();
    scheduleSave();
    
    showToast(`Выселились из "${housingName}"`, 3000);
    console.log(`[EVICT] Выселились из жилья: ${housingName}`);
}

// Функция оплаты аренды жилья
function payHousingRent(index) {
    if (!state.property || !state.property.housing || index >= state.property.housing.length) {
        showToast('Ошибка: жилье не найдено', 3000);
        return;
    }
    
    const housing = state.property.housing[index];
    
    if (housing.isOwned) {
        showToast('Это жилье в собственности, аренда не требуется', 3000);
        return;
    }
    
    const rentAmount = housing.rentPrice;
    
    if (state.money < rentAmount) {
        showToast(`Недостаточно денег для оплаты аренды. Нужно: ${rentAmount.toLocaleString()} уе`, 3000);
        return;
    }
    
    // Списываем деньги за аренду
    state.money -= rentAmount;
    
    // Обновляем UI
    updateMoneyDisplay();
    scheduleSave();
    
    showToast(`Оплатили аренду "${housing.name}" на сумму ${rentAmount.toLocaleString()} уе`, 3000);
    addToRollLog('rent_payment', { item: housing.name, price: rentAmount, category: 'Жилье (аренда)' });
    console.log(`[RENT] Оплатили аренду жилья: ${housing.name}, сумма: ${rentAmount} уе`);
}

// Функции для работы с коммерческой недвижимостью
function renderCommercialProperty() {
    const container = document.getElementById('commercialPropertyContainer');
    if (!container) return;
    
    if (state.property.commercialProperty.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Коммерческая недвижимость не добавлена</p>';
        return;
    }
    
    container.innerHTML = state.property.commercialProperty.map((property, index) => `
        <div class="property-item" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div class="property-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div class="property-name" onclick="toggleCommercialPropertyDescription(${index})" style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 1rem; cursor: pointer; user-select: none;">${property.name}</div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="renameCommercialProperty(${index})" title="Переименовать коммерческую недвижимость" style="background: none; border: none; cursor: pointer; padding: 0;">
                        <img src="https://static.tildacdn.com/tild3539-3065-4366-b139-656331356537/write.png" style="width: 16px; height: 16px;">
                    </button>
                    <button onclick="payCommercialPropertyRent(${index})" title="Оплатить аренду (${property.rentPrice.toLocaleString()} уе)" style="background: none; border: none; cursor: pointer; padding: 0;">
                        <img src="https://static.tildacdn.com/tild6363-3833-4263-a639-623835363566/money_1.png" style="width: 16px; height: 16px;">
                    </button>
                    <button onclick="evictFromCommercialProperty(${index})" title="Выселиться из коммерческой недвижимости" style="background: none; border: none; cursor: pointer; padding: 0;">
                        <img src="https://static.tildacdn.com/tild6365-3138-4434-b034-343265643662/exit.png" style="width: 16px; height: 16px;">
                    </button>
                </div>
            </div>
            <div class="commercial-property-content" id="commercial-property-content-${index}" style="display: ${getCollapsedDisplayStyle('commercialProperty', index)};">
                ${property.description ? `<div class="property-description">${property.description}</div>` : ''}
                <div class="property-details">
                <div class="property-detail">
                    <span class="detail-label">Площадь:</span>
                    <span class="detail-value">${property.area}</span>
                </div>
                <div class="property-detail">
                    <span class="detail-label">Аренда:</span>
                    <span class="detail-value">${property.rentPrice.toLocaleString()} уе/сутки</span>
                </div>
                <div class="property-detail">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value" style="color: #3b82f6;">Аренда</span>
                </div>
                <div class="property-detail" style="margin-top: 0.5rem;">
                    <button class="pill-button success-button" onclick="payCommercialPropertyRent(${index})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                        Оплатить аренду (${property.rentPrice.toLocaleString()} уе)
                    </button>
                </div>
            </div>
            </div>
        </div>
    `).join('');
}

// Функция сворачивания описания коммерческой недвижимости
function toggleCommercialPropertyDescription(index) {
    const content = document.getElementById(`commercial-property-content-${index}`);
    if (content) {
        const isCollapsed = toggleCollapsedItem('commercialProperty', index);
        content.style.display = isCollapsed ? 'none' : 'block';
    }
}

// Функция оплаты аренды коммерческой недвижимости
function payCommercialPropertyRent(index) {
    if (!state.property || !state.property.commercialProperty || index >= state.property.commercialProperty.length) {
        showToast('Ошибка: коммерческая недвижимость не найдена', 3000);
        return;
    }
    
    const property = state.property.commercialProperty[index];
    const rentAmount = property.rentPrice;
    
    if (state.money < rentAmount) {
        showToast(`Недостаточно денег для оплаты аренды. Нужно: ${rentAmount.toLocaleString()} уе`, 3000);
        return;
    }
    
    // Списываем деньги за аренду
    state.money -= rentAmount;
    
    // Обновляем UI
    updateMoneyDisplay();
    scheduleSave();
    
    showToast(`Оплатили аренду "${property.name}" на сумму ${rentAmount.toLocaleString()} уе`, 3000);
    addToRollLog('rent_payment', { item: property.name, price: rentAmount, category: 'Коммерческая недвижимость (аренда)' });
    console.log(`[RENT] Оплатили аренду коммерческой недвижимости: ${property.name}, сумма: ${rentAmount} уе`);
}

// Функция выселения из коммерческой недвижимости
function evictFromCommercialProperty(index) {
    if (!state.property || !state.property.commercialProperty || index >= state.property.commercialProperty.length) {
        showToast('Ошибка: коммерческая недвижимость не найдена', 3000);
        return;
    }
    
    const property = state.property.commercialProperty[index];
    const propertyName = property.name;
    
    // Удаляем коммерческую недвижимость из списка
    state.property.commercialProperty.splice(index, 1);
    
    // Обновляем состояние сворачивания
    updateCollapsedItemsAfterRemoval('commercialProperty', index);
    
    // Обновляем UI
    renderCommercialProperty();
    updateUIFromState();
    scheduleSave();
    
    showToast(`Выселились из "${propertyName}"`, 3000);
    console.log(`[EVICT] Выселились из коммерческой недвижимости: ${propertyName}`);
}

// Функция переименования жилья
function renameHousing(index) {
    if (!state.property || !state.property.housing || index >= state.property.housing.length) {
        showToast('Ошибка: жилье не найдено', 3000);
        return;
    }
    
    const housing = state.property.housing[index];
    
    showModal('Переименовать жилье', `
        <div style="padding: 1rem;">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.5rem;">Новое название:</label>
                <input type="text" id="newHousingName" value="${housing.name}" style="width: 100%; padding: 0.5rem; background: ${getThemeColors().bgMedium}; border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text};">
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="pill-button" onclick="closeModal(this)" style="background: var(--danger);">Отмена</button>
                <button class="pill-button success-button" onclick="saveHousingRename(${index})">Сохранить</button>
            </div>
        </div>
    `);
}

// Функция сохранения переименования жилья
function saveHousingRename(index) {
    const newName = document.getElementById('newHousingName').value.trim();
    
    if (!newName) {
        showToast('Название не может быть пустым', 'error');
        return;
    }
    
    if (!state.property || !state.property.housing || index >= state.property.housing.length) {
        showToast('Ошибка: жилье не найдено', 3000);
        return;
    }
    
    const oldName = state.property.housing[index].name;
    state.property.housing[index].name = newName;
    
    // Обновляем UI
    renderHousing();
    scheduleSave();
    
    // Закрываем модальное окно
    closeModal();
    
    showToast(`Жилье переименовано с "${oldName}" на "${newName}"`, 'success');
}

// Функция переименования коммерческой недвижимости
function renameCommercialProperty(index) {
    if (!state.property || !state.property.commercialProperty || index >= state.property.commercialProperty.length) {
        showToast('Ошибка: коммерческая недвижимость не найдена', 3000);
        return;
    }
    
    const property = state.property.commercialProperty[index];
    
    showModal('Переименовать коммерческую недвижимость', `
        <div style="padding: 1rem;">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.5rem;">Новое название:</label>
                <input type="text" id="newPropertyName" value="${property.name}" style="width: 100%; padding: 0.5rem; background: ${getThemeColors().bgMedium}; border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text};">
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="pill-button" onclick="closeModal(this)" style="background: var(--danger);">Отмена</button>
                <button class="pill-button success-button" onclick="savePropertyRename(${index})">Сохранить</button>
            </div>
        </div>
    `);
}

// Функция сохранения переименования коммерческой недвижимости
function savePropertyRename(index) {
    const newName = document.getElementById('newPropertyName').value.trim();
    
    if (!newName) {
        showToast('Название не может быть пустым', 'error');
        return;
    }
    
    if (!state.property || !state.property.commercialProperty || index >= state.property.commercialProperty.length) {
        showToast('Ошибка: коммерческая недвижимость не найдена', 3000);
        return;
    }
    
    const oldName = state.property.commercialProperty[index].name;
    state.property.commercialProperty[index].name = newName;
    
    // Обновляем UI
    renderCommercialProperty();
    scheduleSave();
    
    // Закрываем модальное окно
    closeModal();
    
    showToast(`Коммерческая недвижимость переименована с "${oldName}" на "${newName}"`, 'success');
}

// Функции для работы с транспортом
function renderVehicles() {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (state.property.vehicles.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Транспорт не добавлен</p>';
        return;
    }
    
    container.innerHTML = state.property.vehicles.map((vehicle, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
                <div style="flex: 1;">
                    <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none;" onclick="toggleVehicleDescription(${index})">
                        ${vehicle.name}
                    </div>
                    <div class="vehicle-content" id="vehicle-content-${index}" style="display: ${getCollapsedDisplayStyle('vehicles', index)};">
                        <div style="color: ${getThemeColors().text}; font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                            <strong>Описание:</strong> ${vehicle.description}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.7rem; color: ${getThemeColors().muted};">
                            ${vehicle.linkedGearId ? `
                                <!-- Для Складного велосипеда показываем специальные характеристики -->
                                <div><strong>Тип:</strong> Велосипед</div>
                                <div><strong>Места:</strong> ${vehicle.passengers}</div>
                                <div><strong>Скорость:</strong> ${vehicle.speed}</div>
                                <div><strong>Багажник:</strong> ${vehicle.trunk ? 'Рюкзак прикреплен' : 'Нет'}</div>
                            ` : `
                                <!-- Для обычного транспорта показываем стандартные характеристики -->
                                <div><strong>ПЗ:</strong> ${vehicle.currentHp || vehicle.hp}/${vehicle.hp}</div>
                                <div><strong>Места:</strong> ${vehicle.seats || vehicle.passengers}</div>
                                <div><strong>Скорость:</strong> ${vehicle.mechanicalSpeed || vehicle.speed}</div>
                                <div><strong>Макс. скорость:</strong> ${vehicle.narrativeSpeed || 'Не указано'}</div>
                            `}
                        </div>
                        ${vehicle.modules && vehicle.modules.length > 0 ? `
                            <div style="margin-top: 0.5rem;">
                                <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">Установленные модули:</div>
                                <div style="font-size: 0.7rem; color: ${getThemeColors().muted};">
                                    ${vehicle.modules.map(module => module.name).join(', ')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${vehicle.linkedGearId ? `
                        <!-- Кнопки для Складного велосипеда -->
                        ${vehicle.trunk ? `<button onclick="openVehicleTrunk('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: ${getThemeColors().success}; cursor: pointer;" title="Рюкзак"><img src="https://static.tildacdn.com/tild6236-6432-4830-a337-666531333863/trunk.png" alt="🎒" style="width: 16px; height: 16px; vertical-align: middle;"></button>` : ''}
                    ` : `
                        <!-- Кнопки для обычного транспорта -->
                        ${vehicle.trunk ? `<button onclick="openVehicleTrunk('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: ${getThemeColors().success}; cursor: pointer;" title="Багажник"><img src="https://static.tildacdn.com/tild6236-6432-4830-a337-666531333863/trunk.png" alt="🧳" style="width: 16px; height: 16px; vertical-align: middle;"></button>` : ''}
                        ${vehicle.modules ? `<button onclick="manageVehicleModules('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: ${getThemeColors().accent}; cursor: pointer;" title="Управление модулями"><img src="https://static.tildacdn.com/tild6535-3132-4233-b731-356365363437/wrench.png" alt="🔧" style="width: 16px; height: 16px; vertical-align: middle;"></button>` : ''}
                        <button onclick="sellVehicle('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: ${getThemeColors().danger}; cursor: pointer;" title="Продать транспорт"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"></button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// Функция сворачивания описания транспорта
function toggleVehicleDescription(index) {
    const content = document.getElementById(`vehicle-content-${index}`);
    if (content) {
        const isCollapsed = toggleCollapsedItem('vehicles', index);
        content.style.display = isCollapsed ? 'none' : 'block';
    }
}

function addHousing() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>🏠 Добавить жилье</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Название</label>
                        <input type="text" class="input-field" id="housingName" placeholder="Например: «Квартира на окраине»">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Описание</label>
                        <textarea class="input-field" id="housingDescription" rows="3" placeholder="Описание жилья"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveHousing()">Добавить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    addModalKeyboardHandlers(modal);
}

function saveHousing() {
    const name = document.getElementById('housingName').value;
    const description = document.getElementById('housingDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название жилья!</p>
            </div>
        `);
        return;
    }
    
    // Проверяем и инициализируем state.property если нужно
    if (!state.property) {
        state.property = {
            housing: [],
            vehicles: []
        };
    }
    
    if (!state.property.housing) {
        state.property.housing = [];
    }
    
    const newHousing = {
        id: generateId('housing'),
        name: name,
        description: description,
        addedDate: new Date().toLocaleDateString('ru-RU')
    };
    
    state.property.housing.push(newHousing);
    renderHousing();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Жилье добавлено', `✅ ${name} добавлено в собственность!`);
}

function removeHousing(housingId) {
    const index = state.property.housing.findIndex(h => h.id === housingId);
    if (index !== -1) {
        state.property.housing.splice(index, 1);
        renderHousing();
        scheduleSave();
    }
}

function addVehicle() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>&#x1F697; Добавить транспорт</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Название</label>
                        <input type="text" class="input-field" id="vehicleName" placeholder="Например: «Harley-Davidson»">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Описание</label>
                        <textarea class="input-field" id="vehicleDescription" rows="3" placeholder="Описание транспорта"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveVehicle()">Добавить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function saveVehicle() {
    const name = document.getElementById('vehicleName').value;
    const description = document.getElementById('vehicleDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название транспорта!</p>
            </div>
        `);
        return;
    }
    
    const newVehicle = {
        id: generateId('vehicle'),
        name: name,
        description: description,
        image: null
    };
    
    state.property.vehicles.push(newVehicle);
    renderTransport();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeVehicle(index) {
        state.property.vehicles.splice(index, 1);
        renderTransport();
        scheduleSave();
}

function uploadVehicleImage(index, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.property.vehicles[index].image = e.target.result;
            renderTransport();
            scheduleSave();
        };
        reader.readAsDataURL(file);
    }
}

function removeVehicleImage(index) {
        state.property.vehicles[index].image = null;
        renderTransport();
        scheduleSave();
}

// Функции для работы со снаряжением
// Функция renderGear перенесена в gear.js

// Перенос оружия из Снаряжения в блок "Оружие"
function takeWeaponFromGear(gearIndex) {
    const item = state.gear[gearIndex];
    if (!item || item.type !== 'weapon') return;
    const weaponData = item.weaponData;
    if (!weaponData) {
        showModal('Ошибка', 'Нет данных оружия для переноса.');
        return;
    }

    // Гарантируем id и слоты
    const weaponToAdd = Object.assign({}, weaponData);
    weaponToAdd.id = generateId('weapon');
    if (weaponToAdd.type === 'ranged') {
        if (typeof weaponToAdd.slots !== 'number') {
            weaponToAdd.slots = getRangedWeaponSlots(item.name || '');
        }
        if (!Array.isArray(weaponToAdd.modules)) {
            weaponToAdd.modules = [];
        }
    } else {
        // ближний бой: 1 слот по правилам
        weaponToAdd.slots = 1;
        if (!Array.isArray(weaponToAdd.modules)) {
            weaponToAdd.modules = [];
        }
    }

    state.weapons.push(weaponToAdd);
    state.gear.splice(gearIndex, 1);
    renderGear();
    renderWeapons();
    scheduleSave();
    showModal('Оружие взято', `&#x2705; ${item.name} перенесено в блок Оружие!`);
}

function updateLoadDisplay() {
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

// Функция для автоматического пересчета нагрузки из инвентаря
function recalculateAndUpdateLoad() {
    // Пересчитываем нагрузку из инвентаря
    if (typeof recalculateLoadFromInventory === 'function') {
        recalculateLoadFromInventory();
    }
    
    // Обновляем отображение
    updateLoadDisplay();
}

function resetLoad() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>⚖️ Сброс нагрузки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Текущая нагрузка: <strong style="color: ${getThemeColors().accent};">${state.load.current}</strong> / ${state.load.max}
                    </p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Общая нагрузка предметов: <strong style="color: ${getThemeColors().success};">${state.gear.reduce((sum, item) => sum + (item.load || 0), 0)}</strong>
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.75rem;">
                    <label class="field">
                        Новая текущая нагрузка
                        <input type="number" class="input-field" id="newLoadValue" value="${state.load.current}" min="0" max="${state.load.max}">
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="applyLoadReset()">
                    Применить
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function applyLoadReset() {
    const newLoad = parseInt(document.getElementById('newLoadValue').value);
    
    if (isNaN(newLoad) || newLoad < 0 || newLoad > state.load.max) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите корректное значение нагрузки!</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Значение должно быть от 0 до ${state.load.max}</p>
            </div>
        `);
        return;
    }
    
    state.load.current = newLoad;
    updateLoadDisplay();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Нагрузка обновлена', `&#x2705; Текущая нагрузка установлена: ${newLoad}`);
}

function showGearShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    // Проверяем, есть ли у игрока профессиональный навык "Глас народа"
    const hasJournalistSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && skill.name === 'Глас народа'
    );
    
    // Фильтруем снаряжение: показываем журналистские предметы только если есть навык
    const availableGear = GEAR_LIBRARY.filter(item => {
        if (item.requiresProfSkill === 'Глас народа') {
            return hasJournalistSkill;
        }
        return true;
    });
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3363-6531-4132-a138-663132646531/remote-control.png" alt="🎒" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин снаряжения</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleGearFreeMode()" id="gearFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры по категориям -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="pill-button gear-category-filter active" onclick="filterGearByCategory('all')" data-category="all" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Все
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('tech')" data-category="tech" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Электроника
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('medical')" data-category="medical" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Медицина
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('tools')" data-category="tools" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Инструменты
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('protection')" data-category="protection" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Защита
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('survival')" data-category="survival" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Выживание
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGearByCategory('misc')" data-category="misc" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Разное
                </button>
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;" id="gearShopContent">
                    <!-- Контент будет загружен через filterGearByCategory -->
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
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .gear-category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('gear-filter-styles')) {
        style.id = 'gear-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем все предметы по умолчанию
    filterGearByCategory('all');
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации снаряжения по категории
function filterGearByCategory(category) {
    const container = document.getElementById('gearShopContent');
    if (!container) return;
    
    document.querySelectorAll('.gear-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Проверяем, есть ли у игрока профессиональный навык "Глас народа"
    const hasJournalistSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && skill.name === 'Глас народа'
    );
    
    let filteredGear = GEAR_LIBRARY.filter(item => {
        if (item.requiresProfSkill === 'Глас народа') {
            return hasJournalistSkill;
        }
        return true;
    });
    
    // Фильтруем по категории на основе названия и описания
    if (category !== 'all') {
        filteredGear = filteredGear.filter(item => {
            const name = item.name.toLowerCase();
            const description = item.description.toLowerCase();
            
            switch (category) {
                case 'tech':
                    return name.includes('принтер') || name.includes('анализатор') || name.includes('тепловизор') || 
                           name.includes('эндоскоп') || name.includes('дрон') || name.includes('детектор') || 
                           name.includes('ноутбук') || name.includes('очки') || name.includes('хронотом') || 
                           name.includes('телефон') || name.includes('чип') || name.includes('шлем') || 
                           name.includes('камера') || name.includes('микрофон') || name.includes('рация') || 
                           name.includes('редактор') || name.includes('цинковый') || name.includes('фонарик') ||
                           name.includes('зажигалка') || name.includes('изолента') || name.includes('геймерский') ||
                           name.includes('нанофон') || name.includes('направленный') || name.includes('блок памяти') ||
                           name.includes('блок реальнизации') || name.includes('устройство днк') || name.includes('шпионский');
                
                case 'medical':
                    return name.includes('аптечка') || name.includes('противогаз') || name.includes('антирадиационный') ||
                           name.includes('компенсатор') || name.includes('смазка личная') || name.includes('презервативы') ||
                           name.includes('комплект изменения вкуса');
                
                case 'tools':
                    return name.includes('мультитул') || name.includes('комплект проводов') || name.includes('маркер') ||
                           name.includes('стеклорез') || name.includes('отмычка') || name.includes('смазка техническая') ||
                           name.includes('фальшфейер') || name.includes('шнур') || name.includes('верёвка') ||
                           name.includes('пистолет-кошка') || name.includes('устройство для подъёма') ||
                           name.includes('универсальная механическая') || name.includes('чип для взлома');
                
                case 'protection':
                    return name.includes('антивибрационные') || name.includes('антирадиационный') || name.includes('вингсьют') ||
                           name.includes('компенсатор') || name.includes('противогаз') || name.includes('противотударный') ||
                           name.includes('скафандр') || name.includes('наручники') || name.includes('наушники') ||
                           name.includes('рюкзак') || name.includes('сумка') || name.includes('плащ') ||
                           name.includes('палатка') || name.includes('зонт') || name.includes('нижнее бельё') ||
                           name.includes('противогаз') || name.includes('ребризер');
                
                case 'survival':
                    return name.includes('набор выживальщика') || name.includes('набор туриста') || name.includes('набор для еды') ||
                           name.includes('паёк') || name.includes('палатка') || name.includes('плащ-палатка') ||
                           name.includes('прыжковые ускорители') || name.includes('складной велосипед') ||
                           name.includes('сигареты') || name.includes('набор чистых');
                
                case 'misc':
                    return !name.includes('принтер') && !name.includes('анализатор') && !name.includes('тепловизор') && 
                           !name.includes('эндоскоп') && !name.includes('дрон') && !name.includes('детектор') && 
                           !name.includes('ноутбук') && !name.includes('очки') && !name.includes('хронотом') && 
                           !name.includes('телефон') && !name.includes('чип') && !name.includes('шлем') && 
                           !name.includes('камера') && !name.includes('микрофон') && !name.includes('рация') && 
                           !name.includes('редактор') && !name.includes('цинковый') && !name.includes('фонарик') &&
                           !name.includes('зажигалка') && !name.includes('изолента') && !name.includes('геймерский') &&
                           !name.includes('нанофон') && !name.includes('направленный') && !name.includes('блок памяти') &&
                           !name.includes('блок реальнизации') && !name.includes('устройство днк') && !name.includes('шпионский') &&
                           !name.includes('аптечка') && !name.includes('противогаз') && !name.includes('антирадиационный') &&
                           !name.includes('компенсатор') && !name.includes('смазка личная') && !name.includes('презервативы') &&
                           !name.includes('комплект изменения вкуса') && !name.includes('мультитул') && !name.includes('комплект проводов') &&
                           !name.includes('маркер') && !name.includes('стеклорез') && !name.includes('отмычка') &&
                           !name.includes('смазка техническая') && !name.includes('фальшфейер') && !name.includes('шнур') &&
                           !name.includes('верёвка') && !name.includes('пистолет-кошка') && !name.includes('устройство для подъёма') &&
                           !name.includes('универсальная механическая') && !name.includes('чип для взлома') &&
                           !name.includes('антивибрационные') && !name.includes('вингсьют') && !name.includes('противотударный') &&
                           !name.includes('скафандр') && !name.includes('наручники') && !name.includes('наушники') &&
                           !name.includes('рюкзак') && !name.includes('сумка') && !name.includes('плащ') &&
                           !name.includes('палатка') && !name.includes('зонт') && !name.includes('нижнее бельё') &&
                           !name.includes('ребризер') && !name.includes('набор выживальщика') && !name.includes('набор туриста') &&
                           !name.includes('набор для еды') && !name.includes('паёк') && !name.includes('плащ-палатка') &&
                           !name.includes('прыжковые ускорители') && !name.includes('складной велосипед') &&
                           !name.includes('сигареты') && !name.includes('набор чистых');
                
                default:
                    return true;
            }
        });
    }
    
    container.innerHTML = filteredGear.map(item => {
        const isJournalistItem = item.requiresProfSkill === 'Глас народа';
        
        return `
            <div class="shop-item" style="border: ${isJournalistItem ? '2px solid #5b9bff' : '1px solid var(--border)'};">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">
                        ${item.name}${isJournalistItem ? ' <span style="color: #5b9bff; font-size: 0.75rem; font-weight: 600;">[Журналист]</span>' : ''}
                    </h4>
                </div>
                
                <p class="shop-item-description">
                    ${item.description}
                </p>
                
                <div class="shop-item-stats">
                    <div class="shop-stat">Нагрузка: ${item.load}</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="gear-price-display" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${item.price}" data-load="${item.load}">
                        ${item.price} уе
                    </span>
                    <button class="pill-button primary-button gear-buy-button" onclick="buyGear('${item.name.replace(/'/g, "\\'")}', ${item.price}, ${item.load}, '${item.description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')" data-gear-name="${item.name}" data-price="${item.price}" data-load="${item.load}" data-description="${item.description.replace(/'/g, "\\'").replace(/"/g, '\\"')}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function filterGear(searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    const gearItems = document.querySelectorAll('.gear-item');
    
    gearItems.forEach(item => {
        const name = item.dataset.name || '';
        const description = item.dataset.description || '';
        
        if (name.includes(searchLower) || description.includes(searchLower)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

window.buyGear = function(name, price, load, description, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Проверяем, требует ли предмет специальной обработки
    const itemData = { description, price, load };
    if (typeof handleSpecialGearPurchase === 'function' && handleSpecialGearPurchase(name, itemData)) {
        // Специальная обработка выполнена, не добавляем предмет обычным способом
        recalculateAndUpdateLoad();
        scheduleSave();
        
        // Добавляем в лог
        addToRollLog('purchase', {
            item: name,
            price: price,
            category: 'Снаряжение (специальное)'
        });
        
        return;
    }
    
    // Добавляем в снаряжение обычным способом
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: price,
        load: load,
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.gear.push(newGear);
    renderGear();
    recalculateAndUpdateLoad();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Снаряжение'
    });
    
    showModal('Снаряжение куплено', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлено в снаряжение!</p>
            <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Осталось нагрузки: ${state.load.current}</p>
        </div>
    `);
}

function forceBuyGear(name, price, load, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку (даже при перегрузке)
    state.load.current -= load;
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: price,
        load: load
    };
    
    state.gear.push(newGear);
    renderGear();
    recalculateAndUpdateLoad();
    scheduleSave();
}

function toggleGearFreeMode() {
    const buyButtons = document.querySelectorAll('.gear-buy-button');
    const priceDisplays = document.querySelectorAll('.gear-price-display');
    const toggleButton = document.getElementById('gearFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        // Отключаем бесплатный режим
        buyButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const name = btn.getAttribute('data-gear-name');
            const load = btn.getAttribute('data-load');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyGear('${name.replace(/'/g, "\\'")}', ${price}, ${load}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')`);
        });
        
        // Возвращаем оригинальные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            const load = display.getAttribute('data-load');
            display.textContent = `Цена: ${originalPrice} уе | Нагрузка: ${load}`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        // Включаем бесплатный режим
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-gear-name');
            const load = btn.getAttribute('data-load');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyGear('${name.replace(/'/g, "\\'")}', 0, ${load}, '${description.replace(/'/g, "\\'").replace(/"/g, '\\"')}')`);
        });
        
        // Меняем цены визуально на 0
        priceDisplays.forEach(display => {
            const load = display.getAttribute('data-load');
            display.textContent = `Цена: 0 уе | Нагрузка: ${load}`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

function pickupGear() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>📦 Подобрать снаряжение</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Название</label>
                        <input type="text" class="input-field" id="pickedGearName" placeholder="Например: «Старый фонарик»">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Цена (для скупщика)</label>
                        <input type="number" class="input-field" id="pickedGearPrice" value="0" min="0" placeholder="Цена предмета в уе">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Нагрузка</label>
                        <input type="number" class="input-field" id="pickedGearLoad" value="1" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Описание</label>
                        <textarea class="input-field" id="pickedGearDescription" rows="3" placeholder="Описание предмета"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="savePickedGear()">Подобрать</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function savePickedGear() {
    const name = document.getElementById('pickedGearName').value;
    const price = parseInt(document.getElementById('pickedGearPrice').value) || 0;
    const load = parseInt(document.getElementById('pickedGearLoad').value) || 0;
    const description = document.getElementById('pickedGearDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название предмета!</p>
            </div>
        `);
        return;
    }
    
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: price,
        load: load,
        type: 'custom' // Маркер для скупщика
    };
    
    state.gear.push(newGear);
    renderGear();
    recalculateAndUpdateLoad();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeGear(index) {
        const item = state.gear[index];
        if (item) {
            // Возвращаем нагрузку
            state.load.current += item.load || 0;
            
            // Удаляем предмет
            state.gear.splice(index, 1);
            
            // Обновляем отображение
            renderGear();
            recalculateAndUpdateLoad();
            scheduleSave();
        }
}

// Функции для работы с оружием
console.log('🔍 Определяем функцию showWeaponShop...');
function showWeaponShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6334-3163-4362-b232-366332396435/weapon.png" alt="🔫" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин оружия</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleWeaponsFreeMode()" id="weaponsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="pill-button success-button" onclick="closeModal(this); setTimeout(() => showCustomWeaponCreator(), 100);" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;">Создать своё</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="pill-button category-filter active" onclick="filterWeapons('melee')" data-category="melee" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Для ближнего боя
                </button>
                <button class="pill-button category-filter" onclick="filterWeapons('ranged')" data-category="ranged" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Для дальнего боя
                </button>
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;" id="weaponsShopContainer">
                <!-- Контент будет загружен через filterWeapons -->
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('weapon-filter-styles')) {
        style.id = 'weapon-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем оружие ближнего боя по умолчанию
    filterWeapons('melee');
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации оружия в объединённом магазине
function filterWeapons(category) {
    const container = document.getElementById('weaponsShopContainer');
    if (!container) return;
    
    // Обновляем активный фильтр
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Рендерим оружие в новом дизайне
    if (category === 'melee') {
        container.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding: 1rem;">
            ${MELEE_WEAPONS.map((weapon) => `
                <div class="shop-item">
                    <div class="shop-item-header">
                        <h4 class="shop-item-title">${weapon.type}</h4>
                    </div>
                    
                    <div class="shop-item-stats">
                        <div class="shop-stat">Урон: ${weapon.damage}</div>
                        <div class="shop-stat">Нагрузка: ${weapon.load}</div>
                        <div class="shop-stat">Скрыть: ${formatYesNo(weapon.concealable)}</div>
                        <div class="shop-stat">СКА: ${weapon.stealthPenalty}</div>
                    </div>
                    
                    <p class="shop-item-description">
                        <strong>Примеры:</strong> ${weapon.examples}
                    </p>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <span class="melee-weapon-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${weapon.price}" data-load="${weapon.load}">
                            ${weapon.price} уе
                        </span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="pill-button primary-button melee-weapon-buy-button" onclick="buyMeleeWeapon('${weapon.type.replace(/'/g, "\\'")}', ${weapon.price}, ${weapon.load}, '${weapon.damage.replace(/'/g, "\\'")}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples.replace(/'/g, "\\'")}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                            <button class="pill-button success-button melee-weapon-gear-button" onclick="buyMeleeWeaponToGear('${weapon.type.replace(/'/g, "\\'")}', ${weapon.price}, ${weapon.load}, '${weapon.damage.replace(/'/g, "\\'")}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples.replace(/'/g, "\\'")}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                В сумку
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    } else if (category === 'ranged') {
        container.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; padding: 1rem;">
            ${RANGED_WEAPONS.map((weapon) => `
                <div class="shop-item">
                    <div class="shop-item-header">
                        <h4 class="shop-item-title">${weapon.type}</h4>
                    </div>
                    
                    <div class="shop-item-stats">
                        <div class="shop-stat">Урон: ${weapon.primaryDamage}/${weapon.altDamage}</div>
                        <div class="shop-stat">Нагрузка: ${weapon.load}</div>
                        <div class="shop-stat">Магазин: ${weapon.magazine}</div>
                        <div class="shop-stat">Руки: ${weapon.hands}</div>
                        <div class="shop-stat">СКА: ${weapon.stealth}</div>
                        <div class="shop-stat">Скрыть: ${formatYesNo(weapon.concealable)}</div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                        <span class="ranged-weapon-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${weapon.price}" data-load="${weapon.load}">
                            ${weapon.price} уе
                        </span>
                        <div style="display: flex; gap: 0.5rem;">
                            <button class="pill-button primary-button ranged-weapon-buy-button" onclick="buyRangedWeapon(${JSON.stringify(weapon.type)}, ${weapon.price}, ${weapon.load}, ${JSON.stringify(weapon.primaryDamage)}, ${JSON.stringify(weapon.altDamage)}, ${JSON.stringify(weapon.concealable)}, ${JSON.stringify(weapon.hands)}, ${weapon.stealth}, ${JSON.stringify(weapon.magazine)}, null)" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-original-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                            <button class="pill-button success-button ranged-weapon-gear-button" onclick="buyRangedWeaponToGear(${JSON.stringify(weapon.type)}, ${weapon.price}, ${weapon.load}, ${JSON.stringify(weapon.primaryDamage)}, ${JSON.stringify(weapon.altDamage)}, ${JSON.stringify(weapon.concealable)}, ${JSON.stringify(weapon.hands)}, ${weapon.stealth}, ${JSON.stringify(weapon.magazine)}, null)" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-original-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                В сумку
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>`;
        
        // Принудительно обновляем onclick атрибуты кнопок после применения обёрток
        setTimeout(() => {
            if (typeof initializeRangedWeaponButtons === 'function') {
                initializeRangedWeaponButtons();
            }
        }, 100);
    }
}

// Функция переключения бесплатного режима для оружия
function toggleWeaponsFreeMode() {
    const container = document.getElementById('weaponsShopContainer');
    const toggleButton = document.getElementById('weaponsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (!container || !toggleButton) return;
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        // Отключаем бесплатный режим
        const meleeButtons = document.querySelectorAll('.melee-weapon-buy-button, .melee-weapon-gear-button');
        const rangedButtons = document.querySelectorAll('.ranged-weapon-buy-button, .ranged-weapon-gear-button');
        const meleePrices = document.querySelectorAll('.melee-weapon-price');
        const rangedPrices = document.querySelectorAll('.ranged-weapon-price');
        
        meleeButtons.forEach(btn => {
            const originalPrice = btn.getAttribute('data-price');
            const weaponType = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            
            if (btn.classList.contains('melee-weapon-buy-button')) {
                btn.setAttribute('onclick', `buyMeleeWeapon('${weaponType}', ${originalPrice}, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
            } else {
                btn.setAttribute('onclick', `buyMeleeWeaponToGear('${weaponType}', ${originalPrice}, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
            }
        });
        
        rangedButtons.forEach(btn => {
            const originalPrice = btn.getAttribute('data-original-price');
            const weaponType = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            
            if (btn.classList.contains('ranged-weapon-buy-button')) {
                btn.setAttribute('onclick', `buyRangedWeapon(${JSON.stringify(weaponType)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
            } else {
                btn.setAttribute('onclick', `buyRangedWeaponToGear(${JSON.stringify(weaponType)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
            }
        });
        
        meleePrices.forEach(priceDisplay => {
            const originalPrice = priceDisplay.getAttribute('data-original-price');
            priceDisplay.textContent = `${originalPrice} уе`;
        });
        
        rangedPrices.forEach(priceDisplay => {
            const originalPrice = priceDisplay.getAttribute('data-original-price');
            priceDisplay.textContent = `${originalPrice} уе`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = '';
        }
    } else {
        // Включаем бесплатный режим
        const meleeButtons = document.querySelectorAll('.melee-weapon-buy-button, .melee-weapon-gear-button');
        const rangedButtons = document.querySelectorAll('.ranged-weapon-buy-button, .ranged-weapon-gear-button');
        const meleePrices = document.querySelectorAll('.melee-weapon-price');
        const rangedPrices = document.querySelectorAll('.ranged-weapon-price');
        
        meleeButtons.forEach(btn => {
            const weaponType = btn.getAttribute('data-weapon-type');
            const originalPrice = btn.getAttribute('data-price');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            
            if (btn.classList.contains('melee-weapon-buy-button')) {
                btn.setAttribute('onclick', `buyMeleeWeapon('${weaponType}', 0, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}', ${originalPrice})`);
            } else {
                btn.setAttribute('onclick', `buyMeleeWeaponToGear('${weaponType}', 0, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}', ${originalPrice})`);
            }
        });
        
        rangedButtons.forEach(btn => {
            const weaponType = btn.getAttribute('data-weapon-type');
            const originalPrice = btn.getAttribute('data-original-price');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            
            if (btn.classList.contains('ranged-weapon-buy-button')) {
                btn.setAttribute('onclick', `buyRangedWeapon(${JSON.stringify(weaponType)}, 0, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, ${originalPrice})`);
            } else {
                btn.setAttribute('onclick', `buyRangedWeaponToGear(${JSON.stringify(weaponType)}, 0, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, ${originalPrice})`);
            }
        });
        
        meleePrices.forEach(priceDisplay => {
            priceDisplay.textContent = `БЕСПЛАТНО`;
        });
        
        rangedPrices.forEach(priceDisplay => {
            priceDisplay.textContent = `БЕСПЛАТНО`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

/* DEPRECATED - Используется объединённый showWeaponShop
function showMeleeWeaponsShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>⚔️ Оружие ближнего боя</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleMeleeWeaponsFreeMode()" id="meleeWeaponsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; gap: 1rem;">
                    ${MELEE_WEAPONS.map((weapon) => `
                        <div class="property-item">
                            <div class="property-header">
                                <div class="property-name">${weapon.type}</div>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span class="melee-weapon-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem;" data-original-price="${weapon.price}" data-load="${weapon.load}">Цена: ${weapon.price} уе | Нагрузка: ${weapon.load}</span>
                                    <button class="pill-button primary-button melee-weapon-buy-button" onclick="buyMeleeWeapon('${weapon.type}', ${weapon.price}, ${weapon.load}, '${weapon.damage}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                    <button class="pill-button success-button melee-weapon-gear-button" onclick="buyMeleeWeaponToGear('${weapon.type}', ${weapon.price}, ${weapon.load}, '${weapon.damage}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">В сумку</button>
                                </div>
                            </div>
                            <div class="property-description">
                                <div style="font-family: monospace; font-size: 0.8rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">
                                    Урон: ${weapon.damage} | Можно скрыть: ${formatYesNo(weapon.concealable)} | Штраф к СКА: ${weapon.stealthPenalty}
                                </div>
                                <div style="font-size: 0.9rem;">
                                    <strong>Примеры:</strong> ${weapon.examples}
                                </div>
                            </div>
                        </div>
                    `).join('')}
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}
*/

/* DEPRECATED - Используется объединённый showWeaponShop
function showRangedWeaponsShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6332-3731-4662-b731-326433633632/assault-rifle.png" alt="🔫" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Оружие дальнего боя</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleRangedWeaponsFreeMode()" id="rangedWeaponsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; gap: 1rem;">
                    ${RANGED_WEAPONS.map((weapon) => `
                        <div class="property-item">
                            <div class="property-header">
                                <div class="property-name">${weapon.type}</div>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span class="ranged-weapon-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem;" data-original-price="${weapon.price}" data-load="${weapon.load}">Цена: ${weapon.price} уе | Нагрузка: ${weapon.load}</span>
                                    <button class="pill-button primary-button ranged-weapon-buy-button" onclick="buyRangedWeapon(${JSON.stringify(weapon.type)}, ${weapon.price}, ${weapon.load}, ${JSON.stringify(weapon.primaryDamage)}, ${JSON.stringify(weapon.altDamage)}, ${JSON.stringify(weapon.concealable)}, ${JSON.stringify(weapon.hands)}, ${weapon.stealth}, ${JSON.stringify(weapon.magazine)}, null)" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-original-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                    <button class="pill-button success-button ranged-weapon-gear-button" onclick="buyRangedWeaponToGear(${JSON.stringify(weapon.type)}, ${weapon.price}, ${weapon.load}, ${JSON.stringify(weapon.primaryDamage)}, ${JSON.stringify(weapon.altDamage)}, ${JSON.stringify(weapon.concealable)}, ${JSON.stringify(weapon.hands)}, ${weapon.stealth}, ${JSON.stringify(weapon.magazine)}, null)" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-original-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">В сумку</button>
                                </div>
                            </div>
                            <div class="property-description">
                                <div style="font-family: monospace; font-size: 0.8rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">
                                    Урон основной: ${weapon.primaryDamage} | Урон альтернативный: ${weapon.altDamage} | Можно скрыть: ${formatYesNo(weapon.concealable)} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}
                                </div>
                            </div>
                        </div>
                    `).join('')}
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
    
    // Принудительно обновляем onclick атрибуты кнопок после применения обёрток
    setTimeout(() => {
        initializeRangedWeaponButtons();
    }, 100);
}
*/

console.log('✅ Функция showWeaponShop определена успешно');

// Магазин Дек
console.log('🔍 Определяем функцию showDeckShop...');
function showDeckShop() {
    console.log('🔍 ВНУТРИ функции showDeckShop - функция выполняется!');
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3633-6632-4463-a435-353036636235/live-streaming.png" alt="💻" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин Дек</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${DECK_CATALOG.map((deck) => {
                        // Применяем скидку Чёрного хакера (5% за уровень)
                        const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
                        const discount = blackHackerLevel * 5;
                        const originalPrice = deck.price;
                        const finalPrice = discount > 0 ? Math.floor(originalPrice * (100 - discount) / 100) : originalPrice;
                        const hasDiscount = discount > 0 && finalPrice < originalPrice;
                        
                        return `
                            <div class="shop-item">
                                <div class="shop-item-header">
                                    <h4 class="shop-item-title">${deck.name}</h4>
                                </div>
                                
                                <p class="shop-item-description">
                                    ${deck.description}
                                </p>
                                
                                <div class="shop-item-stats">
                                    <div class="shop-stat">Память: ${deck.memory}</div>
                                    <div class="shop-stat">ОЗУ: ${deck.ram}</div>
                                    <div class="shop-stat">Сетка: ${deck.grid}</div>
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                                    <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                        ${hasDiscount ? 
                                            `<span style="text-decoration: line-through; color: ${getThemeColors().muted};">${originalPrice.toLocaleString()}</span> <span style="color: ${getThemeColors().success};">${finalPrice.toLocaleString()}</span> <span style="color: ${getThemeColors().success}; font-size: 0.75rem;">(-${discount}%)</span> уе` :
                                            `${deck.price.toLocaleString()} уе`
                                        }
                                    </span>
                                    <button class="pill-button primary-button" onclick="buyDeck('${deck.name.replace(/'/g, "\\'")}', ${deck.memory}, ${deck.ram}, ${deck.grid}, ${finalPrice})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                        Купить
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция покупки деки
function buyDeck(name, memory, ram, grid, price, catalogPrice = null) {
    if (state.money < price) {
        showModal('Недостаточно средств', `У вас ${state.money.toLocaleString()} уе, а нужно ${price.toLocaleString()} уе.`);
        return;
    }
    
    const newDeck = {
        id: Date.now(),
        name: name,
        memory: memory,
        ram: ram,
        grid: grid,
        version: '10',
        osVersion: '',
        programs: [],
        chips: [],
        modules: [],
        catalogPrice: catalogPrice || price,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.decks.push(newDeck);
    state.money -= price;
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Дека'
    });
    
    showModal('Дека куплена', `${name} добавлена в коллекцию! Теперь вы можете переключиться на неё в магазине дек.`);
    scheduleSave();
    updateAllDisplays();
}

// Магазин снаряжения для Дек
function showDeckGearShop() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3633-6632-4463-a435-353036636235/live-streaming.png" alt="💻" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин снаряжения</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${DECK_GEAR_CATALOG.map((item) => `
                        <div class="shop-item">
                            <div class="shop-item-header">
                                <h4 class="shop-item-title">${item.name}</h4>
                            </div>
                            
                            <p class="shop-item-description">
                                ${item.description}
                            </p>
                            
                            ${item.stat ? `
                                <div class="shop-item-stats">
                                    <div class="shop-stat">${item.stat}: ${item.maxValue}</div>
                                    ${item.maxQuantity > 0 ? `<div class="shop-stat">Макс. количество: ${item.maxQuantity}</div>` : ''}
                                </div>
                            ` : ''}
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                                <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                    ${(() => {
                                        const discount = calculateDeckGearDiscount();
                                        if (discount > 0) {
                                            const originalPrice = typeof item.price === 'string' ? parseInt(item.price.replace(/\s/g, '')) : parseInt(item.price);
                                            const discountedPrice = Math.floor(originalPrice * (1 - discount / 100));
                                            return `<span style="text-decoration: line-through; color: var(--muted);">${originalPrice}</span> <span style="color: var(--success); font-weight: 600;">${discountedPrice}</span> уе <span style="color: var(--success); font-size: 0.8rem;">(-${discount}%)</span>`;
                                        } else {
                                            return `${item.price} уе`;
                                        }
                                    })()}
                                </span>
                                <button class="pill-button primary-button" onclick="buyDeckGear('${item.name}', '${item.price}', '${item.type}', '${item.stat || ''}', ${item.maxValue || 0}, ${item.unique || false}, ${item.maxQuantity || 0})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                    Купить
                                </button>
                            </div>
                        </div>
                    `).join('')}
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}
console.log('✅ Функция showDeckShop определена успешно');

// Функция покупки снаряжения для деки
function buyDeckGear(name, priceStr, type, stat, maxValue, unique, maxQuantity, catalogPrice = null) {
    let price = 0;
    
    // Обработка цен типа "ур*200"
    if (priceStr.includes('ур*')) {
        const multiplier = parseInt(priceStr.replace('ур*', ''));
        price = state.reputation * multiplier;
    } else {
        price = parseInt(priceStr.replace(/\s/g, ''));
    }
    
    // Рассчитываем скидку от "Чёрного хакера"
    const discount = calculateDeckGearDiscount();
    const discountedPrice = Math.floor(price * (1 - discount / 100));
    const finalPrice = discount > 0 ? discountedPrice : price;
    
    if (state.money < finalPrice) {
        showModal('Недостаточно средств', `У вас ${state.money.toLocaleString()} уе, а нужно ${finalPrice.toLocaleString()} уе.`);
        return;
    }
    
    // Проверка уникальности (только для не-модулей)
    if (unique && type !== 'module') {
        const existingItem = state.deckGear.find(item => item.name === name);
        if (existingItem) {
            showModal('Уже куплено', `${name} уже есть в вашем снаряжении для дек.`);
            return;
        }
    }
    
    // Проверка максимального количества
    if (maxQuantity > 0) {
        const existingItems = state.deckGear.filter(item => item.name === name);
        if (existingItems.length >= maxQuantity) {
            showModal('Достигнут лимит', `Максимальное количество "${name}" - ${maxQuantity}.`);
            return;
        }
    }
    
    const newGear = {
        id: Date.now(),
        name: name,
        type: 'deck_gear',
        deckGearType: type,
        stat: stat,
        maxValue: maxValue,
        unique: unique,
        maxQuantity: maxQuantity,
        installedDeckId: null,
        catalogPrice: catalogPrice || price,
        purchasePrice: finalPrice,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.deckGear.push(newGear);
    // НЕ списываем деньги сразу для модулей - только при установке
    
    // Для модулей сразу предлагаем установку
    if (type === 'module') {
        // Создаем модал с выбором деки для модуля
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        const existingModals = document.querySelectorAll('.modal-overlay');
        modal.style.zIndex = 1000 + (existingModals.length * 100);
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>ВЫБОР ДЕКИ</h3>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom: 1rem;">Необходимо выбрать деку, на которую установить "${name}"!</p>
                    <div style="margin-bottom: 1rem;">
                        <div style="margin-bottom: 0.5rem; color: ${getThemeColors().accent}; font-weight: 600;">Выберите деку:</div>
                        <select id="deckSelect" style="width: 100%; padding: 0.75rem; background: var(--bg-primary); border: 2px solid var(--accent); border-radius: 8px; color: ${getThemeColors().text}; font-size: 1rem; box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);">
                            ${state.deck ? `<option value="main">Основная дека (${state.deck.name})</option>` : ''}
                            ${state.decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="pill-button muted-button" onclick="closeModal(this)">Отменить</button>
                    <button class="pill-button primary-button" onclick="installDeckModuleOnDeck(${newGear.id}, document.getElementById('deckSelect').value); closeModal(this)">Установить</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.querySelector('.icon-button'));
            }
        });
        
        addModalKeyboardHandlers(modal);
    } else {
        state.money -= price; // Для не-модулей списываем деньги сразу
        showModal('Снаряжение куплено', `${name} добавлено в снаряжение для дек!`);
    }
    
    scheduleSave();
    updateAllDisplays();
}

// Функция установки модуля на конкретную деку
function installDeckModuleOnDeck(moduleId, deckId) {
    console.log('installDeckModuleOnDeck called with:', moduleId, deckId);
    const module = state.deckGear.find(item => item.id == moduleId);
    console.log('Found module:', module);
    if (!module) return false;
    
    // Списываем деньги при установке
    if (state.money < module.purchasePrice) {
        showModal('Недостаточно средств', `У вас ${state.money.toLocaleString()} уе, а нужно ${module.purchasePrice.toLocaleString()} уе.`);
        return false;
    }
    
    // Проверяем уникальность для уникальных модулей
    if (module.unique) {
        console.log('Checking uniqueness for module:', module.name);
        const existingModule = state.deckGear.find(item => 
            item.name === module.name && 
            item.installedDeckId == deckId
        );
        if (existingModule) {
            console.log('Module already installed on this deck');
            showModal('Модуль уже установлен', `${module.name} уже установлен на эту деку.`);
            return false;
        }
    }
    
    // Проверяем максимальное количество
    if (module.maxQuantity > 0) {
        console.log('Checking max quantity for module:', module.name, 'max:', module.maxQuantity);
        const existingModules = state.deckGear.filter(item => 
            item.name === module.name && 
            item.installedDeckId == deckId
        );
        if (existingModules.length >= module.maxQuantity) {
            console.log('Max quantity reached for module');
            showModal('Достигнут лимит', `Максимальное количество "${module.name}" - ${module.maxQuantity}.`);
            return false;
        }
    }
    
    // Устанавливаем модуль и списываем деньги
    module.installedDeckId = deckId;
    state.money -= module.purchasePrice;
    
    const deckName = deckId === 'main' ? state.deck.name : state.decks.find(d => d.id == deckId)?.name || 'Неизвестная дека';
    console.log('Installing module on deck:', deckName);
    showModal('Модуль установлен', `${module.name} установлен на ${deckName} за ${module.purchasePrice.toLocaleString()} уе!`);
    scheduleSave();
    updateAllDisplays();
    console.log('Module installation completed successfully');
    return true;
}

// Функция установки модуля на деку
function installDeckModule(moduleId) {
    const module = state.deckGear.find(item => item.id === moduleId);
    if (!module) return;
    
    // Проверяем уникальность для уникальных модулей
    if (module.unique) {
        const existingModule = state.deckGear.find(item => 
            item.name === module.name && 
            item.installedDeckId === 'main'
        );
        if (existingModule) {
            showModal('Модуль уже установлен', `${module.name} уже установлен на деку.`);
            return;
        }
    }
    
    // Проверяем максимальное количество
    if (module.maxQuantity > 0) {
        const existingModules = state.deckGear.filter(item => 
            item.name === module.name && 
            item.installedDeckId === 'main'
        );
        if (existingModules.length >= module.maxQuantity) {
            showModal('Достигнут лимит', `Максимальное количество "${module.name}" - ${module.maxQuantity}.`);
            return;
        }
    }
    
    // Устанавливаем модуль
    module.installedDeckId = 'main';
    
    showModal('Модуль установлен', `${module.name} установлен на деку!`);
    scheduleSave();
    updateAllDisplays();
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

// Функция показа коллекции дек
function showDeckCollection() {
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 1200px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3633-6632-4463-a435-353036636235/live-streaming.png" alt="💾" style="width: 24px; height: 24px; margin-right: 0.5rem;"> Мои Деки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div id="deckCollectionContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1rem;">
                    <!-- Деки будут добавлены через JavaScript -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Рендерим коллекцию дек после добавления в DOM
    setTimeout(() => {
        renderDeckCollection();
    }, 0);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция отображения коллекции дек
function renderDeckCollection() {
    const container = document.getElementById('deckCollectionContainer');
    if (!container) return;
    
    // Добавляем основную деку в коллекцию только если она существует
    const allDecks = [];
    
    if (state.deck) {
        allDecks.push({
            id: 'main',
            name: state.deck.name,
            memory: parseInt(state.deck.memory),
            ram: parseInt(state.deckRam.max),
            grid: parseInt(state.deck.grid),
            version: state.deck.version,
            osVersion: state.deck.osVersion || '',
            isMain: true
        });
    }
    
    // Добавляем купленные деки
    allDecks.push(...state.decks.map(deck => ({
        ...deck,
        isMain: false
    })));
    
    if (allDecks.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">У вас нет дек. Купите деку в магазине!</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
            ${allDecks.map(deck => {
        // Подсчитываем улучшения
        const upgrades = state.deckGear.filter(item => 
            item.deckGearType === 'upgrade' && 
            item.installedDeckId == deck.id // Используем == для сравнения строки и числа
        );
        
        const memoryUpgrades = upgrades.filter(u => u.stat === 'memory').length;
        const ramUpgrades = upgrades.filter(u => u.stat === 'ram').length;
        const gridUpgrades = upgrades.filter(u => u.stat === 'grid').length;
        
        // Финальные характеристики
        const finalMemory = deck.memory + memoryUpgrades;
        const finalRam = deck.ram + ramUpgrades;
        const finalGrid = deck.grid + gridUpgrades;
        
        // Подсчитываем модули
        const modules = state.deckGear.filter(item => 
            item.deckGearType === 'module' && 
            item.installedDeckId == deck.id
        );
        
        // Подсчитываем щепки
        const chips = state.deckChips.filter(chip => chip.installedDeckId == deck.id);
        const chipSlots = 1 + modules.filter(m => m.name === 'Дополнительный слот для Щепки').length;
        
        return `
            <div style="background: linear-gradient(135deg, rgba(138, 43, 226, 0.1), rgba(75, 0, 130, 0.1)); border: 2px solid var(--accent); border-radius: 12px; padding: 1rem; position: relative; overflow: hidden;">
                <!-- Декоративные элементы -->
                <div style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(138, 43, 226, 0.2), transparent); border-radius: 50%;"></div>
                <div style="position: absolute; bottom: -30px; left: -30px; width: 80px; height: 80px; background: radial-gradient(circle, rgba(75, 0, 130, 0.15), transparent); border-radius: 50%;"></div>
                
                <!-- Заголовок -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; position: relative; z-index: 1;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: ${getThemeColors().accent}; display: flex; align-items: center; gap: 0.5rem;">
                            ${deck.isMain ? '🏠' : '💾'} ${deck.name}
                        </h3>
                        ${deck.isMain ? '' : ''}
                    </div>
                    <button class="pill-button primary-button" onclick="renameDeck('${deck.id}')" style="font-size: 0.7rem; padding: 0.3rem 0.6rem; background: linear-gradient(45deg, var(--accent), #9d4edd);">✏️</button>
                </div>
                
                <!-- Статистики -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; position: relative; z-index: 1;">
                    <div style="background: rgba(138, 43, 226, 0.2); border: 1px solid var(--accent); border-radius: 8px; padding: 0.5rem; text-align: center;">
                        <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">ПАМЯТЬ</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${getThemeColors().text};">${finalMemory}</div>
                        ${memoryUpgrades > 0 ? `<div style="color: ${getThemeColors().success}; font-size: 0.6rem;">+${memoryUpgrades}</div>` : ''}
                    </div>
                    <div style="background: rgba(138, 43, 226, 0.2); border: 1px solid var(--accent); border-radius: 8px; padding: 0.5rem; text-align: center;">
                        <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">ОЗУ</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${getThemeColors().text};">${finalRam}</div>
                        ${ramUpgrades > 0 ? `<div style="color: ${getThemeColors().success}; font-size: 0.6rem;">+${ramUpgrades}</div>` : ''}
                    </div>
                    <div style="background: rgba(138, 43, 226, 0.2); border: 1px solid var(--accent); border-radius: 8px; padding: 0.5rem; text-align: center;">
                        <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">СЕТКА</div>
                        <div style="font-size: 1.1rem; font-weight: 700; color: ${getThemeColors().text};">${finalGrid}</div>
                        ${gridUpgrades > 0 ? `<div style="color: ${getThemeColors().success}; font-size: 0.6rem;">+${gridUpgrades}</div>` : ''}
                    </div>
                    <div style="background: rgba(138, 43, 226, 0.2); border: 1px solid var(--accent); border-radius: 8px; padding: 0.5rem; text-align: center;">
                        <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">OS ВЕРСИЯ</div>
                        <input type="text" 
                               value="${deck.osVersion || ''}" 
                               placeholder="Введите версию"
                               onchange="updateDeckOsVersion('${deck.id}', this.value)"
                               style="width: 100%; background: transparent; border: none; color: ${getThemeColors().text}; font-size: 0.8rem; font-weight: 600; text-align: center; outline: none;"
                               maxlength="20">
                    </div>
                </div>
                
                <!-- Кнопки улучшений -->
                <div style="margin-bottom: 1rem; position: relative; z-index: 1;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.3rem;">
                        ${memoryUpgrades < 5 ? (() => {
                            const originalPrice = (finalMemory + 1) * 200;
                            const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
                            const discount = blackHackerLevel * 5;
                            const finalPrice = discount > 0 ? Math.floor(originalPrice * (100 - discount) / 100) : originalPrice;
                            const hasDiscount = discount > 0 && finalPrice < originalPrice;
                            
                            return `
                            <button class="pill-button" onclick="installDeckUpgradeOnDeck('memory', ${finalPrice}, '${deck.id}')" style="font-size: 0.6rem; padding: 0.2rem 0.3rem; background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2)); border: 1px solid var(--accent); color: ${getThemeColors().accent}; transition: all 0.2s ease;" onmouseover="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2))'">
                                Память<br><small style="color: ${getThemeColors().text};">${hasDiscount ? `<span style="text-decoration: line-through; color: ${getThemeColors().muted};">${originalPrice}</span> <span style="color: ${getThemeColors().success};">${finalPrice}</span>` : `${originalPrice}`}уе</small>
                            </button>
                            `;
                        })() : `
                            <div style="background: rgba(108, 117, 125, 0.3); border-radius: 6px; padding: 0.2rem; text-align: center; font-size: 0.6rem; color: ${getThemeColors().muted};">Макс</div>
                        `}
                        ${ramUpgrades < 5 ? (() => {
                            const originalPrice = (finalRam + 1) * 1000;
                            const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
                            const discount = blackHackerLevel * 5;
                            const finalPrice = discount > 0 ? Math.floor(originalPrice * (100 - discount) / 100) : originalPrice;
                            const hasDiscount = discount > 0 && finalPrice < originalPrice;
                            
                            return `
                            <button class="pill-button" onclick="installDeckUpgradeOnDeck('ram', ${finalPrice}, '${deck.id}')" style="font-size: 0.6rem; padding: 0.2rem 0.3rem; background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2)); border: 1px solid var(--accent); color: ${getThemeColors().accent}; transition: all 0.2s ease;" onmouseover="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2))'">
                                ОЗУ<br><small style="color: ${getThemeColors().text};">${hasDiscount ? `<span style="text-decoration: line-through; color: ${getThemeColors().muted};">${originalPrice}</span> <span style="color: ${getThemeColors().success};">${finalPrice}</span>` : `${originalPrice}`}уе</small>
                            </button>
                            `;
                        })() : `
                            <div style="background: rgba(108, 117, 125, 0.3); border-radius: 6px; padding: 0.2rem; text-align: center; font-size: 0.6rem; color: ${getThemeColors().muted};">Макс</div>
                        `}
                        ${gridUpgrades < 5 ? (() => {
                            const originalPrice = (finalGrid + 1) * 100;
                            const blackHackerLevel = getProfessionalSkillLevel('Чёрный хакер');
                            const discount = blackHackerLevel * 5;
                            const finalPrice = discount > 0 ? Math.floor(originalPrice * (100 - discount) / 100) : originalPrice;
                            const hasDiscount = discount > 0 && finalPrice < originalPrice;
                            
                            return `
                            <button class="pill-button" onclick="installDeckUpgradeOnDeck('grid', ${finalPrice}, '${deck.id}')" style="font-size: 0.6rem; padding: 0.2rem 0.3rem; background: linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2)); border: 1px solid var(--accent); color: ${getThemeColors().accent}; transition: all 0.2s ease;" onmouseover="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.3), rgba(75, 0, 130, 0.3))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(75, 0, 130, 0.2))'">
                                Сетка<br><small style="color: ${getThemeColors().text};">${hasDiscount ? `<span style="text-decoration: line-through; color: ${getThemeColors().muted};">${originalPrice}</span> <span style="color: ${getThemeColors().success};">${finalPrice}</span>` : `${originalPrice}`}уе</small>
                            </button>
                            `;
                        })() : `
                            <div style="background: rgba(108, 117, 125, 0.3); border-radius: 6px; padding: 0.2rem; text-align: center; font-size: 0.6rem; color: ${getThemeColors().muted};">Макс</div>
                        `}
                    </div>
                </div>
                
                <!-- Модули -->
                ${modules.length > 0 ? `
                    <div style="margin-bottom: 0.5rem; position: relative; z-index: 1;">
                        <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">МОДУЛИ</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.2rem;">
                            ${modules.map(module => `
                                <span style="background: rgba(125, 244, 198, 0.3); border: 1px solid #7DF4C6; border-radius: 4px; padding: 0.1rem 0.3rem; font-size: 0.6rem; color: ${getThemeColors().text};">${module.name}</span>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Щепки -->
                <div style="margin-bottom: 0.5rem; position: relative; z-index: 1;">
                    <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">ЩЕПКИ (${chips.length}/${chipSlots})</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.2rem;">
                        ${Array.from({length: chipSlots}, (_, i) => {
                            const chip = chips[i];
                            return chip ? `
                                <div style="background: rgba(9, 7, 255, 0.3); border: 1px solid #FFC107; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.6rem; max-width: 200px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.1rem;">
                                        <div style="font-weight: 600;">${chip.name}</div>
                                        <button onclick="removeChipFromDeck('${chip.id}')" style="background: rgba(220, 53, 69, 0.3); border: 1px solid #DC3545; border-radius: 3px; color: #DC3545; font-size: 0.5rem; padding: 0.1rem 0.2rem; cursor: pointer;" title="Вытащить щепку">×</button>
                                    </div>
                                    ${chip.programs && chip.programs.length > 0 ? `
                                        <div style="color: ${getThemeColors().text}; font-size: 0.7rem;">
                                            ${chip.programs.map(program => `
                                                <div style="margin-bottom: 0.3rem;">
                                                    <div style="font-weight: 600; color: ${getThemeColors().accent};">• ${program.name}</div>
                                                    ${program.description ? `<div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-top: 0.1rem; line-height: 1.2;">${program.description}</div>` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : chip.content ? `
                                        <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; line-height: 1.2;">Содержимое: ${chip.content.substring(0, 50)}${chip.content.length > 50 ? '...' : ''}</div>
                                    ` : chip.description ? `
                                        <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; line-height: 1.2;">${chip.description}</div>
                                    ` : `
                                        <div style="color: ${getThemeColors().muted}; font-size: 0.5rem;">Пустая</div>
                                    `}
                                </div>
                            ` : `
                                <div style="background: rgba(108, 117, 125, 0.2); border: 1px solid #6C757D; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.6rem; color: ${getThemeColors().muted}; text-align: center; min-width: 60px;">
                                    Пусто
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- Программы -->
                ${(() => {
                    const programs = state.deckPrograms.filter(program => program.installedDeckId == deck.id);
                    const usedMemory = programs.reduce((sum, program) => sum + (program.memory || 1), 0);
                    return programs.length > 0 ? `
                        <div style="margin-bottom: 0.5rem; position: relative; z-index: 1;">
                            <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">
                                ПРОГРАММЫ (Память: ${usedMemory}/${finalMemory})
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                                ${programs.map((program, programIndex) => `
                                    <div style="background: rgba(138, 43, 226, 0.3); border: 1px solid var(--accent); border-radius: 4px; padding: 0.3rem 0.4rem; font-size: 0.8rem; position: relative;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: ${getThemeColors().accent};">${program.name}</div>
                                                ${program.description ? `<div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-top: 0.1rem; line-height: 1.2;">${program.description}</div>` : ''}
                                            </div>
                                            <div style="text-align: right; margin-right: 2rem;">
                                                <div style="color: ${getThemeColors().text}; font-size: 0.7rem;">Память: ${program.memory || 1}</div>
                                                <div style="color: ${getThemeColors().muted}; font-size: 0.6rem;">ОЗУ: ${program.ram}</div>
                                            </div>
                                        </div>
                                        <button onclick="removeProgramFromDeck('${deck.id.toString().replace(/'/g, "\\'")}', ${programIndex})" style="position: absolute; top: 0.3rem; right: 0.3rem; background: rgba(255, 91, 135, 0.2); border: 1px solid var(--danger); border-radius: 4px; color: ${getThemeColors().danger}; padding: 0.2rem 0.4rem; font-size: 0.6rem; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='rgba(255, 91, 135, 0.3)'" onmouseout="this.style.background='rgba(255, 91, 135, 0.2)'" title="Удалить программу безвозвратно">
                                            ✖
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '';
                })()}
                
                <!-- Информация -->
                <div style="border-top: 1px solid rgba(138, 43, 226, 0.3); padding-top: 0.5rem; position: relative; z-index: 1;">
                    ${!deck.isMain ? `
                        <div style="color: ${getThemeColors().muted}; font-size: 0.6rem;">
                            Куплена: ${deck.purchasePrice.toLocaleString()} уе
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('')}
        </div>
    `;
}

// Функция переименования деки
function renameDeck(deckId) {
    const deck = deckId === 'main' ? state.deck : state.decks.find(d => d.id == deckId);
    if (!deck) return;
    
    // Создаем модальное окно для переименования
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Подтвердите действие</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">Введите новое название для деки "${deck.name}":</p>
                <div class="input-group">
                    <input type="text" class="input-field" id="newDeckName" value="${deck.name}" placeholder="Введите название деки" style="width: 100%;">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button muted-button" onclick="closeModal(this)">Отмена</button>
                <button class="pill-button primary-button" onclick="confirmRenameDeck('${deckId}')">OK</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем универсальные обработчики клавиш
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = document.getElementById('newDeckName');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

// Функция подтверждения переименования деки
function confirmRenameDeck(deckId) {
    const newName = document.getElementById('newDeckName').value.trim();
    if (!newName) {
        showModal('Ошибка', 'Введите название деки!');
        return;
    }
    
    const deck = deckId === 'main' ? state.deck : state.decks.find(d => d.id == deckId);
    if (!deck) return;
    
    if (newName === deck.name) {
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        return;
    }
    
    deck.name = newName;
    scheduleSave();
    updateAllDisplays();
    
    // Если это основная дека, обновляем отображение
    if (deckId === 'main') {
        updateDeckDisplay();
    }
    
    // Если открыт поп-ап коллекции дек, обновляем его
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Дека переименована', `Дека переименована в "${deck.name}"!`);
}

// Функция продажи деки
function sellDeck(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;
    
    // Проверяем, что на деке нет программ
    const programsOnDeck = state.deckPrograms.filter(p => p.installedDeckId === deckId);
    if (programsOnDeck.length > 0) {
        showModal('Нельзя продать', 'Сначала удалите все программы с деки перед продажей.');
        return;
    }
    
    // Проверяем, что на деке нет щепок
    const chipsOnDeck = state.deckChips.filter(c => c.installedDeckId === deckId);
    if (chipsOnDeck.length > 0) {
        showModal('Нельзя продать', 'Сначала удалите все щепки с деки перед продажей.');
        return;
    }
    
    // Удаляем улучшения с деки
    const upgradesOnDeck = state.deckGear.filter(item => 
        item.installedDeckId === deckId
    );
    upgradesOnDeck.forEach(upgrade => {
        upgrade.installedDeckId = null;
    });
    
    // Используем скупщика для продажи
    if (typeof initiateSale === 'function') {
        initiateSale(deckId, 'deck');
    } else {
        // Fallback - прямая продажа за половину цены
        const sellPrice = Math.floor(deck.purchasePrice / 2);
        state.money += sellPrice;
        
        // Удаляем деку
        state.decks = state.decks.filter(d => d.id !== deckId);
        
        showModal('Дека продана', `${deck.name} продана за ${sellPrice.toLocaleString()} уе!`);
        scheduleSave();
        updateAllDisplays();
    }
}

// Функция показа улучшений для деки
function showDeckUpgrades(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;
    
    // Получаем доступные улучшения
    const availableUpgrades = state.gear.filter(item => 
        item.type === 'deck_gear' && 
        item.deckGearType === 'upgrade' && 
        !item.installedDeckId
    );
    
    if (availableUpgrades.length === 0) {
        showModal('Нет улучшений', 'У вас нет доступных улучшений для установки.');
        return;
    }
    
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>🔧 Улучшения для ${deck.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 0.5rem;">
                    ${availableUpgrades.map(upgrade => {
                        // Проверяем лимиты
                        const installedUpgrades = state.gear.filter(item => 
                            item.type === 'deck_gear' && 
                            item.deckGearType === 'upgrade' && 
                            item.stat === upgrade.stat && 
                            item.installedDeckId === deckId
                        );
                        
                        const currentValue = deck[upgrade.stat] + installedUpgrades.length;
                        const canInstall = currentValue < upgrade.maxValue;
                        
                        return `
                            <div class="property-item">
                                <div class="property-header">
                                    <div class="property-name">${upgrade.name}</div>
                                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                                        <span style="color: ${getThemeColors().muted}; font-size: 0.8rem;">Текущее: ${currentValue}/${upgrade.maxValue}</span>
                                        <button class="pill-button primary-button" onclick="installDeckUpgrade(${upgrade.id}, ${deckId})" ${!canInstall ? 'disabled' : ''} style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Установить</button>
                                    </div>
                                </div>
                                <div class="property-description">
                                    <div style="font-size: 0.9rem; line-height: 1.4;">
                                        ${upgrade.description}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция установки улучшения на деку
function installDeckUpgrade(upgradeId, deckId) {
    const upgrade = state.gear.find(item => item.id === upgradeId);
    const deck = state.decks.find(d => d.id === deckId);
    
    if (!upgrade || !deck) return;
    
    // Проверяем лимиты
    const installedUpgrades = state.gear.filter(item => 
        item.type === 'deck_gear' && 
        item.deckGearType === 'upgrade' && 
        item.stat === upgrade.stat && 
        item.installedDeckId === deckId
    );
    
    const currentValue = deck[upgrade.stat] + installedUpgrades.length;
    if (currentValue >= upgrade.maxValue) {
        showModal('Достигнут лимит', `Максимальное значение ${upgrade.stat} для этой деки: ${upgrade.maxValue}`);
        return;
    }
    
    // Устанавливаем улучшение
    upgrade.installedDeckId = deckId;
    
    showModal('Улучшение установлено', `${upgrade.name} установлено на ${deck.name}!`);
    scheduleSave();
    updateAllDisplays();
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

// Функция удаления щепки с деки
function removeChipFromDeck(chipId, deckId) {
    const chip = state.deckChips.find(c => c.id === chipId);
    if (!chip) return;
    
    chip.installedDeckId = null;
    
    showModal('Щепка удалена', 'Щепка памяти удалена с деки.');
    scheduleSave();
    updateAllDisplays();
}

// Функция удаления программы с выбором действий
function removeDeckProgramWithChoice(programIndex) {
    const program = state.deckPrograms[programIndex];
    if (!program) return;
    
    showModal('Удаление программы', `Что делать с программой "${program.name}"?`, [
        { 
            text: 'Удалить', 
            class: 'danger-button', 
            onclick: `removeDeckProgram(${programIndex}); closeModal(this)` 
        },
        { 
            text: 'Создать щепку (10 уе)', 
            class: 'primary-button', 
            onclick: `createChipFromProgram(${programIndex}); closeModal(this)` 
        },
        { 
            text: 'Отмена', 
            class: 'muted-button', 
            onclick: 'closeModal(this)' 
        }
    ]);
}

// Функция создания щепки из программы
function createChipFromProgram(programIndex) {
    const program = state.deckPrograms[programIndex];
    if (!program) return;
    
    if (state.money < 10) {
        showModal('Недостаточно средств', 'Нужно 10 уе для создания щепки.');
        return;
    }
    
    // Создаем щепку
    const newChip = {
        id: Date.now(),
        name: `${program.name} (щепка)`,
        programs: [{
            name: program.name,
            ram: program.ram,
            lethal: program.lethal,
            description: program.description
        }],
        content: '',
        installedDeckId: null
    };
    
    state.deckChips.push(newChip);
    state.money -= 10;
    
    // Удаляем программу
    state.deckPrograms.splice(programIndex, 1);
    
    showModal('Щепка создана', `Программа "${program.name}" перенесена на щепку за 10 уе.`);
    scheduleSave();
    updateAllDisplays();
}

// Функция установки улучшения деки
function installDeckUpgrade(stat, price) {
    if (state.money < price) {
        showModal('Недостаточно средств', `У вас ${state.money.toLocaleString()} уе, а нужно ${price.toLocaleString()} уе.`);
        return;
    }
    
    // Создаем модал с выбором деки для улучшения
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>ВЫБОР ДЕКИ</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">Необходимо выбрать деку, на которую установить улучшение!</p>
                <div style="margin-bottom: 1rem;">
                    <div style="margin-bottom: 0.5rem; color: ${getThemeColors().accent}; font-weight: 600;">Выберите деку:</div>
                    <select id="deckSelect" style="width: 100%; padding: 0.75rem; background: var(--bg-primary); border: 2px solid var(--accent); border-radius: 8px; color: ${getThemeColors().text}; font-size: 1rem; box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);">
                        <option value="main">Основная дека (${state.deck.name})</option>
                        ${state.decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button muted-button" onclick="closeModal(this)">Отменить</button>
                <button class="pill-button primary-button" onclick="installDeckUpgradeOnDeck('${stat}', ${price}, document.getElementById('deckSelect').value); closeModal(this)">Установить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    addModalKeyboardHandlers(modal);
}

// Функция установки улучшения на конкретную деку
function installDeckUpgradeOnDeck(stat, price, deckId) {
    // Проверяем лимиты улучшений для выбранной деки
    const installedUpgrades = state.deckGear.filter(item => 
        item.deckGearType === 'upgrade' && 
        item.stat === stat && 
        item.installedDeckId == deckId // Используем == для сравнения строки и числа
    );
    
    const maxUpgrades = 5; // Максимум 5 улучшений каждого типа на деку
    if (installedUpgrades.length >= maxUpgrades) {
        showModal('Достигнут лимит', `Максимальное количество улучшений ${stat} для деки: ${maxUpgrades}`);
        return;
    }
    
    // Создаем улучшение
    const newUpgrade = {
        id: Date.now(),
        name: `Улучшение ${stat === 'memory' ? 'памяти' : stat === 'ram' ? 'ОЗУ' : 'Видимости'}`,
        type: 'deck_gear',
        deckGearType: 'upgrade',
        stat: stat,
        maxUpgrades: maxUpgrades,
        installedDeckId: deckId,
        catalogPrice: price,
        purchasePrice: price,
        itemType: 'purchased'
    };
    
    // Проверяем, что у нас достаточно денег
    if (state.money < price) {
        showModal('Недостаточно денег', `Не хватает ${price - state.money} уе для покупки улучшения.`);
        return;
    }
    
    // Списываем деньги
    state.money -= price;
    
    // Обновляем отображение денег
    updateMoneyDisplay();
    
    // Добавляем улучшение
    state.deckGear.push(newUpgrade);
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: newUpgrade.name,
        price: price,
        category: 'Улучшение деки'
    });
    
    // Находим название деки
    let deckName = 'Неизвестная дека';
    if (deckId === 'main') {
        deckName = state.deck ? state.deck.name : 'Основная дека';
    } else {
        const deck = state.decks.find(d => d.id == deckId); // Используем == для сравнения строки и числа
        if (deck) {
            deckName = deck.name;
        }
    }
    
    showModal('Улучшение установлено', `${newUpgrade.name} установлено на ${deckName}!`);
    
    // Обновляем коллекцию дек если она открыта
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    scheduleSave();
    updateAllDisplays();
    
    // Обновляем отображение деки
    updateDeckDisplay();
}

// Функция удаления щепки с деки
function removeChipFromDeck(chipId) {
    const chip = state.deckChips.find(c => c.id === chipId);
    if (!chip) return;
    
    chip.installedDeckId = null;
    
    // Обновляем отображение
    updateDeckDisplay();
    
    // Если открыт поп-ап коллекции дек, обновляем его
    const collectionModal = document.querySelector('.modal-overlay');
    if (collectionModal && collectionModal.querySelector('#deckCollectionContainer')) {
        renderDeckCollection();
    }
    
    scheduleSave();
    showModal('Щепка извлечена', `&#x2705; Щепка "${chip.name}" извлечена из деки!`);
}

// Функция установки щепки на деку
function installChipOnDeck(chipId) {
    const chip = state.deckChips.find(c => c.id === chipId);
    if (!chip) return;
    
    // Проверяем, есть ли доступные деки
    if (!state.deck && state.decks.length === 0) {
        showModal('Нет дек', 'Купите деку в магазине дек, чтобы установить щепку!');
        return;
    }
    
    // Создаем модал с выбором деки для щепки
    // Используем новую систему с блокировкой скролла
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    // Формируем список дек
    let deckOptions = '';
    if (state.deck) {
        deckOptions += `<option value="main">Основная дека (${state.deck.name})</option>`;
    }
    deckOptions += state.decks.map(deck => `<option value="${deck.id}">${deck.name}</option>`).join('');
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>ВЫБОР ДЕКИ</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">Необходимо выбрать деку, на которую установить щепку!</p>
                <div style="margin-bottom: 1rem;">
                    <div style="margin-bottom: 0.5rem; color: ${getThemeColors().accent}; font-weight: 600;">Выберите деку:</div>
                    <select id="deckSelect" style="width: 100%; padding: 0.75rem; background: var(--bg-primary); border: 2px solid var(--accent); border-radius: 8px; color: ${getThemeColors().text}; font-size: 1rem; box-shadow: 0 0 10px rgba(138, 43, 226, 0.3);">
                        ${deckOptions}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button muted-button" onclick="closeModal(this)">Отменить</button>
                <button class="pill-button primary-button" onclick="installChipOnDeckTarget('${chipId}', document.getElementById('deckSelect').value); closeModal(this)">Установить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    addModalKeyboardHandlers(modal);
}

// Функция установки щепки на конкретную деку

// Заглушка для handleSpecialGearPurchase (определена в gear.js)
function handleSpecialGearPurchase(itemName, itemData) {
    // Эта функция определена в gear.js
    if (typeof window.handleSpecialGearPurchase === 'function') {
        return window.handleSpecialGearPurchase(itemName, itemData);
    }
    return false;
}

// Функция для обновления содержимого модального окна управления имплантами
function updateImplantManagementModal() {
    const modal = document.querySelector('.modal-overlay');
    if (!modal) return;
    
    // Закрываем текущее модальное окно
    closeModal(modal.querySelector('.icon-button'));
    
    // Открываем новое с обновленным содержимым
    setTimeout(() => {
        showImplantsManagement();
    }, 100);
}

// deck.js loaded
// Проверка: функция showDeckShop должна быть доступна
window.showDeckShopTest = function() {
    console.log('✅ showDeckShop доступна для тестирования');
    console.log('typeof showDeckShop:', typeof showDeckShop);
    console.log('showDeckShop === undefined:', showDeckShop === undefined);
    console.log('showDeckShop === null:', showDeckShop === null);
    return typeof showDeckShop === 'function';
};

// Дополнительная проверка сразу после загрузки
console.log('🔍 Проверка showDeckShop сразу после загрузки deck.js:');
console.log('typeof showDeckShop:', typeof showDeckShop);
if (typeof showDeckShop === 'function') {
    console.log('✅ showDeckShop определена как функция');
} else {
    console.error('❌ showDeckShop НЕ определена как функция');
}

// Проверяем, не переопределяется ли функция после загрузки
setTimeout(() => {
    console.log('🔍 Проверка showDeckShop через 1 секунду:');
    console.log('typeof showDeckShop:', typeof showDeckShop);
    if (typeof showDeckShop === 'function') {
        console.log('✅ showDeckShop все еще определена как функция');
    } else {
        console.error('❌ showDeckShop больше НЕ определена как функция - возможно, переопределена!');
    }
}, 1000);
