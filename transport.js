// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ТРАНСПОРТОМ
// Система транспорта: покупка, модули, характеристики, велосипед
// ============================================================================
//
// ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ:
// 
// 1. Покупка транспорта:
//    - Откройте магазин транспорта: showTransportShop()
//    - Фильтруйте по категориям (воздушный, наземный, водный)
//    - Нажмите "Купить" на нужном транспорте
//
// 2. Покупка модулей:
//    - Откройте магазин модулей: showTransportModulesShop()
//    - Модули добавляются в снаряжение
//    - Установите модули через "Управление модулями" на транспорте
//
// 3. Велосипед (уникальная сущность):
//    - Купите "СКЛАДНОЙ ВЕЛОСИПЕД" в снаряжении
//    - В блоке снаряжения переключите "Катить" (функция из gear.js)
//    - Велосипед появится в транспорте
//    - Скорость велосипеда = (Атлетика + Телосложение) / 2 + 5
//    - На велосипед можно установить только "Курсовое вооружение"
//
// 4. Управление модулями:
//    - Нажмите кнопку "🔧 Модули" на карточке транспорта
//    - Устанавливайте модули из снаряжения
//    - Модули с оружием имеют кнопку "🔫 Управление"
//    - Активная защита имеет кнопку "⚡ Заряды"
//
// 5. Система ОСП/ОС:
//    - Используйте кнопки +1/+10/-1/-10 для ОСП
//    - Используйте кнопки +1/+5/-1/-5 для ОС
//
// 6. Багажник и контрабанда:
//    - Кнопка "🎒 Багажник" - обычное хранилище (100 нагрузки)
//    - Кнопка "🕳️ Контрабанда" - скрытое хранилище (требует модуль)
//
// 7. ФУНКЦИИ ДЛЯ КОНСОЛИ (отладка):
//    - addTestVehicle() - добавить тестовый транспорт
//    - forceUpdateTransportUI() - обновить интерфейс
//    - saveTransportState() - сохранить в localStorage
//    - loadTransportState() - загрузить из localStorage
//
// ============================================================================

// transport.js loading...

// ============================================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ
// ============================================================================

// Контейнеры для рендеринга
const TRANSPORT_CONTAINER_ID = 'transportContainer';
const TRANSPORT_SHOP_MODAL_ID = 'transportShopModal';
const TRANSPORT_MODULES_MODAL_ID = 'transportModulesModal';

// Категории транспорта
const TRANSPORT_CATEGORIES = {
    AIR: 'air',
    GROUND: 'ground', 
    WATER: 'water'
};

// Категории модулей
const MODULE_CATEGORIES = {
    GROUND: 'ground',
    AIR: 'air',
    WATER: 'water',
    BICYCLE: 'Велосипед'
};

// Типы модулей
const MODULE_TYPES = {
    CHASSIS: 'chassis',
    ARMOR: 'armor',
    WEAPON: 'weapon',
    ENGINE: 'engine',
    UTILITY: 'utility'
};

// Состояния транспорта
const VEHICLE_STATES = {
    WORKING: 'working',
    DAMAGED: 'damaged',
    DESTROYED: 'destroyed'
};

// Цены ремонта (процент от стоимости транспорта)
const REPAIR_COSTS = {
    FULL_REPAIR: 0.1, // 10% от стоимости
    PARTIAL_REPAIR: 0.05 // 5% от стоимости
};

// ============================================================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================================================

// Функция инициализации системы транспорта
function initializeTransportSystem() {
    
    
    // Проверяем, есть ли данные о транспорте
    if (typeof VEHICLES_LIBRARY === 'undefined') {
        console.error('❌ VEHICLES_LIBRARY не определена! Проверьте, загружен ли data.js');
        return;
    }
    
    if (typeof VEHICLE_MODULES_LIBRARY === 'undefined') {
        console.error('❌ VEHICLE_MODULES_LIBRARY не определена! Проверьте, загружен ли data.js');
        return;
    }
    
    // Инициализируем массив транспорта если его нет
    if (!state.property.vehicles) {
        state.property.vehicles = [];
        
    }
    
    // Инициализируем поля для каждого транспорта
    state.property.vehicles.forEach(vehicle => {
        initializeVehicleFields(vehicle);
    });
    
    // Инициализируем систему велосипеда
    initializeBicycleSystem();
    
    
}

// Функция инициализации полей транспорта
function initializeVehicleFields(vehicle) {
    // Инициализируем ОСП
    if (!vehicle.hp) {
        vehicle.hp = 50; // Значение по умолчанию
    }
    if (vehicle.currentHp === undefined) {
        vehicle.currentHp = vehicle.hp;
    }
    
    // Инициализируем ОС
    if (vehicle.os === undefined) {
        vehicle.os = 0;
    }
    if (vehicle.currentOs === undefined) {
        vehicle.currentOs = vehicle.os;
    }
    
    // Инициализируем модули
    if (!vehicle.modules) {
        vehicle.modules = [];
    }
    
    // Инициализируем багажник
    if (!vehicle.trunk) {
        vehicle.trunk = {
            capacity: 100,
            items: []
        };
    }
    
    // Инициализируем контрабандное отделение
    if (!vehicle.smugglerCompartment) {
        vehicle.smugglerCompartment = {
            capacity: 100,
            items: []
        };
    }
    
    // Инициализируем базовые характеристики
    if (!vehicle.baseHp) {
        vehicle.baseHp = vehicle.hp;
    }
    if (!vehicle.baseSpeed) {
        vehicle.baseSpeed = vehicle.mechanicalSpeed || vehicle.speed || 0;
    }
    if (!vehicle.baseSeats) {
        vehicle.baseSeats = vehicle.seats || 1;
    }
}

// Функция инициализации системы велосипеда
function initializeBicycleSystem() {
    
    
    // Проверяем, есть ли велосипед в снаряжении
    const bicycle = state.gear?.find(item => item.name === 'СКЛАДНОЙ ВЕЛОСИПЕД');
    if (bicycle) {
        // Обновляем описание велосипеда
        bicycle.description = 'Складной велосипед, который можно разложить и использовать, как транспорт. Вместо педалей используется "магнитный захват" подошв обуви. Ботинки удерживаются магнитным полем катушки у цепи привода, и у водителя создаётся ощущение, что ноги стоят на педалях. Сделано это для экономии на педалях. Велосипед одноместный и не может быть бронирован, но на него можно установить курсовое вооружение.';
        
        // Добавляем уникальный идентификатор если его нет
        if (!bicycle.id) {
            bicycle.id = 'bicycle_' + Date.now();
        }
        
        // Добавляем флаг, что это велосипед
        bicycle.isBicycle = true;
        
        
    }
    
    
}

// Функция добавления велосипеда в транспорт
function addBicycleToTransport(bicycleId) {
    
    
    // Находим велосипед в снаряжении
    const bicycle = state.gear?.find(item => item.id === bicycleId && item.name === 'СКЛАДНОЙ ВЕЛОСИПЕД');
    if (!bicycle) {
        showToast('Велосипед не найден в снаряжении!', 2000);
        return;
    }
    
    // Проверяем, нет ли уже велосипеда в транспорте
    const existingBicycle = state.property.vehicles?.find(v => v.linkedGearId === bicycleId);
    if (existingBicycle) {
        showToast('Этот велосипед уже в транспорте!', 2000);
        return;
    }
    
    // Создаем транспорт на основе велосипеда
    const bicycleVehicle = {
        id: 'vehicle_bicycle_' + Date.now(),
        linkedGearId: bicycleId, // Связь со снаряжением
        name: 'СКЛАДНОЙ ВЕЛОСИПЕД',
        description: bicycle.description,
        category: 'ground',
        hp: 10,
        currentHp: 10,
        os: 0,
        currentOs: 0,
        seats: 1,
        mechanicalSpeed: calculateBicycleSpeed(),
        narrativeSpeed: `${calculateBicycleSpeed() * 8} км/ч`,
        price: bicycle.price || 500,
        modules: [],
        trunk: {
            capacity: 20, // У велосипеда маленький багажник
            items: []
        },
        baseHp: 10,
        baseSpeed: 0, // Скорость велосипеда всегда динамическая
        baseSeats: 1,
        isBicycle: true
    };
    
    // Инициализируем поля
    initializeVehicleFields(bicycleVehicle);
    
    // Добавляем в транспорт
    if (!state.property.vehicles) {
        state.property.vehicles = [];
    }
    state.property.vehicles.push(bicycleVehicle);
    
    // НЕ удаляем велосипед из снаряжения - он остается там
    
    // Показываем уведомление
    showToast('Велосипед разложен и готов к использованию!', 3000);
    
    // Обновляем интерфейс
    renderTransport();
    if (typeof renderGear === 'function') renderGear();
    
    // Сохраняем состояние
    scheduleSave();
}

// Функция удаления велосипеда из транспорта (сложить обратно)
function removeBicycleFromTransport(vehicleId) {
    
    
    // Находим велосипед
    const vehicleIndex = state.property.vehicles?.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1 || vehicleIndex === undefined) {
        showToast('Велосипед не найден!', 2000);
        return;
    }
    
    const vehicle = state.property.vehicles[vehicleIndex];
    
    // Проверяем, что это велосипед
    if (!vehicle.isBicycle && !vehicle.linkedGearId) {
        showToast('Это не велосипед!', 2000);
        return;
    }
    
    // Возвращаем модули в снаряжение
    if (vehicle.modules && vehicle.modules.length > 0) {
        vehicle.modules.forEach(module => {
            if (!state.gear) state.gear = [];
            state.gear.push(module);
        });
        showToast('Модули возвращены в снаряжение', 2000);
    }
    
    // Удаляем велосипед из транспорта
    state.property.vehicles.splice(vehicleIndex, 1);
    
    // Велосипед остается в снаряжении
    
    // Показываем уведомление
    showToast('Велосипед сложен и убран в снаряжение', 2000);
    
    // Обновляем интерфейс
    renderTransport();
    if (typeof renderGear === 'function') renderGear();
    
    // Сохраняем состояние
    scheduleSave();
}

// Функция расчета скорости велосипеда
function calculateBicycleSpeed() {
    const athletics = state.attributes?.Атлетика || 0;
    const physique = state.attributes?.Телосложение || 0;
    return Math.floor((athletics + physique) / 2) + 5; // Базовая скорость 5 + среднее атрибутов
}

// Функция рендеринга списка транспорта
function renderTransport() {
    
    
    // Инициализируем систему перед рендерингом
    initializeTransportSystem();
    
    const container = document.getElementById(TRANSPORT_CONTAINER_ID);
    if (!container) {
        console.error('❌ Контейнер транспорта не найден!');
        return;
    }
    
    if (!state.property.vehicles || state.property.vehicles.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: ${getThemeColors().muted};">
                <p style="margin-bottom: 1rem;">🚗 Транспорт не добавлен</p>
                <button onclick="showTransportShop()" class="pill-button primary-button" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                    Купить транспорт
                </button>
            </div>
        `;
        return;
    }
    
    // Добавляем кнопки управления
    const headerButtons = `
        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 1rem;">
            <button onclick="showTransportShop()" class="pill-button primary-button" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                Купить транспорт
            </button>
            <button onclick="showTransportModulesShop()" class="pill-button success-button" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                Купить модули
            </button>
        </div>
    `;
    
    // Рендерим карточки транспорта
    const transportCards = state.property.vehicles.map((vehicle, index) => 
        renderTransportCard(vehicle, index)
    ).join('');
    
    container.innerHTML = headerButtons + transportCards;
    
    
}

// Функция переключения сворачивания транспорта
function toggleTransportCollapse(vehicleId) {
    const contentElement = document.getElementById(`transport-content-${vehicleId}`);
    if (!contentElement) return;
    
    const isCurrentlyCollapsed = contentElement.style.display === 'none';
    const newState = !isCurrentlyCollapsed;
    
    // Сохраняем состояние в localStorage
    localStorage.setItem(`transport-${vehicleId}-collapsed`, newState.toString());
    
    // Переключаем отображение
    contentElement.style.display = newState ? 'none' : 'block';
}

// Функция создания карточки транспорта
function renderTransportCard(vehicle, index) {
    // Проверяем, является ли это велосипедом
    const isBicycle = vehicle.name === 'СКЛАДНОЙ ВЕЛОСИПЕД' || vehicle.linkedGearId;
    
    // Рассчитываем текущие характеристики с учетом модулей
    const currentStats = calculateVehicleStats(vehicle);
    
    // Проверяем состояние сворачивания из localStorage
    const isCollapsed = localStorage.getItem(`transport-${vehicle.id}-collapsed`) === 'true';
    
    return `
        <div class="vehicle-card shop-item">
            <div class="shop-item-header" style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4 class="shop-item-title" style="cursor: pointer;" onclick="toggleTransportCollapse('${vehicle.id}')">${vehicle.name}</h4>
                    ${isBicycle ? '<span style="background: rgba(255, 193, 7, 0.2); color: #ffc107; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: bold;">🚲 ВЕЛОСИПЕД</span>' : ''}
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="manageVehicleModules('${vehicle.id}')" style="background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" title="Модули" onmouseover="this.style.background='rgba(182, 103, 255, 0.1)'" onmouseout="this.style.background='none'">
                        <img src="https://static.tildacdn.com/tild6535-3132-4233-b731-356365363437/wrench.png" alt="Модули" style="width: 20px; height: 20px;">
                    </button>
                    <button onclick="manageVehicleTrunk('${vehicle.id}')" style="background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" title="Багажник" onmouseover="this.style.background='rgba(125, 244, 198, 0.1)'" onmouseout="this.style.background='none'">
                        <img src="https://static.tildacdn.com/tild6236-6432-4830-a337-666531333863/trunk.png" alt="Багажник" style="width: 20px; height: 20px;">
                    </button>
                    ${vehicle.modules?.some(m => m.name === 'Контрабандное отделение') ? `
                    <button onclick="manageSmugglerCompartment('${vehicle.id}')" style="background: none; border: none; cursor: pointer; padding: 0.5rem; border-radius: 4px; transition: background 0.2s;" title="Контрабанда" onmouseover="this.style.background='rgba(255, 193, 7, 0.1)'" onmouseout="this.style.background='none'">
                        <span style="font-size: 20px;">🕳️</span>
                    </button>
                    ` : ''}
                </div>
            </div>
            
            <div id="transport-content-${vehicle.id}" style="display: ${isCollapsed ? 'none' : 'block'};">
                <p class="shop-item-description">
                    ${vehicle.description}
                </p>
                
                <div class="shop-item-stats">
                    <div class="shop-stat">Мест: ${currentStats.seats}</div>
                    ${!isBicycle ? `<div class="shop-stat">Скорость: ${currentStats.speed}</div>` : ''}
                    ${!vehicle.linkedGearId ? `<div class="shop-stat">ОСП: ${vehicle.currentHp}/${currentStats.maxHp}</div>` : ''}
                    ${currentStats.os > 0 ? `<div class="shop-stat">ОС: ${vehicle.currentOs || 0}/${currentStats.os}</div>` : ''}
                </div>
                
                <!-- Модули -->
                ${vehicle.modules && vehicle.modules.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">🔧 Установленные модули:</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.3rem;">
                        ${vehicle.modules.map(module => {
                            let extraInfo = '';
                            if (module.charges !== undefined) {
                                extraInfo = ` (${module.charges}/${module.maxCharges})`;
                            } else if (module.weapons) {
                                extraInfo = ` (${module.weapons.length}/${module.maxWeapons || 1})`;
                            }
                            return `
                                <span style="background: ${getThemeColors().accentLight}; color: ${getThemeColors().accent}; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem;">
                                    ${module.name}${extraInfo}
                                </span>
                            `;
                        }).join('')}
                    </div>
                    <!-- Отображение оружия в модулях вооружения -->
                    ${vehicle.modules.some(m => m.weapons && m.weapons.length > 0) ? `
                        <div style="margin-top: 0.5rem;">
                            ${vehicle.modules.filter(m => m.weapons && m.weapons.length > 0).map(module => `
                                <div style="margin-bottom: 0.5rem;">
                                    <div style="color: ${getThemeColors().accent}; font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">🔫 ${module.name}:</div>
                                    ${module.weapons.map(weapon => renderVehicleModuleWeapon(weapon, vehicle.id, vehicle.modules.indexOf(module))).join('')}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            
            <!-- Прогресс-бары ОСП и ОС (только для обычного транспорта) -->
            ${!vehicle.linkedGearId ? `
            <div style="margin-bottom: ${isCollapsed ? '0' : '1rem'}; padding-bottom: ${isCollapsed ? '0' : '0.5rem'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">ОСП: ${vehicle.currentHp}/${currentStats.maxHp}</span>
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="adjustVehicleHP('${vehicle.id}', -10)" class="btn-small danger">-10</button>
                        <button onclick="adjustVehicleHP('${vehicle.id}', -1)" class="btn-small danger">-1</button>
                        <button onclick="adjustVehicleHP('${vehicle.id}', 1)" class="btn-small success">+1</button>
                        <button onclick="adjustVehicleHP('${vehicle.id}', 10)" class="btn-small success">+10</button>
                    </div>
                </div>
                <div style="background: rgba(220, 53, 69, 0.2); border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="
                        background: linear-gradient(90deg, #dc3545, #ff6b7a);
                        height: 100%;
                        width: ${Math.max(0, Math.min((vehicle.currentHp / currentStats.maxHp) * 100, 100))}%;
                        transition: width 0.3s ease;
                    "></div>
                </div>
            ` : ''}
                
                ${currentStats.os > 0 ? `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: ${isCollapsed ? '0.25rem 0 0.25rem 0' : '0.5rem 0 0.25rem 0'};">
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">ОС: ${vehicle.currentOs || 0}/${currentStats.os}</span>
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="adjustVehicleOS('${vehicle.id}', -5)" class="btn-small danger">-5</button>
                        <button onclick="adjustVehicleOS('${vehicle.id}', -1)" class="btn-small danger">-1</button>
                        <button onclick="adjustVehicleOS('${vehicle.id}', 1)" class="btn-small success">+1</button>
                        <button onclick="adjustVehicleOS('${vehicle.id}', 5)" class="btn-small success">+5</button>
                    </div>
                </div>
                <div style="background: rgba(108, 117, 125, 0.2); border-radius: 10px; height: 8px; overflow: hidden;">
                    <div style="
                        background: linear-gradient(90deg, #6c757d, #adb5bd);
                        height: 100%;
                        width: ${Math.max(0, Math.min(((vehicle.currentOs || 0) / currentStats.os) * 100, 100))}%;
                        transition: width 0.3s ease;
                    "></div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Функция получения иконки категории
function getCategoryIcon(category) {
    const icons = {
        'air': '✈️',
        'ground': '🚗', 
        'water': '🚢'
    };
    return icons[category] || '🚗';
}

// Функция расчета характеристик транспорта с учетом модулей
function calculateVehicleStats(vehicle) {
    // Базовые характеристики
    let seats = vehicle.baseSeats || vehicle.seats || 1;
    let speed = vehicle.baseSpeed || vehicle.mechanicalSpeed || vehicle.speed || 0;
    let maxHp = vehicle.hp || vehicle.baseHp || 0;
    let os = vehicle.os || vehicle.baseOs || 0;
    
    // Для велосипеда рассчитываем скорость на основе атрибутов
    if (vehicle.name === 'СКЛАДНОЙ ВЕЛОСИПЕД' || vehicle.linkedGearId) {
        const athletics = state.attributes?.Атлетика || 0;
        const physique = state.attributes?.Телосложение || 0;
        speed = Math.floor((athletics + physique) / 2) + 5; // Базовая скорость + среднее атрибутов
    }
    
    // Применяем эффекты модулей
    if (vehicle.modules) {
        let hasReinforcedChassis = false;
        let hasLightChassis = false;
        let hasBodyArmor = false;
        let hasBodyReinforcement = false;
        let engineStage = 0; // 0 = нет, 1 = стадия 1, 2 = стадия 2, 3 = стадия 3
        
        vehicle.modules.forEach(module => {
            switch (module.name) {
                case 'Укрепленное шасси':
                    maxHp += 20;
                    hasReinforcedChassis = true;
                    break;
                    
                case 'Облегчённое шасси':
                    speed += 10; // +10 СКО (50 км/ч)
                    hasLightChassis = true;
                    break;
                    
                case 'Бронестёкла':
                    maxHp += 20;
                    break;
                    
                case 'Бронирование корпуса':
                    os += 18;
                    speed -= 10; // -10 СКО (80 км/ч)
                    hasBodyArmor = true;
                    break;
                    
                case 'Усиление корпуса':
                    os += 10;
                    hasBodyReinforcement = true;
                    break;
                    
                case 'Форсированный двигатель (Стадия 1)':
                    if (engineStage === 0) {
                        speed += 5; // +5 СКО (40 км/ч)
                        engineStage = 1;
                    }
                    break;
                    
                case 'Форсированный двигатель (Стадия 2)':
                    if (engineStage <= 1) {
                        speed += 10; // +10 СКО (80 км/ч) от заводских
                        engineStage = 2;
                    }
                    break;
                    
                case 'Форсированный двигатель (Стадия 3)':
                    if (engineStage <= 2) {
                        speed += 13; // +13 СКО (102 км/ч) от заводских
                        engineStage = 3;
                    }
                    break;
                    
                case 'Дополнительные сиденья':
                    seats += 2;
                    break;
            }
        });
        
        // Проверяем конфликты модулей
        if (hasBodyArmor && hasBodyReinforcement) {
            console.warn('Конфликт модулей: Бронирование корпуса и Усиление корпуса не могут быть установлены одновременно');
        }
        
        if (hasReinforcedChassis && hasLightChassis) {
            console.warn('Конфликт модулей: Укрепленное шасси и Облегчённое шасси не могут быть установлены одновременно');
        }
    }
    
    return {
        seats: Math.max(1, seats),
        speed: Math.max(0, speed),
        maxHp: Math.max(1, maxHp),
        os: Math.max(0, os)
    };
}

// ============================================================================
// МАГАЗИН ТРАНСПОРТА
// ============================================================================

// Функция показа магазина транспорта
function showTransportShop() {
    
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0; display: flex; align-items: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild3130-6637-4132-a334-663633373435/car.png" alt="🚗" style="width: 24px; height: 24px;"> Магазин транспорта</h3>
                <button onclick="closeTransportShop()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Фильтры категорий -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <button onclick="filterTransportCategory('ground')" class="pill-button primary-button category-filter active" data-category="ground">
                        Наземный
                    </button>
                    <button onclick="filterTransportCategory('air')" class="pill-button primary-button category-filter" data-category="air">
                        Воздушный
                    </button>
                    <button onclick="filterTransportCategory('water')" class="pill-button primary-button category-filter" data-category="water">
                        Водный
                    </button>
                </div>
                
                <!-- Список транспорта -->
                <div id="transportShopList" class="shop-items-grid">
                    ${renderTransportShopItems()}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
    
    
}

// Функция рендеринга товаров в магазине
function renderTransportShopItems(category = 'ground') {
    let vehicles = [];
    
    // Собираем весь транспорт из библиотеки
    Object.values(VEHICLES_LIBRARY).forEach(categoryVehicles => {
        vehicles = vehicles.concat(categoryVehicles);
    });
    
    // Фильтруем по категории
    if (category !== 'all') {
        vehicles = vehicles.filter(vehicle => vehicle.category === category);
    }
    
    return vehicles.map(vehicle => renderTransportShopItem(vehicle)).join('');
}

// Функция рендеринга одного товара в магазине
function renderTransportShopItem(vehicle) {
    const price = typeof vehicle.price === 'string' ? parseInt(vehicle.price.split('-')[0]) : vehicle.price;
    
    // Рассчитываем скидку от "Друга семьи"
    const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
    const familyFriendDiscount = familyFriendLevel * 10;
    const totalDiscount = Math.min(familyFriendDiscount / 100, 1.0);
    const finalPrice = Math.floor(price * (1 - totalDiscount));
    
    const canAfford = state.money >= finalPrice;
    const isOwned = state.property.vehicles?.some(v => v.name === vehicle.name);
    const isBicycle = vehicle.name === 'СКЛАДНОЙ ВЕЛОСИПЕД' || vehicle.linkedGearId;
    
    return `
        <div class="shop-item">
            <div class="shop-item-header">
                <h4 class="shop-item-title">${vehicle.name}</h4>
            </div>
            
            <p class="shop-item-description">
                ${vehicle.description}
            </p>
            
            <div class="shop-item-stats">
                <div class="shop-stat">Мест: ${vehicle.seats || 1}</div>
                ${!isBicycle ? `<div class="shop-stat">Скорость: ${vehicle.mechanicalSpeed || vehicle.speed || 0}</div>` : ''}
                <div class="shop-stat">ОСП: ${vehicle.hp || 50}</div>
                ${vehicle.os ? `<div class="shop-stat">ОС: ${vehicle.os}</div>` : ''}
            </div>
            
            <div class="shop-item-price">
                ${totalDiscount > 0 && finalPrice < price ? 
                    `<span style="text-decoration: line-through; color: var(--muted);">${price.toLocaleString()}</span> <span style="color: var(--success); font-weight: 600;">${finalPrice.toLocaleString()}</span> <span style="color: var(--success); font-size: 0.8rem;">(-${Math.round(totalDiscount * 100)}%)</span> €` :
                    `${price.toLocaleString()} €`}
            </div>
            
            ${isOwned ? `
                <button class="shop-item-available-btn">
                    В наличии
                </button>
            ` : `
                <button 
                    class="shop-item-buy-btn"
                    onclick="buyTransport('${vehicle.name}', ${finalPrice})"
                    ${!canAfford ? 'disabled' : ''}
                >
                    Купить
                </button>
            `}
        </div>
    `;
}

// Функция фильтрации транспорта по категории
function filterTransportCategory(category) {
    
    
    // Обновляем активную кнопку
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
    
    // Обновляем список товаров
    const shopList = document.getElementById('transportShopList');
    if (shopList) {
        shopList.innerHTML = renderTransportShopItems(category);
    }
}

// Функция закрытия магазина транспорта
function closeTransportShop() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Функция покупки транспорта
function buyTransport(vehicleName, price) {
    
    
    // Проверяем, достаточно ли денег
    if (state.money < price) {
        showToast('Недостаточно средств!', 2000);
        return;
    }
    
    // Проверяем, нет ли уже такого транспорта
    const existingVehicle = state.property.vehicles?.find(v => v.name === vehicleName);
    if (existingVehicle) {
        showToast('У вас уже есть этот транспорт!', 2000);
        return;
    }
    
    // Находим транспорт в библиотеке
    let vehicleData = null;
    Object.values(VEHICLES_LIBRARY).forEach(categoryVehicles => {
        const found = categoryVehicles.find(v => v.name === vehicleName);
        if (found) vehicleData = found;
    });
    
    if (!vehicleData) {
        showToast('Транспорт не найден в каталоге!', 2000);
        return;
    }
    
    // Создаем новый транспорт
    const newVehicle = {
        id: generateVehicleId(),
        name: vehicleData.name,
        description: vehicleData.description,
        category: vehicleData.category,
        hp: vehicleData.hp || 50,
        currentHp: vehicleData.hp || 50,
        os: vehicleData.os || 0,
        currentOs: vehicleData.os || 0,
        seats: vehicleData.seats || 1,
        mechanicalSpeed: vehicleData.mechanicalSpeed || vehicleData.speed || 0,
        narrativeSpeed: vehicleData.narrativeSpeed || '',
        price: price,
        catalogPrice: vehicleData.price || price, // Цена по каталогу
        purchasePrice: price, // Цена покупки (с учетом скидок)
        itemType: 'purchased', // Тип предмета
        modules: [],
        trunk: {
            capacity: 100,
            items: []
        },
        smugglerCompartment: {
            capacity: 100,
            items: []
        },
        baseHp: vehicleData.hp || 50,
        baseSpeed: vehicleData.mechanicalSpeed || vehicleData.speed || 0,
        baseSeats: vehicleData.seats || 1
    };
    
    // Инициализируем поля
    initializeVehicleFields(newVehicle);
    
    // Добавляем в массив транспорта
    if (!state.property.vehicles) {
        state.property.vehicles = [];
    }
    state.property.vehicles.push(newVehicle);
    
    // Списываем деньги
    state.money -= price;
    
    // Показываем уведомление
    showToast(`Куплен ${vehicleName} за ${price.toLocaleString()} уе`, 3000);
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: vehicleName,
        price: price,
        category: 'Транспорт'
    });
    
    // Обновляем интерфейс
    updateMoneyDisplay();
    renderTransport();
    
    // Обновляем магазин
    const shopList = document.getElementById('transportShopList');
    if (shopList) {
        shopList.innerHTML = renderTransportShopItems();
    }
    
    // Сохраняем состояние
    scheduleSave();
}

// Функция генерации уникального ID для транспорта
function generateVehicleId() {
    return 'vehicle_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Функция продажи транспорта
function sellTransport(vehicleId) {
    
    
    // Находим транспорт
    const vehicleIndex = state.property.vehicles?.findIndex(v => v.id === vehicleId);
    if (vehicleIndex === -1 || vehicleIndex === undefined) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    const vehicle = state.property.vehicles[vehicleIndex];
    
    // Рассчитываем цену продажи (70% от покупной цены)
    const sellPrice = Math.floor((vehicle.price || 10000) * 0.7);
    
    // Показываем подтверждение
    const confirmMessage = `Продать "${vehicle.name}" за ${sellPrice.toLocaleString()} уе?\n\nВсе модули и предметы в багажнике будут потеряны!`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Возвращаем модули в снаряжение (если они есть)
    if (vehicle.modules && vehicle.modules.length > 0) {
        vehicle.modules.forEach(module => {
            if (!state.gear) state.gear = [];
            state.gear.push(module);
        });
        showToast(`Модули возвращены в снаряжение`, 2000);
    }
    
    // Возвращаем предметы из багажника в снаряжение
    if (vehicle.trunk && vehicle.trunk.items && vehicle.trunk.items.length > 0) {
        vehicle.trunk.items.forEach(item => {
            if (!state.gear) state.gear = [];
            state.gear.push(item);
        });
        showToast(`Предметы из багажника возвращены в снаряжение`, 2000);
    }
    
    // Удаляем транспорт из массива
    state.property.vehicles.splice(vehicleIndex, 1);
    
    // Добавляем деньги
    state.money += sellPrice;
    
    // Показываем уведомление
    showToast(`Продан ${vehicle.name} за ${sellPrice.toLocaleString()} уе`, 3000);
    
    // Обновляем интерфейс
    updateMoneyDisplay();
    renderTransport();
    renderGear();
    scheduleSave();
    
    
}

// ============================================================================
// МАГАЗИН МОДУЛЕЙ ТРАНСПОРТА
// ============================================================================

// Функция показа магазина модулей
function showTransportModulesShop() {
    
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0; display: flex; align-items: center; gap: 0.5rem;"><img src="https://static.tildacdn.com/tild6361-6565-4764-b437-306433303764/car-check_1.png" alt="🔧" style="width: 24px; height: 24px;"> Магазин модулей транспорта</h3>
                <button onclick="closeTransportModulesShop()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Фильтры категорий -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <button onclick="filterModuleCategory('ground')" class="pill-button primary-button module-category-filter active" data-category="ground">
                        Наземный
                    </button>
                    <button onclick="filterModuleCategory('air')" class="pill-button primary-button module-category-filter" data-category="air">
                        Воздушный
                    </button>
                    <button onclick="filterModuleCategory('water')" class="pill-button primary-button module-category-filter" data-category="water">
                        Водный
                    </button>
                </div>
                
                <!-- Список модулей -->
                <div id="transportModulesShopList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                    ${renderTransportModulesShopItems()}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем стили для фильтров
    const style = document.createElement('style');
    style.textContent = `
        .module-category-filter.active {
            background: var(--accent) !important;
            color: white !important;
        }
    `;
    document.head.appendChild(style);
    
    
}

// Функция рендеринга товаров в магазине модулей
function renderTransportModulesShopItems(category = 'ground') {
    let modules = [];
    
    // Собираем все модули из библиотеки
    Object.values(VEHICLE_MODULES_LIBRARY).forEach(categoryModules => {
        modules = modules.concat(categoryModules);
    });
    
    // Фильтруем по категории
    if (category !== 'all') {
        modules = modules.filter(module => module.category === category);
    }
    
    return modules.map(module => renderTransportModuleShopItem(module)).join('');
}

// Функция рендеринга одного модуля в магазине
function renderTransportModuleShopItem(module) {
    const canAfford = state.money >= module.price;
    const isOwned = state.gear?.some(item => item.name === module.name);
    
    return `
        <div class="shop-item">
            <div class="shop-item-header">
                <h4 class="shop-item-title">${module.name}</h4>
            </div>
            
            <p class="shop-item-description">
                ${module.description}
            </p>
            
            ${module.requirements && module.requirements.length > 0 ? `
            <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 6px; padding: 0.5rem; margin-bottom: 1rem;">
                <div style="font-size: 0.8rem; color: #ffc107; font-weight: bold;">⚠️ Требования:</div>
                <div style="font-size: 0.75rem; color: ${getThemeColors().text};">${module.requirements.join(', ')}</div>
            </div>
            ` : ''}
            
            <div class="shop-item-price">
                ${module.price.toLocaleString()}
            </div>
            
            ${isOwned ? `
                <button class="shop-item-available-btn">
                    В наличии
                </button>
            ` : `
                <button 
                    class="shop-item-buy-btn"
                    onclick="buyTransportModule('${module.name}', ${module.price}, '${module.category}')"
                    ${!canAfford ? 'disabled' : ''}
                >
                    Купить
                </button>
            `}
        </div>
    `;
}

// Функция фильтрации модулей по категории
function filterModuleCategory(category) {
    
    
    // Обновляем активную кнопку
    document.querySelectorAll('.module-category-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.module-category-filter[data-category="${category}"]`).classList.add('active');
    
    // Обновляем список товаров
    const shopList = document.getElementById('transportModulesShopList');
    if (shopList) {
        shopList.innerHTML = renderTransportModulesShopItems(category);
    }
}

// Функция закрытия магазина модулей
function closeTransportModulesShop() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Функция покупки модуля транспорта
function buyTransportModule(moduleName, price, category) {
    console.log(`💰 Покупка модуля: ${moduleName} за ${price} уе (категория: ${category})`);
    
    // Проверяем, достаточно ли денег
    if (state.money < price) {
        showToast('Недостаточно средств!', 2000);
        return;
    }
    
    // Находим модуль в библиотеке по категории
    const vehicleType = category;
    const categoryModules = VEHICLE_MODULES_LIBRARY[category];
    
    if (!categoryModules) {
        showToast('Категория не найдена!', 2000);
        return;
    }
    
    const moduleData = categoryModules.find(m => m.name === moduleName);
    
    if (!moduleData) {
        showToast('Модуль не найден в каталоге!', 2000);
        return;
    }
    
    // Определяем тип транспорта на русском
    const vehicleTypeRu = {
        'ground': 'Наземный',
        'air': 'Воздушный',
        'water': 'Водный'
    }[vehicleType] || 'Неизвестный';
    
    // Создаем новый модуль
    const newModule = {
        id: generateId('vehicleModule'),
        name: moduleData.name,
        description: moduleData.description,
        price: price,
        category: moduleData.category,
        requirements: moduleData.requirements || [],
        vehicleType: vehicleType, // Тип транспорта (ground, air, water)
        vehicleTypeRu: vehicleTypeRu, // Тип транспорта на русском
        weight: 10, // Нагрузка модуля (10 в инвентаре, 0 на транспорте)
        isInstalled: false // Установлен ли модуль на транспорт
    };
    
    // Добавляем в массив модулей транспорта
    if (!state.vehicleModules) state.vehicleModules = [];
    state.vehicleModules.push(newModule);
    
    // Списываем деньги
    state.money -= price;
    
    // Показываем уведомление
    showToast(`Куплен модуль "${moduleName}" (${vehicleTypeRu}) за ${price.toLocaleString()} уе`, 3000);
    
    // Обновляем интерфейс
    updateMoneyDisplay();
    renderVehicleModulesInventory();
    
    // Обновляем магазин
    const shopList = document.getElementById('transportModulesShopList');
    if (shopList) {
        const currentCategory = document.querySelector('.module-category-filter.active')?.dataset.category || 'ground';
        shopList.innerHTML = renderTransportModulesShopItems(currentCategory);
    }
    
    scheduleSave();
    
    
}

// ============================================================================
// УПРАВЛЕНИЕ МОДУЛЯМИ ТРАНСПОРТА
// ============================================================================

// Функция переключения сворачивания модуля
function toggleModuleCollapse(moduleId) {
    const contentElement = document.getElementById(`module-content-${moduleId}`);
    if (!contentElement) return;
    
    const isCurrentlyCollapsed = contentElement.style.display === 'none';
    const newState = !isCurrentlyCollapsed;
    
    // Сохраняем состояние в localStorage
    localStorage.setItem(`module-${moduleId}-collapsed`, newState.toString());
    
    // Переключаем отображение
    contentElement.style.display = newState ? 'none' : 'block';
}

// Функция рендеринга инвентаря модулей транспорта
function renderVehicleModulesInventory() {
    const container = document.getElementById('vehicleModulesContainer');
    if (!container) return;
    
    if (!state.vehicleModules || state.vehicleModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Модули не добавлены</p>';
        return;
    }
    
    // Фильтруем только не установленные модули
    const uninstalledModules = state.vehicleModules.filter(m => !m.isInstalled);
    
    if (uninstalledModules.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Все модули установлены на транспорт</p>';
        return;
    }
    
    container.innerHTML = uninstalledModules.map(module => {
        // Проверяем состояние сворачивания из localStorage
        const isCollapsed = localStorage.getItem(`module-${module.id}-collapsed`) === 'true';
        
        return `
            <div class="shop-item" style="margin-bottom: 1rem;">
                <div class="shop-item-header">
                    <h4 class="shop-item-title" style="cursor: pointer;" onclick="toggleModuleCollapse('${module.id}')">${module.name}</h4>
                </div>
                
                <div id="module-content-${module.id}" style="display: ${isCollapsed ? 'none' : 'block'};">
                    <p class="shop-item-description" style="margin-bottom: 0.5rem;">
                        ${module.description}
                    </p>
                    
                    <div style="padding-top: 0.5rem; border-top: 1px solid var(--border);">
                        <div style="display: flex; flex-direction: column; gap: 0.25rem;">
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>Тип транспорта:</strong> ${module.vehicleTypeRu}
                            </span>
                            <span style="font-size: 0.85rem; color: var(--text-secondary);">
                                <strong>Нагрузка:</strong> ${module.weight.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Функция продажи модуля транспорта
function sellVehicleModule(moduleId) {
    
    
    // Находим модуль
    const moduleIndex = state.vehicleModules.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = state.vehicleModules[moduleIndex];
    const sellPrice = Math.floor(module.price * 0.5);
    
    // Удаляем модуль из массива
    state.vehicleModules.splice(moduleIndex, 1);
    
    // Добавляем деньги
    state.money += sellPrice;
    
    // Показываем уведомление
    showToast(`Модуль "${module.name}" продан за ${sellPrice.toLocaleString()} уе`, 2000);
    
    // Обновляем интерфейс
    updateMoneyDisplay();
    renderVehicleModulesInventory();
    
    scheduleSave();
    
    
}

// Функция открытия модала управления модулями транспорта
function manageVehicleModules(vehicleId) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'vehicleModulesModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0;">🔧 Управление модулями: ${vehicle.name}</h3>
                <button onclick="closeVehicleModulesModal()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Установленные модули -->
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Установленные модули</h4>
                    <div id="installedModulesList">
                        ${renderInstalledModules(vehicle)}
                    </div>
                </div>
                
                <!-- Доступные модули -->
                <div>
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Доступные модули в снаряжении</h4>
                    <div id="availableModulesList">
                        ${renderAvailableModules(vehicle)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
}

// Функция рендеринга установленных модулей
function renderInstalledModules(vehicle) {
    if (!vehicle.modules || vehicle.modules.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Модули не установлены</p>';
    }
    
    return vehicle.modules.map((module, index) => {
        // Определяем дополнительные кнопки для специальных модулей
        let specialButton = '';
        
        if (module.name === 'Курсовое вооружение' || module.name === 'Турельное вооружение' || 
            module.name === 'Крепление для тяжелого оружия' || module.name === 'Ракетный аппарат') {
            specialButton = `
                <button 
                    onclick="manageCourseWeapon('${vehicle.id}', ${index})"
                    class="pill-button primary-button"
                    style="font-size: 0.7rem; padding: 0.3rem 0.6rem; margin-right: 0.3rem;"
                >
                    🔫 Управление (${module.weapons?.length || 0}/${module.maxWeapons || 1})
                </button>
            `;
        } else if (module.name === 'Активная защита') {
            specialButton = `
                <button 
                    onclick="manageActiveDefense('${vehicle.id}', ${index})"
                    class="pill-button warning-button"
                    style="font-size: 0.7rem; padding: 0.3rem 0.6rem; margin-right: 0.3rem;"
                >
                    ⚡ Заряды (${module.charges || 0}/${module.maxCharges || 100})
                </button>
            `;
        }
        
        return `
            <div style="
                background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
                border: 2px solid #28a745;
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h5 style="color: #28a745; margin: 0 0 0.5rem 0;">✅ ${module.name}</h5>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0;">${module.description}</p>
                    </div>
                    <div style="display: flex; gap: 0.3rem;">
                        ${specialButton}
                        <button 
                            onclick="uninstallVehicleModule('${vehicle.id}', ${index})"
                            class="pill-button danger-button"
                            style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                        >
                            ❌ Снять
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Функция рендеринга доступных модулей
function renderAvailableModules(vehicle) {
    // Получаем модули из инвентаря модулей транспорта
    const isBicycle = vehicle.name === 'СКЛАДНОЙ ВЕЛОСИПЕД' || vehicle.linkedGearId;
    let availableModules = state.vehicleModules?.filter(module => {
        // Пропускаем уже установленные модули
        if (module.isInstalled) return false;
        
        // Для велосипеда только курсовое вооружение
        if (isBicycle) {
            return module.name === 'Курсовое вооружение';
        }
        
        // Для обычного транспорта проверяем тип (ground, air, water)
        return module.vehicleType === vehicle.category;
    }) || [];
    
    if (availableModules.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Нет доступных модулей в инвентаре</p>';
    }
    
    return availableModules.map((module) => `
        <div style="
            background: linear-gradient(135deg, rgba(182, 103, 255, 0.1) 0%, rgba(182, 103, 255, 0.05) 100%);
            border: 2px solid var(--accent);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h5 style="color: ${getThemeColors().accent}; margin: 0 0 0.5rem 0;">🔧 ${module.name}</h5>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0;">${module.description}</p>
                    ${module.requirements && module.requirements.length > 0 ? `
                    <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 6px; padding: 0.3rem; margin-top: 0.5rem;">
                        <div style="font-size: 0.75rem; color: #ffc107;">⚠️ Требования: ${module.requirements.join(', ')}</div>
                    </div>
                    ` : ''}
                </div>
                <button 
                    onclick="installVehicleModuleFromInventory('${vehicle.id}', '${module.id}')"
                    class="pill-button success-button"
                    style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                >
                    ➕ Установить
                </button>
            </div>
        </div>
    `).join('');
}

// Функция установки модуля на транспорт из инвентаря
function installVehicleModuleFromInventory(vehicleId, moduleId) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Находим модуль в инвентаре
    const moduleInventoryIndex = state.vehicleModules.findIndex(m => m.id === moduleId);
    if (moduleInventoryIndex === -1) {
        showToast('Модуль не найден в инвентаре!', 2000);
        return;
    }
    
    const module = state.vehicleModules[moduleInventoryIndex];
    
    // Проверяем навыки для установки
    const transportSkillLevel = state.skills.find(s => s.name === 'Транспорт')?.level || 0;
    const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
    
    // Если есть навык Транспорт 4+ или Друг семьи - бесплатная установка
    if (transportSkillLevel >= 4 || familyFriendLevel > 0) {
        installVehicleModuleDirectly(vehicleId, moduleId, 0);
        return;
    }
    
    // Иначе показываем диалог с выбором способа установки
    showVehicleModuleInstallDialog(vehicleId, moduleId, module);
}

// Функция показа диалога установки модуля транспорта
function showVehicleModuleInstallDialog(vehicleId, moduleId, module) {
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
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>🔧 Установка модуля</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: ${getThemeColors().text}; margin-bottom: 0.5rem;">${module.name}</h4>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-bottom: 1rem;">${module.description}</p>
                </div>
                
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <h5 style="color: #ffc107; margin-bottom: 0.5rem;">⚠️ Требования для установки:</h5>
                    <ul style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0; padding-left: 1rem;">
                        <li>Навык <strong>Транспорт</strong> 4 уровня или выше</li>
                        <li>Профессиональный навык <strong>Друг семьи</strong></li>
                        <li>Или оплата <strong>500 уе</strong> за установку</li>
                    </ul>
                </div>
                
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="pill-button primary-button" onclick="installVehicleModuleDirectly('${vehicleId}', '${moduleId}', 500)" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                        Установить за 500 уе
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

// Функция прямой установки модуля транспорта
function installVehicleModuleDirectly(vehicleId, moduleId, installCost) {
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Находим модуль в инвентаре
    const moduleInventoryIndex = state.vehicleModules.findIndex(m => m.id === moduleId);
    if (moduleInventoryIndex === -1) {
        showToast('Модуль не найден в инвентаре!', 2000);
        return;
    }
    
    const module = state.vehicleModules[moduleInventoryIndex];
    
    // Проверяем требования модуля
    if (module.requirements && module.requirements.length > 0) {
        // TODO: Добавить проверку требований если нужно
    }
    
    // Проверяем деньги для установки
    if (installCost > 0 && state.money < installCost) {
        showModal('Недостаточно средств', `У вас ${state.money.toLocaleString()} уе, а нужно ${installCost.toLocaleString()} уе за установку.`);
        return;
    }
    
    // Списываем деньги если нужно
    if (installCost > 0) {
        state.money -= installCost;
        updateMoneyDisplay();
    }
    
    // Создаем копию модуля для установки на транспорт
    const installedModule = {
        name: module.name,
        description: module.description,
        category: module.category,
        requirements: module.requirements || [],
        vehicleType: module.vehicleType,
        inventoryId: module.id // Сохраняем ID из инвентаря
    };
    
    // Добавляем специальные поля для определенных модулей
    if (module.name === 'Активная защита') {
        installedModule.maxCharges = 100;
        installedModule.charges = 0;
        installedModule.defenseType = null; // Будет выбрано позже
    } else if (module.name === 'Курсовое вооружение') {
        installedModule.maxWeapons = 1;
        installedModule.weapons = [];
    } else if (module.name === 'Турельное вооружение') {
        installedModule.maxWeapons = 2;
        installedModule.weapons = [];
    } else if (module.name === 'Крепление для тяжелого оружия') {
        installedModule.maxWeapons = 1;
        installedModule.weapons = [];
    } else if (module.name === 'Ракетный аппарат') {
        installedModule.maxWeapons = 4;
        installedModule.weapons = [];
    }
    
    // Устанавливаем модуль на транспорт
    if (!vehicle.modules) {
        vehicle.modules = [];
    }
    vehicle.modules.push(installedModule);
    
    // Помечаем модуль как установленный в инвентаре
    module.isInstalled = true;
    module.installedOnVehicle = vehicleId;
    module.weight = 0; // Установленные модули не занимают места в инвентаре
    
    // Обновляем интерфейс
    renderTransport();
    scheduleSave();
    
    // Закрываем диалог установки
    const installModal = document.querySelector('.modal-overlay:last-child');
    if (installModal) {
        installModal.remove();
    }
    
    // Показываем уведомление
    if (installCost > 0) {
        showToast(`Модуль "${module.name}" установлен! Списано ${installCost} уе за установку`, 3000);
    } else {
        showToast(`Модуль "${module.name}" установлен бесплатно!`, 3000);
    }
    
    // Перезагружаем модал
    const modal = document.getElementById('vehicleModulesModal');
    if (modal) {
        modal.remove();
        manageVehicleModules(vehicleId);
    }
    
    scheduleSave();
    
    
}

// Функция установки модуля на транспорт (СТАРАЯ, для совместимости)
function installVehicleModule(vehicleId, moduleIndex) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Находим модуль в снаряжении
    const isBicycle = vehicle.name === 'СКЛАДНОЙ ВЕЛОСИПЕД' || vehicle.linkedGearId;
    const availableModules = state.gear?.filter(item => {
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        
        if (!isModule) return false;
        
        if (isBicycle) {
            return item.name === 'Курсовое вооружение';
        }
        
        return item.category === vehicle.category;
    }) || [];
    
    const module = availableModules[moduleIndex];
    if (!module) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    // Проверяем требования модуля
    if (module.requirements && module.requirements.length > 0) {
        const hasRequirements = module.requirements.every(req => {
            return vehicle.modules?.some(m => m.name === req);
        });
        
        if (!hasRequirements) {
            showToast(`Требуется: ${module.requirements.join(', ')}`, 2000);
            return;
        }
    }
    
    // Проверяем конфликты модулей
    const conflict = checkModuleConflicts(vehicle, module);
    if (conflict) {
        showToast(conflict, 2000);
        return;
    }
    
    // Удаляем модуль из снаряжения
    const gearIndex = state.gear.findIndex(item => item === module);
    if (gearIndex !== -1) {
        state.gear.splice(gearIndex, 1);
    }
    
    // Добавляем модуль на транспорт
    if (!vehicle.modules) vehicle.modules = [];
    
    // Инициализируем специальные свойства модуля
    if (module.name === 'Курсовое вооружение') {
        module.weapons = [];
        module.maxWeapons = 1;
    } else if (module.name === 'Турельное вооружение') {
        module.weapons = [];
        module.maxWeapons = 2;
    } else if (module.name === 'Крепление для тяжелого оружия') {
        module.weapons = [];
        module.maxWeapons = 1;
    } else if (module.name === 'Ракетный аппарат') {
        module.weapons = [];
        module.maxWeapons = 4; // До 4 ракетометов
    } else if (module.name === 'Активная защита') {
        module.charges = 0;
        module.maxCharges = 100; // 10 магазинов по 10 зарядов
        module.type = null; // Тип активной защиты
    }
    
    vehicle.modules.push(module);
    
    // Применяем эффекты модуля
    applyModuleEffects(vehicle, module);
    
    // Показываем уведомление
    showToast(`Модуль "${module.name}" установлен`, 2000);
    
    // Обновляем интерфейс
    renderTransport();
    if (typeof renderGear === 'function') renderGear();
    
    // Обновляем модал
    updateVehicleModulesModal(vehicleId);
    
    
}

// Функция удаления модуля с транспорта
function uninstallVehicleModule(vehicleId, moduleIndex) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Проверяем, есть ли модуль
    if (!vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    // ВАЖНО: Возвращаем оружие из модуля в блок "Оружие"
    if (module.weapons && module.weapons.length > 0) {
        module.weapons.forEach(weapon => {
            // Добавляем оружие обратно в state.weapons
            state.weapons.push(weapon);
        });
        
        const weaponCount = module.weapons.length;
        showToast(`Оружие из модуля (${weaponCount} шт.) возвращено в блок "Оружие"`, 3000);
    }
    
    // Находим модуль в инвентаре по inventoryId
    if (module.inventoryId) {
        const inventoryModule = state.vehicleModules.find(m => m.id === module.inventoryId);
        if (inventoryModule) {
            // Возвращаем модулю нагрузку 10 и снимаем флаг установки
            inventoryModule.isInstalled = false;
            inventoryModule.weight = 10;
            delete inventoryModule.installedOnVehicle;
        }
    }
    
    // Удаляем модуль с транспорта
    vehicle.modules.splice(moduleIndex, 1);
    
    // Удаляем эффекты модуля
    removeModuleEffects(vehicle, module);
    
    // Показываем уведомление
    showToast(`Модуль "${module.name}" снят и возвращен в инвентарь`, 2000);
    
    // Обновляем интерфейс
    renderTransport();
    renderWeapons(); // Обновляем блок оружия, если вернули оружие
    renderVehicleModulesInventory();
    
    // Обновляем модал
    updateVehicleModulesModal(vehicleId);
    
    scheduleSave();
    
    
}

// Функция обновления модала управления модулями
function updateVehicleModulesModal(vehicleId) {
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const installedList = document.getElementById('installedModulesList');
    const availableList = document.getElementById('availableModulesList');
    
    if (installedList) {
        installedList.innerHTML = renderInstalledModules(vehicle);
    }
    
    if (availableList) {
        availableList.innerHTML = renderAvailableModules(vehicle);
    }
}

// Функция закрытия модала управления модулями
function closeVehicleModulesModal() {
    const modal = document.getElementById('vehicleModulesModal');
    if (modal) {
        modal.remove();
    }
}

// Функция проверки конфликтов модулей
function checkModuleConflicts(vehicle, newModule) {
    if (!vehicle.modules) return null;
    
    // Бронирование корпуса и Усиление корпуса несовместимы
    if (newModule.name === 'Бронирование корпуса') {
        const hasReinforcement = vehicle.modules.some(m => m.name === 'Усиление корпуса');
        if (hasReinforcement) {
            return 'Нельзя установить "Бронирование корпуса" вместе с "Усиление корпуса"!';
        }
    }
    
    if (newModule.name === 'Усиление корпуса') {
        const hasArmor = vehicle.modules.some(m => m.name === 'Бронирование корпуса');
        if (hasArmor) {
            return 'Нельзя установить "Усиление корпуса" вместе с "Бронирование корпуса"!';
        }
    }
    
    // Форсированный двигатель - замена предыдущих стадий
    if (newModule.name.includes('Форсированный двигатель')) {
        const stage = parseInt(newModule.name.match(/\(Стадия (\d+)\)/)?.[1] || '1');
        
        if (stage === 2) {
            const hasStage1 = vehicle.modules.some(m => m.name === 'Форсированный двигатель (Стадия 1)');
            if (!hasStage1) {
                return 'Для установки "Стадия 2" требуется "Стадия 1"!';
            }
            // Автоматически удаляем Стадию 1
            const stage1Index = vehicle.modules.findIndex(m => m.name === 'Форсированный двигатель (Стадия 1)');
            if (stage1Index !== -1) {
                const removedModule = vehicle.modules.splice(stage1Index, 1)[0];
                state.gear.push(removedModule);
            }
        }
        
        if (stage === 3) {
            const hasStage2 = vehicle.modules.some(m => m.name === 'Форсированный двигатель (Стадия 2)');
            if (!hasStage2) {
                return 'Для установки "Стадия 3" требуется "Стадия 2"!';
            }
            // Автоматически удаляем Стадию 2
            const stage2Index = vehicle.modules.findIndex(m => m.name === 'Форсированный двигатель (Стадия 2)');
            if (stage2Index !== -1) {
                const removedModule = vehicle.modules.splice(stage2Index, 1)[0];
                state.gear.push(removedModule);
            }
        }
    }
    
    // Ракетный аппарат - максимум 2
    if (newModule.name === 'Ракетный аппарат') {
        const rocketCount = vehicle.modules.filter(m => m.name === 'Ракетный аппарат').length;
        if (rocketCount >= 2) {
            return 'Максимум можно установить 2 модуля "Ракетный аппарат"!';
        }
    }
    
    // Дополнительные сиденья - максимум 3
    if (newModule.name === 'Дополнительные сиденья') {
        const seatsCount = vehicle.modules.filter(m => m.name === 'Дополнительные сиденья').length;
        if (seatsCount >= 3) {
            return 'Максимум можно установить 3 модуля "Дополнительные сиденья"!';
        }
    }
    
    return null;
}

// Функция применения эффектов модуля
function applyModuleEffects(vehicle, module) {
    switch (module.name) {
        case 'Укрепленное шасси':
        case 'Бронестёкла':
            vehicle.hp += 20;
            vehicle.currentHp += 20;
            break;
            
        case 'Бронирование корпуса':
            vehicle.os = 18;
            vehicle.currentOs = 18;
            break;
            
        case 'Усиление корпуса':
            vehicle.os = (vehicle.os || 0) + 10;
            vehicle.currentOs = (vehicle.currentOs || 0) + 10;
            break;
    }
}

// Функция удаления эффектов модуля
function removeModuleEffects(vehicle, module) {
    switch (module.name) {
        case 'Укрепленное шасси':
        case 'Бронестёкла':
            vehicle.hp -= 20;
            vehicle.currentHp = Math.min(vehicle.currentHp, vehicle.hp);
            break;
            
        case 'Бронирование корпуса':
            vehicle.os = 0;
            vehicle.currentOs = 0;
            break;
            
        case 'Усиление корпуса':
            vehicle.os = Math.max(0, (vehicle.os || 0) - 10);
            vehicle.currentOs = Math.max(0, (vehicle.currentOs || 0) - 10);
            break;
    }
}

// ============================================================================
// УПРАВЛЕНИЕ БАГАЖНИКОМ ТРАНСПОРТА
// ============================================================================

// Функция открытия модала управления багажником
function manageVehicleTrunk(vehicleId) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Специальная обработка для велосипеда
    if (vehicle.linkedGearId) {
        if (vehicle.trunk && vehicle.trunk.linkedBackpackId) {
            // У велосипеда есть прикрепленный рюкзак - открываем модал рюкзака
            openBikeBackpackModal(vehicle);
            return;
        } else {
            // У велосипеда нет прикрепленного рюкзака - показываем сообщение
            showToast('На велосипеде нет прикрепленного рюкзака!', 2000);
            return;
        }
    }
    
    // Инициализируем багажник если его нет
    if (!vehicle.trunk) {
        vehicle.trunk = {
            capacity: 100,
            items: []
        };
    }
    
    // Рассчитываем текущую загрузку
    const currentLoad = (vehicle.trunk.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'vehicleTrunkModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0;">🎒 Багажник: ${vehicle.name}</h3>
                <button onclick="closeVehicleTrunkModal()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Информация о загрузке -->
                <div style="background: ${getThemeColors().accentLight}; border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Загрузка:</span>
                            <span style="color: ${getThemeColors().accent}; font-size: 1.2rem; font-weight: bold; margin-left: 0.5rem;">${currentLoad} / ${vehicle.trunk.capacity}</span>
                        </div>
                        <div style="background: ${getThemeColors().accentLight}; padding: 0.5rem 1rem; border-radius: 6px;">
                            <span style="color: ${getThemeColors().accent}; font-weight: bold;">${Math.floor((currentLoad / vehicle.trunk.capacity) * 100)}%</span>
                        </div>
                    </div>
                    <div style="background: ${getThemeColors().bgLight}; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="background: var(--accent); height: 100%; width: ${Math.min((currentLoad / vehicle.trunk.capacity) * 100, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Предметы в багажнике -->
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Предметы в багажнике</h4>
                    <div id="trunkItemsList">
                        ${renderTrunkItems(vehicle)}
                    </div>
                </div>
                
                <!-- Доступные предметы в снаряжении -->
                <div>
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Доступные предметы в снаряжении</h4>
                    <div id="availableGearList">
                        ${renderAvailableGearForTrunk(vehicle)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
}

// Функция рендеринга предметов в багажнике
function renderTrunkItems(vehicle) {
    if (!vehicle.trunk.items || vehicle.trunk.items.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Багажник пуст</p>';
    }
    
    return vehicle.trunk.items.map((item, index) => `
        <div style="
            background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h5 style="color: #28a745; margin: 0 0 0.5rem 0;">📦 ${item.name}</h5>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                        ⚖️ Нагрузка: ${item.load || 0}
                    </div>
                </div>
                <button 
                    onclick="removeItemFromTrunk('${vehicle.id}', ${index})"
                    class="pill-button danger-button"
                    style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                >
                    ❌ Убрать
                </button>
            </div>
        </div>
    `).join('');
}

// Функция рендеринга доступного снаряжения для багажника
function renderAvailableGearForTrunk(vehicle) {
    // Фильтруем снаряжение (исключаем модули транспорта и некоторые типы предметов)
    const availableGear = state.gear?.filter(item => {
        // Исключаем модули транспорта
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        
        return !isModule;
    }) || [];
    
    if (availableGear.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Нет доступных предметов в снаряжении</p>';
    }
    
    const currentLoad = (vehicle.trunk.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    
    return availableGear.map((item, index) => {
        const canFit = currentLoad + (item.load || 0) <= vehicle.trunk.capacity;
        
        return `
            <div style="
                background: linear-gradient(135deg, rgba(182, 103, 255, 0.1) 0%, rgba(182, 103, 255, 0.05) 100%);
                border: 2px solid ${canFit ? 'var(--accent)' : '#dc3545'};
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                opacity: ${canFit ? '1' : '0.6'};
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h5 style="color: ${canFit ? 'var(--accent)' : '#dc3545'}; margin: 0 0 0.5rem 0;">📦 ${item.name}</h5>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                        <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                            ⚖️ Нагрузка: ${item.load || 0}
                        </div>
                        ${!canFit ? '<div style="font-size: 0.75rem; color: #dc3545; margin-top: 0.3rem;">⚠️ Не помещается в багажник</div>' : ''}
                    </div>
                    <button 
                        onclick="addItemToTrunk('${vehicle.id}', ${index})"
                        class="pill-button ${canFit ? 'success-button' : 'danger-button'}"
                        style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                        ${!canFit ? 'disabled' : ''}
                    >
                        ${canFit ? '➕ Положить' : '❌ Не помещается'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Функция добавления предмета в багажник
function addItemToTrunk(vehicleId, itemIndex) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Находим предмет в снаряжении
    const availableGear = state.gear?.filter(item => {
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        return !isModule;
    }) || [];
    
    const item = availableGear[itemIndex];
    if (!item) {
        showToast('Предмет не найден!', 2000);
        return;
    }
    
    // Проверяем, поместится ли предмет
    const currentLoad = (vehicle.trunk.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    if (currentLoad + (item.load || 0) > vehicle.trunk.capacity) {
        showToast('Недостаточно места в багажнике!', 2000);
        return;
    }
    
    // Удаляем предмет из снаряжения
    const gearIndex = state.gear.findIndex(g => g === item);
    if (gearIndex !== -1) {
        state.gear.splice(gearIndex, 1);
    }
    
    // Добавляем предмет в багажник
    vehicle.trunk.items.push(item);
    
    // Показываем уведомление
    showToast(`"${item.name}" добавлен в багажник`, 2000);
    
    // Обновляем интерфейс
    if (typeof renderGear === 'function') renderGear();
    
    // Обновляем модал
    updateVehicleTrunkModal(vehicleId);
    
    
}

// Функция удаления предмета из багажника
function removeItemFromTrunk(vehicleId, itemIndex) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Проверяем, есть ли предмет
    if (!vehicle.trunk.items || !vehicle.trunk.items[itemIndex]) {
        showToast('Предмет не найден!', 2000);
        return;
    }
    
    const item = vehicle.trunk.items[itemIndex];
    
    // Удаляем предмет из багажника
    vehicle.trunk.items.splice(itemIndex, 1);
    
    // Возвращаем предмет в снаряжение
    if (!state.gear) state.gear = [];
    state.gear.push(item);
    
    // Показываем уведомление
    showToast(`"${item.name}" убран из багажника`, 2000);
    
    // Обновляем интерфейс
    if (typeof renderGear === 'function') renderGear();
    
    // Обновляем модал
    updateVehicleTrunkModal(vehicleId);
    
    
}

// Функция обновления модала багажника
function updateVehicleTrunkModal(vehicleId) {
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const trunkList = document.getElementById('trunkItemsList');
    const gearList = document.getElementById('availableGearList');
    
    if (trunkList) {
        trunkList.innerHTML = renderTrunkItems(vehicle);
    }
    
    if (gearList) {
        gearList.innerHTML = renderAvailableGearForTrunk(vehicle);
    }
    
    // Обновляем информацию о загрузке
    const currentLoad = (vehicle.trunk.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    const modalBody = document.querySelector('#vehicleTrunkModal .modal-body');
    if (modalBody) {
        const loadInfo = modalBody.querySelector('div[style*="background: rgba(182, 103, 255, 0.1)"]');
        if (loadInfo) {
            loadInfo.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Загрузка:</span>
                        <span style="color: ${getThemeColors().accent}; font-size: 1.2rem; font-weight: bold; margin-left: 0.5rem;">${currentLoad} / ${vehicle.trunk.capacity}</span>
                    </div>
                    <div style="background: ${getThemeColors().accentLight}; padding: 0.5rem 1rem; border-radius: 6px;">
                        <span style="color: ${getThemeColors().accent}; font-weight: bold;">${Math.floor((currentLoad / vehicle.trunk.capacity) * 100)}%</span>
                    </div>
                </div>
                <div style="background: ${getThemeColors().bgLight}; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                    <div style="background: var(--accent); height: 100%; width: ${Math.min((currentLoad / vehicle.trunk.capacity) * 100, 100)}%; transition: width 0.3s ease;"></div>
                </div>
            `;
        }
    }
}

// Функция закрытия модала багажника
function closeVehicleTrunkModal() {
    const modal = document.getElementById('vehicleTrunkModal');
    if (modal) {
        modal.remove();
    }
}

// ============================================================================
// УПРАВЛЕНИЕ КОНТРАБАНДНЫМ ОТДЕЛЕНИЕМ
// ============================================================================

// Функция открытия модала контрабандного отделения
function manageSmugglerCompartment(vehicleId) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Проверяем, есть ли модуль "Контрабандное отделение"
    const hasSmugglerModule = vehicle.modules?.some(m => m.name === 'Контрабандное отделение');
    if (!hasSmugglerModule) {
        showToast('Требуется модуль "Контрабандное отделение"!', 2000);
        return;
    }
    
    // Инициализируем контрабандное отделение если его нет
    if (!vehicle.smugglerCompartment) {
        vehicle.smugglerCompartment = {
            capacity: 100,
            items: []
        };
    }
    
    // Рассчитываем текущую загрузку
    const currentLoad = (vehicle.smugglerCompartment.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'smugglerCompartmentModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90vw; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3 style="color: #ffc107; margin: 0;">🕳️ Контрабандное отделение: ${vehicle.name}</h3>
                <button onclick="closeSmugglerCompartmentModal()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Предупреждение -->
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="color: #ffc107; font-size: 0.9rem; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">⚠️</span>
                        <span>Скрытое отделение для незаконных предметов. Сложнее обнаружить при обыске.</span>
                    </div>
                </div>
                
                <!-- Информация о загрузке -->
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Загрузка:</span>
                            <span style="color: #ffc107; font-size: 1.2rem; font-weight: bold; margin-left: 0.5rem;">${currentLoad} / ${vehicle.smugglerCompartment.capacity}</span>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.2); padding: 0.5rem 1rem; border-radius: 6px;">
                            <span style="color: #ffc107; font-weight: bold;">${Math.floor((currentLoad / vehicle.smugglerCompartment.capacity) * 100)}%</span>
                        </div>
                    </div>
                    <div style="background: ${getThemeColors().bgLight}; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="background: #ffc107; height: 100%; width: ${Math.min((currentLoad / vehicle.smugglerCompartment.capacity) * 100, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Предметы в контрабандном отделении -->
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: #ffc107; margin: 0 0 1rem 0;">Предметы в контрабандном отделении</h4>
                    <div id="smugglerItemsList">
                        ${renderSmugglerItems(vehicle)}
                    </div>
                </div>
                
                <!-- Доступные предметы в снаряжении -->
                <div>
                    <h4 style="color: #ffc107; margin: 0 0 1rem 0;">Доступные предметы в снаряжении</h4>
                    <div id="availableGearForSmugglerList">
                        ${renderAvailableGearForSmuggler(vehicle)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
}

// Функция рендеринга предметов в контрабандном отделении
function renderSmugglerItems(vehicle) {
    if (!vehicle.smugglerCompartment.items || vehicle.smugglerCompartment.items.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Отделение пусто</p>';
    }
    
    return vehicle.smugglerCompartment.items.map((item, index) => `
        <div style="
            background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h5 style="color: #ffc107; margin: 0 0 0.5rem 0;">🕳️ ${item.name}</h5>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                        ⚖️ Нагрузка: ${item.load || 0}
                    </div>
                </div>
                <button 
                    onclick="removeItemFromSmuggler('${vehicle.id}', ${index})"
                    class="pill-button danger-button"
                    style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                >
                    ❌ Убрать
                </button>
            </div>
        </div>
    `).join('');
}

// Функция рендеринга доступного снаряжения для контрабандного отделения
function renderAvailableGearForSmuggler(vehicle) {
    const availableGear = state.gear?.filter(item => {
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        return !isModule;
    }) || [];
    
    if (availableGear.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Нет доступных предметов в снаряжении</p>';
    }
    
    const currentLoad = (vehicle.smugglerCompartment.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    
    return availableGear.map((item, index) => {
        const canFit = currentLoad + (item.load || 0) <= vehicle.smugglerCompartment.capacity;
        
        return `
            <div style="
                background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
                border: 2px solid ${canFit ? '#ffc107' : '#dc3545'};
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                opacity: ${canFit ? '1' : '0.6'};
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h5 style="color: ${canFit ? '#ffc107' : '#dc3545'}; margin: 0 0 0.5rem 0;">🕳️ ${item.name}</h5>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                        <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                            ⚖️ Нагрузка: ${item.load || 0}
                        </div>
                        ${!canFit ? '<div style="font-size: 0.75rem; color: #dc3545; margin-top: 0.3rem;">⚠️ Не помещается</div>' : ''}
                    </div>
                    <button 
                        onclick="addItemToSmuggler('${vehicle.id}', ${index})"
                        class="pill-button ${canFit ? 'warning-button' : 'danger-button'}"
                        style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                        ${!canFit ? 'disabled' : ''}
                    >
                        ${canFit ? '➕ Спрятать' : '❌ Не помещается'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Функция добавления предмета в контрабандное отделение
function addItemToSmuggler(vehicleId, itemIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    const availableGear = state.gear?.filter(item => {
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        return !isModule;
    }) || [];
    
    const item = availableGear[itemIndex];
    if (!item) {
        showToast('Предмет не найден!', 2000);
        return;
    }
    
    const currentLoad = (vehicle.smugglerCompartment.items || []).reduce((sum, item) => sum + (item.load || 0), 0);
    if (currentLoad + (item.load || 0) > vehicle.smugglerCompartment.capacity) {
        showToast('Недостаточно места!', 2000);
        return;
    }
    
    const gearIndex = state.gear.findIndex(g => g === item);
    if (gearIndex !== -1) {
        state.gear.splice(gearIndex, 1);
    }
    
    vehicle.smugglerCompartment.items.push(item);
    
    showToast(`"${item.name}" спрятан в контрабандном отделении`, 2000);
    
    if (typeof renderGear === 'function') renderGear();
    updateSmugglerCompartmentModal(vehicleId);
    
    
}

// Функция удаления предмета из контрабандного отделения
function removeItemFromSmuggler(vehicleId, itemIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    if (!vehicle.smugglerCompartment.items || !vehicle.smugglerCompartment.items[itemIndex]) {
        showToast('Предмет не найден!', 2000);
        return;
    }
    
    const item = vehicle.smugglerCompartment.items[itemIndex];
    vehicle.smugglerCompartment.items.splice(itemIndex, 1);
    
    if (!state.gear) state.gear = [];
    state.gear.push(item);
    
    showToast(`"${item.name}" убран из контрабандного отделения`, 2000);
    
    if (typeof renderGear === 'function') renderGear();
    updateSmugglerCompartmentModal(vehicleId);
    
    
}

// Функция обновления модала контрабандного отделения
function updateSmugglerCompartmentModal(vehicleId) {
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const itemsList = document.getElementById('smugglerItemsList');
    const gearList = document.getElementById('availableGearForSmugglerList');
    
    if (itemsList) {
        itemsList.innerHTML = renderSmugglerItems(vehicle);
    }
    
    if (gearList) {
        gearList.innerHTML = renderAvailableGearForSmuggler(vehicle);
    }
}

// Функция закрытия модала контрабандного отделения
function closeSmugglerCompartmentModal() {
    const modal = document.getElementById('smugglerCompartmentModal');
    if (modal) {
        modal.remove();
    }
}

// ============================================================================
// УПРАВЛЕНИЕ ОСП И ОС ТРАНСПОРТА
// ============================================================================

// Функция изменения ОСП транспорта
function adjustVehicleHP(vehicleId, amount) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Рассчитываем максимальные ОСП с учетом модулей
    const stats = calculateVehicleStats(vehicle);
    const maxHp = stats.maxHp;
    
    // Изменяем ОСП
    vehicle.currentHp = Math.max(0, Math.min(vehicle.currentHp + amount, maxHp));
    
    // Показываем уведомление
    if (amount > 0) {
        showToast(`ОСП восстановлено: +${amount}`, 1500);
    } else {
        showToast(`Получен урон: ${amount}`, 1500);
    }
    
    // Обновляем интерфейс
    renderTransport();
    
    
}

// Функция изменения ОС транспорта
function adjustVehicleOS(vehicleId, amount) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Рассчитываем максимальные ОС с учетом модулей
    const stats = calculateVehicleStats(vehicle);
    const maxOs = stats.os;
    
    // Инициализируем ОС если его нет
    if (vehicle.currentOs === undefined) {
        vehicle.currentOs = maxOs;
    }
    
    // Изменяем ОС
    vehicle.currentOs = Math.max(0, Math.min((vehicle.currentOs || 0) + amount, maxOs));
    
    // Показываем уведомление
    if (amount > 0) {
        showToast(`ОС восстановлено: +${amount}`, 1500);
    } else {
        showToast(`Броня повреждена: ${amount}`, 1500);
    }
    
    // Обновляем интерфейс
    renderTransport();
    
    
}

// Функция ремонта транспорта
function repairVehicle(vehicleId) {
    
    
    // Находим транспорт
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    // Рассчитываем стоимость ремонта (10% от стоимости транспорта)
    const repairCost = Math.floor((vehicle.price || 10000) * 0.1);
    
    // Проверяем, достаточно ли денег
    if (state.money < repairCost) {
        showToast('Недостаточно средств для ремонта!', 2000);
        return;
    }
    
    // Проверяем, нужен ли ремонт
    const stats = calculateVehicleStats(vehicle);
    const needsRepair = vehicle.currentHp < stats.maxHp || (stats.os > 0 && (vehicle.currentOs || 0) < stats.os);
    if (!needsRepair) {
        showToast('Транспорт не нуждается в ремонте!', 2000);
        return;
    }
    
    // Списываем деньги
    state.money -= repairCost;
    
    // Восстанавливаем ОСП и ОС
    const hpRestored = stats.maxHp - vehicle.currentHp;
    const osRestored = stats.os - (vehicle.currentOs || 0);
    
    vehicle.currentHp = stats.maxHp;
    if (stats.os > 0) {
        vehicle.currentOs = stats.os;
    }
    
    // Показываем уведомление
    showToast(`Транспорт отремонтирован! Восстановлено: ${hpRestored} ОСП${osRestored > 0 ? `, ${osRestored} ОС` : ''}`, 3000);
    
    // Обновляем интерфейс
    updateMoneyDisplay();
    renderTransport();
    
    
}

// ============================================================================
// УПРАВЛЕНИЕ ОРУЖЕЙНЫМИ МОДУЛЯМИ
// ============================================================================

// Функция управления курсовым вооружением
function manageCourseWeapon(vehicleId, moduleIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'weaponModuleModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0;">🎯 ${module.name}</h3>
                <button onclick="closeWeaponModuleModal()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Установленное оружие -->
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 0.5rem 0;">Установленное оружие (${module.weapons?.length || 0}/${module.maxWeapons || 1})</h4>
                    <div id="installedWeaponsList">
                        ${renderInstalledWeapons(vehicle, moduleIndex)}
                    </div>
                </div>
                
                <!-- Доступное оружие -->
                <div>
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 0.5rem 0;">Доступное оружие</h4>
                    <div id="availableWeaponsList">
                        ${renderAvailableWeapons(vehicle, moduleIndex)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
}

// Функция рендеринга установленного оружия
function renderInstalledWeapons(vehicle, moduleIndex) {
    const module = vehicle.modules[moduleIndex];
    
    if (!module.weapons || module.weapons.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Оружие не установлено</p>';
    }
    
    return module.weapons.map((weapon, weaponIndex) => `
        <div style="background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; border-radius: 6px; padding: 0.8rem; margin-bottom: 0.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: #28a745; font-weight: bold; margin-bottom: 0.3rem;">🔫 ${weapon.name}</div>
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                        ${weapon.damage ? `Урон: ${weapon.damage}` : ''}
                        ${weapon.ammo ? ` | Патроны: ${weapon.ammo}` : ''}
                    </div>
                </div>
                <button onclick="removeWeaponFromModule('${vehicle.id}', ${moduleIndex}, ${weaponIndex})" class="pill-button danger-button" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                    ❌ Снять
                </button>
            </div>
        </div>
    `).join('');
}

// Функция рендеринга доступного оружия
function renderAvailableWeapons(vehicle, moduleIndex) {
    const module = vehicle.modules[moduleIndex];
    
    // Фильтруем оружие из блока "Оружие"
    let availableWeapons = state.weapons || [];
    
    // Для "Крепление для тяжелого оружия" только пулеметы и ракетометы
    if (module.name === 'Крепление для тяжелого оружия') {
        availableWeapons = availableWeapons.filter(w => 
            w.name?.includes('ПУЛЕМЁТ') || w.name?.includes('РАКЕТОМЁТ')
        );
    }
    
    // Для "Ракетный аппарат" только ракетометы
    if (module.name === 'Ракетный аппарат') {
        availableWeapons = availableWeapons.filter(w => w.name?.includes('РАКЕТОМЁТ'));
    }
    
    if (availableWeapons.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Нет доступного оружия</p>';
    }
    
    const canAddMore = (module.weapons?.length || 0) < (module.maxWeapons || 1);
    
    return availableWeapons.map((weapon, weaponIndex) => `
        <div style="background: ${getThemeColors().accentLight}; border: 1px solid var(--accent); border-radius: 6px; padding: 0.8rem; margin-bottom: 0.5rem; opacity: ${canAddMore ? '1' : '0.5'};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="color: ${getThemeColors().accent}; font-weight: bold; margin-bottom: 0.3rem;">🔫 ${weapon.name}</div>
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                        ${weapon.damage ? `Урон: ${weapon.damage}` : ''}
                        ${weapon.ammo ? ` | Патроны: ${weapon.ammo}` : ''}
                    </div>
                </div>
                <button 
                    onclick="addWeaponToModule('${vehicle.id}', ${moduleIndex}, ${weaponIndex})" 
                    class="pill-button success-button" 
                    style="font-size: 0.7rem; padding: 0.3rem 0.6rem;"
                    ${!canAddMore ? 'disabled' : ''}
                >
                    ${canAddMore ? '➕ Установить' : '❌ Мест нет'}
                </button>
            </div>
        </div>
    `).join('');
}

// Функция добавления оружия в модуль
function addWeaponToModule(vehicleId, moduleIndex, weaponIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    // Проверяем лимит
    if ((module.weapons?.length || 0) >= (module.maxWeapons || 1)) {
        showToast('Нет свободных слотов для оружия!', 2000);
        return;
    }
    
    // Находим оружие
    let availableWeapons = state.weapons || [];
    
    if (module.name === 'Крепление для тяжелого оружия') {
        availableWeapons = availableWeapons.filter(w => 
            w.name?.includes('ПУЛЕМЁТ') || w.name?.includes('РАКЕТОМЁТ')
        );
    } else if (module.name === 'Ракетный аппарат') {
        availableWeapons = availableWeapons.filter(w => w.name?.includes('РАКЕТОМЁТ'));
    }
    
    const weapon = availableWeapons[weaponIndex];
    if (!weapon) {
        showToast('Оружие не найдено!', 2000);
        return;
    }
    
    // Удаляем оружие из блока "Оружие"
    const weaponIndexInState = state.weapons.findIndex(w => w === weapon);
    if (weaponIndexInState !== -1) {
        state.weapons.splice(weaponIndexInState, 1);
    }
    
    // Добавляем оружие в модуль
    if (!module.weapons) module.weapons = [];
    module.weapons.push(weapon);
    
    showToast(`Оружие "${weapon.name}" установлено`, 2000);
    
    // Обновляем интерфейс
    if (typeof renderWeapons === 'function') renderWeapons();
    renderTransport();
    updateWeaponModuleModal(vehicleId, moduleIndex);
    
    
}

// Функция удаления оружия из модуля
function removeWeaponFromModule(vehicleId, moduleIndex, weaponIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    if (!module.weapons || !module.weapons[weaponIndex]) {
        showToast('Оружие не найдено!', 2000);
        return;
    }
    
    const weapon = module.weapons[weaponIndex];
    
    // Удаляем оружие из модуля
    module.weapons.splice(weaponIndex, 1);
    
    // Возвращаем оружие в блок "Оружие"
    if (!state.weapons) state.weapons = [];
    state.weapons.push(weapon);
    
    showToast(`Оружие "${weapon.name}" снято`, 2000);
    
    // Обновляем интерфейс
    if (typeof renderWeapons === 'function') renderWeapons();
    renderTransport();
    updateWeaponModuleModal(vehicleId, moduleIndex);
    
    
}

// Функция обновления модала оружия
function updateWeaponModuleModal(vehicleId, moduleIndex) {
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const installedList = document.getElementById('installedWeaponsList');
    const availableList = document.getElementById('availableWeaponsList');
    
    if (installedList) {
        installedList.innerHTML = renderInstalledWeapons(vehicle, moduleIndex);
    }
    
    if (availableList) {
        availableList.innerHTML = renderAvailableWeapons(vehicle, moduleIndex);
    }
}

// Функция закрытия модала оружия
function closeWeaponModuleModal() {
    const modal = document.getElementById('weaponModuleModal');
    if (modal) {
        modal.remove();
    }
}

// ============================================================================
// СИСТЕМА АКТИВНОЙ ЗАЩИТЫ
// ============================================================================

// Функция управления активной защитой
function manageActiveDefense(vehicleId, moduleIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    // Создаем модал
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'activeDefenseModal';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 style="color: ${getThemeColors().accent}; margin: 0;">⚡ Активная защита</h3>
                <button onclick="closeActiveDefenseModal()" style="background: none; border: none; color: ${getThemeColors().muted}; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="modal-body" style="padding: 1rem;">
                <!-- Информация о зарядах -->
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Заряды:</span>
                            <span style="color: #ffc107; font-size: 1.5rem; font-weight: bold; margin-left: 0.5rem;">${module.charges || 0} / ${module.maxCharges || 100}</span>
                        </div>
                        <div style="background: rgba(255, 193, 7, 0.2); padding: 0.5rem 1rem; border-radius: 6px;">
                            <span style="color: #ffc107; font-weight: bold;">${Math.floor(((module.charges || 0) / (module.maxCharges || 100)) * 100)}%</span>
                        </div>
                    </div>
                    <div style="background: ${getThemeColors().bgLight}; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="background: #ffc107; height: 100%; width: ${Math.min(((module.charges || 0) / (module.maxCharges || 100)) * 100, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Тип активной защиты -->
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 0.5rem 0;">Тип активной защиты</h4>
                    ${module.type ? `
                        <div style="background: rgba(40, 167, 69, 0.1); border: 1px solid #28a745; border-radius: 6px; padding: 0.8rem;">
                            <div style="color: #28a745; font-weight: bold;">✅ ${module.type}</div>
                        </div>
                    ` : `
                        <p style="color: ${getThemeColors().muted}; text-align: center; padding: 1rem;">Тип не выбран</p>
                        <div style="font-size: 0.8rem; color: ${getThemeColors().muted}; text-align: center;">
                            Выберите тип активной защиты в магазине боеприпасов
                        </div>
                    `}
                </div>
                
                <!-- Кнопки управления -->
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button onclick="reloadActiveDefense('${vehicleId}', ${moduleIndex})" class="pill-button success-button" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                        🔄 Перезарядить
                    </button>
                    <button onclick="useActiveDefenseCharge('${vehicleId}', ${moduleIndex})" class="pill-button warning-button" style="font-size: 0.9rem; padding: 0.5rem 1rem;" ${(module.charges || 0) <= 0 ? 'disabled' : ''}>
                        ⚡ Использовать заряд
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    
}

// Функция перезарядки активной защиты
function reloadActiveDefense(vehicleId, moduleIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    // Проверяем, не полон ли уже
    if ((module.charges || 0) >= (module.maxCharges || 100)) {
        showToast('Активная защита уже полностью заряжена!', 2000);
        return;
    }
    
    // Проверяем наличие боеприпасов в снаряжении
    // TODO: Добавить логику покупки боеприпасов для активной защиты
    
    // Пока просто полностью заряжаем
    const chargesAdded = (module.maxCharges || 100) - (module.charges || 0);
    module.charges = module.maxCharges || 100;
    
    showToast(`Активная защита перезаряжена! Добавлено зарядов: ${chargesAdded}`, 2000);
    
    // Обновляем интерфейс
    renderTransport();
    
    // Обновляем модал
    const modal = document.getElementById('activeDefenseModal');
    if (modal) {
        closeActiveDefenseModal();
        manageActiveDefense(vehicleId, moduleIndex);
    }
    
    
}

// Функция использования заряда активной защиты
function useActiveDefenseCharge(vehicleId, moduleIndex) {
    
    
    const vehicle = state.property.vehicles?.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) {
        showToast('Модуль не найден!', 2000);
        return;
    }
    
    const module = vehicle.modules[moduleIndex];
    
    if ((module.charges || 0) <= 0) {
        showToast('Нет зарядов!', 2000);
        return;
    }
    
    module.charges = (module.charges || 0) - 1;
    
    showToast(`Заряд активной защиты использован! Осталось: ${module.charges}`, 2000);
    
    // Обновляем интерфейс
    renderTransport();
    
    // Обновляем модал
    const modal = document.getElementById('activeDefenseModal');
    if (modal) {
        closeActiveDefenseModal();
        manageActiveDefense(vehicleId, moduleIndex);
    }
    
    
}

// Функция закрытия модала активной защиты
function closeActiveDefenseModal() {
    const modal = document.getElementById('activeDefenseModal');
    if (modal) {
        modal.remove();
    }
}

// ============================================================================
// СОХРАНЕНИЕ И УТИЛИТЫ
// ============================================================================

// Функция сохранения состояния транспорта
function saveTransportState() {
    
    
    // Состояние автоматически сохраняется в state.property.vehicles
    // Дополнительно можно сохранить в localStorage
    try {
        localStorage.setItem('transportState', JSON.stringify(state.property.vehicles));
        
    } catch (e) {
        console.warn('⚠️ Не удалось сохранить в localStorage:', e);
    }
}

// Функция загрузки состояния транспорта
function loadTransportState() {
    
    
    try {
        const saved = localStorage.getItem('transportState');
        if (saved) {
            const vehicles = JSON.parse(saved);
            if (Array.isArray(vehicles)) {
                state.property.vehicles = vehicles;
                
                return true;
            }
        }
    } catch (e) {
        console.warn('⚠️ Не удалось загрузить из localStorage:', e);
    }
    
    return false;
}

// Функция принудительного обновления интерфейса транспорта
function forceUpdateTransportUI() {
    
    renderTransport();
    
}

// Функция для отладки - добавить тестовый транспорт
function addTestVehicle() {
    
    
    const testVehicle = {
        id: generateVehicleId(),
        name: 'Тестовая машина',
        description: 'Тестовый транспорт для отладки системы',
        category: 'ground',
        hp: 100,
        currentHp: 100,
        os: 10,
        currentOs: 10,
        seats: 4,
        mechanicalSpeed: 15,
        narrativeSpeed: '120 км/ч',
        price: 50000,
        catalogPrice: 50000, // Цена по каталогу
        purchasePrice: 50000, // Цена покупки
        itemType: 'test', // Тип предмета
        modules: [],
        trunk: {
            capacity: 200,
            items: []
        },
        smugglerCompartment: {
            capacity: 100,
            items: []
        },
        baseHp: 100,
        baseSpeed: 15,
        baseSeats: 4
    };
    
    if (!state.property.vehicles) {
        state.property.vehicles = [];
    }
    state.property.vehicles.push(testVehicle);
    
    renderTransport();
    
    // Сохраняем состояние
    scheduleSave();
}

// Функция открытия модала рюкзака велосипеда
function openBikeBackpackModal(vehicle) {
    
    
    // Находим прикрепленный рюкзак
    const backpack = state.gear.find(g => g.id === vehicle.trunk.linkedBackpackId);
    if (!backpack) {
        showToast('Рюкзак не найден!', 2000);
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.setAttribute('data-bike-backpack-modal', 'true');
    modal.setAttribute('data-vehicle-id', vehicle.id);
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Добавляем автоматическую разблокировку скролла при удалении
    const originalRemove = modal.remove.bind(modal);
    modal.remove = function() {
        document.body.style.overflow = '';
        originalRemove();
    };
    
    // Генерируем содержимое модала
    updateBikeBackpackModalContent(modal, vehicle, backpack);
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Обновление содержимого модального окна рюкзака велосипеда
function updateBikeBackpackModalContent(modal, vehicle, backpack) {
    const usedLoad = (backpack.storage || []).reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>🎒 Рюкзак на велосипеде: ${vehicle.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <!-- Информация о загрузке -->
                <div style="background: ${getThemeColors().accentLight}; border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <span style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Загрузка:</span>
                            <span style="color: ${getThemeColors().accent}; font-size: 1.2rem; font-weight: bold; margin-left: 0.5rem;">${usedLoad} / ${maxLoad}</span>
                        </div>
                        <div style="background: ${getThemeColors().accentLight}; padding: 0.5rem 1rem; border-radius: 6px;">
                            <span style="color: ${getThemeColors().accent}; font-weight: bold;">${Math.floor((usedLoad / maxLoad) * 100)}%</span>
                        </div>
                    </div>
                    <div style="background: ${getThemeColors().bgLight}; height: 8px; border-radius: 4px; margin-top: 0.5rem; overflow: hidden;">
                        <div style="background: var(--accent); height: 100%; width: ${Math.min((usedLoad / maxLoad) * 100, 100)}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>
                
                <!-- Предметы в рюкзаке -->
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Предметы в рюкзаке</h4>
                    <div id="bikeBackpackItemsList">
                        ${renderBikeBackpackItems(backpack)}
                    </div>
                </div>
                
                <!-- Доступные предметы в снаряжении -->
                <div>
                    <h4 style="color: ${getThemeColors().accent}; margin: 0 0 1rem 0;">Доступные предметы в снаряжении</h4>
                    <div id="availableGearForBikeBackpack">
                        ${renderAvailableGearForBikeBackpack(backpack)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Рендеринг предметов в рюкзаке велосипеда
function renderBikeBackpackItems(backpack) {
    if (!backpack.storage || backpack.storage.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Рюкзак пуст</p>';
    }
    
    return backpack.storage.map((item, index) => `
        <div style="
            background: linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%);
            border: 2px solid #28a745;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        ">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <h5 style="color: #28a745; margin: 0 0 0.5rem 0;">📦 ${item.name}</h5>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                    <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                        ⚖️ Нагрузка: ${item.load || 0}
                    </div>
                </div>
                <button 
                    onclick="removeItemFromBikeBackpack('${backpack.id}', ${index})"
                    class="pill-button danger-button"
                    style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                >
                    ❌ Убрать
                </button>
            </div>
        </div>
    `).join('');
}

// Рендеринг доступного снаряжения для рюкзака велосипеда
function renderAvailableGearForBikeBackpack(backpack) {
    const usedLoad = (backpack.storage || []).reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const maxLoad = 32;
    
    // Фильтруем снаряжение (исключаем рюкзаки и некоторые типы предметов)
    const availableGear = state.gear?.filter(item => {
        // Исключаем рюкзаки
        if (getGearSpecialType(item.name) === 'backpack') return false;
        
        // Исключаем уже находящиеся в рюкзаке
        if (backpack.storage.some(storageItem => storageItem.id === item.id)) return false;
        
        // Исключаем модули транспорта
        const isModule = VEHICLE_MODULES_LIBRARY.ground?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.air?.some(m => m.name === item.name) ||
                        VEHICLE_MODULES_LIBRARY.water?.some(m => m.name === item.name);
        if (isModule) return false;
        
        // Исключаем прикрепленные к велосипеду предметы
        if (item.attachedToBike) return false;
        
        return true;
    }) || [];
    
    if (availableGear.length === 0) {
        return '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Нет доступных предметов</p>';
    }
    
    return availableGear.map((item, index) => {
        const itemLoad = parseFloat(item.load) || 0;
        const canFit = (usedLoad + itemLoad) <= maxLoad;
        const gearIndex = state.gear.findIndex(g => g.id === item.id);
        
        return `
            <div style="
                background: linear-gradient(135deg, rgba(182, 103, 255, 0.1) 0%, rgba(182, 103, 255, 0.05) 100%);
                border: 2px solid var(--accent);
                border-radius: 8px;
                padding: 1rem;
                margin-bottom: 1rem;
                ${!canFit ? 'opacity: 0.5;' : ''}
            ">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h5 style="color: ${getThemeColors().accent}; margin: 0 0 0.5rem 0;">📦 ${item.name}</h5>
                        <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0 0 0.5rem 0;">${item.description || ''}</p>
                        <div style="font-size: 0.8rem; color: ${getThemeColors().muted};">
                            ⚖️ Нагрузка: ${itemLoad}
                        </div>
                    </div>
                    <button 
                        onclick="addItemToBikeBackpack('${backpack.id}', ${gearIndex})"
                        class="pill-button ${canFit ? 'success-button' : 'disabled-button'}"
                        style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"
                        ${!canFit ? 'disabled' : ''}
                    >
                        ${canFit ? '✅ Добавить' : '❌ Не помещается'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Функции для работы с предметами в рюкзаке велосипеда
function addItemToBikeBackpack(backpackId, itemIndex) {
    const backpack = state.gear.find(g => g.id === backpackId);
    const item = state.gear[itemIndex];
    
    if (!backpack || !item) return;
    
    const usedLoad = (backpack.storage || []).reduce((sum, i) => sum + (parseFloat(i.load) || 0), 0);
    const itemLoad = parseFloat(item.load) || 0;
    const maxLoad = 32;
    
    if ((usedLoad + itemLoad) > maxLoad) {
        showToast('Предмет не помещается в рюкзак!', 2000);
        return;
    }
    
    // Добавляем предмет в рюкзак
    backpack.storage.push({...item});
    
    // Убираем предмет из снаряжения
    state.gear.splice(itemIndex, 1);
    
    // Синхронизируем с багажником велосипеда
    const bikeVehicle = state.property.vehicles.find(v => v.trunk && v.trunk.linkedBackpackId === backpackId);
    if (bikeVehicle) {
        bikeVehicle.trunk.items = [...backpack.storage];
    }
    
    // Обновляем отображение
    const modal = document.querySelector('[data-bike-backpack-modal="true"]');
    if (modal) {
        updateBikeBackpackModalContent(modal, bikeVehicle, backpack);
    }
    
    renderGear();
    renderTransport();
    scheduleSave();
    
    showToast('Предмет добавлен в рюкзак!', 2000);
}

function removeItemFromBikeBackpack(backpackId, itemIndex) {
    const backpack = state.gear.find(g => g.id === backpackId);
    
    if (!backpack || !backpack.storage[itemIndex]) return;
    
    const item = backpack.storage[itemIndex];
    
    // Возвращаем предмет в снаряжение
    state.gear.push({...item});
    
    // Убираем предмет из рюкзака
    backpack.storage.splice(itemIndex, 1);
    
    // Синхронизируем с багажником велосипеда
    const bikeVehicle = state.property.vehicles.find(v => v.trunk && v.trunk.linkedBackpackId === backpackId);
    if (bikeVehicle) {
        bikeVehicle.trunk.items = [...backpack.storage];
    }
    
    // Обновляем отображение
    const modal = document.querySelector('[data-bike-backpack-modal="true"]');
    if (modal) {
        updateBikeBackpackModalContent(modal, bikeVehicle, backpack);
    }
    
    renderGear();
    renderTransport();
    scheduleSave();
    
    showToast('Предмет убран из рюкзака!', 2000);
}

// Рендеринг оружия в модуле транспорта (аналогично renderDroneWeapon)
function renderVehicleModuleWeapon(weapon, vehicleId, moduleIndex) {
    if (!weapon) return '';
    
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    const module = vehicle?.modules[moduleIndex];
    
    return `
        <div class="weapon-item" style="background: ${getThemeColors().bgMedium}; border: 1px solid rgba(182, 103, 255, 0.3); border-radius: 6px; padding: 0.5rem; margin-bottom: 0.5rem;">
            <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.85rem; margin-bottom: 0.25rem;">
                ${weapon.customName || weapon.name}
            </div>
            
            <div class="weapon-damage" style="margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                    <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.75rem;">Урон основной:</span>
                    <button class="pill-button primary-button" onclick="rollVehicleModuleWeaponDamage('${vehicleId}', ${moduleIndex}, '${weapon.primaryDamage}', '${weapon.name}', '${weapon.id}', 'primary')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${weapon.primaryDamage}</button>
                </div>
                ${weapon.altDamage && weapon.altDamage !== '—' ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: ${getThemeColors().text}; font-weight: 600; font-size: 0.75rem;">Урон альтернативный:</span>
                        <button class="pill-button primary-button" onclick="rollVehicleModuleWeaponDamage('${vehicleId}', ${moduleIndex}, '${weapon.altDamage}', '${weapon.name}', '${weapon.id}', 'alt')" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;">${weapon.altDamage}</button>
                    </div>
                ` : ''}
            </div>
            
            <div class="weapon-stats" style="font-family: monospace; font-size: 0.65rem; color: ${getThemeColors().muted}; margin-bottom: 0.5rem;">
                Можно скрыть: ${formatYesNo(weapon.concealable)} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}
            </div>
            
            <div class="weapon-magazine" style="margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                    <span style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.75rem;">Патроны в магазине:</span>
                    <button class="pill-button success-button" onclick="reloadVehicleModuleWeapon('${vehicleId}', ${moduleIndex})" style="font-size: 0.65rem; padding: 0.2rem 0.4rem;">🔄 Перезарядить</button>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="background: ${getThemeColors().accentLight}; border: 1px solid var(--accent); border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.7rem;">
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

// Функция для броска урона с оружия в модуле транспорта
function rollVehicleModuleWeaponDamage(vehicleId, moduleIndex, damageFormula, weaponName, weaponId, damageType) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) return;
    
    const module = vehicle.modules[moduleIndex];
    const weapon = module.weapons?.find(w => w.id === weaponId);
    
    if (!weapon) return;
    
    // Временно добавляем оружие в state.weapons для работы стандартной системы
    const tempWeapon = {...weapon};
    state.weapons.push(tempWeapon);
    
    // Сохраняем ссылку на оригинальное оружие в модуле
    window._currentVehicleWeapon = {
        vehicleId: vehicleId,
        moduleIndex: moduleIndex,
        weaponId: weaponId,
        tempWeaponId: tempWeapon.id
    };
    
    // Вызываем стандартную функцию броска урона
    const weaponType = weapon.type || 'ranged';
    rollWeaponDamage(damageFormula, weaponName, weaponType, tempWeapon.id, damageType);
    
    // Устанавливаем периодическую синхронизацию
    if (window._vehicleWeaponSyncInterval) {
        clearInterval(window._vehicleWeaponSyncInterval);
    }
    
    window._vehicleWeaponSyncInterval = setInterval(() => {
        // Проверяем, закрыт ли модал
        const weaponModal = document.getElementById('weaponDamageModal');
        if (!weaponModal) {
            // Модал закрыт - делаем финальную синхронизацию и останавливаем интервал
            syncVehicleWeaponAfterRoll();
            if (window._vehicleWeaponSyncInterval) {
                clearInterval(window._vehicleWeaponSyncInterval);
                window._vehicleWeaponSyncInterval = null;
            }
        } else {
            // Модал открыт - синхронизируем состояние
            syncVehicleWeaponDuringRoll();
        }
    }, 500);
}

// Функция синхронизации оружия транспорта во время работы с модалом
function syncVehicleWeaponDuringRoll() {
    if (!window._currentVehicleWeapon) return;
    
    const { vehicleId, moduleIndex, weaponId } = window._currentVehicleWeapon;
    
    // Находим временное оружие в state.weapons
    const tempWeapon = state.weapons.find(w => w.id === weaponId);
    if (tempWeapon) {
        // Находим оригинальное оружие в модуле транспорта
        const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
        if (vehicle && vehicle.modules && vehicle.modules[moduleIndex]) {
            const module = vehicle.modules[moduleIndex];
            const weaponIndex = module.weapons?.findIndex(w => w.id === weaponId);
            
            if (weaponIndex !== -1) {
                // Синхронизируем состояние (патроны и т.д.)
                module.weapons[weaponIndex].currentAmmo = tempWeapon.currentAmmo;
                module.weapons[weaponIndex].loadedAmmoType = tempWeapon.loadedAmmoType;
                module.weapons[weaponIndex].maxAmmo = tempWeapon.maxAmmo;
            }
        }
    }
}

// Функция синхронизации оружия транспорта после броска (финальная)
function syncVehicleWeaponAfterRoll() {
    if (!window._currentVehicleWeapon) return;
    
    const { vehicleId, moduleIndex, weaponId } = window._currentVehicleWeapon;
    
    // Финальная синхронизация
    syncVehicleWeaponDuringRoll();
    
    // Удаляем временное оружие из state.weapons
    const weaponIndexInState = state.weapons.findIndex(w => w.id === weaponId);
    if (weaponIndexInState !== -1) {
        state.weapons.splice(weaponIndexInState, 1);
    }
    
    // Очищаем ссылку
    window._currentVehicleWeapon = null;
    
    // Обновляем отображение транспорта
    renderTransport();
    scheduleSave();
}

// Функция перезарядки оружия в модуле транспорта
function reloadVehicleModuleWeapon(vehicleId, moduleIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) return;
    
    const module = vehicle.modules[moduleIndex];
    const weapons = module.weapons || [];
    
    if (weapons.length === 0) return;
    
    // Если оружие одно, перезаряжаем его
    if (weapons.length === 1) {
        reloadVehicleModuleWeaponStandard(vehicleId, moduleIndex, 0);
        return;
    }
    
    // Если оружия несколько, показываем выбор
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>🔄 Перезарядка оружия</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">Выберите оружие для перезарядки:</p>
                ${weapons.map((weapon, weaponIndex) => `
                    <button class="pill-button primary-button" onclick="reloadVehicleModuleWeaponStandard('${vehicleId}', ${moduleIndex}, ${weaponIndex})">
                        ${weapon.customName || weapon.name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Перезарядка оружия в модуле транспорта используя стандартную систему
function reloadVehicleModuleWeaponStandard(vehicleId, moduleIndex, weaponIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) return;
    
    const module = vehicle.modules[moduleIndex];
    const weapon = module.weapons?.[weaponIndex];
    
    if (!weapon) return;
    
    // Временно добавляем оружие в state.weapons для работы стандартной системы
    const tempWeapon = {...weapon};
    state.weapons.push(tempWeapon);
    
    // Сохраняем ссылку на оригинальное оружие в модуле
    window._currentVehicleWeapon = {
        vehicleId: vehicleId,
        moduleIndex: moduleIndex,
        weaponId: weapon.id,
        tempWeaponId: tempWeapon.id
    };
    
    // Вызываем стандартную функцию перезарядки
    reloadWeapon(tempWeapon.id);
    
    // Устанавливаем периодическую синхронизацию
    if (window._vehicleWeaponSyncInterval) {
        clearInterval(window._vehicleWeaponSyncInterval);
    }
    
    window._vehicleWeaponSyncInterval = setInterval(() => {
        // Проверяем, закрыты ли все модалы
        const modals = document.querySelectorAll('.modal-overlay');
        if (modals.length === 0) {
            // Модалы закрыты - делаем финальную синхронизацию и останавливаем интервал
            syncVehicleWeaponAfterRoll();
            if (window._vehicleWeaponSyncInterval) {
                clearInterval(window._vehicleWeaponSyncInterval);
                window._vehicleWeaponSyncInterval = null;
            }
        } else {
            // Модал открыт - синхронизируем состояние
            syncVehicleWeaponDuringRoll();
        }
    }, 500);
}

// Перезарядка оружия в модуле транспорта с использованием боеприпасов
function reloadVehicleModuleWeaponWithAmmo(vehicleId, moduleIndex, weaponIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) return;
    
    const module = vehicle.modules[moduleIndex];
    const weapon = module.weapons?.[weaponIndex];
    
    if (!weapon || weapon.type !== 'ranged') {
        showModal('Ошибка', 'Оружие не найдено или не является дальним!');
        return;
    }
    
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
                        Патронов: ${weapon.currentAmmo || 0}/${weapon.maxAmmo || weapon.magazine}
                        ${weapon.loadedAmmoType ? ` | Тип: ${weapon.loadedAmmoType}` : ' | Не заряжено'}
                    </p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label class="input-label">Выберите тип боеприпасов</label>
                    <select class="input-field" id="vehicleReloadAmmoType">
                        ${compatibleAmmo.map((ammo, index) => `
                            <option value="${index}">${ammo.type} (${ammo.quantity} шт.)</option>
                        `).join('')}
                    </select>
                </div>
                
                <div id="vehicleReloadWarning" style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(255, 165, 0, 0.1); border: 1px solid orange; border-radius: 8px; display: none;">
                    <p style="color: orange; font-size: 0.9rem; margin-bottom: 0.5rem;">⚠️ Внимание!</p>
                    <p style="color: ${getThemeColors().text}; font-size: 0.8rem;" id="vehicleReloadWarningText">
                        В магазине есть патроны другого типа. При перезарядке они будут возвращены в блок Боеприпасы.
                    </p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="executeVehicleModuleReload('${vehicleId}', ${moduleIndex}, ${weaponIndex})">
                    🔄 Перезарядить
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик изменения типа боеприпасов
    setTimeout(() => {
        const ammoSelect = document.getElementById('vehicleReloadAmmoType');
        const warningDiv = document.getElementById('vehicleReloadWarning');
        const warningText = document.getElementById('vehicleReloadWarningText');
        
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
        checkAmmoTypeChange(); // Проверяем при загрузке
    }, 100);
}

// Выполнение перезарядки оружия в модуле транспорта
function executeVehicleModuleReload(vehicleId, moduleIndex, weaponIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle || !vehicle.modules || !vehicle.modules[moduleIndex]) return;
    
    const module = vehicle.modules[moduleIndex];
    const weapon = module.weapons?.[weaponIndex];
    
    if (!weapon) return;
    
    const selectedAmmoIndex = parseInt(document.getElementById('vehicleReloadAmmoType').value);
    const weaponTypeForAmmo = getWeaponTypeForAmmo(weapon.name);
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
    const ammoNeeded = (weapon.maxAmmo || weapon.magazine) - (weapon.loadedAmmoType === selectedAmmo.type ? weapon.currentAmmo : 0);
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
        renderTransport();
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        
        const reloadMessage = ammoToTake === ammoNeeded ? 
            'Магазин полностью заряжен!' : 
            `Магазин частично заряжен! Добавлено ${ammoToTake} патронов (нужно было ${ammoNeeded})`;
        
        showToast(reloadMessage, 3000);
    }
}


