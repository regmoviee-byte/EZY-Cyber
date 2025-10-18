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
            bgLight: 'rgba(0, 0, 0, 0.2)',
            bgMedium: 'rgba(0, 0, 0, 0.3)',
            bgDark: 'rgba(0, 0, 0, 0.5)',
            successLight: 'rgba(125, 244, 198, 0.1)',
            dangerLight: 'rgba(255, 91, 135, 0.1)',
            warningLight: 'rgba(255, 165, 0, 0.1)',
            accentLight: 'rgba(182, 103, 255, 0.1)'
        };
    }
}

// Функции управления секциями
function collapseAllSections() {
    const sections = document.querySelectorAll('.section:not(.full-width-section)');
    sections.forEach(section => {
        const content = section.querySelector('.section-content');
        
        if (content && content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            content.style.display = 'none';
        }
    });
}

// Дубль toggleSection и expandSection удален (полная версия на строке 965+)

// Загрузочный экран с синхронизацией текста и прогресса
function initLoadingScreen() {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const loadingScreen = document.getElementById('loadingScreen');
    const mainInterface = document.getElementById('mainInterface');
    let currentProgress = 0;
    let currentItem = 0;
    let typingInProgress = false;
    
    const logMessages = [
        '[SYS] Инициализация системы управления персонажем... OK',
        '[MEM] Выделение памяти для данных персонажа... OK',
        '[SEC] Проверка целостности протоколов безопасности... OK',
        '[NET] Подключение к базе данных навыков... OK',
        '[GFX] Инициализация графического интерфейса... OK',
        '[UX] Подготовка пользовательского интерфейса... OK'
    ];
    
    function typeText(element, text, callback) {
        element.classList.add('typing');
        typingInProgress = true;
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                element.textContent = text.substring(0, index + 1);
                index++;
            } else {
                clearInterval(typeInterval);
                element.classList.remove('typing');
                typingInProgress = false;
                if (callback) callback();
            }
        }, 5); // Очень быстрая печать для гарантии успеть
    }
    
    function updateProgressBar() {
        // Получаем реальный прогресс загрузки
        let realProgress = 0;
        
        if (document.readyState === 'loading') {
            realProgress = 20;
        } else if (document.readyState === 'interactive') {
            realProgress = 60;
        } else if (document.readyState === 'complete') {
            realProgress = 100;
        }
        
        // Плавно движемся к реальному прогрессу
        if (currentProgress < realProgress) {
            currentProgress = Math.min(currentProgress + 1, realProgress);
        }
        
        progressBar.style.width = currentProgress + '%';
        progressText.textContent = Math.round(currentProgress) + '%';
        
        // Рассчитываем какая строка должна быть напечатана при текущем прогрессе
        const targetLine = Math.floor((currentProgress / 95) * logMessages.length);
        
        // Если нужно напечатать новую строку и не идет печать
        if (targetLine > currentItem && currentItem < logMessages.length && !typingInProgress) {
            const item = document.getElementById(`logItem${currentItem + 1}`);
            if (item && item.textContent === '') {
                const currentIdx = currentItem;
                typeText(item, logMessages[currentIdx], () => {
                    currentItem = currentIdx + 1;
                });
            }
        }
        
        return currentProgress;
    }
    
    // Обновляем прогресс каждые 20мс для более частой проверки
    const progressInterval = setInterval(() => {
        const progress = updateProgressBar();
        
        // Если достигли 95% - форсируем печать оставшихся строк
        if (progress >= 95 && currentItem < logMessages.length) {
            for (let i = currentItem; i < logMessages.length; i++) {
                const item = document.getElementById(`logItem${i + 1}`);
                if (item && item.textContent === '') {
                    item.textContent = logMessages[i];
                    item.classList.remove('typing');
                }
            }
            currentItem = logMessages.length;
        }
        
        if (progress >= 100) {
            clearInterval(progressInterval);
            // Дополнительная секунда перед открытием
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                mainInterface.classList.add('loaded');
                loadState(); // This calls updateUIFromState() internally
                initAvatarUpload();
                renderRollLog();
                updateMoneyDisplay();
                calculateAndUpdateHealth();
                updateDerivedStats();
                
                // ИСПРАВЛЕНИЕ БАГА: Пересчитываем нагрузку после загрузки
                recalculateLoadFromInventory();
                updateLoadDisplay();
                
                renderSkills();
                renderProfessionalSkills();
                if (typeof renderCriticalInjuries === 'function') renderCriticalInjuries();
                
                // Дополнительный вызов для профессиональных навыков с задержкой
                setTimeout(() => {
                    renderProfessionalSkills();
                }, 100);
                renderDeckPrograms();
                if (typeof renderDeckChips === 'function') renderDeckChips();
                renderImplants();
                renderWeapons();
                renderAmmo();
                renderHousing();
                // renderVehicles(); // Удалено - используется новая система transport.js
                if (typeof renderTransport === 'function') renderTransport();
                if (typeof renderVehicleModulesInventory === 'function') renderVehicleModulesInventory();
                renderGear();
                
                // Финальный вызов для профессиональных навыков
                setTimeout(() => {
                    renderProfessionalSkills();
                }, 200);
            }, 1000); // +1 секунда после 100%
        }
    }, 20); // Чаще обновляем для лучшей синхронизации
}

// Математические расчеты
function calculateDerivedStats() {
    const body = parseInt(state.stats.BODY) || 0;
    const dex = parseInt(state.stats.DEX) || 0;
    
    // Врождённая ОС = Телосложение / 3, округление вверх
    const armor = Math.ceil(body / 3);
    
    // Скорость перемещения = ЛВК
    const speed = dex;
    
    // Скорость атаки = ЛВК / 3 с округлением в большую сторону
    const attackSpeed = Math.ceil(dex / 3);
    
    // Максимальная нагрузка = ТЕЛО * Атлетика (минимум 25, максимум 100)
    const athletics = state.skills.find(s => s.name === 'Атлетика')?.level || 0;
    const maxLoad = Math.min(100, Math.max(25, body * athletics));
    
    return { armor, speed, attackSpeed, maxLoad };
}

function calculateAndUpdateHealth() {
    const will = Number(state.stats.WILL || 0);
    const body = Number(state.stats.BODY || 0);
    let maxHp = Math.ceil(((will + 10) * body) / 2);
    
    // Применяем штраф от титанической брони если она подключена
    const penalties = calculateArmorPenalties();
    if (penalties.healthPenalty !== 0) {
        maxHp += penalties.healthPenalty; // healthPenalty уже отрицательный
    }
    
    // Минимум 1 ОСП
    maxHp = Math.max(1, maxHp);
    
    state.health.max = maxHp;
    
    // Проверяем, не превышает ли текущее здоровье максимум
    let current = Number(state.health.current || 0);
    if (current > maxHp) current = maxHp;
    state.health.current = current;
    
    // Обновляем отображение
    const maxEl = document.getElementById('healthMax');
    const curEl = document.getElementById('healthCurrent');
    if (maxEl) maxEl.value = maxHp;
    if (curEl) curEl.value = current;
}

function updateDerivedStats() {
    const derived = calculateDerivedStats();
    
    // Обновляем все производные характеристики
    const derivedArmorEl = document.getElementById('derivedArmor');
    const derivedSpeedEl = document.getElementById('derivedSpeed');
    const derivedAttackSpeedEl = document.getElementById('derivedAttackSpeed');
    const maxLoadEl = document.getElementById('maxLoad');
    
    if (derivedArmorEl) derivedArmorEl.textContent = derived.armor;
    if (derivedSpeedEl) derivedSpeedEl.textContent = derived.speed;
    if (derivedAttackSpeedEl) derivedAttackSpeedEl.textContent = derived.attackSpeed;
    if (maxLoadEl) maxLoadEl.textContent = derived.maxLoad;
    
    state.load.max = derived.maxLoad;
    
    // Обновляем только отображение максимальной нагрузки, не пересчитывая текущую
    const currentLoadEl = document.getElementById('currentLoad');
    
    if (currentLoadEl) currentLoadEl.textContent = state.load.current;
    if (maxLoadEl) maxLoadEl.textContent = state.load.max;
}

// Функция пересчета нагрузки из инвентаря (исправление бага после перезагрузки)
function recalculateLoadFromInventory() {
    let totalLoad = 0;
    
    // Считаем нагрузку от снаряжения
    if (state.gear && Array.isArray(state.gear)) {
        state.gear.forEach(item => {
            const itemLoad = parseFloat(item.load) || 0;
            
            // Проверяем особые состояния предмета
            const isEquipped = item.equipped || item.worn || item.activated || item.installed;
            
            // Специальная логика для велосипеда
            if (item.name === 'СКЛАДНОЙ ВЕЛОСИПЕД') {
                if (item.bikeMode === 'ride') {
                    // Велосипед в режиме "катить" - нагрузка 0
                    return; // Пропускаем этот предмет
                } else {
                    // Велосипед в режиме "нести" - нагрузка 36
                    totalLoad += 36;
                    return;
                }
            }
            
            // Специальная логика для рюкзака, прикрепленного к велосипеду
            if (item.attachedToBike && item.attachedToBikeId) {
                // Рюкзак прикреплен к велосипеду - нагрузка 0
                return; // Пропускаем этот предмет
            }
            
            // Если предмет надето/активировано и имеет флаг zeroLoadWhenEquipped, нагрузка = 0
            if (isEquipped && item.zeroLoadWhenEquipped) {
                // Не добавляем нагрузку предмета
                
                // Но для рюкзака и кейса учитываем нагрузку содержимого
                if (item.storage && Array.isArray(item.storage)) {
                    item.storage.forEach(storedItem => {
                        totalLoad += parseFloat(storedItem.load) || 0;
                    });
                }
            } else if (item.storedItem) {
                // Сумка: нагрузка самой сумки, но НЕ предмета внутри
                totalLoad += itemLoad;
                // Предмет в сумке не учитывается
            } else if (item.storage && Array.isArray(item.storage)) {
                // Хранилище (рюкзак/кейс) когда не надето: нагрузка контейнера + содержимое
                totalLoad += itemLoad;
                item.storage.forEach(storedItem => {
                    totalLoad += parseFloat(storedItem.load) || 0;
                });
            } else {
                totalLoad += itemLoad;
            }
        });
    }
    
    // Считаем нагрузку от модулей транспорта (только не установленные)
    if (state.vehicleModules && Array.isArray(state.vehicleModules)) {
        state.vehicleModules.forEach(module => {
            // Модули на транспорте имеют нагрузку 0, в инвентаре - 10
            if (!module.isInstalled) {
                totalLoad += parseFloat(module.weight) || 10;
            }
        });
    }
    
    // Собираем ID оружия, установленного на транспорте
    const weaponsOnVehicles = new Set();
    if (state.property?.vehicles && Array.isArray(state.property.vehicles)) {
        state.property.vehicles.forEach(vehicle => {
            if (vehicle.modules && Array.isArray(vehicle.modules)) {
                vehicle.modules.forEach(module => {
                    if (module.weapons && Array.isArray(module.weapons)) {
                        module.weapons.forEach(weapon => {
                            if (weapon.inventoryWeaponId) {
                                weaponsOnVehicles.add(weapon.inventoryWeaponId);
                            }
                        });
                    }
                });
            }
        });
    }
    
    // Считаем нагрузку от оружия (исключая оружие на транспорте)
    if (state.weapons && Array.isArray(state.weapons)) {
        state.weapons.forEach(weapon => {
            // Оружие на транспорте не учитывается в нагрузке
            if (!weaponsOnVehicles.has(weapon.id)) {
                totalLoad += parseFloat(weapon.load) || 0;
            }
        });
    }
    
    // Считаем нагрузку от боеприпасов
    if (state.ammo && Array.isArray(state.ammo)) {
        state.ammo.forEach(ammo => {
            const isGrenadeOrRocket = ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты';
            const ammoLoad = isGrenadeOrRocket ? ammo.quantity : Math.ceil(ammo.quantity / 10);
            totalLoad += ammoLoad;
        });
    }
    
    // Считаем нагрузку от брони (не надетой)
    if (state.armorInventory && Array.isArray(state.armorInventory)) {
        state.armorInventory.forEach(armor => {
            // Броня в инвентаре (не надетая) имеет нагрузку
            if (!armor.equipped) {
                totalLoad += parseFloat(armor.load) || 0;
            }
        });
    }
    
    // Обновляем текущую нагрузку
    const maxLoad = state.load.max || calculateDerivedStats().maxLoad;
    state.load.current = maxLoad - totalLoad;
    
    // Нагрузка пересчитана
}

function updateAwarenessMax() {
    const int = Number(state.stats.INT || 5);
    const newMax = int * 10;
    
    // Обновляем максимальную осознанность
    state.awareness.max = newMax;
    
    // Проверяем, не превышает ли текущая осознанность максимум
    let current = Number(state.awareness.current || 50);
    if (current > newMax) current = newMax;
    state.awareness.current = current;
    
    // Обновляем отображение
    const maxEl = document.getElementById('awarenessMax');
    const curEl = document.getElementById('awarenessCurrent');
    if (maxEl) maxEl.value = newMax;
    if (curEl) curEl.value = current;
}

function updateLoadWarning() {
    const currentLoad = state.load.current;
    const maxLoad = state.load.max;
    
    const warningEl = document.getElementById('loadWarning');
    if (warningEl) {
        if (currentLoad > maxLoad) {
            const excess = currentLoad - maxLoad;
            const penalty = Math.ceil(excess / 5);
            warningEl.textContent = `Штраф ${penalty} от нагрузки!`;
            warningEl.style.color = getThemeColors().danger;
        } else {
            warningEl.textContent = `Нагрузка: ${currentLoad}/${maxLoad}`;
            warningEl.style.color = getThemeColors().text;
        }
    }
}

// Система бросков кубиков
function rollDice(count, sides) {
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }
    return rolls;
}

function rollSkillCheck(skillIndex) {
    const index = typeof skillIndex === 'string' ? parseInt(skillIndex) : skillIndex;
    const skillData = state.skills[index];
    if (!skillData) return;
    
    const selectedStat = document.getElementById('skillCheckStat').value;
    const modifier = parseInt(document.getElementById('skillCheckModifier').value) || 0;
    let statValue = state.stats[selectedStat] || 5;
    const skillLevel = skillData.level || 0;
    const skillName = skillData.customName || skillData.name;
    
    // Применяем штрафы от брони
    const penalties = calculateArmorPenalties();
    let armorPenalty = 0;
    
    switch (selectedStat) {
        case 'DEX':
            // Для ЛВК применяем штраф к ЛВК, но не к скорости перемещения
            armorPenalty = penalties.dexterity;
            break;
        case 'REA':
            armorPenalty = penalties.reaction;
            break;
        default:
            armorPenalty = 0;
            break;
    }
    
    // Применяем штраф с учетом минимумов
    if (armorPenalty !== 0) {
        if (selectedStat === 'DEX') {
            // Для ЛВК минимум 1
            statValue = Math.max(1, statValue + armorPenalty);
        } else {
            // Для остальных характеристик минимум 1
            statValue = Math.max(1, statValue + armorPenalty);
        }
    }
    
    // Проверяем бонус от мультитула (для проверок с ТЕХ)
    let multitoolBonus = 0;
    if (selectedStat === 'TECH') {
        const activeMultitool = state.gear && state.gear.find(item => 
            item.name && item.name.includes('МУЛЬТИТУЛ') && item.activated
        );
        if (activeMultitool) {
            multitoolBonus = 2;
        }
    }
    
    // Бросаем 2d6
    const dice = rollDice(2, 6);
    let total = statValue + skillLevel + modifier + multitoolBonus + dice[0] + dice[1];
    let criticalText = '';
    let d4Value = null;
    let d4Type = null; // 'penalty' или 'bonus'
    
    // Специальные правила:
    if (dice[0] === 1 && dice[1] === 1) {
        criticalText = 'ЭКСТРЕМАЛЬНЫЙ ПРОВАЛ!';
        total = 'ПРОВАЛ';
    } else if (dice[0] === 6 && dice[1] === 6) {
        criticalText = 'ЭКСТРЕМАЛЬНЫЙ УСПЕХ!';
        total = 'УСПЕХ';
    } else if (dice.includes(1) && dice.includes(6)) {
        // 1 и 6 одновременно - ничего не происходит
    } else if (dice[0] === 1 || dice[1] === 1) {
        // Есть единица на одном из D6 - вычитаем 1d4
        d4Value = rollDice(1, 4)[0];
        d4Type = 'penalty';
        total -= d4Value;
    } else if (dice[0] === 6 || dice[1] === 6) {
        // Есть шестерка на одном из D6 - добавляем 1d4
        d4Value = rollDice(1, 4)[0];
        d4Type = 'bonus';
        total += d4Value;
    }
    
    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const armorPenaltyStr = armorPenalty !== 0 ? ` (броня: ${armorPenalty > 0 ? '+' : ''}${armorPenalty})` : '';
    const multitoolBonusStr = multitoolBonus > 0 ? ` (мультитул)` : '';
    const formula = `${statValue}${armorPenaltyStr}+${skillLevel}${modifierStr}${multitoolBonus > 0 ? `+${multitoolBonus}` : ''}${multitoolBonusStr}+${dice[0]}+${dice[1]}${d4Value ? (d4Type === 'penalty' ? '-' + d4Value : '+' + d4Value) : ''} = ${total}`;
    
    // Анимация броска
    showDiceAnimation(dice, total, criticalText, formula, skillName, d4Value, d4Type);
    
    // Добавляем в лог
    addToRollLog('skill', {
        skill: skillName,
        formula: formula,
        total: total,
        critical: criticalText
    });
}

// Дубль rollUniversalDice удален (полная версия с анимацией на строке 1117)

// Новая система лога бросков
window.addToRollLog = function(type, data) {
    const entry = {
        type: type,
        timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...data
    };
    
    state.rollLog.push(entry);
    
    // Ограничиваем лог 100 записями
    if (state.rollLog.length > 100) {
        state.rollLog = state.rollLog.slice(-100);
    }
    
    scheduleSave();
    renderRollLog();
}

function renderRollLog() {
    const logContainer = document.getElementById('floatingLogContent');
    if (!logContainer) return;
    
    if (state.rollLog.length === 0) {
        const colors = getThemeColors();
        logContainer.innerHTML = `<div style="color: ${colors.muted}; text-align: center; padding: 2rem; font-size: 0.9rem;">Лог бросков пуст</div>`;
        return;
    }
    
    // Формируем HTML для каждой записи
    const logsHTML = state.rollLog.map(entry => {
        let text = '';
        const colors = getThemeColors();
        
        switch(entry.type) {
            case 'skill':
                text = `<strong>${entry.skill}</strong>: ${entry.formula} = <strong>${entry.total}</strong>${entry.critical ? ` <span style="color: ${colors.danger};">${entry.critical}</span>` : ''}`;
                break;
            
            case 'weapon_damage':
                text = `<strong>${entry.weaponName}</strong>: ${entry.formula} = <strong>${entry.total}</strong>${entry.ammoType ? ` (${entry.ammoType})` : ''}${entry.fireMode ? ` [${entry.fireMode}]` : ''}${entry.isCritical ? ' <span style="color: ${getThemeColors().danger}; font-weight: 600;">КРИТИЧЕСКАЯ ТРАВМА!</span>' : ''}`;
                break;
            
            case 'universal':
                text = `<strong>${entry.count}d${entry.sides}</strong>${entry.modifier !== 0 ? `+${entry.modifier}` : ''}: ${entry.dice.join(', ')} = <strong>${entry.total}</strong>`;
                break;
            
            case 'purchase':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Покупка: <strong>${entry.item}</strong> за <strong style="color: ${getThemeColors().danger};">${entry.price} уе</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'transaction':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Зачислено <strong style="color: #00ff88; font-weight: bold;">${entry.amount} уе</strong> (${entry.source})${entry.taxPaid > 0 ? ` [Налог: ${entry.taxPaid} уе]` : ''}`;
                break;
            
            case 'fence_sale':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Продано: <strong>${entry.item}</strong> за <strong style="color: var(--success);">${entry.price} уе</strong>`;
                break;
            
            case 'rent':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="🏠" style="width: 16px; height: 16px; vertical-align: middle;"> Аренда: <strong>${entry.item}</strong> за <strong style="color: var(--warning);">${entry.price} уе/мес</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'rent_payment':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💳" style="width: 16px; height: 16px; vertical-align: middle;"> Оплата аренды: <strong>${entry.item}</strong> <strong style="color: var(--warning);">${entry.price} уе</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'move_in':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="🏠" style="width: 16px; height: 16px; vertical-align: middle;"> Заселение: <strong>${entry.item}</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'move':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="🏠" style="width: 16px; height: 16px; vertical-align: middle;"> Заселение: <strong>${entry.item}</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'initiative':
                const d4Str = entry.d4Value ? (entry.d4Type === 'penalty' ? ` - d4(${entry.d4Value})` : ` + d4(${entry.d4Value})`) : '';
                text = `<img src="https://static.tildacdn.com/tild3765-3433-4435-b435-636665663530/target_1.png" alt="🎯" style="width: 16px; height: 16px; vertical-align: middle;"> Бросок инициативы: <strong style="color: var(--accent);">${entry.total}</strong> (2d6: ${entry.dice1}+${entry.dice2} + РЕА: ${entry.reaction} + Мод: ${entry.modifier}${d4Str})`;
                break;
            
            default:
                // Если тип содержит "🎯 Расчет расстояния", отображаем его как обычный текст
                if (entry.type && entry.type.includes('🎯 Расчет расстояния')) {
                    text = entry.type;
                } else {
                    text = entry.text || JSON.stringify(entry);
                }
        }
        
        return `
            <div style="padding: 0.4rem 0.75rem; border-bottom: 1px solid rgba(182, 103, 255, 0.05); font-size: 0.85rem; line-height: 1.4;">
                <span style="color: var(--muted); font-family: monospace; font-size: 0.75rem; margin-right: 0.5rem;">${entry.timestamp}</span>
                <span style="color: ${getThemeColors().text};">${text}</span>
            </div>
        `;
    }).join('');
    
    logContainer.innerHTML = logsHTML;
    
    // Прокручиваем к последней записи
    setTimeout(() => {
        logContainer.scrollTop = logContainer.scrollHeight;
    }, 10);
}

function showDiceAnimation(dice, total, criticalText, formula, skillName, d4Value, d4Type) {
    const diceAnimation = document.getElementById('skillCheckDiceAnimation');
    const dice1 = document.getElementById('skillCheckDice1');
    const dice2 = document.getElementById('skillCheckDice2');
    const d4Left = document.getElementById('skillCheckD4Left');
    const d4Right = document.getElementById('skillCheckD4Right');
    const result = document.getElementById('skillCheckResult');
    const critical = document.getElementById('skillCheckCritical');
    const formulaDiv = document.getElementById('skillCheckFormula');
    
    if (diceAnimation) diceAnimation.style.display = 'flex';
    if (result) {
        result.textContent = 'Рассчитываем';
        result.classList.add('loading-dots');
    }
    
    // Очищаем критический текст перед новым броском
    if (critical) {
        critical.textContent = '';
        critical.style.display = 'none';
    }
    
    // Скрываем формулу сначала
    if (formulaDiv) {
        formulaDiv.style.display = 'none';
    }
    
    // Скрываем d4 сначала
    if (d4Left) {
        d4Left.style.display = 'none';
        d4Left.classList.remove('rolling');
    }
    if (d4Right) {
        d4Right.style.display = 'none';
        d4Right.classList.remove('rolling');
    }
    
    // Основная анимация d6 - 1.2 секунды
    const mainDuration = 1200;
    const interval = 80;
    const mainIterations = Math.ceil(mainDuration / interval);
    let step = 0;
    
    const mainAnimation = setInterval(() => {
        if (dice1) dice1.textContent = Math.floor(Math.random() * 6) + 1;
        if (dice2) dice2.textContent = Math.floor(Math.random() * 6) + 1;
        
        step++;
        
        if (step >= mainIterations) {
            clearInterval(mainAnimation);
            
            // Показываем финальные значения d6
            if (dice1) {
                dice1.textContent = dice[0];
                dice1.classList.remove('rolling');
            }
            if (dice2) {
                dice2.textContent = dice[1];
                dice2.classList.remove('rolling');
            }
            
            // Запускаем анимацию d4 ПОСЛЕ основного броска
            if (d4Value && d4Type) {
                animateD4(d4Value, d4Type, d4Left, d4Right, () => {
                    // Показываем результат после анимации d4
                    showFinalResult();
                });
            } else {
                // Если нет d4, сразу показываем результат
                showFinalResult();
            }
        }
    }, interval);
    
    function animateD4(d4Value, d4Type, d4Left, d4Right, callback) {
        const d4El = d4Type === 'penalty' ? d4Left : d4Right;
        if (!d4El) {
            callback();
            return;
        }
        
        // Показываем и начинаем анимацию d4
        d4El.style.display = 'flex';
        d4El.classList.add('rolling');
        
        const d4Duration = 500; // 0.5 секунды для d4
        const d4Iterations = Math.ceil(d4Duration / interval);
        let d4Step = 0;
        
        const d4Animation = setInterval(() => {
            d4El.textContent = Math.floor(Math.random() * 4) + 1;
            d4Step++;
            
            if (d4Step >= d4Iterations) {
                clearInterval(d4Animation);
                d4El.textContent = d4Value;
                d4El.classList.remove('rolling');
                callback();
            }
        }, interval);
    }
    
    function showFinalResult() {
        // Показываем формулу
        if (formulaDiv && formula) {
            formulaDiv.textContent = formula;
            formulaDiv.style.display = 'block';
        }
        
        if (result) {
            result.classList.remove('loading-dots');
            result.textContent = total;
        }
        if (criticalText && critical) {
            critical.textContent = criticalText;
            critical.style.display = 'block';
            critical.style.color = criticalText.includes('ПРОВАЛ') ? 'var(--danger)' : '#7bd7ff';
            critical.style.fontSize = '1.5rem';
            critical.style.fontWeight = 'bold';
            critical.style.marginTop = '1rem';
            critical.style.textAlign = 'center';
        }
    }
}

function showSkillCheckModal(skillIndex) {
    const index = typeof skillIndex === 'string' ? parseInt(skillIndex) : skillIndex;
    const skillData = state.skills[index];
    if (!skillData) return;
    
    const skillName = skillData.customName || skillData.name;
    const skillStat = skillData.stat;
    const skillLevel = skillData.level || 0;
    const statValue = state.stats[skillStat] || 5;
    
    // Маппинг английских названий характеристик на русские
    const statNames = {
        'WILL': 'Воля',
        'INT': 'Ум',
        'DEX': 'Ловкость',
        'BODY': 'Телосложение',
        'REA': 'Реакция',
        'TECH': 'Техника',
        'CHA': 'Характер'
    };
    
    const statName = statNames[skillStat] || skillStat;
    
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
                <h3>Проверка навыка: ${skillName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.75rem;"><strong>${skillName}</strong></p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Характеристика: <strong style="color: var(--accent);">${statName}</strong> (${statValue}) | 
                        Навык: <strong style="color: var(--success);">${skillLevel}</strong>
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <label class="field">
                        Характеристика
                        <select id="skillCheckStat" style="width: 100%;">
                            <option value="WILL" ${skillStat === 'WILL' ? 'selected' : ''}>Воля (${state.stats.WILL || 0})</option>
                            <option value="INT" ${skillStat === 'INT' ? 'selected' : ''}>Ум (${state.stats.INT || 0})</option>
                            <option value="DEX" ${skillStat === 'DEX' ? 'selected' : ''}>Ловкость (${state.stats.DEX || 0})</option>
                            <option value="BODY" ${skillStat === 'BODY' ? 'selected' : ''}>Телосложение (${state.stats.BODY || 0})</option>
                            <option value="REA" ${skillStat === 'REA' ? 'selected' : ''}>Реакция (${state.stats.REA || 0})</option>
                            <option value="TECH" ${skillStat === 'TECH' ? 'selected' : ''}>Техника (${state.stats.TECH || 0})</option>
                            <option value="CHA" ${skillStat === 'CHA' ? 'selected' : ''}>Характер (${state.stats.CHA || 0})</option>
                        </select>
                    </label>
                    
                    <label class="field">
                        Модификатор
                        <input type="number" id="skillCheckModifier" value="0" placeholder="Например: +2 или -1" />
                    </label>
                </div>
                
                <div id="skillCheckDiceAnimation" style="display: none; flex-direction: column; align-items: center; gap: 1rem;">
                    <div style="display: flex; gap: 0.75rem; align-items: center;">
                        <div id="skillCheckD4Left" class="d4-triangle d4-penalty" style="display: none;">?</div>
                        <div id="skillCheckDice1" class="dice rolling" style="animation: roll 1.5s ease-in-out;">?</div>
                        <div id="skillCheckDice2" class="dice rolling" style="animation: roll 1.5s ease-in-out;">?</div>
                        <div id="skillCheckD4Right" class="d4-triangle d4-bonus" style="display: none;">?</div>
                    </div>
                    <div id="skillCheckFormula" style="color: var(--muted); font-size: 0.9rem; text-align: center; margin-top: 0.5rem; display: none;"></div>
                    <div id="skillCheckResult" class="dice-result loading-dots">Рассчитываем</div>
                    <div id="skillCheckCritical" class="dice-special" style="display: none;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="rollSkillCheck(${index})">
                    🎲 Бросить кубики
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

function closeModal(button) {
    // Находим ближайший modal-overlay к кнопке
    const modal = button ? button.closest('.modal-overlay') : null;
    if (modal) {
        modal.remove();
    }
}

// Функция для показа toast-уведомлений (не блокирует интерфейс)
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1a2633, #213040);
        color: var(--success);
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        border: 1px solid var(--success);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-size: 0.9rem;
        max-width: 300px;
    `;
    toast.innerHTML = `✅ ${message}`;
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    if (!document.querySelector('style[data-toast-styles]')) {
        style.setAttribute('data-toast-styles', 'true');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Автоматически удаляем через заданное время
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Закрываем по клику
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
    });
}

// Универсальная функция для добавления обработчиков клавиш к модалу
function addModalKeyboardHandlers(modal) {
    const keyHandler = function(e) {
        // Escape всегда закрывает модал (нажимает кнопку ×)
        if (e.key === 'Escape' || e.key === 'Esc') {
            e.preventDefault();
            e.stopPropagation();
            const closeButton = modal.querySelector('.icon-button');
            if (closeButton) {
                closeButton.click();
            }
            document.removeEventListener('keydown', keyHandler);
            return;
        }
        
        // Enter нажимает кнопки подтверждения, но только если не в поле ввода
        if (e.key === 'Enter') {
            // Не обрабатываем Enter в полях ввода
            if (e.target.matches('select') || e.target.matches('textarea') || e.target.matches('input[type="text"]') || e.target.matches('input[type="number"]') || e.target.matches('input[type="email"]') || e.target.matches('input[type="password"]')) {
                return;
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // Находим все кнопки в модале (кроме кнопки закрытия ×)
            const allButtons = modal.querySelectorAll('button:not(.icon-button)');
            
            // Если есть только одна кнопка (кроме ×), нажимаем её
            if (allButtons.length === 1) {
                allButtons[0].click();
            }
            // Если есть несколько кнопок, ищем кнопку подтверждения
            else if (allButtons.length > 1) {
                const confirmButton = modal.querySelector('.primary-button, .success-button, .danger-button');
                if (confirmButton) {
                    confirmButton.click();
                }
            }
        }
    };
    
    document.addEventListener('keydown', keyHandler);
    
    // Удаляем обработчик при удалении модала
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.removeEventListener('keydown', keyHandler);
        originalRemove();
    };
}

function showModal(title, content, buttons = []) {
    // Создаем HTML для кнопок
    let buttonsHTML = '';
    if (buttons && buttons.length > 0) {
        buttonsHTML = `
            <div class="modal-footer">
                ${buttons.map(button => 
                    `<button class="pill-button ${button.class}" onclick="${button.onclick}">${button.text}</button>`
                ).join('')}
            </div>
        `;
    }
    
    const html = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${buttonsHTML}
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = html;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функции для работы с деньгами
window.updateMoneyDisplay = function() {
    const moneyEl = document.getElementById('money');
    if (moneyEl) {
        moneyEl.value = formatMoney(state.money);
    }
}

// Функция для обновления цвета репутации (цифра всегда белая)
function updateReputationColor() {
    const reputationValue = document.getElementById('reputationValue');
    if (!reputationValue) return;
    
    // Цифра всегда остается белой
    reputationValue.style.color = 'white';
}

function formatMoney(value) {
    const num = parseInt(String(value).replace(/\s+/g, '').replace(/[^0-9]/g, '')) || 0;
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Функции для генерации ID
function generateId(prefix) {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функции управления секциями
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    const button = section.querySelector('.pill-button');
    const collapsedSections = document.getElementById('collapsedSections');
    
    if (content.classList.contains('expanded')) {
        // Сворачиваем
        content.classList.remove('expanded');
        content.style.display = 'none';
        button.textContent = 'Развернуть';
        
        // Добавляем в свернутые
        const collapsedDiv = document.createElement('div');
        collapsedDiv.className = 'collapsed-section';
        collapsedDiv.innerHTML = `<div class="collapsed-title">${section.querySelector('.section-title').textContent}</div>`;
        collapsedDiv.onclick = () => expandSection(sectionId);
        collapsedSections.appendChild(collapsedDiv);
    } else {
        // Разворачиваем
        expandSection(sectionId);
    }
}

function expandSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    const button = section.querySelector('.pill-button');
    const collapsedSections = document.getElementById('collapsedSections');
    
    content.classList.add('expanded');
    content.style.display = 'block';
    button.textContent = 'Свернуть';
    
    // Удаляем из свернутых
    const collapsedItems = collapsedSections.querySelectorAll('.collapsed-section');
    collapsedItems.forEach(item => {
        if (item.textContent.includes(section.querySelector('.section-title').textContent)) {
            item.remove();
        }
    });
}

function clearRollLog() {
        state.rollLog = [];
        renderRollLog();
        scheduleSave();
}

// Универсальная бросалка
function showUniversalDiceModal() {
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
                <h3>🎲 Универсальная бросалка</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: flex; gap: 1rem; align-items: end;">
                    <div class="input-group" style="flex: 1;">
                        <label class="input-label">Количество кубиков</label>
                        <input type="number" class="input-field" id="universalDiceCount" value="5" min="1" max="20">
                    </div>
                    <div class="input-group" style="flex: 1;">
                        <label class="input-label">Тип кубика</label>
                        <select class="input-field" id="universalDiceSides">
                            <option value="4">d4</option>
                            <option value="6" selected>d6</option>
                            <option value="8">d8</option>
                            <option value="10">d10</option>
                            <option value="12">d12</option>
                            <option value="20">d20</option>
                            <option value="100">d100</option>
                        </select>
                    </div>
                    <div class="input-group" style="flex: 1;">
                        <label class="input-label">Модификатор</label>
                        <input type="number" class="input-field" id="universalDiceModifier" value="0" placeholder="Например: +2">
                    </div>
                </div>
                
                <div id="universalDiceAnimation" style="display: none; margin-top: 2rem;">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <h4 style="color: var(--accent); margin-bottom: 1rem;">СВОБОДНЫЙ БРОСОК 5D6</h4>
                        <div id="universalDiceDisplay" style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                            <!-- Кубики будут добавлены динамически -->
                        </div>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 12px; padding: 1.5rem; text-align: center;">
                        <div id="universalDiceTotal" style="font-size: 2rem; font-weight: bold; color: ${getThemeColors().text}; margin-bottom: 0.5rem;">Σ 0</div>
                        <div id="universalDiceFormula" style="font-size: 1rem; color: var(--muted);">Бросков: 0</div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="rollUniversalDice()" id="universalRollButton">
                    🎲 Бросить!
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
    addModalKeyboardHandlers(modal);
}

function rollUniversalDice() {
    const count = parseInt(document.getElementById('universalDiceCount').value) || 1;
    const sides = parseInt(document.getElementById('universalDiceSides').value) || 6;
    const modifier = parseInt(document.getElementById('universalDiceModifier').value) || 0;
    
    const animationDiv = document.getElementById('universalDiceAnimation');
    const diceDisplay = document.getElementById('universalDiceDisplay');
    const totalDiv = document.getElementById('universalDiceTotal');
    const formulaDiv = document.getElementById('universalDiceFormula');
    const rollButton = document.getElementById('universalRollButton');
    
    if (!animationDiv || !diceDisplay) return;
    
    // Показываем секцию анимации
    animationDiv.style.display = 'block';
    if (rollButton) rollButton.disabled = true;
    
    // Обновляем заголовок
    const header = animationDiv.querySelector('h4');
    if (header) header.textContent = `СВОБОДНЫЙ БРОСОК ${count}D${sides}`;
    
    // Создаем кубики
    diceDisplay.innerHTML = '';
    const diceElements = [];
    for (let i = 0; i < count; i++) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '0.5rem';
        
        const diceEl = document.createElement('div');
        diceEl.className = 'dice rolling';
        diceEl.style.width = '60px';
        diceEl.style.height = '60px';
        diceEl.style.fontSize = '1.5rem';
        diceEl.textContent = '?';
        
        const label = document.createElement('div');
        label.style.color = 'var(--muted)';
        label.style.fontSize = '0.8rem';
        label.textContent = `D${sides}`;
        
        wrapper.appendChild(diceEl);
        wrapper.appendChild(label);
        diceDisplay.appendChild(wrapper);
        diceElements.push(diceEl);
    }
    
    // Анимация броска (2 секунды)
    const duration = 2000;
    const interval = 80;
    const iterations = Math.ceil(duration / interval);
    let step = 0;
    const finalResults = [];
    
    // Генерируем финальные результаты
    for (let i = 0; i < count; i++) {
        finalResults.push(Math.floor(Math.random() * sides) + 1);
    }
    
    const animationInterval = setInterval(() => {
        // Показываем случайные числа
        diceElements.forEach((diceEl) => {
            diceEl.textContent = Math.floor(Math.random() * sides) + 1;
        });
        
        step++;
        
        if (step >= iterations) {
            clearInterval(animationInterval);
            
            // Показываем финальные результаты
            diceElements.forEach((diceEl, index) => {
                diceEl.textContent = finalResults[index];
                diceEl.classList.remove('rolling');
            });
            
            // Рассчитываем сумму
            const sum = finalResults.reduce((a, b) => a + b, 0);
            const total = sum + modifier;
            
            // Отображаем результаты
            totalDiv.textContent = `Σ ${total}`;
            formulaDiv.textContent = `Кости: ${finalResults.join(' + ')}${modifier !== 0 ? ` + ${modifier}` : ''} = ${total}`;
            
            // Добавляем в лог
            state.rollLog.push({
                type: 'universal',
                timestamp: new Date().toLocaleTimeString(),
                count: count,
                sides: sides,
                dice: finalResults,
                modifier: modifier,
                total: total
            });
            
            if (state.rollLog.length > 50) {
                state.rollLog = state.rollLog.slice(-50);
            }
            
            renderRollLog();
            scheduleSave();
            
            if (rollButton) rollButton.disabled = false;
        }
    }, interval);
}

// Функции для работы с критическими травмами
function addCriticalInjury() {
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
                <h3>&#x1F494; Добавить критическую травму</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label class="input-label">Описание травмы</label>
                    <textarea class="input-field" id="injuryDescription" rows="3" placeholder="Опишите критическую травму..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveCriticalInjury()">Добавить</button>
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
        const input = document.getElementById('injuryDescription');
        if (input) input.focus();
    }, 100);
}

function saveCriticalInjury() {
    const description = document.getElementById('injuryDescription').value.trim();
    
    if (!description) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите описание травмы!</p>
            
            </div>
        `);
        return;
    }
    
    const newInjury = {
        id: generateId('injury'),
        description: description,
        timestamp: new Date().toLocaleDateString('ru-RU')
    };
    
    state.criticalInjuries.push(newInjury);
    renderInjuries();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeCriticalInjury(injuryId) {
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
                <h3>Подтверждение</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: ${getThemeColors().text}; font-size: 1rem;">Удалить эту критическую травму?</p>
            </div>
            <div class="modal-footer">
                <button class="pill-button danger-button" onclick="confirmRemoveCriticalInjury('${injuryId}')">Удалить</button>
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

function confirmRemoveCriticalInjury(injuryId) {
    state.criticalInjuries = state.criticalInjuries.filter(injury => injury.id !== injuryId);
    renderInjuries();
    scheduleSave();
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function renderInjuries() {
    const container = document.getElementById('injuriesList');
    if (!container) return;
    
    if (state.criticalInjuries.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); font-size: 0.9rem; margin-top: 0.5rem;">Травмы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.criticalInjuries.map(injury => `
        <div style="background: rgba(255, 91, 135, 0.1); border: 1px solid var(--danger); border-radius: 8px; padding: 0.75rem; margin-top: 0.5rem; position: relative;">
            <button onclick="removeCriticalInjury('${injury.id}')" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;">×</button>
            <div style="color: ${getThemeColors().text}; font-size: 0.9rem; padding-right: 1.5rem;">${injury.description}</div>
            <div style="color: var(--muted); font-size: 0.75rem; margin-top: 0.25rem;">${injury.timestamp}</div>
        </div>
    `).join('');
}

// Вспомогательная функция для форматирования да/нет
function formatYesNo(value) {
    return value ? 'да' : 'нет';
}

// Функции для работы с навыками
function addStandardSkill(skillName) {
    const skill = STANDARD_SKILLS.find(s => s.name === skillName);
    if (!skill) return;
    
    // Проверяем, можно ли добавить этот навык
    // "Язык" и "Боевые искусства" можно добавлять несколько раз
    const canAddMultiple = skillName === "Язык" || skillName.startsWith("Боевые искусства");
    
    if (!canAddMultiple && state.skills.find(s => s.name === skillName)) {
        showModal('Ошибка', 'Этот навык уже добавлен!');
        return;
    }
    
    // Если навык можно добавлять несколько раз, запрашиваем кастомное имя
    if (canAddMultiple) {
        promptSkillCustomName(skill);
    } else {
        const newSkill = {
            id: generateId('skill'),
            name: skill.name,
            stat: skill.stat,
            level: skill.level || 1,
            special: skill.special || false,
            multiplier: skill.multiplier || 1
        };
        
        state.skills.push(newSkill);
        renderSkills();
        scheduleSave();
        
        // Обновляем модал, чтобы скрыть добавленный навык
        refreshAddSkillModal();
    }
}

function promptSkillCustomName(skill) {
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
    
    const placeholder = skill.name === "Язык" ? "Например: Английский, Японский, Фурьский" : "Например: Ганката, Кендо, Капоэйра, Сумо";
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Укажите название</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label class="input-label">${skill.name === "Язык" ? "Какой язык?" : "Какое боевое искусство?"}</label>
                    <input type="text" class="input-field" id="skillCustomNameInput" placeholder="${placeholder}">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveSkillWithCustomName('${skill.name}', '${skill.stat}', ${skill.level || 0}, ${skill.special || false}, ${skill.multiplier || 1})">Добавить</button>
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
    
    // Фокус на input
    setTimeout(() => {
        const input = document.getElementById('skillCustomNameInput');
        if (input) input.focus();
    }, 100);
}

function saveSkillWithCustomName(baseName, stat, level, special, multiplier) {
    const customName = document.getElementById('skillCustomNameInput').value.trim();
    
    if (!customName) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название!</p>
       
            </div>
        `);
        return;
    }
    
    const fullName = `${baseName} (${customName})`;
    
    // Проверяем, не добавлен ли уже такой вариант
    if (state.skills.find(s => s.customName === fullName)) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Этот вариант навыка уже добавлен!</p>
        
            </div>
        `);
        return;
    }
    
    const newSkill = {
        id: generateId('skill'),
        name: baseName,
        customName: fullName,
        stat: stat,
        level: level || 1,
        special: special,
        multiplier: multiplier
    };
    
    state.skills.push(newSkill);
    renderSkills();
    scheduleSave();
    
    // Закрываем все модалы
    const allModals = document.querySelectorAll('.modal-overlay');
    allModals.forEach(modal => modal.remove());
}

function refreshAddSkillModal() {
    // Ищем открытый модал добавления навыков
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal && existingModal.querySelector('h3').textContent.includes('Добавить навык')) {
        // Обновляем содержимое модала
        const modalBody = existingModal.querySelector('.modal-body');
        if (modalBody) {
            // Пересоздаем содержимое модала
            const statNames = {
                'WILL': 'Воля',
                'INT': 'Ум',
                'DEX': 'Ловкость',
                'BODY': 'Телосложение',
                'REA': 'Реакция',
                'TECH': 'Техника',
                'CHA': 'Характер'
            };
            
            // Проверяем наличие профессиональных навыков
            const hasFixerSkill = state.professionalSkills && state.professionalSkills.some(skill => 
                skill && skill.name === 'Решала'
            );
            const medicSkills = ['Фармацевт', 'Инженер криосистем', 'Специалист по клонированию'];
            const hasMedicSkill = state.professionalSkills && state.professionalSkills.some(skill => 
                skill && medicSkills.includes(skill.name)
            );
            
            const availableSkills = STANDARD_SKILLS.filter(skill => {
                const canAddMultiple = skill.name === "Язык" || skill.name.startsWith("Боевые искусства");
                if (canAddMultiple) return true;
                
                // Скрываем "Торг" если нет профессии "Решала"
                if (skill.name === 'Торг' && !hasFixerSkill) return false;
                
                // Скрываем "Медицина" если нет медицинской профессии
                if (skill.name === 'Медицина' && !hasMedicSkill) return false;
                
                return !state.skills.find(s => s.name === skill.name);
            });
            
            modalBody.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--accent); margin-bottom: 0.75rem;">Стандартные навыки</h4>
                    ${availableSkills.length > 0 ? `
                        <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem;">
                            ${availableSkills.map(skill => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid rgba(182, 103, 255, 0.15); margin-bottom: 0.5rem;">
                                    <div>
                                    <div>
                                        <span style="color: ${getThemeColors().text}; font-weight: 500;">${skill.name}</span>
                                        <span style="color: var(--muted); font-size: 0.85rem;"> (${statNames[skill.stat] || skill.stat})</span>
                                            ${skill.special ? '<span style="color: var(--success); font-size: 0.8rem;"> </span>' : ''}
                                        ${skill.multiplier > 1 ? `<span style="color: var(--accent-2); font-size: 0.8rem;"> ×${skill.multiplier}</span>` : ''}
                                        </div>
                                        ${skill.footnote ? `<div style="color: var(--muted); font-size: 0.75rem; font-style: italic; margin-top: 0.25rem;">(${skill.footnote})</div>` : ''}
                                    </div>
                                    <button class="pill-button primary-button" onclick="addStandardSkill('${skill.name}');" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Добавить</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--muted); text-align: center; padding: 2rem;">Все стандартные навыки добавлены</p>'}
                </div>
            `;
        }
    }
}

function addCustomSkill() {
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
                <h3>✨ Создать кастомный навык</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Название навыка</label>
                        <input type="text" class="input-field" id="customSkillName" placeholder="Например: «Язык (Английский)»">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Характеристика</label>
                        <select class="input-field" id="customSkillStat">
                            <option value="WILL">Воля</option>
                            <option value="INT" selected>Ум</option>
                            <option value="DEX">Ловкость</option>
                            <option value="BODY">Телосложение</option>
                            <option value="REA">Реакция</option>
                            <option value="TECH">Техника</option>
                            <option value="CHA">Характер</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="saveCustomSkill()">Создать</button>
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

function saveCustomSkill() {
    const name = document.getElementById('customSkillName').value;
    const stat = document.getElementById('customSkillStat').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Введите название навыка!</p>
           
            </div>
        `);
        return;
    }
    
    // Проверяем, не добавлен ли уже этот навык
    if (state.skills.find(s => s.name === name)) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger};">Этот навык уже добавлен!</p>
             
            </div>
        `);
        return;
    }
    
    const newSkill = {
        id: generateId('skill'),
        name: name,
        stat: stat,
        level: 1,
        special: false,
        multiplier: 1,
        customName: name
    };
    
    state.skills.push(newSkill);
    renderSkills();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Навык добавлен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлен!</p>
        </div>
    `);
}

function updateSkillLevel(skillId, newLevel) {
    const skill = state.skills.find(s => s.id === skillId);
    if (skill) {
        skill.level = Math.max(0, Math.min(10, parseInt(newLevel)));
        renderSkills();
        updateDerivedStats(); // Обновляем нагрузку если изменилась Атлетика
        
        // Обновляем скорость велосипеда если изменилась Атлетика
        if (skill.name === 'Атлетика' && typeof updateBikeDescription === 'function') {
            updateBikeDescription();
        }
        
        scheduleSave();
    }
}

function removeSkill(skillId) {
    state.skills = state.skills.filter(s => s.id !== skillId);
    renderSkills();
    updateDerivedStats();
    scheduleSave();
}

function renderSkills() {
    const container = document.getElementById('skillsContainer');
    if (!container) return;
    
    if (state.skills.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Навыки не добавлены</p>';
        return;
    }
    
    // Маппинг английских названий характеристик на русские
    const statNames = {
        'WILL': 'Воля',
        'INT': 'Ум',
        'DEX': 'Ловкость',
        'BODY': 'Телосложение',
        'REA': 'Реакция',
        'TECH': 'Техника',
        'CHA': 'Характер'
    };
    
    // Отображаем навыки в виде сетки (как характеристики)
    // Сортируем навыки по алфавиту
    const sortedSkills = [...state.skills].sort((a, b) => {
        const nameA = (a.customName || a.name).toLowerCase();
        const nameB = (b.customName || b.name).toLowerCase();
        return nameA.localeCompare(nameB);
    });
    
    container.innerHTML = `
        <div class="skills-grid-compact">
            ${sortedSkills.map(skill => {
                const isBargainSkill = skill.name === 'Торг' || (skill.customName && skill.customName === 'Торг');
                const isMedicineSkill = skill.name === 'Медицина' || (skill.customName && skill.customName === 'Медицина');
                return `
                <div class="skill-item-compact">
                    <button class="skill-remove-btn-compact" onclick="removeSkill('${skill.id}')">×</button>
                    
                    <div class="skill-name-compact">
                        ${skill.customName || skill.name}
                        ${skill.multiplier > 1 ? `<span style="color: var(--accent-2); font-size: 0.75rem; font-weight: 600; margin-left: 0.25rem;">×${skill.multiplier}</span>` : ''}
                        ${isBargainSkill ? `
                            <div style="margin-top: 0.25rem;">
                                <span style="font-size: 0.7rem; color: var(--muted); font-style: italic;">
                                    Только для Решалы!
                                </span>
                            </div>
                            <div style="margin-top: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <label style="display: flex; align-items: center; gap: 0.25rem; cursor: pointer; font-size: 0.75rem; color: ${getThemeColors().text};">
                                    <input type="checkbox" ${state.bargainEnabled ? 'checked' : ''} onchange="toggleBargainEnabled(this.checked)" style="cursor: pointer; width: 14px; height: 14px;">
                                    <span>Активировать</span>
                                </label>
                                <span style="font-size: 0.65rem; color: var(--muted); font-style: italic;">(1/сцена)</span>
                            </div>
                        ` : ''}
                        ${isMedicineSkill ? `
                            <div style="margin-top: 0.25rem;">
                                <span style="font-size: 0.7rem; color: var(--muted); font-style: italic;">
                                    Только для Медика!
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="integrated-numeric-input">
                        <button class="integrated-numeric-btn" onclick="decreaseSkillLevel('${skill.id}')">-</button>
                        <input type="text" class="integrated-numeric-field" id="skillLevel_${skill.id}" value="${skill.level}" min="0" max="10" onchange="updateSkillLevel('${skill.id}', this.value)">
                        <button class="integrated-numeric-btn" onclick="increaseSkillLevel('${skill.id}')">+</button>
                    </div>
                    
                    <div class="skill-info-compact">
                        <span class="skill-stat-compact">${statNames[skill.stat] || skill.stat}</span>
                        <button class="skill-dice-btn-compact" onclick="showSkillCheckModal(${state.skills.indexOf(skill)})">🎲</button>
                    </div>
                </div>
            `}).join('')}
        </div>
    `;
    
    // Применяем числовую валидацию к полям навыков
    setTimeout(() => {
        sortedSkills.forEach(skill => {
            const input = document.getElementById(`skillLevel_${skill.id}`);
            if (input) {
                input.addEventListener('input', function(e) {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
                input.addEventListener('keypress', function(e) {
                    if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                        e.preventDefault();
                    }
                });
            }
        });
    }, 100);
}

function showAddSkillModal() {
    // Маппинг английских названий характеристик на русские
    const statNames = {
        'WILL': 'Воля',
        'INT': 'Ум',
        'DEX': 'Ловкость',
        'BODY': 'Телосложение',
        'REA': 'Реакция',
        'TECH': 'Техника',
        'CHA': 'Характер'
    };
    
    // Проверяем наличие профессиональных навыков
    const hasFixerSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && skill.name === 'Решала'
    );
    const medicSkills = ['Фармацевт', 'Инженер криосистем', 'Специалист по клонированию'];
    const hasMedicSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && medicSkills.includes(skill.name)
    );
    
    // Фильтруем навыки: скрываем уже добавленные (кроме "Язык" и "Боевые искусства")
    const availableSkills = STANDARD_SKILLS.filter(skill => {
        const canAddMultiple = skill.name === "Язык" || skill.name.startsWith("Боевые искусства");
        if (canAddMultiple) return true; // Всегда показываем
        
        // Скрываем "Торг" если нет профессии "Решала"
        if (skill.name === 'Торг' && !hasFixerSkill) return false;
        
        // Скрываем "Медицина" если нет медицинской профессии
        if (skill.name === 'Медицина' && !hasMedicSkill) return false;
        
        // Проверяем, добавлен ли уже этот навык
        return !state.skills.find(s => s.name === skill.name);
    });
    
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
        <div class="modal" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🔫 Добавить навык</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--accent); margin-bottom: 0.75rem;">Стандартные навыки</h4>
                    ${availableSkills.length > 0 ? `
                        <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem;">
                            ${availableSkills.map(skill => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid rgba(182, 103, 255, 0.15); margin-bottom: 0.5rem;">
                                    <div>
                                    <div>
                                        <span style="color: ${getThemeColors().text}; font-weight: 500;">${skill.name}</span>
                                        <span style="color: var(--muted); font-size: 0.85rem;"> (${statNames[skill.stat] || skill.stat})</span>
                                        ${skill.special ? '<span style="color: var(--success); font-size: 0.8rem;"> </span>' : ''}
                                        ${skill.multiplier > 1 ? `<span style="color: var(--accent-2); font-size: 0.8rem;"> ×${skill.multiplier}</span>` : ''}
                                        </div>
                                        ${skill.footnote ? `<div style="color: var(--muted); font-size: 0.75rem; font-style: italic; margin-top: 0.25rem;">(${skill.footnote})</div>` : ''}
                                    </div>
                                    <button class="pill-button primary-button" onclick="addStandardSkill('${skill.name}');" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Добавить</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--muted); text-align: center; padding: 2rem;">Все стандартные навыки добавлены</p>'}
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button success-button" onclick="addCustomSkill();">Создать кастомный навык</button>
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

function installChipOnDeckTarget(chipId, deckId) {
    const chip = state.deckChips.find(c => c.id === chipId);
    if (!chip) return;
    
    // Проверяем свободные слоты для выбранной деки
    const chipSlotModules = state.deckGear.filter(item => 
        item.deckGearType === 'module' && 
        item.name === 'Дополнительный слот для Щепки' && 
        item.installedDeckId === deckId
    );
    const chipSlots = 1 + chipSlotModules.length;
    
    const installedChips = state.deckChips.filter(c => c.installedDeckId === deckId);
    if (installedChips.length >= chipSlots) {
        showModal('Нет свободных слотов', `Максимальное количество щепок: ${chipSlots}`);
        return;
    }
    
    chip.installedDeckId = deckId;
    
    const deckName = deckId === 'main' ? (state.deck ? state.deck.name : 'Основная дека') : state.decks.find(d => d.id == deckId)?.name || 'Неизвестная дека';
    showModal('Щепка установлена', `Щепка "${chip.name}" установлена на ${deckName}!`);
    scheduleSave();
    updateAllDisplays();
}

function showCustomWeaponCreator() {
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
                <h3>🔧 Создание собственного оружия</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <button class="pill-button primary-button" onclick="showCustomMeleeWeaponForm(); closeModal(this);" style="font-size: 1rem; padding: 1rem;">
                        ⚔️ Оружие ближнего боя
                    </button>
                    <button class="pill-button primary-button" onclick="showCustomRangedWeaponForm(); closeModal(this);" style="font-size: 1rem; padding: 1rem;">
                        <img src="https://static.tildacdn.com/tild6332-3731-4662-b731-326433633632/assault-rifle.png" alt="🔫" style="width: 20px; height: 20px; margin-right: 0.5rem; vertical-align: middle;"> Оружие дальнего боя
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
    addModalKeyboardHandlers(modal);
}

function showCustomMeleeWeaponForm() {
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
                <h3>⚔️ Создание оружия ближнего боя</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Тип</label>
                        <input type="text" class="input-field" id="customMeleeType" placeholder="Например: Кастомный меч">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Внешний вид</label>
                        <input type="text" class="input-field" id="customMeleeAppearance" placeholder="Описание внешнего вида">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Урон (например: 2d6)</label>
                        <input type="text" class="input-field" id="customMeleeDamage" placeholder="2d6">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Можно скрыть?</label>
                        <select class="input-field" id="customMeleeConcealable">
                            <option value="true">Да</option>
                            <option value="false">Нет</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label">Штраф к СКА</label>
                        <input type="text" class="input-field" id="customMeleeStealthPenalty" placeholder="+1, 0, -1, -2">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Цена</label>
                        <input type="number" class="input-field" id="customMeleePrice" placeholder="100" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Нагрузка</label>
                        <input type="number" class="input-field" id="customMeleeLoad" placeholder="2" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Описание</label>
                        <textarea class="input-field" id="customMeleeDescription" rows="3" placeholder="Подробное описание оружия"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="createCustomMeleeWeapon()">Создать</button>
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

function showCustomRangedWeaponForm() {
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
                <h3>🔫 Создание оружия дальнего боя</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <div class="input-group">
                        <label class="input-label">Тип</label>
                        <input type="text" class="input-field" id="customRangedType" placeholder="Например: Кастомный пистолет">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Урон основной (например: 5d4)</label>
                        <input type="text" class="input-field" id="customRangedPrimaryDamage" placeholder="5d4">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Урон альтернативный (например: 3d6)</label>
                        <input type="text" class="input-field" id="customRangedAltDamage" placeholder="3d6">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Можно скрыть?</label>
                        <select class="input-field" id="customRangedConcealable">
                            <option value="true">Да</option>
                            <option value="false">Нет</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label class="input-label"># рук</label>
                        <input type="number" class="input-field" id="customRangedHands" placeholder="1" min="1" max="2">
                    </div>
                    <div class="input-group">
                        <label class="input-label">СКА</label>
                        <input type="number" class="input-field" id="customRangedStealth" placeholder="2" min="1" max="2">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Патронов в магазине</label>
                        <input type="text" class="input-field" id="customRangedMagazine" placeholder="9">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Цена</label>
                        <input type="number" class="input-field" id="customRangedPrice" placeholder="200" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Нагрузка</label>
                        <input type="number" class="input-field" id="customRangedLoad" placeholder="3" min="0">
                    </div>
                    <div class="input-group">
                        <label class="input-label">Описание</label>
                        <textarea class="input-field" id="customRangedDescription" rows="3" placeholder="Подробное описание оружия"></textarea>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="createCustomRangedWeapon()">Создать</button>
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

// Особая механика стрельбы для дробовиков
function showShotgunShootingModal(damageFormula, weaponName, weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon || !weapon.isShotgun) return;
    
    // Проверяем, есть ли патроны в дробовике
    const totalAmmo = weapon.shotgunAmmo1.count + weapon.shotgunAmmo2.count;
    if (totalAmmo <= 0) {
        showModal('Дробовик пуст', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Дробовик не заряжен!</p>
                <p style="color: var(--muted); margin-bottom: 1rem;">Сначала перезарядите дробовик</p>
                <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => reloadShotgun('${weaponId}'), 100)">Перезарядить</button>
            </div>
        `);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'weaponDamageModal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>&#x1F52B; Стрельба из дробовика: ${weaponName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" id="weaponDamageModalBody">
                <div id="weaponSetupSection">
                    <div style="margin-bottom: 1rem;">
                        <p style="margin-bottom: 0.75rem;"><strong>${weaponName}</strong></p>
                    </div>
                    
                    <!-- Информация о заряженных патронах -->
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px;">
                        <p style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">Заряженные патроны:</p>
                        <div style="display: grid; gap: 0.25rem;">
                            ${weapon.shotgunAmmo1.count > 0 ? `
                                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                                    Слот 1: <strong>${weapon.shotgunAmmo1.type}</strong> (${weapon.shotgunAmmo1.count}/3)
                                </p>
                            ` : ''}
                            ${weapon.shotgunAmmo2.count > 0 ? `
                                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                                    Слот 2: <strong>${weapon.shotgunAmmo2.type}</strong> (${weapon.shotgunAmmo2.count}/3)
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Выбор слота для стрельбы -->
                    <div style="margin-bottom: 1rem;">
                        <label class="input-label">Выберите слот для стрельбы</label>
                        <select class="input-field" id="shotgunShootSlot">
                            ${weapon.shotgunAmmo1.count > 0 ? `<option value="1">Слот 1: ${weapon.shotgunAmmo1.type} (${weapon.shotgunAmmo1.count}/3)</option>` : ''}
                            ${weapon.shotgunAmmo2.count > 0 ? `<option value="2">Слот 2: ${weapon.shotgunAmmo2.type} (${weapon.shotgunAmmo2.count}/3)</option>` : ''}
                        </select>
                    </div>
                    
                    <!-- Тип стрельбы дробовика -->
                    <div style="margin-bottom: 1rem;">
                        <label class="input-label">Тип стрельбы</label>
                        <div style="display: grid; gap: 0.5rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="shotgunFireType" value="target" checked style="margin: 0;">
                                <span>По цели (3d10 урона)</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="radio" name="shotgunFireType" value="area" style="margin: 0;">
                                <span>По площади (4d6 урона)</span>
                            </label>
                        </div>
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
                        <div id="weaponDamageTotal" style="font-size: 2rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem;"></div>
                        <div id="weaponDamageFormula" style="font-size: 0.9rem; color: var(--muted);"></div>
                        <div id="weaponCriticalMessage" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(255, 0, 0, 0.2); border: 2px solid #ff0000; border-radius: 8px;">
                            <p style="color: #ff0000; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">&#x1FA78; КРИТИЧЕСКАЯ ТРАВМА! &#x1FA78;</p>
                            <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" id="weaponDamageFooter">
                <button class="pill-button primary-button" id="weaponShootButton" onclick="executeShotgunShoot('${weaponId}')">
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

function executeShotgunShoot(weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const selectedSlot = parseInt(document.getElementById('shotgunShootSlot').value);
    const fireTypeRadios = document.querySelectorAll('input[name="shotgunFireType"]');
    const modifier = parseInt(document.getElementById('damageModifier').value) || 0;
    
    let fireType = 'target';
    for (const radio of fireTypeRadios) {
        if (radio.checked) {
            fireType = radio.value;
            break;
        }
    }
    
    const slotData = selectedSlot === 1 ? weapon.shotgunAmmo1 : weapon.shotgunAmmo2;
    
    if (slotData.count <= 0) {
        showModal('Ошибка', 'В выбранном слоте нет патронов!');
        return;
    }
    
    // Списываем 1 патрон из выбранного слота
    slotData.count -= 1;
    
    // Определяем формулу урона в зависимости от типа стрельбы
    const actualDamageFormula = fireType === 'target' ? '3d10' : '4d6';
    const fireTypeText = fireType === 'target' ? 'По цели' : 'По площади';
    
    renderWeapons();
    scheduleSave();
    
    // Скрываем секцию настройки и показываем анимацию
    document.getElementById('weaponSetupSection').style.display = 'none';
    document.getElementById('weaponDamageAnimation').style.display = 'block';
    document.getElementById('weaponShootButton').style.display = 'none';
    
    // Выполняем бросок урона с анимацией
    performWeaponDamageRoll(actualDamageFormula, weapon.name, modifier, slotData.type, fireTypeText, 1, weaponId, 'Дробовик', true, 'shotgun');
}

// Дубли функций критических травм удалены (первое определение на строке 1227)

// Генератор предыстории
function generateBackstory() {
    const backstoryTables = {
        birth: {
            title: "Ты родился",
            options: [
                "Среди бедняков (+1 предмет)",
                "Среди военных (+1 Навык ОДБ)",
                "На улице (+1 Навык ОББ)",
                "С вольным народом (+1 Вождение)",
                "Беспризорник (+1 к Поиску)",
                "Тебя нашли на улице (+1 Выживание)",
                "Тебя подкинули богатой семье (+1 Бюрократия)",
                "Тебя украли из лаборатории (+1 Техническое чудо)",
                "Среди Технолибертарианцев",
                "Ты не помнишь (+1 Удача)",
                "В богатой обеспеченной семье (+1 Внешний вид)",
                "Во время войны (+1 Уклонение)"
            ]
        },
        childhood: {
            title: "Ты рос",
            options: [
                "С дворовыми пацанами",
                "В гиперзаботе и гиперопеке",
                "Спокойно и без приключений",
                "Постоянно расшибал коленки и всем было плевать",
                "Почему-то был голоден и воровал еду",
                "В постоянных разъездах или командировках",
                "В тире, среди бородатых мужиков с ружьями",
                "Где-то в дикой природе в палатке",
                "В дорогой престижной школе, смотря на мир из окон небоскрёба",
                "Сколотил подростковую банду",
                "Избивал бомжей на видео и выкладывал это в Сеть",
                "Был нелюдимым ребенком, смотрел мультики, избегал других детей"
            ]
        },
        teenEvent: {
            title: "Что-то важное случилось в подростковом возрасте",
            options: [
                "Нет, не случилось (+1 ЛВК)",
                "Нашёл кучу денег (+1 УДАЧА)",
                "Потерял важного человека (+1 ВОЛЯ)",
                "Крайне неудачная первая любовь (+1 ХАР)",
                "Угнал не ту тачку (+1 ТЕХ)",
                "Связался с плохими людьми (+1 ТЕЛО)",
                "Подсел на наркоту (+1 зависимость)",
                "Любовь изменила твою жизнь (+1 ХАР)",
                "Потерял доверенное тебе (-1 репутация)",
                "Случайно кого-то убил (+1 РЕА)",
                "Познакомился с важной шишкой (+1000уе в крипте)",
                "Пытался сделать бизнес и прогорел (10 000уе долга перед инвесторами)"
            ]
        },
        love: {
            title: "История любви с... (выбери или придумай персонажа)",
            options: [
                "Всегда по-настоящему любил только себя",
                "Были знакомы с самого детства",
                "Случайно пересеклись в толпе",
                "Познакомились на работе",
                "Какая-то фанатка бегает за мной много лет",
                "Бегал за ней много лет, и она сжалилась",
                "Вечная френдзона, но я добьюсь",
                "Отбил у друга",
                "Отбил у врага",
                "Зашел в магазин, а там он/-а на кассе",
                "Светлая любовь с первого взгляда",
                "Меня никто не любит"
            ]
        },
        enemy: {
            title: "История вражды с... (выбери или придумай персонажа)",
            options: [
                "С детства ненавидим друг друга",
                "...задел плечом в топле",
                "...увёл любовь",
                "...украл что-то",
                "...враг семьи",
                "...убил кого-то важного",
                "...забрал себе работу",
                "...подставил перед законом",
                "\"Срёт в кашу сколько его помню\"",
                "Просто лицо у ... слишком мерзкое/милое",
                "...подставил перед бандитами",
                "У меня нет врагов"
            ]
        },
        guilt: {
            title: "Кто на самом деле виноват в вашей вражде",
            options: [
                "Конечно он",
                "Какое-то третье лицо",
                "Его друг",
                "Мой друг",
                "Случайность",
                "Конечно я"
            ]
        },
        revenge: {
            title: "Как произойдет месть обидчику",
            options: [
                "Придёт толпа народу с битами",
                "Унизит в Сети",
                "Постарается подставить в тяжком преступлении",
                "Один на один на ножах",
                "Ждёт серьёзный разговор",
                "Периодически появляется и делает мелкие пакости",
                "Наймёт киллера. Или двух…или сколько потребуется",
                "Будет пытаться сорвать работу",
                "Будет шпионить и предупреждать врагов… если они его не пристрелят",
                "Постарается убить в самый неподходящий момент (задавить машиной/застрелить/прислать вирус через Сеть и пр.)",
                "Простит и продолжить жить дальше",
                "Не станет марать руки, но не простит"
            ]
        },
        reason: {
            title: "Почему ты здесь",
            options: [
                "Нужна работа",
                "Дома скучно",
                "Долги напоминают о себе",
                "Хочу купить что-то дорогое",
                "Устал жить терпилой",
                "Потому что я — БЕЗУМЕЦ",
                "Позвали в приложении знакомств сюда",
                "Потому что я должен быть тут",
                "Это моя работа",
                "Хочу показать себя для (указать персонажа)",
                "Долг зовёт (это важно для тебя с моральной точки зрения)",
                "Я до сих пор сам не понимаю"
            ]
        },
        meeting: {
            title: "Как ты познакомился с… (Выбери одного из группы и укажи отношения с ним)",
            options: [
                "Я должен доказать, что я лучше, чем…",
                "…требуется моя защита.",
                "Отдаю … долг.",
                "Я поклялся себе защищать …",
                "Я хочу затащить в постель …",
                "Я хочу помочь с работой … а потом удрать с его бабками.",
                "Я просто не могу отпустить … одну/одного.",
                "Почувствовал, что … грозит опасность.",
                "У меня заказ на голову … Но это должен выглядеть, как несчастный случаей.",
                "Узнал, что за голову … награда и должен защитить.",
                "Однажды Эрнест Хэмингуэй поспорил...",
                "Да я плевал на всех них. Работа есть работа, если они все помрут, я и глазом не моргну."
            ]
        },
        moneyAttitude: {
            title: "Твоё отношение к деньгам",
            options: [
                "Мусор",
                "Инструмент",
                "Цель в жизни",
                "Необходимость",
                "У меня их, как грязи",
                "Готов убить за них",
                "Честь превыше денег",
                "За разумную цену могу всё",
                "Хочу все деньги мира",
                "Ненавижу их, из-за них все проблемы",
                "Деньги, как деньги. Без них нельзя, но они не сама цель",
                "Деньги нужно уничтожить!"
            ]
        },
        peopleAttitude: {
            title: "Твоё отношение к людям",
            options: [
                "Мусор",
                "Инструмент",
                "Хочу нравиться всем",
                "Общение с людьми не более чем необходимость",
                "Я душа кампании",
                "Готов на всё, если человек в опасности",
                "Моя жизнь важнее",
                "Если человек выгоден мне – я выгоден ему",
                "Хочу известности на весь мир",
                "Ненавижу их, из-за них все проблемы",
                "Люди, как люди. Без них нельзя, но мне на них плевать",
                "Они не знают, но я сам не человек. Я не знаю как сюда попал. Нельзя, чтобы они узнали мою тайну."
            ]
        },
        recentEvent: {
            title: "Внезапное событие на прошлой неделе",
            options: [
                "Потерял состояние (у тебя нет стартовых денег)",
                "Убили близкого (выбери персонажа/человека из предыстории, который по твоему мнению сейчас мёртв)",
                "Украли любимую вещь (выбери любую вещь стоимостью до 5000 уе, которую у тебя украли и ты можешь её вернуть)",
                "Угнали любимую машину (твою стартовую машину угнали)",
                "Убили любимую собаку (ты получаешь бесплатный дробовик, пачку зажигательных и ненависть)",
                "Обнесли жилье (в твоей квартире ничего не осталось, кроме 1 комплекта одежды, в котором ты сейчас, и компьютера, вмонтированного в стену)",
                "Нашел труп корпората в мусорке (получи корпоративную ID-карточку и самонаводящйся пистолет, являющийся собственностью этой корпорации)",
                "Нашёл загадочный чип (получи щепку с ИИ, этот ИИ может использоваться Мастер, как еще 1 персонаж)",
                "Жёстко проебался на деле, но вынес \"трофей\" (пропиши себе любой нарративный предмет стоимость 5000уе, за владельца этой вещи — тебя — назначена награда, но никто не знает у кого она)",
                "Нашел загадочный чемодан с ДНК замком, который Сёрфер не смог открыть (у тебя есть закрытый ДНК-замком противоударный кейс. Все попытки его взломать или открыть — проваливаются. Что внутри не ясно, кто владелец — тоже, на ящике может быть логотип корпорации или узнаваемого человека)",
                "Нашёл чип с крупной суммой денег (если ты его вставишь себе в порт, то получи бонусные 20.000 уе на старте, но после перевода твоя ЦНС как-то странно барахлит)"
            ]
        }
    };
    
    // Генерируем случайные результаты
    let backstoryText = "";
    
    for (const [key, table] of Object.entries(backstoryTables)) {
        const randomIndex = Math.floor(Math.random() * table.options.length);
        const selectedOption = table.options[randomIndex];
        backstoryText += `${table.title}: ${selectedOption}. `;
    }
    
    // Записываем в textarea и обновляем отображение
    const textarea = document.getElementById('backstoryText');
    if (textarea) {
        textarea.value = backstoryText.trim();
        state.backstory = backstoryText.trim();
        updateBackstoryDisplay(); // Обновляем красивое отображение
        scheduleSave();
    }
}

// Функция для ручного выбора предыстории
function showManualBackstorySelection() {
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    // Данные для выбора предыстории
    const backstoryTables = {
        birth: {
            title: "Ты родился",
            options: [
                "Среди бедняков (+1 предмет)",
                "Среди военных (+1 Навык ОДБ)",
                "На улице (+1 Навык ОББ)",
                "С вольным народом (+1 Вождение)",
                "Беспризорник (+1 к Поиску)",
                "Тебя нашли на улице (+1 Выживание)",
                "Тебя подкинули богатой семье (+1 Бюрократия)",
                "Тебя украли из лаборатории (+1 Техническое чудо)",
                "Среди Технолибертарианцев",
                "Ты не помнишь (+1 Удача)",
                "В богатой обеспеченной семье (+1 Внешний вид)",
                "Во время войны (+1 Уклонение)"
            ]
        },
        childhood: {
            title: "Ты рос",
            options: [
                "С дворовыми пацанами",
                "В гиперзаботе и гиперопеке",
                "Спокойно и без приключений",
                "Постоянно расшибал коленки и всем было плевать",
                "Почему-то был голоден и воровал еду",
                "В постоянных разъездах или командировках",
                "В тире, среди бородатых мужиков с ружьями",
                "Где-то в дикой природе в палатке",
                "В дорогой престижной школе, смотря на мир из окон небоскрёба",
                "Сколотил подростковую банду",
                "Избивал бомжей на видео и выкладывал это в Сеть",
                "Был нелюдимым ребенком, смотрел мультики, избегал других детей"
            ]
        },
        teenEvent: {
            title: "Что-то важное случилось в подростковом возрасте",
            options: [
                "Нет, не случилось (+1 ЛВК)",
                "Нашёл кучу денег (+1 УДАЧА)",
                "Потерял важного человека (+1 ВОЛЯ)",
                "Крайне неудачная первая любовь (+1 ХАР)",
                "Угнал не ту тачку (+1 ТЕХ)",
                "Связался с плохими людьми (+1 ТЕЛО)",
                "Подсел на наркоту (+1 зависимость)",
                "Любовь изменила твою жизнь (+1 ХАР)",
                "Потерял доверенное тебе (-1 репутация)",
                "Случайно кого-то убил (+1 РЕА)",
                "Познакомился с важной шишкой (+1000уе в крипте)",
                "Пытался сделать бизнес и прогорел (10 000уе долга перед инвесторами)"
            ]
        },
        love: {
            title: "История любви с... (выбери или придумай персонажа)",
            options: [
                "Всегда по-настоящему любил только себя",
                "Были знакомы с самого детства",
                "Случайно пересеклись в толпе",
                "Познакомились на работе",
                "Какая-то фанатка бегает за мной много лет",
                "Бегал за ней много лет, и она сжалилась",
                "Вечная френдзона, но я добьюсь",
                "Отбил у друга",
                "Отбил у врага",
                "Зашел в магазин, а там он/-а на кассе",
                "Светлая любовь с первого взгляда",
                "Меня никто не любит"
            ]
        },
        enemy: {
            title: "История вражды с... (выбери или придумай персонажа)",
            options: [
                "С детства ненавидим друг друга",
                "...задел плечом в топле",
                "...увёл любовь",
                "...украл что-то",
                "...враг семьи",
                "...убил кого-то важного",
                "...забрал себе работу",
                "...подставил перед законом",
                "\"Срёт в кашу сколько его помню\"",
                "Просто лицо у ... слишком мерзкое/милое",
                "...подставил перед бандитами",
                "У меня нет врагов"
            ]
        },
        guilt: {
            title: "Кто на самом деле виноват в вашей вражде",
            options: [
                "Конечно он",
                "Какое-то третье лицо",
                "Его друг",
                "Мой друг",
                "Случайность",
                "Конечно я"
            ]
        },
        revenge: {
            title: "Как произойдет месть обидчику",
            options: [
                "Придёт толпа народу с битами",
                "Унизит в Сети",
                "Постарается подставить в тяжком преступлении",
                "Один на один на ножах",
                "Ждёт серьёзный разговор",
                "Периодически появляется и делает мелкие пакости",
                "Наймёт киллера. Или двух…или сколько потребуется",
                "Будет пытаться сорвать работу",
                "Будет шпионить и предупреждать врагов… если они его не пристрелят",
                "Постарается убить в самый неподходящий момент (задавить машиной/застрелить/прислать вирус через Сеть и пр.)",
                "Простит и продолжить жить дальше",
                "Не станет марать руки, но не простит"
            ]
        },
        reason: {
            title: "Почему ты здесь",
            options: [
                "Нужна работа",
                "Дома скучно",
                "Долги напоминают о себе",
                "Хочу купить что-то дорогое",
                "Устал жить терпилой",
                "Потому что я — БЕЗУМЕЦ",
                "Позвали в приложении знакомств сюда",
                "Потому что я должен быть тут",
                "Это моя работа",
                "Хочу показать себя для (указать персонажа)",
                "Долг зовёт (это важно для тебя с моральной точки зрения)",
                "Я до сих пор сам не понимаю"
            ]
        },
        meeting: {
            title: "Как ты познакомился с… (Выбери одного из группы и укажи отношения с ним)",
            options: [
                "Я должен доказать, что я лучше, чем…",
                "…требуется моя защита.",
                "Отдаю … долг.",
                "Я поклялся себе защищать …",
                "Я хочу затащить в постель …",
                "Я хочу помочь с работой … а потом удрать с его бабками.",
                "Я просто не могу отпустить … одну/одного.",
                "Почувствовал, что … грозит опасность.",
                "У меня заказ на голову … Но это должен выглядеть, как несчастный случаей.",
                "Узнал, что за голову … награда и должен защитить.",
                "Однажды Эрнест Хэмингуэй поспорил...",
                "Да я плевал на всех них. Работа есть работа, если они все помрут, я и глазом не моргну."
            ]
        },
        moneyAttitude: {
            title: "Твоё отношение к деньгам",
            options: [
                "Мусор",
                "Инструмент",
                "Цель в жизни",
                "Необходимость",
                "У меня их, как грязи",
                "Готов убить за них",
                "Честь превыше денег",
                "За разумную цену могу всё",
                "Хочу все деньги мира",
                "Ненавижу их, из-за них все проблемы",
                "Деньги, как деньги. Без них нельзя, но они не сама цель",
                "Деньги нужно уничтожить!"
            ]
        },
        peopleAttitude: {
            title: "Твоё отношение к людям",
            options: [
                "Мусор",
                "Инструмент",
                "Хочу нравиться всем",
                "Общение с людьми не более чем необходимость",
                "Я душа кампании",
                "Готов на всё, если человек в опасности",
                "Моя жизнь важнее",
                "Если человек выгоден мне – я выгоден ему",
                "Хочу известности на весь мир",
                "Ненавижу их, из-за них все проблемы",
                "Люди, как люди. Без них нельзя, но мне на них плевать",
                "Они не знают, но я сам не человек. Я не знаю как сюда попал. Нельзя, чтобы они узнали мою тайну."
            ]
        },
        recentEvent: {
            title: "Внезапное событие на прошлой неделе",
            options: [
                "Потерял состояние (у тебя нет стартовых денег)",
                "Убили близкого (выбери персонажа/человека из предыстории, который по твоему мнению сейчас мёртв)",
                "Украли любимую вещь (выбери любую вещь стоимостью до 5000 уе, которую у тебя украли и ты можешь её вернуть)",
                "Угнали любимую машину (твою стартовую машину угнали)",
                "Убили любимую собаку (ты получаешь бесплатный дробовик, пачку зажигательных и ненависть)",
                "Обнесли жилье (в твоей квартире ничего не осталось, кроме 1 комплекта одежды, в котором ты сейчас, и компьютера, вмонтированного в стену)",
                "Нашел труп корпората в мусорке (получи корпоративную ID-карточку и самонаводящйся пистолет, являющийся собственностью этой корпорации)",
                "Нашёл загадочный чип (получи щепку с ИИ, этот ИИ может использоваться Мастер, как еще 1 персонаж)",
                "Жёстко проебался на деле, но вынес \"трофей\" (пропиши себе любой нарративный предмет стоимость 5000уе, за владельца этой вещи — тебя — назначена награда, но никто не знает у кого она)",
                "Нашел загадочный чемодан с ДНК замком, который Сёрфер не смог открыть (у тебя есть закрытый ДНК-замком противоударный кейс. Все попытки его взломать или открыть — проваливаются. Что внутри не ясно, кто владелец — тоже, на ящике может быть логотип корпорации или узнаваемого человека)",
                "Нашёл чип с крупной суммой денег (если ты его вставишь себе в порт, то получи бонусные 20.000 уе на старте, но после перевода твоя ЦНС как-то странно барахлит)",
                "Ничего особенного не происходило"
            ]
        }
    };
    
    // Состояние выбора
    let currentStep = 0;
    const steps = Object.keys(backstoryTables);
    const selectedOptions = {};
    
    // Функция для выделения бонусов в тексте
    function highlightBonuses(text) {
        // Регулярное выражение для поиска бонусов в скобках
        return text.replace(/\(([^)]+)\)/g, (match, bonus) => {
            // Определяем цвет в зависимости от типа бонуса
            let color = 'var(--accent)'; // По умолчанию фиолетовый
            
            if (bonus.includes('+') && !bonus.includes('-')) {
                // Положительные бонусы - зеленый
                color = 'var(--success)';
            } else if (bonus.includes('-')) {
                // Отрицательные бонусы - красный
                color = 'var(--danger)';
            } else if (bonus.toLowerCase().includes('уе') || bonus.toLowerCase().includes('долг')) {
                // Деньги/долги - желтый
                color = 'var(--warning)';
            } else if (bonus.toLowerCase().includes('предмет') || bonus.toLowerCase().includes('вещь') || bonus.toLowerCase().includes('чип') || bonus.toLowerCase().includes('пистолет') || bonus.toLowerCase().includes('кейс')) {
                // Предметы - синий
                color = '#3b82f6';
            } else if (bonus.toLowerCase().includes('зависимость')) {
                // Зависимости - оранжевый
                color = '#f97316';
            }
            
            return `<span style="color: ${color}; font-weight: 600; background: rgba(0,0,0,0.1); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em;">(${bonus})</span>`;
        });
    }
    
    function renderStep() {
        const stepKey = steps[currentStep];
        const stepData = backstoryTables[stepKey];
        
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px; width: 90%;">
                <div class="modal-header">
                    <h3>Выбор предыстории (${currentStep + 1}/${steps.length})</h3>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
                <div class="modal-body">
                    <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <h4 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">${stepData.title}</h4>
                        <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Выберите один из вариантов:</p>
                    </div>
                    
                    <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                        ${stepData.options.map((option, index) => `
                            <button class="backstory-option-button" onclick="selectBackstoryOption('${stepKey}', '${option.replace(/'/g, "\\'")}', ${index})" style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease; text-align: left; color: ${getThemeColors().text};">
                                <div style="font-weight: 500;">${highlightBonuses(option)}</div>
                            </button>
                        `).join('')}
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem;">
                        <button class="pill-button muted-button" onclick="closeModal(this)" style="font-size: 0.9rem;">Отмена</button>
                        <div style="display: flex; gap: 0.5rem;">
                            ${currentStep > 0 ? `<button class="pill-button primary-button" onclick="previousBackstoryStep()" style="font-size: 0.9rem;">Назад</button>` : ''}
                            ${currentStep < steps.length - 1 ? `<button class="pill-button success-button" onclick="nextBackstoryStep()" style="font-size: 0.9rem;" ${!selectedOptions[stepKey] ? 'disabled' : ''}>Далее</button>` : ''}
                            ${currentStep === steps.length - 1 ? `<button class="pill-button success-button" onclick="finishBackstorySelection()" style="font-size: 0.9rem;" ${!selectedOptions[stepKey] ? 'disabled' : ''}>Завершить</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем эффекты наведения
        const optionButtons = modal.querySelectorAll('.backstory-option-button');
        optionButtons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.background = getThemeColors().accentLight;
                button.style.transform = 'translateY(-2px)';
            });
            button.addEventListener('mouseleave', () => {
                button.style.background = getThemeColors().accentLight;
                button.style.transform = 'translateY(0)';
            });
        });
    }
    
    // Функции для управления шагами
    window.selectBackstoryOption = function(stepKey, option, index) {
        selectedOptions[stepKey] = option;
        
        // Обновляем кнопки
        const optionButtons = modal.querySelectorAll('.backstory-option-button');
        optionButtons.forEach((btn, i) => {
            if (i === index) {
                btn.style.background = getThemeColors().successLight;
                btn.style.borderColor = getThemeColors().success;
            } else {
                btn.style.background = getThemeColors().accentLight;
                btn.style.borderColor = getThemeColors().accent;
            }
        });
        
        // Активируем кнопку "Далее" или "Завершить"
        const nextButton = modal.querySelector('button[onclick*="nextBackstoryStep"], button[onclick*="finishBackstorySelection"]');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.style.opacity = '1';
        }
    };
    
    window.nextBackstoryStep = function() {
        if (currentStep < steps.length - 1) {
            currentStep++;
            renderStep();
        }
    };
    
    window.previousBackstoryStep = function() {
        if (currentStep > 0) {
            currentStep--;
            renderStep();
        }
    };
    
    window.finishBackstorySelection = function() {
        // Формируем текст предыстории
        let backstoryText = "";
        for (const [key, option] of Object.entries(selectedOptions)) {
            const stepData = backstoryTables[key];
            backstoryText += `${stepData.title}: ${option}. `;
        }
        
        // Записываем в textarea и обновляем отображение
        const textarea = document.getElementById('backstoryText');
        if (textarea) {
            textarea.value = backstoryText.trim();
            state.backstory = backstoryText.trim();
            updateBackstoryDisplay(); // Обновляем красивое отображение
            scheduleSave();
        }
        
        // Закрываем модал
        modal.remove();
        document.body.style.overflow = '';
        
        // Показываем уведомление
        showToast('Предыстория выбрана вручную!', 2000);
    };
    
    document.body.appendChild(modal);
    renderStep();
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Функции для работы с аватаром
function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const removeAvatarButton = document.getElementById('removeAvatarButton');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }
    
    if (removeAvatarButton) {
        removeAvatarButton.addEventListener('click', handleAvatarRemove);
    }
    
    // Загружаем существующий аватар при инициализации
    loadAvatarFromState();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    
    // Создаем временный Image для сжатия
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Создаем canvas для ресайза
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Максимальные размеры (сохраняем пропорции)
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            
            let width = img.width;
            let height = img.height;
            
            // Рассчитываем новые размеры с сохранением пропорций
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Рисуем изображение на canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Конвертируем в Base64 с качеством 0.7
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            
            // Сохраняем сжатое изображение
            state.avatar = compressedBase64;
            displayAvatar(compressedBase64);
            saveState();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleAvatarRemove() {
    state.avatar = '';
    displayAvatar('');
    saveState();
}

function loadAvatarFromState() {
    if (state.avatar) {
        displayAvatar(state.avatar);
    } else {
        displayAvatar('');
    }
}

function displayAvatar(imageData) {
    const avatarDisplay = document.getElementById('avatarDisplay');
    if (!avatarDisplay) {
        return;
    }
    
    if (imageData) {
        avatarDisplay.innerHTML = `<img src="${imageData}" alt="Аватар персонажа" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />`;
    } else {
        avatarDisplay.innerHTML = '🤖';
    }
}

// Функция для обновления UI из состояния

// Функция проверки размера экрана
function checkScreenSize() {
    const screenWidth = window.innerWidth;
    const mobileWarning = document.getElementById('mobileWarning');
    const screenWidthSpan = document.getElementById('screenWidth');
    
    if (screenWidthSpan) {
        screenWidthSpan.textContent = screenWidth;
    }
    
    if (screenWidth < 100) {
        if (mobileWarning) {
            mobileWarning.style.display = 'flex';
        }
        return false; // Экран слишком мал
    } else {
        if (mobileWarning) {
            mobileWarning.style.display = 'none';
        }
        return true; // Экран подходящего размера
    }
}

// Функции для управления плавающим блоком логов
function toggleFloatingLog() {
    const logWindow = document.getElementById('floatingLogWindow');
    const minimizedLog = document.getElementById('minimizedLog');
    
    if (logWindow.style.display === 'none') {
        // Разворачиваем
        logWindow.style.display = 'flex';
        minimizedLog.style.display = 'none';
        localStorage.setItem('logWindowMinimized', 'false');
    } else {
        // Сворачиваем
        logWindow.style.display = 'none';
        minimizedLog.style.display = 'block';
        localStorage.setItem('logWindowMinimized', 'true');
    }
}

function hideFloatingLog() {
    const logWindow = document.getElementById('floatingLogWindow');
    const minimizedLog = document.getElementById('minimizedLog');
    logWindow.style.display = 'none';
    minimizedLog.style.display = 'none';
    localStorage.setItem('logWindowHidden', 'true');
}

function showFloatingLog() {
    const logWindow = document.getElementById('floatingLogWindow');
    logWindow.style.display = 'flex';
    localStorage.setItem('logWindowHidden', 'false');
    localStorage.setItem('logWindowMinimized', 'false');
}

// Функции для перетаскивания блока логов
function initFloatingLogDrag() {
    const logWindow = document.getElementById('floatingLogWindow');
    const logHeader = document.getElementById('floatingLogHeader');
    
    if (!logWindow || !logHeader) return;
    
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    
    // Загружаем сохраненную позицию
    const savedPos = localStorage.getItem('logWindowPosition');
    if (savedPos) {
        const pos = JSON.parse(savedPos);
        logWindow.style.top = pos.top + 'px';
        logWindow.style.right = 'auto';
        logWindow.style.left = pos.left + 'px';
    }
    
    // Загружаем сохраненный размер
    const savedSize = localStorage.getItem('logWindowSize');
    if (savedSize) {
        const size = JSON.parse(savedSize);
        logWindow.style.width = size.width + 'px';
        logWindow.style.height = size.height + 'px';
    }
    
    // Загружаем состояние (свернут/развернут/скрыт)
    const isMinimized = localStorage.getItem('logWindowMinimized') === 'true';
    const isHidden = localStorage.getItem('logWindowHidden') === 'true';
    
    if (isHidden) {
        logWindow.style.display = 'none';
    } else if (isMinimized) {
        toggleFloatingLog();
    }
    
    logHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // Сохраняем размер при изменении
    const resizeObserver = new ResizeObserver(() => {
        const size = {
            width: logWindow.offsetWidth,
            height: logWindow.offsetHeight
        };
        localStorage.setItem('logWindowSize', JSON.stringify(size));
    });
    resizeObserver.observe(logWindow);
    
    function dragStart(e) {
        if (e.target.tagName === 'BUTTON') return;
        
        initialX = logWindow.offsetLeft;
        initialY = logWindow.offsetTop;
        currentX = e.clientX;
        currentY = e.clientY;
        isDragging = true;
        logHeader.style.cursor = 'grabbing';
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        const dx = e.clientX - currentX;
        const dy = e.clientY - currentY;
        
        const newLeft = initialX + dx;
        const newTop = initialY + dy;
        
        // Ограничиваем движение границами экрана
        const maxX = window.innerWidth - logWindow.offsetWidth;
        const maxY = window.innerHeight - logWindow.offsetHeight;
        
        logWindow.style.left = Math.max(0, Math.min(newLeft, maxX)) + 'px';
        logWindow.style.top = Math.max(0, Math.min(newTop, maxY)) + 'px';
        logWindow.style.right = 'auto';
    }
    
    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            logHeader.style.cursor = 'move';
            
            // Сохраняем позицию
            const pos = {
                top: logWindow.offsetTop,
                left: logWindow.offsetLeft
            };
            localStorage.setItem('logWindowPosition', JSON.stringify(pos));
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем размер экрана
    if (checkScreenSize()) {
        initLoadingScreen();
        initNumericInputs();
        renderWeapons();
        initFloatingLogDrag();
    }
    
    // Отслеживаем изменения размера окна
    window.addEventListener('resize', checkScreenSize);
});


function changeNumericValue(input, delta) {
    const currentValue = parseInt(input.value) || 0;
    const min = parseInt(input.getAttribute('min')) || 0;
    const max = parseInt(input.getAttribute('max')) || 999;
    const newValue = Math.max(min, Math.min(max, currentValue + delta));
    
    input.value = newValue;
    
    // Вызываем onchange если есть
    if (input.onchange) {
        input.onchange();
    }
    
    // Триггерим событие change
    input.dispatchEvent(new Event('change'));
}


// Функции для профессиональных навыков (старые функции удалены, см. новые функции выше)

function loadProfessionalSkills() {
    if (!state.professionalSkills) {
        state.professionalSkills = [null, null, null, null];
    }
    
    // Убеждаемся, что массив содержит 4 элемента
    while (state.professionalSkills.length < 4) {
        state.professionalSkills.push(null);
    }
    
    // Проверяем и добавляем навыки "Торг" и "Медицина" при загрузке
    checkAndAddAutoSkills();
    
    // Вызываем рендеринг профессиональных навыков
    renderProfessionalSkills();
}

// Проверить и добавить автоматические навыки при загрузке
function checkAndAddAutoSkills() {
    // Проверяем наличие "Решала"
    const hasFixerSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && skill.name === 'Решала'
    );
    
    // Проверяем наличие медицинских навыков
    const medicSkills = ['Фармацевт', 'Инженер криосистем', 'Специалист по клонированию'];
    const hasMedicSkill = state.professionalSkills && state.professionalSkills.some(skill => 
        skill && medicSkills.includes(skill.name)
    );
    
    // Добавляем "Торг" если есть "Решала"
    if (hasFixerSkill) {
        if (typeof autoAddBargainSkill === 'function') autoAddBargainSkill();
    } else {
        // Удаляем "Торг" если нет "Решала"
        if (typeof autoRemoveBargainSkill === 'function') autoRemoveBargainSkill();
    }
    
    // Добавляем "Медицина" если есть медицинский навык
    if (hasMedicSkill) {
        if (typeof autoAddMedicineSkill === 'function') autoAddMedicineSkill();
    } else {
        // Удаляем "Медицина" если нет медицинских навыков
        if (typeof autoRemoveMedicineSkill === 'function') autoRemoveMedicineSkill();
    }
}

// Система заметок
let notes = [];
let noteWindows = [];
let noteZIndex = 3000;

function showNotesModal() {
    const modal = document.createElement('div');
    modal.className = 'notes-modal-overlay';
    modal.innerHTML = `
        <div class="notes-modal">
            <div class="notes-modal-header">
                <h3 class="notes-modal-title">&#x1F4DD; Заметки</h3>
                <button class="pill-button" onclick="closeNotesModal(this)">Закрыть</button>
            </div>
            <div class="notes-modal-content">
                <div class="notes-list" id="notesList">
                    ${notes.length > 0 ? notes.map((note, index) => `
                        <div class="note-item">
                            <div class="note-item-info">
                                <div class="note-item-title">${note.title || 'Без названия'}</div>
                                <div class="note-item-preview">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
                            </div>
                            <div class="note-item-actions">
                                <button class="pill-button primary-button" onclick="openNoteWindow(${index})" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">Открыть</button>
                                <button class="pill-button danger-button" onclick="deleteNote(${index})" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">Удалить</button>
                            </div>
                        </div>
                    `).join('') : '<p style="color: var(--muted); text-align: center; padding: 2rem;">Заметки не созданы</p>'}
                </div>
                <div class="notes-actions">
                    <button class="pill-button primary-button" onclick="createNewNote()">+ Создать заметку</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeNotesModal(button) {
    const modal = button.closest('.notes-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function createNewNote() {
    const newNote = {
        id: Date.now(),
        title: 'Новая заметка',
        content: '',
        x: 100 + (notes.length * 20),
        y: 100 + (notes.length * 20),
        width: 400,
        height: 300
    };
    
    notes.push(newNote);
    openNoteWindow(notes.length - 1);
    saveNotes();
}

function openNoteWindow(noteIndex) {
    const note = notes[noteIndex];
    if (!note) return;
    
    // Проверяем, не открыта ли уже эта заметка
    const existingWindow = noteWindows.find(w => w.dataset.noteId === note.id.toString());
    if (existingWindow) {
        existingWindow.style.zIndex = noteZIndex++;
        return;
    }
    
    // Закрываем модал заметок
    const modal = document.querySelector('.notes-modal-overlay');
    if (modal) {
        modal.remove();
    }
    
    const noteWindow = document.createElement('div');
    noteWindow.className = 'note-window';
    noteWindow.dataset.noteId = note.id;
    noteWindow.style.left = note.x + 'px';
    noteWindow.style.top = note.y + 'px';
    noteWindow.style.width = note.width + 'px';
    noteWindow.style.height = note.height + 'px';
    noteWindow.style.zIndex = noteZIndex++;
    
    noteWindow.innerHTML = `
        <div class="note-header" onmousedown="startDrag(event, this.parentElement)">
            <input type="text" class="note-title-input" value="${note.title}" onchange="updateNoteTitle(${note.id}, this.value)" placeholder="Название заметки">
            <div class="note-controls">
                <button class="note-control-btn note-minimize" onclick="minimizeNoteToTaskbar(${note.id})" title="Свернуть">−</button>
                <button class="note-control-btn note-close" onclick="closeNoteWindow(this.closest('.note-window'))" title="Закрыть">×</button>
            </div>
        </div>
        <div class="note-content">
            <textarea class="note-textarea" placeholder="Введите текст заметки..." onchange="updateNoteContent(${note.id}, this.value)">${note.content}</textarea>
        </div>
    `;
    
    document.body.appendChild(noteWindow);
    noteWindows.push(noteWindow);
    
    // Добавляем обработчики для изменения размера
    makeResizable(noteWindow);
}

function updateNoteTitle(noteId, title) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.title = title;
        saveNotes();
        
        // Обновляем заголовок в трее, если заметка свернута
        const minimizedNote = document.querySelector(`[data-note-id="${noteId}"] .minimized-note-title`);
        if (minimizedNote) {
            minimizedNote.textContent = title || 'Без названия';
        }
    }
}

function updateNoteContent(noteId, content) {
    const note = notes.find(n => n.id === noteId);
    if (note) {
        note.content = content;
        saveNotes();
    }
}

function deleteNote(noteIndex) {
        const note = notes[noteIndex];
        if (!note) return;
        
        // Удаляем из трея, если она там есть
        removeFromMinimizedPanel(note.id);
        
        // Находим и удаляем окно, если оно открыто
        const noteWindow = noteWindows.find(w => w.dataset.noteId === note.id.toString());
        if (noteWindow) {
            noteWindow.remove();
            const windowIndex = noteWindows.indexOf(noteWindow);
            if (windowIndex > -1) {
                noteWindows.splice(windowIndex, 1);
            }
        }
        
        // Удаляем из массива заметок
        notes.splice(noteIndex, 1);
        saveNotes();
        
        // Обновляем модал
        const modal = document.querySelector('.notes-modal-overlay');
        if (modal) {
            modal.remove();
            showNotesModal();
        }
}

function closeNoteWindow(noteWindow) {
    const noteId = parseInt(noteWindow.dataset.noteId);
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Сохраняем текущие размеры и позицию перед закрытием
    note.x = parseInt(noteWindow.style.left);
    note.y = parseInt(noteWindow.style.top);
    note.width = parseInt(noteWindow.style.width);
    note.height = parseInt(noteWindow.style.height);
    note.minimized = false; // Помечаем как закрытую, но не свернутую
    
    // Удаляем окно, но НЕ удаляем заметку из массива
    noteWindow.remove();
    const windowIndex = noteWindows.indexOf(noteWindow);
    if (windowIndex > -1) {
        noteWindows.splice(windowIndex, 1);
    }
    
    // Сохраняем изменения
    saveNotes();
}

function minimizeNoteToTaskbar(noteId) {
    const noteWindow = noteWindows.find(w => w.dataset.noteId === noteId.toString());
    if (!noteWindow) return;
    
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Сохраняем текущие размеры и позицию
    note.x = parseInt(noteWindow.style.left);
    note.y = parseInt(noteWindow.style.top);
    note.width = parseInt(noteWindow.style.width);
    note.height = parseInt(noteWindow.style.height);
    note.minimized = true;
    
    // Скрываем окно
    noteWindow.style.display = 'none';
    
    // Добавляем в трей
    addToMinimizedPanel(noteId);
    
    saveNotes();
}

function addToMinimizedPanel(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    const panel = document.getElementById('minimizedNotesPanel');
    if (!panel) return;
    
    // Проверяем, нет ли уже такой заметки в трее
    const existing = panel.querySelector(`[data-note-id="${noteId}"]`);
    if (existing) return;
    
    const minimizedNote = document.createElement('div');
    minimizedNote.className = 'minimized-note';
    minimizedNote.dataset.noteId = noteId;
    
    minimizedNote.innerHTML = `
        <div class="minimized-note-title" onclick="restoreNoteFromTaskbar(${noteId})">${note.title || 'Без названия'}</div>
        <button class="minimized-note-close" onclick="event.stopPropagation(); closeNoteFromTaskbar(${noteId})" title="Закрыть">×</button>
    `;
    
    panel.appendChild(minimizedNote);
}

function removeFromMinimizedPanel(noteId) {
    const panel = document.getElementById('minimizedNotesPanel');
    if (!panel) return;
    
    const minimizedNote = panel.querySelector(`[data-note-id="${noteId}"]`);
    if (minimizedNote) {
        minimizedNote.remove();
    }
}

function restoreNoteFromTaskbar(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Проверяем, не открыто ли уже окно этой заметки
    const existingWindow = noteWindows.find(w => w.dataset.noteId === noteId.toString());
    if (existingWindow && existingWindow.style.display !== 'none') {
        // Если окно уже открыто и видимо, просто поднимаем его наверх
        existingWindow.style.zIndex = noteZIndex++;
        return;
    }
    
    // Убираем флаг свернутости
    note.minimized = false;
    
    // Удаляем из трея
    removeFromMinimizedPanel(noteId);
    
    if (existingWindow) {
        // Если окно существует, но скрыто - показываем его
        existingWindow.style.display = 'block';
        existingWindow.style.zIndex = noteZIndex++;
    } else {
        // Если окна нет - создаем новое
        const noteIndex = notes.findIndex(n => n.id === noteId);
        openNoteWindow(noteIndex);
    }
    
    saveNotes();
}

function closeNoteFromTaskbar(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Убираем из трея
    removeFromMinimizedPanel(noteId);
    
    // Помечаем как закрытую, но НЕ удаляем заметку
    note.minimized = false;
    
    // Находим и удаляем окно, если оно есть
    const noteWindow = noteWindows.find(w => w.dataset.noteId === noteId.toString());
    if (noteWindow) {
        noteWindow.remove();
        const windowIndex = noteWindows.indexOf(noteWindow);
        if (windowIndex > -1) {
            noteWindows.splice(windowIndex, 1);
        }
    }
    
    // Сохраняем изменения
    saveNotes();
}

// Функции для перетаскивания
let isDragging = false;
let dragElement = null;
let dragOffset = { x: 0, y: 0 };

function startDrag(event, element) {
    if (event.target.tagName === 'INPUT') return;
    
    isDragging = true;
    dragElement = element;
    dragOffset.x = event.clientX - element.offsetLeft;
    dragOffset.y = event.clientY - element.offsetTop;
    
    element.style.zIndex = noteZIndex++;
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    event.preventDefault();
}

function drag(event) {
    if (!isDragging || !dragElement) return;
    
    dragElement.style.left = (event.clientX - dragOffset.x) + 'px';
    dragElement.style.top = (event.clientY - dragOffset.y) + 'px';
}

function stopDrag() {
    isDragging = false;
    dragElement = null;
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Функции для изменения размера
function makeResizable(element) {
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.right = '0';
    resizeHandle.style.width = '20px';
    resizeHandle.style.height = '20px';
    resizeHandle.style.background = '#2a3d4f';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.borderRadius = '0 0 8px 0';
    
    element.appendChild(resizeHandle);
    
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandle.addEventListener('mousedown', function(e) {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(window.getComputedStyle(element).width);
        startHeight = parseInt(window.getComputedStyle(element).height);
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });
    
    function resize(e) {
        if (!isResizing) return;
        
        const newWidth = startWidth + e.clientX - startX;
        const newHeight = startHeight + e.clientY - startY;
        
        element.style.width = Math.max(200, newWidth) + 'px';
        element.style.height = Math.max(100, newHeight) + 'px';
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }
}

function saveNotes() {
    localStorage.setItem('ezyCyberNotes', JSON.stringify(notes));
}

function loadNotes() {
    const saved = localStorage.getItem('ezyCyberNotes');
    if (saved) {
        notes = JSON.parse(saved);
        
        // Восстанавливаем свернутые заметки в трей
        notes.forEach((note) => {
            if (note.minimized) {
                addToMinimizedPanel(note.id);
            }
        });
    }
}

// ============================================
// СЧЕТЧИКИ - Механический счетчик
// ============================================

let counters = [];
let counterWindows = [];
let counterZIndex = 3000;

function showCountersModal() {
    const modal = document.createElement('div');
    modal.className = 'counters-modal-overlay';
    modal.innerHTML = `
        <div class="counters-modal">
            <div class="counters-modal-header">
                <h3 class="counters-modal-title">🔢 Счетчики</h3>
                <button class="pill-button" onclick="closeCountersModal(this)">Закрыть</button>
            </div>
            <div class="counters-modal-content">
                <div class="counters-list" id="countersList">
                    ${counters.length > 0 ? counters.map((counter, index) => `
                        <div class="counter-item">
                            <div class="counter-item-info">
                                <div class="counter-item-title">${counter.title || 'Без названия'}</div>
                                <div class="counter-item-value">${formatCounterValue(counter.value)}</div>
                            </div>
                            <div class="counter-item-actions">
                                <button class="pill-button primary-button" onclick="openCounterWindow(${index})" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">Открыть</button>
                                <button class="pill-button danger-button" onclick="deleteCounter(${index})" style="font-size: 0.7rem; padding: 0.2rem 0.4rem;">Удалить</button>
                            </div>
                        </div>
                    `).join('') : '<p style="color: var(--muted); text-align: center; padding: 2rem;">Счетчики не созданы</p>'}
                </div>
                <div class="counters-actions">
                    <button class="pill-button primary-button" onclick="createNewCounter()">+ Создать счетчик</button>
                </div>
            </div>
        </div>
    `;
    
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}

function closeCountersModal(button) {
    const modal = button.closest('.counters-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function createNewCounter() {
    const newCounter = {
        id: Date.now(),
        title: 'Новый счетчик',
        value: 0,
        x: 150 + (counters.length * 30),
        y: 150 + (counters.length * 30),
        width: 190
    };
    
    counters.push(newCounter);
    openCounterWindow(counters.length - 1);
    saveCounters();
}

function openCounterWindow(counterIndex) {
    const counter = counters[counterIndex];
    if (!counter) return;
    
    // Проверяем, не открыт ли уже этот счетчик
    const existingWindow = counterWindows.find(w => w.dataset.counterId === counter.id.toString());
    if (existingWindow) {
        existingWindow.style.zIndex = counterZIndex++;
        return;
    }
    
    // Закрываем модал счетчиков
    const modal = document.querySelector('.counters-modal-overlay');
    if (modal) {
        modal.remove();
    }
    
    const counterWindow = document.createElement('div');
    counterWindow.className = 'counter-window';
    counterWindow.dataset.counterId = counter.id;
    counterWindow.style.left = counter.x + 'px';
    counterWindow.style.top = counter.y + 'px';
    counterWindow.style.width = counter.width + 'px';
    counterWindow.style.zIndex = counterZIndex++;
    
    counterWindow.innerHTML = `
        <div class="counter-header" onmousedown="startDrag(event, this.parentElement)">
            <input type="text" class="counter-title-input" value="${counter.title}" onchange="updateCounterTitle(${counter.id}, this.value)" placeholder="Название счетчика">
            <button class="counter-control-btn counter-minimize-btn" onclick="minimizeCounterToTaskbar(${counter.id})" title="Свернуть">−</button>
        </div>
        <div class="counter-content">
            <div class="counter-display" id="counterDisplay${counter.id}">
                ${generateCounterDigits(counter.value, counter.id)}
            </div>
            <div class="counter-buttons">
                <button class="counter-btn counter-btn-minus" onclick="decrementCounter(${counter.id})">−</button>
                <button class="counter-reset-btn" onclick="resetCounter(${counter.id})" title="Сбросить">⟲</button>
                <button class="counter-btn counter-btn-plus" onclick="incrementCounter(${counter.id})">+</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(counterWindow);
    counterWindows.push(counterWindow);
}

function generateCounterDigits(value, counterId) {
    // Преобразуем значение в строку и дополняем нулями до 5 цифр
    const valueStr = Math.abs(value).toString().padStart(5, '0');
    const digits = valueStr.split('').slice(-6); // Максимум 6 цифр
    const sign = value < 0 ? '−' : '';
    
    let html = '';
    
    // Добавляем знак минус, если число отрицательное
    if (sign) {
        html += `
            <div class="counter-digit">
                <div class="counter-digit-inner">
                    <div class="counter-digit-value">${sign}</div>
                </div>
            </div>
        `;
    }
    
    // Генерируем цифры с возможностью редактирования
    digits.forEach((digit, index) => {
        html += `
            <div class="counter-digit counter-digit-editable" data-counter-id="${counterId}" data-digit-index="${index}" onclick="editCounterDigit(${counterId}, ${index}, this)">
                <div class="counter-digit-inner">
                    <div class="counter-digit-value">${digit}</div>
                </div>
            </div>
        `;
    });
    
    return html;
}

function formatCounterValue(value) {
    return value.toString().padStart(5, '0');
}

function editCounterDigit(counterId, digitIndex, digitElement) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    // Создаем временное поле ввода
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.value = digitElement.querySelector('.counter-digit-value').textContent;
    input.className = 'counter-digit-input';
    input.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(91, 155, 255, 0.3);
        border: 2px solid #5b9bff;
        color: #00ffff;
        text-align: center;
        font-family: 'Courier New', monospace;
        font-size: 1.2rem;
        font-weight: 900;
        text-shadow: 0 0 5px rgba(0, 255, 255, 0.8);
        outline: none;
        z-index: 100;
    `;
    
    digitElement.style.position = 'relative';
    digitElement.appendChild(input);
    input.focus();
    input.select();
    
    // Обработка ввода
    input.addEventListener('input', (e) => {
        // Разрешаем только цифры
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
    
    input.addEventListener('blur', () => {
        applyDigitEdit(counterId, digitIndex, input.value, digitElement);
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            applyDigitEdit(counterId, digitIndex, input.value, digitElement);
        } else if (e.key === 'Escape') {
            input.remove();
        }
    });
}

function applyDigitEdit(counterId, digitIndex, newDigitValue, digitElement) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    // Получаем текущее значение счетчика
    const currentValueStr = Math.abs(counter.value).toString().padStart(5, '0').slice(-6);
    const digits = currentValueStr.split('');
    
    // Заменяем цифру
    if (newDigitValue !== '' && !isNaN(newDigitValue)) {
        digits[digitIndex] = newDigitValue;
    }
    
    // Преобразуем обратно в число
    const newValue = parseInt(digits.join(''), 10);
    const finalValue = counter.value < 0 ? -newValue : newValue;
    
    // Обновляем счетчик
    const oldValue = counter.value;
    counter.value = finalValue;
    
    // Ограничиваем значение
    if (counter.value > 999999) counter.value = 999999;
    if (counter.value < -999999) counter.value = -999999;
    
    updateCounterDisplay(counterId, oldValue, counter.value, counter.value > oldValue ? 'up' : 'down');
    saveCounters();
    
    // Удаляем поле ввода
    const input = digitElement.querySelector('.counter-digit-input');
    if (input) {
        input.remove();
    }
}

function updateCounterTitle(counterId, title) {
    const counter = counters.find(c => c.id === counterId);
    if (counter) {
        counter.title = title;
        saveCounters();
        
        // Обновляем заголовок в минимизированной панели, если счетчик там
        const minimizedItem = document.querySelector(`[data-minimized-counter-id="${counterId}"]`);
        if (minimizedItem) {
            const titleElement = minimizedItem.querySelector('.minimized-note-title');
            if (titleElement) {
                titleElement.textContent = title || 'Без названия';
            }
        }
    }
}

function incrementCounter(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    const oldValue = counter.value;
    counter.value++;
    
    // Ограничиваем максимальное значение 999999
    if (counter.value > 999999) {
        counter.value = 999999;
    }
    
    updateCounterDisplay(counterId, oldValue, counter.value, 'up');
    saveCounters();
}

function decrementCounter(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    const oldValue = counter.value;
    counter.value--;
    
    // Ограничиваем минимальное значение -999999
    if (counter.value < -999999) {
        counter.value = -999999;
    }
    
    updateCounterDisplay(counterId, oldValue, counter.value, 'down');
    saveCounters();
}

function setCounterValue(counterId, newValue) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    const oldValue = counter.value;
    
    // Ограничиваем значение
    if (newValue > 999999) newValue = 999999;
    if (newValue < -999999) newValue = -999999;
    
    counter.value = newValue;
    
    const direction = newValue > oldValue ? 'up' : 'down';
    updateCounterDisplay(counterId, oldValue, counter.value, direction);
    saveCounters();
}

function resetCounter(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    const oldValue = counter.value;
    counter.value = 0;
    
    updateCounterDisplay(counterId, oldValue, 0, oldValue > 0 ? 'down' : 'up');
    saveCounters();
}

function updateCounterDisplay(counterId, oldValue, newValue, direction) {
    const display = document.getElementById(`counterDisplay${counterId}`);
    
    // Обновляем значение в минимизированной панели, если счетчик там
    const minimizedItem = document.querySelector(`[data-minimized-counter-id="${counterId}"]`);
    if (minimizedItem) {
        const valueElement = minimizedItem.querySelector('.minimized-note-value');
        if (valueElement) {
            valueElement.textContent = formatCounterValue(newValue);
        }
    }
    
    if (!display) return;
    
    // Получаем старые и новые цифры
    const oldStr = Math.abs(oldValue).toString().padStart(5, '0').slice(-6);
    const newStr = Math.abs(newValue).toString().padStart(5, '0').slice(-6);
    
    // Находим изменившиеся цифры
    const digits = display.querySelectorAll('.counter-digit');
    
    // Пропускаем первый digit, если это знак минуса
    let startIndex = 0;
    if (digits[0] && digits[0].querySelector('.counter-digit-value').textContent === '−') {
        startIndex = 1;
        // Проверяем, нужен ли знак минуса
        if (newValue >= 0 && oldValue < 0 || newValue < 0 && oldValue >= 0) {
            // Перерисовываем полностью, если изменился знак
            display.innerHTML = generateCounterDigits(newValue, counterId);
            return;
        }
    }
    
    // Анимируем только изменившиеся цифры
    for (let i = 0; i < newStr.length; i++) {
        if (oldStr[i] !== newStr[i]) {
            const digitElement = digits[i + startIndex];
            if (digitElement) {
                const valueElement = digitElement.querySelector('.counter-digit-value');
                
                // Добавляем класс анимации
                digitElement.classList.remove('flip-up', 'flip-down');
                digitElement.classList.add(direction === 'up' ? 'flip-up' : 'flip-down');
                
                // Обновляем значение
                valueElement.textContent = newStr[i];
                
                // Убираем класс анимации после завершения
                setTimeout(() => {
                    digitElement.classList.remove('flip-up', 'flip-down');
                }, 400);
            }
        }
    }
}

function deleteCounter(counterIndex) {
    const counter = counters[counterIndex];
    if (!counter) return;
    
    // Удаляем из панели минимизированных, если там есть
    removeCounterFromMinimizedPanel(counter.id);
    
    // Находим и удаляем окно, если оно открыто
    const counterWindow = counterWindows.find(w => w.dataset.counterId === counter.id.toString());
    if (counterWindow) {
        counterWindow.remove();
        const windowIndex = counterWindows.indexOf(counterWindow);
        if (windowIndex > -1) {
            counterWindows.splice(windowIndex, 1);
        }
    }
    
    // Удаляем из массива счетчиков
    counters.splice(counterIndex, 1);
    saveCounters();
    
    // Обновляем модал
    const modal = document.querySelector('.counters-modal-overlay');
    if (modal) {
        modal.remove();
        showCountersModal();
    }
}

function closeCounterWindow(counterWindow) {
    const counterId = parseInt(counterWindow.dataset.counterId);
    const counter = counters.find(c => c.id === counterId);
    if (counter) {
        // Сохраняем позицию окна
        counter.x = parseInt(counterWindow.style.left);
        counter.y = parseInt(counterWindow.style.top);
        counter.width = parseInt(counterWindow.style.width);
        saveCounters();
    }
    
    // Удаляем окно из DOM и массива
    counterWindow.remove();
    const index = counterWindows.indexOf(counterWindow);
    if (index > -1) {
        counterWindows.splice(index, 1);
    }
}

function minimizeCounterToTaskbar(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    // Находим окно счетчика
    const counterWindow = counterWindows.find(w => w.dataset.counterId === counterId.toString());
    if (!counterWindow) return;
    
    // Сохраняем позицию и размер
    counter.x = parseInt(counterWindow.style.left);
    counter.y = parseInt(counterWindow.style.top);
    counter.width = parseInt(counterWindow.style.width);
    counter.minimized = true;
    
    // Закрываем окно
    counterWindow.remove();
    const index = counterWindows.indexOf(counterWindow);
    if (index > -1) {
        counterWindows.splice(index, 1);
    }
    
    // Добавляем в панель минимизированных
    addCounterToMinimizedPanel(counterId);
    saveCounters();
}

function addCounterToMinimizedPanel(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    // Проверяем, есть ли уже панель минимизированных окон
    let panel = document.getElementById('minimizedNotesPanel');
    if (!panel) {
        // Создаем панель, если её нет
        panel = document.createElement('div');
        panel.id = 'minimizedNotesPanel';
        panel.className = 'minimized-notes-panel';
        document.body.appendChild(panel);
    }
    
    // Проверяем, не добавлен ли уже этот счетчик
    if (document.querySelector(`[data-minimized-counter-id="${counterId}"]`)) {
        return;
    }
    
    // Создаем элемент минимизированного счетчика
    const minimizedItem = document.createElement('div');
    minimizedItem.className = 'minimized-note';
    minimizedItem.dataset.minimizedCounterId = counterId;
    minimizedItem.innerHTML = `
        <div class="minimized-note-icon">🔢</div>
        <div class="minimized-note-title">${counter.title || 'Без названия'}</div>
        <div class="minimized-note-value" style="font-family: 'Courier New', monospace; color: #00ffff; font-size: 0.8rem; margin-left: 0.5rem;">${formatCounterValue(counter.value)}</div>
    `;
    minimizedItem.onclick = function() {
        restoreCounterFromTaskbar(counterId);
    };
    
    panel.appendChild(minimizedItem);
}

function restoreCounterFromTaskbar(counterId) {
    const counter = counters.find(c => c.id === counterId);
    if (!counter) return;
    
    counter.minimized = false;
    
    // Удаляем из панели минимизированных
    const minimizedItem = document.querySelector(`[data-minimized-counter-id="${counterId}"]`);
    if (minimizedItem) {
        minimizedItem.remove();
    }
    
    // Проверяем, нужно ли скрыть панель
    const panel = document.getElementById('minimizedNotesPanel');
    if (panel && panel.children.length === 0) {
        panel.remove();
    }
    
    // Открываем окно счетчика
    const counterIndex = counters.findIndex(c => c.id === counterId);
    if (counterIndex !== -1) {
        openCounterWindow(counterIndex);
    }
    
    saveCounters();
}

function removeCounterFromMinimizedPanel(counterId) {
    const minimizedItem = document.querySelector(`[data-minimized-counter-id="${counterId}"]`);
    if (minimizedItem) {
        minimizedItem.remove();
    }
    
    // Проверяем, нужно ли скрыть панель
    const panel = document.getElementById('minimizedNotesPanel');
    if (panel && panel.children.length === 0) {
        panel.remove();
    }
}

function saveCounters() {
    localStorage.setItem('ezyCyberCounters', JSON.stringify(counters));
}

function loadCounters() {
    const saved = localStorage.getItem('ezyCyberCounters');
    if (saved) {
        counters = JSON.parse(saved);
        
        // Восстанавливаем свернутые счетчики в панель
        counters.forEach((counter) => {
            if (counter.minimized) {
                addCounterToMinimizedPanel(counter.id);
            }
        });
    }
}


function showAtmError(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay atm-modal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal atm-style" style="max-width: 350px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 24px; height: 24px;"> ${title}</h3>
                <button class="icon-button" onclick="closeModal(this)" style="color: #FFFFFF;">×</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <p style="color: #FFFFFF; text-align: center; margin-bottom: 1rem; font-size: 1.1rem;">${message}</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="atm-button" onclick="closeModal(this)" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Понятно</button>
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

function showAtmSuccess(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay atm-modal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal atm-style" style="max-width: 400px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 24px; height: 24px;"> ${title}</h3>
                <button class="icon-button" onclick="closeModal(this)" style="color: #FFFFFF;">×</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                ${content}
                <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                    <button class="atm-button" onclick="closeModal(this)" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Понятно</button>
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

// Функции банкомата YenEuro
function showDepositModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay atm-modal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal atm-style" style="max-width: 400px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 32px; height: 32px;"> YenEuro Bank</h3>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <p style="color: #ffffff; text-align: center; margin-bottom: 1.5rem; font-size: 1.1rem;">Сколько хотите внести?</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
                    <button class="atm-button" onclick="selectDepositAmount(100)" style="background: #0052A3; border: 1px solid #FFFFFF; color: #FFFFFF; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">100</button>
                    <button class="atm-button" onclick="selectDepositAmount(500)" style="background: #0052A3; border: 1px solid #FFFFFF; color: #FFFFFF; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">500</button>
                    <button class="atm-button" onclick="selectDepositAmount(1000)" style="background: #0052A3; border: 1px solid #FFFFFF; color: #FFFFFF; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">1000</button>
                    <button class="atm-button" onclick="selectDepositAmount(5000)" style="background: #0052A3; border: 1px solid #FFFFFF; color: #FFFFFF; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">5000</button>
                </div>
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="customAmount" placeholder="Ввести свою сумму" style="width: 100%; padding: 0.75rem; background: #0052A3; border: 1px solid #FFFFFF; border-radius: 8px; color: #ffffff; font-size: 1rem; text-align: center;" onkeypress="if(event.key==='Enter') selectDepositAmount(document.getElementById('customAmount').value)">
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="atm-button" onclick="selectDepositAmount(document.getElementById('customAmount').value)" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Подтвердить</button>
                    <button class="atm-button" onclick="showExitConfirmation()" style="background: #CC0000; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Отмена</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Предотвращаем закрытие по клику вне модала
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            showExitConfirmation();
        }
    });
}

function selectDepositAmount(amount) {
    const numAmount = parseInt(amount);
    if (!numAmount || numAmount <= 0) {
        showAtmError('ОШИБКА', 'Введите корректную сумму!');
        return;
    }
    
    // Сохраняем сумму в глобальной переменной
    window.currentDepositAmount = numAmount;
    
    // Закрываем текущий модал
    const currentModal = document.querySelector('.atm-modal');
    if (currentModal) currentModal.remove();
    
    // Показываем модал источника дохода
    showIncomeSourceModal();
}

function showIncomeSourceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay atm-modal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal atm-style" style="max-width: 400px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 32px; height: 32px;"> YenEuro Bank</h3>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <p style="color: #ffffff; text-align: center; margin-bottom: 1rem; font-size: 1.1rem;">Укажите источник дохода:</p>
                <p style="color: #00d4ff; text-align: center; margin-bottom: 1.5rem; font-size: 1.2rem; font-weight: 600;">${window.currentDepositAmount} уе</p>
                <div style="margin-bottom: 1.5rem;">
                    <input type="text" id="incomeSource" placeholder="Работа, Украл, Нашел..." style="width: 100%; padding: 0.75rem; background: #0052A3; border: 1px solid #FFFFFF; border-radius: 8px; color: #ffffff; font-size: 0,5rem; text-align: center;" onkeypress="if(event.key==='Enter') proceedToTaxModal()">
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="atm-button" onclick="proceedToTaxModal()" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Далее</button>
                    <button class="atm-button" onclick="showExitConfirmation()" style="background: linear-gradient(135deg, #ff6b6b, #cc4444); border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Отмена</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            showExitConfirmation();
        }
    });
}

function proceedToTaxModal() {
    const incomeSource = document.getElementById('incomeSource').value.trim();
    if (!incomeSource) {
        showAtmError('ОШИБКА', 'Укажите источник дохода!');
        return;
    }
    
    // Сохраняем источник дохода
    window.currentIncomeSource = incomeSource;
    
    // Закрываем текущий модал
    const currentModal = document.querySelector('.atm-modal');
    if (currentModal) currentModal.remove();
    
    // Показываем модал налога
    showTaxModal();
}

function showTaxModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay atm-modal';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const taxAmount = Math.round(window.currentDepositAmount * 0.17);
    const finalAmount = window.currentDepositAmount - taxAmount;
    
    modal.innerHTML = `
        <div class="modal atm-style" style="max-width: 400px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 32px; height: 32px;"> YenEuro Bank</h3>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <p style="color: #ffffff; text-align: center; margin-bottom: 1rem; font-size: 1.1rem;">Хотите заплатить 17% налога?</p>
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #00d4ff; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #ffffff;">Сумма:</span>
                        <span style="color: #00d4ff; font-weight: 600;">${window.currentDepositAmount} уе</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #ff6b6b;">Налог (17%):</span>
                        <span style="color: #ff6b6b; font-weight: 600;">-${taxAmount} уе</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-top: 1px solid #00d4ff; padding-top: 0.5rem;">
                        <span style="color: #ffffff; font-weight: 600;">К зачислению:</span>
                        <span style="color: #00ff88; font-weight: 600;">${finalAmount} уе</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="atm-button" onclick="processDeposit(true)" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Да</button>
                    <button class="atm-button" onclick="processDeposit(false)" style="flex: 1; background: #CC0000; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Нет</button>
                </div>
                <div style="margin-top: 0.5rem;">
                    <button class="atm-button" onclick="showExitConfirmation()" style="width: 100%; background: #666666; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">Отмена</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            showExitConfirmation();
        }
    });
}

function processDeposit(payTax) {
    const amount = window.currentDepositAmount;
    const incomeSource = window.currentIncomeSource;
    let finalAmount = amount;
    let taxPaid = 0;
    
    if (payTax) {
        taxPaid = Math.round(amount * 0.17);
        finalAmount = amount - taxPaid;
    }
    
    // Зачисляем деньги
    state.money = (parseInt(state.money) || 0) + finalAmount;
    updateMoneyDisplay();
    scheduleSave();
    
    // Логируем транзакцию
    const logEntry = {
        timestamp: new Date().toLocaleTimeString('ru-RU'),
        type: 'deposit',
        amount: finalAmount,
        source: incomeSource,
        taxPaid: taxPaid,
        originalAmount: amount
    };
    
    if (!state.transactionLog) {
        state.transactionLog = [];
    }
    state.transactionLog.push(logEntry);
    
    // Добавляем в лог бросков
    addToRollLog('transaction', {
        amount: finalAmount,
        source: incomeSource,
        taxPaid: taxPaid
    });
    
    // Закрываем все модалы банкомата
    const atmModals = document.querySelectorAll('.atm-modal');
    atmModals.forEach(modal => modal.remove());
    
    // Очищаем глобальные переменные
    delete window.currentDepositAmount;
    delete window.currentIncomeSource;
    
    // Показываем подтверждение
    showAtmSuccess('ТРАНЗАКЦИЯ ЗАВЕРШЕНА', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: #00ff88; font-size: 1.1rem; margin-bottom: 1rem;">✅ Деньги зачислены!</p>
            <p style="color: #ffffff; margin-bottom: 0.5rem;">Сумма: <strong>${finalAmount} уе</strong></p>
            <p style="color: #ffffff; margin-bottom: 0.5rem;">Источник: <strong>${incomeSource}</strong></p>
            ${taxPaid > 0 ? `<p style="color: #ff6b6b;">Налог: <strong>${taxPaid} уе</strong></p>` : ''}
        </div>
    `);
}

// Функции для сенсорного управления
let isTouchDevice = false;


// Функция для улучшенной прокрутки в магазинах на сенсорных устройствах
function enhanceModalForTouch(modal) {
    if (!isTouchDevice) return;
    
    const modalBody = modal.querySelector('.modal-body');
    if (!modalBody) return;
    
    // Добавляем momentum scrolling для iOS
    modalBody.style.webkitOverflowScrolling = 'touch';
    modalBody.style.overflowY = 'auto';
    
    // Предотвращаем bounce effect при прокрутке
    let startY = 0;
    
    modalBody.addEventListener('touchstart', (e) => {
        startY = e.touches[0].pageY;
    }, { passive: true });
    
    modalBody.addEventListener('touchmove', (e) => {
        const currentY = e.touches[0].pageY;
        const scrollTop = modalBody.scrollTop;
        const scrollHeight = modalBody.scrollHeight;
        const clientHeight = modalBody.clientHeight;
        
        // Предотвращаем прокрутку страницы, когда прокручиваем модал
        if ((scrollTop === 0 && currentY > startY) || 
            (scrollTop + clientHeight >= scrollHeight && currentY < startY)) {
            // Достигли края - позволяем закрыть модал
        } else {
            e.stopPropagation();
        }
    }, { passive: true });
}

// Функция для добавления жестов свайпа в магазинах
function addSwipeGestures(modal) {
    if (!isTouchDevice) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    const modalElement = modal.querySelector('.modal');
    if (!modalElement) return;
    
    modalElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    modalElement.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        // Свайп вниз для закрытия модала (если прокрутка в начале)
        const modalBody = modalElement.querySelector('.modal-body');
        if (modalBody && modalBody.scrollTop === 0 && deltaY > 100 && Math.abs(deltaX) < 50) {
            const closeButton = modal.querySelector('.icon-button');
            if (closeButton) closeButton.click();
        }
    }
}

// Функция для увеличения кнопок на сенсорных устройствах
function enhanceButtonsForTouch(modal) {
    if (!isTouchDevice) return;
    
    const buttons = modal.querySelectorAll('.pill-button');
    buttons.forEach(button => {
        button.style.minHeight = '44px';
        button.style.minWidth = '44px';
        button.style.padding = '0.75rem 1rem';
        button.style.fontSize = '1rem';
        button.style.touchAction = 'manipulation';
    });
}

// Функции для встроенных кнопок +/-

function initializeNumericInputs() {
    // Характеристики
    createNumericInput('statINT', 1, 20);
    createNumericInput('statDEX', 1, 20);
    createNumericInput('statBODY', 1, 20);
    createNumericInput('statTECH', 1, 20);
    createNumericInput('statCHA', 1, 20);
    createNumericInput('statREA', 1, 20);
    createNumericInput('statWILL', 1, 20);
    
    // Удача и осознанность
    createNumericInput('luckCurrent', 0, 99);
    createNumericInput('luckMax', 1, 99);
    createNumericInput('awarenessCurrent', 0, 999);
    createNumericInput('awarenessMax', 1, 999);
    
    // Здоровье
    createNumericInput('healthCurrent', 0, 999);
    
    // Очки обучения и ролевые очки
    createNumericInput('experiencePoints', 0, 9999);
    createNumericInput('roleplayPoints', 0, 9999);
    
    // Броня ОС - убрано для использования простых полей ввода
    
}

// Инициализация определения сенсорного устройства при загрузке страницы
// Функция для автоматического изменения высоты textarea

// Инициализация автоматического изменения высоты для профессиональных навыков

document.addEventListener('DOMContentLoaded', () => {
    detectTouchDevice();
    initializeNumericInputs();
    initializeProfessionalSkillsTextareas();
    
    // Наблюдаем за добавлением модалов и улучшаем их для сенсорного управления
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('modal-overlay')) {
                    enhanceModalForTouch(node);
                    addSwipeGestures(node);
                    enhanceButtonsForTouch(node);
                }
            });
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: false
    });
});

function showExitConfirmation() {
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
        <div class="modal atm-style" style="max-width: 300px; background: #0066CC; border: 2px solid #004080; border-radius: 12px;">
            <div class="modal-header" style="background: #0052A3; padding: 1rem; border-bottom: 2px solid #004080;">
                <h3 style="color: #FFFFFF; text-align: center; margin: 0; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3939-6162-4633-a238-623334613265/photo.png" alt="ATM" style="width: 24px; height: 24px;">ВНИМАНИЕ</h3>
                <button class="icon-button" onclick="closeModal(this)" style="color: #FFFFFF;">×</button>
            </div>
            <div class="modal-body" style="padding: 1.5rem;">
                <p style="color: #FFFFFF; text-align: center; margin-bottom: 1rem; font-size: 1.1rem;">Завершить транзакцию?</p>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="atm-button" onclick="exitAtmTransaction()" style="flex: 1; background: #00CC66; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Да</button>
                    <button class="atm-button" onclick="closeModal(this)" style="flex: 1; background: #CC0000; border: none; color: #ffffff; padding: 0.75rem; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Нет</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function exitAtmTransaction() {
    // Закрываем все модалы банкомата
    const atmModals = document.querySelectorAll('.atm-modal');
    atmModals.forEach(modal => modal.remove());
    
    // Закрываем модал подтверждения
    const confirmationModal = document.querySelector('.modal-overlay');
    if (confirmationModal) confirmationModal.remove();
    
    // Очищаем глобальные переменные
    delete window.currentDepositAmount;
    delete window.currentIncomeSource;
}


function payRent(housingId) {
    const housing = state.property.housing.find(h => h.id === housingId);
    if (!housing) return;
    
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
                <h3><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Оплата аренды</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    Оплата аренды за: <strong>${housing.name}</strong>
                </p>
                <div class="input-group">
                    <label class="input-label">Сумма оплаты (уе)</label>
                    <input type="text" class="input-field" id="rentAmount" placeholder="Введите сумму" data-numeric="true">
                </div>
                <p style="color: var(--muted); font-size: 0.85rem; margin-top: 0.5rem; text-align: center;">
                    Ваш баланс: <span style="color: var(--success); font-weight: 600;">${state.money} уе</span>
                </p>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="confirmPayRent('${housingId}')">Оплатить</button>
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
    
    // Применяем числовую валидацию к полю ввода
    const rentInput = document.getElementById('rentAmount');
    if (rentInput) {
        rentInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
        rentInput.addEventListener('keypress', function(e) {
            if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
            }
        });
    }
}

function confirmPayRent(housingId) {
    const housing = state.property.housing.find(h => h.id === housingId);
    if (!housing) return;
    
    const rentAmount = parseInt(document.getElementById('rentAmount').value) || 0;
    
    if (rentAmount <= 0) {
        showModal('Ошибка', 'Укажите сумму оплаты!');
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < rentAmount) {
        const shortage = rentAmount - currentMoney;
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
                <p style="color: var(--muted);">Нужно: ${rentAmount} уе</p>
                <p style="color: var(--muted);">Доступно: ${currentMoney} уе</p>
                <p style="color: ${getThemeColors().danger}; font-weight: 600; margin-top: 0.5rem;">Не хватает: ${shortage} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - rentAmount;
    updateMoneyDisplay();
    scheduleSave();
    
    // Логируем оплату жилья
    addToRollLog('purchase', {
        item: `Аренда жилья: ${housing.name}`,
        price: rentAmount,
        category: 'Оплата жилья'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Оплата выполнена', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">✅ Аренда оплачена!</p>
            <p style="color: var(--muted);">Жилье: ${housing.name}</p>
            <p style="color: var(--muted);">Списано: ${rentAmount} уе</p>
        </div>
    `);
}

function removeHousing(housingId) {
    const housing = state.property.housing.find(h => h.id === housingId);
    if (!housing) return;
    
        state.property.housing = state.property.housing.filter(h => h.id !== housingId);
        renderHousing();
        scheduleSave();
}

// Функции для управления характеристиками с кнопками +/-
function increaseStat(statName) {
    const input = document.getElementById(`stat${statName}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.min(20, currentValue + 1);
        input.value = newValue;
        state.stats[statName] = newValue;
        
        // Вызываем соответствующие функции обновления
        if (statName === 'INT') {
            updateAwarenessMax();
        } else if (statName === 'DEX' || statName === 'BODY' || statName === 'WILL') {
            updateDerivedStats();
        }
        if (statName === 'BODY' || statName === 'WILL') {
            calculateAndUpdateHealth();
        }
        
        scheduleSave();
    }
}

function decreaseStat(statName) {
    const input = document.getElementById(`stat${statName}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(1, currentValue - 1);
        input.value = newValue;
        state.stats[statName] = newValue;
        
        // Вызываем соответствующие функции обновления
        if (statName === 'INT') {
            updateAwarenessMax();
        } else if (statName === 'DEX' || statName === 'BODY' || statName === 'WILL') {
            updateDerivedStats();
        }
        if (statName === 'BODY' || statName === 'WILL') {
            calculateAndUpdateHealth();
        }
        
        scheduleSave();
    }
}

// Функции для управления уровнем навыков с кнопками +/-
function increaseSkillLevel(skillId) {
    const input = document.getElementById(`skillLevel_${skillId}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.min(10, currentValue + 1);
        input.value = newValue;
        updateSkillLevel(skillId, newValue);
    }
}

function decreaseSkillLevel(skillId) {
    const input = document.getElementById(`skillLevel_${skillId}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue - 1);
        input.value = newValue;
        updateSkillLevel(skillId, newValue);
    }
}

// Функции для управления профессиональными навыками (перенесены в новую систему выше)

// Дубль updateDerivedStats удален (первое определение на строке 220)

// Функция для отображения боеприпасов
function renderAmmo() {
    const container = document.getElementById('ammoContainer');
    if (!container) return;
    
    if (state.ammo.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Боеприпасы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.ammo.map((ammo, index) => `
        <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">
                    ${ammo.type} (${ammo.weaponType})
                </div>
                <div style="color: ${getThemeColors().text}; font-size: 0.8rem; margin-bottom: 0.25rem;">
                    Количество: ${ammo.quantity} ${ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты' ? 'шт.' : 'патронов'}
                </div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">
                    Цена: ${ammo.price} уе | Нагрузка: ${ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты' ? ammo.quantity : Math.ceil(ammo.quantity / 10)}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="changeAmmoQuantity(${index}, -1)" style="background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer; font-size: 1rem;" title="Уменьшить количество">-</button>
                <span style="color: ${getThemeColors().text}; font-weight: 600; min-width: 30px; text-align: center;">${ammo.quantity}</span>
                <button onclick="changeAmmoQuantity(${index}, 1)" style="background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer; font-size: 1rem;" title="Увеличить количество">+</button>
                <button onclick="removeAmmo(${index})" style="background: transparent; border: none; color: ${getThemeColors().danger}; cursor: pointer; margin-left: 0.5rem;" title="Удалить">
                    <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" style="width: 16px; height: 16px;">
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// НОВЫЕ ФУНКЦИИ - ДОБАВЛЕНО СЕГОДНЯ
// ============================================================================

// Функция переключения торга
function toggleBargainEnabled(enabled) {
    state.bargainEnabled = enabled;
    scheduleSave();
    
    // Перерисовываем навыки, чтобы обновить чекбокс
    renderSkills();
    
    const statusText = enabled ? 'включён' : 'отключён';
    showModal('Торг ' + statusText, `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().text}; font-size: 1rem; margin-bottom: 0.5rem;">
                Навык "Торг" ${statusText} для покупок и продаж.
            </p>
            ${!enabled ? '<p style="color: var(--muted); font-size: 0.85rem;">Вы можете использовать торг только 1 раз за сцену.</p>' : ''}
            </div>
    `);
}

// Экспорт всех данных персонажа в JSON
function exportData() {
    try {
        // Собираем ВСЕ данные персонажа
        const exportData = {
            // Основная информация
            characterName: state.characterName,
            characterClass: state.characterClass,
            characterLevel: state.characterLevel,
            experiencePoints: state.experiencePoints,
            roleplayPoints: state.roleplayPoints,
            avatar: state.avatar,
            
            // Характеристики
            stats: { ...state.stats },
            
            // Удача
            luck: { ...state.luck },
            
            // Производные характеристики
            awareness: { ...state.awareness },
            reputation: state.reputation,
            
            // Здоровье и ресурсы
            health: { ...state.health },
            money: state.money,
            
            // Предыстория
            backstory: state.backstory,
            
            // Навыки
            skills: [...state.skills],
            professionalSkills: [...state.professionalSkills],
            bargainEnabled: state.bargainEnabled,
            
            // Дека
            deck: { ...state.deck },
            
            // ОЗУ деки
            deckRam: { ...state.deckRam },
            
            // Снаряжение
            gear: [...state.gear],
            
            // Оружие
            weapons: [...state.weapons],
            
            // Боеприпасы
            ammo: [...state.ammo],
            
            // Программы деки
            deckPrograms: [...state.deckPrograms],
            
            // Модули оружия
            weaponModules: [...state.weaponModules],
            
            // Модули транспорта
            vehicleModules: [...(state.vehicleModules || [])],
            
            // Имущество
            property: {
                vehicles: [...state.property.vehicles],
                housing: [...(state.property.housing || [])],
                commercialProperty: [...(state.property.commercialProperty || [])]
            },
            
            // Препараты
            drugs: [...state.drugs],
            
            // Нагрузка
            load: { ...state.load },
            
            // Скупщик
            fenceShop: { ...state.fenceShop },
            
            // Лог бросков
            rollLog: [...state.rollLog],
            
            // Заметки
            notes: state.notes || '',
            
            // Счетчики
            counters: [...(state.counters || [])],
            
            // Критические травмы
            criticalInjuries: [...state.criticalInjuries],
            
            // Щепки памяти
            deckChips: [...state.deckChips],
            
            // Имплантаты
            implants: [...state.implants],
            
            // Установленные модули имплантов
            installedModules: [...(state.installedModules || [])],
            
            // Броня по зонам
            armor: { ...state.armor },
            
            // Титаническая броня
            titanicArmorConnected: state.titanicArmorConnected || false,
            
            // Лог транзакций
            transactionLog: [...(state.transactionLog || [])],
            
            // Графы предыстории
            backstoryGraphs: { ...state.backstoryGraphs },
            
            // Настройки интерфейса
            uiSettings: { ...state.uiSettings },
            
            // Размеры и порядок секций
            sectionSizes: { ...state.sectionSizes },
            layoutOrder: [...(state.layoutOrder || [])],
            
            // Недвижимость
            property: {
                vehicles: [...state.property.vehicles],
                housing: [...state.property.housing],
                commercialProperty: [...state.property.commercialProperty]
            },
            
            // Версия экспорта
            exportVersion: '1.0',
            exportDate: new Date().toISOString()
        };
        
        // Создаём JSON строку
        const jsonString = JSON.stringify(exportData, null, 2);
        
        // Создаём и скачиваем файл
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ezy-cyber-character-${state.characterName || 'unnamed'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showModal('Персонаж сохранён', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 0.5rem;">✓ Персонаж успешно сохранён!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Файл: <strong>${a.download}</strong>
                </p>
                <p style="color: var(--muted); font-size: 0.8rem; margin-top: 0.5rem;">
                    Все данные персонажа экспортированы в JSON файл.
                </p>
                </div>
        `);
        
    } catch (error) {
        console.error('Ошибка при экспорте данных:', error);
        showModal('Ошибка экспорта', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 0.5rem;">✗ Ошибка при сохранении!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Не удалось сохранить персонажа. Попробуйте ещё раз.
                </p>
            </div>
        `);
    }
}

// Импорт данных персонажа из JSON
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Проверяем версию экспорта
                if (!importedData.exportVersion) {
                    showModal('Ошибка импорта', `
                        <div style="text-align: center; padding: 1rem;">
                            <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 0.5rem;">✗ Неверный формат файла!</p>
                            <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                                Файл не является сохранением персонажа EZY Cyber.
                            </p>
        </div>
                    `);
                    return;
                }
                
                // Подтверждение импорта
                showModal('Подтверждение импорта', `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: ${getThemeColors().text}; font-size: 1rem; margin-bottom: 1rem;">
                            Загрузить персонажа <strong>${importedData.characterName || 'Без имени'}</strong>?
                        </p>
                        <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                            Все текущие данные будут заменены!
                        </p>
                        <div style="display: flex; gap: 1rem;">
                            <button class="pill-button" onclick="closeModal(this)" style="flex: 1;">Отмена</button>
                            <button class="pill-button success-button" onclick="confirmImport()" style="flex: 1;">Загрузить</button>
                </div>
            </div>
                `);
                
                // Сохраняем данные для импорта
                window.pendingImportData = importedData;
                
            } catch (error) {
                console.error('Ошибка при импорте данных:', error);
                showModal('Ошибка импорта', `
                    <div style="text-align: center; padding: 1rem;">
                        <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 0.5rem;">✗ Ошибка при загрузке!</p>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                            Файл повреждён или имеет неверный формат.
                        </p>
                    </div>
                `);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Подтверждение импорта
function confirmImport() {
    if (!window.pendingImportData) return;
    
    try {
        const importedData = window.pendingImportData;
        
        // Очищаем текущие данные
        clearAllData(true); // true = без подтверждения
        
        // Загружаем импортированные данные
        Object.assign(state, importedData);
        
        // Загружаем счетчики из импортированных данных
        if (importedData.counters && Array.isArray(importedData.counters)) {
            state.counters = [...importedData.counters];
            if (typeof saveCounters === 'function') {
                saveCounters();
            }
        }
        
        // Обновляем отображение
        updateAllDisplays();
        
        // Сохраняем
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
        
        showModal('Персонаж загружен', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 0.5rem;">✓ Персонаж успешно загружен!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Все данные персонажа восстановлены.
                </p>
            </div>
        `);
        
        // Очищаем временные данные
        window.pendingImportData = null;
        
    } catch (error) {
        console.error('Ошибка при подтверждении импорта:', error);
        showModal('Ошибка импорта', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 0.5rem;">✗ Ошибка при загрузке!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Не удалось загрузить персонажа.
                </p>
            </div>
        `);
    }
}

// Полная очистка всех данных персонажа
function clearAllData(skipConfirmation = false) {
    if (!skipConfirmation) {
        showModal('Подтверждение очистки', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">⚠️ ВНИМАНИЕ!</p>
                <p style="color: ${getThemeColors().text}; font-size: 1rem; margin-bottom: 1rem;">
                    Вы действительно хотите удалить <strong>ВСЕ</strong> данные персонажа?
                </p>
                <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
                    Это действие нельзя отменить!
                </p>
                <div style="display: flex; gap: 1rem;">
                    <button class="pill-button" onclick="closeModal(this)" style="flex: 1;">Отмена</button>
                    <button class="pill-button danger-button" onclick="confirmClearAllData()" style="flex: 1;">Удалить всё</button>
                </div>
            </div>
        `);
        return;
    }
    
    // Выполняем очистку
    performClearAllData();
}

// Подтверждение очистки
function confirmClearAllData() {
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
    performClearAllData();
}

// Выполнение очистки всех данных
function performClearAllData() {
    try {
        // Сбрасываем ВСЕ данные к начальным значениям
        state.characterName = '';
        state.characterClass = '';
        state.characterLevel = 1;
        state.experiencePoints = 0;
        state.roleplayPoints = 0;
        state.avatar = '';
        
        // Характеристики (1-20)
        state.stats = {
            WILL: 5,    // Воля
            INT: 5,     // Ум
            DEX: 5,     // Ловкость
            BODY: 5,    // Телосложение
            REA: 5,     // Реакция
            TECH: 5,    // Техника
            CHA: 5      // Характер
        };
        
        // Удача
        state.luck = {
            current: 1,
            max: 1
        };
        
        // Производные характеристики
        state.awareness = {
            current: 50,
            max: 50
        };
        state.reputation = 0;
        
        // Здоровье и ресурсы
        state.health = {
            current: 25,
            max: 25
        };
        state.money = 3500; // НОВОЕ: стартовые деньги 3500 уе
        
        // Предыстория
        state.backstory = '';
        
        // Навыки
        state.skills = [];
        state.professionalSkills = [];
        state.bargainEnabled = true;
        
        // Дека с новыми характеристиками
        state.deck = {
            name: 'Newby-серия',
            operative: '',
            grid: '4',        // НОВОЕ: Сетка 4
            memory: '4',      // НОВОЕ: Память 4
            version: '10',    // НОВОЕ: Версия ПО 10
            osVersion: ''     // НОВОЕ: Версия OS
        };
        
        // ОЗУ деки
        state.deckRam = {
            current: 3,       // НОВОЕ: ОЗУ 3
            max: 3
        };
        
        // Снаряжение
        state.gear = [];
        
        // Добавляем стартовый Хронотом (Дешевый)
        state.gear.push({
            id: generateId('gear'),
            name: 'ХРОНОТОМ (ДЕШЁВЫЙ)',
            description: 'Устройство с AR-режимом, встроенной рекламой и базовым функционалом связи.',
            price: 0,
            load: 0,
            isDefault: true
        });
        
        // Оружие
        state.weapons = [];
        
        // Боеприпасы
        state.ammo = [];
        
        // Инвентарь брони
        state.armorInventory = [];
        
        // Программы деки
        state.deckPrograms = [];
        
        // Коллекция дек
        state.decks = [];
        
        // Снаряжение для дек
        state.deckGear = [];
        
        // Модули оружия
        state.weaponModules = [];
        
        // Модули транспорта
        state.vehicleModules = [];
        
        // Имущество (будет заполнено ниже)
        state.property = {
            vehicles: [],
            housing: [],
            commercialProperty: []
        };
        
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
        
        // Препараты
        state.drugs = [];
        
        // Нагрузка
        state.load = {
            current: 0,
            max: 25
        };
        
        // Скупщик
        state.fenceShop = {
            itemPrices: {}
        };
        
        // Лог бросков
        state.rollLog = [];
        
        // Заметки
        state.notes = '';
        
        // Счетчики
        state.counters = [];
        
        // Критические травмы
        state.criticalInjuries = [];
        
        // Щепки памяти
        state.deckChips = [];
        
        // Имплантаты (правильная структура как в data.js)
        state.implants = {
            head: {
                installed: false,
                parts: { main: null }
            },
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
            organs: {
                installed: false,
                parts: { main: null }
            },
            neuromodule: {
                installed: false,
                parts: { main: null }
            }
        };
        
        // Установленные модули имплантов
        state.installedModules = [];
        
        // Броня по зонам
        state.armor = {
            head: { os: 0, type: 'Лёгкая', activeDefense: false, activeDefenseType: 'Микроракеты' },
            body: { os: 0, type: 'Лёгкая', activeDefense: false, activeDefenseType: 'Микроракеты' },
            arms: { os: 0, type: 'Лёгкая', activeDefense: false, activeDefenseType: 'Микроракеты' },
            legs: { os: 0, type: 'Лёгкая', activeDefense: false, activeDefenseType: 'Микроракеты' }
        };
        
        // Титаническая броня
        state.titanicArmorConnected = false;
        
        // Жилье с стартовой квартирой
        state.property.housing = [
            {
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
            }
        ];
        
        // Коммерческая недвижимость
        state.property.commercialProperty = [];
        
        // Графы предыстории
        state.backstoryGraphs = {
            born: { text: '', completed: false },
            grewUp: { text: '', completed: false },
            adolescence: { text: '', completed: false },
            loveStory: { text: '', completed: false },
            enmity: { text: '', completed: false },
            enmityBlame: { text: '', completed: false },
            revenge: { text: '', completed: false },
            whyHere: { text: '', completed: false },
            howMet: { text: '', completed: false },
            moneyAttitude: { text: '', completed: false },
            peopleAttitude: { text: '', completed: false },
            lastWeekEvent: { text: '', completed: false }
        };
        
        // Настройки интерфейса
        state.uiSettings = {
            compactSkills: false
        };
        
        // Размеры и порядок секций
        state.sectionSizes = {};
        state.layoutOrder = [];
        
        // Обновляем отображение полей ввода
        if (typeof updateUIFromState === 'function') updateUIFromState();
        
        // Очищаем счетчики из localStorage
        if (typeof saveCounters === 'function') {
            state.counters = [];
            saveCounters();
        }
        
        // Обновляем все дисплеи
        if (typeof updateAllDisplays === 'function') updateAllDisplays();
        
        // Принудительно обновляем все производные характеристики
        if (typeof updateDerivedStats === 'function') updateDerivedStats();
        if (typeof calculateAndUpdateHealth === 'function') calculateAndUpdateHealth();
        if (typeof updateAwarenessMax === 'function') updateAwarenessMax();
        
        // Принудительно обновляем все отображения
        if (typeof updateMoneyDisplay === 'function') updateMoneyDisplay();
        if (typeof updateLoadDisplay === 'function') updateLoadDisplay();
        
        // Сохраняем
        if (typeof scheduleSave === 'function') scheduleSave();
        
        showModal('Данные очищены', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 0.5rem;">✓ Все данные очищены!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Персонаж сброшен к начальным значениям.
                </p>
                <p style="color: var(--muted); font-size: 0.8rem; margin-top: 0.5rem;">
                    Стартовые деньги: <strong>3500 уе</strong><br>
                    Дека: ОЗУ 3, Память 4, Сетка 4, версия ПО 10<br>
                    Характеристики равны <strong>5</strong><br>
                    Транспорт: <strong>Компактный Микромобиль</strong><br>
                    Жилье: <strong>11-метров</strong><br>
                    Снаряжение: <strong>Хронотом (Дешёвый)</strong>
                </p>
            </div>
        `);
        
    } catch (error) {
        console.error('Ошибка при очистке данных:', error);
        showModal('Ошибка очистки', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 0.5rem;">✗ Ошибка при очистке!</p>
                <p style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                    Не удалось очистить данные. Попробуйте ещё раз.
                </p>
                </div>
        `);
    }
}

// Обновление всех отображений
function updateAllDisplays() {
    // Обновляем основные характеристики
    updateDerivedStats();
    calculateAndUpdateHealth();
    updateAwarenessMax();
    
    // Обновляем снаряжение и оружие (с проверкой существования функций)
    if (typeof renderGear === 'function') renderGear();
    if (typeof renderWeapons === 'function') renderWeapons();
    if (typeof renderAmmo === 'function') renderAmmo();
    if (typeof renderDeckPrograms === 'function') renderDeckPrograms();
    if (typeof renderDeckChips === 'function') renderDeckChips();
    if (typeof updateDeckDisplay === 'function') updateDeckDisplay();
    // if (typeof renderVehicles === 'function') renderVehicles(); // Удалено - используется новая система transport.js
    if (typeof renderTransport === 'function') renderTransport();
    if (typeof renderVehicleModulesInventory === 'function') renderVehicleModulesInventory();
    if (typeof renderDrugs === 'function') renderDrugs();
    if (typeof renderHousing === 'function') renderHousing();
    if (typeof renderCommercialProperty === 'function') renderCommercialProperty();
    if (typeof renderImplants === 'function') renderImplants();
    if (typeof renderCriticalInjuries === 'function') renderCriticalInjuries();
    if (typeof renderArmorInventory === 'function') renderArmorInventory();
    if (typeof updateArmorRemoveButtons === 'function') updateArmorRemoveButtons();
    if (typeof renderDeckCollection === 'function') renderDeckCollection();
    
    // Обновляем навыки
    renderSkills();
    renderProfessionalSkills();
    
    // Обновляем деньги и нагрузку
    updateMoneyDisplay();
    updateLoadDisplay();
    
    // Обновляем лог
    renderRollLog();
}

// Функция обновления OS версии деки
function updateDeckOsVersion(deckId, osVersion) {
    if (deckId === 'main') {
        state.deck.osVersion = osVersion;
    } else {
        const deck = state.decks.find(d => d.id == deckId);
        if (deck) {
            deck.osVersion = osVersion;
        }
    }
    
    scheduleSave();
}

// Функция броска инициативы
function rollInitiative() {
    // Получаем значение характеристики РЕА
    let reactionValue = parseInt(document.getElementById('statREA').value) || 0;
    
    // Применяем штрафы от брони к РЕА
    const penalties = calculateArmorPenalties();
    if (penalties.reaction !== 0) {
        reactionValue = Math.max(1, reactionValue + penalties.reaction);
    }
    
    // Получаем модификатор от пользователя
    const modifierValue = document.getElementById('initiativeModifier').value || '0';
    const modifier = parseInt(modifierValue) || 0;
    
    // Показываем модальное окно с броском
    showModal('Бросок Инициативы', 
        `<div style="text-align: center; padding: 1rem;">
            <div style="font-size: 1.2rem; margin-bottom: 1rem; color: var(--accent);">🎯 Бросок Инициативы</div>
            <div id="initiativeDiceAnimation" style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div id="initiativeDice1" class="dice rolling" style="animation: roll 1.5s ease-in-out;">?</div>
                <div id="initiativeDice2" class="dice rolling" style="animation: roll 1.5s ease-in-out;">?</div>
                <div id="initiativeD4" class="d4-triangle" style="display: none;"></div>
            </div>
            <div id="initiativeFormula" style="color: var(--muted); font-size: 0.9rem; text-align: center; margin-bottom: 0.5rem; display: none;"></div>
            <div id="initiativeDiceRoll" style="font-size: 1rem; margin-bottom: 1rem;">
                Бросаем кубики...
        </div>
            <div style="font-size: 0.9rem; color: var(--muted);">
                РЕА: ${reactionValue}${penalties.reaction !== 0 ? ` (броня: ${penalties.reaction > 0 ? '+' : ''}${penalties.reaction})` : ''} + Модификатор: ${modifier}
            </div>
        </div>`,
        [
            {
                text: 'Закрыть',
                class: 'primary-button',
                onclick: 'closeModal(this)'
            }
        ]
    );
    
    // Анимация броска кубиков
    setTimeout(() => {
        // Бросаем 2d6
        const dice = rollDice(2, 6);
        const dice1 = dice[0];
        const dice2 = dice[1];
        const diceTotal = dice1 + dice2;
        
        // Рассчитываем итоговый результат
        let totalResult = diceTotal + reactionValue + modifier;
        let d4Value = null;
        let d4Type = null; // 'penalty' или 'bonus'
        
        // Специальные правила для инициативы:
        if (dice1 === 1 && dice2 === 1) {
            // Двойные единицы - критический провал
            totalResult = 'КРИТИЧЕСКИЙ ПРОВАЛ';
        } else if (dice1 === 6 && dice2 === 6) {
            // Двойные шестерки - критический успех
            totalResult = 'КРИТИЧЕСКИЙ УСПЕХ';
        } else if ((dice1 === 1 && dice2 === 6) || (dice1 === 6 && dice2 === 1)) {
            // Единица и шестерка - компенсируют друг друга, d4 не кидаем
            // Ничего не делаем, используем обычный результат
        } else if (dice1 === 1 || dice2 === 1) {
            // Есть единица на одном из D6 (но не на обоих) - вычитаем 1d4
            d4Value = rollDice(1, 4)[0];
            d4Type = 'penalty';
            totalResult -= d4Value;
        } else if (dice1 === 6 || dice2 === 6) {
            // Есть шестерка на одном из D6 - добавляем 1d4
            d4Value = rollDice(1, 4)[0];
            d4Type = 'bonus';
            totalResult += d4Value;
        }
        
        // Показываем анимацию кубиков
        showInitiativeDiceAnimation(dice1, dice2, totalResult, reactionValue, modifier, d4Value, d4Type, penalties.reaction);
        
        // Обновляем отображение результата на кнопке
        const resultElement = document.getElementById('initiativeResult');
        resultElement.innerHTML = `${totalResult}`;
        
        // Добавляем запись в лог бросков
        addToRollLog('initiative', {
            dice1: dice1,
            dice2: dice2,
            reaction: reactionValue,
            modifier: modifier,
            d4Value: d4Value,
            d4Type: d4Type,
            total: totalResult
        });
        
        // Добавляем визуальный эффект на кнопку
        const button = document.querySelector('.initiative-compact');
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
    }, 1000); // Задержка для анимации
}

// Функция анимации броска кубиков для инициативы
function showInitiativeDiceAnimation(dice1, dice2, totalResult, reactionValue, modifier, d4Value, d4Type, armorPenalty = 0) {
    const diceAnimation = document.getElementById('initiativeDiceAnimation');
    const dice1Element = document.getElementById('initiativeDice1');
    const dice2Element = document.getElementById('initiativeDice2');
    const d4Element = document.getElementById('initiativeD4');
    const resultElement = document.getElementById('initiativeDiceRoll');
    const formulaElement = document.getElementById('initiativeFormula');
    
    if (diceAnimation) diceAnimation.style.display = 'flex';
    if (resultElement) {
        resultElement.textContent = 'Рассчитываем';
        resultElement.classList.add('loading-dots');
    }
    
    // Скрываем формулу сначала
    if (formulaElement) {
        formulaElement.style.display = 'none';
    }
    
    // Скрываем d4 сначала
    if (d4Element) {
        d4Element.style.display = 'none';
        d4Element.classList.remove('rolling');
    }
    
    // Основная анимация d6 - 1.2 секунды
    const mainDuration = 1200;
    const interval = 80;
    let currentTime = 0;
    
    const animateDice = () => {
        if (currentTime < mainDuration) {
            // Показываем случайные числа во время анимации
            if (dice1Element) dice1Element.textContent = Math.floor(Math.random() * 6) + 1;
            if (dice2Element) dice2Element.textContent = Math.floor(Math.random() * 6) + 1;
            
            currentTime += interval;
            setTimeout(animateDice, interval);
        } else {
            // Показываем финальные результаты
            if (dice1Element) {
                dice1Element.textContent = dice1;
                dice1Element.classList.remove('rolling');
            }
            if (dice2Element) {
                dice2Element.textContent = dice2;
                dice2Element.classList.remove('rolling');
            }
            
            // Показываем d4 если нужно
            if (d4Value && d4Element) {
                setTimeout(() => {
                    d4Element.style.display = 'block';
                    d4Element.classList.add('rolling');
                    d4Element.textContent = d4Value;
                    
                    // Устанавливаем правильный класс и позицию в зависимости от типа
                    if (d4Type === 'penalty') {
                        // Штраф (выпадение 1) - красный кубик слева
                        d4Element.classList.remove('d4-bonus');
                        d4Element.classList.add('d4-penalty');
                        d4Element.style.order = '-1'; // Размещаем слева от d6 кубиков
                    } else {
                        // Бонус (выпадение 6) - зеленый кубик справа
                        d4Element.classList.remove('d4-penalty');
                        d4Element.classList.add('d4-bonus');
                        d4Element.style.order = '1'; // Размещаем справа от d6 кубиков
                    }
                    
                    // Анимация d4
                    setTimeout(() => {
                        d4Element.classList.remove('rolling');
                    }, 800);
                }, 200);
            }
            
            // Показываем результат
            setTimeout(() => {
                if (resultElement) {
                    resultElement.classList.remove('loading-dots');
                    
                    if (typeof totalResult === 'string') {
                        // Критический результат
                        resultElement.innerHTML = `
                            <div style="font-size: 1.5rem; font-weight: bold; color: ${getThemeColors().danger}; margin-bottom: 0.5rem;">
                                ${totalResult}
            </div>
                        `;
                    } else {
                        // Обычный результат
                        const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                        const d4Str = d4Value ? (d4Type === 'penalty' ? `-${d4Value}` : `+${d4Value}`) : '';
                        
                        resultElement.innerHTML = `
                            <div style="font-size: 1.5rem; font-weight: bold; color: var(--accent); margin-bottom: 0.5rem;">
                                Результат: ${totalResult}
                </div>
                            <div style="font-size: 0.9rem; color: ${getThemeColors().text};">
                                2d6: ${dice1} + ${dice2} = ${dice1 + dice2}<br>
                                + РЕА (${reactionValue}) + Мод (${modifier})${d4Str} = <strong>${totalResult}</strong>
        </div>
    `;
                    }
                }
                
                // Показываем формулу
                if (formulaElement) {
                    const modifierStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    const armorPenaltyStr = armorPenalty !== 0 ? ` (броня: ${armorPenalty > 0 ? '+' : ''}${armorPenalty})` : '';
                    const d4Str = d4Value ? (d4Type === 'penalty' ? `-${d4Value}` : `+${d4Value}`) : '';
                    const formula = `${reactionValue}${armorPenaltyStr}${modifierStr}+${dice1}+${dice2}${d4Str} = ${totalResult}`;
                    formulaElement.textContent = formula;
                    formulaElement.style.display = 'block';
                }
            }, d4Value ? 1000 : 500);
        }
    };
    
    animateDice();
}

// Функция удаления программы из деки безвозвратно
function removeProgramFromDeck(deckId, programIndex) {
    // Находим программы для конкретной деки
    const programsOnDeck = state.deckPrograms.filter(program => program.installedDeckId == deckId);
    
    if (programIndex >= programsOnDeck.length) {
        showModal('Ошибка', 'Программа не найдена!');
        return;
    }
    
    const programToRemove = programsOnDeck[programIndex];
    
    // Показываем подтверждение удаления
    showModal('Подтвердите удаление', 
        `Вы уверены, что хотите безвозвратно удалить программу "${programToRemove.name}"?<br><br>
        <div style="color: ${getThemeColors().danger}; font-size: 0.9rem; margin-top: 0.5rem;">
            ⚠️ Программа будет удалена навсегда и не может быть восстановлена!
        </div>`,
        [
            {
                text: 'Отмена',
                class: 'secondary-button',
                onclick: 'closeModal(this)'
            },
            {
                text: 'Удалить',
                class: 'danger-button',
                onclick: `confirmRemoveProgramFromDeck('${deckId}', ${programIndex})`
            }
        ]
    );
}

// Функция подтверждения удаления программы
function confirmRemoveProgramFromDeck(deckId, programIndex) {
    // Находим программы для конкретной деки
    const programsOnDeck = state.deckPrograms.filter(program => program.installedDeckId == deckId);
    
    if (programIndex >= programsOnDeck.length) {
        showModal('Ошибка', 'Программа не найдена!');
        return;
    }
    
    const programToRemove = programsOnDeck[programIndex];
    
    // Удаляем программу из массива
    const programIndexInGlobalArray = state.deckPrograms.findIndex(program => 
        program.installedDeckId == deckId && 
        program.name === programToRemove.name &&
        program.description === programToRemove.description
    );
    
    if (programIndexInGlobalArray !== -1) {
        state.deckPrograms.splice(programIndexInGlobalArray, 1);
        
        // Закрываем модальное окно подтверждения
        closeModal(document.querySelector('.modal-overlay:last-child'));
        
        // Показываем сообщение об успешном удалении
        showModal('Программа удалена', `Программа "${programToRemove.name}" была безвозвратно удалена с деки.`);
        
        // Обновляем отображение
        scheduleSave();
        renderDeckCollection();
        updateDeckDisplay();
    } else {
        showModal('Ошибка', 'Не удалось найти программу для удаления!');
    }
}

// ==================== ФУНКЦИИ КАЛЬКУЛЯТОРА РАССТОЯНИЯ ====================

// Показать модальное окно расчета расстояния
function showDistanceModal() {
    const modal = document.getElementById('distanceModal');
    if (modal) {
        modal.style.display = 'flex';
        // Сбрасываем поля при открытии
        document.getElementById('shooterHeight').value = '';
        document.getElementById('targetDistance').value = '';
        document.getElementById('distanceResult').style.display = 'none';
        document.getElementById('hitDifficultyInfo').style.display = 'none';
        document.getElementById('distanceVisualization').innerHTML = `
            <div style="text-align: center; color: var(--muted);">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎯</div>
                <div>Введите данные для расчета</div>
            </div>
        `;
    }
}

// Скрыть модальное окно расчета расстояния
function hideDistanceModal() {
    const modal = document.getElementById('distanceModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Расчет расстояния до цели
function calculateDistance() {
    const shooterHeight = parseFloat(document.getElementById('shooterHeight').value) || 0;
    const targetDistance = parseFloat(document.getElementById('targetDistance').value) || 0;
    
    if (shooterHeight < 0 || targetDistance < 0) {
        showModal('Ошибка', 'Значения не могут быть отрицательными!');
        return;
    }
    
    // Расчет по формуле 3D расстояния: d = √(x² + y² + z²)
    // Где x = горизонтальное расстояние, y = 0 (цель на земле), z = высота стрелка
    const horizontalDistance = targetDistance;
    const verticalDistance = shooterHeight;
    const totalDistance = Math.sqrt(horizontalDistance * horizontalDistance + verticalDistance * verticalDistance);
    
    // Округляем до 1 знака после запятой
    const roundedTotal = Math.round(totalDistance * 10) / 10;
    const roundedHorizontal = Math.round(horizontalDistance * 10) / 10;
    const roundedVertical = Math.round(verticalDistance * 10) / 10;
    
    // Обновляем результаты
    document.getElementById('totalDistance').textContent = roundedTotal;
    document.getElementById('horizontalDistance').textContent = roundedHorizontal;
    document.getElementById('verticalDistance').textContent = roundedVertical;
    
    // Показываем результат
    document.getElementById('distanceResult').style.display = 'block';
    
    // Создаем визуализацию
    createDistanceVisualization(roundedHorizontal, roundedVertical, roundedTotal);
    
    // Показываем и обновляем информацию о сложности попадания
    document.getElementById('hitDifficultyInfo').style.display = 'block';
    updateHitDifficultyInfo(roundedTotal);
    
    // Добавляем запись в лог
    addToRollLog(`🎯 Расчет расстояния: Высота ${roundedVertical}п, Горизонтально ${roundedHorizontal}п = ${roundedTotal}п до цели`, {});
}

// Создание визуализации расчета расстояния
function createDistanceVisualization(horizontal, vertical, total) {
    const container = document.getElementById('distanceVisualization');
    
    // Создаем SVG для визуализации
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '160');
    svg.setAttribute('viewBox', '0 0 400 160');
    svg.style.background = 'rgba(0, 0, 0, 0.2)';
    svg.style.borderRadius = '8px';
    
    // Определяем масштаб для визуализации
    const maxDimension = Math.max(horizontal, vertical, 10); // минимум 10 для масштаба
    const scale = 100 / maxDimension; // базовая длина 100px для максимального измерения
    
    // Центрируем график в области SVG
    const svgWidth = 400;
    const svgHeight = 160;
    const margin = 30; // уменьшаем отступы от краев
    
    // Координаты точек (центрированные)
    let shooterX = margin;
    let shooterY = margin;
    let targetX = shooterX + (horizontal * scale);
    let targetY = shooterY + (vertical * scale);
    
    // Проверяем, не выходит ли график за границы, и корректируем масштаб если нужно
    const maxX = Math.max(targetX, shooterX);
    const maxY = Math.max(targetY, shooterY);
    
    if (maxX > svgWidth - margin || maxY > svgHeight - margin) {
        const scaleX = (svgWidth - 2 * margin) / Math.max(horizontal, 10);
        const scaleY = (svgHeight - 2 * margin) / Math.max(vertical, 10);
        const newScale = Math.min(scaleX, scaleY);
        
        // Пересчитываем координаты с новым масштабом
        const newTargetX = shooterX + (horizontal * newScale);
        const newTargetY = shooterY + (vertical * newScale);
        
        // Центрируем график если он меньше области
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        const graphCenterX = (shooterX + newTargetX) / 2;
        const graphCenterY = (shooterY + newTargetY) / 2;
        
        const offsetX = centerX - graphCenterX;
        const offsetY = centerY - graphCenterY;
        
        // Применяем смещение для центрирования
        shooterX = shooterX + offsetX;
        shooterY = shooterY + offsetY;
        targetX = newTargetX + offsetX;
        targetY = newTargetY + offsetY;
    } else {
        // Если график помещается, центрируем его
        const centerX = svgWidth / 2;
        const centerY = svgHeight / 2;
        const graphCenterX = (shooterX + targetX) / 2;
        const graphCenterY = (shooterY + targetY) / 2;
        
        const offsetX = centerX - graphCenterX;
        const offsetY = centerY - graphCenterY;
        
        shooterX += offsetX;
        shooterY += offsetY;
        targetX += offsetX;
        targetY += offsetY;
    }
    
    // Сетка (киберпанк стиль)
    const gridSize = 20;
    for (let x = 0; x < 400; x += gridSize) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', 0);
        line.setAttribute('x2', x);
        line.setAttribute('y2', 160);
        line.setAttribute('stroke', 'rgba(182, 103, 255, 0.1)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
    
    for (let y = 0; y < 160; y += gridSize) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', 0);
        line.setAttribute('y1', y);
        line.setAttribute('x2', 400);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', 'rgba(182, 103, 255, 0.1)');
        line.setAttribute('stroke-width', '1');
        svg.appendChild(line);
    }
    
    // Земля (горизонтальная линия)
    const groundLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    groundLine.setAttribute('x1', 0);
    groundLine.setAttribute('y1', targetY);
    groundLine.setAttribute('x2', 400);
    groundLine.setAttribute('y2', targetY);
    groundLine.setAttribute('stroke', 'rgba(125, 244, 198, 0.3)');
    groundLine.setAttribute('stroke-width', '2');
    groundLine.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(groundLine);
    
    // Линия до цели (гипотенуза) с постоянной анимацией
    const distanceLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    distanceLine.setAttribute('x1', shooterX);
    distanceLine.setAttribute('y1', shooterY);
    distanceLine.setAttribute('x2', targetX);
    distanceLine.setAttribute('y2', targetY);
    distanceLine.setAttribute('stroke', '#b667ff');
    distanceLine.setAttribute('stroke-width', '3');
    distanceLine.setAttribute('stroke-dasharray', '12,6');
    distanceLine.setAttribute('stroke-dashoffset', '0');
    
    // Добавляем постоянную анимацию пунктира
    const animateDash = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
    animateDash.setAttribute('attributeName', 'stroke-dashoffset');
    animateDash.setAttribute('values', '0;-18');
    animateDash.setAttribute('dur', '1s');
    animateDash.setAttribute('repeatCount', 'indefinite');
    animateDash.setAttribute('begin', '0.5s');
    distanceLine.appendChild(animateDash);
    
    svg.appendChild(distanceLine);
    
    // Горизонтальная линия
    const horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', shooterX);
    horizontalLine.setAttribute('y1', shooterY);
    horizontalLine.setAttribute('x2', targetX);
    horizontalLine.setAttribute('y2', shooterY);
    horizontalLine.setAttribute('stroke', '#7df4c6');
    horizontalLine.setAttribute('stroke-width', '2');
    svg.appendChild(horizontalLine);
    
    // Вертикальная линия
    const verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', targetX);
    verticalLine.setAttribute('y1', shooterY);
    verticalLine.setAttribute('x2', targetX);
    verticalLine.setAttribute('y2', targetY);
    verticalLine.setAttribute('stroke', '#b667ff');
    verticalLine.setAttribute('stroke-width', '2');
    svg.appendChild(verticalLine);
    
    // Стрелок (точка)
    const shooterCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    shooterCircle.setAttribute('cx', shooterX);
    shooterCircle.setAttribute('cy', shooterY);
    shooterCircle.setAttribute('r', '8');
    shooterCircle.setAttribute('fill', '#b667ff');
    shooterCircle.setAttribute('stroke', '#ffffff');
    shooterCircle.setAttribute('stroke-width', '2');
    svg.appendChild(shooterCircle);
    
    // Цель (точка на земле)
    const targetCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    targetCircle.setAttribute('cx', targetX);
    targetCircle.setAttribute('cy', targetY);
    targetCircle.setAttribute('r', '8');
    targetCircle.setAttribute('fill', '#ff5b87');
    targetCircle.setAttribute('stroke', '#ffffff');
    targetCircle.setAttribute('stroke-width', '2');
    svg.appendChild(targetCircle);
    
    // Подписи
    const shooterLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    shooterLabel.setAttribute('x', shooterX + 15);
    shooterLabel.setAttribute('y', shooterY - 5);
    shooterLabel.setAttribute('fill', '#b667ff');
    shooterLabel.setAttribute('font-size', '12');
    shooterLabel.setAttribute('font-weight', 'bold');
    shooterLabel.textContent = 'СТРЕЛОК';
    svg.appendChild(shooterLabel);
    
    const targetLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    targetLabel.setAttribute('x', targetX + 15);
    targetLabel.setAttribute('y', targetY + 5);
    targetLabel.setAttribute('fill', '#ff5b87');
    targetLabel.setAttribute('font-size', '12');
    targetLabel.setAttribute('font-weight', 'bold');
    targetLabel.textContent = 'ЦЕЛЬ';
    svg.appendChild(targetLabel);
    
    // Подписи расстояний (горизонтальное - под линией)
    const horizontalLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    horizontalLabel.setAttribute('x', (shooterX + targetX) / 2);
    horizontalLabel.setAttribute('y', shooterY + 20);
    horizontalLabel.setAttribute('fill', '#7df4c6');
    horizontalLabel.setAttribute('font-size', '11');
    horizontalLabel.setAttribute('font-weight', '600');
    horizontalLabel.setAttribute('text-anchor', 'middle');
    horizontalLabel.textContent = `${horizontal}п`;
    svg.appendChild(horizontalLabel);
    
    const verticalLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    verticalLabel.setAttribute('x', targetX + 15);
    verticalLabel.setAttribute('y', (shooterY + targetY) / 2);
    verticalLabel.setAttribute('fill', '#b667ff');
    verticalLabel.setAttribute('font-size', '11');
    verticalLabel.setAttribute('font-weight', '600');
    verticalLabel.textContent = `${vertical}п`;
    svg.appendChild(verticalLabel);
    
    // Общее расстояние
    const totalLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    totalLabel.setAttribute('x', (shooterX + targetX) / 2);
    totalLabel.setAttribute('y', (shooterY + targetY) / 2 - 15);
    totalLabel.setAttribute('fill', '#ffffff');
    totalLabel.setAttribute('font-size', '14');
    totalLabel.setAttribute('font-weight', 'bold');
    totalLabel.setAttribute('text-anchor', 'middle');
    totalLabel.textContent = `${total}п`;
    svg.appendChild(totalLabel);
    
    // Киберпанк эффекты
    const glow1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow1.setAttribute('cx', shooterX);
    glow1.setAttribute('cy', shooterY);
    glow1.setAttribute('r', '12');
    glow1.setAttribute('fill', 'none');
    glow1.setAttribute('stroke', '#b667ff');
    glow1.setAttribute('stroke-width', '1');
    glow1.setAttribute('opacity', '0.5');
    svg.appendChild(glow1);
    
    const glow2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    glow2.setAttribute('cx', targetX);
    glow2.setAttribute('cy', targetY);
    glow2.setAttribute('r', '12');
    glow2.setAttribute('fill', 'none');
    glow2.setAttribute('stroke', '#ff5b87');
    glow2.setAttribute('stroke-width', '1');
    glow2.setAttribute('opacity', '0.5');
    svg.appendChild(glow2);
    
    // Заменяем содержимое контейнера
    container.innerHTML = '';
    container.appendChild(svg);
}

// Закрытие модального окна по клику вне его
document.addEventListener('click', function(event) {
    const modal = document.getElementById('distanceModal');
    if (modal && modal.style.display === 'flex' && event.target === modal) {
        hideDistanceModal();
    }
});

// Закрытие модального окна по Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modal = document.getElementById('distanceModal');
        if (modal && modal.style.display === 'flex') {
            hideDistanceModal();
        }
    }
});

// Функция рендеринга программ деки (копия из deck.js для совместимости)
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem; font-size: 0.8rem;">Программы не установлены</p>';
        updateDeckCounters();
        return;
    }
    
    container.innerHTML = state.deckPrograms.map((program, index) => `
        <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <button onclick="removeDeckProgramWithChoice(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;">×</button>
            <div style="padding-right: 1.5rem;">
                <div style="color: var(--success); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${program.name}</div>
                <div style="color: var(--muted); font-size: 0.75rem; margin-bottom: 0.25rem;">
                    Цена: ${program.price} уе | ОЗУ: ${program.ram} | Память: ${program.memory || 1} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}
                </div>
                <div style="color: var(--muted); font-size: 0.7rem; line-height: 1.3;">
                    ${program.description}
                </div>
            </div>
        </div>
    `).join('');
    
    // Добавляем информацию об использовании памяти
    const memoryInfo = document.createElement('div');
    memoryInfo.style.cssText = 'margin-top: 0.5rem; padding: 0.75rem; background: rgba(91, 155, 255, 0.1); border: 1px solid #5b9bff; border-radius: 6px; text-align: center;';
    memoryInfo.innerHTML = `
        <div style="color: var(--accent); font-size: 0.8rem;">
            Использовано памяти: <strong>${usedMemory}/${maxMemory}</strong>
            ${usedMemory > maxMemory ? '<span style="color: ${getThemeColors().danger};"> (ПРЕВЫШЕНО!)</span>' : ''}
        </div>
    `;
    container.appendChild(memoryInfo);
    
    // Обновляем счетчик в заголовке
    updateDeckCounters();
}

// Функция для переключения режима редактирования предыстории (теперь не используется)
function toggleBackstoryEdit() {
    // Эта функция больше не нужна, так как редактирование происходит через карточки
    showToast('Используйте кнопки редактирования на карточках предыстории', 'info');
}

// Функция для сворачивания/разворачивания секции предыстории
function toggleBackstorySection() {
    const wrapper = document.getElementById('backstoryContentWrapper');
    const icon = document.getElementById('backstoryToggleIcon');
    
    if (!wrapper || !icon) return;
    
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        icon.textContent = '▼';
    } else {
        wrapper.style.display = 'none';
        icon.textContent = '▶';
    }
}

// Функция для редактирования всех карточек предыстории
function editAllBackstoryCards() {
    const content = document.getElementById('backstoryContent');
    if (!content) return;
    
    const cards = content.querySelectorAll('.backstory-card');
    if (cards.length === 0) {
        showToast('Нет элементов предыстории для редактирования', 'info');
        return;
    }
    
    // Собираем данные всех карточек
    const backstoryElements = [];
    cards.forEach((card, index) => {
        const title = card.querySelector('.backstory-card-title')?.textContent?.trim();
        const content = card.querySelector('.backstory-card-content')?.textContent?.replace(/<[^>]*>/g, '')?.trim();
        
        if (title && content) {
            backstoryElements.push({
                index: index,
                title: title,
                content: content
            });
        }
    });
    
    if (backstoryElements.length === 0) {
        showToast('Нет элементов предыстории для редактирования', 'info');
        return;
    }
    
    // Создаем модальное окно с формой для всех элементов
    let modalContent = `
        <div style="padding: 1rem; max-height: 70vh; overflow-y: auto;">
            <div style="margin-bottom: 1rem; color: var(--muted); font-size: 0.8rem;">
                Редактируйте элементы предыстории. Оставьте поле пустым, чтобы удалить элемент.
            </div>
    `;
    
    backstoryElements.forEach((element, index) => {
        modalContent += `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px;">
                <div style="color: var(--accent); font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Элемент ${index + 1}</div>
                <div style="margin-bottom: 0.5rem;">
                    <label style="display: block; color: ${getThemeColors().text}; font-weight: 500; margin-bottom: 0.3rem; font-size: 0.8rem;">Название:</label>
                    <input type="text" id="editTitle${index}" value="${element.title}" style="width: 100%; padding: 0.4rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text}; font-size: 0.8rem;">
                </div>
                <div>
                    <label style="display: block; color: ${getThemeColors().text}; font-weight: 500; margin-bottom: 0.3rem; font-size: 0.8rem;">Содержание:</label>
                    <textarea id="editContent${index}" style="width: 100%; height: 60px; padding: 0.4rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text}; font-size: 0.8rem; resize: vertical;">${element.content}</textarea>
                </div>
            </div>
        `;
    });
    
    modalContent += `
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                <button class="pill-button" onclick="closeModal()" style="background: var(--danger);">Отмена</button>
                <button class="pill-button success-button" onclick="saveAllBackstoryCards()">Сохранить все</button>
            </div>
        </div>
    `;
    
    showModal('Редактировать предысторию', modalContent);
}

// Функция для сохранения всех изменений в карточках
function saveAllBackstoryCards() {
    const content = document.getElementById('backstoryContent');
    if (!content) return;
    
    // Собираем новые данные из формы
    const updatedElements = [];
    let index = 0;
    
    // Ищем все поля ввода в модальном окне
    while (true) {
        const titleInput = document.getElementById(`editTitle${index}`);
        const contentInput = document.getElementById(`editContent${index}`);
        
        if (!titleInput || !contentInput) break;
        
        const newTitle = titleInput.value.trim();
        const newContent = contentInput.value.trim();
        
        // Добавляем только непустые элементы
        if (newTitle && newContent) {
            updatedElements.push({
                title: newTitle,
                content: newContent
            });
        }
        
        index++;
    }
    
    // Обновляем отображение карточек
    const cardsHTML = updatedElements.map(element => 
        createBackstoryCard(element.title, element.content)
    ).join('');
    
    content.innerHTML = cardsHTML;
    
    // Обновляем общий текст предыстории
    updateBackstoryTextFromCards();
    
    closeModal();
    showToast(`Сохранено ${updatedElements.length} элементов предыстории`, 'success');
}

// Функция для создания карточки элемента предыстории
function createBackstoryCard(title, content, isEditable = true) {
    const cardId = `backstory-card-${title.toLowerCase().replace(/[^a-zа-я0-9]/g, '-')}`;
    const highlightedContent = highlightBonusesInText(content);
    
    return `
        <div class="backstory-card" id="${cardId}" style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px; padding: 0.6rem; position: relative;">
            <div class="backstory-card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
                <div class="backstory-card-title" style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.8rem; line-height: 1.1;">${title}</div>
            </div>
            <div class="backstory-card-content" style="color: ${getThemeColors().text}; line-height: 1.3; font-size: 0.75rem;">
                ${highlightedContent}
            </div>
        </div>
    `;
}

// Функция для обновления отображения предыстории в виде карточек
function updateBackstoryDisplay() {
    const content = document.getElementById('backstoryContent');
    const textarea = document.getElementById('backstoryText');
    
    if (!content || !textarea) return;
    
    const backstoryText = textarea.value.trim();
    
    if (!backstoryText) {
        content.innerHTML = `
            <div id="emptyBackstory" style="color: ${getThemeColors().muted}; text-align: center; padding: 1.5rem; font-style: italic; grid-column: 1 / -1; font-size: 0.8rem;">
                Ну и как ты сюда попал?<br>
                <span style="font-size: 0.7rem; margin-top: 0.3rem; display: block;">Выберите предысторию или напишите свою</span>
            </div>
        `;
        return;
    }
    
    // Парсим текст предыстории на элементы
    const backstoryElements = parseBackstoryText(backstoryText);
    
    if (backstoryElements.length === 0) {
        content.innerHTML = `
            <div id="emptyBackstory" style="color: var(--muted); text-align: center; padding: 1.5rem; font-style: italic; grid-column: 1 / -1; font-size: 0.8rem;">
                Ну и как ты сюда попал?<br>
                <span style="font-size: 0.7rem; margin-top: 0.3rem; display: block;">Выберите предысторию или напишите свою</span>
            </div>
        `;
        return;
    }
    
    // Создаем карточки
    const cardsHTML = backstoryElements.map(element => 
        createBackstoryCard(element.title, element.content)
    ).join('');
    
    content.innerHTML = cardsHTML;
}

// Функция для парсинга текста предыстории на элементы
function parseBackstoryText(text) {
    // Разделяем текст по точкам, но учитываем что точки могут быть в скобках
    const elements = [];
    
    // Ищем паттерн "Название: содержание. "
    const regex = /([^:]+):\s*([^.]*(?:\([^)]*\)[^.]*)*)\.\s*/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        const title = match[1].trim();
        const content = match[2].trim();
        
        if (title && content) {
            elements.push({
                title: title,
                content: content
            });
        }
    }
    
    return elements;
}

// Функция для редактирования карточки предыстории
function editBackstoryCard(cardId) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const titleElement = card.querySelector('.backstory-card-title');
    const contentElement = card.querySelector('.backstory-card-content');
    
    if (!titleElement || !contentElement) return;
    
    const currentTitle = titleElement.textContent;
    const currentContent = contentElement.textContent.replace(/<[^>]*>/g, ''); // Убираем HTML теги
    
    // Создаем модальное окно для редактирования
    const modalContent = `
        <div style="padding: 1rem;">
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem;">Название:</label>
                <input type="text" id="editTitle" value="${currentTitle}" style="width: 100%; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text};">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; color: var(--accent); font-weight: 600; margin-bottom: 0.5rem;">Содержание:</label>
                <textarea id="editContent" style="width: 100%; height: 100px; padding: 0.5rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; color: ${getThemeColors().text}; resize: vertical;">${currentContent}</textarea>
            </div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                <button class="pill-button" onclick="closeModal()" style="background: var(--danger);">Отмена</button>
                <button class="pill-button success-button" onclick="saveBackstoryCard('${cardId}')">Сохранить</button>
            </div>
        </div>
    `;
    
    showModal('Редактировать элемент предыстории', modalContent);
}

// Функция для сохранения изменений в карточке
function saveBackstoryCard(cardId) {
    const titleInput = document.getElementById('editTitle');
    const contentInput = document.getElementById('editContent');
    
    if (!titleInput || !contentInput) return;
    
    const newTitle = titleInput.value.trim();
    const newContent = contentInput.value.trim();
    
    if (!newTitle || !newContent) {
        showToast('Название и содержание не могут быть пустыми', 'error');
        return;
    }
    
    // Обновляем карточку
    const card = document.getElementById(cardId);
    if (card) {
        const titleElement = card.querySelector('.backstory-card-title');
        const contentElement = card.querySelector('.backstory-card-content');
        
        if (titleElement && contentElement) {
            titleElement.textContent = newTitle;
            contentElement.innerHTML = highlightBonusesInText(newContent);
        }
    }
    
    // Обновляем общий текст предыстории
    updateBackstoryTextFromCards();
    
    closeModal();
    showToast('Изменения сохранены', 'success');
}

// Функция для обновления общего текста предыстории из карточек
function updateBackstoryTextFromCards() {
    const content = document.getElementById('backstoryContent');
    const textarea = document.getElementById('backstoryText');
    
    if (!content || !textarea) return;
    
    const cards = content.querySelectorAll('.backstory-card');
    const backstoryElements = [];
    
    cards.forEach(card => {
        const title = card.querySelector('.backstory-card-title')?.textContent?.trim();
        const content = card.querySelector('.backstory-card-content')?.textContent?.replace(/<[^>]*>/g, '')?.trim();
        
        if (title && content) {
            backstoryElements.push(`${title}: ${content}.`);
        }
    });
    
    const newText = backstoryElements.join(' ');
    textarea.value = newText;
    
    // Сохраняем в state
    if (typeof state !== 'undefined') {
        state.backstory = newText;
        if (typeof scheduleSave === 'function') {
            scheduleSave();
        }
    }
}

// Функция для выделения бонусов в тексте предыстории (отдельная от той, что в ручном выборе)
function highlightBonusesInText(text) {
    // Регулярное выражение для поиска бонусов в скобках
    return text.replace(/\(([^)]+)\)/g, (match, bonus) => {
        // Определяем цвет в зависимости от типа бонуса
        let color = 'var(--accent)'; // По умолчанию фиолетовый
        
        if (bonus.includes('+') && !bonus.includes('-')) {
            // Положительные бонусы - зеленый
            color = 'var(--success)';
        } else if (bonus.includes('-')) {
            // Отрицательные бонусы - красный
            color = 'var(--danger)';
        } else if (bonus.toLowerCase().includes('уе') || bonus.toLowerCase().includes('долг')) {
            // Деньги/долги - желтый
            color = 'var(--warning)';
        } else if (bonus.toLowerCase().includes('предмет') || bonus.toLowerCase().includes('вещь') || bonus.toLowerCase().includes('чип') || bonus.toLowerCase().includes('пистолет') || bonus.toLowerCase().includes('кейс')) {
            // Предметы - синий
            color = '#3b82f6';
        } else if (bonus.toLowerCase().includes('зависимость')) {
            // Зависимости - оранжевый
            color = '#f97316';
        }
        
        return `<span style="color: ${color}; font-weight: 600; background: rgba(0,0,0,0.2); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.9em; display: inline-block; margin: 0 0.1rem;">(${bonus})</span>`;
    });
}

// Функция обновления информации о сложности попадания
function updateHitDifficultyInfo(distance) {
    const container = document.getElementById('hitDifficultyInfo');
    if (!container) return;
    
    // Определяем категорию расстояния
    let distanceCategory;
    if (distance === 0) {
        distanceCategory = 'point_blank';
    } else if (distance <= 6) {
        distanceCategory = 'close';
    } else if (distance <= 25) {
        distanceCategory = 'medium';
    } else if (distance <= 50) {
        distanceCategory = 'far';
    } else if (distance <= 250) {
        distanceCategory = 'very_far';
    } else {
        distanceCategory = 'extreme';
    }
    
    // Таблица сложности для одиночного выстрела
    const singleShotDifficulty = {
        'Пистолеты': { point_blank: 10, close: 13, medium: 17, far: 20, very_far: 30, extreme: null },
        'ПП': { point_blank: 10, close: 13, medium: 15, far: 17, very_far: 30, extreme: null },
        'Штурмовые винтовки и Пулемёты': { point_blank: 15, close: 20, medium: 17, far: 15, very_far: 20, extreme: 30 },
        'Снайперские винтовки': { point_blank: 15, close: 30, medium: 20, far: 17, very_far: 15, extreme: 17 },
        'Дробовики (жакан)': { point_blank: 10, close: 15, medium: 17, far: 20, very_far: 25, extreme: 30 },
        'Гранатомёты': { point_blank: 10, close: 15, medium: 17, far: 20, very_far: 25, extreme: null },
        'Ракетометы': { point_blank: 1, close: 20, medium: 15, far: 17, very_far: 20, extreme: 30 },
        'Архаичное ОДБ': { point_blank: 10, close: 13, medium: 15, far: 17, very_far: 30, extreme: null }
    };
    
    // Таблица сложности для автоматического огня
    const autoFireDifficulty = {
        'ПП': { point_blank: 15, close: 17, medium: 20, far: 25, very_far: 30, extreme: 'Только при Экстремальном Успехе. Множитель урона равен 3' },
        'Штурмовая Винтовка': { point_blank: 15, close: 20, medium: 17, far: 20, very_far: 25, extreme: 30 },
        'Пулемёт': { point_blank: 25, close: 20, medium: 17, far: 17, very_far: 20, extreme: 30 }
    };
    
    // Создаем HTML для отображения
    let html = `
        <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; margin-top: 0.75rem;">
            <div style="color: var(--accent); font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; text-align: center;">
                СЛОЖНОСТЬ ПОПАДАНИЯ
            </div>
            <div style="font-size: 0.7rem; color: var(--muted); margin-bottom: 0.5rem; text-align: center;">
                Расстояние: ${distance}п (${getDistanceCategoryName(distanceCategory)})
            </div>
            
            <div style="margin-bottom: 0.75rem;">
                <div style="color: var(--success); font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem; text-align: center;">
                    ОДИНОЧНЫЙ ВЫСТРЕЛ
                </div>
    `;
    
    // Добавляем информацию для одиночного выстрела
    Object.entries(singleShotDifficulty).forEach(([weaponType, difficulties]) => {
        const difficulty = difficulties[distanceCategory];
        if (difficulty !== null && difficulty !== undefined) {
            html += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.15rem 0; font-size: 0.65rem;">
                    <span style="color: ${getThemeColors().text};">${weaponType}</span>
                    <span style="color: var(--accent); font-weight: 600;">${difficulty}</span>
                </div>
            `;
        }
    });
    
    html += `
            </div>
            
            <div>
                <div style="color: var(--warning); font-size: 0.75rem; font-weight: 600; margin-bottom: 0.35rem; text-align: center;">
                    АВТОМАТИЧЕСКИЙ ОГОНЬ
                </div>
    `;
    
    // Добавляем информацию для автоматического огня
    Object.entries(autoFireDifficulty).forEach(([weaponType, difficulties]) => {
        const difficulty = difficulties[distanceCategory];
        if (difficulty !== null && difficulty !== undefined) {
            if (typeof difficulty === 'string') {
                html += `
                    <div style="padding: 0.15rem 0; font-size: 0.65rem;">
                        <div style="color: ${getThemeColors().text}; font-weight: 600; margin-bottom: 0.05rem;">${weaponType}</div>
                        <div style="color: var(--warning); font-size: 0.6rem; line-height: 1.1;">${difficulty}</div>
                    </div>
                `;
            } else {
                html += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.15rem 0; font-size: 0.65rem;">
                        <span style="color: ${getThemeColors().text};">${weaponType}</span>
                        <span style="color: var(--warning); font-weight: 600;">${difficulty}</span>
                    </div>
                `;
            }
        }
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

// Функция получения названия категории расстояния
function getDistanceCategoryName(category) {
    const names = {
        'point_blank': 'Вплотную',
        'close': 'Близкая',
        'medium': 'Средняя',
        'far': 'Дальняя',
        'very_far': 'Очень дальняя',
        'extreme': 'Сверх далёкая'
    };
    return names[category] || 'Неизвестно';
}

// ═══════════════════════════════════════════════════════════════════════
// ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
// ═══════════════════════════════════════════════════════════════════════

// Функция переключения темы
function toggleTheme() {
    const body = document.body;
    const button = document.getElementById('themeToggle');
    
    // Переключаем класс
    body.classList.toggle('light-theme');
    
    // Определяем текущую тему
    const isLight = body.classList.contains('light-theme');
    
    // Обновляем текст и иконку кнопки
    if (isLight) {
        button.innerHTML = '☀️ Вернуться в ночь';
    } else {
        button.innerHTML = '🌙 СВЕТОВАЯ ПОШЛА';
    }
    
    // Сохраняем выбор в localStorage
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    
    // Обновляем все динамически создаваемые элементы
    if (typeof renderGear === 'function') renderGear();
    if (typeof renderWeapons === 'function') renderWeapons();
    if (typeof renderAmmo === 'function') renderAmmo();
    if (typeof renderDeckPrograms === 'function') renderDeckPrograms();
    if (typeof renderDeckChips === 'function') renderDeckChips();
    if (typeof updateDeckDisplay === 'function') updateDeckDisplay();
    if (typeof renderTransport === 'function') renderTransport();
    if (typeof renderProfessionalSkills === 'function') renderProfessionalSkills();
    if (typeof updateBackstoryDisplay === 'function') updateBackstoryDisplay();
    
    // Показываем уведомление
    showNotification(isLight ? '☀️ Светлая тема активирована' : '🌙 Тёмная тема активирована', 'success');
}

// Загрузка сохраненной темы при запуске
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const button = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        if (button) {
            button.innerHTML = '☀️ Вернуться в ночь';
        }
    } else {
        body.classList.remove('light-theme');
        if (button) {
            button.innerHTML = '🌙 СВЕТОВАЯ ПОШЛА';
        }
    }
}

// Загружаем тему при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
});

// ═══════════════════════════════════════════════════════════════════════
// ПАРАЛЛАКС ЭФФЕКТ ДЛЯ ФОНА С ПАТТЕРНОМ
// ═══════════════════════════════════════════════════════════════════════

function initCircuitParallax() {
    const bodyBg = document.querySelector('body::before');
    let ticking = false;
    
    function updateParallax() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        
        // Медленное движение по диагонали
        const bgX = scrollX * 0.015; // % от горизонтальной прокрутки
        const bgY = scrollY * 0.015; // % от вертикальной прокрутки
        
        // Применяем к body через CSS переменные
        document.documentElement.style.setProperty('--circuit-bg-x', `${bgX}px`);
        document.documentElement.style.setProperty('--circuit-bg-y', `${bgY}px`);
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }
    
    // Обработчик прокрутки с throttling через requestAnimationFrame
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Инициализируем сразу
    updateParallax();
}

// Запускаем параллакс после загрузки страницы
document.addEventListener('DOMContentLoaded', function() {
    initCircuitParallax();
});
