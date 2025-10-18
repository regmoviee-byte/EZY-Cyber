// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С БРОНЕЙ
// Система брони, инвентарь брони, магазин брони, штрафы и расчеты
// ============================================================================

console.log('🛡️ armor.js загружается...');

// Функции для работы с броней
function increaseArmorOS(part) {
    const input = document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}OS`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.min(99, currentValue + 1);
        input.value = newValue;
        state.armor[part].os = newValue;
        
        // Устанавливаем тип брони на основе ОС
        if (newValue > 0) {
            if (newValue <= 2) {
                state.armor[part].type = 'Лёгкая';
            } else if (newValue <= 4) {
                state.armor[part].type = 'Средняя';
            } else if (newValue <= 6) {
                state.armor[part].type = 'Тяжёлая';
            } else {
                state.armor[part].type = 'Титаническая';
            }
        } else {
            state.armor[part].type = 'Лёгкая';
        }
        
        // Обновляем отображение типа брони
        const typeField = document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}Type`);
        if (typeField) typeField.textContent = state.armor[part].type;
        
        updateArmorPenalty();
        scheduleSave();
    }
}

function decreaseArmorOS(part) {
    const input = document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}OS`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue - 1);
        input.value = newValue;
        state.armor[part].os = newValue;
        
        // Устанавливаем тип брони на основе ОС
        if (newValue > 0) {
            if (newValue <= 2) {
                state.armor[part].type = 'Лёгкая';
            } else if (newValue <= 4) {
                state.armor[part].type = 'Средняя';
            } else if (newValue <= 6) {
                state.armor[part].type = 'Тяжёлая';
            } else {
                state.armor[part].type = 'Титаническая';
            }
        } else {
            state.armor[part].type = 'Лёгкая';
        }
        
        // Обновляем отображение типа брони
        const typeField = document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}Type`);
        if (typeField) typeField.textContent = state.armor[part].type;
        
        updateArmorPenalty();
        scheduleSave();
    }
}

// Функция для определения максимального типа брони
function getMaxArmorType() {
    const armorLevels = {
        'Лёгкая': 0,
        'Средняя': 1,
        'Тяжёлая': 2,
        'Титаническая': 3
    };

    let maxLevel = 0;
    let maxType = 'Лёгкая';

    // Проверяем все части тела
    for (const part of ['head', 'body', 'arms', 'legs']) {
        const type = state.armor[part].type || 'Лёгкая';
        if (type !== 'Лёгкая') {
            const level = armorLevels[type] || 0;
            if (level > maxLevel) {
                maxLevel = level;
                maxType = type;
            }
        }
    }

    return maxType;
}

// Новая система расчета штрафов от брони
function calculateArmorPenalties() {
    const armorLevels = {
        'Лёгкая': 0,
        'Средняя': 1,
        'Тяжёлая': 2,
        'Титаническая': 3
    };

    let maxLevel = 0;
    let maxType = 'Лёгкая';
    let hasAnyArmor = false;

    // Проверяем все части тела
    for (const part of ['head', 'body', 'arms', 'legs']) {
        const type = state.armor[part].type || 'Лёгкая';
        if (type !== 'Лёгкая') {
            hasAnyArmor = true;
            const level = armorLevels[type] || 0;
            if (level > maxLevel) {
                maxLevel = level;
                maxType = type;
            }
        }
    }

    // Если нет брони тяжелее лёгкой, то нет и штрафа
    if (!hasAnyArmor) {
        return {
            speed: 0,
            reaction: 0,
            dexterity: 0,
            healthPenalty: 0,
            isTitanicConnected: false
        };
    }

    const body = parseInt(state.stats.BODY) || 0;
    const isTitanicConnected = state.titanicArmorConnected || false;
    
    let penalties = {
        speed: 0,
        reaction: 0,
        dexterity: 0,
        healthPenalty: 0,
        isTitanicConnected: isTitanicConnected
    };

    // Проверяем, надета ли полная титаническая броня
    const isFullTitanicArmor = maxType === 'Титаническая' && 
        state.armor.head.type === 'Титаническая' &&
        state.armor.body.type === 'Титаническая' &&
        state.armor.arms.type === 'Титаническая' &&
        state.armor.legs.type === 'Титаническая';

    switch (maxType) {
        case 'Лёгкая':
            // Без штрафов
            break;
            
        case 'Средняя':
            penalties.reaction = -1;
            penalties.dexterity = -1;
            penalties.speed = -1;
            // Средняя броня дает штрафы ко всем характеристикам
            break;
            
        case 'Тяжёлая':
            penalties.reaction = -3;
            penalties.dexterity = -3;
            // Дополнительный штраф к СКО если ТЕЛО 7 и меньше
            if (body <= 7) {
                penalties.speed = -3;
            } else {
                // Для отображения показываем штраф к скорости даже если он не применяется
                penalties.speed = -3;
            }
            break;
            
        case 'Титаническая':
            if (isFullTitanicArmor && isTitanicConnected) {
                // Если титаническая броня подключена, штрафов к характеристикам нет
                penalties.healthPenalty = -5;
            } else {
                // Обычные штрафы титанической брони
                penalties.speed = -6;
                penalties.reaction = -6;
                penalties.dexterity = -6;
            }
            break;
    }

    return penalties;
}

function updateArmorPenalty() {
    const penalties = calculateArmorPenalties();
    
    // Обновляем визуальное отображение штрафов
    updateArmorPenaltyDisplay(penalties);
    
    // Обновляем производные характеристики (скорость перемещения)
    updateDerivedStats();
    
    // Показываем/скрываем чекбокс титанической брони
    updateTitanicArmorCheckbox(penalties);
}

// Функция для обновления видимости чекбокса титанической брони
function updateTitanicArmorCheckbox(penalties) {
    const checkboxContainer = document.getElementById('titanicArmorCheckbox');
    if (!checkboxContainer) return;
    
    // Проверяем, надета ли полная титаническая броня
    const isFullTitanicArmor = state.armor.head.type === 'Титаническая' &&
        state.armor.body.type === 'Титаническая' &&
        state.armor.arms.type === 'Титаническая' &&
        state.armor.legs.type === 'Титаническая';
    
    if (isFullTitanicArmor) {
        checkboxContainer.style.display = 'block';
        // Синхронизируем состояние чекбокса
        const checkbox = document.getElementById('titanicArmorConnected');
        if (checkbox) {
            checkbox.checked = state.titanicArmorConnected || false;
        }
    } else {
        checkboxContainer.style.display = 'none';
        // Сбрасываем состояние подключения если броня не полная
        state.titanicArmorConnected = false;
    }
}

// Функция для переключения подключения титанической брони
function toggleTitanicArmorConnection() {
    const checkbox = document.getElementById('titanicArmorConnected');
    if (!checkbox) return;
    
    state.titanicArmorConnected = checkbox.checked;
    
    // Обновляем штрафы
    updateArmorPenalty();
    
    // Обновляем здоровье если есть штраф
    calculateAndUpdateHealth();
    
    scheduleSave();
}

// Функция для визуального отображения штрафов под характеристиками
function updateArmorPenaltyDisplay(penalties) {
    // Обновляем штрафы к ловкости (ЛВК) - только штраф к ЛВК, не к скорости
    updateStatPenaltyDisplay('DEX', penalties.dexterity);
    
    // Обновляем штрафы к реакции (РЕА)
    updateStatPenaltyDisplay('REA', penalties.reaction);
    
    // Обновляем штрафы к скорости перемещения (СКО)
    updateSpeedPenaltyDisplay(penalties.speed);
    
    // Обновляем штрафы к здоровью (ПЗ)
    updateHealthPenaltyDisplay(penalties.healthPenalty);
}

// Функция для обновления отображения штрафа под конкретной характеристикой
function updateStatPenaltyDisplay(statType, penalty) {
    const statElement = document.getElementById(`stat${statType.toUpperCase()}`);
    if (!statElement) return;
    
    // Находим контейнер характеристики (stat-box-compact)
    const statContainer = statElement.closest('.stat-box-compact');
    if (!statContainer) return;
    
    // Удаляем старый штраф если есть
    const existingPenalty = statContainer.querySelector('.armor-penalty');
    if (existingPenalty) {
        existingPenalty.remove();
    }
    
    // Добавляем новый штраф если есть - ПОД значением в стиле перегрузки
    if (penalty !== 0) {
        const penaltyElement = document.createElement('div');
        penaltyElement.className = 'armor-penalty';
        penaltyElement.textContent = `Броня: ${penalty > 0 ? '+' : ''}${penalty}`;
        penaltyElement.style.cssText = `
            color: #ff4444;
            font-size: 0.75rem;
            text-align: center;
            margin-top: 0.25rem;
            font-weight: 500;
        `;
        statContainer.appendChild(penaltyElement);
    }
}

// Функция для обновления штрафа к скорости перемещения
function updateSpeedPenaltyDisplay(penalty) {
    const speedElement = document.getElementById('derivedSpeed');
    if (!speedElement) return;
    
    // Находим контейнер скорости перемещения (derived-stat-compact)
    const speedContainer = speedElement.closest('.derived-stat-compact');
    if (!speedContainer) return;
    
    // Удаляем старый штраф если есть
    const existingPenalty = speedContainer.querySelector('.armor-speed-penalty');
    if (existingPenalty) {
        existingPenalty.remove();
    }
    
    // Добавляем новый штраф если есть - в стиле перегрузки
    if (penalty !== 0) {
        const penaltyElement = document.createElement('div');
        penaltyElement.className = 'armor-speed-penalty';
        
        // Определяем тип брони для правильного отображения минимума
        const maxType = getMaxArmorType();
        let penaltyText;
        
        if (maxType === 'Титаническая') {
            penaltyText = `Броня: ${penalty > 0 ? '+' : ''}${penalty} (мин. 0)`;
        } else {
            penaltyText = `Броня: ${penalty > 0 ? '+' : ''}${penalty} (мин. 1)`;
        }
        
        penaltyElement.textContent = penaltyText;
        penaltyElement.style.cssText = `
            color: #ff4444;
            font-size: 0.75rem;
            text-align: center;
            margin-top: 0.25rem;
            font-weight: 500;
        `;
        speedContainer.appendChild(penaltyElement);
    }
}

// Функция для обновления штрафа к здоровью
function updateHealthPenaltyDisplay(penalty) {
    const healthElement = document.getElementById('healthMax');
    if (!healthElement) return;
    
    // Удаляем старый штраф если есть
    const existingPenalty = healthElement.parentNode.querySelector('.armor-health-penalty');
    if (existingPenalty) {
        existingPenalty.remove();
    }
    
    // Добавляем новый штраф если есть - в стиле перегрузки
    if (penalty !== 0) {
        const penaltyElement = document.createElement('div');
        penaltyElement.className = 'armor-health-penalty';
        penaltyElement.textContent = `Броня: ${penalty > 0 ? '+' : ''}${penalty}`;
        penaltyElement.style.cssText = `
            color: #ff4444;
            font-size: 0.75rem;
            text-align: center;
            margin-top: 0.25rem;
            font-weight: 500;
        `;
        healthElement.parentNode.appendChild(penaltyElement);
    }
}

// Магазин брони
function showArmorShop() {
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
    
    // Проверяем режим бесплатно
    const isFreeMode = window.armorShopFreeMode || false;
    
    // Устанавливаем фон в зависимости от режима
    if (isFreeMode) {
        modal.style.background = 'rgba(0, 100, 50, 0.85)';
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3264-6164-4130-a633-383838366132/armor_1.png" alt="🛡️" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин брони</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="pill-button ${isFreeMode ? 'success-button' : 'muted-button'}" onclick="toggleArmorShopFreeMode()" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${isFreeMode ? 'Отключить бесплатно' : 'Бесплатно'}</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="background: ${getThemeColors().warningLight}; border: 1px solid ${getThemeColors().warning}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="color: #ffc107; font-weight: 600; margin-bottom: 0.5rem;">📝 Памятка:</div>
                    <div style="color: ${getThemeColors().text}; font-size: 0.9rem; line-height: 1.4;">
                        При покупке брони выберите <strong>Голову</strong> или <strong>Тело</strong>. 
                        Броня для Тела включает 3 предмета: Тело, Руки и Ноги.<br>
                        <strong>Титаническая броня</strong> покупается сразу для всех частей тела (Голова+Тело+Руки+Ноги).
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    <!-- Простые шмотки -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyArmor('Простые шмотки', 10, 0, 'Лёгкая')">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Простые шмотки</h4>
                        </div>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ОС: 0</div>
                            <div class="shop-stat">Тип: Обычная одежда</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '10 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyArmor('Простые шмотки', 10, 0, 'Лёгкая')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Лёгкая броня -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyArmor('Лёгкая', 100, 10, 'Лёгкая')">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Лёгкая броня</h4>
                        </div>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ОС: 10</div>
                            <div class="shop-stat">Штраф: Нет</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '100 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyArmor('Лёгкая', 100, 10, 'Лёгкая')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Средняя броня -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyArmor('Средняя', 500, 15, 'Средняя')">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Средняя броня</h4>
                        </div>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ОС: 15</div>
                            <div class="shop-stat">Штраф: -1 СКО, РЕА, ЛВК</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '500 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyArmor('Средняя', 500, 15, 'Средняя')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Тяжёлая броня -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyArmor('Тяжёлая', 2500, 18, 'Тяжёлая')">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Тяжёлая броня</h4>
                        </div>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ОС: 18</div>
                            <div class="shop-stat">Штраф: -3 РЕА, ЛВК, СКО</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '2 500 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyArmor('Тяжёлая', 2500, 18, 'Тяжёлая')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Титаническая броня -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyTitanicArmor()">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Титаническая броня</h4>
                        </div>
                        
                        <p class="shop-item-description">
                            Полная защита всего тела (Голова+Тело+Руки+Ноги)
                        </p>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ОС: 25</div>
                            <div class="shop-stat">Штраф: -6 СКО, РЕА, ЛВК</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '20 000 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyTitanicArmor()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Активная броня -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyActiveArmor()">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Активная броня</h4>
                        </div>
                        
                        <p class="shop-item-description">
                            Защищает от неожиданных угроз
                        </p>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '500 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyActiveArmor()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
                    
                    <!-- Пуленепробиваемый щит -->
                    <div class="shop-item" style="cursor: pointer;" onclick="buyBallisticShield()">
                        <div class="shop-item-header">
                            <h4 class="shop-item-title">Пуленепробиваемый щит</h4>
                        </div>
                        
                        <p class="shop-item-description">
                            Требует 1 руку. Добавляется в снаряжение.
                        </p>
                        
                        <div class="shop-item-stats">
                            <div class="shop-stat">ПЗ: 20</div>
                            <div class="shop-stat">Тип: Снаряжение</div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                ${isFreeMode ? 'БЕСПЛАТНО' : '100 уе'}
                            </span>
                            <button class="pill-button primary-button" onclick="event.stopPropagation(); buyBallisticShield()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                Купить
                            </button>
                        </div>
                    </div>
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

// Функции для магазина брони
function toggleArmorShopFreeMode() {
    window.armorShopFreeMode = !window.armorShopFreeMode;
    
    // Закрываем текущий модал и открываем новый с обновленными ценами
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
        showArmorShop();
    }
}

function buyArmor(name, price, os, type, catalogPrice = null) {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : price;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки ${name}.`);
        return;
    }
    
    // Показываем выбор части тела
    showArmorBodyPartSelection(name, price, os, type, catalogPrice, actualPrice);
}

// Функция выбора части тела для брони
function showArmorBodyPartSelection(name, price, os, type, catalogPrice, actualPrice) {
    document.body.style.overflow = 'hidden';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${getThemeColors().overlay};
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px; width: 90%;">
            <div class="modal-header">
                <h3>Куда надеть броню?</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.5rem;">${name}</div>
                    <div style="color: ${getThemeColors().text}; font-size: 0.9rem;">ОС: ${os} | ${type} броня</div>
                    <div style="color: ${getThemeColors().success}; font-weight: 600; margin-top: 0.5rem;">${actualPrice === 0 ? 'Бесплатно' : actualPrice + ' уе'}</div>
                </div>
                
                <div style="display: grid; gap: 1rem;">
                    <button class="armor-choice-button" onclick="confirmArmorPurchase('${name}', ${price}, ${os}, '${type}', ${catalogPrice}, ${actualPrice}, 'head')" style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="https://static.tildacdn.com/tild6636-3834-4834-b966-313837623333/military-hat.png" alt="🪖" style="width: 24px; height: 24px;">
                                <div>
                                    <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem;">Голова</div>
                                    <div style="color: ${getThemeColors().text}; font-size: 0.9rem;">Броня только для головы</div>
                                </div>
                            </div>
                            <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 1.1rem;">${actualPrice === 0 ? 'Бесплатно' : actualPrice + ' уе'}</div>
                        </div>
                    </button>
                    
                    <button class="armor-choice-button" onclick="confirmArmorPurchase('${name}', ${price}, ${os}, '${type}', ${catalogPrice}, ${actualPrice}, 'body')" style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease; text-align: left;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <img src="https://static.tildacdn.com/tild6438-3462-4437-b563-623536343337/armor.png" alt="🛡️" style="width: 24px; height: 24px;">
                                <div>
                                    <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 1.1rem; margin-bottom: 0.25rem;">Тело (включает Руки и Ноги)</div>
                                    <div style="color: ${getThemeColors().text}; font-size: 0.9rem;">3 предмета: Тело, Руки, Ноги</div>
                                </div>
                            </div>
                            <div style="color: ${getThemeColors().success}; font-weight: 600; font-size: 1.1rem;">${actualPrice === 0 ? 'Бесплатно' : actualPrice + ' уе'}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем эффекты наведения
    const buttons = modal.querySelectorAll('.armor-choice-button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(182, 103, 255, 0.2)';
            button.style.transform = 'translateY(-2px)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(182, 103, 255, 0.1)';
            button.style.transform = 'translateY(0)';
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

// Функция подтверждения покупки брони
function confirmArmorPurchase(name, price, os, type, catalogPrice, actualPrice, bodyPart) {
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
    if (bodyPart === 'body') {
        // Броня для тела = 3 предмета (тело, руки, ноги) по 1/3 цены каждый
        const piecePrice = Math.floor(actualPrice / 3);
        
        // Очищаем название от "для тела/корпуса/туловища"
        const cleanName = name.replace(/\s*(для\s+)?(тела|корпуса|туловища)/gi, '').trim();
        
        ['body', 'arms', 'legs'].forEach(part => {
            const armorPiece = {
                id: generateId('armor'),
                name: `${cleanName} (${part === 'body' ? 'Тело' : part === 'arms' ? 'Руки' : 'Ноги'})`,
                os: os,
                maxOS: os,
                type: type,
                bodyPart: part,
                price: piecePrice,
                catalogPrice: catalogPrice ? Math.floor(catalogPrice / 3) : piecePrice,
                purchasePrice: piecePrice,
                itemType: catalogPrice ? 'free_catalog' : 'purchased'
            };
            state.armorInventory.push(armorPiece);
        });
    } else {
        // Броня для головы
        const armorPiece = {
            id: generateId('armor'),
            name: `${name} (Голова)`,
            os: os,
            maxOS: os,
            type: type,
            bodyPart: 'head',
            price: actualPrice,
            catalogPrice: catalogPrice,
            purchasePrice: actualPrice,
            itemType: catalogPrice ? 'free_catalog' : 'purchased'
        };
        state.armorInventory.push(armorPiece);
    }
    
    // Логируем покупку
    if (actualPrice > 0) {
        addToRollLog('purchase', {
            item: name,
            price: actualPrice,
            category: 'Броня'
        });
    } else {
        addToRollLog('purchase', {
            item: name,
            price: 0,
            category: 'Броня (бесплатно)'
        });
    }
    
    // Обновляем инвентарь брони
    renderArmorInventory();
    scheduleSave();
    
    // Закрываем модал выбора
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    
    // Показываем уведомление об успешной покупке
    const message = bodyPart === 'body' ? 
        `${name} куплена! Добавлено 3 предмета в инвентарь брони.` : 
        `${name} добавлена в инвентарь брони!`;
    showToast(message, 3000);
}


function buyTitanicArmor(catalogPrice = null) {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : 20000;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки Титанической брони.`);
        return;
    }
    
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
    // Создаем броню для всех частей тела (голова + тело + руки + ноги)
    const piecePrice = Math.floor(actualPrice / 4); // Делим цену на 4 части (по 5000 уе за каждую)
    const cleanName = 'Титаническая';
    
    ['head', 'body', 'arms', 'legs'].forEach(part => {
        const armorPiece = {
            id: generateId('armor'),
            name: `${cleanName} (${part === 'head' ? 'Голова' : part === 'body' ? 'Тело' : part === 'arms' ? 'Руки' : 'Ноги'})`,
            os: 25,
            maxOS: 25,
            type: 'Титаническая',
            bodyPart: part,
            price: piecePrice,
            catalogPrice: catalogPrice ? Math.floor(catalogPrice / 4) : piecePrice,
            purchasePrice: piecePrice,
            itemType: catalogPrice ? 'free_catalog' : 'purchased'
        };
        state.armorInventory.push(armorPiece);
    });
    
    // Логируем покупку
    if (actualPrice > 0) {
        addToRollLog('purchase', {
            item: 'Титаническая броня (полный комплект)',
            price: actualPrice,
            category: 'Броня'
        });
    } else {
        addToRollLog('purchase', {
            item: 'Титаническая броня (полный комплект)',
            price: 0,
            category: 'Броня (бесплатно)'
        });
    }
    
    // Закрываем магазин
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Показываем уведомление
    showToast('Титаническая броня куплена! Добавлено 4 предмета в инвентарь брони.', 3000);
    
    // Обновляем отображение
    renderArmorInventory();
    scheduleSave();
}

function buyActiveArmor(catalogPrice = null) {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : 500;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки Активной брони.`);
        return;
    }
    
    // Закрываем магазин
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Показываем выбор типа ракет (покупка произойдет после выбора)
    showActiveArmorTypeSelection(actualPrice, catalogPrice);
}

// Функция отображения инвентаря брони
function renderArmorInventory() {
    const container = document.getElementById('armorInventoryContainer');
    const countElement = document.getElementById('armorInventoryCount');
    
    if (!state.armorInventory || state.armorInventory.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem; font-size: 0.85rem;">Купленная броня появится здесь</p>';
        if (countElement) countElement.textContent = '(0)';
        return;
    }
    
    if (countElement) countElement.textContent = `(${state.armorInventory.length})`;
    
    container.innerHTML = state.armorInventory.map(armor => {
        return `
        <div style="background: ${getThemeColors().bgLight}; border: 1px solid ${getThemeColors().border}; border-radius: 8px; padding: 0.75rem; position: relative;">
            <div style="padding-right: 4rem;">
                <div style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${armor.name}</div>
                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem; margin-bottom: 0.5rem;">
                    ${armor.type} | ОС: ${armor.os}/${armor.maxOS}
                </div>
            </div>
            <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.25rem; align-items: center;">
                <button onclick="equipArmorPiece('${armor.id}')" style="background: transparent; border: none; cursor: pointer; padding: 0.25rem;" title="Надеть${armor.originalBodyPart ? ' (только на ' + (armor.originalBodyPart === 'head' ? 'голову' : armor.originalBodyPart === 'body' ? 'тело' : armor.originalBodyPart === 'arms' ? 'руки' : 'ноги') + ')' : ''}">
                    <img src="https://static.tildacdn.com/tild6336-3965-4832-a231-623638336361/arrow.png" alt="↑" style="width: 20px; height: 20px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                </button>
                <button onclick="repairArmorPiece('${armor.id}')" style="background: transparent; border: none; cursor: pointer; padding: 0.25rem;" title="Починить">
                    <img src="https://static.tildacdn.com/tild6535-3132-4233-b731-356365363437/wrench.png" alt="🔧" style="width: 20px; height: 20px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                </button>
                <button onclick="removeArmorFromInventory('${armor.id}')" style="background: transparent; border: none; cursor: pointer; padding: 0.25rem;" title="Удалить">
                    <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" alt="×" style="width: 20px; height: 20px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'">
                </button>
            </div>
        </div>
    `;}).join('');
}

// Функция надевания брони из инвентаря
function equipArmorPiece(armorId) {
    const armorPiece = state.armorInventory.find(a => a.id === armorId);
    if (!armorPiece) return;
    
    // Если броня была снята с определенной части тела, можно надеть только на неё
    if (armorPiece.originalBodyPart) {
        confirmEquipArmor(armorId, armorPiece.originalBodyPart);
        return;
    }
    
    // Если у брони уже определена часть тела (при покупке), надеваем сразу на неё
    if (armorPiece.bodyPart) {
        confirmEquipArmor(armorId, armorPiece.bodyPart);
        return;
    }
    
    // Показываем выбор части тела только для брони без определенной части тела
    const bodyPartNames = {
        'head': 'Голова',
        'body': 'Тело',
        'arms': 'Руки',
        'legs': 'Ноги'
    };
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = 2000;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Куда надеть броню?</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">${armorPiece.name}</p>
                <p style="margin-bottom: 1rem; color: ${getThemeColors().muted}; font-size: 0.9rem;">Выберите часть тела:</p>
                <div style="display: grid; gap: 0.5rem;">
                    ${Object.entries(bodyPartNames).map(([part, label]) => `
                        <button class="pill-button primary-button" onclick="confirmEquipArmor('${armorId}', '${part}')" style="width: 100%;">
                            ${label}
                        </button>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button muted-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Подтверждение надевания брони
function confirmEquipArmor(armorId, bodyPart) {
    const armorPiece = state.armorInventory.find(a => a.id === armorId);
    if (!armorPiece) return;
    
    // Проверяем, есть ли уже надетая броня на этой части тела
    const currentArmor = state.armor[bodyPart];
    if (currentArmor && (currentArmor.os > 0 || (currentArmor.armorName && currentArmor.armorName.includes('Простые шмотки')))) {
        // Снимаем текущую броню и возвращаем в инвентарь с оригинальным названием
        // Удаляем часть тела из названия если она уже есть, чтобы добавить правильную
        let armorBaseName = currentArmor.armorName || `${currentArmor.type} броня`;
        // Убираем часть тела из названия если она там есть
        armorBaseName = armorBaseName.replace(/\s*\((Голова|Тело|Руки|Ноги)\)\s*$/, '');
        
        const bodyPartLabel = bodyPart === 'head' ? 'Голова' : 
                              bodyPart === 'body' ? 'Тело' : 
                              bodyPart === 'arms' ? 'Руки' : 'Ноги';
        
        const returnedArmor = {
            id: generateId('armor'),
            name: `${armorBaseName} (${bodyPartLabel})`,
            os: currentArmor.os,
            maxOS: getMaxOSForType(currentArmor.type),
            type: currentArmor.type,
            bodyPart: bodyPart,
            originalBodyPart: bodyPart, // Запоминаем откуда снята
            price: currentArmor.price || 0,
            catalogPrice: currentArmor.catalogPrice || null,
            purchasePrice: currentArmor.purchasePrice || 0,
            itemType: currentArmor.itemType || 'returned'
        };
        state.armorInventory.push(returnedArmor);
    }
    
    // Надеваем новую броню с сохранением всей информации
    state.armor[bodyPart] = {
        os: armorPiece.os,
        type: armorPiece.type,
        armorName: armorPiece.name, // Сохраняем оригинальное название
        price: armorPiece.price,
        catalogPrice: armorPiece.catalogPrice,
        purchasePrice: armorPiece.purchasePrice,
        itemType: armorPiece.itemType,
        activeDefense: false,
        activeDefenseType: 'Микроракеты'
    };
    
    // Обновляем UI поля ОС и типа брони
    const bodyPartCapitalized = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
    const osField = document.getElementById(`armor${bodyPartCapitalized}OS`);
    const typeField = document.getElementById(`armor${bodyPartCapitalized}Type`);
    
    if (osField) osField.value = armorPiece.os;
    if (typeField) {
        if (armorPiece.name.includes('Простые шмотки')) {
            typeField.textContent = 'Простые шмотки';
        } else {
            typeField.textContent = armorPiece.type;
        }
    }
    
    // Удаляем броню из инвентаря
    state.armorInventory = state.armorInventory.filter(a => a.id !== armorId);
    
    // Обновляем отображение
    renderArmorInventory();
    updateArmorRemoveButtons();
    updateArmorPenalty();
    scheduleSave();
    
    // Закрываем модал выбора части тела
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();
    
    showToast(`${armorPiece.name} надето!`, 2000);
}

// Вспомогательная функция для определения максимального ОС по типу брони
function getMaxOSForType(type) {
    switch(type) {
        case 'Лёгкая': return 10;
        case 'Средняя': return 15;
        case 'Тяжёлая': return 18;
        case 'Титаническая': return 25;
        default: return 10;
    }
}

// Функция починки брони
function repairArmorPiece(armorId) {
    const armorPiece = state.armorInventory.find(a => a.id === armorId);
    if (!armorPiece) return;
    
    // Создаем модал с инпутом для изменения ОС
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.zIndex = 2000;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Починить броню</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem;">${armorPiece.name}</p>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: ${getThemeColors().text};">Текущая ОС: ${armorPiece.os}/${armorPiece.maxOS}</label>
                    <label style="display: block; margin-bottom: 0.5rem; color: ${getThemeColors().text};">Установить новую ОС:</label>
                    <input type="number" id="newOS" value="${armorPiece.os}" min="0" max="${armorPiece.maxOS}" class="input-field" style="width: 100%;">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button muted-button" onclick="closeModal(this)">Отмена</button>
                <button class="pill-button primary-button" onclick="confirmRepairArmor('${armorId}')">Применить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Подтверждение починки
function confirmRepairArmor(armorId) {
    const newOS = parseInt(document.getElementById('newOS').value);
    const armorPiece = state.armorInventory.find(a => a.id === armorId);
    
    if (!armorPiece) return;
    
    armorPiece.os = Math.max(0, Math.min(newOS, armorPiece.maxOS));
    renderArmorInventory();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    console.log(`✅ ${armorPiece.name} отремонтирована! ОС: ${armorPiece.os}`);
}

// Удаление брони из инвентаря
function removeArmorFromInventory(armorId) {
    state.armorInventory = state.armorInventory.filter(a => a.id !== armorId);
    renderArmorInventory();
    scheduleSave();
}

// Функция снятия надетой брони
function removeEquippedArmor(bodyPart) {
    const currentArmor = state.armor[bodyPart];
    if (!currentArmor || currentArmor.os <= 0) return;
    
    // Возвращаем броню в инвентарь с оригинальным названием
    // Удаляем часть тела из названия если она уже есть, чтобы добавить правильную
    let armorBaseName = currentArmor.armorName || `${currentArmor.type} броня`;
    armorBaseName = armorBaseName.replace(/\s*\((Голова|Тело|Руки|Ноги)\)\s*$/, '');
    
    const bodyPartLabel = bodyPart === 'head' ? 'Голова' : 
                          bodyPart === 'body' ? 'Тело' : 
                          bodyPart === 'arms' ? 'Руки' : 'Ноги';
    
    const returnedArmor = {
        id: generateId('armor'),
        name: `${armorBaseName} (${bodyPartLabel})`,
        os: currentArmor.os,
        maxOS: getMaxOSForType(currentArmor.type),
        type: currentArmor.type,
        bodyPart: bodyPart,
        originalBodyPart: bodyPart, // Запоминаем откуда снята
        price: currentArmor.price || 0,
        catalogPrice: currentArmor.catalogPrice || null,
        purchasePrice: currentArmor.purchasePrice || 0,
        itemType: currentArmor.itemType || 'returned'
    };
    state.armorInventory.push(returnedArmor);
    
    // Обнуляем броню на части тела
    state.armor[bodyPart] = {
        os: 0,
        type: 'Лёгкая',
        activeDefense: false,
        activeDefenseType: 'Микроракеты'
    };
    
    // Обновляем UI
    const bodyPartCapitalized = bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1);
    const osField = document.getElementById(`armor${bodyPartCapitalized}OS`);
    const typeField = document.getElementById(`armor${bodyPartCapitalized}Type`);
    if (osField) osField.value = 0;
    if (typeField) typeField.textContent = '';
    
    renderArmorInventory();
    updateArmorRemoveButtons();
    updateArmorPenalty();
    scheduleSave();
    
    showToast(`Броня снята с ${bodyPart === 'head' ? 'головы' : bodyPart === 'body' ? 'тела' : bodyPart === 'arms' ? 'рук' : 'ног'}`, 2000);
}

// Функция обновления видимости кнопок "Снять" для брони
function updateArmorRemoveButtons() {
    const bodyParts = ['head', 'body', 'arms', 'legs'];
    
    bodyParts.forEach(part => {
        const button = document.getElementById(`removeArmor${part.charAt(0).toUpperCase() + part.slice(1)}`);
        const typeField = document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}Type`);
        const armor = state.armor[part];
        
        console.log(`Updating ${part}:`, armor);
        
        if (button) {
            const shouldShow = armor && (armor.os > 0 || (armor.armorName && armor.armorName.includes('Простые шмотки')));
            button.style.display = shouldShow ? 'block' : 'none';
            console.log(`Button for ${part}:`, shouldShow ? 'SHOW' : 'HIDE');
        }
        
        if (typeField) {
            if (armor && armor.armorName && armor.armorName.includes('Простые шмотки')) {
                typeField.textContent = 'Простые шмотки';
                console.log(`Type field for ${part}: Простые шмотки`);
            } else if (armor && armor.os > 0) {
                typeField.textContent = armor.type;
                console.log(`Type field for ${part}:`, armor.type);
            } else {
                typeField.textContent = '';
                console.log(`Type field for ${part}: EMPTY`);
            }
        }
    });
}

function showActiveArmorTypeSelection(actualPrice, catalogPrice = null) {
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
                <h3>Выберите тип</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <button class="pill-button primary-button" onclick="createActiveArmor('Микроракеты', ${actualPrice}, ${catalogPrice})" style="font-size: 1rem; padding: 1rem;">
                        Микроракеты
                    </button>
                    <button class="pill-button primary-button" onclick="createActiveArmor('Дробовая', ${actualPrice}, ${catalogPrice})" style="font-size: 1rem; padding: 1rem;">
                        Дробовая
                    </button>
                    <button class="pill-button primary-button" onclick="createActiveArmor('Лазерная', ${actualPrice}, ${catalogPrice})" style="font-size: 1rem; padding: 1rem;">
                        Лазерная
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
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

function createActiveArmor(rocketType, actualPrice, catalogPrice = null) {
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
    // Логируем покупку
    if (actualPrice > 0) {
        addToRollLog('purchase', {
            item: `Активная броня (${rocketType})`,
            price: actualPrice,
            category: 'Броня'
        });
    } else {
        addToRollLog('purchase', {
            item: `Активная броня (${rocketType})`,
            price: 0,
            category: 'Броня (бесплатно)'
        });
    }
    
    // Закрываем модал выбора
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Определяем урон в зависимости от типа ракет
    let damage = '6d6'; // По умолчанию для микроракет
    if (rocketType === 'Дробовая') {
        damage = '4d4'; // Пиропатрон наносит урон 4d4
    } else if (rocketType === 'Лазерная') {
        damage = '0'; // Лазер просто попадает без урона
    }
    
    // Создаем оружие "Активная броня" с правильными характеристиками
    const activeArmorWeapon = {
        id: generateId('weapon'),
        name: `Активная броня (${rocketType})`,
        customName: '',
        type: 'ranged',
        primaryDamage: damage,
        altDamage: null, // Нет альтернативного режима
        concealable: false, // Можно скрыть: нет
        hands: 0, // # рук: 0
        stealth: 1, // СКА: 1
        magazine: 1, // Патронов в магазине: 1
        price: actualPrice,
        load: 2,
        modules: [],
        slots: 0, // Нет слотов для модулей
        // Система магазина
        maxAmmo: 1,
        currentAmmo: 0, // Создается без боеприпасов внутри
        loadedAmmoType: null,
        // Не дробовик
        isShotgun: false,
        shotgunAmmo1: { type: null, count: 0 },
        shotgunAmmo2: { type: null, count: 0 },
        canRemove: true // Можно выкинуть
    };
    
    state.weapons.push(activeArmorWeapon);
    renderWeapons();
    
    showModal('Оружие добавлено', `✅ Активная броня (${rocketType}) добавлена в блок Оружие!`);
    scheduleSave();
}

function buyBallisticShield(catalogPrice = null) {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : 100;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки Пуленепробиваемого щита.`);
        return;
    }
    
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
    // Логируем покупку
    if (actualPrice > 0) {
        addToRollLog('purchase', {
            item: 'Пуленепробиваемый щит',
            price: actualPrice,
            category: 'Броня'
        });
    } else {
        addToRollLog('purchase', {
            item: 'Пуленепробиваемый щит',
            price: 0,
            category: 'Броня (бесплатно)'
        });
    }
    
    // Добавляем щит в снаряжение
    const shield = {
        id: generateId('gear'),
        name: 'Пуленепробиваемый щит',
        description: 'Щит, служащий укрытием, через которое можно смотреть. Требует 1 руку. Имеет 20 ПЗ.',
        load: 5,
        type: 'gear',
        hp: 20,
        currentHp: 20,
        isShield: true,
        catalogPrice: catalogPrice,
        purchasePrice: actualPrice,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.gear.push(shield);
    renderGear();
    updateLoadDisplay();
    
    // Закрываем магазин
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Показываем уведомление
    showModal('Покупка завершена', `✅ Пуленепробиваемый щит куплен и добавлен в снаряжение!`);
    
    scheduleSave();
}

console.log('✅ armor.js загружен - система брони готова');


