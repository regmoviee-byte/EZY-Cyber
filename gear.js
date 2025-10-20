// ============================================================================
// GEAR.JS - Система управления снаряжением
// Все функции для работы со снаряжением, включая специальные предметы
// ============================================================================



// ============================================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

// Определение типа специального предмета
function getGearSpecialType(itemName) {
    const name = itemName.toUpperCase();
    
    if (name.includes('3D-ПРИНТЕР') || name.includes('3D-PRINTE')) return '3d-printer';
    if (name.includes('АНТИРАДИАЦИОННЫЙ КОСТЮМ')) return 'antirad-suit';
    if (name.includes('ВИНГСЬЮТ')) return 'wingsuit';
    if (name.includes('ДРОН НА КОЛЁСАХ')) return 'wheeled-drone';
    if (name.includes('ЛЕТАЮЩИЙ ДРОН')) return 'flying-drone';
    if (name.includes('ГЕЙМЕРСКИЙ КОМПЛЕКТ')) return 'gamer-component';
    if (name.includes('МУЛЬТИТУЛ')) return 'multitool';
    if (name.includes('НАБОР ФЛЕШЕК') || name.includes('НАБОР ЧИПОВ')) return 'flash-chips';
    if (name.includes('ОЧКИ С ОПТИЧЕСКИМИ СЛОТАМИ')) return 'optical-glasses';
    if (name.includes('ПРОТИВОГАЗ')) return 'gas-mask';
    if (name.includes('ПРОТИВОУДАРНЫЙ КЕЙС')) return 'shockproof-case';
    if (name.includes('РЕБРИЗЕР') && name.includes('ЛАСТЫ')) return 'rebreather-fins';
    if (name.includes('РЮКЗАК')) return 'backpack';
    if (name.includes('СКЛАДНОЙ ВЕЛОСИПЕД')) return 'folding-bike';
    if (name.includes('СУМКА')) return 'bag';
    if (name.includes('БРОНЕДРОН') && name.includes('MOOVIK')) return 'armored-drone';
    if (name.includes('ПУЛЕНЕПРОБИВАЕМЫЙ ЩИТ')) return 'shield';
    
    return null;
}

// Проверка, имеет ли предмет ПЗ (Пункты Защиты)
function hasHP(item) {
    return item.isShield || item.maxHp || item.currentHp !== undefined;
}

// Проверка, имеет ли предмет ОС (Очки Структуры)
function hasOS(item) {
    return item.maxOs || item.currentOs !== undefined;
}

// ============================================================================
// ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА СНАРЯЖЕНИЯ
// ============================================================================

window.renderGear = function() {
    const container = document.getElementById('gearContainer');
    if (!container) return;
    
    if (state.gear.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.8rem;">Снаряжение не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.gear.map((item, index) => {
        const gearId = `gear_${item.id}`;
        const specialType = getGearSpecialType(item.name);
        
        // Определяем отображаемое имя
        let displayName = item.name;
        if (item.isShield && item.currentHp <= 0) {
            displayName += ' (Сломано)';
        } else if (hasHP(item) && item.currentHp <= 0) {
            displayName += ' (Сломано)';
        }
        
        // Определяем текущую нагрузку (с учетом состояний)
        let currentLoad = item.load;
        
        // Специальная логика для велосипеда
        if (specialType === 'folding-bike') {
            if (item.bikeMode === 'ride') {
                currentLoad = 0; // При катании нагрузка 0
            } else {
                currentLoad = 36; // При ношении нагрузка 36
            }
        } else if (item.attachedToBike && item.attachedToBikeId) {
            // Рюкзак прикреплен к велосипеду - нагрузка 0
            currentLoad = 0;
        } else if (item.equipped || item.worn || item.activated || item.installed) {
            if (item.zeroLoadWhenEquipped) {
                currentLoad = 0;
            }
        }
        
        return `
        <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <!-- Заголовок и кнопки -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.9rem; cursor: pointer; user-select: none; word-wrap: break-word;" onclick="toggleGearDescription('${gearId}')">
                    ${displayName}
                </div>
                <div style="display: flex; align-items: center; gap: 5px; flex-shrink: 0;">
                    ${hasHP(item) && item.currentHp < (item.maxHp || item.hp) ? `
                        <button onclick="repairGearItem(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Ремонт">
                            <img src="https://static.tildacdn.com/tild6535-3132-4233-b731-356365363437/wrench.png" alt="Ремонт" style="width: 20px; height: 20px; display: block;">
                        </button>
                    ` : ''}
                    <button onclick="removeGear(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Удалить">
                        <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" alt="Удалить" style="width: 20px; height: 20px; display: block;">
                    </button>
                    ${item.type === 'weapon' ? `
                        <button onclick="takeWeaponFromGear(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Взять в руки">
                            <img src="https://static.tildacdn.com/tild3133-3737-4835-a636-353135666661/pistol_1.png" alt="Взять в руки" style="width: 20px; height: 20px; display: block;">
                        </button>
                    ` : ''}
                    <div style="background: #001122; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; white-space: nowrap; font-weight: 500; text-align: center;">
                        <span style="color: #cccccc;">Нагрузка:</span> <span style="color: white;">${currentLoad}</span>
                    </div>
                </div>
            </div>
            
            <!-- Описание и специальные элементы -->
            <div id="${gearId}_description" style="display: ${getCollapsedDisplayStyle('gear', index)};">
                <div style="color: ${getThemeColors().text}; font-size: 0.75rem; line-height: 1.3; word-wrap: break-word; margin-bottom: 0.5rem;">
                    ${item.description}
                </div>
                
                ${renderGearSpecialFeatures(item, index, specialType)}
            </div>
        </div>
        `;
    }).join('');
}

// Рендеринг специальных функций для каждого типа предмета
function renderGearSpecialFeatures(item, index, specialType) {
    let html = '';
    
    // Система ПЗ (для всех предметов с HP)
    if (hasHP(item)) {
        const maxHp = item.maxHp || item.hp || 10;
        const currentHp = item.currentHp !== undefined ? item.currentHp : maxHp;
        html += `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <span style="color: ${getThemeColors().accent}; font-size: 0.75rem;">ПЗ:</span>
                <button onclick="decreaseGearHP(${index})" style="background: transparent; border: 1px solid var(--accent); color: ${getThemeColors().accent}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">−</button>
                <input type="text" value="${currentHp}" 
                    onchange="setGearHP(${index}, this.value)" 
                    onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                    style="width: 50px; background: ${getThemeColors().bgMedium}; border: 1px solid var(--accent); color: ${getThemeColors().text}; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; text-align: center;" />
                <span style="color: ${getThemeColors().muted}; font-size: 0.7rem;">/${maxHp}</span>
                <button onclick="increaseGearHP(${index})" style="background: transparent; border: 1px solid var(--accent); color: ${getThemeColors().accent}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">+</button>
            </div>
        `;
    }
    
    // Система ОС (для предметов с OS)
    if (hasOS(item)) {
        const maxOs = item.maxOs || 10;
        const currentOs = item.currentOs !== undefined ? item.currentOs : maxOs;
        html += `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <span style="color: ${getThemeColors().success}; font-size: 0.75rem;">ОС:</span>
                <button onclick="decreaseGearOS(${index})" style="background: transparent; border: 1px solid var(--success); color: ${getThemeColors().success}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">−</button>
                <input type="number" value="${currentOs}" min="0" max="${maxOs}" 
                    onchange="setGearOS(${index}, this.value)" 
                    style="width: 50px; background: ${getThemeColors().bgMedium}; border: 1px solid var(--success); color: ${getThemeColors().text}; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; text-align: center;" />
                <span style="color: ${getThemeColors().muted}; font-size: 0.7rem;">/${maxOs}</span>
                <button onclick="increaseGearOS(${index})" style="background: transparent; border: 1px solid var(--success); color: ${getThemeColors().success}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">+</button>
            </div>
        `;
    }
    
    // Специальные функции в зависимости от типа
    switch(specialType) {
        case '3d-printer':
            html += render3DPrinterFeatures(item, index);
            break;
        case 'antirad-suit':
            html += renderAntiradSuitFeatures(item, index);
            break;
        case 'wingsuit':
            html += renderWingsuitFeatures(item, index);
            break;
        case 'wheeled-drone':
            html += renderWheeledDroneFeatures(item, index);
            break;
        case 'flying-drone':
            html += renderFlyingDroneFeatures(item, index);
            break;
        case 'multitool':
            html += renderMultitoolFeatures(item, index);
            break;
        case 'optical-glasses':
            html += renderOpticalGlassesFeatures(item, index);
            break;
        case 'gas-mask':
            html += renderGasMaskFeatures(item, index);
            break;
        case 'shockproof-case':
            html += renderShockproofCaseFeatures(item, index);
            break;
        case 'rebreather-fins':
            html += renderRebreatherFinsFeatures(item, index);
            break;
        case 'backpack':
            html += renderBackpackFeatures(item, index);
            break;
        case 'folding-bike':
            html += renderFoldingBikeFeatures(item, index);
            break;
        case 'bag':
            html += renderBagFeatures(item, index);
            break;
        case 'armored-drone':
            html += renderArmoredDroneFeatures(item, index);
            break;
    }
    
    // Щепка навыка - специальная обработка
    if (item.isSkillChip) {
        html += renderSkillChipFeatures(item, index);
    }
    
    // Модули имплантов - добавляем кнопку установки для укреплений
    if (item.type === 'implant' && item.implantData) {
        html += renderImplantFeatures(item, index);
    }
    
    return html;
}

// ============================================================================
// ФУНКЦИИ ДЛЯ 3D ПРИНТЕРА
// ============================================================================

function render3DPrinterFeatures(item, index) {
    const isInstalled = item.installed || false;
    const location = item.installedLocation || '';
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                <input type="checkbox" ${isInstalled ? 'checked' : ''} 
                    onchange="toggle3DPrinterInstalled(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Установить</span>
            </label>
            ${isInstalled ? `
                <input type="text" placeholder="Где установлен?" value="${location}"
                    onchange="set3DPrinterLocation(${index}, this.value)"
                    style="width: 100%; background: ${getThemeColors().bgMedium}; border: 1px solid var(--accent); color: ${getThemeColors().text}; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-top: 0.25rem;">
            ` : ''}
        </div>
    `;
}

function toggle3DPrinterInstalled(index, isInstalled) {
    const item = state.gear[index];
    if (!item) return;
    
    item.installed = isInstalled;
    item.zeroLoadWhenEquipped = true;
    
    if (!isInstalled) {
        item.installedLocation = '';
    }
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

function set3DPrinterLocation(index, location) {
    const item = state.gear[index];
    if (!item) return;
    
    item.installedLocation = location;
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ЩЕПКИ НАВЫКА
// ============================================================================

function renderSkillChipFeatures(item, index) {
    const isInserted = item.inserted || false;
    
    return `
        <div style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(182, 103, 255, 0.1); border: 1px solid #b667ff; border-radius: 6px;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isInserted ? 'checked' : ''} 
                    onchange="toggleSkillChipInserted(${index}, this.checked)" 
                    style="width: 16px; height: 16px; accent-color: #b667ff; cursor: pointer;">
                <span style="color: #b667ff; font-weight: 600; font-size: 0.85rem;">Вставлена${item.awarenessLoss ? ` (теряет ${item.awarenessLoss} ПО при каждой активации)` : ''}</span>
            </label>
            ${isInserted ? `
                <div style="margin-top: 0.5rem; padding: 0.5rem; background: rgba(255, 91, 135, 0.1); border: 1px solid #ff5b87; border-radius: 4px;">
                    <p style="color: #ff5b87; font-size: 0.75rem; margin: 0; line-height: 1.3;">
                        ⚠️ При каждой активации щепки вы теряете ${item.awarenessLoss} Осознанности!
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

function toggleSkillChipInserted(index, isInserted) {
    const item = state.gear[index];
    if (!item) return;
    
    const wasInserted = item.inserted || false;
    
    // Если вставляем щепку (переход с false на true), теряем осознанность
    if (!wasInserted && isInserted && item.awarenessLoss) {
        const lossRoll = rollDiceForAwarenessLoss(item.awarenessLoss);
        const currentAwareness = parseInt(state.awareness.current) || 50;
        state.awareness.current = Math.max(0, currentAwareness - lossRoll);
        const awarenessEl = document.getElementById('awarenessCurrent');
        if (awarenessEl) awarenessEl.value = state.awareness.current;
        
        // Показываем уведомление о потере осознанности
        showModal('Щепка вставлена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">✅ Щепка вставлена!</p>
                <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">Потеря осознанности: -${lossRoll}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.85rem;">Помните: при каждой активации щепки вы будете терять ${item.awarenessLoss} Осознанности!</p>
                <button class="pill-button" onclick="closeModal(this)" style="margin-top: 1rem;">
                    Закрыть
                </button>
            </div>
        `);
    }
    
    item.inserted = isInserted;
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ АНТИРАДИАЦИОННОГО КОСТЮМА
// ============================================================================

function renderAntiradSuitFeatures(item, index) {
    const isWorn = item.worn || false;
    
    // Инициализ ируем ОС, если его нет
    if (item.maxOs === undefined) {
        item.maxOs = 10;
        item.currentOs = 10;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isWorn ? 'checked' : ''} 
                    onchange="toggleAntiradSuitWorn(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
            </label>
        </div>
    `;
}

function toggleAntiradSuitWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ВИНГСЬЮТА
// ============================================================================

function renderWingsuitFeatures(item, index) {
    const isWorn = item.worn || false;
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isWorn ? 'checked' : ''} 
                    onchange="toggleWingsuitWorn(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
            </label>
        </div>
    `;
}

function toggleWingsuitWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ДРОНА НА КОЛЁСАХ
// ============================================================================

function renderWheeledDroneFeatures(item, index) {
    const isActivated = item.activated || false;
    
    // Инициализируем ПЗ, если его нет
    if (item.maxHp === undefined) {
        item.maxHp = 20;
        item.currentHp = 20;
    }
    
    // Инициализируем слот для оружия
    if (!item.weaponSlot) {
        item.weaponSlot = null;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                <input type="checkbox" ${isActivated ? 'checked' : ''} 
                    onchange="toggleWheeledDroneActivated(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Активирован</span>
            </label>
            <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-bottom: 0.5rem;">Скорость перемещения: 8</div>
            
            <!-- Оружие на дроне -->
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem;">Оружие на дроне:</div>
                ${item.weaponSlot ? `
                    ${renderDroneWeapon(item.weaponSlot, index)}
                    <button class="pill-button" onclick="removeDroneWeapon(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">
                        <img src="https://static.tildacdn.com/tild3133-3737-4835-a636-353135666661/pistol_1.png" style="width: 16px; height: 16px; vertical-align: middle;"> Снять оружие
                    </button>
                ` : `
                    <button class="pill-button success-button" onclick="installWeaponOnDrone(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Установить оружие
                    </button>
                `}
            </div>
        </div>
    `;
}

function toggleWheeledDroneActivated(index, isActivated) {
    const item = state.gear[index];
    if (!item) return;
    
    item.activated = isActivated;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ЛЕТАЮЩЕГО ДРОНА
// ============================================================================

function renderFlyingDroneFeatures(item, index) {
    const isActivated = item.activated || false;
    
    // Инициализируем ПЗ, если его нет
    if (item.maxHp === undefined) {
        item.maxHp = 10;
        item.currentHp = 10;
    }
    
    // Инициализируем слот для оружия
    if (!item.weaponSlot) {
        item.weaponSlot = null;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                <input type="checkbox" ${isActivated ? 'checked' : ''} 
                    onchange="toggleFlyingDroneActivated(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Активирован</span>
            </label>
            <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-bottom: 0.5rem;">Скорость перемещения: 20</div>
            
            <!-- Оружие на дроне -->
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem;">Оружие на дроне:</div>
                ${item.weaponSlot ? `
                    ${renderDroneWeapon(item.weaponSlot, index)}
                    <button class="pill-button" onclick="removeDroneWeapon(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">
                        <img src="https://static.tildacdn.com/tild3133-3737-4835-a636-353135666661/pistol_1.png" style="width: 16px; height: 16px; vertical-align: middle;"> Снять оружие
                    </button>
                ` : `
                    <button class="pill-button success-button" onclick="installWeaponOnDrone(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Установить оружие
                    </button>
                `}
            </div>
        </div>
    `;
}

function toggleFlyingDroneActivated(index, isActivated) {
    const item = state.gear[index];
    if (!item) return;
    
    item.activated = isActivated;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ БРОНЕДРОНА MOOVIK
// ============================================================================

function renderArmoredDroneFeatures(item, index) {
    const isActivated = item.activated || false;
    
    // Инициализируем ПЗ и ОС, если их нет
    if (item.maxHp === undefined) {
        item.maxHp = 10;
        item.currentHp = 10;
    }
    if (item.maxOs === undefined) {
        item.maxOs = 10;
        item.currentOs = 10;
    }
    
    // Инициализируем слот для оружия
    if (!item.weaponSlot) {
        item.weaponSlot = null;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                <input type="checkbox" ${isActivated ? 'checked' : ''} 
                    onchange="toggleArmoredDroneActivated(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Активирован</span>
            </label>
            <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-bottom: 0.5rem;">Скорость перемещения: 15</div>
            
            <!-- Окошки с ПЗ и ОС -->
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <span style="color: ${getThemeColors().accent}; font-size: 0.75rem;">ПЗ:</span>
                <button onclick="decreaseGearHP(${index})" style="background: transparent; border: 1px solid var(--accent); color: ${getThemeColors().accent}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">−</button>
                <input type="text" value="${item.currentHp}" 
                    onchange="setGearHP(${index}, this.value)" 
                    onkeypress="return event.charCode >= 48 && event.charCode <= 57"
                    style="width: 50px; background: ${getThemeColors().bgMedium}; border: 1px solid var(--accent); color: ${getThemeColors().text}; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; text-align: center;" />
                <span style="color: ${getThemeColors().muted}; font-size: 0.7rem;">/${item.maxHp}</span>
                <button onclick="increaseGearHP(${index})" style="background: transparent; border: 1px solid var(--accent); color: ${getThemeColors().accent}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">+</button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                <span style="color: ${getThemeColors().success}; font-size: 0.75rem;">ОС:</span>
                <button onclick="decreaseGearOS(${index})" style="background: transparent; border: 1px solid var(--success); color: ${getThemeColors().success}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">−</button>
                <input type="number" value="${item.currentOs}" min="0" max="${item.maxOs}" 
                    onchange="setGearOS(${index}, this.value)" 
                    style="width: 50px; background: ${getThemeColors().bgMedium}; border: 1px solid var(--success); color: ${getThemeColors().text}; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.75rem; text-align: center;" />
                <span style="color: ${getThemeColors().muted}; font-size: 0.7rem;">/${item.maxOs}</span>
                <button onclick="increaseGearOS(${index})" style="background: transparent; border: 1px solid var(--success); color: ${getThemeColors().success}; cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">+</button>
            </div>
            
            <!-- Оружие на дроне -->
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem;">Оружие на дроне:</div>
                ${item.weaponSlot ? `
                    ${renderDroneWeapon(item.weaponSlot, index)}
                    <button class="pill-button" onclick="removeDroneWeapon(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">
                        <img src="https://static.tildacdn.com/tild3133-3737-4835-a636-353135666661/pistol_1.png" style="width: 16px; height: 16px; vertical-align: middle;"> Снять оружие
                    </button>
                ` : `
                    <button class="pill-button success-button" onclick="installWeaponOnDrone(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Установить оружие
                    </button>
                `}
            </div>
        </div>
    `;
}

function toggleArmoredDroneActivated(index, isActivated) {
    const item = state.gear[index];
    if (!item) return;
    
    item.activated = isActivated;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ МУЛЬТИТУЛА
// ============================================================================

function renderMultitoolFeatures(item, index) {
    const isActivated = item.activated || false;
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isActivated ? 'checked' : ''} 
                    onchange="toggleMultitoolActivated(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Активирован</span>
            </label>
            ${isActivated ? `
                <div style="color: ${getThemeColors().success}; font-size: 0.7rem; margin-top: 0.25rem;">
                    Бонус +2 к проверкам с ТЕХ
                </div>
            ` : ''}
        </div>
    `;
}

function toggleMultitoolActivated(index, isActivated) {
    const item = state.gear[index];
    if (!item) return;
    
    item.activated = isActivated;
    recalculateLoadFromInventory();
    updateLoadDisplay();
    scheduleSave();
    renderGear();
    
    // Обновляем отображение характеристики ТЕХ
    updateTECHDisplay();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ОЧКОВ С ОПТИЧЕСКИМИ СЛОТАМИ
// ============================================================================

function renderOpticalGlassesFeatures(item, index) {
    const isWorn = item.worn || false;
    
    // Инициализируем слот для модуля, если его нет
    if (!item.opticalModule) {
        item.opticalModule = null;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                <input type="checkbox" ${isWorn ? 'checked' : ''} 
                    onchange="toggleOpticalGlassesWorn(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
            </label>
            
            <!-- Слот для модуля зрения -->
            <div style="margin-top: 0.5rem; padding: 0.5rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px;">
                <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem; margin-bottom: 0.5rem;">Оптический модуль:</div>
                ${item.opticalModule ? `
                    <div style="margin-bottom: 0.5rem;">
                        <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 0.75rem;">${item.opticalModule.name}</div>
                        <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-top: 0.25rem;">${item.opticalModule.description}</div>
                    </div>
                    <button class="pill-button" onclick="removeOpticalModule(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Снять модуль
                    </button>
                ` : `
                    <button class="pill-button success-button" onclick="installOpticalModule(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Установить модуль
                    </button>
                `}
            </div>
        </div>
    `;
}

function toggleOpticalGlassesWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ПРОТИВОГАЗА
// ============================================================================

function renderGasMaskFeatures(item, index) {
    const isWorn = item.worn || false;
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isWorn ? 'checked' : ''} 
                    onchange="toggleGasMaskWorn(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
            </label>
        </div>
    `;
}

function toggleGasMaskWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ РЕБРИЗЕРА И ЛАСТ
// ============================================================================

function renderRebreatherFinsFeatures(item, index) {
    const isWorn = item.worn || false;
    
    return `
        <div style="margin-top: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="checkbox" ${isWorn ? 'checked' : ''} 
                    onchange="toggleRebreatherFinsWorn(${index}, this.checked)" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
            </label>
        </div>
    `;
}

function toggleRebreatherFinsWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ПРОТИВОУДАРНОГО КЕЙСА
// ============================================================================

function renderShockproofCaseFeatures(item, index) {
    // Инициализируем хранилище, если его нет
    if (!item.storage) {
        item.storage = [];
    }
    if (item.maxHp === undefined) {
        item.maxHp = 10;
        item.currentHp = 10;
    }
    if (item.maxOs === undefined) {
        item.maxOs = 10;
        item.currentOs = 10;
    }
    
    const usedLoad = item.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 9;
    
    return `
        <div style="margin-top: 0.5rem;">
            <button class="pill-button" onclick="openCaseStorage(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                <img src="https://static.tildacdn.com/tild6565-3931-4133-a232-393964383262/case.png" style="width: 16px; height: 16px; vertical-align: middle;"> Положить в кейс (${usedLoad}/${maxLoad})
            </button>
        </div>
    `;
}

// ============================================================================
// ФУНКЦИИ ДЛЯ РЮКЗАКА
// ============================================================================

function renderBackpackFeatures(item, index) {
    const isWorn = item.worn || false;
    const position = item.backpackPosition || 'back'; // 'back' или 'front'
    
    // Инициализируем хранилище, если его нет
    if (!item.storage) {
        item.storage = [];
    }
    
    const usedLoad = item.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    return `
        <div style="margin-top: 0.5rem;">
            ${item.attachedToBike ? `
                <div style="padding: 0.5rem; background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 6px; margin-bottom: 0.5rem;">
                    <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 0.75rem;">Прикреплен к велосипеду</div>
                    <button class="pill-button" onclick="detachBackpackFromBike(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-top: 0.25rem;">
                        Снять с велосипеда
                    </button>
                </div>
            ` : `
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                    <input type="checkbox" ${isWorn ? 'checked' : ''} 
                        onchange="toggleBackpackWorn(${index}, this.checked)" 
                        style="cursor: pointer;">
                    <span style="color: ${getThemeColors().text}; font-size: 0.75rem;">Надето</span>
                </label>
                
                ${isWorn ? `
                    <div style="margin-bottom: 0.5rem;">
                        <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-bottom: 0.25rem;">Положение:</div>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.25rem;">
                            <input type="radio" name="backpack_position_${index}" value="back" ${position === 'back' ? 'checked' : ''} 
                                onchange="setBackpackPosition(${index}, 'back')" 
                                style="cursor: pointer;">
                            <span style="color: ${getThemeColors().text}; font-size: 0.7rem;">На спине (штраф -2 к ЛВК)</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                            <input type="radio" name="backpack_position_${index}" value="front" ${position === 'front' ? 'checked' : ''} 
                                onchange="setBackpackPosition(${index}, 'front')" 
                                style="cursor: pointer;">
                            <span style="color: ${getThemeColors().text}; font-size: 0.7rem;">Спереди (штраф -4 к ЛВК)</span>
                        </label>
                    </div>
                    
                    <button class="pill-button" onclick="openBackpackStorage(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; margin-top: 0.5rem;">
                        Открыть рюкзак (${usedLoad}/${maxLoad})
                    </button>
                ` : ''}
            `}
        </div>
    `;
}

function toggleBackpackWorn(index, isWorn) {
    const item = state.gear[index];
    if (!item) return;
    
    item.worn = isWorn;
    item.zeroLoadWhenEquipped = true;
    
    if (!isWorn) {
        item.backpackPosition = 'back';
    }
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    scheduleSave();
    
    // Обновляем отображение ЛВК
    updateDEXDisplay();
}

function setBackpackPosition(index, position) {
    const item = state.gear[index];
    if (!item) return;
    
    item.backpackPosition = position;
    recalculateLoadFromInventory();
    updateLoadDisplay();
    scheduleSave();
    renderGear();
    
    // Обновляем отображение ЛВК
    updateDEXDisplay();
}

// ============================================================================
// ФУНКЦИИ ДЛЯ СКЛАДНОГО ВЕЛОСИПЕДА
// ============================================================================

function renderFoldingBikeFeatures(item, index) {
    const mode = item.bikeMode || 'carry'; // 'carry' или 'ride'
    
    // Проверяем, есть ли у пользователя рюкзак
    const hasBackpack = state.gear.some(gear => 
        getGearSpecialType(gear.name) === 'backpack' && !gear.attachedToBike
    );
    
    return `
        <div style="margin-top: 0.5rem;">
            <div style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin-bottom: 0.25rem;">Режим:</div>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.25rem;">
                <input type="radio" name="bike_mode_${index}" value="carry" ${mode === 'carry' ? 'checked' : ''} 
                    onchange="setBikeMode(${index}, 'carry')" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.7rem;">Нести (нагрузка 36)</span>
            </label>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                <input type="radio" name="bike_mode_${index}" value="ride" ${mode === 'ride' ? 'checked' : ''} 
                    onchange="setBikeMode(${index}, 'ride')" 
                    style="cursor: pointer;">
                <span style="color: ${getThemeColors().text}; font-size: 0.7rem;">Катить (в транспорте)</span>
            </label>
            ${hasBackpack && mode === 'ride' ? `
                <div style="margin-top: 0.5rem;">
                    <button class="pill-button" onclick="attachBackpackToBike(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                        Повесить рюкзак на велик
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function setBikeMode(index, mode) {
    const item = state.gear[index];
    if (!item) return;
    
    // Проверяем, есть ли прикрепленный рюкзак
    const attachedBackpack = state.gear.find(gear => 
        gear.attachedToBike && gear.attachedToBikeId === item.id
    );
    
    if (attachedBackpack && mode === 'carry') {
        showModal('Ошибка', 'Нельзя нести велосипед с прикрепленным рюкзаком! Сначала снимите рюкзак.');
        return;
    }
    
    item.bikeMode = mode;
    
    if (mode === 'ride') {
        // Добавляем велосипед в транспорт
        addBikeToVehicles(item);
    } else {
        // Убираем велосипед из транспорта
        removeBikeFromVehicles(item.id);
    }
    
    recalculateLoadFromInventory();
    updateLoadDisplay();
    scheduleSave();
    renderGear();
    renderTransport();
}

function addBikeToVehicles(bikeItem) {
    // Проверяем, нет ли уже этого велосипеда в транспорте
    const existing = state.property.vehicles.find(v => v.linkedGearId === bikeItem.id);
    if (existing) return;
    
    // Рассчитываем скорость: (Атлетика + ТЕЛО) * 2
    const atletikaSkill = state.skills.find(s => s.name === 'Атлетика');
    const atletikaLevel = atletikaSkill ? (atletikaSkill.level || 0) : 0;
    const bodyValue = parseInt(state.stats.BODY) || 5;
    const speed = (atletikaLevel + bodyValue) * 2;
    
    // Проверяем, есть ли прикрепленный рюкзак
    const attachedBackpack = state.gear.find(gear => 
        gear.attachedToBike && gear.attachedToBikeId === bikeItem.id
    );
    
    // Создаем транспорт
    const bikeVehicle = {
        id: generateId('vehicle'),
        linkedGearId: bikeItem.id,
        name: 'Складной велосипед',
        type: 'Велосипед',
        speed: speed,
        passengers: 1,
        trunk: attachedBackpack ? {
            capacity: 32,
            items: attachedBackpack.storage || [],
            linkedBackpackId: attachedBackpack.id
        } : [],
        modules: [],
        description: `Скорость передвижения: ${speed}`,
        hp: 10,
        currentHp: 10,
        seats: 1,
        mechanicalSpeed: speed,
        narrativeSpeed: `${speed} км/ч`,
        category: 'ground',
        catalogPrice: bikeItem.catalogPrice || 0, // Цена по каталогу
        purchasePrice: bikeItem.purchasePrice || 0, // Цена покупки
        itemType: bikeItem.itemType || 'free_default' // Тип предмета
    };
    
    state.property.vehicles.push(bikeVehicle);
}

// Функция для обновления описания велосипеда при изменении характеристик
function updateBikeDescription() {
    const bikeVehicles = state.property.vehicles.filter(v => v.linkedGearId);
    
    bikeVehicles.forEach(bikeVehicle => {
        const bikeGear = state.gear.find(g => g.id === bikeVehicle.linkedGearId);
        if (bikeGear) {
            // Пересчитываем скорость: (Атлетика + ТЕЛО) * 2
            const atletikaSkill = state.skills.find(s => s.name === 'Атлетика');
            const atletikaLevel = atletikaSkill ? (atletikaSkill.level || 0) : 0;
            const bodyValue = parseInt(state.stats.BODY) || 5;
            const speed = (atletikaLevel + bodyValue) * 2;
            
            // Обновляем описание и скорость
            bikeVehicle.description = `Скорость передвижения: ${speed}`;
            bikeVehicle.speed = speed;
        }
    });
    
    // Перерисовываем транспорт
    if (typeof renderTransport === 'function') {
        renderTransport();
    }
}

function attachBackpackToBike(bikeIndex) {
    const bikeItem = state.gear[bikeIndex];
    if (!bikeItem) return;
    
    // Находим рюкзак, который можно прикрепить
    const backpack = state.gear.find(gear => 
        getGearSpecialType(gear.name) === 'backpack' && !gear.attachedToBike
    );
    
    if (!backpack) {
        showModal('Ошибка', 'У вас нет рюкзака для прикрепления к велосипеду!');
        return;
    }
    
    // Прикрепляем рюкзак к велосипеду
    backpack.attachedToBike = true;
    backpack.attachedToBikeId = bikeItem.id;
    
    // Обновляем транспортное средство - добавляем багажник
    const bikeVehicle = state.property.vehicles.find(v => v.linkedGearId === bikeItem.id);
    if (bikeVehicle) {
        bikeVehicle.trunk = {
            capacity: 32,
            items: backpack.storage || [], // Прямая ссылка на storage рюкзака
            linkedBackpackId: backpack.id // Сохраняем ID рюкзака для синхронизации
        };
    }
    
    // Обновляем отображение
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    renderTransport();
    scheduleSave();
    
    showToast('Рюкзак прикреплен к велосипеду!', 2000);
}

function detachBackpackFromBike(backpackIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    // Открепляем рюкзак от велосипеда
    backpack.attachedToBike = false;
    const bikeId = backpack.attachedToBikeId;
    backpack.attachedToBikeId = null;
    
    // Убираем багажник с транспортного средства
    const bikeVehicle = state.property.vehicles.find(v => v.linkedGearId === bikeId);
    if (bikeVehicle && bikeVehicle.trunk) {
        // Синхронизируем содержимое обратно в рюкзак перед удалением багажника
        const linkedBackpack = state.gear.find(g => g.id === bikeVehicle.trunk.linkedBackpackId);
        if (linkedBackpack) {
            linkedBackpack.storage = [...bikeVehicle.trunk.items];
        }
        bikeVehicle.trunk = null;
    }
    
    // Обновляем отображение
    recalculateLoadFromInventory();
    updateLoadDisplay();
    renderGear();
    renderTransport();
    scheduleSave();
    
    showToast('Рюкзак снят с велосипеда!', 2000);
}

function removeBikeFromVehicles(gearId) {
    const index = state.property.vehicles.findIndex(v => v.linkedGearId === gearId);
    if (index !== -1) {
        state.property.vehicles.splice(index, 1);
    }
}

// ============================================================================
// ФУНКЦИИ ДЛЯ СУМКИ
// ============================================================================

function renderBagFeatures(item, index) {
    // Инициализируем хранилище для 1 предмета
    if (item.storedItem === undefined) {
        item.storedItem = null;
    }
    
    return `
        <div style="margin-top: 0.5rem;">
            ${item.storedItem ? `
                <div style="padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid var(--success); border-radius: 6px; margin-bottom: 0.5rem;">
                    <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 0.75rem;">В сумке:</div>
                    <div style="color: ${getThemeColors().text}; font-size: 0.7rem; margin-top: 0.25rem;">${item.storedItem.name}</div>
                    <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">Нагрузка: ${item.storedItem.load} (не учитывается)</div>
                </div>
                <button class="pill-button" onclick="removeItemFromBag(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                    Достать предмет
                </button>
            ` : `
                <button class="pill-button success-button" onclick="putItemInBag(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                    Положить предмет
                </button>
            `}
        </div>
    `;
}

// ============================================================================
// ОБЩИЕ ФУНКЦИИ УПРАВЛЕНИЯ ПЗ И ОС
// ============================================================================

function decreaseGearHP(index) {
    const item = state.gear[index];
    if (!item || item.currentHp === undefined) return;
    
    item.currentHp = Math.max(0, item.currentHp - 1);
    
    renderGear();
    scheduleSave();
}

function increaseGearHP(index) {
    const item = state.gear[index];
    if (!item || item.currentHp === undefined) return;
    
    const maxHp = item.maxHp || item.hp || 10;
    item.currentHp = Math.min(maxHp, item.currentHp + 1);
    
    renderGear();
    scheduleSave();
}

function setGearHP(index, value) {
    const item = state.gear[index];
    if (!item || item.currentHp === undefined) return;
    
    const maxHp = item.maxHp || item.hp || 10;
    const newValue = parseInt(value) || 0;
    item.currentHp = Math.max(0, Math.min(maxHp, newValue));
    
    renderGear();
    scheduleSave();
}

function decreaseGearOS(index) {
    const item = state.gear[index];
    if (!item || item.currentOs === undefined) return;
    
    item.currentOs = Math.max(0, item.currentOs - 1);
    
    renderGear();
    scheduleSave();
}

function increaseGearOS(index) {
    const item = state.gear[index];
    if (!item || item.currentOs === undefined) return;
    
    const maxOs = item.maxOs || 10;
    item.currentOs = Math.min(maxOs, item.currentOs + 1);
    
    renderGear();
    scheduleSave();
}

function setGearOS(index, value) {
    const item = state.gear[index];
    if (!item || item.currentOs === undefined) return;
    
    const maxOs = item.maxOs || 10;
    const newValue = parseInt(value) || 0;
    item.currentOs = Math.max(0, Math.min(maxOs, newValue));
    
    renderGear();
    scheduleSave();
}

// ============================================================================
// СИСТЕМА РЕМОНТА
// ============================================================================

function repairGearItem(index) {
    const item = state.gear[index];
    if (!item) return;
    
    const maxHp = item.maxHp || item.hp || 10;
    const currentHp = item.currentHp !== undefined ? item.currentHp : maxHp;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>🔧 Ремонт: ${item.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Текущее состояние: ${currentHp}/${maxHp} ПЗ</p>
                
                <label class="field">
                    Новое значение ПЗ
                    <input type="number" class="input-field" id="repairHpValue" value="${maxHp}" min="0" max="${maxHp}">
                </label>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="confirmRepairGear(${index})">
                    Отремонтировать
                </button>
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
}

function confirmRepairGear(index) {
    const item = state.gear[index];
    if (!item) return;
    
    const newHp = parseInt(document.getElementById('repairHpValue').value) || 0;
    const maxHp = item.maxHp || item.hp || 10;
    
    item.currentHp = Math.max(0, Math.min(maxHp, newHp));
    
    // Если это щит и его отремонтировали, возвращаем нормальное название
    if (item.isShield && item.currentHp > 0) {
        item.name = item.name.replace(' (Сломано)', '').replace('Щит Сломан', 'Пуленепробиваемый щит');
    }
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    renderGear();
    scheduleSave();
    
    showModal('Ремонт завершен', `✅ ${item.name} отремонтирован! ПЗ: ${item.currentHp}/${maxHp}`);
}

// ============================================================================
// ФУНКЦИИ ДЛЯ УСТАНОВКИ ОРУЖИЯ НА ДРОНОВ
// ============================================================================

function installWeaponOnDrone(gearIndex) {
    const drone = state.gear[gearIndex];
    if (!drone) return;
    
    // Получаем список доступного оружия
    const availableWeapons = state.weapons.filter(w => {
        const weaponType = w.name;
        return weaponType.includes('Лёгкий пистолет') || 
               weaponType.includes('Обычный пистолет') || 
               weaponType.includes('Пистолет-пулемёт') || 
               weaponType.includes('Гранатомёт');
    });
    
    if (availableWeapons.length === 0) {
        showModal('Нет подходящего оружия', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">У вас нет подходящего оружия!</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Можно установить: Лёгкий пистолет, Обычный пистолет, Пистолет-пулемёт, Гранатомёт</p>
            </div>
        `);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>🔫 Установить оружие на ${drone.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Выберите оружие для установки:</p>
                <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    ${availableWeapons.map((weapon, idx) => {
                        const weaponIndex = state.weapons.findIndex(w => w.id === weapon.id);
                        return `
                            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--accent); border-radius: 6px; cursor: pointer;" onclick="confirmInstallWeaponOnDrone(${gearIndex}, ${weaponIndex})">
                                <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.25rem;">${weapon.customName || weapon.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">
                                    Урон: ${weapon.primaryDamage} | Магазин: ${weapon.maxAmmo || weapon.magazine}
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
}

function confirmInstallWeaponOnDrone(gearIndex, weaponIndex) {
    const drone = state.gear[gearIndex];
    const weapon = state.weapons[weaponIndex];
    
    if (!drone || !weapon) return;
    
    // Перемещаем оружие на дрон
    drone.weaponSlot = weapon;
    
    // Удаляем оружие из блока "Оружие"
    state.weapons.splice(weaponIndex, 1);
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    // Пересчитываем нагрузку и обновляем отображение
    recalculateLoadFromInventory();
    updateLoadDisplay();
    
    renderGear();
    renderWeapons();
    scheduleSave();
    
    showModal('Оружие установлено', `✅ ${weapon.name} установлено на ${drone.name}!`);
}

function removeDroneWeapon(gearIndex) {
    const drone = state.gear[gearIndex];
    if (!drone || !drone.weaponSlot) return;
    
    const weapon = drone.weaponSlot;
    
    // Возвращаем оружие в блок "Оружие"
    state.weapons.push(weapon);
    
    // Убираем оружие с дрона
    drone.weaponSlot = null;
    
    // Пересчитываем нагрузку и обновляем отображение
    recalculateLoadFromInventory();
    updateLoadDisplay();
    
    renderGear();
    renderWeapons();
    scheduleSave();
    
    showModal('Оружие снято', `✅ ${weapon.name} возвращено в блок "Оружие"!`);
}

// Рендеринг оружия на дроне (как карточка в блоке ОРУЖИЕ)
function renderDroneWeapon(weapon, droneIndex) {
    if (!weapon) return '';
    
    return `
        <div class="weapon-item" style="background: ${getThemeColors().bgMedium}; border: 1px solid rgba(182, 103, 255, 0.3); border-radius: 6px; padding: 0.5rem; margin-bottom: 0.5rem;">
            <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.25rem;">
                ${weapon.customName || weapon.name}
            </div>
            
            <div class="weapon-damage" style="margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.75rem;">Урон основной:</span>
                    <button class="pill-button primary-button" onclick="rollDroneWeaponDamage(${droneIndex}, '${weapon.primaryDamage}', '${weapon.name}', '${weapon.id}', 'primary')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${weapon.primaryDamage}</button>
                </div>
                ${weapon.altDamage && weapon.altDamage !== '—' ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.75rem;">Урон альтернативный:</span>
                        <button class="pill-button primary-button" onclick="rollDroneWeaponDamage(${droneIndex}, '${weapon.altDamage}', '${weapon.name}', '${weapon.id}', 'alt')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${weapon.altDamage}</button>
                    </div>
                ` : ''}
            </div>
            
            <div class="weapon-stats" style="font-family: monospace; font-size: 0.65rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">
                Можно скрыть: ${formatYesNo(weapon.concealable)} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}
            </div>
            
            <div class="weapon-magazine" style="margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <span style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem;">Патроны в магазине:</span>
                    <button class="pill-button success-button" onclick="reloadDroneWeapon(${droneIndex})" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;">🔄 Перезарядить</button>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.7rem;">
                        <span style="color: ${getThemeColors().accent}; font-weight: 600;">${weapon.currentAmmo || 0}</span>
                        <span style="color: ${getThemeColors().muted};">/</span>
                        <span style="color: ${getThemeColors().text};">${weapon.maxAmmo || weapon.magazine}</span>
                    </div>
                    ${weapon.loadedAmmoType ? `
                        <div style="font-size: 0.7rem; color: ${getThemeColors().success}; font-family: monospace;">
                            ${weapon.loadedAmmoType}
                        </div>
                    ` : `
                        <div style="font-size: 0.7rem; color: ${getThemeColors().muted}; font-style: italic;">
                            Не заряжено
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Функция для броска урона с оружия на дроне
function rollDroneWeaponDamage(droneIndex, damageFormula, weaponName, weaponId, damageType) {
    const drone = state.gear[droneIndex];
    if (!drone || !drone.weaponSlot) return;
    
    const weapon = drone.weaponSlot;
    
    // Используем ту же логику, что и для обычного оружия
    rollWeaponDamage(damageFormula, weaponName, 'ranged', weaponId, damageType);
}

// Функция перезарядки оружия на дроне
function reloadDroneWeapon(droneIndex) {
    const drone = state.gear[droneIndex];
    if (!drone || !drone.weaponSlot) return;
    
    const weapon = drone.weaponSlot;
    
    // Определяем тип оружия для поиска подходящих боеприпасов
    const weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
    
    // Находим подходящие боеприпасы
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === weaponTypeForAmmo && ammo.quantity > 0
    );
    
    if (compatibleAmmo.length === 0) {
        showModal('Нет боеприпасов', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">У вас нет подходящих боеприпасов!</p>
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Купите боеприпасы для ${weaponTypeForAmmo}</p>
            </div>
        `);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>🔄 Перезарядка: ${weapon.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">Дрон: ${drone.name}</p>
                <div style="margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;"><strong>Текущее состояние:</strong></p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">
                        Патронов: ${weapon.currentAmmo || 0}/${weapon.maxAmmo || weapon.magazine}
                        ${weapon.loadedAmmoType ? ` | Тип: ${weapon.loadedAmmoType}` : ' | Не заряжено'}
                    </p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label class="input-label">Выберите тип боеприпасов</label>
                    <select class="input-field" id="reloadDroneAmmoType">
                        ${compatibleAmmo.map((ammo, index) => `
                            <option value="${index}">${ammo.type} (${ammo.quantity} шт.)</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="executeReloadDroneWeapon(${droneIndex})">
                    🔄 Перезарядить
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
}

function executeReloadDroneWeapon(droneIndex) {
    const drone = state.gear[droneIndex];
    if (!drone || !drone.weaponSlot) return;
    
    const weapon = drone.weaponSlot;
    const selectedAmmoIndex = parseInt(document.getElementById('reloadDroneAmmoType').value);
    const weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
    const compatibleAmmo = state.ammo.filter(ammo => 
        ammo.weaponType === weaponTypeForAmmo && ammo.quantity > 0
    );
    const selectedAmmo = compatibleAmmo[selectedAmmoIndex];
    
    if (!selectedAmmo) {
        showModal('Ошибка', 'Выбранные боеприпасы не найдены!');
        return;
    }
    
    // Если в магазине есть патроны другого типа, возвращаем их
    if (weapon.currentAmmo > 0 && weapon.loadedAmmoType && weapon.loadedAmmoType !== selectedAmmo.type) {
        const existingAmmoIndex = state.ammo.findIndex(a => 
            a.type === weapon.loadedAmmoType && a.weaponType === weaponTypeForAmmo
        );
        
        if (existingAmmoIndex !== -1) {
            state.ammo[existingAmmoIndex].quantity += weapon.currentAmmo;
        } else {
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
    
    // Рассчитываем сколько патронов нужно
    const ammoNeeded = weapon.maxAmmo - (weapon.loadedAmmoType === selectedAmmo.type ? weapon.currentAmmo : 0);
    const ammoToTake = Math.min(ammoNeeded, selectedAmmo.quantity);
    
    // Находим индекс в основном массиве
    const realAmmoIndex = state.ammo.findIndex(ammo => ammo.id === selectedAmmo.id);
    
    if (realAmmoIndex !== -1) {
        // Вычитаем патроны
        state.ammo[realAmmoIndex].quantity -= ammoToTake;
        
        // Заряжаем оружие
        weapon.currentAmmo = (weapon.loadedAmmoType === selectedAmmo.type ? weapon.currentAmmo : 0) + ammoToTake;
        weapon.loadedAmmoType = selectedAmmo.type;
        
        renderAmmo();
        renderGear();
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        
        const reloadMessage = ammoToTake === ammoNeeded ? 
            'Магазин полностью заряжен!' : 
            `Заряжено ${ammoToTake} из ${ammoNeeded} патронов`;
        
        showModal('Перезарядка завершена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">✅ ${weapon.name}</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;">${reloadMessage}</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Тип: ${selectedAmmo.type} | Патронов: ${weapon.currentAmmo}/${weapon.maxAmmo}</p>
            </div>
        `);
    }
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ХРАНИЛИЩ (РЮКЗАК, КЕЙС, СУМКА)
// ============================================================================

// ============================================================================
// НОВАЯ ЛОГИКА РЮКЗАКА
// ============================================================================

// Открытие хранилища рюкзака
function openBackpackStorage(backpackIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('data-backpack-modal', 'true');
    modal.setAttribute('data-backpack-index', backpackIndex);
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    // Генерируем содержимое модала
    updateBackpackModalContent(modal, backpackIndex);
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Обновление содержимого модального окна рюкзака
function updateBackpackModalContent(modal, backpackIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    const usedLoad = backpack.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>🎒 Рюкзак: ${backpack.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px;">
                    <p style="color: ${getThemeColors().accent}; font-weight: 600;">Вместимость: ${usedLoad}/${maxLoad}</p>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: ${getThemeColors().accent}; font-size: 0.95rem; margin-bottom: 0.75rem;">Предметы в рюкзаке:</h4>
                    ${backpack.storage.length > 0 ? `
                        <div style="display: grid; gap: 0.5rem; max-height: 300px; overflow-y: auto;">
                            ${backpack.storage.map((item, idx) => `
                                <div style="background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.85rem;">${item.name}</div>
                                        <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">Нагрузка: ${item.load}</div>
                                    </div>
                                    <button class="pill-button" onclick="removeItemFromBackpack(${backpackIndex}, ${idx})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                                        Достать
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Рюкзак пуст</p>'}
                </div>
                
                <div>
                    <h4 style="color: ${getThemeColors().accent}; font-size: 0.95rem; margin-bottom: 0.75rem;">Добавить предметы:</h4>
                    <button class="pill-button success-button" onclick="showBackpackItemSelection(${backpackIndex})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                        Положить предмет
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Показать окно выбора предметов для рюкзака
function showBackpackItemSelection(backpackIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    const usedLoad = backpack.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    // Получаем список других предметов снаряжения (кроме самого рюкзака, других хранилищ и лекарств/препаратов)
    const availableItems = state.gear.filter((item, idx) => {
        if (idx === backpackIndex) return false; // Исключаем сам рюкзак
        if (item.name && (item.name.includes('РЮКЗАК') || item.name.includes('СУМКА') || item.name.includes('ПРОТИВОУДАРНЫЙ КЕЙС'))) {
            return false; // Исключаем другие хранилища
        }
        // Исключаем лекарства и препараты
        if (item.category === 'drugs' || item.category === 'medicines') {
            return false;
        }
        return true;
    });
    
    if (availableItems.length === 0) {
        showModal('Нет предметов', 'У вас нет предметов для добавления в рюкзак!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('data-backpack-selection-modal', 'true');
    modal.setAttribute('data-backpack-index', backpackIndex);
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    // Генерируем содержимое модала
    updateBackpackSelectionModalContent(modal, backpackIndex);
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Обновление содержимого окна выбора предметов для рюкзака
function updateBackpackSelectionModalContent(modal, backpackIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    const usedLoad = backpack.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    // Получаем список других предметов снаряжения (кроме самого рюкзака, других хранилищ и лекарств/препаратов)
    const availableItems = state.gear.filter((item, idx) => {
        if (idx === backpackIndex) return false; // Исключаем сам рюкзак
        if (item.name && (item.name.includes('РЮКЗАК') || item.name.includes('СУМКА') || item.name.includes('ПРОТИВОУДАРНЫЙ КЕЙС'))) {
            return false; // Исключаем другие хранилища
        }
        // Исключаем лекарства и препараты
        if (item.category === 'drugs' || item.category === 'medicines') {
            return false;
        }
        return true;
    });
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Положить предмет в рюкзак</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px;">
                    <p style="color: ${getThemeColors().accent}; font-weight: 600;">Вместимость: ${usedLoad}/${maxLoad}</p>
                </div>
                
                ${availableItems.length > 0 ? `
                    <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                        ${availableItems.map((item, idx) => {
                            const realIndex = state.gear.findIndex(g => g.id === item.id);
                            const canFit = (usedLoad + parseFloat(item.load)) <= maxLoad;
                            return `
                                <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid ${canFit ? 'var(--accent)' : 'var(--danger)'}; border-radius: 6px; ${canFit ? 'cursor: pointer;' : 'opacity: 0.5;'}" ${canFit ? `onclick="addItemToBackpack(${backpackIndex}, ${realIndex})"` : ''}>
                                    <div style="color: ${canFit ? 'var(--text)' : 'var(--muted)'}; font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">Нагрузка: ${item.load}</div>
                                    ${!canFit ? '<div style="color: ${getThemeColors().danger}; font-size: 0.7rem;">Не помещается!</div>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Нет предметов для добавления</p>'}
            </div>
        </div>
    `;
}

// Добавление предмета в рюкзак
function addItemToBackpack(backpackIndex, itemIndex) {
    const backpack = state.gear[backpackIndex];
    const item = state.gear[itemIndex];
    
    if (!backpack || !item) return;
    
    // Добавляем предмет в хранилище рюкзака
    backpack.storage.push(item);
    
    // Удаляем предмет из основного снаряжения
    state.gear.splice(itemIndex, 1);
    
    // Пересчитываем нагрузку
    recalculateLoadFromInventory();
    updateLoadDisplay();
    
    renderGear();
    scheduleSave();
    
    // Обновляем оба модальных окна
    const backpackModal = document.querySelector('.modal-overlay[data-backpack-modal]');
    const selectionModal = document.querySelector('.modal-overlay[data-backpack-selection-modal]');
    
    if (backpackModal) {
        updateBackpackModalContent(backpackModal, backpackIndex);
    }
    
    if (selectionModal) {
        updateBackpackSelectionModalContent(selectionModal, backpackIndex);
    }
    
    showToast(`${item.name} помещен в рюкзак!`, 2000);
}

// Удаление предмета из рюкзака
function removeItemFromBackpack(backpackIndex, storageIndex) {
    const backpack = state.gear[backpackIndex];
    if (!backpack) return;
    
    const item = backpack.storage[storageIndex];
    if (!item) return;
    
    // Удаляем из хранилища
    backpack.storage.splice(storageIndex, 1);
    
    // Добавляем обратно в основное снаряжение
    state.gear.push(item);
    
    // Пересчитываем нагрузку
    recalculateLoadFromInventory();
    updateLoadDisplay();
    
    renderGear();
    scheduleSave();
    
    // Обновляем модальное окно рюкзака
    const backpackModal = document.querySelector('.modal-overlay[data-backpack-modal]');
    if (backpackModal) {
        updateBackpackModalContent(backpackModal, backpackIndex);
    }
    
    showToast(`${item.name} извлечен из рюкзака!`, 2000);
}

// Функция для обновления содержимого модального окна кейса
function updateCaseModalContent(caseIndex) {
    const caseItem = state.gear[caseIndex];
    if (!caseItem) return;
    
    const usedLoad = caseItem.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 9;
    
    // Получаем список других предметов снаряжения (кроме самого кейса и других хранилищ)
    const availableItems = state.gear.filter((item, idx) => {
        if (idx === caseIndex) return false; // Исключаем сам кейс
        if (item.name && (item.name.includes('РЮКЗАК') || item.name.includes('СУМКА') || item.name.includes('ПРОТИВОУДАРНЫЙ КЕЙС'))) {
            return false; // Исключаем другие хранилища
        }
        return true;
    });
    
    // Обновляем содержимое модального окна
    const modalBody = document.querySelector('.modal-overlay .modal-body');
    if (modalBody) {
        modalBody.innerHTML = `
            <div style="margin-bottom: 1rem; padding: 0.75rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px;">
                <p style="color: ${getThemeColors().accent}; font-weight: 600;">Вместимость: ${usedLoad}/${maxLoad}</p>
                <p style="color: ${getThemeColors().accent}; font-weight: 600; margin-top: 0.5rem;">Предметы в кейсе:</p>
                ${caseItem.storage.length > 0 ? `
                    <div style="display: grid; gap: 0.5rem; margin-top: 0.5rem;">
                        ${caseItem.storage.map((item, idx) => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 4px;">
                                <div>
                                    <div style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.8rem;">${item.name}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">Нагрузка: ${item.load}</div>
                                </div>
                                <button class="pill-button danger-button" onclick="removeItemFromCase(${caseIndex}, ${idx})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">Удалить</button>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Кейс пуст</p>'}
            </div>
            
            ${availableItems.length > 0 ? `
                <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    ${availableItems.map((item, idx) => {
                        const realIndex = state.gear.findIndex(g => g.id === item.id);
                        const canFit = (usedLoad + parseFloat(item.load)) <= maxLoad;
                        return `
                            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid ${canFit ? 'var(--accent)' : 'var(--danger)'}; border-radius: 6px; ${canFit ? 'cursor: pointer;' : 'opacity: 0.5;'}" ${canFit ? `onclick="confirmAddItemToCase(${caseIndex}, ${realIndex})"` : ''}>
                                <div style="color: ${canFit ? 'var(--text)' : 'var(--muted)'}; font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">Нагрузка: ${item.load}</div>
                                ${!canFit ? '<div style="color: ${getThemeColors().danger}; font-size: 0.7rem;">Не помещается!</div>' : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Нет предметов для добавления</p>'}
            
            <div style="margin-top: 1rem; text-align: center;">
                <button class="pill-button success-button" onclick="addItemToCase(${caseIndex})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                    Добавить предмет
                </button>
            </div>
        `;
    }
}

// Аналогичные функции для кейса
function openCaseStorage(caseIndex) {
    const caseItem = state.gear[caseIndex];
    if (!caseItem) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const usedLoad = caseItem.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 9;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6565-3931-4133-a232-393964383262/case.png" alt="💼" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 0.5rem;"> Противоударный кейс</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 6px;">
                    <p style="color: ${getThemeColors().accent}; font-weight: 600;">Вместимость: ${usedLoad}/${maxLoad}</p>
                </div>
                
                <div id="caseStorageContent" style="max-height: 400px; overflow-y: auto;">
                    ${caseItem.storage.length === 0 ? `
                        <p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Кейс пуст</p>
                    ` : caseItem.storage.map((item, idx) => `
                        <div style="background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 6px; padding: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.85rem;">${item.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.7rem;">Нагрузка: ${item.load}</div>
                            </div>
                            <button class="pill-button" onclick="removeItemFromCase(${caseIndex}, ${idx})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">
                                Достать
                            </button>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 1rem; text-align: center;">
                    <button class="pill-button success-button" onclick="addItemToCase(${caseIndex})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                        Добавить предмет
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
}

function addItemToCase(caseIndex) {
    const caseItem = state.gear[caseIndex];
    if (!caseItem) return;
    
    const usedLoad = caseItem.storage.reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 9;
    
    const availableItems = state.gear.filter((item, idx) => {
        if (idx === caseIndex) return false; // Исключаем сам кейс
        if (item.name && (item.name.includes('РЮКЗАК') || item.name.includes('СУМКА') || item.name.includes('ПРОТИВОУДАРНЫЙ КЕЙС'))) {
            return false; // Исключаем другие хранилища
        }
        return true;
    });
    
    if (availableItems.length === 0) {
        showModal('Нет предметов', 'У вас нет предметов для добавления в кейс!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Выберите предмет</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Вместимость: ${usedLoad}/${maxLoad}</p>
                <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    ${availableItems.map((item, idx) => {
                        const realIndex = state.gear.findIndex(g => g.id === item.id);
                        const canFit = (usedLoad + parseFloat(item.load)) <= maxLoad;
                        return `
                            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid ${canFit ? 'var(--accent)' : 'var(--danger)'}; border-radius: 6px; ${canFit ? 'cursor: pointer;' : 'opacity: 0.5;'}" ${canFit ? `onclick="confirmAddItemToCase(${caseIndex}, ${realIndex})"` : ''}>
                                <div style="color: ${canFit ? 'var(--text)' : 'var(--muted)'}; font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">Нагрузка: ${item.load}</div>
                                ${!canFit ? '<div style="color: ${getThemeColors().danger}; font-size: 0.7rem;">Не помещается!</div>' : ''}
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
}

function confirmAddItemToCase(caseIndex, itemIndex) {
    const caseItem = state.gear[caseIndex];
    const item = state.gear[itemIndex];
    
    if (!caseItem || !item) return;
    
    caseItem.storage.push(item);
    state.gear.splice(itemIndex, 1);
    
    // Закрываем окно выбора предметов
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    recalculateLoadFromInventory();
    renderGear();
    scheduleSave();
    
    // Обновляем содержимое модального окна кейса
    updateCaseModalContent(caseIndex);
    
    showToast(`${item.name} помещен в кейс!`, 2000);
}

function removeItemFromCase(caseIndex, storageIndex) {
    const caseItem = state.gear[caseIndex];
    if (!caseItem) return;
    
    const item = caseItem.storage[storageIndex];
    if (!item) return;
    
    caseItem.storage.splice(storageIndex, 1);
    state.gear.push(item);
    
    recalculateLoadFromInventory();
    renderGear();
    scheduleSave();
    
    // Обновляем содержимое модального окна кейса
    updateCaseModalContent(caseIndex);
    
    showToast(`${item.name} извлечен из кейса!`, 2000);
}

// Функции для сумки
function putItemInBag(bagIndex) {
    const bag = state.gear[bagIndex];
    if (!bag) return;
    
    const availableItems = state.gear.filter((item, idx) => idx !== bagIndex);
    
    if (availableItems.length === 0) {
        showModal('Нет предметов', 'У вас нет предметов для добавления в сумку!');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>👜 Выберите предмет для сумки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Сумка вмещает 1 предмет (его нагрузка не будет учитываться)</p>
                <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    ${availableItems.map((item, idx) => {
                        const realIndex = state.gear.findIndex(g => g.id === item.id);
                        return `
                            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--accent); border-radius: 6px; cursor: pointer;" onclick="confirmPutItemInBag(${bagIndex}, ${realIndex})">
                                <div style="color: ${getThemeColors().text}; font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">Нагрузка: ${item.load}</div>
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
}

function confirmPutItemInBag(bagIndex, itemIndex) {
    const bag = state.gear[bagIndex];
    const item = state.gear[itemIndex];
    
    if (!bag || !item) return;
    
    // Сохраняем предмет в сумке
    bag.storedItem = item;
    
    // Удаляем из основного снаряжения
    state.gear.splice(itemIndex, 1);
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    recalculateLoadFromInventory();
    renderGear();
    scheduleSave();
    
    showModal('Предмет помещен', `✅ ${item.name} помещен в сумку!`);
}

function removeItemFromBag(bagIndex) {
    const bag = state.gear[bagIndex];
    if (!bag || !bag.storedItem) return;
    
    const item = bag.storedItem;
    
    // Возвращаем предмет в основное снаряжение
    state.gear.push(item);
    
    // Убираем из сумки
    bag.storedItem = null;
    
    recalculateLoadFromInventory();
    renderGear();
    scheduleSave();
    
    showModal('Предмет извлечен', `✅ ${item.name} извлечен из сумки!`);
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ГЕЙМЕРСКОГО КОМПЛЕКТА
// ============================================================================

// Эта функция вызывается при покупке геймерского комплекта
function handleGamerComponentPurchase() {
    // Показываем модал выбора предмета
    showGamerComponentSelectionModal();
}

function showGamerComponentSelectionModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Собираем все предметы: снаряжение + транспорт + броня + модули имплантов
    const allItems = [];
    
    // Снаряжение (исключаем сам геймерский комплект)
    state.gear.forEach((item, idx) => {
        // Исключаем геймерский комплект из списка выбора
        if (!item.name.includes('ГЕЙМЕРСКИЙ КОМПЛЕКТ')) {
            allItems.push({
                type: 'gear',
                index: idx,
                name: item.name,
                category: 'Снаряжение'
            });
        }
    });
    
    // Транспорт
    if (state.property && state.property.vehicles) {
        state.property.vehicles.forEach((vehicle, idx) => {
            allItems.push({
                type: 'vehicle',
                index: idx,
                name: vehicle.name,
                category: 'Транспорт'
            });
        });
    }
    
    // Броня из инвентаря
    if (state.armorInventory) {
        state.armorInventory.forEach((armor, idx) => {
            allItems.push({
                type: 'armor',
                index: idx,
                name: `${armor.type} броня (${armor.bodyPart})`,
                category: 'Броня'
            });
        });
    }
    
    // Модули имплантов (из снаряжения)
    state.gear.forEach((item, idx) => {
        if (item.type === 'implant') {
            allItems.push({
                type: 'implant-module',
                index: idx,
                name: item.name,
                category: 'Модуль импланта'
            });
        }
    });
    
    if (allItems.length === 0) {
        showModal('Нет предметов', 'У вас нет предметов для применения геймерского комплекта!');
        return;
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>🎮 Геймерский комплект</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Выберите предмет для добавления префикса "ГЕЙМЕРСКИЙ/ГЕЙМЕРСКОЕ/ГЕЙМЕРСКАЯ":</p>
                <div style="display: grid; gap: 0.5rem; max-height: 500px; overflow-y: auto;">
                    ${allItems.map(item => `
                        <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--accent); border-radius: 6px; cursor: pointer;" onclick="applyGamerPrefix('${item.type}', ${item.index})">
                            <div style="color: ${getThemeColors().text}; font-weight: 600; margin-bottom: 0.25rem;">${item.name}</div>
                            <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">${item.category}</div>
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
}

function applyGamerPrefix(itemType, itemIndex) {
    let item = null;
    let itemName = '';
    
    switch(itemType) {
        case 'gear':
            item = state.gear[itemIndex];
            if (item) {
                itemName = item.name;
                item.name = getGamerPrefixedName(itemName);
            }
            break;
        case 'vehicle':
            item = state.property.vehicles[itemIndex];
            if (item) {
                itemName = item.name;
                item.name = getGamerPrefixedName(itemName);
            }
            break;
        case 'armor':
            item = state.armorInventory[itemIndex];
            if (item) {
                itemName = `${item.type} броня`;
                item.type = getGamerPrefixedName(item.type);
            }
            break;
        case 'implant-module':
            item = state.gear[itemIndex];
            if (item) {
                itemName = item.name;
                item.name = getGamerPrefixedName(itemName);
            }
            break;
    }
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    // Удаляем геймерский комплект из снаряжения
    const gamerIndex = state.gear.findIndex(g => g.name && g.name.toUpperCase().includes('ГЕЙМЕРСКИЙ КОМПЛЕКТ'));
    if (gamerIndex !== -1) {
        state.gear.splice(gamerIndex, 1);
    }
    
    renderGear();
    renderTransport();
    renderArmorInventory();
    scheduleSave();
    
    showModal('Геймерский комплект применен!', `✅ ${itemName} теперь ${getGamerPrefixedName(itemName)}!`);
}

function getGamerPrefixedName(name) {
    // Определяем род слова (мужской/женский/средний)
    const nameLower = name.toLowerCase();
    
    // Женский род (окончания на -а, -я, кроме исключений)
    const feminineEndings = ['ка', 'га', 'жа', 'ча', 'ща', 'ца', 'на', 'ля', 'ра', 'та', 'да', 'ва'];
    const isFeminine = feminineEndings.some(ending => nameLower.endsWith(ending)) || 
                       nameLower.includes('броня') ||
                       nameLower.includes('винтовка') ||
                       nameLower.includes('защита') ||
                       nameLower.includes('камера');
    
    // Средний род (окончания на -о, -е)
    const neuterEndings = ['ко', 'то', 'но', 'ство', 'ние'];
    const isNeuter = neuterEndings.some(ending => nameLower.endsWith(ending)) ||
                     nameLower.includes('устройство') ||
                     nameLower.includes('оборудование');
    
    if (isFeminine) {
        return `ГЕЙМЕРСКАЯ ${name}`;
    } else if (isNeuter) {
        return `ГЕЙМЕРСКОЕ ${name}`;
    } else {
        return `ГЕЙМЕРСКИЙ ${name}`;
    }
}

// ============================================================================
// ФУНКЦИИ ДЛЯ НАБОРА ФЛЕШЕК/ЧИПОВ
// ============================================================================

// Эта функция вызывается при покупке набора флешек
function handleFlashChipsPurchase() {
    
    // Добавляем 5 чистых щепок в блок Дека
    for (let i = 0; i < 5; i++) {
        const newChip = {
            id: generateId('chip'),
            name: 'Чистая щепка',
            program: null,
            isEmpty: true
        };
        
        if (!state.deckChips) {
            state.deckChips = [];
        }
        
        state.deckChips.push(newChip);
    }
    
    renderDeckChips();
    scheduleSave();
    
    showModal('Щепки добавлены!', `✅ 5 чистых щепок добавлены в блок "Дека"!`);
    
    // НЕ добавляем набор флешек в снаряжение - он сразу "расходуется"
    return true; // Сигнал, что предмет не нужно добавлять в снаряжение
}

// ============================================================================
// ФУНКЦИИ ДЛЯ ОЧКОВ С ОПТИЧЕСКИМИ МОДУЛЯМИ
// ============================================================================

function installOpticalModule(glassesIndex) {
    const glasses = state.gear[glassesIndex];
    if (!glasses) return;
    
    // Получаем список доступных модулей зрения из киберимплантов
    const opticalModules = state.gear.filter(item => {
        if (item.type !== 'implant') return false;
        const implantName = item.name.toUpperCase();
        return implantName.includes('ЗРИТЕЛЬНЫЙ') ||
               implantName.includes('КАМЕРА ДЛЯ КИБЕР-ОПТИКИ') ||
               implantName.includes('ОПТИЧЕСКОЕ ПРИБЛИЖЕНИЕ') ||
               implantName.includes('ОПТИЧЕСКИЙ ЦЕЛЕУКАЗАТЕЛЬ') ||
               implantName.includes('ПНВ') ||
               implantName.includes('ТЕПЛОВИЗИОННОЕ ЗРЕНИЕ') ||
               implantName.includes('РЕГУЛЯТОР ИНТЕНСИВНОСТИ СВЕТА') ||
               implantName.includes('СЕТЕВОЕ ЗРЕНИЕ') ||
               implantName.includes('ЭКРАН ДЛЯ ХРОНОТОМА');
    });
    
    if (opticalModules.length === 0) {
        showModal('Нет модулей', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; margin-bottom: 1rem;">У вас нет подходящих модулей!</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Купите модули импланта для зрения в магазине киберимплантов</p>
            </div>
        `);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>👓 Установить модуль в очки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().muted}; margin-bottom: 1rem;">Выберите модуль для установки:</p>
                <div style="display: grid; gap: 0.5rem; max-height: 400px; overflow-y: auto;">
                    ${opticalModules.map((module, idx) => {
                        const realIndex = state.gear.findIndex(g => g.id === module.id);
                        return `
                            <div style="padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--accent); border-radius: 6px; cursor: pointer;" onclick="confirmInstallOpticalModule(${glassesIndex}, ${realIndex})">
                                <div style="color: ${getThemeColors().text}; font-weight: 600; margin-bottom: 0.25rem;">${module.name}</div>
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem;">${module.description}</div>
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
}

function confirmInstallOpticalModule(glassesIndex, moduleIndex) {
    const glasses = state.gear[glassesIndex];
    const module = state.gear[moduleIndex];
    
    if (!glasses || !module) return;
    
    // Переносим модуль в очки
    glasses.opticalModule = {
        name: module.name,
        description: module.description,
        implantData: module.implantData
    };
    
    // Удаляем модуль из снаряжения
    state.gear.splice(moduleIndex, 1);
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    renderGear();
    scheduleSave();
    
    showModal('Модуль установлен', `
        <div style="text-align: center; padding: 1.5rem;">
            <div style="background: ${getThemeColors().bgLight}; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid ${getThemeColors().border};">
                <div style="font-size: 2rem; margin-bottom: 0.75rem; color: ${getThemeColors().accent};">✓</div>
                <h4 style="color: ${getThemeColors().text}; margin: 0 0 0.5rem 0; font-size: 1.1rem; font-weight: 500;">${module.name} установлен в очки</h4>
            </div>
            <button class="pill-button" onclick="closeModal(this)" style="padding: 0.75rem 2rem; font-size: 1rem; background: ${getThemeColors().accent}; color: ${getThemeColors().bg}; border: none;">
                Отлично
            </button>
        </div>
    `);
}

function removeOpticalModule(glassesIndex) {
    const glasses = state.gear[glassesIndex];
    if (!glasses || !glasses.opticalModule) return;
    
    const module = glasses.opticalModule;
    
    // Возвращаем модуль в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: module.name,
        description: module.description,
        price: 0,
        load: 0,
        type: 'implant',
        implantData: module.implantData
    };
    
    state.gear.push(newGear);
    
    // Убираем модуль из очков
    glasses.opticalModule = null;
    
    renderGear();
    scheduleSave();
    
    showModal('Модуль снят', `✅ ${module.name} возвращен в снаряжение!`);
}

// ============================================================================
// ОБЩИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================================

function toggleGearDescription(gearId) {
    const descriptionElement = document.getElementById(`${gearId}_description`);
    if (descriptionElement) {
        // Извлекаем индекс из gearId (gear_${item.id})
        const itemId = gearId.replace('gear_', '');
        const itemIndex = state.gear.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const isCollapsed = toggleCollapsedItem('gear', itemIndex);
            descriptionElement.style.display = isCollapsed ? 'none' : 'block';
        }
    }
}

function removeGear(index) {
    const item = state.gear[index];
    if (item) {
        // Проверяем, является ли предмет хранилищем с содержимым
        if (item.storage && Array.isArray(item.storage) && item.storage.length > 0) {
            showModal('Нельзя удалить', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">⚠️ Нельзя удалить хранилище с предметами!</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin-bottom: 1rem;">
                        В ${item.name.toLowerCase()} находятся предметы. Сначала извлеките все предметы из хранилища.
                    </p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.8rem;">
                        Предметов внутри: ${item.storage.length}
                    </p>
                </div>
            `);
            return;
        }
        
        // Проверяем сумку с предметом
        if (item.storedItem) {
            showModal('Нельзя удалить', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">⚠️ Нельзя удалить сумку с предметом!</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin-bottom: 1rem;">
                        В ${item.name} находится предмет "${item.storedItem.name}". Сначала извлеките предмет из сумки.
                    </p>
                </div>
            `);
            return;
        }
        
        // Возвращаем нагрузку
        state.load.current += item.load || 0;
        
        // Если это велосипед в режиме "Катить", удаляем его из транспорта
        if (item.bikeMode === 'ride') {
            removeBikeFromVehicles(item.id);
        }
        
        // Удаляем предмет
        state.gear.splice(index, 1);
        
        // Обновляем состояние сворачивания
        updateCollapsedItemsAfterRemoval('gear', index);
        
        // Пересчитываем нагрузку и обновляем отображение
        recalculateLoadFromInventory();
        updateLoadDisplay();
        
        // Обновляем UI и сохраняем
        renderGear();
        renderTransport();
        renderGear();
        scheduleSave();
    }
}

// ============================================================================
// ФУНКЦИИ ОБНОВЛЕНИЯ ОТОБРАЖЕНИЯ ХАРАКТЕРИСТИК
// ============================================================================

function updateTECHDisplay() {
    // Находим активный мультитул
    const activeMultitool = state.gear.find(item => 
        getGearSpecialType(item.name) === 'multitool' && item.activated
    );
    
    const techBonus = activeMultitool ? 2 : 0;
    
    // Находим элемент для бонуса
    const bonusElement = document.getElementById('techBonus');
    
    if (bonusElement) {
        if (techBonus > 0) {
            bonusElement.textContent = `Мультитул +${techBonus}`;
            bonusElement.style.display = 'block';
            bonusElement.style.color = 'var(--success)';
            bonusElement.style.fontSize = '0.8rem';
            bonusElement.style.fontWeight = '600';
            bonusElement.style.marginTop = '0.25rem';
            bonusElement.style.textAlign = 'center';
        } else {
            bonusElement.style.display = 'none';
        }
    }
}

function updateDEXDisplay() {
    // Находим надетый рюкзак (не прикрепленный к велосипеду)
    const wornBackpack = state.gear.find(item => 
        getGearSpecialType(item.name) === 'backpack' && item.worn && !item.attachedToBike
    );
    
    let dexPenalty = 0;
    if (wornBackpack) {
        const position = wornBackpack.backpackPosition || 'back';
        dexPenalty = position === 'front' ? -4 : -2;
    }
    
    // Находим input для ЛВК и его родителя
    const dexInput = document.getElementById('statDEX');
    if (dexInput && dexInput.parentElement) {
        const statBox = dexInput.parentElement;
        
        // Ищем или создаем элемент для штрафа
        let penaltyElement = document.getElementById('dexBackpackPenalty');
        if (!penaltyElement && dexPenalty !== 0) {
            penaltyElement = document.createElement('div');
            penaltyElement.id = 'dexBackpackPenalty';
            penaltyElement.style.cssText = 'color: ${getThemeColors().danger}; font-size: 0.65rem; text-align: center; margin-top: 0.15rem; font-weight: 600;';
            statBox.appendChild(penaltyElement);
        }
        
        if (penaltyElement) {
            if (dexPenalty !== 0) {
                penaltyElement.textContent = `${dexPenalty}`;
                penaltyElement.style.display = 'block';
            } else {
                penaltyElement.style.display = 'none';
            }
        }
    }
}

// ============================================================================
// МАГАЗИН СНАРЯЖЕНИЯ
// ============================================================================

function showGearShop() {
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw !important; max-height: 90vh !important; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3363-6531-4132-a138-663132646531/remote-control.png" alt="🎒" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин снаряжения</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            
            <!-- Фильтры -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button class="pill-button gear-category-filter active" onclick="filterGear('all')" data-category="all" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Все предметы
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGear('tools')" data-category="tools" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Инструменты
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGear('protection')" data-category="protection" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Защита
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGear('tech')" data-category="tech" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Техника
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGear('storage')" data-category="storage" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Хранилища
                </button>
                <button class="pill-button gear-category-filter" onclick="filterGear('chips')" data-category="chips" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;">
                    Щепки навыков
                </button>
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;" id="gearShopContainer">
                <!-- Контент будет загружен через filterGear -->
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
    filterGear('all');
    
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации снаряжения
function filterGear(category) {
    const container = document.getElementById('gearShopContainer');
    if (!container) return;
    
    // Обновляем активный фильтр
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
    
    // Фильтруем снаряжение по профессиональным навыкам
    let filteredGear = GEAR_LIBRARY.filter(item => {
        if (item.requiresProfSkill === 'Глас народа') {
            return hasJournalistSkill;
        }
        return true;
    });
    
    // Фильтруем по категориям
    if (category !== 'all') {
        filteredGear = filteredGear.filter(gear => {
            const name = gear.name.toUpperCase();
            const description = gear.description.toUpperCase();
            
            switch(category) {
                case 'tools':
                    return name.includes('ПРИНТЕР') || name.includes('АНАЛИЗАТОР') || 
                           name.includes('ТЕПЛОВИЗОР') || name.includes('ЭНДОСКОП') ||
                           name.includes('ДРОН') || name.includes('КАМЕРА') ||
                           name.includes('СКАНЕР') || name.includes('ДЕТЕКТОР') ||
                           name.includes('ИНСТРУМЕНТ') || name.includes('ОТВЕРТКА') ||
                           name.includes('КЛЮЧ') || name.includes('ПИЛА') ||
                           name.includes('ДРЕЛЬ') || name.includes('ПАЯЛЬНИК');
                           
                case 'protection':
                    return name.includes('КОСТЮМ') || name.includes('ЗАЩИТА') ||
                           name.includes('БРОНЯ') || name.includes('ЩИТ') ||
                           name.includes('КАСКА') || name.includes('ПЕРЧАТКИ') ||
                           name.includes('МАСКА') || name.includes('РЕСПИРАТОР') ||
                           name.includes('АНТИРАДИАЦИОННЫЙ') || name.includes('ПРОТИВОГАЗ');
                           
                case 'tech':
                    return name.includes('КОМПЬЮТЕР') || name.includes('ПЛАНШЕТ') ||
                           name.includes('ТЕРМИНАЛ') || name.includes('ЧИП') ||
                           name.includes('КАРТА') || name.includes('ДИСК') ||
                           name.includes('ФЛЕШКА') || name.includes('ПАМЯТЬ') ||
                           name.includes('ПРОЦЕССОР') || name.includes('МОДЕМ') ||
                           name.includes('РАДИО') || name.includes('ПЕРЕДАТЧИК');
                           
                case 'storage':
                    return name.includes('РЮКЗАК') || name.includes('СУМКА') ||
                           name.includes('КЕЙС') || name.includes('КОНТЕЙНЕР') ||
                           name.includes('ЯЩИК') || name.includes('КОРОБКА') ||
                           name.includes('МЕШОК') || name.includes('КОШЕЛЕК');
                           
                case 'chips':
                    return name.includes('ЩЕПКА НАВЫКА');
                           
                default:
                    return true;
            }
        });
    }
    
    // Рендерим отфильтрованные предметы
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
            ${filteredGear.map((gear, index) => {
                const originalIndex = GEAR_LIBRARY.findIndex(g => g === gear);
                const isSkillChip = gear.name.includes('ЩЕПКА НАВЫКА');
                
                return `
                    <div class="shop-item" ${isSkillChip ? 'style="border: 2px solid #b667ff;"' : ''}>
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">${gear.name}</h4>
                        </div>
                        
                        <p class="shop-item-description">
                            ${gear.description}
                        </p>
                        
                        <div class="shop-item-stats">
                            ${gear.awarenessLoss ? `<div class="shop-stat">Потеря осознанности: ${gear.awarenessLoss}</div>` : ''}
                            <div class="shop-stat">Нагрузка: ${gear.load}</div>
                        </div>
                        
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${gear.price} уе
                            </span>
                            <button class="pill-button primary-button" onclick="buyGearItem(${originalIndex})" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function buyGearItem(index) {
    const gear = GEAR_LIBRARY[index];
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < gear.price) {
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
    
    // Проверяем, является ли это щепкой навыка
    const isSkillChip = gear.name.includes('ЩЕПКА НАВЫКА');
    
    // Списываем деньги
    state.money = currentMoney - gear.price;
    updateMoneyDisplay();
    
    // Показываем сообщение о покупке только для обычных предметов
    if (!isSkillChip) {
        showModal('Предмет куплен', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">✅ Предмет куплен!</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    <strong>${gear.name}</strong> добавлен в ваш инвентарь.
                </p>
                <button class="pill-button" onclick="closeModal(this)">
                    Отлично
                </button>
            </div>
        `);
    }
    
    if (isSkillChip) {
        // Показываем модал для ввода навыка
        showModal('Выбор навыка для щепки', `
            <div style="padding: 1rem;">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    Введите название навыка, который содержится на этой щепке:
                </p>
                <input type="text" id="skillChipNameInput" 
                    placeholder="Например: Взлом, Стрельба, Медицина..." 
                    onkeypress="if(event.key==='Enter') confirmSkillChipPurchase(${index})"
                    style="width: 100%; padding: 0.75rem; background: ${getThemeColors().bgMedium}; border: 1px solid ${getThemeColors().accent}; color: ${getThemeColors().text}; border-radius: 6px; font-size: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="pill-button" onclick="closeModal(this)" style="background: ${getThemeColors().bgMedium}; color: ${getThemeColors().text};">
                        Отмена
                    </button>
                    <button class="pill-button primary-button" onclick="confirmSkillChipPurchase(${index})" style="background: ${getThemeColors().accent}; color: white;">
                        Подтвердить
                    </button>
                </div>
            </div>
        `);
        
        // Фокусируемся на поле ввода
        setTimeout(() => {
            const input = document.getElementById('skillChipNameInput');
            if (input) input.focus();
        }, 100);
    } else {
        // Обычная покупка для не-щепок
        addGearToInventory(gear, index);
    }
}

// Функция для добавления обычного снаряжения в инвентарь
function addGearToInventory(gear, index) {
    // Добавляем снаряжение
    const newGear = {
        id: generateId('gear'),
        name: gear.name,
        description: gear.description,
        price: gear.price,
        load: gear.load,
        type: gear.type || 'gear'
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    // Логируем покупку
    addToRollLog('purchase', {
        item: gear.name,
        price: gear.price,
        category: 'Снаряжение'
    });
}

// Функция для подтверждения покупки щепки навыка
window.confirmSkillChipPurchase = function(index) {
    const skillName = document.getElementById('skillChipNameInput').value.trim();
    
    if (!skillName) {
        showToast('Введите название навыка!', 3000);
        return;
    }
    
    if (skillName.length < 2) {
        showToast('Название навыка должно содержать минимум 2 символа!', 3000);
        return;
    }
    
    // Закрываем модал выбора навыка сразу при нажатии "Подтвердить"
    // Ищем модал с заголовком "Выбор навыка для щепки"
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        const title = modal.querySelector('h3');
        if (title && title.textContent.includes('Выбор навыка для щепки')) {
            modal.remove();
        }
    });
    
    const gear = GEAR_LIBRARY[index];
    if (!gear) return;
    
    // Списываем деньги
    const currentMoney = parseInt(state.money) || 0;
    if (currentMoney < gear.price) {
        showToast('Недостаточно денег!', 3000);
        return;
    }
    
    state.money = currentMoney - gear.price;
    updateMoneyDisplay();
    
    // Создаем щепку с кастомным названием
    const newGear = {
        id: generateId('gear'),
        name: `ЩЕПКА НАВЫКА "${skillName.toUpperCase()}" (уровень ${gear.name.match(/уровень (\d+)/)?.[1] || 'N'})`,
        description: gear.description,
        price: gear.price,
        load: gear.load,
        type: gear.type || 'gear',
        isSkillChip: true,
        awarenessLoss: gear.awarenessLoss,
        inserted: false,
        skillName: skillName // Сохраняем оригинальное название навыка
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    // Логируем покупку
    addToRollLog('purchase', {
        item: newGear.name,
        price: gear.price,
        category: 'Щепка навыка'
    });
    
    // Показываем сообщение о покупке с небольшой задержкой
    setTimeout(() => {
        showModal('Щепка навыка куплена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().success}; font-size: 1.1rem; margin-bottom: 1rem;">✅ Щепка навыка куплена!</p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    <strong>${newGear.name}</strong> добавлена в ваш инвентарь.
                </p>
                <button class="pill-button" onclick="closeModal(this)">
                    Отлично
                </button>
            </div>
        `);
    }, 100);
};

// ============================================================================
// СПЕЦИАЛЬНАЯ ОБРАБОТКА ПОКУПОК
// ============================================================================

// Эта функция вызывается перед добавлением предмета в снаряжение
window.handleSpecialGearPurchase = function(itemName, item) {
    // Геймерский комплект
    if (itemName.toUpperCase().includes('ГЕЙМЕРСКИЙ КОМПЛЕКТ')) {
        // Сначала добавляем в снаряжение
        const gearItem = {
            id: generateId('gear'),
            name: itemName,
            description: item.description,
            price: item.price,
            load: item.load,
            type: 'special'
        };
        state.gear.push(gearItem);
        renderGear();
        scheduleSave();
        
        // Затем сразу показываем модал выбора
        setTimeout(() => {
            showGamerComponentSelectionModal();
        }, 100);
        
        return true;
    }
    
    // Набор флешек/чипов
    if (itemName.toUpperCase().includes('НАБОР ФЛЕШЕК') || itemName.toUpperCase().includes('НАБОР ЧИПОВ') || itemName.toUpperCase().includes('НАБОР ЧИСТЫХ')) {
        
        handleFlashChipsPurchase();
        return true; // Не добавляем в снаряжение
    }
    
    return false; // Обычная обработка
}

// ============================================================================
// ФУНКЦИИ ИЗ WEAPONS.JS (ПЕРЕНЕСЕНЫ СЮДА)
// ============================================================================

function decreaseShieldHP(gearIndex) {
    const gear = state.gear[gearIndex];
    if (!gear || !gear.isShield || gear.currentHp <= 0) return;
    
    gear.currentHp = Math.max(0, gear.currentHp - 1);
    
    // Если ПЗ стало 0, меняем название на "Щит Сломан"
    if (gear.currentHp === 0) {
        gear.name = 'Щит Сломан';
    }
    
    renderGear();
    scheduleSave();
}

// Функция installImplantFromGear удалена - модули имплантов устанавливаются через "Управление имплантами"

// ============================================================================
// ФУНКЦИИ ДЛЯ МОДУЛЕЙ ИМПЛАНТОВ
// ============================================================================

function renderImplantFeatures(item, index) {
    // Проверяем, является ли это укреплением костной системы
    if (item.implantData && item.implantData.specialInstall === 'bone_reinforcement') {
        return `
            <div style="margin-top: 0.5rem;">
                <button class="pill-button success-button" onclick="showReinforcementInstallation(${index})" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">
                    🛡️ Установить укрепление
                </button>
            </div>
        `;
    }
    
    // Для обычных имплантов показываем ссылку на управление имплантами
    return `
        <div style="margin-top: 0.5rem;">
            <p style="color: ${getThemeColors().muted}; font-size: 0.7rem; margin: 0;">
                Установка через "Управление имплантами"
            </p>
        </div>
    `;
}



