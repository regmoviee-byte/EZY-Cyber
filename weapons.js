// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ОРУЖИЕМ
// Покупка, отображение, управление, броски урона, модули оружия
// ============================================================================

console.log('🔫 weapons.js loading...');

// Функции покупки оружия ближнего боя
function buyMeleeWeapon(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Нищим не продаём. Вали отсюда!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
  
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем оружие
    const newWeapon = {
        id: generateId('weapon'),
        name: type,
        customName: '', // Дополнительное название
        type: 'melee',
        damage: damage,
        concealable: concealable,
        stealthPenalty: stealthPenalty,
        examples: examples,
        price: price,
        load: load,
        modules: [],
        slots: 1, // У ОББ всегда 1 слот
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.weapons.push(newWeapon);
    renderWeapons();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: price,
        category: 'Оружие ближнего боя'
    });
    
    showModal('Оружие куплено', `&#x2705; ${type} добавлено в блок Оружие!`);
}

function buyMeleeWeaponToGear(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Нищим не продаём. Вали отсюда!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
 
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон: ${damage} | Можно скрыть: ${formatYesNo(concealable)} | Штраф к СКА: ${stealthPenalty} | Примеры: ${examples}`,
        price: price,
        load: load,
        type: 'weapon',
        weaponData: {
            type: 'melee',
            damage: damage,
            concealable: concealable,
            stealthPenalty: stealthPenalty,
            examples: examples
        },
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: price,
        category: 'Оружие ближнего боя (в сумку)'
    });
    
    showModal('Оружие куплено', `&#x2705; ${type} добавлено в Снаряжение!`);
}

function getMeleeWeaponFree(type, load, damage, concealable, stealthPenalty, examples) {

    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем в снаряжение бесплатно
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон: ${damage} | Можно скрыть: ${formatYesNo(concealable)} | Штраф к СКА: ${stealthPenalty} | Примеры: ${examples}`,
        price: 0,
        load: load,
        type: 'weapon',
        weaponData: {
            type: 'melee',
            damage: damage,
            concealable: concealable,
            stealthPenalty: stealthPenalty,
            examples: examples
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    showModal('Оружие получено', `&#x2705; ${type} добавлено в Снаряжение бесплатно!`);
}

// Функции покупки оружия дальнего боя
function buyRangedWeapon(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Нищим не продаём. Вали отсюда!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    

  
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Определяем количество слотов для модулей
    const slots = getRangedWeaponSlots(type);
    
    // Добавляем оружие
    const newWeapon = {
        id: generateId('weapon'),
        name: type,
        customName: '', // Дополнительное название
        type: 'ranged',
        primaryDamage: primaryDamage,
        altDamage: altDamage,
        concealable: concealable,
        hands: hands,
        stealth: stealth,
        magazine: magazine,
        price: catalogPrice || price,  // Используем каталожную цену если есть
        catalogPrice: catalogPrice,     // Сохраняем каталожную цену отдельно
        purchasePrice: price,          // Сохраняем цену покупки (0 если бесплатно)
        itemType: price === 0 && catalogPrice > 0 ? 'free_catalog' : 'catalog',  // Маркер для скупщика
        load: load,
        modules: [],
        slots: slots,
        // Система магазина
        maxAmmo: parseInt(magazine),
        currentAmmo: 0,
        loadedAmmoType: null,
        // Тип оружия для боеприпасов
        weaponTypeForAmmo: getWeaponTypeForAmmo(type),
        // Особая система для дробовиков
        isShotgun: type.includes('Дробовик'),
        shotgunAmmo1: { type: null, count: 0 }, // Первый тип патронов (до 3 шт)
        shotgunAmmo2: { type: null, count: 0 }  // Второй тип патронов (до 3 шт)
    };
    
    state.weapons.push(newWeapon);
    renderWeapons();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: price,
        category: 'Оружие дальнего боя'
    });
    
    showModal('Оружие куплено', `&#x2705; ${type} добавлено в блок Оружие!`);
}

function buyRangedWeaponToGear(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Нищим не продаём. Вали отсюда!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
  
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${formatYesNo(concealable)} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine}`,
        price: catalogPrice || price,  // Используем каталожную цену если есть
        catalogPrice: catalogPrice,     // Сохраняем каталожную цену отдельно
        purchasePrice: price,          // Сохраняем цену покупки (0 если бесплатно)
        load: load,
        type: price === 0 && catalogPrice > 0 ? 'free_catalog' : 'weapon',
        weaponData: {
            type: 'ranged',
            primaryDamage: primaryDamage,
            altDamage: altDamage,
            concealable: concealable,
            hands: hands,
            stealth: stealth,
            magazine: magazine
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: price,
        category: 'Оружие дальнего боя (в сумку)'
    });
    
    showModal('Оружие куплено', `&#x2705; ${type} добавлено в Снаряжение!`);
}

function getRangedWeaponFree(type, load, primaryDamage, altDamage, concealable, hands, stealth, magazine) {
 
    
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем в снаряжение бесплатно
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${formatYesNo(concealable)} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine}`,
        price: 0,
        load: load,
        type: 'weapon',
        weaponData: {
            type: 'ranged',
            primaryDamage: primaryDamage,
            altDamage: altDamage,
            concealable: concealable,
            hands: hands,
            stealth: stealth,
            magazine: magazine
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    showModal('Оружие получено', `&#x2705; ${type} добавлено в Снаряжение бесплатно!`);
}

function toggleMeleeWeaponsFreeMode() {
    const buyButtons = document.querySelectorAll('.melee-weapon-buy-button');
    const gearButtons = document.querySelectorAll('.melee-weapon-gear-button');
    const toggleButton = document.getElementById('meleeWeaponsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            btn.setAttribute('onclick', `buyMeleeWeapon('${type}', ${price}, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
        });
        
        gearButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            btn.setAttribute('onclick', `buyMeleeWeaponToGear('${type}', ${price}, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
        });
        
        // Обновляем отображение цен
        const priceElements = document.querySelectorAll('.melee-weapon-price');
        priceElements.forEach(el => {
            const originalPrice = el.getAttribute('data-original-price');
            el.textContent = `Цена: ${originalPrice} уе | Нагрузка: ${el.getAttribute('data-load')}`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            btn.setAttribute('onclick', `buyMeleeWeapon('${type}', 0, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
        });
        
        gearButtons.forEach(btn => {
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const damage = btn.getAttribute('data-damage');
            const concealable = btn.getAttribute('data-concealable');
            const stealthPenalty = btn.getAttribute('data-stealth-penalty');
            const examples = btn.getAttribute('data-examples');
            btn.setAttribute('onclick', `buyMeleeWeaponToGear('${type}', 0, ${load}, '${damage}', ${concealable}, '${stealthPenalty}', '${examples}')`);
        });
        
        // Обновляем отображение цен
        const priceElements = document.querySelectorAll('.melee-weapon-price');
        priceElements.forEach(el => {
            el.textContent = `Цена: 0 уе | Нагрузка: ${el.getAttribute('data-load')}`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

// Инициализация кнопок оружия дальнего боя без переключения режима
function initializeRangedWeaponButtons() {
    const buyButtons = document.querySelectorAll('.ranged-weapon-buy-button');
    const gearButtons = document.querySelectorAll('.ranged-weapon-gear-button');
    
    buyButtons.forEach(btn => {
        const originalPrice = btn.getAttribute('data-original-price');
        const type = btn.getAttribute('data-weapon-type');
        const load = btn.getAttribute('data-load');
        const primaryDamage = btn.getAttribute('data-primary-damage');
        const altDamage = btn.getAttribute('data-alt-damage');
        const concealable = btn.getAttribute('data-concealable');
        const hands = btn.getAttribute('data-hands');
        const stealth = btn.getAttribute('data-stealth');
        const magazine = btn.getAttribute('data-magazine');
        btn.setAttribute('onclick', `buyRangedWeapon(${JSON.stringify(type)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
    });
    
    gearButtons.forEach(btn => {
        const originalPrice = btn.getAttribute('data-original-price');
        const type = btn.getAttribute('data-weapon-type');
        const load = btn.getAttribute('data-load');
        const primaryDamage = btn.getAttribute('data-primary-damage');
        const altDamage = btn.getAttribute('data-alt-damage');
        const concealable = btn.getAttribute('data-concealable');
        const hands = btn.getAttribute('data-hands');
        const stealth = btn.getAttribute('data-stealth');
        const magazine = btn.getAttribute('data-magazine');
        btn.setAttribute('onclick', `buyRangedWeaponToGear(${JSON.stringify(type)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
    });
}

function toggleRangedWeaponsFreeMode() {
    const buyButtons = document.querySelectorAll('.ranged-weapon-buy-button');
    const gearButtons = document.querySelectorAll('.ranged-weapon-gear-button');
    const toggleButton = document.getElementById('rangedWeaponsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const originalPrice = btn.getAttribute('data-original-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `buyRangedWeapon(${JSON.stringify(type)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
        });
        
        gearButtons.forEach(btn => {
            const originalPrice = btn.getAttribute('data-original-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `buyRangedWeaponToGear(${JSON.stringify(type)}, ${originalPrice}, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, null)`);
        });
        
        // Обновляем отображение цен
        const priceElements = document.querySelectorAll('.ranged-weapon-price');
        priceElements.forEach(el => {
            const originalPrice = el.getAttribute('data-original-price');
            el.textContent = `Цена: ${originalPrice} уе | Нагрузка: ${el.getAttribute('data-load')}`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const catalogPrice = btn.getAttribute('data-price'); // Каталожная цена
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `buyRangedWeapon(${JSON.stringify(type)}, 0, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, ${catalogPrice})`);
        });
        
        gearButtons.forEach(btn => {
            const catalogPrice = btn.getAttribute('data-price'); // Каталожная цена
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `buyRangedWeaponToGear(${JSON.stringify(type)}, 0, ${load}, ${JSON.stringify(primaryDamage)}, ${JSON.stringify(altDamage)}, ${JSON.stringify(concealable)}, ${JSON.stringify(hands)}, ${stealth}, ${JSON.stringify(magazine)}, ${catalogPrice})`);
        });
        
        // Обновляем отображение цен
        const priceElements = document.querySelectorAll('.ranged-weapon-price');
        priceElements.forEach(el => {
            el.textContent = `Цена: 0 уе | Нагрузка: ${el.getAttribute('data-load')}`;
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

// Функция определения количества слотов для оружия дальнего боя
function getRangedWeaponSlots(type) {
    const slotMap = {
        'Лёгкий пистолет': 1,                'Лёгкий пистолет': 1,
        'Обычный пистолет': 2,
        'Крупнокалиберный пистолет': 3,
        'Пистолет-пулемёт': 2,
        'Тяжёлый пистолет-пулемёт': 3,
        'Штурмовая винтовка': 4,
        'Снайперская винтовка': 1,
        'Пулемёт': 3,
        'Дробовик': 2,
        'Гранатомёт': 1,
        'Ракетомёт': 1,
        'Оружие с самонаведением': 1
    };
    return slotMap[type] || 1;
}

// Функции создания собственного оружия
function createCustomMeleeWeapon() {
    const type = document.getElementById('customMeleeType').value;
    const appearance = document.getElementById('customMeleeAppearance').value;
    const damage = document.getElementById('customMeleeDamage').value;
    const concealable = document.getElementById('customMeleeConcealable').value === 'true';
    const stealthPenalty = document.getElementById('customMeleeStealthPenalty').value;
    const price = parseInt(document.getElementById('customMeleePrice').value) || 0;
    const load = parseInt(document.getElementById('customMeleeLoad').value) || 0;
    const description = document.getElementById('customMeleeDescription').value;
    
    if (!type || !damage || !stealthPenalty || !load) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Заполните все обязательные поля!</p>
            </div>
        `);
        return;
    }
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Внешний вид: ${appearance} | Урон: ${damage} | Можно скрыть: ${formatYesNo(concealable)} | Штраф к СКА: ${stealthPenalty} | ${description}`,
        price: price,
        load: load,
        type: 'weapon',
        weaponData: {
            type: 'melee',
            damage: damage,
            concealable: concealable,
            stealthPenalty: stealthPenalty,
            appearance: appearance,
            customDescription: description
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Оружие создано', `&#x2705; ${type} добавлено в Снаряжение!`);
}

function createCustomRangedWeapon() {
    const type = document.getElementById('customRangedType').value;
    const primaryDamage = document.getElementById('customRangedPrimaryDamage').value;
    const altDamage = document.getElementById('customRangedAltDamage').value;
    const concealable = document.getElementById('customRangedConcealable').value === 'true';
    const hands = parseInt(document.getElementById('customRangedHands').value) || 1;
    const stealth = parseInt(document.getElementById('customRangedStealth').value) || 2;
    const magazine = document.getElementById('customRangedMagazine').value;
    const price = parseInt(document.getElementById('customRangedPrice').value) || 0;
    const load = parseInt(document.getElementById('customRangedLoad').value) || 0;
    const description = document.getElementById('customRangedDescription').value;
    
    if (!type || !primaryDamage || !hands || !stealth || !magazine || !load) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Заполните все обязательные поля!</p>
            </div>
        `);
        return;
    }
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${formatYesNo(concealable)} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine} | ${description}`,
        price: price,
        load: load,
        type: 'weapon',
        weaponData: {
            type: 'ranged',
            primaryDamage: primaryDamage,
            altDamage: altDamage,
            concealable: concealable,
            hands: hands,
            stealth: stealth,
            magazine: magazine,
            customDescription: description
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    showModal('Оружие создано', `&#x2705; ${type} добавлено в Снаряжение!`);
}

// Функция отображения оружия
function renderWeapons() {
    const container = document.getElementById('weaponsContainer');
    if (!container) return;
    
    if (state.weapons.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Оружие не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.weapons.map((weapon, index) => `
        <div class="weapon-item" style="background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().accentLight}; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem; min-height: 120px;">
            <div class="weapon-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
                <div style="flex: 1;">
                    <h4 style="color: ${getThemeColors().accent}; font-size: 0.95rem; margin: 0 0 0.25rem 0;">
                        <span contenteditable="true" onblur="updateWeaponCustomName('${weapon.id}', this.textContent)" style="outline: none; border: none; background: transparent; color: inherit; font-size: inherit; font-weight: inherit;">${weapon.customName || weapon.name}</span>
                    </h4>
                </div>
                <button class="pill-button success-button" onclick="moveWeaponToGear(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; white-space: nowrap;">Сложить в сумку</button>
            </div>
            
            <div class="weapon-damage" style="margin-bottom: 0.5rem;">
                ${weapon.type === 'melee' ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.85rem;">Урон:</span>
                        <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.damage}', '${weapon.name}', '${weapon.type}', '${weapon.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.damage}</button>
                    </div>
                ` : `
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.85rem;">Урон основной:</span>
                        <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.primaryDamage}', '${weapon.name}', '${weapon.type}', '${weapon.id}', 'primary')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.primaryDamage}</button>
                    </div>
                    ${weapon.altDamage ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.85rem;">Урон альтернативный:</span>
                            <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.altDamage}', '${weapon.name}', '${weapon.type}', '${weapon.id}', 'alt')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.altDamage}</button>
                        </div>
                    ` : ''}
                `}
            </div>
            
            <div class="weapon-stats" style="font-family: monospace; font-size: 0.7rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">
                ${weapon.type === 'melee' ? `
                    Можно скрыть: ${formatYesNo(weapon.concealable)} | Штраф к СКА: ${weapon.stealthPenalty}
                ` : `
                    Можно скрыть: ${formatYesNo(weapon.concealable)} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}
                `}
            </div>
            
            ${weapon.type === 'ranged' ? `
                ${weapon.isShotgun ? `
                    <!-- Особая система для дробовиков -->
                    <div class="weapon-magazine" style="margin-bottom: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                            <span style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.85rem;">Патроны в дробовике:</span>
                            <button class="pill-button success-button" onclick="reloadShotgun('${weapon.id}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">&#x1F504; Перезарядить</button>
                        </div>
                        <div style="display: grid; gap: 0.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.75rem; min-width: 50px; text-align: center;">
                                    <span style="color: ${getThemeColors().accent}; font-weight: 600;">${weapon.shotgunAmmo1.count}/3</span>
                                </div>
                                ${weapon.shotgunAmmo1.type ? `
                                    <div style="font-size: 0.7rem; color: ${getThemeColors().success}; font-family: monospace;">
                                        ${weapon.shotgunAmmo1.type}
                                    </div>
                                ` : `
                                    <div style="font-size: 0.7rem; color: ${getThemeColors().muted}; font-style: italic;">
                                        Не заряжено
                                    </div>
                                `}
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.75rem; min-width: 50px; text-align: center;">
                                    <span style="color: ${getThemeColors().accent}; font-weight: 600;">${weapon.shotgunAmmo2.count}/3</span>
                                </div>
                                ${weapon.shotgunAmmo2.type ? `
                                    <div style="font-size: 0.7rem; color: ${getThemeColors().success}; font-family: monospace;">
                                        ${weapon.shotgunAmmo2.type}
                                    </div>
                                ` : `
                                    <div style="font-size: 0.7rem; color: ${getThemeColors().muted}; font-style: italic;">
                                        Не заряжено
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>
                ` : `
                    <!-- Обычная система для остального оружия -->
                    <div class="weapon-magazine" style="margin-bottom: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                            <span style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.85rem;">Патроны в магазине:</span>
                            <button class="pill-button success-button" onclick="reloadWeapon('${weapon.id}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">&#x1F504; Перезарядить</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                <span style="color: ${getThemeColors().accent}; font-weight: 600;">${weapon.currentAmmo || 0}</span>
                                <span style="color: ${getThemeColors().muted};">/</span>
                                <span style="color: ${getThemeColors().text};">${weapon.maxAmmo || weapon.magazine}</span>
                            </div>
                            ${weapon.loadedAmmoType ? `
                                <div style="font-size: 0.75rem; color: ${getThemeColors().success}; font-family: monospace;">
                                    ${weapon.loadedAmmoType}
                                </div>
                            ` : `
                                <div style="font-size: 0.75rem; color: ${getThemeColors().muted}; font-style: italic;">
                                    Не заряжено
                                </div>
                            `}
                        </div>
                    </div>
                `}
            ` : ''}
            
            ${weapon.examples ? `<div class="weapon-examples" style="font-size: 0.75rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;"><strong>Примеры:</strong> ${weapon.examples}</div>` : ''}
            
            ${weapon.slots > 0 ? `
                <div class="weapon-modules">
                    <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.35rem; font-size: 0.85rem;">Слоты для модулей:</div>
                    <div style="display: flex; gap: 0.35rem; margin-bottom: 0.35rem;">
                        ${Array.from({length: weapon.slots}, (_, i) => `
                            <div class="weapon-slot" data-weapon-id="${weapon.id}" data-slot-index="${i}" style="width: 26px; height: 26px; border: 2px solid ${weapon.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; background: ${weapon.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'transparent'}; font-size: 0.75rem;" onclick="manageWeaponModule('${weapon.id}', ${i})">
                                ${weapon.modules[i] ? '✓' : '○'}
                            </div>
                        `).join('')}
                    </div>
                    ${weapon.modules.filter(m => m).map(module => `
                        <div style="font-size: 0.7rem; color: ${getThemeColors().muted}; margin-left: 0.75rem;">
                            • ${module.name}: ${module.description}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div style="font-size: 0.7rem; color: ${getThemeColors().muted}; font-style: italic; margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid rgba(182, 103, 255, 0.1);">
                Если здесь есть оружие, значит вы держите его в руках и окружающие видят его
            </div>
        </div>
    `).join('');
}

// Функция обновления дополнительного названия оружия
function updateWeaponCustomName(weaponId, newName) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (weapon) {
        weapon.customName = newName;
        scheduleSave();
    }
}

// Функция перемещения оружия в снаряжение
function moveWeaponToGear(weaponIndex) {
    const weapon = state.weapons[weaponIndex];
    if (!weapon) return;
    
    // Создаем описание для снаряжения
    let description = '';
    if (weapon.type === 'melee') {
        description = `Урон: ${weapon.damage} | Можно скрыть: ${weapon.concealable ? 'да' : 'нет'} | Штраф к СКА: ${weapon.stealthPenalty}`;
        if (weapon.examples) description += ` | Примеры: ${weapon.examples}`;
    } else {
        description = `Урон основной: ${weapon.primaryDamage} | Урон альтернативный: ${weapon.altDamage} | Можно скрыть: ${weapon.concealable ? 'да' : 'нет'} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}`;
    }
    
    // Добавляем информацию об установленных модулях
    if (weapon.modules.filter(m => m).length > 0) {
        description += ` | Установлено: ${weapon.modules.filter(m => m).map(m => m.name).join(', ')}`;
    }
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: weapon.customName || weapon.name,
        description: description,
        price: weapon.price,
        load: weapon.load,
        type: 'weapon',
        weaponData: weapon
    };
    
    state.gear.push(newGear);
    
    // Удаляем из оружия
    state.weapons.splice(weaponIndex, 1);
    
    renderWeapons();
    renderGear();
    scheduleSave();
    
    showModal('Оружие перемещено', `&#x2705; ${weapon.name} перемещено в Снаряжение!`);
}

// Функция броска урона оружия
function rollWeaponDamage(damageFormula, weaponName, weaponType, weaponId, damageType) {
    // Если это оружие ближнего боя, сразу показываем стандартный бросок
    if (weaponType === 'melee') {
        showStandardDamageRoll(damageFormula, weaponName, weaponId);
        return;
    }
    
    // Для огнестрельного оружия показываем выбор боеприпасов
    showAmmoSelectionModal(damageFormula, weaponName, weaponId, damageType);
}

// Экспортируем функцию в глобальную область видимости
window.rollWeaponDamage = rollWeaponDamage;

function showStandardDamageRoll(damageFormula, weaponName, weaponId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'weaponDamageModal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>&#x2694;&#xFE0F; Атака: ${weaponName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" id="weaponDamageModalBody">
                <div id="weaponSetupSection">
                    <div style="margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.75rem;"><strong>${weaponName}</strong></p>
                        <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                            Формула урона: <strong style="color: ${getThemeColors().accent};">${damageFormula}</strong>
                        </p>
                    </div>
                    
                    <div style="display: grid; gap: 0.75rem;">
                        <label class="field">
                            Модификатор урона
                            <input type="text" class="input-field" id="damageModifier" value="0" placeholder="0">
                        </label>
                    </div>
                </div>
                
                <!-- Секция анимации и результатов -->
                <div id="weaponDamageAnimation" style="display: none;">
                    <div style="text-align: center; padding: 2rem 0;">
                        <div id="weaponDiceDisplay" style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;"></div>
                        <div id="weaponDamageTotal" style="font-size: 2rem; font-weight: 700; color: ${getThemeColors().accent}; margin-bottom: 0.5rem;"></div>
                        <div id="weaponDamageFormula" style="font-size: 0.9rem; color: ${getThemeColors().muted};"></div>
                        <div id="weaponCriticalMessage" style="display: none; margin-top: 1rem; padding: 1rem; background: ${getThemeColors().dangerLight}; border: 2px solid ${getThemeColors().danger}; border-radius: 8px;">
                            <p style="color: #ff0000; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">&#x1FA78; КРИТИЧЕСКАЯ ТРАВМА! &#x1FA78;</p>
                            <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" id="weaponDamageFooter">
                <button class="pill-button primary-button" id="weaponShootButton" onclick="executeMeleeDamageRoll('${damageFormula}', '${weaponName}', '${weaponId}')">
                    &#x2694;&#xFE0F; Атаковать!
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

function executeMeleeDamageRoll(damageFormula, weaponName, weaponId) {
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    // Скрываем секцию настройки и показываем анимацию
    document.getElementById('weaponSetupSection').style.display = 'none';
    document.getElementById('weaponDamageAnimation').style.display = 'block';
    document.getElementById('weaponShootButton').style.display = 'none';
    
    // Выполняем бросок урона с анимацией
    performWeaponDamageRoll(damageFormula, weaponName, modifier, null, null, null, weaponId, null, false, 'single');
}

function showAmmoSelectionModal(damageFormula, weaponName, weaponId, damageType) {
    // Проверяем, это встроенное оружие, оружие на мини-станине или обычное
    let weapon = null;
    let isEmbeddedWeapon = false;
    let isMiniStandWeapon = false;
    let parts = null; // Объявляем parts в более широкой области видимости
    
    if (weaponId.startsWith('embedded_')) {
        // Это встроенное оружие
        isEmbeddedWeapon = true;
        parts = weaponId.replace('embedded_', '').split('_');
        const implantType = parts[0];
        const partName = parts[1];
        const slotIndex = parseInt(parts[2]);
        
        weapon = getImplantModule(implantType, partName, slotIndex);
        if (!weapon) {
            showModal('Ошибка', 'Модуль встроенного оружия не найден!');
            return;
        }
    } else if (weaponId.startsWith('mini_stand_')) {
        // Это оружие на мини-станине
        isMiniStandWeapon = true;
        parts = weaponId.replace('mini_stand_', '').split('_');
        const implantType = parts[0];
        const partName = parts[1];
        const slotIndex = parseInt(parts[2]);
        
        const module = getImplantModule(implantType, partName, slotIndex);
        if (!module || !module.weaponSlot) {
            showModal('Ошибка', 'Оружие на мини-станине не найдено!');
            return;
        }
        weapon = module.weaponSlot;
    } else {
        // Обычное оружие
        weapon = state.weapons.find(w => w.id === weaponId);
        if (!weapon) {
            showModal('Ошибка', 'Оружие не найдено!');
            return;
        }
    }
    
    // Особая обработка для дробовиков
    if (weapon.isShotgun) {
        showShotgunShootingModal(damageFormula, weaponName, weaponId);
        return;
    }
    
    // Проверяем, есть ли патроны в магазине
    if (!weapon.currentAmmo || weapon.currentAmmo <= 0 || !weapon.loadedAmmoType) {
        let reloadFunction;
        if (isEmbeddedWeapon) {
            reloadFunction = `reloadEmbeddedWeapon('${parts[0]}', '${parts[1]}', ${parts[2]})`;
        } else if (isMiniStandWeapon) {
            reloadFunction = `reloadMiniStandWeapon('${parts[0]}', '${parts[1]}', ${parts[2]})`;
        } else {
            reloadFunction = `reloadWeapon('${weaponId}')`;
        }
            
        showModal('Магазин пуст', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Магазин пуст!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Сначала перезарядите оружие</p>
                <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => ${reloadFunction}, 100)">Перезарядить</button>
            </div>
        `);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'weaponDamageModal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    // Определяем тип оружия для автоматического огня
    const weaponTypeForAmmo = getWeaponTypeForAmmo(weaponName);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>&#x1F52B; Стрельба: ${weaponName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" id="weaponDamageModalBody">
                <div id="weaponSetupSection">
                    <div style="margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.75rem;"><strong>${weaponName}</strong></p>
                        <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                            Формула урона: <strong style="color: ${getThemeColors().accent};">${damageFormula}</strong>
                        </p>
                    </div>
                    
                    <!-- Информация о заряженных боеприпасах -->
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px;">
                        <p style="color: ${getThemeColors().success}; font-weight: 600; margin-bottom: 0.5rem;">Заряженные боеприпасы:</p>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                            Тип: <strong>${weapon.loadedAmmoType}</strong> | 
                            Патронов: <strong>${weapon.currentAmmo}/${weapon.maxAmmo}</strong>
                        </p>
                    </div>
                    
                    <!-- Режим огня для автоматического оружия -->
                    ${isAutomaticWeapon(weaponTypeForAmmo) ? `
                        <div style="margin-bottom: 1rem;">
                            <label class="input-label">Режим огня</label>
                            <div style="display: grid; gap: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="fireMode" value="single" checked style="margin: 0;">
                                    <span>Одиночный выстрел (1 патрон)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="fireMode" value="auto" ${getMinAmmoForAuto(weaponTypeForAmmo) > weapon.currentAmmo ? 'disabled' : ''} style="margin: 0;">
                                    <span style="color: ${getMinAmmoForAuto(weaponTypeForAmmo) > weapon.currentAmmo ? 'var(--muted)' : 'var(--text)'};">Автоматический огонь (${getMinAmmoForAuto(weaponTypeForAmmo)} патронов)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                    <input type="radio" name="fireMode" value="suppression" ${getMinAmmoForAuto(weaponTypeForAmmo) > weapon.currentAmmo ? 'disabled' : ''} style="margin: 0;">
                                    <span style="color: ${getMinAmmoForAuto(weaponTypeForAmmo) > weapon.currentAmmo ? 'var(--muted)' : 'var(--text)'};">Огонь на подавление (${getMinAmmoForAuto(weaponTypeForAmmo)} патронов)</span>
                                </label>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div style="display: grid; gap: 0.75rem;">
                        <label class="field">
                            Модификатор урона
                            <input type="text" class="input-field" id="damageModifier" value="0" placeholder="0">
                        </label>
                    </div>
                </div>
                
                <!-- Секция анимации и результатов -->
                <div id="weaponDamageAnimation" style="display: none;">
                    <div style="text-align: center; padding: 2rem 0;">
                        <div id="weaponDiceDisplay" style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem;"></div>
                        <div id="weaponDamageTotal" style="font-size: 2rem; font-weight: 700; color: ${getThemeColors().accent}; margin-bottom: 0.5rem;"></div>
                        <div id="weaponDamageFormula" style="font-size: 0.9rem; color: ${getThemeColors().muted};"></div>
                        <div id="weaponCriticalMessage" style="display: none; margin-top: 1rem; padding: 1rem; background: ${getThemeColors().dangerLight}; border: 2px solid ${getThemeColors().danger}; border-radius: 8px;">
                            <p style="color: #ff0000; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">&#x1FA78; КРИТИЧЕСКАЯ ТРАВМА! &#x1FA78;</p>
                            <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" id="weaponDamageFooter">
                <button class="pill-button primary-button" id="weaponShootButton" onclick="${isEmbeddedWeapon ? `executeEmbeddedWeaponDamageRoll('${damageFormula}', '${weaponName}', '${weaponId}', '${weaponTypeForAmmo}')` : isMiniStandWeapon ? `executeMiniStandWeaponDamageRoll('${damageFormula}', '${weaponName}', '${weaponId}', '${weaponTypeForAmmo}')` : `executeRangedWeaponDamageRoll('${damageFormula}', '${weaponName}', '${weaponId}', '${weaponTypeForAmmo}')`}">
                    &#x1F52B; Стрелять!
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

// Вспомогательные функции для механики стрельбы
function getWeaponTypeForAmmo(weaponName) {
    // Определяем тип оружия по названию для поиска боеприпасов
    const weaponTypeMappings = {
        // Пистолеты
        'Лёгкий пистолет': 'Лёгкий пистолет',
        'Обычный пистолет': 'Обычный пистолет',
        'Крупнокалиберный пистолет': 'Крупнокалиберный пистолет',
        
        // Пистолеты-пулемёты
        'Пистолет-пулемёт': 'Пистолет-пулемёт',
        'Тяжёлый пистолет-пулемёт': 'Тяжёлый пистолет-пулемёт',
        
        // Винтовки
        'Штурмовая винтовка': 'Штурмовая винтовка',
        'Снайперская винтовка': 'Снайперская винтовка',
        
        // Пулемёты
        'Пулемёт': 'Пулемёт',
        
        // Дробовики
        'Дробовик': 'Дробовик',
        
        // Специальное оружие
        'Оружие с самонаведением': 'Оружие с самонаведением',
        'Гранатомёт': 'Гранаты',
        'Ракетомёт': 'Ракеты',
        'Микроракеты': 'Микроракета',
        
        // Активная броня
        'Активная броня (Микроракета)': 'Микроракета',
        'Активная броня (Микроракеты)': 'Микроракета',
        'Активная броня (Дробовая)': 'Пиропатрон',
        'Активная броня (Лазерная)': 'Высоковольтная мини-батарея'
    };
    
    // Сначала ищем точное совпадение
    if (weaponTypeMappings[weaponName]) {
        return weaponTypeMappings[weaponName];
    }
    
    // Затем ищем частичное совпадение
    for (const [key, value] of Object.entries(weaponTypeMappings)) {
        if (weaponName.includes(key)) {
            return value;
        }
    }
    
    // По умолчанию возвращаем обычный пистолет
    return 'Обычный пистолет';
}

function isAutomaticWeapon(weaponType) {
    const automaticTypes = [
        'Пистолет-пулемёт',
        'Тяжёлый пистолет-пулемёт', 
        'Пулемёт',
        'Штурмовая винтовка'
    ];
    return automaticTypes.includes(weaponType);
}

function getMinAmmoForAuto(weaponType) {
    return weaponType === 'Пулемёт' ? 50 : 10;
}

// Функция для выполнения стрельбы из встроенного оружия
window.executeEmbeddedWeaponDamageRoll = function(damageFormula, weaponName, weaponId, weaponType) {
    // Парсим ID встроенного оружия
    const parts = weaponId.replace('embedded_', '').split('_');
    const implantType = parts[0];
    const partName = parts[1];
    const slotIndex = parseInt(parts[2]);
    
    const module = getImplantModule(implantType, partName, slotIndex);
    if (!module) return;
    
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    // Определяем режим огня
    const fireModeRadios = document.querySelectorAll('input[name="fireMode"]');
    let fireMode = 'single';
    for (const radio of fireModeRadios) {
        if (radio.checked) {
            fireMode = radio.value;
            break;
        }
    }
    
    // Определяем количество патронов для списания
    let ammoToConsume = 1;
    let fireModeText = 'Одиночный выстрел';
    
    if (fireMode === 'auto') {
        ammoToConsume = weaponType === 'Пулемёт' ? 50 : 10;
        fireModeText = 'Автоматический огонь';
    } else if (fireMode === 'suppression') {
        ammoToConsume = weaponType === 'Пулемёт' ? 50 : 10;
        fireModeText = 'Огонь на подавление';
    }
    
    // Проверяем достаточность патронов в магазине оружия
    if (module.currentAmmo < ammoToConsume) {
        showModal('Недостаточно патронов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно патронов!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Требуется: ${ammoToConsume}, доступно: ${module.currentAmmo}</p>
            </div>
        `);
        return;
    }
    
    // Скрываем секцию настройки и показываем анимацию
    document.getElementById('weaponSetupSection').style.display = 'none';
    document.getElementById('weaponDamageAnimation').style.display = 'block';
    document.getElementById('weaponShootButton').style.display = 'none';
    
    // Выполняем бросок урона с анимацией
    performWeaponDamageRoll(damageFormula, weaponName, modifier, null, null, null, weaponId, null, false, fireMode);
    
    // Списываем патроны
    module.currentAmmo -= ammoToConsume;
    
    // Обновляем отображение имплантов
    if (typeof renderImplants === 'function') renderImplants();
    
    // Сохраняем состояние
    scheduleSave();
    
    // Логируем выстрел
    const logMessage = `🔫 ${weaponName} (${fireModeText}): ${damageFormula}${modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier : ''} | Патронов: ${module.currentAmmo}/${module.magazine}`;
    addToRollLog(logMessage);
}

function executeRangedWeaponDamageRoll(damageFormula, weaponName, weaponId, weaponType) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    // Определяем режим огня
    const fireModeRadios = document.querySelectorAll('input[name="fireMode"]');
    let fireMode = 'single';
    for (const radio of fireModeRadios) {
        if (radio.checked) {
            fireMode = radio.value;
            break;
        }
    }
    
    // Определяем количество патронов для списания
    let ammoToConsume = 1;
    let fireModeText = 'Одиночный выстрел';
    
    if (fireMode === 'auto') {
        ammoToConsume = weaponType === 'Пулемёт' ? 50 : 10;
        fireModeText = 'Автоматический огонь';
    } else if (fireMode === 'suppression') {
        ammoToConsume = weaponType === 'Пулемёт' ? 50 : 10;
        fireModeText = 'Огонь на подавление';
    }
    
    // Проверяем достаточность патронов в магазине оружия
    if (weapon.currentAmmo < ammoToConsume) {
        showModal('Недостаточно патронов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Недостаточно патронов в магазине!</p>
                <p style="color: ${getThemeColors().muted};">Требуется: ${ammoToConsume} | В магазине: ${weapon.currentAmmo}</p>
                <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => reloadWeapon('${weaponId}'), 100)">Перезарядить</button>
            </div>
        `);
        return;
    }
    
    // Списываем патроны из магазина оружия
    weapon.currentAmmo -= ammoToConsume;
    renderWeapons();
    scheduleSave();
    
    // Скрываем секцию настройки и показываем анимацию
    document.getElementById('weaponSetupSection').style.display = 'none';
    document.getElementById('weaponDamageAnimation').style.display = 'block';
    document.getElementById('weaponShootButton').style.display = 'none';
    
    // Определяем формулу урона в зависимости от режима огня
    let actualDamageFormula = damageFormula;
    if (fireMode === 'auto' || fireMode === 'suppression') {
        actualDamageFormula = '2d6'; // Для автоматического огня и огня на подавление всегда 2d6
    }
    
    // Выполняем бросок урона с анимацией
    performWeaponDamageRoll(actualDamageFormula, weaponName, modifier, weapon.loadedAmmoType, fireModeText, ammoToConsume, weaponId, weaponType, true, fireMode);
}

// Функция для выполнения броска урона оружия на мини-станине
function executeMiniStandWeaponDamageRoll(damageFormula, weaponName, weaponId, weaponType) {
    // Парсим ID мини-станины
    const parts = weaponId.replace('mini_stand_', '').split('_');
    const implantType = parts[0];
    const partName = parts[1];
    const slotIndex = parseInt(parts[2]);
    
    const module = getImplantModule(implantType, partName, slotIndex);
    if (!module || !module.weaponSlot) return;
    
    const weapon = module.weaponSlot;
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    // Определяем режим огня
    const fireModeRadios = document.querySelectorAll('input[name="fireMode"]');
    let fireMode = 'single';
    for (const radio of fireModeRadios) {
        if (radio.checked) {
            fireMode = radio.value;
            break;
        }
    }
    
    // Определяем количество патронов для списания
    let ammoToConsume = 1;
    let fireModeText = 'Одиночный выстрел';
    
    switch (fireMode) {
        case 'single':
            ammoToConsume = 1;
            fireModeText = 'Одиночный выстрел';
            break;
        case 'burst':
            ammoToConsume = 3;
            fireModeText = 'Очередь';
            break;
        case 'auto':
            ammoToConsume = 10;
            fireModeText = 'Автоматический огонь';
            break;
        case 'suppression':
            ammoToConsume = 20;
            fireModeText = 'Огонь на подавление';
            break;
    }
    
    // Проверяем, достаточно ли патронов
    if (weapon.currentAmmo < ammoToConsume) {
        showModal('Недостаточно патронов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно патронов!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Нужно: ${ammoToConsume}, доступно: ${weapon.currentAmmo}</p>
            </div>
        `);
        return;
    }
    
    // Списываем патроны
    weapon.currentAmmo -= ammoToConsume;
    
    // Обновляем отображение имплантов
    if (typeof renderImplants === 'function') renderImplants();
    
    // Сохраняем состояние
    scheduleSave();
    
    // Скрываем секцию настройки и показываем анимацию
    document.getElementById('weaponSetupSection').style.display = 'none';
    document.getElementById('weaponDamageAnimation').style.display = 'block';
    document.getElementById('weaponShootButton').style.display = 'none';
    
    // Определяем формулу урона в зависимости от режима огня
    let actualDamageFormula = damageFormula;
    if (fireMode === 'auto' || fireMode === 'suppression') {
        actualDamageFormula = '2d6'; // Для автоматического огня и огня на подавление всегда 2d6
    }
    
    // Выполняем бросок урона с анимацией
    performWeaponDamageRoll(actualDamageFormula, weaponName, modifier, weapon.loadedAmmoType, fireModeText, ammoToConsume, weaponId, weaponType, true, fireMode);
    
    // Логируем выстрел
    const logMessage = `🔫 ${weaponName} (${fireModeText}): ${damageFormula}${modifier > 0 ? `+${modifier}` : modifier < 0 ? modifier : ''} | Патронов: ${weapon.currentAmmo}/${weapon.maxAmmo || weapon.magazine}`;
    addToRollLog(logMessage);
}

// Универсальная функция для броска урона с анимацией
function performWeaponDamageRoll(damageFormula, weaponName, modifier, ammoType, fireModeText, ammoConsumed, weaponId, weaponType, isRanged, fireMode) {
    // Парсим формулу урона
    const match = damageFormula.match(/(\d+)d(\d+)/);
    if (!match) {
        showModal('Ошибка', 'Неверная формула урона!');
        return;
    }
    
    const diceCount = parseInt(match[1]);
    const diceSides = parseInt(match[2]);
    
    const diceDisplay = document.getElementById('weaponDiceDisplay');
    const totalDiv = document.getElementById('weaponDamageTotal');
    const formulaDiv = document.getElementById('weaponDamageFormula');
    const criticalMessage = document.getElementById('weaponCriticalMessage');
    const footer = document.getElementById('weaponDamageFooter');
    
    // Очищаем предыдущие результаты
    diceDisplay.innerHTML = '';
    totalDiv.textContent = '';
    formulaDiv.textContent = '';
    criticalMessage.style.display = 'none';
    
    // Создаем кубики
    const diceElements = [];
    for (let i = 0; i < diceCount; i++) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        
        const die = document.createElement('div');
        die.className = 'die';
        die.style.cssText = `
            width: 60px;
            height: 60px;
            background: ${getThemeColors().accent};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
            animation: spin 1.2s ease-in-out;
        `;
        die.textContent = '?';
        
        wrapper.appendChild(die);
        diceDisplay.appendChild(wrapper);
        diceElements.push(die);
    }
    
    // Анимация броска
    let animationStep = 0;
    const animationInterval = 100;
    const animationDuration = 1200;
    const steps = animationDuration / animationInterval;
    
    const interval = setInterval(() => {
        animationStep++;
        
        diceElements.forEach(die => {
            die.textContent = Math.floor(Math.random() * diceSides) + 1;
        });
        
        if (animationStep >= steps) {
            clearInterval(interval);
            
            // Финальные результаты
            const finalResults = [];
            for (let i = 0; i < diceCount; i++) {
                finalResults.push(Math.floor(Math.random() * diceSides) + 1);
            }
            
            // Отображаем результаты
            diceElements.forEach((die, index) => {
                die.textContent = finalResults[index];
                die.style.animation = 'none';
            });
            
            // Проверка критической травмы (2+ кубика с результатом >= 6)
            const criticalDice = finalResults.filter(result => result >= 6);
            const isCritical = criticalDice.length >= 2;
            
            // Рассчитываем сумму
            const sum = finalResults.reduce((a, b) => a + b, 0);
            const total = sum + modifier;
            
            // Отображаем результаты
            totalDiv.textContent = `Σ ${total}`;
            
            let formulaText = `Кости: ${finalResults.join(' + ')}`;
            if (modifier !== 0) {
                formulaText += ` ${modifier >= 0 ? '+' : ''} ${modifier}`;
            }
            formulaText += ` = ${total}`;
            
            if (isRanged) {
                formulaText += `\nБоеприпасы: ${ammoType} | Режим: ${fireModeText} | Потрачено: ${ammoConsumed}`;
            }
            
            formulaDiv.textContent = formulaText;
            
            // Показываем критическую травму
            if (isCritical) {
                criticalMessage.style.display = 'block';
                // Красное конфетти
                createBloodConfetti();
            }
            
            // Меняем кнопки - для автоматического огня и огня на подавление убираем кнопку "Атаковать еще раз"
            const canRepeatAttack = !isRanged || (fireMode !== 'auto' && fireMode !== 'suppression');
            
            footer.innerHTML = `
                ${canRepeatAttack ? `
                    <button class="pill-button primary-button" onclick="${isRanged ? `repeatRangedAttack('${damageFormula}', '${weaponName}', '${weaponId}', '${weaponType}')` : `repeatMeleeAttack('${damageFormula}', '${weaponName}', '${weaponId}')`}">
                        &#x1F504; Атаковать еще раз
                    </button>
                ` : ''}
            `;
            
            // Добавляем в лог
            addToRollLog('weapon_damage', {
                weaponName: weaponName,
                formula: `${diceCount}d${diceSides}(${finalResults.join(', ')})${modifier !== 0 ? ` + ${modifier}` : ''}`,
                dice: finalResults,
                modifier: modifier,
                total: total,
                isCritical: isCritical,
                ammoType: isRanged ? ammoType : null,
                fireMode: isRanged ? fireModeText : null
            });
        }
    }, animationInterval);
}

// Функция создания красного конфетти
function createBloodConfetti() {
    const colors = ['#ff0000', '#cc0000', '#990000', '#ff3333', '#cc3333'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: 50%;
            top: 50%;
            opacity: 1;
            pointer-events: none;
            z-index: 10000;
            border-radius: 50%;
        `;
        
        document.body.appendChild(confetti);
        
        const angle = Math.random() * Math.PI * 2;
        const velocity = 200 + Math.random() * 200;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        const duration = 1000 + Math.random() * 500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                const x = vx * progress;
                const y = vy * progress + (progress * progress * 500);
                confetti.style.transform = `translate(${x}px, ${y}px) rotate(${progress * 720}deg)`;
                confetti.style.opacity = 1 - progress;
                requestAnimationFrame(animate);
            } else {
                confetti.remove();
            }
        };
        
        animate();
    }
}

// Функция повторной атаки для дальнего боя
function repeatRangedAttack(damageFormula, weaponName, weaponId, weaponType) {
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    // Открываем новый
    setTimeout(() => {
        rollWeaponDamage(damageFormula, weaponName, 'ranged', weaponId);
    }, 100);
}

// Функция повторной атаки для ближнего боя
function repeatMeleeAttack(damageFormula, weaponName, weaponId) {
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    // Открываем новый
    setTimeout(() => {
        rollWeaponDamage(damageFormula, weaponName, 'melee', weaponId);
    }, 100);
}

function showRangedDamageRoll(damageFormula, weaponName, ammoType, fireModeText, ammoConsumed) {
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
                <h3>&#x1F52B; Стрельба: ${weaponName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>${weaponName}</strong></p>
                    <p style="color: ${getThemeColors().success}; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        Боеприпасы: <strong>${ammoType}</strong>
                    </p>
                    <p style="color: ${getThemeColors().accent}; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        Режим: <strong>${fireModeText}</strong>
                    </p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Потрачено патронов: <strong>${ammoConsumed}</strong>
                    </p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Формула урона: <strong style="color: ${getThemeColors().accent};">${damageFormula}</strong>
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.75rem;">
                    <label class="field">
                        Модификатор урона
                        <input type="text" class="input-field" id="damageModifier" value="0" placeholder="0">
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="executeWeaponDamageRoll('${damageFormula}', '${weaponName}')">
                    🎲 Бросить урон
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

function executeWeaponDamageRoll(damageFormula, weaponName) {
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    // Парсим формулу урона (например, "2d6" или "3d10")
    const match = damageFormula.match(/(\d+)d(\d+)/);
    if (!match) {
        showModal('Ошибка', 'Неверная формула урона!');
        return;
    }
    
    const diceCount = parseInt(match[1]);
    const diceSides = parseInt(match[2]);
    
    // Бросаем кости
    const dice = [];
    for (let i = 0; i < diceCount; i++) {
        dice.push(Math.floor(Math.random() * diceSides) + 1);
    }
    
    const total = dice.reduce((sum, d) => sum + d, 0) + modifier;
    
    // Показываем результат
    showModal('Результат броска', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().accent}; font-size: 1.2rem; margin-bottom: 1rem;">${weaponName}</p>
            <p style="color: ${getThemeColors().text}; font-size: 1.1rem; margin-bottom: 0.5rem;">Урон: ${damageFormula}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}</p>
            <p style="color: ${getThemeColors().success}; font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${total}</p>
            <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Кости: [${dice.join(', ')}]${modifier !== 0 ? ` + ${modifier}` : ''}</p>
        </div>
    `);
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

// Функция управления модулями оружия
function manageWeaponModule(weaponId, slotIndex) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
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
    
    const currentModule = weapon.modules[slotIndex];
    
    let slotHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Управление модулем оружия</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">
                    ${weapon.name} → Слот ${slotIndex + 1}
                </p>
    `;
    
    if (currentModule) {
        slotHTML += `
            <div style="background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: ${getThemeColors().success}; margin-bottom: 0.5rem;">Установленный модуль:</h5>
                <p style="color: ${getThemeColors().text}; font-weight: 600;">${currentModule.name}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">${currentModule.description}</p>
                <button class="pill-button danger-button" onclick="removeWeaponModule('${weaponId}', ${slotIndex}); closeModal(this);" style="margin-top: 0.5rem;">Снять модуль</button>
            </div>
        `;
    } else {
        slotHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">Свободный слот</h5>
                <p style="color: ${getThemeColors().muted};">Выберите модуль для установки:</p>
                <div id="availableWeaponModules" style="max-height: 300px; overflow-y: auto;">
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
    loadAvailableWeaponModules(weaponId, slotIndex);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function loadAvailableWeaponModules(weaponId, slotIndex) {
    const container = document.getElementById('availableWeaponModules');
    if (!container) return;
    
    // Ищем модули в снаряжении
    const availableModules = state.gear.filter(item => item.type === 'weaponModule');
    
    if (availableModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Нет доступных модулей в снаряжении</p>';
        return;
    }
    
    container.innerHTML = availableModules.map((module, index) => `
        <div style="background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <div style="color: ${getThemeColors().text}; font-weight: 600;">${module.name}</div>
            <div style="color: ${getThemeColors().muted}; font-size: 0.8rem;">${module.description}</div>
            <div style="margin-top: 0.5rem;">
                <button class="pill-button success-button" onclick="installWeaponModule('${weaponId}', ${slotIndex}, ${state.gear.findIndex(item => item === module)}); closeModal(this);" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                    Установить
                </button>
            </div>
        </div>
    `).join('');
}

function installWeaponModule(weaponId, slotIndex, gearIndex) {
    const module = state.gear[gearIndex];
    if (!module) return;
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;

    const data = module.weaponModuleData || {};
    const slotsRequired = parseInt(data.slotsRequired || 1);

    // Вспомогательные функции сопоставления сокращений к типам оружия
    function getWeaponAbbrevFromName(name) {
        const n = (name || '').toLowerCase();
        if (n.includes('лёгкий пистолет') || n.includes('легкие пистолет')) return 'ЛП';
        if (n.includes('обычный пистолет')) return 'ОП';
        if (n.includes('крупнокалиберный пистолет')) return 'КП';
        if (n.includes('пистолет-пулемёт') || n.includes('пистоле-пулемёт')) return 'ПП';
        if (n.includes('тяжёлый пистолет-пулемёт') || n.includes('тяжелый пистолет-пулемёт')) return 'ТПП';
        if (n.includes('штурмовая винтовка')) return 'ШВ';
        if (n.includes('снайперская винтовка')) return 'СВ';
        if (n.includes('пулемёт') || n.includes('пулемет')) return 'ПУЛ';
        if (n.includes('дробовик') || n.includes('дробовик')) return 'ДР';
        if (n.includes('оружие с самонаведением')) return 'ОСМ';
        return '';
    }

    function isModuleCompatible(weapon, moduleData) {
        // Категория ближнее/дальнее
        if (moduleData.category && moduleData.category !== weapon.type) {
            return false;
        }
        // Список сокращений (ЛП, ОП, ПП, ...)
        if (!moduleData.compatible || moduleData.compatible.toLowerCase().includes('любое')) return true;
        const set = new Set(moduleData.compatible.split(',').map(s => s.trim().toUpperCase()).filter(Boolean));
        const weaponAbbrev = getWeaponAbbrevFromName(weapon.name);
        if (!weaponAbbrev) return true; // если не смогли распознать — не блокируем
        return set.has(weaponAbbrev);
    }

    // Проверка категории (melee/ranged)
    if (!isModuleCompatible(weapon, data)) {
        showModal('Несовместимо', 'Модуль не подходит для этого оружия.');
        return;
    }

    if (slotsRequired === 2) {
        if (slotIndex + 1 >= weapon.slots) {
            showModal('Нет места', 'Для этого модуля нужно 2 соседних слота.');
            return;
        }
        if (weapon.modules[slotIndex] || weapon.modules[slotIndex + 1]) {
            showModal('Занято', 'Один из требуемых слотов уже занят.');
            return;
        }
        // Сохраняем метку о двухслотном модуле: якорь + связанный слот
        const anchor = Object.assign({}, data, { anchor: true, slotsRequired: 2 });
        const linked = { linked: true, anchorIndex: slotIndex };
        weapon.modules[slotIndex] = anchor;
        weapon.modules[slotIndex + 1] = linked;
    } else {
        if (weapon.modules[slotIndex]) {
            showModal('Занято', 'Слот уже занят.');
            return;
        }
        weapon.modules[slotIndex] = data;
    }

    // Удаляем модуль из снаряжения
    state.gear.splice(gearIndex, 1);

    // Обновляем максимум патронов для модулей магазина
    updateWeaponMagazineCapacity(weapon);

    renderGear();
    renderWeapons();
    scheduleSave();
    showModal('Модуль установлен', `
        <div style="text-align: center; padding: 1.5rem;">
            <div style="background: ${getThemeColors().bgLight}; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid ${getThemeColors().border};">
                <div style="font-size: 2rem; margin-bottom: 0.75rem; color: ${getThemeColors().accent};">✓</div>
                <h4 style="color: ${getThemeColors().text}; margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 500;">${module.name} установлен в оружие</h4>
            </div>
            <button class="pill-button" onclick="closeModal(this)" style="padding: 0.75rem 2rem; font-size: 1rem; background: ${getThemeColors().accent}; color: ${getThemeColors().bg}; border: none;">
                Отлично
            </button>
        </div>
    `);
}

function removeWeaponModule(weaponId, slotIndex) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    let module = weapon.modules[slotIndex];
    if (!module) return;

    // Если кликнули по связанному слоту двухслотного модуля — переключаемся на якорь
    if (module.linked) {
        slotIndex = module.anchorIndex;
        module = weapon.modules[slotIndex];
    }

    const payload = module.anchor ? Object.assign({}, module) : module;

    // Возвращаем модуль в снаряжение (только один предмет)
    state.gear.push({
        id: generateId('gear'),
        name: payload.name,
        description: payload.description,
        price: payload.price,
        load: payload.load,
        type: 'weaponModule',
        weaponModuleData: Object.assign({}, payload, { anchor: undefined })
    });

    // Очищаем слоты
    if (payload.anchor && payload.slotsRequired === 2) {
        weapon.modules[slotIndex] = null;
        if (weapon.modules[slotIndex + 1] && weapon.modules[slotIndex + 1].linked) {
            weapon.modules[slotIndex + 1] = null;
        }
    } else {
        weapon.modules[slotIndex] = null;
    }

    // Обновляем максимум патронов для модулей магазина
    updateWeaponMagazineCapacity(weapon);

    renderGear();
    renderWeapons();
    scheduleSave();
    showModal('Модуль снят', `&#x2705; ${payload.name} возвращен в снаряжение!`);
}

// Функция обновления вместимости магазина оружия
function updateWeaponMagazineCapacity(weapon) {
    if (weapon.type !== 'ranged') return;
    
    // Базовая вместимость магазина
    const baseMagazine = parseInt(weapon.magazine);
    let multiplier = 1;
    
    // Проверяем установленные модули
    const installedModules = weapon.modules.filter(m => m && !m.linked);
    
    for (const module of installedModules) {
        if (module.name === 'Барабанный магазин' || module.name === 'Увеличенный магазин') {
            multiplier *= 4; // Каждый модуль умножает на 4
        }
    }
    
    // Обновляем максимум патронов
    weapon.maxAmmo = baseMagazine * multiplier;
    
    // Если текущее количество патронов превышает новый максимум, обрезаем
    if (weapon.currentAmmo > weapon.maxAmmo) {
        const excessAmmo = weapon.currentAmmo - weapon.maxAmmo;
        weapon.currentAmmo = weapon.maxAmmo;
        
        // Возвращаем лишние патроны в блок Боеприпасы
        if (weapon.loadedAmmoType && excessAmmo > 0) {
            const weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
            const existingAmmoIndex = state.ammo.findIndex(a => 
                a.type === weapon.loadedAmmoType && a.weaponType === weaponTypeForAmmo
            );
            
            if (existingAmmoIndex !== -1) {
                state.ammo[existingAmmoIndex].quantity += excessAmmo;
            } else {
                // Создаем новый тип боеприпасов
                const newAmmo = {
                    id: generateId('ammo'),
                    type: weapon.loadedAmmoType,
                    weaponType: weaponTypeForAmmo,
                    quantity: excessAmmo,
                    price: 0
                };
                state.ammo.push(newAmmo);
            }
            renderAmmo();
        }
    }
}

// Функция магазина модулей оружия
function showWeaponModulesShop() {
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
        <div class="modal" style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6535-3132-4233-b731-356365363437/wrench.png" alt="🔧" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин модулей оружия</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleWeaponModulesFreeMode()" id="weaponModulesFreeModeButton" style="background: transparent; border: 1px solid ${getThemeColors().border}; color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="pill-button weapon-module-category-filter active" onclick="filterWeaponModules('melee')" data-category="melee" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Для ближнего боя
                </button>
                <button class="pill-button weapon-module-category-filter" onclick="filterWeaponModules('ranged')" data-category="ranged" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Для дальнего боя
                </button>
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem;" id="weaponModulesShopContent">
                    <!-- Контент будет загружен через filterWeaponModules -->
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

// Функция фильтрации модулей оружия
function filterWeaponModules(category) {
    const container = document.getElementById('weaponModulesShopContent');
    if (!container) return;
    
    document.querySelectorAll('.weapon-module-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    const modules = WEAPON_MODULES[category] || [];
    
    container.innerHTML = modules.map(module => `
        <div class="shop-item">
            <div class="shop-item-header">
                <h4 class="shop-item-title">${module.name}${module.slotsRequired ? ` (ТРЕБУЕТ ${module.slotsRequired} СЛОТА)` : ''}</h4>
            </div>
            
            <p class="shop-item-description">
                ${module.description}
            </p>
            
            <div class="shop-item-stats">
                <div class="shop-stat">Совместимость: ${module.compatible}</div>
                <div class="shop-stat">Нагрузка: ${module.load}</div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <span class="weapon-module-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${module.price}">
                    ${module.price} уе
                </span>
                <button class="pill-button primary-button weapon-module-buy-button" onclick="buyWeaponModule('${category}', '${module.name}', ${module.price}, ${module.load}, '${module.compatible}', '${module.description.replace(/'/g, "\\'")}', ${module.slotsRequired || 1})" data-module-type="${category}" data-module-name="${module.name}" data-price="${module.price}" data-load="${module.load}" data-compatible="${module.compatible}" data-description="${module.description.replace(/'/g, "\\'")}" data-slots-required="${module.slotsRequired || 1}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Купить
                </button>
            </div>
        </div>
    `).join('');
}

// Функции покупки модулей оружия
function buyWeaponModule(category, name, price, load, compatible, description, slotsRequired = 1, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Нищим не продаём. Вали отсюда!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Добавляем модуль в снаряжение
    const newModule = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: price,
        load: load,
        type: 'weaponModule',
        weaponModuleData: {
            name: name,
            description: description,
            price: price,
            load: load,
            compatible: compatible,
            category: category,
            slotsRequired: slotsRequired
        },
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.gear.push(newModule);
    renderGear();
    scheduleSave();
    
    showModal('Модуль куплен', `&#x2705; ${name} добавлен в Снаряжение!`);
}

function getWeaponModuleFree(category, name, load, compatible, description, slotsRequired = 1) {
    // Добавляем модуль в снаряжение бесплатно
    const newModule = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: 0,
        load: load,
        type: 'weaponModule',
        weaponModuleData: {
            name: name,
            description: description,
            price: 0,
            load: load,
            compatible: compatible,
            category: category,
            slotsRequired: slotsRequired
        }
    };
    
    state.gear.push(newModule);
    renderGear();
    scheduleSave();
    
    showModal('Модуль получен', `&#x2705; ${name} добавлен в Снаряжение бесплатно!`);
}

function toggleWeaponModulesFreeMode() {
    const buyButtons = document.querySelectorAll('.weapon-module-buy-button');
    const toggleButton = document.getElementById('weaponModulesFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const moduleType = btn.getAttribute('data-module-type');
            const name = btn.getAttribute('data-module-name');
            const price = btn.getAttribute('data-price');
            const load = btn.getAttribute('data-load');
            const compatible = btn.getAttribute('data-compatible');
            const description = btn.getAttribute('data-description');
            const slotsRequired = btn.getAttribute('data-slots-required');
            btn.setAttribute('onclick', `buyWeaponModule('${moduleType}', '${name}', ${price}, ${load}, '${compatible}', '${description}', ${slotsRequired})`);
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const moduleType = btn.getAttribute('data-module-type');
            const name = btn.getAttribute('data-module-name');
            const load = btn.getAttribute('data-load');
            const compatible = btn.getAttribute('data-compatible');
            const description = btn.getAttribute('data-description');
            const slotsRequired = btn.getAttribute('data-slots-required');
            btn.setAttribute('onclick', `getWeaponModuleFree('${moduleType}', '${name}', ${load}, '${compatible}', '${description}', ${slotsRequired})`);
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}


// Функции renderGear, toggleGearDescription, decreaseShieldHP, installImplantFromGear, removeGear
// перенесены в gear.js

function takeWeaponFromGear(gearIndex) {
    const gearItem = state.gear[gearIndex];
    if (!gearItem || gearItem.type !== 'weapon') {
        console.error('Предмет не является оружием или не найден');
        return;
    }
    
    // Создаем объект оружия на основе данных из снаряжения
    const weaponData = gearItem.weaponData || {};
    
    const newWeapon = {
        id: generateId('weapon'),
        name: gearItem.name,
        type: weaponData.type || 'melee', // melee или ranged
        load: gearItem.load || 1,
        slots: 3, // Стандартное количество слотов
        modules: [null, null, null], // Пустые слоты для модулей
        
        // Для оружия ближнего боя
        damage: weaponData.damage || '1d6',
        concealable: weaponData.concealable !== undefined ? (weaponData.concealable ? 'да' : 'нет') : 'нет',
        stealthPenalty: weaponData.stealthPenalty || '0',
        examples: weaponData.examples || '',
        
        // Для оружия дальнего боя
        primaryDamage: weaponData.primaryDamage || weaponData.damage || '1d6',
        altDamage: weaponData.altDamage || weaponData.damage || '1d6',
        hands: weaponData.hands || 1,
        stealth: weaponData.stealth || 0,
        magazine: weaponData.magazine || 10,
        
        // Дополнительные данные
        appearance: weaponData.appearance || '',
        customDescription: weaponData.customDescription || gearItem.description || '',
        
        // Система магазина (только для дальнего боя)
        maxAmmo: weaponData.type === 'ranged' ? parseInt(weaponData.magazine || 10) : 0,
        currentAmmo: 0,
        loadedAmmoType: null,
        // Особая система для дробовиков
        isShotgun: gearItem.name.includes('Дробовик'),
        shotgunAmmo1: { type: null, count: 0 }, // Первый тип патронов (до 3 шт)
        shotgunAmmo2: { type: null, count: 0 }  // Второй тип патронов (до 3 шт)
    };
    
    // Добавляем оружие в блок "Оружие"
    state.weapons.push(newWeapon);
    
    // Удаляем из снаряжения
    state.gear.splice(gearIndex, 1);
    
    // Обновляем интерфейс
    renderWeapons();
    renderGear();
    scheduleSave();
    
    showModal('Оружие взято в руки', `&#x2705; ${newWeapon.name} перемещено в блок "Оружие"!`);
}

// Функция для перемещения оружия из блока "Оружие" в "Снаряжение"
function moveWeaponToGear(weaponIndex) {
    const weapon = state.weapons[weaponIndex];
    if (!weapon) {
        console.error('Оружие не найдено');
        return;
    }
    
    // Возвращаем боеприпасы в блок "Боеприпасы", если они были заряжены
    if (weapon.type === 'ranged' && weapon.currentAmmo > 0 && weapon.loadedAmmoType) {
        // Определяем тип боеприпасов для поиска
        const weaponTypeForAmmo = weapon.isShotgun ? 'Дробовик' : getWeaponTypeForAmmo(weapon.name);
        
        // Ищем существующий стак боеприпасов
        const existingAmmo = state.ammo.find(a => 
            a.type === weapon.loadedAmmoType && 
            a.weaponType === weaponTypeForAmmo
        );
        
        if (existingAmmo) {
            // Добавляем к существующему стаку
            existingAmmo.quantity += weapon.currentAmmo;
        } else {
            // Создаем новый стак
            const newAmmo = {
                id: generateId('ammo'),
                type: weapon.loadedAmmoType,
                weaponType: weaponTypeForAmmo,
                quantity: weapon.currentAmmo,
                price: 0
            };
            state.ammo.push(newAmmo);
        }
        renderAmmo();
    }
    
    // Создаем объект снаряжения на основе оружия
    let description = '';
    if (weapon.type === 'melee') {
        description = `Урон: ${weapon.damage} | Можно скрыть: ${formatYesNo(weapon.concealable)} | Штраф к СКА: ${weapon.stealthPenalty}`;
    } else {
        description = `Урон основной: ${weapon.primaryDamage} | Урон альтернативный: ${weapon.altDamage} | Можно скрыть: ${formatYesNo(weapon.concealable)} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}`;
    }
    
    const gearItem = {
        id: generateId('gear'),
        name: weapon.customName || weapon.name,
        description: description,
        price: weapon.price || 0,
        load: weapon.load || 3,
        type: 'weapon',
        weaponData: {
            type: weapon.type,
            damage: weapon.damage,
            primaryDamage: weapon.primaryDamage,
            altDamage: weapon.altDamage,
            concealable: weapon.concealable,
            stealthPenalty: weapon.stealthPenalty,
            hands: weapon.hands,
            stealth: weapon.stealth,
            magazine: weapon.magazine,
            examples: weapon.examples || '',
            appearance: weapon.appearance || '',
            customDescription: weapon.customDescription || ''
        }
    };
    
    // Добавляем в снаряжение
    state.gear.push(gearItem);
    
    // Удаляем из блока оружия
    state.weapons.splice(weaponIndex, 1);
    
    // Обновляем интерфейс
    renderWeapons();
    renderGear();
    scheduleSave();
    
    showModal('Оружие сложено', `&#x2705; ${gearItem.name} перемещено в Снаряжение!`);
}

// Функции для работы с боеприпасами
function renderAmmo() {
    const container = document.getElementById('ammoContainer');
    if (!container) return;
    
    if (state.ammo.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Боеприпасы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.ammo.map((ammo, index) => `
        <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.85rem;">${ammo.type}</div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; font-family: monospace; margin-top: 0.1rem;">${ammo.weaponType}</div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                    <button onclick="changeAmmoQuantity(${index}, -1)" style="font-size: 0.75rem; padding: 0.2rem 0.4rem; min-width: 24px; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;">−</button>
                    <span style="color: ${getThemeColors().accent}; font-weight: 600; min-width: 35px; text-align: center; font-size: 0.85rem;">${ammo.quantity}</span>
                </div>
                <button class="pill-button danger-button" onclick="removeAmmo(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">Удалить</button>
            </div>
        </div>
    `).join('');
}

function showAmmoShop() {
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
        <div class="modal" style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3334-6338-4439-a262-316631336461/bullets.png" alt="🔫" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин боеприпасов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleAmmoFreeMode()" id="ammoFreeModeButton" style="background: transparent; border: 1px solid ${getThemeColors().border}; color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры по типам боеприпасов -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${AMMO_DATA.types.map((type, idx) => `
                    <button class="pill-button ammo-category-filter ${idx === 0 ? 'active' : ''}" onclick="filterAmmo('${type}')" data-ammo-category="${type}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        ${type}
                    </button>
                `).join('')}
                <button class="pill-button ammo-category-filter" onclick="filterAmmo('Активная защита')" data-ammo-category="Активная защита" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                    Активная защита
                </button>
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="margin-bottom: 1rem; padding: 1rem; background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px;">
                    <p style="color: ${getThemeColors().success}; font-weight: 600; margin-bottom: 0.5rem;">ℹ️ Информация о боеприпасах:</p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 0.25rem;">• 1 пачка патронов = 10 патронов</p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 0.25rem;">• Гранаты и ракеты продаются по 1 штуке</p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">• Все боеприпасы имеют нагрузку = 1</p>
                </div>
                       <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; padding: 1rem;" id="ammoShopContent">
                    <!-- Контент будет загружен через filterAmmo -->
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
        .ammo-category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('ammo-filter-styles')) {
        style.id = 'ammo-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем первый тип боеприпасов по умолчанию
    filterAmmo(AMMO_DATA.types[0]);
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации боеприпасов
function filterAmmo(category) {
    const container = document.getElementById('ammoShopContent');
    if (!container) return;
    
    // Обновляем активный фильтр
    document.querySelectorAll('.ammo-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-ammo-category') === category) {
            btn.classList.add('active');
        }
    });
    
    let contentHTML = '';
    
    if (category === 'Активная защита') {
        // Рендерим активную защиту
        const activeDefenseItems = [
            { name: 'Пиропатрон', description: 'Для дробовой активной защиты (урон 4d4)', price: 50 },
            { name: 'Высоковольтная мини-батарея', description: 'Для лазерной активной защиты (без урона)', price: 250 },
            { name: 'Микроракета', description: 'Для микроракетной активной защиты (урон 6d6)', price: 500 }
        ];
        
        contentHTML = activeDefenseItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">${item.name}</h4>
                </div>
                
                <p class="shop-item-description">
                    ${item.description}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="ammo-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${item.price}">
                        ${item.price} уе
                    </span>
                    <button class="pill-button primary-button" onclick="showAmmoQuantityModal('Активная защита', '${item.name}', ${item.price})" data-ammo-type="Активная защита" data-weapon-type="${item.name}" data-price="${item.price}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        // Рендерим обычные боеприпасы
        const ammoItems = [];
        for (const [weaponTypeFull, weaponTypeShort] of Object.entries(AMMO_DATA.weaponTypes)) {
            const price = AMMO_DATA.prices[category][weaponTypeShort];
            
            if (price !== null) {
                ammoItems.push({
                    weaponType: weaponTypeFull,
                    weaponTypeShort: weaponTypeShort,
                    price: price
                });
            }
        }
        
        contentHTML = ammoItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">${item.weaponType}</h4>
                </div>
                
                <div class="shop-item-stats">
                    <div class="shop-stat">Тип: ${category}</div>
                    <div class="shop-stat">Класс: ${item.weaponTypeShort}</div>
                    <div class="shop-stat">Нагрузка: 1</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="ammo-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${item.price}">
                        ${item.price} уе
                    </span>
                    <button class="pill-button primary-button" onclick="showAmmoQuantityModal('${category}', '${item.weaponType}', ${item.price})" data-ammo-type="${category}" data-weapon-type="${item.weaponType}" data-price="${item.price}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    container.innerHTML = contentHTML;
}

function toggleAmmoFreeMode() {
    const priceElements = document.querySelectorAll('.ammo-price');
    const buyButtons = document.querySelectorAll('[data-ammo-type]');
    const toggleButton = document.getElementById('ammoFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    // Проверяем текущий режим
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        // Возвращаем обычные цены
        priceElements.forEach(el => {
            const originalPrice = el.getAttribute('data-original-price');
            el.textContent = `${originalPrice} уе`;
        });
        
        buyButtons.forEach(btn => {
            const originalPrice = btn.getAttribute('data-price');
            const ammoType = btn.getAttribute('data-ammo-type');
            const weaponType = btn.getAttribute('data-weapon-type');
            btn.setAttribute('onclick', `showAmmoQuantityModal('${ammoType}', '${weaponType}', ${originalPrice})`);
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        // Включаем бесплатный режим
        priceElements.forEach(el => {
            el.textContent = '0 уе';
        });
        
        buyButtons.forEach(btn => {
            const ammoType = btn.getAttribute('data-ammo-type');
            const weaponType = btn.getAttribute('data-weapon-type');
            btn.setAttribute('onclick', `showAmmoQuantityModal('${ammoType}', '${weaponType}', 0)`);
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

function showAmmoQuantityModal(ammoType, weaponType, price) {
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
    
    const isGrenadeOrRocket = weaponType === 'Гранаты' || weaponType === 'Ракеты';
    const isActiveDefense = ammoType === 'Активная защита';
    const isSingleUnit = isGrenadeOrRocket || isActiveDefense;
    const unitText = isSingleUnit ? 'шт.' : 'пачек';
    const contentText = isSingleUnit ? 'штук' : 'пачек (по 10 патронов)';
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>🛒 Покупка боеприпасов</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>${ammoType}</strong></p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Для: <strong style="color: ${getThemeColors().accent};">${weaponType}</strong>
                    </p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">
                        Цена за ${isSingleUnit ? '1 штуку' : '1 пачку'}: <strong style="color: ${getThemeColors().success};">${price} уе</strong>
                    </p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Количество ${contentText}</label>
                    <input type="number" class="input-field" id="ammoQuantity" value="1" min="1" max="99" onchange="updateAmmoTotal(${price})">
                </div>
                
                <div style="margin-top: 1rem; padding: 0.75rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; text-align: center;">
                    <div style="color: ${getThemeColors().accent}; font-weight: 600;">Итого: <span id="ammoTotalPrice">${price}</span> уе</div>
                    ${!isSingleUnit ? '<div style="color: ${getThemeColors().muted}; font-size: 0.8rem; margin-top: 0.25rem;">Патронов: <span id="ammoTotalBullets">10</span> шт.</div>' : ''}
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="buyAmmoWithQuantity('${ammoType}', '${weaponType}', ${price})">Купить</button>
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
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
    
    // Фокусируемся на поле количества
    setTimeout(() => {
        const input = document.getElementById('ammoQuantity');
        if (input) input.focus();
    }, 100);
}

function updateAmmoTotal(pricePerUnit) {
    const quantity = parseInt(document.getElementById('ammoQuantity').value) || 1;
    const totalPrice = quantity * pricePerUnit;
    
    const totalPriceEl = document.getElementById('ammoTotalPrice');
    const totalBulletsEl = document.getElementById('ammoTotalBullets');
    
    if (totalPriceEl) {
        totalPriceEl.textContent = totalPrice;
    }
    
    if (totalBulletsEl) {
        totalBulletsEl.textContent = quantity * 10;
    }
}

function buyAmmoWithQuantity(ammoType, weaponType, pricePerUnit, catalogPrice = null) {
    const quantity = parseInt(document.getElementById('ammoQuantity').value) || 1;
    const totalPrice = quantity * pricePerUnit;
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < totalPrice) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег!</p>
                <p style="margin-bottom: 1rem;">Требуется: ${totalPrice} уе | Доступно: ${currentMoney} уе</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - totalPrice;
    updateMoneyDisplay();
    
    // Определяем количество добавляемых единиц
    const isGrenadeOrRocket = weaponType === 'Гранаты' || weaponType === 'Ракеты';
    const isActiveDefense = ammoType === 'Активная защита';
    const isSingleUnit = isGrenadeOrRocket || isActiveDefense;
    const addQuantity = isSingleUnit ? quantity : quantity * 10;
    
    // Рассчитываем нагрузку (каждые 10 патронов/гранат/ракет/активная защита = 1 нагрузка)
    const loadToDeduct = isSingleUnit ? quantity : quantity;
    
    // Вычитаем нагрузку (без проверок)
    state.load.current -= loadToDeduct;
    updateLoadDisplay();
    
    // Для активной защиты используем "Активная защита" как базовое название
    const ammoName = isActiveDefense ? 'Активная защита' : ammoType;
    
    // Проверяем, есть ли уже такой тип боеприпасов
    // Ищем по типу И weaponType для всех боеприпасов
    const existingAmmoIndex = state.ammo.findIndex(a => {
        return a.type === ammoName && a.weaponType === weaponType;
    });
    
    if (existingAmmoIndex !== -1) {
        // Увеличиваем количество
        state.ammo[existingAmmoIndex].quantity += addQuantity;
    } else {
        // Добавляем новый тип боеприпасов
        const newAmmo = {
            id: generateId('ammo'),
            type: ammoName,
            weaponType: weaponType,
            quantity: addQuantity,
            price: pricePerUnit,
            catalogPrice: catalogPrice,
            purchasePrice: pricePerUnit,
            itemType: catalogPrice ? 'free_catalog' : 'purchased'
        };
        state.ammo.push(newAmmo);
    }
    
    renderAmmo();
    scheduleSave();
    
    const quantityText = isSingleUnit 
        ? `${quantity} шт.` 
        : `${addQuantity} патронов (${quantity} пачек)`;
    
    // НЕ закрываем модал покупки - пользователь может продолжить покупки
    
    showModal('Боеприпасы куплены', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; Боеприпасы куплены!</p>
            <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;"><strong>${ammoName}</strong></p>
            <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Для: ${weaponType}</p>
            <p style="color: ${getThemeColors().accent}; margin-bottom: 1rem;">Получено: ${quantityText}</p>
            <p style="color: ${getThemeColors().muted};">Потрачено: ${totalPrice} уе</p>
        </div>
    `);
}

function buyAmmo(ammoType, weaponType, price, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: ${getThemeColors().danger}; color: white; border-radius: 8px;">
                <p style="font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег!</p>
                <button class="pill-button" onclick="closeModal(this)">Понятно</button>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Проверяем, есть ли уже такой тип боеприпасов
    const existingAmmoIndex = state.ammo.findIndex(a => a.type === ammoType && a.weaponType === weaponType);
    
    // Определяем количество добавляемых единиц
    const addQuantity = (weaponType === 'Гранаты' || weaponType === 'Ракеты') ? 1 : 10;
    
    if (existingAmmoIndex !== -1) {
        // Увеличиваем количество
        state.ammo[existingAmmoIndex].quantity += addQuantity;
    } else {
        // Добавляем новый тип боеприпасов
        const newAmmo = {
            id: generateId('ammo'),
            type: ammoType,
            weaponType: weaponType,
            quantity: addQuantity,
            price: price,
            catalogPrice: catalogPrice,
            purchasePrice: price,
            itemType: catalogPrice ? 'free_catalog' : 'purchased'
        };
        state.ammo.push(newAmmo);
    }
    
    renderAmmo();
    scheduleSave();
    
    const quantityText = (weaponType === 'Гранаты' || weaponType === 'Ракеты') 
        ? '1 шт.' 
        : '10 патронов';
    
    showModal('Боеприпасы куплены', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${ammoType} (${weaponType}) куплены!</p>
            <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Куплено: ${quantityText}</p>
        </div>
    `);
}

function changeAmmoQuantity(index, delta) {
    if (!state.ammo[index]) return;
    
    const ammo = state.ammo[index];
    const oldQuantity = ammo.quantity;
    const newQuantity = oldQuantity + delta;
    
    if (newQuantity < 0) {
        showModal('Ошибка', 'Количество не может быть отрицательным!');
        return;
    }
    
    // Рассчитываем изменение нагрузки
    const isGrenadeOrRocket = (ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты');
    
    if (delta < 0) { // Уменьшаем количество
        const quantityReduced = Math.abs(delta);
        let loadToReturn = 0;
        
        if (isGrenadeOrRocket) {
            // Для гранат и ракет: каждая штука = 1 нагрузка
            loadToReturn = quantityReduced;
        } else {
            // Для патронов: каждые 10 патронов = 1 нагрузка
            const oldLoadUnits = Math.ceil(oldQuantity / 10);
            const newLoadUnits = Math.ceil(newQuantity / 10);
            loadToReturn = oldLoadUnits - newLoadUnits;
        }
        
        // Возвращаем нагрузку
        state.load.current += loadToReturn;
        updateLoadDisplay();
    }
    
    ammo.quantity = newQuantity;
    renderAmmo();
    scheduleSave();
}

function removeAmmo(index) {
        const ammo = state.ammo[index];
        if (ammo) {
            // Возвращаем нагрузку
            const isGrenadeOrRocket = (ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты');
            const loadToReturn = isGrenadeOrRocket ? ammo.quantity : Math.ceil(ammo.quantity / 10);
            
            state.load.current += loadToReturn;
            updateLoadDisplay();
        }
        
        state.ammo.splice(index, 1);
        renderAmmo();
        scheduleSave();
}

// Функция перезарядки оружия
function reloadWeapon(weaponId) {
    console.log('🔫 reloadWeapon вызвана с weaponId:', weaponId);
    
    const weapon = state.weapons.find(w => w.id === weaponId);
    console.log('🔍 Найденное оружие:', weapon);
    
    if (!weapon || weapon.type !== 'ranged') {
        console.error('❌ Оружие не найдено или не является дальним!');
        showModal('Ошибка', 'Оружие не найдено или не является дальним!');
        return;
    }
    
    console.log('✅ Оружие найдено, тип:', weapon.type);
    
    // Определяем тип оружия для поиска подходящих боеприпасов
    let weaponTypeForAmmo;
    
    // Проверяем, является ли это встроенным оружием (по ID или флагу)
    const isEmbeddedWeapon = weapon.isEmbedded || weapon.id.startsWith('embedded_');
    
    if (isEmbeddedWeapon) {
        // Для встроенного оружия используем название оружия напрямую
        // Но проверяем специальные случаи для совместимости с названиями боеприпасов
        console.log('🔧 Встроенное оружие, weapon.name:', weapon.name);
        console.log('🔧 Встроенное оружие, weapon.id:', weapon.id);
        
        // Дополнительная проверка по ID для микроракет
        if (weapon.id.includes('embedded_') && weapon.id.includes('Микроракеты')) {
            weaponTypeForAmmo = 'Микроракета';
            console.log('🔧 Обнаружены микроракеты по ID, weaponTypeForAmmo:', weaponTypeForAmmo);
        } else if (weapon.name === 'Гранатомёт') {
            weaponTypeForAmmo = 'Гранаты'; // Боеприпасы имеют weaponType: "Гранаты"
        } else if (weapon.name === 'Микроракеты') {
            weaponTypeForAmmo = 'Микроракета'; // Для микроракет
        } else {
            weaponTypeForAmmo = weapon.name;
        }
        console.log('🔧 Встроенное оружие, weaponTypeForAmmo:', weaponTypeForAmmo);
    } else {
        weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
        console.log('🔧 Обычное оружие, weaponTypeForAmmo:', weaponTypeForAmmo);
    }
    
    // Находим подходящие боеприпасы
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === weaponTypeForAmmo && ammo.quantity > 0
    );
    
    console.log('📦 Все боеприпасы в state.ammo:', state.ammo);
    console.log('📦 Ищем боеприпасы с weaponType:', weaponTypeForAmmo);
    console.log('📦 Совместимые боеприпасы:', compatibleAmmo);
    
    if (compatibleAmmo.length === 0) {
        console.warn('⚠️ Нет подходящих боеприпасов!');
        showModal('Нет боеприпасов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">У вас нет подходящих боеприпасов!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Купите боеприпасы для ${weaponTypeForAmmo}</p>
            </div>
        `);
        return;
    }
    
    console.log('✅ Найдены подходящие боеприпасы, создаем модальное окно');
    
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
                <h3>🔄 Перезарядка: ${weapon.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;"><strong>Текущее состояние:</strong></p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">
                        Патронов: ${weapon.currentAmmo}/${weapon.maxAmmo}
                        ${weapon.loadedAmmoType ? ` | Тип: ${weapon.loadedAmmoType}` : ' | Не заряжено'}
                    </p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label class="input-label">Выберите тип боеприпасов</label>
                    <select class="input-field" id="reloadAmmoType">
                        ${compatibleAmmo.map((ammo, index) => `
                            <option value="${index}">${ammo.type} (${ammo.quantity} шт.)</option>
                        `).join('')}
                    </select>
                </div>
                
                <div id="reloadWarning" style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(255, 165, 0, 0.1); border: 1px solid orange; border-radius: 8px; display: none;">
                    <p style="color: orange; font-size: 0.9rem; margin-bottom: 0.5rem;">&#x26A0;&#xFE0F; Внимание!</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.8rem;" id="reloadWarningText">
                        В магазине есть патроны другого типа. При перезарядке они будут возвращены в блок Боеприпасы.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="executeReload('${weaponId}')">
                    🔄 Перезарядить
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик изменения типа боеприпасов
    setTimeout(() => {
        const ammoSelect = document.getElementById('reloadAmmoType');
        const warningDiv = document.getElementById('reloadWarning');
        const warningText = document.getElementById('reloadWarningText');
        
        function checkAmmoTypeChange() {
            const selectedIndex = parseInt(ammoSelect.value);
            const selectedAmmo = compatibleAmmo[selectedIndex];
            
            if (weapon.currentAmmo > 0 && weapon.loadedAmmoType && weapon.loadedAmmoType !== selectedAmmo.type) {
                warningDiv.style.display = 'block';
                warningText.textContent = `В магазине есть патроны типа "${weapon.loadedAmmoType}" (${weapon.currentAmmo} шт.). При перезарядке они будут возвращены в блок Боеприпасы.`;
            } else {
                warningDiv.style.display = 'none';
            }
        }
        
        ammoSelect.addEventListener('change', checkAmmoTypeChange);
        checkAmmoTypeChange(); // Проверяем при открытии
    }, 100);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            // Если это временное встроенное оружие, удаляем его при закрытии модального окна
            if (weapon.isEmbedded && weapon.id.startsWith('embedded_')) {
                const index = state.weapons.findIndex(w => w.id === weapon.id);
                if (index !== -1) {
                    state.weapons.splice(index, 1);
                    console.log('➖ Временное встроенное оружие удалено при закрытии модального окна');
                }
            }
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция для выполнения перезарядки
window.executeReload = function(weaponId) {
    console.log('⚡ executeReload вызвана с weaponId:', weaponId);
    
    const weapon = state.weapons.find(w => w.id === weaponId);
    console.log('🔍 Найденное оружие в executeReload:', weapon);
    
    if (!weapon) {
        console.error('❌ Оружие не найдено в executeReload!');
        return;
    }
    
    const selectedAmmoIndex = parseInt(document.getElementById('reloadAmmoType').value);
    console.log('📋 Выбранный индекс боеприпасов:', selectedAmmoIndex);
    
    // Определяем тип оружия для поиска боеприпасов
    let weaponTypeForAmmo;
    if (weapon.isEmbedded) {
        // Для встроенного оружия используем название оружия напрямую
        // Но проверяем специальные случаи для совместимости с названиями боеприпасов
        if (weapon.name === 'Гранатомёт') {
            weaponTypeForAmmo = 'Гранаты'; // Боеприпасы имеют weaponType: "Гранаты"
        } else if (weapon.name === 'Микроракеты') {
            weaponTypeForAmmo = 'Микроракета'; // Для микроракет
        } else {
            weaponTypeForAmmo = weapon.name;
        }
    } else {
        weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
    }
    
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === weaponTypeForAmmo && ammo.quantity > 0
    );
    const selectedAmmo = compatibleAmmo[selectedAmmoIndex];
    
    if (!selectedAmmo) {
        showModal('Ошибка', 'Выбранные боеприпасы не найдены!');
        return;
    }
    
    // Если в магазине есть патроны другого типа, возвращаем их в блок Боеприпасы
    if (weapon.currentAmmo > 0 && weapon.loadedAmmoType && weapon.loadedAmmoType !== selectedAmmo.type) {
        const existingAmmoIndex = state.ammo.findIndex(a => 
            a.type === weapon.loadedAmmoType && a.weaponType === weaponTypeForAmmo
        );
        
        if (existingAmmoIndex !== -1) {
            state.ammo[existingAmmoIndex].quantity += weapon.currentAmmo;
        } else {
            // Создаем новый тип боеприпасов
            const newAmmo = {
                id: generateId('ammo'),
                type: weapon.loadedAmmoType,
                weaponType: weaponTypeForAmmo,
                quantity: weapon.currentAmmo,
                price: 0
            };
            state.ammo.push(newAmmo);
        }
    }
    
    // Рассчитываем сколько патронов нужно для полной перезарядки
    const ammoNeeded = weapon.maxAmmo - (weapon.loadedAmmoType === selectedAmmo.type ? weapon.currentAmmo : 0);
    const ammoToTake = Math.min(ammoNeeded, selectedAmmo.quantity);
    
    // Находим индекс в основном массиве боеприпасов
    const realAmmoIndex = state.ammo.findIndex(ammo => ammo.id === selectedAmmo.id);
    
    if (realAmmoIndex !== -1) {
        // Вычитаем патроны из блока Боеприпасы
        state.ammo[realAmmoIndex].quantity -= ammoToTake;
        
        // Заряжаем оружие
        weapon.currentAmmo = (weapon.loadedAmmoType === selectedAmmo.type ? weapon.currentAmmo : 0) + ammoToTake;
        weapon.loadedAmmoType = selectedAmmo.type;
        
        renderAmmo();
        if (weapon.isEmbedded) {
            // Для встроенного оружия обновляем данные модуля и отображение имплантов
            const parts = weapon.id.replace('embedded_', '').split('_');
            const implantType = parts[0];
            const partName = parts[1];
            const slotIndex = parseInt(parts[2]);
            
            const module = getImplantModule(implantType, partName, slotIndex);
            if (module) {
                module.currentAmmo = weapon.currentAmmo;
                module.loadedAmmoType = weapon.loadedAmmoType;
            }
            
            if (typeof renderImplants === 'function') renderImplants();
        } else {
            // Для обычного оружия обновляем отображение оружия
            renderWeapons();
        }
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        
        const reloadMessage = ammoToTake === ammoNeeded ? 
            'Магазин полностью заряжен!' : 
            `Заряжено ${ammoToTake} из ${ammoNeeded} патронов (не хватило боеприпасов)`;
        
        showModal('Перезарядка завершена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${weapon.name}</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;">${reloadMessage}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Тип: ${selectedAmmo.type} | Патронов: ${weapon.currentAmmo}/${weapon.maxAmmo}</p>
            </div>
        `);
        
        // Если это временное встроенное оружие, удаляем его из массива
        if (weapon.isEmbedded && weapon.id.startsWith('embedded_')) {
            const index = state.weapons.findIndex(w => w.id === weapon.id);
            if (index !== -1) {
                state.weapons.splice(index, 1);
                console.log('➖ Временное встроенное оружие удалено из state.weapons');
            }
        }
    }
}

function reloadShotgun(weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon || !weapon.isShotgun) {
        showModal('Ошибка', 'Оружие не найдено или не является дробовиком!');
        return;
    }
    
    // Находим подходящие боеприпасы для дробовика
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === 'Дробовик' && ammo.quantity > 0
    );
    
    if (compatibleAmmo.length === 0) {
        showModal('Нет боеприпасов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">У вас нет патронов для дробовика!</p>
            </div>
        `);
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
                <h3>&#x1F504; Перезарядка дробовика: ${weapon.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;"><strong>Текущее состояние:</strong></p>
                    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
                        <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">
                            Слот 1: ${weapon.shotgunAmmo1.count}/3 ${weapon.shotgunAmmo1.type ? `(${weapon.shotgunAmmo1.type})` : '(пусто)'}
                        </p>
                        <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">
                            Слот 2: ${weapon.shotgunAmmo2.count}/3 ${weapon.shotgunAmmo2.type ? `(${weapon.shotgunAmmo2.type})` : '(пусто)'}
                        </p>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label class="input-label">Выберите слот для перезарядки</label>
                    <select class="input-field" id="shotgunSlot">
                        <option value="1">Слот 1 (${weapon.shotgunAmmo1.count}/3)</option>
                        <option value="2">Слот 2 (${weapon.shotgunAmmo2.count}/3)</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label class="input-label">Выберите тип боеприпасов</label>
                    <select class="input-field" id="shotgunAmmoType">
                        ${compatibleAmmo.map((ammo, index) => `
                            <option value="${index}">${ammo.type} (${ammo.quantity} шт.)</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="executeShotgunReload('${weaponId}')">
                    &#x1F504; Перезарядить
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
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .ammo-category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('ammo-filter-styles')) {
        style.id = 'ammo-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем первый тип боеприпасов по умолчанию
    filterAmmo(AMMO_DATA.types[0]);
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации боеприпасов
function filterAmmo(category) {
    const container = document.getElementById('ammoShopContent');
    if (!container) return;
    
    // Обновляем активный фильтр
    document.querySelectorAll('.ammo-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-ammo-category') === category) {
            btn.classList.add('active');
        }
    });
    
    let contentHTML = '';
    
    if (category === 'Активная защита') {
        // Рендерим активную защиту
        const activeDefenseItems = [
            { name: 'Пиропатрон', description: 'Для дробовой активной защиты (урон 4d4)', price: 50 },
            { name: 'Высоковольтная мини-батарея', description: 'Для лазерной активной защиты (без урона)', price: 250 },
            { name: 'Микроракета', description: 'Для микроракетной активной защиты (урон 6d6)', price: 500 }
        ];
        
        contentHTML = activeDefenseItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">${item.name}</h4>
                </div>
                
                <p class="shop-item-description">
                    ${item.description}
                </p>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="ammo-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${item.price}">
                        ${item.price} уе
                    </span>
                    <button class="pill-button primary-button" onclick="showAmmoQuantityModal('Активная защита', '${item.name}', ${item.price})" data-ammo-type="Активная защита" data-weapon-type="${item.name}" data-price="${item.price}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        // Рендерим обычные боеприпасы
        const ammoItems = [];
        for (const [weaponTypeFull, weaponTypeShort] of Object.entries(AMMO_DATA.weaponTypes)) {
            const price = AMMO_DATA.prices[category][weaponTypeShort];
            
            if (price !== null) {
                ammoItems.push({
                    weaponType: weaponTypeFull,
                    weaponTypeShort: weaponTypeShort,
                    price: price
                });
            }
        }
        
        contentHTML = ammoItems.map(item => `
            <div class="shop-item">
                <div class="shop-item-header">
                    <h4 class="shop-item-title">${item.weaponType}</h4>
                </div>
                
                <div class="shop-item-stats">
                    <div class="shop-stat">Тип: ${category}</div>
                    <div class="shop-stat">Класс: ${item.weaponTypeShort}</div>
                    <div class="shop-stat">Нагрузка: 1</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <span class="ammo-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${item.price}">
                        ${item.price} уе
                    </span>
                    <button class="pill-button primary-button" onclick="showAmmoQuantityModal('${category}', '${item.weaponType}', ${item.price})" data-ammo-type="${category}" data-weapon-type="${item.weaponType}" data-price="${item.price}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    container.innerHTML = contentHTML;
}

function executeShotgunReload(weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const selectedSlot = parseInt(document.getElementById('shotgunSlot').value);
    const selectedAmmoIndex = parseInt(document.getElementById('shotgunAmmoType').value);
    
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === 'Дробовик' && ammo.quantity > 0
    );
    const selectedAmmo = compatibleAmmo[selectedAmmoIndex];
    
    if (!selectedAmmo) {
        showModal('Ошибка', 'Выбранные боеприпасы не найдены!');
        return;
    }
    
    const slotData = selectedSlot === 1 ? weapon.shotgunAmmo1 : weapon.shotgunAmmo2;
    
    // Если в слоте есть патроны другого типа, возвращаем их в блок Боеприпасы
    if (slotData.count > 0 && slotData.type && slotData.type !== selectedAmmo.type) {
        const existingAmmoIndex = state.ammo.findIndex(a => 
            a.type === slotData.type && a.weaponType === 'Дробовик'
        );
        
        if (existingAmmoIndex !== -1) {
            state.ammo[existingAmmoIndex].quantity += slotData.count;
        } else {
            const newAmmo = {
                id: generateId('ammo'),
                type: slotData.type,
                weaponType: 'Дробовик',
                quantity: slotData.count,
                price: 0
            };
            state.ammo.push(newAmmo);
        }
    }
    
    // Рассчитываем сколько патронов нужно для полной перезарядки слота
    const ammoNeeded = 3 - (slotData.type === selectedAmmo.type ? slotData.count : 0);
    const ammoToTake = Math.min(ammoNeeded, selectedAmmo.quantity);
    
    // Находим индекс в основном массиве боеприпасов
    const realAmmoIndex = state.ammo.findIndex(ammo => ammo.id === selectedAmmo.id);
    
    if (realAmmoIndex !== -1) {
        // Вычитаем патроны из блока Боеприпасы
        state.ammo[realAmmoIndex].quantity -= ammoToTake;
        
        // Заряжаем слот дробовика
        slotData.count = (slotData.type === selectedAmmo.type ? slotData.count : 0) + ammoToTake;
        slotData.type = selectedAmmo.type;
        
        renderAmmo();
        renderWeapons();
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        
        const reloadMessage = ammoToTake === ammoNeeded ? 
            `Слот ${selectedSlot} полностью заряжен!` : 
            `В слот ${selectedSlot} заряжено ${ammoToTake} из ${ammoNeeded} патронов`;
        
        showModal('Перезарядка завершена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${weapon.name}</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;">${reloadMessage}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Тип: ${selectedAmmo.type} | Патронов: ${slotData.count}/3</p>
            </div>
        `);
    }
}


// Добавляем стили для фильтров модулей оружия
const weaponModuleStyle = document.createElement('style');
weaponModuleStyle.textContent = `
    .weapon-module-category-filter.active {
        background: var(--accent) !important;
        color: white !important;
    }
`;
if (!document.getElementById('weapon-module-filter-styles')) {
    weaponModuleStyle.id = 'weapon-module-filter-styles';
    document.head.appendChild(weaponModuleStyle);
}

// Переопределяем функцию showWeaponModulesShop чтобы добавить вызов фильтрации
const originalShowWeaponModulesShop = showWeaponModulesShop;
showWeaponModulesShop = function() {
    originalShowWeaponModulesShop();
    // Загружаем модули ближнего боя по умолчанию
    setTimeout(() => filterWeaponModules('melee'), 100);
};

console.log('weapons.js loaded - weapon system ready');

// Убеждаемся, что функция rollWeaponDamage доступна в глобальной области видимости
if (typeof window.rollWeaponDamage !== 'function') {
    window.rollWeaponDamage = rollWeaponDamage;
    console.log('rollWeaponDamage экспортирована в глобальную область видимости');
}

// Экспортируем функцию для мини-станины
window.executeMiniStandWeaponDamageRoll = executeMiniStandWeaponDamageRoll;
