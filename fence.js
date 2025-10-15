// ============================================================================
// СКУПЩИК (FENCE SHOP)
// ============================================================================

// Закрыть только текущий модал (самый верхний), не затрагивая основной модал скупщика
function closeCurrentModal() {
    const allModals = document.querySelectorAll('.modal-overlay');
    if (allModals.length > 0) {
        // Закрываем самый верхний модал (с наибольшим z-index)
        const topModal = Array.from(allModals).reduce((top, modal) => {
            const topZ = parseInt(top.style.zIndex) || 0;
            const currentZ = parseInt(modal.style.zIndex) || 0;
            return currentZ > topZ ? modal : top;
        });
        topModal.remove();
    }
}

// Открыть каталог скупщика
function showFenceShop() {
    // Закрываем существующий поп-ап скупщика, если он открыт
    const existingFenceModal = document.querySelector('.modal-overlay');
    if (existingFenceModal) {
        const modalTitle = existingFenceModal.querySelector('h3');
        if (modalTitle && modalTitle.textContent.includes('Скупщик')) {
            closeModal(existingFenceModal.querySelector('.icon-button'));
        }
    }
    
    // Собираем все предметы, которые можно продать
    const sellableItems = getSellableItems();
    
    if (sellableItems.length === 0) {
        showAlertModal('Скупщик', 'У вас нет предметов для продажи.');
        return;
    }
    
    // Устанавливаем цены для всех предметов один раз
    sellableItems.forEach(item => {
        getFencePrice(item);
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const itemsHTML = sellableItems.map(item => {
        const fencePrice = getFencePrice(item);
        const catalogPrice = item.price || 0;
        
        return `
            <div class="item-card" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: var(--muted);">${item.category}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--muted); margin-bottom: 0.25rem;">По каталогу</div>
                    <div style="font-weight: 600; color: var(--text);">${catalogPrice} уе</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--muted); margin-bottom: 0.25rem;">Предложение</div>
                    <div style="font-weight: 600; color: var(--success);">${fencePrice} уе</div>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="pill-button success-button" onclick="initiateSaleWithPrice('${item.id}', '${item.type}', ${fencePrice})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Продать</button>
                    <button class="pill-button muted-button" onclick="enterManualPrice('${item.id}', '${item.type}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Мастер назвал цену </button>
                </div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 900px; max-height: 80vh;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6630-3835-4431-b030-326266363466/seafood.png" alt="🦞" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Скупщик — Продажа вещей</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; max-height: calc(80vh - 150px);">
                <div style="padding: 1rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: var(--text); font-size: 0.9rem; margin: 0; line-height: 1.5;">
                        <strong style="color: var(--success);">Скупщик</strong> предлагает случайную цену от 20% до 70% от каталожной.<br>
                        Если у вас есть навык <strong>Торг</strong>, вы можете попробовать договориться о лучшей цене.
                    </p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    ${itemsHTML}
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
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
}

// Получить все предметы, которые можно продать
function getSellableItems() {
    const items = [];
    
    // Оружие
    state.weapons.forEach(weapon => {
        items.push({
            id: weapon.id,
            name: weapon.name,
            price: weapon.price,
            type: 'weapon',
            category: 'Оружие'
        });
    });
    
    // Модули оружия (те, что не установлены)
    state.weapons.forEach(weapon => {
        if (weapon.modules && weapon.modules.length > 0) {
            weapon.modules.forEach((module, idx) => {
                if (!module.installed) {
                    items.push({
                        id: weapon.id + '_module_' + idx,
                        name: module.name + ' (модуль)',
                        price: module.price || 0,
                        type: 'weapon_module',
                        category: 'Модуль оружия',
                        weaponId: weapon.id,
                        moduleIndex: idx
                    });
                }
            });
        }
    });
    
    // Боеприпасы
    state.ammo.forEach(ammo => {
        items.push({
            id: ammo.id,
            name: ammo.name + ' (' + ammo.quantity + ' шт.)',
            price: (ammo.price || 0) * ammo.quantity,
            type: 'ammo',
            category: 'Боеприпасы'
        });
    });
    
    // Снаряжение (кроме пуленепробиваемого щита)
    state.gear.forEach(gear => {
        // Пропускаем пуленепробиваемый щит (цена 0)
        if (gear.price === 0 || gear.price === '0') return;
        
        items.push({
            id: gear.id,
            name: gear.name,
            price: gear.price || 0,
            type: 'gear',
            category: 'Снаряжение'
        });
    });
    
    // Программы деки
    state.deckPrograms.forEach(program => {
        items.push({
            id: program.id,
            name: program.name,
            price: program.price,
            type: 'program',
            category: 'Программа деки'
        });
    });
    
    // Киберимпланты (установленные модули)
    state.installedModules.forEach(module => {
        items.push({
            id: module.id,
            name: module.name,
            price: module.price,
            type: 'implant_module',
            category: 'Модуль импланта'
        });
    });
    
    // Части имплантов (не установленные)
    // Проходим по всем имплантам
    Object.keys(state.implants).forEach(implantType => {
        const implant = state.implants[implantType];
        if (implant.parts) {
            Object.keys(implant.parts).forEach(partKey => {
                const part = implant.parts[partKey];
                if (part && !implant.installed) {
                    items.push({
                        id: implantType + '_' + partKey,
                        name: part.name || 'Часть импланта',
                        price: part.price || 0,
                        type: 'implant_part',
                        category: 'Часть импланта',
                        implantType: implantType,
                        partKey: partKey
                    });
                }
            });
        }
    });
    
    // Модули транспорта (не установленные)
    state.property.vehicles.forEach(vehicle => {
        if (vehicle.modules && vehicle.modules.length > 0) {
            vehicle.modules.forEach((module, idx) => {
                if (!module.installed) {
                    items.push({
                        id: vehicle.id + '_module_' + idx,
                        name: module.name + ' (модуль транспорта)',
                        price: module.price || 0,
                        type: 'vehicle_module',
                        category: 'Модуль транспорта',
                        vehicleId: vehicle.id,
                        moduleIndex: idx
                    });
                }
            });
        }
    });
    
    // Деки (кроме основной)
    state.decks.forEach(deck => {
        items.push({
            id: deck.id,
            name: deck.name,
            price: Math.floor(deck.purchasePrice / 2), // Продаем за половину цены
            type: 'deck',
            category: 'Дека',
            catalogPrice: deck.catalogPrice,
            purchasePrice: deck.purchasePrice,
            itemType: deck.itemType
        });
    });
    
    // Основная дека (продается за 0 уе) - только если она существует
    if (state.deck && state.deck.name) {
        items.push({
            id: 'main_deck',
            name: state.deck.name + ' (основная)',
            price: 0, // Продается за 0 уе
            type: 'main_deck',
            category: 'Дека',
            catalogPrice: 0,
            purchasePrice: 0,
            itemType: 'main_deck'
        });
    }
    
    // Транспорт
    state.property.vehicles.forEach(vehicle => {
        // Определяем цену продажи
        let sellPrice;
        if (vehicle.itemType === 'free_default') {
            // Для стартового транспорта продаем за половину каталожной цены
            sellPrice = Math.floor(vehicle.catalogPrice / 2);
        } else {
            // Для купленного транспорта продаем за половину цены покупки
            sellPrice = Math.floor(vehicle.purchasePrice / 2);
        }
        
        items.push({
            id: vehicle.id,
            name: vehicle.name,
            price: sellPrice,
            type: 'vehicle',
            category: 'Транспорт',
            catalogPrice: vehicle.catalogPrice,
            purchasePrice: vehicle.purchasePrice,
            itemType: vehicle.itemType
        });
    });
    
    return items;
}

// Получить цену скупщика для предмета
function getFencePrice(item) {
    const itemKey = item.id + '_' + item.type;
    
    // Если цена уже установлена, возвращаем её
    if (state.fenceShop.itemPrices[itemKey] !== undefined) {
        return state.fenceShop.itemPrices[itemKey];
    }
    
    // Для предметов "подобрать с пола" (price = 0 или undefined) возвращаем 0
    if (!item.price || item.price === 0) {
        state.fenceShop.itemPrices[itemKey] = 0;
        scheduleSave();
        return 0;
    }
    
    // Устанавливаем случайную цену от 20% до 70%
    const catalogPrice = item.price;
    const percentage = 0.2 + Math.random() * 0.5; // 0.2 - 0.7
    const fencePrice = Math.floor(catalogPrice * percentage);
    
    // Сохраняем цену
    state.fenceShop.itemPrices[itemKey] = fencePrice;
    scheduleSave();
    
    return fencePrice;
}

// Начать процесс продажи с указанной ценой
function initiateSaleWithPrice(itemId, itemType, fencePrice) {
    const item = findItemById(itemId, itemType);
    if (!item) {
        showAlertModal('Ошибка', 'Предмет не найден.');
        return;
    }
    
    // Для дек используем переданную цену скупщика
    if (itemType === 'deck' || itemType === 'main_deck') {
        // Для основной деки всегда продаем за 0 уе
        const salePrice = itemType === 'main_deck' ? 0 : fencePrice;
        confirmSale(item, itemId, itemType, salePrice);
        return;
    }
    
    // Для предметов с ценой 0 (подобрано с пола) - запрашиваем цену
    if (!item.price || item.price === 0) {
        enterManualPrice(itemId, itemType);
        return;
    }
    
    // Проверяем наличие навыка "Торг"
    const bargainSkill = state.skills.find(s => s.name === 'Торг' || (s.customName && s.customName === 'Торг'));
    
    if (bargainSkill && bargainSkill.level > 0) {
        // Есть навык Торг - предлагаем поторговаться с базовой ценой
        showBargainChoiceWithPrice(item, itemId, itemType, fencePrice);
    } else {
        // Нет навыка Торг - продаём по переданной цене
        confirmSale(item, itemId, itemType, fencePrice);
    }
}

// Показать выбор: торговаться или продать сразу (с указанной ценой)
function showBargainChoiceWithPrice(item, itemId, itemType, baseFencePrice) {
    // Для основной деки запрещаем торг
    if (itemType === 'main_deck') {
        showAlertModal('Ошибка', 'Основную деку нельзя продать за произвольную цену. Используйте кнопку "Продать" для продажи за 0 уе.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Хотите поторговаться?</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">
                    У вас есть навык <strong>Торг</strong>. Хотите попробовать договориться о лучшей цене?
                </p>
                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">Текущее предложение:</div>
                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--text);">${baseFencePrice} уе</div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button" onclick="confirmSaleDirect('${itemId}', '${itemType}', ${baseFencePrice}); closeModal(this)">Продать за ${baseFencePrice} уе</button>
                <button class="pill-button primary-button" onclick="startBargain('${itemId}', '${itemType}', ${baseFencePrice})">Поторговаться</button>
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
}

// Начать торг
function startBargaining(itemId, itemType) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Торг со скупщиком</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">
                    Мастер должен бросить <strong>2d10</strong> для определения Сложности (СЛ) торга.
                </p>
                
                <div style="margin-bottom: 1.5rem;">
                    <button class="pill-button primary-button" onclick="rollDifficultyForBargain()" style="width: 100%;">
                        🎲 Бросить 2d10 для СЛ
                    </button>
                    <div id="difficultyResult" style="margin-top: 0.5rem; text-align: center; font-size: 1.2rem; font-weight: 600; color: var(--accent);"></div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label class="input-label">Или введите СЛ вручную (если мастер уже бросил):</label>
                    <input type="number" class="input-field" id="manualDifficulty" placeholder="СЛ" min="2" max="20">
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <button class="pill-button success-button" onclick="performBargainCheck('${itemId}', '${itemType}')" style="width: 100%;">
                        Сделать проверку Торга
                    </button>
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
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
}

// Бросить 2d10 для определения СЛ
function rollDifficultyForBargain() {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const total = d1 + d2;
    
    const resultDiv = document.getElementById('difficultyResult');
    if (resultDiv) {
        resultDiv.textContent = `СЛ = ${d1} + ${d2} = ${total}`;
    }
    
    // Автоматически заполняем поле
    const manualInput = document.getElementById('manualDifficulty');
    if (manualInput) {
        manualInput.value = total;
    }
}

// Выполнить проверку Торга
function performBargainCheck(itemId, itemType) {
    const difficultyInput = document.getElementById('manualDifficulty');
    const difficulty = parseInt(difficultyInput?.value);
    
    if (!difficulty || difficulty < 2 || difficulty > 20) {
        showAlertModal('Ошибка', 'Пожалуйста, введите корректную СЛ (от 2 до 20).');
        return;
    }
    
    // Находим навык Торг
    const bargainSkill = state.skills.find(s => s.name === 'Торг' || (s.customName && s.customName === 'Торг'));
    const bargainLevel = bargainSkill ? bargainSkill.level : 0;
    
    // Бросаем 2d6 БЕЗ ХАРАКТЕРИСТИКИ
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const diceTotal = d1 + d2;
    
    const checkResult = bargainLevel + diceTotal;
    const success = checkResult > difficulty;
    
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
    
    // Показываем результат проверки
    showBargainResult(itemId, itemType, {
        bargainLevel,
        dice: [d1, d2],
        diceTotal,
        checkResult,
        difficulty,
        success
    });
}

// Показать результат торга
function showBargainResult(itemId, itemType, checkData) {
    const item = findItemById(itemId, itemType);
    if (!item) return;
    
    const { bargainLevel, dice, diceTotal, checkResult, difficulty, success } = checkData;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const resultText = success 
        ? `<div style="color: var(--success); font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">✓ УСПЕХ!</div>`
        : `<div style="color: var(--danger); font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">✗ ПРОВАЛ</div>`;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Результат торга</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                ${resultText}
                <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-family: monospace;">
                    <div>Торг (${bargainLevel}) + 2d6 (${dice[0]} + ${dice[1]} = ${diceTotal}) = <strong>${checkResult}</strong></div>
                    <div>СЛ: <strong>${difficulty}</strong></div>
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid var(--border);">
                        Результат: ${checkResult} ${success ? '>' : '≤'} ${difficulty}
                    </div>
                </div>
                
                <p style="color: var(--text); margin-bottom: 1rem;">
                    Теперь укажите уровень вашего профессионального навыка <strong>Решала</strong>:
                </p>
                
                <div style="margin-bottom: 1.5rem;">
                    <label class="input-label">Уровень Решалы (1-10):</label>
                    <input type="number" class="input-field" id="fixerLevel" placeholder="Уровень" min="1" max="10" value="1">
                </div>
                
                <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; font-size: 0.85rem;">
                    <strong>Модификатор цены по уровню Решалы:</strong><br>
                    1-2: ±10% | 3-4: ±20% | 5-6: ±30% | 7: ±40% | 8-9: ±50% | 10: ±100% (или 1уе при провале)
                </div>
                
                <button class="pill-button primary-button" onclick="calculateFinalPrice('${itemId}', '${itemType}', ${success}, ${JSON.stringify(checkData).replace(/"/g, '&quot;')})" style="width: 100%;">
                    Рассчитать итоговую цену
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
    
    // Добавляем универсальные обработчики клавиш
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
}

// Рассчитать итоговую цену с учётом уровня Решалы
function calculateFinalPrice(itemId, itemType, success, checkData) {
    const item = findItemById(itemId, itemType);
    if (!item) return;
    
    const fixerLevelInput = document.getElementById('fixerLevel');
    const fixerLevel = parseInt(fixerLevelInput?.value) || 1;
    
    if (fixerLevel < 1 || fixerLevel > 10) {
        showAlertModal('Ошибка', 'Уровень Решалы должен быть от 1 до 10.');
        return;
    }
    
    const baseFencePrice = getFencePrice(item);
    let finalPrice = baseFencePrice;
    
    // Определяем модификатор по уровню Решалы
    let modifier = 0;
    if (fixerLevel >= 1 && fixerLevel <= 2) modifier = 0.10;
    else if (fixerLevel >= 3 && fixerLevel <= 4) modifier = 0.20;
    else if (fixerLevel >= 5 && fixerLevel <= 6) modifier = 0.30;
    else if (fixerLevel === 7) modifier = 0.40;
    else if (fixerLevel >= 8 && fixerLevel <= 9) modifier = 0.50;
    else if (fixerLevel === 10) modifier = 1.00;
    
    if (success) {
        // Успех - добавляем к цене
        finalPrice = Math.floor(baseFencePrice * (1 + modifier));
    } else {
        // Провал - вычитаем из цены
        if (fixerLevel === 10) {
            // При 10 уровне и провале - отдаём за 1уе
            finalPrice = 1;
        } else {
            finalPrice = Math.floor(baseFencePrice * (1 - modifier));
            if (finalPrice < 1) finalPrice = 1; // Минимум 1уе
        }
    }
    
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
    
    // Подтверждаем продажу
    confirmSale(item, itemId, itemType, finalPrice, {
        baseFencePrice,
        modifier: (modifier * 100).toFixed(0) + '%',
        fixerLevel,
        success,
        checkData
    });
}

// Ручной ввод цены мастером
function enterManualPrice(itemId, itemType) {
    const item = findItemById(itemId, itemType);
    if (!item) return;
    
    // Для основной деки запрещаем ручной ввод цены
    if (itemType === 'main_deck') {
        showAlertModal('Ошибка', 'Основную деку нельзя продать за произвольную цену. Используйте кнопку "Продать" для продажи за 0 уе.');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Ручной ввод цены</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">
                    Мастер определил цену для <strong>${item.name}</strong>.
                </p>
                
                <div style="margin-bottom: 1.5rem;">
                    <label class="input-label">Цена продажи (уе):</label>
                    <input type="number" class="input-field" id="manualSalePrice" placeholder="Цена" min="0">
                </div>
                
                <button class="pill-button primary-button" onclick="confirmManualSale('${itemId}', '${itemType}')" style="width: 100%;">
                    Продать за указанную цену
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
    
    // Добавляем универсальные обработчики клавиш
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
}

// Подтвердить продажу по ручной цене
function confirmManualSale(itemId, itemType) {
    // Для основной деки запрещаем ручной ввод цены
    if (itemType === 'main_deck') {
        showAlertModal('Ошибка', 'Основную деку нельзя продать за произвольную цену. Используйте кнопку "Продать" для продажи за 0 уе.');
        return;
    }
    
    const priceInput = document.getElementById('manualSalePrice');
    const price = parseInt(priceInput?.value);
    
    if (price < 0 || isNaN(price)) {
        showAlertModal('Ошибка', 'Введите корректную цену.');
        return;
    }
    
    const item = findItemById(itemId, itemType);
    if (!item) return;
    
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
    
    // Подтверждаем продажу
    confirmSale(item, itemId, itemType, price);
}

// Подтвердить продажу
function confirmSale(item, itemId, itemType, price, bargainDetails = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let detailsHTML = '';
    if (bargainDetails) {
        detailsHTML = `
            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; font-size: 0.85rem;">
                <strong>Детали торга:</strong><br>
                Базовая цена скупщика: ${bargainDetails.baseFencePrice} уе<br>
                Результат проверки: ${bargainDetails.success ? 'Успех ✓' : 'Провал ✗'}<br>
                Уровень Решалы: ${bargainDetails.fixerLevel}<br>
                Модификатор: ${bargainDetails.success ? '+' : '-'}${bargainDetails.modifier}
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Подтвердите продажу</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                ${detailsHTML}
                <p style="color: var(--text); margin-bottom: 1.5rem;">
                    Продать <strong>${item.name}</strong> за <strong style="color: var(--success); font-size: 1.2rem;">${price} уе</strong>?
                </p>
                
                <div style="display: flex; gap: 1rem;">
                    <button class="pill-button danger-button" onclick="closeCurrentModal()" style="flex: 1;">Отмена</button>
                    <button class="pill-button success-button" onclick="executeSale('${itemId}', '${itemType}', ${price})" style="flex: 1;">Продать</button>
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
    if (typeof addModalKeyboardHandlers === 'function') {
        addModalKeyboardHandlers(modal);
    }
}

// Выполнить продажу
function executeSale(itemId, itemType, price) {
    const item = findItemById(itemId, itemType);
    if (!item) {
        showAlertModal('Ошибка', 'Предмет не найден.');
        return;
    }
    
    // Удаляем предмет из инвентаря
    removeItemFromInventory(itemId, itemType);
    
    // Добавляем деньги
    state.money += price;
    updateMoneyDisplay();
    
    // Удаляем установленную цену для этого предмета
    const itemKey = itemId + '_' + itemType;
    delete state.fenceShop.itemPrices[itemKey];
    
    // Логируем продажу
    addToRollLog('fence_sale', {
        item: item.name,
        price: price
    });
    
    scheduleSave();
    
    // Закрываем поп-ап "Подтвердите продажу"
    closeCurrentModal();
    
    // Обновляем ассортимент скупщика
    updateFenceShop();
    
    // Показываем уведомление
    showAlertModal('Продано!', `Вы продали <strong>${item.name}</strong> за <strong>${price} уе</strong>.`);
}

// Найти предмет по ID и типу
function findItemById(itemId, itemType) {
    let foundItem = null;
    
    switch(itemType) {
        case 'weapon':
            foundItem = state.weapons.find(w => w.id === itemId);
            break;
        case 'weapon_module':
            const parts = itemId.split('_module_');
            const weaponId = parts[0];
            const moduleIdx = parseInt(parts[1]);
            const weapon = state.weapons.find(w => w.id === weaponId);
            if (weapon && weapon.modules && weapon.modules[moduleIdx]) {
                foundItem = {
                    ...weapon.modules[moduleIdx],
                    weaponId: weaponId,
                    moduleIndex: moduleIdx
                };
            }
            break;
        case 'ammo':
            foundItem = state.ammo.find(a => a.id === itemId);
            break;
        case 'gear':
            foundItem = state.gear.find(g => g.id === itemId);
            break;
        case 'program':
            foundItem = state.deckPrograms.find(p => p.id === itemId);
            break;
        case 'implant_module':
            foundItem = state.installedModules.find(m => m.id === itemId);
            break;
        case 'implant_part':
            const [implantType, partKey] = itemId.split('_').slice(0, 2);
            const implant = state.implants[implantType];
            if (implant && implant.parts && implant.parts[partKey]) {
                foundItem = {
                    ...implant.parts[partKey],
                    implantType: implantType,
                    partKey: partKey
                };
            }
            break;
        case 'vehicle_module':
            const vParts = itemId.split('_module_');
            const vehicleId = vParts[0];
            const vModuleIdx = parseInt(vParts[1]);
            const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
            if (vehicle && vehicle.modules && vehicle.modules[vModuleIdx]) {
                foundItem = {
                    ...vehicle.modules[vModuleIdx],
                    vehicleId: vehicleId,
                    moduleIndex: vModuleIdx
                };
            }
            break;
        case 'deck':
            foundItem = state.decks.find(d => d.id == itemId); // Используем == вместо === для сравнения строки и числа
            break;
        case 'main_deck':
            foundItem = state.deck; // Может быть null если уже продана
            break;
        case 'vehicle':
            foundItem = state.property.vehicles.find(v => v.id === itemId);
            break;
    }
    
    return foundItem;
}

// Удалить предмет из инвентаря
function removeItemFromInventory(itemId, itemType) {
    switch(itemType) {
        case 'weapon':
            state.weapons = state.weapons.filter(w => w.id !== itemId);
            renderWeapons();
            break;
        case 'weapon_module':
            const parts = itemId.split('_module_');
            const weaponId = parts[0];
            const moduleIdx = parseInt(parts[1]);
            const weapon = state.weapons.find(w => w.id === weaponId);
            if (weapon && weapon.modules) {
                weapon.modules.splice(moduleIdx, 1);
                renderWeapons();
            }
            break;
        case 'ammo':
            state.ammo = state.ammo.filter(a => a.id !== itemId);
            renderAmmo();
            break;
        case 'gear':
            state.gear = state.gear.filter(g => g.id !== itemId);
            renderGear();
            break;
        case 'program':
            state.deckPrograms = state.deckPrograms.filter(p => p.id !== itemId);
            renderDeckPrograms();
            break;
        case 'implant_module':
            state.installedModules = state.installedModules.filter(m => m.id !== itemId);
            renderImplants();
            break;
        case 'implant_part':
            const [implantType, partKey] = itemId.split('_').slice(0, 2);
            const implant = state.implants[implantType];
            if (implant && implant.parts) {
                implant.parts[partKey] = null;
            }
            break;
        case 'vehicle_module':
            const vParts = itemId.split('_module_');
            const vehicleId = vParts[0];
            const vModuleIdx = parseInt(vParts[1]);
            const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
            if (vehicle && vehicle.modules) {
                vehicle.modules.splice(vModuleIdx, 1);
                renderVehicles();
            }
            break;
        case 'deck':
            // Проверяем, что на деке нет программ
            const deckPrograms = state.deckPrograms.filter(p => p.installedDeckId == itemId); // Используем == для сравнения строки и числа
            if (deckPrograms.length > 0) {
                showAlertModal('Нельзя продать', 'Нельзя продать деку с установленными программами. Сначала удалите все программы.');
                return;
            }
            
            // Удаляем деку из коллекции
            state.decks = state.decks.filter(d => d.id != itemId); // Используем != для сравнения строки и числа
            
            // Обновляем отображение коллекции дек (если открыто)
            if (typeof renderDeckCollection === 'function') {
                renderDeckCollection();
            }
            break;
        case 'main_deck':
            // Проверяем, что на основной деке нет программ
            const mainDeckPrograms = state.deckPrograms.filter(p => p.installedDeckId === 'main');
            if (mainDeckPrograms.length > 0) {
                showAlertModal('Нельзя продать', 'Нельзя продать деку с установленными программами. Сначала удалите все программы.');
                return;
            }
            
            // Удаляем основную деку полностью (сбрасываем к null)
            state.deck = null;
            
            // Обновляем отображение
            if (typeof updateDeckDisplay === 'function') {
                updateDeckDisplay();
            }
            if (typeof renderDeckCollection === 'function') {
                renderDeckCollection();
            }
            break;
        case 'vehicle':
            // Удаляем транспорт из списка
            state.property.vehicles = state.property.vehicles.filter(v => v.id !== itemId);
            
            // Обновляем отображение транспорта
            if (typeof renderVehicles === 'function') {
                renderVehicles();
            }
            break;
    }
}

// Прямая продажа без подтверждения
function confirmSaleDirect(itemId, itemType, price) {
    const item = findItemById(itemId, itemType);
    if (!item) {
        showAlertModal('Ошибка', 'Предмет не найден.');
        return;
    }
    
    // Удаляем предмет из инвентаря
    removeItemFromInventory(itemId, itemType);
    
    // Добавляем деньги
    state.money += price;
    updateMoneyDisplay();
    
    // Удаляем установленную цену для этого предмета
    const itemKey = itemId + '_' + itemType;
    delete state.fenceShop.itemPrices[itemKey];
    
    // Логируем продажу
    addToRollLog('fence_sale', {
        item: item.name,
        price: price
    });
    
    scheduleSave();
    
    // Обновляем ассортимент скупщика
    updateFenceShop();
    
    // Показываем уведомление
    showAlertModal('Продано!', `Вы продали <strong>${item.name}</strong> за <strong>${price} уе</strong>.`);
}

// Функция обновления ассортимента скупщика
function updateFenceShop() {
    // Находим открытый поп-ап скупщика
    const fenceModal = document.querySelector('.modal-overlay');
    if (!fenceModal) return;
    
    // Проверяем, что это именно поп-ап скупщика
    const modalTitle = fenceModal.querySelector('h3');
    if (!modalTitle || !modalTitle.textContent.includes('Скупщик')) return;
    
    // Собираем новые предметы для продажи
    const sellableItems = getSellableItems();
    
    if (sellableItems.length === 0) {
        // Если предметов нет, закрываем поп-ап
        closeModal(fenceModal.querySelector('.icon-button'));
        showAlertModal('Скупщик', 'У вас больше нет предметов для продажи.');
        return;
    }
    
    // Устанавливаем цены для всех предметов
    sellableItems.forEach(item => {
        getFencePrice(item);
    });
    
    // Создаем новый HTML для предметов
    const itemsHTML = sellableItems.map(item => {
        const fencePrice = getFencePrice(item);
        const catalogPrice = item.price || 0;
        
        return `
            <div class="item-card" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 1rem; padding: 1rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; align-items: center;">
                <div>
                    <div style="font-weight: 600; color: var(--text); margin-bottom: 0.25rem;">${item.name}</div>
                    <div style="font-size: 0.8rem; color: var(--muted);">${item.category}</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--muted); margin-bottom: 0.25rem;">По каталогу</div>
                    <div style="font-weight: 600; color: var(--text);">${catalogPrice} уе</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--muted); margin-bottom: 0.25rem;">Предложение</div>
                    <div style="font-weight: 600; color: var(--success);">${fencePrice} уе</div>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="pill-button success-button" onclick="initiateSaleWithPrice('${item.id}', '${item.type}', ${fencePrice})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Продать</button>
                    <button class="pill-button muted-button" onclick="enterManualPrice('${item.id}', '${item.type}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">Мастер назвал цену </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Обновляем содержимое поп-апа
    const modalBody = fenceModal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="padding: 1rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; margin-bottom: 1.5rem;">
                <p style="color: var(--text); font-size: 0.9rem; margin: 0; line-height: 1.5;">
                    <strong style="color: var(--success);">Скупщик</strong> предлагает случайную цену от 20% до 70% от каталожной.<br>
                    Если у вас есть навык <strong>Торг</strong>, вы можете попробовать договориться о лучшей цене.
                </p>
            </div>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${itemsHTML}
            </div>
        `;
    }
}

console.log('Fence.js loaded - Скупщик готов к работе');

