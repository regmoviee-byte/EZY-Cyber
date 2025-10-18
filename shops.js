// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С МАГАЗИНАМИ
// Магазины жилья, коммерческой недвижимости, транспорта и модулей
// ============================================================================

console.log('🏪 shops.js загружается...');

// Функции для работы с магазинами жилья и коммерческой недвижимости

// Магазин жилья
function showHousingShop() {
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
                <h3><img src="https://static.tildacdn.com/tild3336-3839-4738-a462-303336633561/lease.png" alt="🏠" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин жилья</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="margin-bottom: 1rem; padding: 1rem; background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px;">
                    <h4 style="color: ${getThemeColors().accent}; margin-bottom: 0.5rem;">Памятка:</h4>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0;">
                        • Апартаменты можно арендовать или купить<br>
                        • Пентхаусы и частные дома только для покупки<br>
                        • Собственная квартира - ваше имущество, за которую не надо платить аренду<br>
                        • Выселение из квартиры ознает её потери, деньги никто не вернёт!
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${HOUSING_OPTIONS.map(housing => {
                        // Проверяем, есть ли уже такое жилье в собственности
                        const ownedHousing = state.property.housing.find(h => h.id === housing.id);
                        const isOwned = ownedHousing && ownedHousing.isOwned;
                        
                        return `
                            <div class="shop-item">
                                <div class="shop-item-header">
                                    <h4 class="shop-item-title">${housing.name}</h4>
                                </div>
                                
                                <p class="shop-item-description">
                                    ${housing.area}
                                </p>
                                
                                <div class="shop-item-stats">
                                    ${housing.isDefault ? `
                                        <div class="shop-stat">Бесплатно</div>
                                    ` : ''}
                                    ${housing.rentPrice !== null && !housing.isDefault ? `
                                        <div class="shop-stat">Аренда: ${housing.rentPrice.toLocaleString()} уе/мес</div>
                                    ` : ''}
                                    ${housing.buyPrice !== null && !housing.isDefault ? `
                                        <div class="shop-stat">Покупка: ${housing.buyPrice.toLocaleString()} уе</div>
                                    ` : ''}
                                </div>
                                
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid ${getThemeColors().border};">
                                    <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                        ${housing.isDefault ? 'Бесплатно' : (housing.buyPrice ? housing.buyPrice.toLocaleString() + ' уе' : 'Только аренда')}
                                    </span>
                                    <div style="display: flex; gap: 0.5rem;">
                                        ${housing.isDefault && !isOwned ? `
                                            <button class="pill-button primary-button" onclick="moveToDefaultHousing()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                                Заселиться
                                            </button>
                                        ` : ''}
                                        ${housing.isDefault && isOwned ? `
                                            <div style="color: ${getThemeColors().success}; font-size: 0.8rem; padding: 0.4rem 0.8rem; font-weight: 600;">✓ В собственности</div>
                                        ` : ''}
                                        ${!housing.isDefault && housing.rentPrice !== null ? `
                                            <button class="pill-button warning-button" onclick="rentHousing('${housing.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                                Арендовать
                                            </button>
                                        ` : ''}
                                        ${!housing.isDefault && housing.buyPrice !== null ? `
                                            <button class="pill-button success-button" onclick="buyHousing('${housing.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                                Купить
                                            </button>
                                        ` : ''}
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
            modal.remove();
        }
    });
}

// Магазин коммерческой недвижимости
function showCommercialPropertyShop() {
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
                <h3><img src="https://static.tildacdn.com/tild6565-3931-4133-a232-393964383262/case.png" alt="🏢" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин коммерческой недвижимости</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="margin-bottom: 1rem; padding: 1rem; background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px;">
                    <h4 style="color: ${getThemeColors().success}; margin-bottom: 0.5rem;">Памятка:</h4>
                    <p style="color: ${getThemeColors().text}; font-size: 0.9rem; margin: 0;">
                        • Коммерческая недвижимость доступна только для аренды<br>
                        • Аренда оплачивается ежедневно<br>
                        • Отличное место для ведения бизнеса или торговли
                    </p>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;">
                    ${COMMERCIAL_PROPERTY_OPTIONS.map(property => `
                        <div class="shop-item">
                            <div class="shop-item-header">
                                <h4 class="shop-item-title">${property.name}</h4>
                            </div>
                            
                            <p class="shop-item-description">
                                ${property.area}
                            </p>
                            
                            <div class="shop-item-stats">
                                <div class="shop-stat">Аренда: ${property.rentPrice.toLocaleString()} уе/сутки</div>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid ${getThemeColors().border};">
                                <span style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;">
                                    ${property.rentPrice.toLocaleString()} уе/сутки
                                </span>
                                <button class="pill-button warning-button" onclick="rentCommercialProperty('${property.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                                    Арендовать
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
            modal.remove();
        }
    });
}

// Функции для покупки и аренды жилья
function buyHousing(housingId) {
    if (typeof HOUSING_OPTIONS === 'undefined') {
        console.error('HOUSING_OPTIONS не определена! Проверьте, загружен ли data.js');
        showModal('Ошибка', 'Данные о жилье не загружены. Перезагрузите страницу (Ctrl+F5).');
        return;
    }
    
    const housing = HOUSING_OPTIONS.find(h => h.id === housingId);
    if (!housing) {
        console.error('Жилье не найдено:', housingId);
        showToast('Жилье не найдено!', 2000);
        return;
    }
    
    if (!housing.buyPrice) {
        showToast('Это жилье нельзя купить!', 2000);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    if (currentMoney < housing.buyPrice) {
        showModal('Недостаточно средств', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег!</p>
                <p style="color: ${getThemeColors().muted};">Нужно: ${housing.buyPrice.toLocaleString()} уе</p>
                <p style="color: ${getThemeColors().muted};">У вас: ${currentMoney.toLocaleString()} уе</p>
                <p style="color: ${getThemeColors().muted};">Не хватает: ${(housing.buyPrice - currentMoney).toLocaleString()} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - housing.buyPrice;
    updateMoneyDisplay();
    
    // Добавляем жилье в собственность
    const newHousing = {
        ...housing,
        isOwned: true,
        purchasePrice: housing.buyPrice
    };
    state.property.housing.push(newHousing);
    
    // Обновляем UI
    renderHousing();
    scheduleSave();
    
    // Показываем уведомление
    showToast(`${housing.name} куплено за ${housing.buyPrice.toLocaleString()} уе!`, 3000);
    addToRollLog('purchase', { item: housing.name, price: housing.buyPrice, category: 'Жилье' });
    
    // Закрываем модал магазина жилья
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

// Функция для заселения в стартовую квартиру
function moveToDefaultHousing() {
    // Находим стартовое жилье в каталоге
    const housingTemplate = HOUSING_OPTIONS.find(h => h.isDefault);
    if (!housingTemplate) {
        showToast('Стартовое жилье не найдено', 'error');
        return;
    }
    
    // Проверяем, есть ли уже стартовое жилье в собственности
    const existingHousing = state.property.housing.find(h => h.id === housingTemplate.id);
    if (existingHousing && existingHousing.isOwned) {
        showToast('Вы уже проживаете в стартовой квартире', 'info');
        return;
    }
    
    // Если стартового жилья нет, добавляем его
    if (!existingHousing) {
        const newHousing = {
            ...housingTemplate,
            isOwned: true,
            purchasePrice: 0,
            purchaseDate: new Date().toISOString()
        };
        state.property.housing.push(newHousing);
    } else {
        // Если есть, но не в собственности, делаем его собственным
        existingHousing.isOwned = true;
        existingHousing.rentPrice = 0;
    }
    
    // Обновляем UI
    renderHousing();
    scheduleSave();
    
    // Показываем уведомление
    showToast(`Заселились в ${housingTemplate.name}`, 'success');
    addToRollLog('move_in', { item: housingTemplate.name, price: 0, category: 'Жилье (заселение)' });
    
    // Закрываем модальное окно магазина
    closeModal();
}

function rentHousing(housingId) {
    if (typeof HOUSING_OPTIONS === 'undefined') {
        console.error('HOUSING_OPTIONS не определена! Проверьте, загружен ли data.js');
        showModal('Ошибка', 'Данные о жилье не загружены. Перезагрузите страницу (Ctrl+F5).');
        return;
    }
    
    const housing = HOUSING_OPTIONS.find(h => h.id === housingId);
    if (!housing) {
        console.error('Жилье не найдено:', housingId);
        showToast('Жилье не найдено!', 2000);
        return;
    }
    
    if (!housing.rentPrice) {
        showToast('Это жилье нельзя арендовать!', 2000);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    if (currentMoney < housing.rentPrice) {
        showModal('Недостаточно средств', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег!</p>
                <p style="color: ${getThemeColors().muted};">Нужно: ${housing.rentPrice.toLocaleString()} уе/мес</p>
                <p style="color: ${getThemeColors().muted};">У вас: ${currentMoney.toLocaleString()} уе</p>
                <p style="color: ${getThemeColors().muted};">Не хватает: ${(housing.rentPrice - currentMoney).toLocaleString()} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - housing.rentPrice;
    updateMoneyDisplay();
    
    // Добавляем жилье в аренду
    const newHousing = {
        ...housing,
        isOwned: false
    };
    state.property.housing.push(newHousing);
    
    // Обновляем UI
    renderHousing();
    scheduleSave();
    
    // Показываем уведомление
    showToast(`${housing.name} арендовано за ${housing.rentPrice.toLocaleString()} уе/мес!`, 3000);
    addToRollLog('rent', { item: housing.name, price: housing.rentPrice, category: 'Жилье (аренда)' });
    
    // Закрываем модал магазина жилья
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

// Функции для аренды коммерческой недвижимости
function rentCommercialProperty(propertyId) {
    if (typeof COMMERCIAL_PROPERTY_OPTIONS === 'undefined') {
        console.error('COMMERCIAL_PROPERTY_OPTIONS не определена! Проверьте, загружен ли data.js');
        showModal('Ошибка', 'Данные о коммерческой недвижимости не загружены. Перезагрузите страницу (Ctrl+F5).');
        return;
    }
    
    const property = COMMERCIAL_PROPERTY_OPTIONS.find(p => p.id === propertyId);
    if (!property) {
        console.error('Коммерческая недвижимость не найдена:', propertyId);
        showToast('Коммерческая недвижимость не найдена!', 2000);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    if (currentMoney < property.rentPrice) {
        showModal('Недостаточно средств', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно денег!</p>
                <p style="color: ${getThemeColors().muted};">Нужно: ${property.rentPrice.toLocaleString()} уе/сутки</p>
                <p style="color: ${getThemeColors().muted};">У вас: ${currentMoney.toLocaleString()} уе</p>
                <p style="color: ${getThemeColors().muted};">Не хватает: ${(property.rentPrice - currentMoney).toLocaleString()} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - property.rentPrice;
    updateMoneyDisplay();
    
    // Добавляем коммерческую недвижимость в аренду
    const newProperty = {
        ...property,
        isOwned: false
    };
    state.property.commercialProperty.push(newProperty);
    
    // Обновляем UI
    renderCommercialProperty();
    scheduleSave();
    
    // Показываем уведомление
    showToast(`${property.name} арендовано за ${property.rentPrice.toLocaleString()} уе/сутки!`, 3000);
    addToRollLog('purchase', { item: property.name, price: property.rentPrice, category: 'Коммерческая недвижимость' });
    
    // Закрываем модал магазина коммерческой недвижимости
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.remove();
    }
}

// Функции для удаления жилья и коммерческой недвижимости
function removeHousing(index) {
    const housing = state.property.housing[index];
    if (!housing) return;
    
    if (housing.isDefault) {
        showToast('Нельзя удалить стартовое жилье!', 2000);
        return;
    }
    
    showModal('Удалить жилье', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().text}; font-size: 1.1rem; margin-bottom: 1rem;">Удалить "${housing.name}"?</p>
            <p style="color: ${getThemeColors().muted};">Это действие нельзя отменить.</p>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                <button class="pill-button danger-button" onclick="confirmRemoveHousing(${index})">Удалить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `);
}

function confirmRemoveHousing(index) {
    const housing = state.property.housing[index];
    if (!housing) return;
    
    state.property.housing.splice(index, 1);
    renderHousing();
    scheduleSave();
    
    showToast(`${housing.name} удалено!`, 2000);
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
}

function removeCommercialProperty(index) {
    const property = state.property.commercialProperty[index];
    if (!property) return;
    
    showModal('Удалить коммерческую недвижимость', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: ${getThemeColors().text}; font-size: 1.1rem; margin-bottom: 1rem;">Удалить "${property.name}"?</p>
            <p style="color: ${getThemeColors().muted};">Это действие нельзя отменить.</p>
            <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                <button class="pill-button danger-button" onclick="confirmRemoveCommercialProperty(${index})">Удалить</button>
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
            </div>
        </div>
    `);
}

function confirmRemoveCommercialProperty(index) {
    const property = state.property.commercialProperty[index];
    if (!property) return;
    
    state.property.commercialProperty.splice(index, 1);
    renderCommercialProperty();
    scheduleSave();
    
    showToast(`${property.name} удалено!`, 2000);
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
}

// СТАРАЯ ФУНКЦИЯ для архива, используется новая система transport.js
/*
function showVehicleShop() {
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
                <h3><img src="https://static.tildacdn.com/tild3130-6637-4132-a334-663633373435/car.png" alt="🚗" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин транспорта</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleVehiclesFreeMode()" id="vehiclesFreeModeButton" style="background: transparent; border: 1px solid ${getThemeColors().border}; color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
    `;
    
    // Проходим по всем категориям транспорта
    for (const [category, vehicles] of Object.entries(VEHICLES_LIBRARY)) {
        shopHTML += `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: ${getThemeColors().accent}; font-size: 1rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid ${getThemeColors().border}; padding-bottom: 0.5rem;">${category}</h4>
                <div style="display: grid; gap: 1rem;">
                    ${vehicles.map((vehicle) => `
                        <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem;">${vehicle.name}</div>
                                    <div style="color: ${getThemeColors().muted}; font-size: 0.85rem; margin-bottom: 0.75rem;">${vehicle.description.replace(/"/g, '&quot;')}</div>
                                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.8rem; color: ${getThemeColors().text}; margin-bottom: 0.75rem;">
                                        <div><strong>ПЗ:</strong> ${vehicle.hp}</div>
                                        <div><strong>Места:</strong> ${vehicle.seats}</div>
                                        <div><strong>Скорость:</strong> ${vehicle.mechanicalSpeed}</div>
                                        <div><strong>Макс. скорость:</strong> ${vehicle.narrativeSpeed}</div>
                                    </div>
                                    <div class="vehicle-price-display" style="color: ${getThemeColors().success}; font-weight: 600; font-size: 1rem;" data-original-price="${vehicle.price}">
                                        ${(() => {
                                            // Рассчитываем скидку только от "Друга семьи"
                                            const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
                                            const familyFriendDiscount = familyFriendLevel * 10;
                                            
                                            const totalDiscount = Math.min(familyFriendDiscount / 100, 1.0);
                                            const finalPrice = Math.floor(vehicle.price * (1 - totalDiscount));
                                            const hasDiscount = totalDiscount > 0 && finalPrice < vehicle.price;
                                            
                                            return hasDiscount ? 
                                                `Цена: <span style="text-decoration: line-through; color: ${getThemeColors().muted};">${vehicle.price}</span> <span style="color: ${getThemeColors().success}; font-weight: 600;">${finalPrice}</span> <span style="color: ${getThemeColors().success}; font-size: 0.75rem;">(-${Math.round(totalDiscount * 100)}%)</span> уе` :
                                                `Цена: ${vehicle.price} уе`;
                                        })()}
                                    </div>
                                </div>
                                <div style="margin-left: 1rem;">
                                    ${(() => {
                                        // Проверяем, является ли транспорт с переменной ценой
                                        const isVariablePrice = vehicle.name === 'Скайлинер' || vehicle.name === 'Круизная Яхта' || vehicle.name === 'Автопоезд';
                                        
                                        if (isVariablePrice) {
                                            return `<button class="pill-button primary-button" onclick="showVehicleQuantityModal('${vehicle.name.replace(/'/g, "\\'")}', '${vehicle.description.replace(/'/g, "\\'")}', '${vehicle.hp}', '${vehicle.seats}', ${vehicle.mechanicalSpeed}, '${vehicle.narrativeSpeed}', '${vehicle.price}', '${vehicle.category}')" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Выбрать количество</button>`;
                                        } else {
                                            return `<button class="pill-button primary-button vehicle-buy-button" onclick="buyVehicle('${vehicle.name.replace(/'/g, "\\'")}', '${vehicle.description.replace(/'/g, "\\'")}', ${vehicle.hp}, ${vehicle.seats}, ${vehicle.mechanicalSpeed}, '${vehicle.narrativeSpeed}', ${vehicle.price}, '${vehicle.category}', null)" data-vehicle-name="${vehicle.name.replace(/'/g, "\\'")}" data-description="${vehicle.description.replace(/'/g, "\\'")}" data-hp="${vehicle.hp}" data-seats="${vehicle.seats}" data-mechanical-speed="${vehicle.mechanicalSpeed}" data-narrative-speed="${vehicle.narrativeSpeed}" data-price="${vehicle.price}" data-category="${vehicle.category}" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Купить</button>`;
                                        }
                                    })()}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    shopHTML += `
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
*/

// Функция показа модального окна для выбора количества кают/секций
function showVehicleQuantityModal(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, priceString, category) {
    // Парсим параметры цены
    let unitPrice, minQuantity, maxQuantity, unitName;
    
    if (name === 'Скайлинер') {
        unitPrice = 10000;
        minQuantity = 3;
        maxQuantity = null; // не ограничено
        unitName = 'кают';
    } else if (name === 'Круизная Яхта') {
        unitPrice = 20000;
        minQuantity = 2;
        maxQuantity = null; // не ограничено
        unitName = 'кают';
    } else if (name === 'Автопоезд') {
        unitPrice = 50000;
        minQuantity = 1;
        maxQuantity = 4;
        unitName = 'секций';
    }
    
    // Рассчитываем скидку от "Друга семьи"
    const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
    const familyFriendDiscount = familyFriendLevel * 10;
    const totalDiscount = Math.min(familyFriendDiscount / 100, 1.0);
    const discountedUnitPrice = Math.floor(unitPrice * (1 - totalDiscount));
    
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
                <h3>${name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--text); margin-bottom: 0.5rem;"><strong>Описание:</strong></p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">${description}</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.8rem; color: var(--text); margin-bottom: 1rem;">
                        <div><strong>ПЗ:</strong> ${hp}</div>
                        <div><strong>Места:</strong> ${seats}</div>
                        <div><strong>Скорость:</strong> ${mechanicalSpeed}</div>
                        <div><strong>Макс. скорость:</strong> ${narrativeSpeed}</div>
                    </div>
                </div>
                
                <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <h4 style="color: var(--accent); margin-bottom: 0.5rem;">Выберите количество ${unitName}:</h4>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                        <label style="color: var(--text); font-weight: 600;">Количество:</label>
                        <input type="text" id="vehicleQuantity" value="${minQuantity}" style="width: 80px; padding: 0.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; color: var(--text); text-align: center;" placeholder="${minQuantity}">
                        <span style="color: var(--muted); font-size: 0.9rem;">${unitName}</span>
                    </div>
                    
                    <div style="margin-bottom: 1rem;">
                        <p style="color: var(--text); margin-bottom: 0.25rem;"><strong>Цена за ${unitName.slice(0, -1)}у:</strong></p>
                        ${totalDiscount > 0 ? 
                            `<p style="color: var(--success); font-weight: 600;"><span style="text-decoration: line-through; color: var(--muted);">${unitPrice.toLocaleString()}</span> <span style="color: var(--success);">${discountedUnitPrice.toLocaleString()}</span> уе <span style="color: var(--success); font-size: 0.8rem;">(-${Math.round(totalDiscount * 100)}%)</span></p>` :
                            `<p style="color: var(--success); font-weight: 600;">${unitPrice.toLocaleString()} уе</p>`
                        }
                    </div>
                    
                    <div id="totalPriceDisplay" style="background: rgba(0, 100, 50, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; text-align: center;">
                        <p style="color: var(--success); font-weight: 600; font-size: 1.1rem; margin: 0;">
                            Итого: <span id="totalPriceValue">${(minQuantity * discountedUnitPrice).toLocaleString()}</span> уе
                        </p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
                <button class="pill-button primary-button" onclick="buyVehicleWithQuantity('${name.replace(/'/g, "\\'")}', '${description.replace(/'/g, "\\'")}', '${hp}', '${seats}', ${mechanicalSpeed}, '${narrativeSpeed}', ${unitPrice}, ${minQuantity}, ${maxQuantity || 'null'}, '${unitName}', '${category}')">Купить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчик изменения количества
    const quantityInput = document.getElementById('vehicleQuantity');
    const totalPriceValue = document.getElementById('totalPriceValue');
    
    // Валидация: только цифры
    quantityInput.addEventListener('input', function() {
        // Удаляем все символы кроме цифр
        this.value = this.value.replace(/[^0-9]/g, '');
        
        const quantity = parseInt(this.value) || minQuantity;
        
        // Проверяем ограничения
        if (quantity < minQuantity) {
            this.value = minQuantity;
        } else if (maxQuantity && quantity > maxQuantity) {
            this.value = maxQuantity;
        }
        
        const finalQuantity = parseInt(this.value) || minQuantity;
        const totalPrice = finalQuantity * discountedUnitPrice;
        totalPriceValue.textContent = totalPrice.toLocaleString();
    });
    
    // Предотвращаем ввод букв при нажатии клавиш
    quantityInput.addEventListener('keypress', function(e) {
        // Разрешаем только цифры, Backspace, Delete, Tab, Escape, Enter
        if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(e.key)) {
            e.preventDefault();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
    
    // Добавляем универсальные обработчики клавиш
    addModalKeyboardHandlers(modal);
}

// Функция покупки транспорта с выбранным количеством кают/секций
function buyVehicleWithQuantity(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, unitPrice, minQuantity, maxQuantity, unitName, category) {
    const quantityInput = document.getElementById('vehicleQuantity');
    const quantity = parseInt(quantityInput.value) || minQuantity;
    
    // Проверяем ограничения
    if (quantity < minQuantity) {
        showModal('Ошибка', 'Количество не может быть меньше минимального значения.');
        return;
    }
    
    if (maxQuantity && quantity > maxQuantity) {
        showModal('Ошибка', 'Количество не может быть больше максимального значения.');
        return;
    }
    
    // Рассчитываем скидку от "Друга семьи"
    const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
    const familyFriendDiscount = familyFriendLevel * 10;
    const totalDiscount = Math.min(familyFriendDiscount / 100, 1.0);
    const discountedUnitPrice = Math.floor(unitPrice * (1 - totalDiscount));
    const totalPrice = quantity * discountedUnitPrice;
    
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < totalPrice) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши!</p>
                <p style="color: var(--muted);">Нужно: ${totalPrice.toLocaleString()} уе</p>
                <p style="color: var(--muted);">Доступно: ${currentMoney.toLocaleString()} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - totalPrice;
    updateMoneyDisplay();
    
    // Создаем название с количеством
    const vehicleName = `${name} (${quantity} ${unitName})`;
    
    // Рассчитываем характеристики с учетом количества
    let finalHp, finalSeats;
    if (name === 'Скайлинер') {
        finalHp = 200 * quantity; // 200 ПЗ за каюту
        finalSeats = 2 * quantity; // 2 места за каюту
    } else if (name === 'Круизная Яхта') {
        finalHp = 70 * quantity; // 70 ПЗ за каюту
        finalSeats = 4 * quantity; // 4 места за каюту
    } else if (name === 'Автопоезд') {
        finalHp = 70 * quantity; // 70 ПЗ за секцию
        finalSeats = 4 * quantity; // 4 места за секцию
    }
    
    // Добавляем транспорт
    const newVehicle = {
        id: generateId('vehicle'),
        name: vehicleName,
        description: `${description} (${quantity} ${unitName})`,
        hp: finalHp,
        currentHp: finalHp,
        seats: finalSeats,
        mechanicalSpeed: mechanicalSpeed,
        narrativeSpeed: narrativeSpeed,
        price: unitPrice * quantity, // Оригинальная цена без скидки
        catalogPrice: unitPrice * quantity,
        purchasePrice: totalPrice, // Цена покупки со скидкой
        itemType: 'variable_price',
        category: category,
        modules: [],
        trunk: [], // Багажник транспорта
        isDefault: false,
        variablePriceData: {
            unitPrice: unitPrice,
            quantity: quantity,
            unitName: unitName,
            minQuantity: minQuantity,
            maxQuantity: maxQuantity
        }
    };
    
    state.property.vehicles.push(newVehicle);
    renderTransport();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: vehicleName,
        price: totalPrice,
        category: 'Транспорт'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    let discountText = '';
    if (totalDiscount > 0) {
        const discountPercent = Math.round(totalDiscount * 100);
        discountText = `<p style="color: var(--success); margin-bottom: 0.5rem;">Скидка ${discountPercent}% благодаря навыку "Друг семьи" (${familyFriendDiscount}%)!</p>`;
    }
    
    showModal('Транспорт куплен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${vehicleName} куплен!</p>
            ${discountText}
            <p style="color: var(--muted);">Количество: ${quantity} ${unitName}</p>
            <p style="color: var(--muted);">Списано: ${totalPrice.toLocaleString()} уе</p>
        </div>
    `);
}

function buyVehicle(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, price, category, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    // Проверяем навык "Друг семьи" для скидки на покупку транспорта
    const familyFriendLevel = getProfessionalSkillLevel('Друг семьи');
    const familyFriendDiscount = familyFriendLevel * 10; // 10% скидка за уровень "Друга семьи"
    
    // Скидка только от "Друга семьи" (максимум 100%)
    const totalDiscount = Math.min(familyFriendDiscount / 100, 1.0);
    const finalPrice = Math.floor(price * (1 - totalDiscount));
    
    if (currentMoney < finalPrice) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши!</p>
                <p style="color: var(--muted);">Нужно: ${finalPrice} уе</p>
                <p style="color: var(--muted);">Доступно: ${currentMoney} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - finalPrice;
    updateMoneyDisplay();
    
    // Добавляем транспорт
    const newVehicle = {
        id: generateId('vehicle'),
        name: name,
        description: description,
        hp: hp,
        currentHp: hp,
        seats: seats,
        mechanicalSpeed: mechanicalSpeed,
        narrativeSpeed: narrativeSpeed,
        price: catalogPrice || price,  // Используем каталожную цену если есть
        catalogPrice: catalogPrice,     // Сохраняем каталожную цену отдельно
        purchasePrice: finalPrice,      // Сохраняем цену покупки (с учётом скидки)
        itemType: finalPrice === 0 && catalogPrice > 0 ? 'free_catalog' : 'catalog',  // Маркер для скупщика
        category: category,
        modules: [],
        isDefault: false
    };
    
    state.property.vehicles.push(newVehicle);
    renderTransport();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: finalPrice,
        category: 'Транспорт'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    let discountText = '';
    if (totalDiscount > 0) {
        const discountPercent = Math.round(totalDiscount * 100);
        discountText = `<p style="color: var(--success); margin-bottom: 0.5rem;">Скидка ${discountPercent}% благодаря навыку "Друг семьи" (${familyFriendDiscount}%)!</p>`;
    }
    
    showModal('Транспорт куплен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} куплен!</p>
            ${discountText}
            <p style="color: var(--muted);">Списано: ${finalPrice} уе</p>
        </div>
    `);
}

function toggleVehiclesFreeMode() {
    const buyButtons = document.querySelectorAll('.vehicle-buy-button');
    const priceDisplays = document.querySelectorAll('.vehicle-price-display');
    const toggleButton = document.getElementById('vehiclesFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-vehicle-name');
            const description = btn.getAttribute('data-description');
            const hp = btn.getAttribute('data-hp');
            const seats = btn.getAttribute('data-seats');
            const mechanicalSpeed = btn.getAttribute('data-mechanical-speed');
            const narrativeSpeed = btn.getAttribute('data-narrative-speed');
            const price = btn.getAttribute('data-price');
            const category = btn.getAttribute('data-category');
            btn.setAttribute('onclick', `buyVehicle('${name}', '${description}', ${hp}, ${seats}, ${mechanicalSpeed}, '${narrativeSpeed}', ${price}, '${category}', null)`);
        });
        
        // Возвращаем обычные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            display.textContent = `Цена: ${originalPrice} уе`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-vehicle-name');
            const description = btn.getAttribute('data-description');
            const hp = btn.getAttribute('data-hp');
            const seats = btn.getAttribute('data-seats');
            const mechanicalSpeed = btn.getAttribute('data-mechanical-speed');
            const narrativeSpeed = btn.getAttribute('data-narrative-speed');
            const category = btn.getAttribute('data-category');
            btn.setAttribute('onclick', `buyVehicle('${name}', '${description}', ${hp}, ${seats}, ${mechanicalSpeed}, '${narrativeSpeed}', 0, '${category}', ${btn.getAttribute('data-price')})`);
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

function sellVehicle(vehicleId) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Проверяем, есть ли предметы в багажнике
    if (vehicle.trunk && vehicle.trunk.length > 0) {
        showModal('Нельзя продать транспорт', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">В багажнике есть предметы!</p>
                <p style="color: var(--muted);">Сначала выньте все предметы из багажника или переложите их в другой транспорт.</p>
                <p style="color: var(--muted); font-size: 0.8rem; margin-top: 0.5rem;">
                    Предметов в багажнике: ${vehicle.trunk.length}
                </p>
            </div>
        `);
        return;
    }
    
    // Для стартового микромобиля цена продажи фиксированная 7500уе
    const sellPrice = vehicle.isDefault ? 7500 : Math.floor(vehicle.price * 0.5);
    
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
                <h3>Продать транспорт</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text); font-size: 1rem; margin-bottom: 1rem;">
                    Продать <strong>${vehicle.name}</strong> за <span style="color: var(--success);">${sellPrice} уе</span>?
                </p>
                <p style="text-align: center; color: var(--muted); font-size: 0.85rem;">
                    (50% от стоимости покупки)
                </p>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="confirmSellVehicle('${vehicleId}', ${sellPrice})">Продать</button>
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

function confirmSellVehicle(vehicleId, sellPrice) {
    // Находим транспорт
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    
    // ВАЖНО: Возвращаем оружие из модулей в блок "Оружие" перед продажей
    if (vehicle && vehicle.modules && vehicle.modules.length > 0) {
        let totalWeaponsReturned = 0;
        vehicle.modules.forEach(module => {
            if (module.weapons && module.weapons.length > 0) {
                module.weapons.forEach(weapon => {
                    state.weapons.push(weapon);
                    totalWeaponsReturned++;
                });
            }
        });
        
        if (totalWeaponsReturned > 0) {
            showToast(`Оружие из модулей транспорта (${totalWeaponsReturned} шт.) возвращено в блок "Оружие"`, 3000);
        }
    }
    
    state.property.vehicles = state.property.vehicles.filter(v => v.id !== vehicleId);
    state.money = parseInt(state.money) + sellPrice;
    updateMoneyDisplay();
    renderTransport();
    renderWeapons(); // Обновляем блок оружия
    scheduleSave();
    
    // Логируем продажу транспорта как получение денег
    addToRollLog('transaction', {
        amount: sellPrice,
        source: 'Продажа транспорта',
        taxPaid: 0
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Транспорт продан', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; Транспорт продан!</p>
            <p style="color: var(--muted);">Получено: ${sellPrice} уе</p>
        </div>
    `);
}

// СТАРАЯ ФУНКЦИЯ - ЗАКОММЕНТИРОВАНА, используется новая система transport.js
/*
function showVehicleModulesShop() {
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
                <h3>&#x2699;&#xFE0F; Магазин модулей транспорта</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleVehicleModulesFreeMode()" id="vehicleModulesFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
    `;
    
    // Проходим по всем категориям модулей
    const categories = {
        'ground': 'Модули для наземного транспорта',
        'air': 'Модули для воздушного транспорта',
        'water': 'Модули для водного транспорта'
    };
    
    for (const [category, categoryName] of Object.entries(categories)) {
        const modules = VEHICLE_MODULES_LIBRARY[category] || [];
        if (modules.length === 0) continue;
        
        shopHTML += `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: var(--accent); font-size: 1rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">${categoryName}</h4>
                <div style="display: grid; gap: 1rem;">
                    ${modules.map((module) => `
                        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem;">${module.name}</div>
                                    <div style="color: var(--muted); font-size: 0.85rem; margin-bottom: 0.75rem;">${module.description}</div>
                                    ${module.requirements && module.requirements.length > 0 ? `
                                        <div style="color: var(--danger); font-size: 0.8rem; margin-bottom: 0.5rem;">
                                            <strong>Требования:</strong> ${module.requirements.join(', ')}
                                        </div>
                                    ` : ''}
                                    <div class="vehicle-module-price-display" style="color: var(--success); font-weight: 600; font-size: 1rem;" data-original-price="${module.price}">Цена: ${module.price} у.е.</div>
                                </div>
                                <div style="margin-left: 1rem;">
                                    <button class="pill-button primary-button vehicle-module-buy-button" onclick="buyVehicleModule('${module.name.replace(/'/g, "\\'")}', '${module.description.replace(/'/g, "\\'")}', ${module.price}, '${module.category}', '${JSON.stringify(module.requirements || []).replace(/'/g, "\\'")}' )" data-module-name="${module.name.replace(/'/g, "\\'")}" data-description="${module.description.replace(/'/g, "\\'")}" data-price="${module.price}" data-category="${module.category}" data-requirements="${JSON.stringify(module.requirements || []).replace(/'/g, "\\'")}" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Купить</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    shopHTML += `
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
*/

function getVehicleModuleFree(name, description, category, requirementsStr) {
    const requirements = JSON.parse(requirementsStr);
    
    // Добавляем модуль в снаряжение бесплатно
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: 0,
        load: 5,
        type: 'vehicle_module',
        moduleData: {
            category: category,
            requirements: requirements
        }
    };
    
    state.gear.push(newGear);
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль получен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} получен!</p>
            <p style="color: var(--muted); margin-bottom: 0.5rem;">Модуль добавлен в снаряжение.</p>
            <p style="color: var(--muted);">Установите его через меню управления модулями транспорта.</p>
        </div>
    `);
}

function toggleVehicleModulesFreeMode() {
    const buyButtons = document.querySelectorAll('.vehicle-module-buy-button');
    const priceDisplays = document.querySelectorAll('.vehicle-module-price-display');
    const toggleButton = document.getElementById('vehicleModulesFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-module-name');
            const description = btn.getAttribute('data-description');
            const price = btn.getAttribute('data-price');
            const category = btn.getAttribute('data-category');
            const requirements = btn.getAttribute('data-requirements');
            btn.setAttribute('onclick', `buyVehicleModule('${name}', '${description}', ${price}, '${category}', '${requirements}')`);
        });
        
        // Возвращаем обычные цены визуально
        priceDisplays.forEach(display => {
            const originalPrice = display.getAttribute('data-original-price');
            display.textContent = `Цена: ${originalPrice} уе`;
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-module-name');
            const description = btn.getAttribute('data-description');
            const category = btn.getAttribute('data-category');
            const requirements = btn.getAttribute('data-requirements');
            btn.setAttribute('onclick', `getVehicleModuleFree('${name}', '${description}', '${category}', '${requirements}')`);
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

function buyVehicleModule(name, description, price, category, requirementsStr, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    const requirements = JSON.parse(requirementsStr);
    
    // Проверяем, есть ли активный транспорт
    if (!state.property || !state.property.vehicles || state.property.vehicles.length === 0) {
        showModal('Нет транспорта', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Нет активного транспорта!</p>
                <p style="color: var(--muted);">Модули транспорта можно купить только при наличии транспорта.</p>
            </div>
        `);
        return;
    }
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши!</p>
                <p style="color: var(--muted);">Нужно: ${price} уе</p>
                <p style="color: var(--muted);">Доступно: ${currentMoney} уе</p>
            </div>
        `);
        return;
    }
    
    // Если транспортов несколько, выбираем багажник
    let targetVehicle;
    if (state.property.vehicles.length === 1) {
        targetVehicle = state.property.vehicles[0];
    } else {
        // Показываем выбор багажника
        showVehicleTrunkSelection(name, description, price, category, requirementsStr, catalogPrice);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Добавляем модуль в нужное место
    const newModule = {
        id: generateId('vehicleModule'),
        name: name,
        description: description,
        price: price,
        category: category,
        requirements: requirements,
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased',
        moduleType: 'vehicle_module'
    };
    
    if (targetVehicle.linkedGearId) {
        // Для велосипеда добавляем в снаряжение
        state.gear.push(newModule);
        renderGear();
        showToast(`${name} куплен и помещен в снаряжение!`, 2000);
    } else {
        // Для обычного транспорта добавляем в багажник
        if (!targetVehicle.trunk) {
            targetVehicle.trunk = [];
        }
        targetVehicle.trunk.push(newModule);
        renderTransport();
        showToast(`${name} куплен и помещен в багажник ${targetVehicle.name}!`, 2000);
    }
    
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Модуль транспорта'
    });
}

// Функция для выбора багажника при покупке модуля
function showVehicleTrunkSelection(name, description, price, category, requirementsStr, catalogPrice) {
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
        z-index: 10001;
    `;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px; width: 90%;">
            <div class="modal-header">
                <h3>Выберите багажник для модуля</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">
                    Модуль <strong>${name}</strong> будет помещен в багажник выбранного транспорта.
                </p>
                <div style="display: grid; gap: 0.5rem;">
                    ${state.property.vehicles.map(vehicle => `
                        <button onclick="confirmVehicleModulePurchase('${vehicle.id}', '${name}', '${description.replace(/'/g, "\\'")}', ${price}, '${category}', '${requirementsStr}', ${catalogPrice})" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; cursor: pointer; transition: all 0.2s ease; text-align: left; color: var(--text);">
                            <div style="font-weight: 500; margin-bottom: 0.25rem;">${vehicle.name}</div>
                            <div style="font-size: 0.8rem; color: var(--muted);">
                                Предметов в багажнике: ${vehicle.trunk ? vehicle.trunk.length : 0}
                            </div>
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    });
}

// Функция для подтверждения покупки модуля в конкретный багажник
function confirmVehicleModulePurchase(vehicleId, name, description, price, category, requirementsStr, catalogPrice) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
        showToast('Транспорт не найден!', 2000);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    const requirements = JSON.parse(requirementsStr);
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Добавляем модуль в багажник транспорта
    const newModule = {
        id: generateId('vehicleModule'),
        name: name,
        description: description,
        price: price,
        category: category,
        requirements: requirements,
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased',
        moduleType: 'vehicle_module'
    };
    
    vehicle.trunk.push(newModule);
    renderTransport();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Модуль транспорта'
    });
    
    // Закрываем модал выбора
    const selectModal = document.querySelector('.modal-overlay:last-child');
    if (selectModal) {
        selectModal.remove();
    }
    
    // Показываем toast-уведомление
    showToast(`${name} куплен и помещен в багажник ${vehicle.name}!`, 2000);
}

// Дублированные функции удалены - они находятся в vehicles.js

// Дублированные функции удалены - они находятся в vehicles.js

// Дублированная функция удалена - она находится в vehicles.js

function confirmInstallVehicleModule(vehicleId, moduleId, installCost) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    const moduleItem = vehicle.trunk.find(m => m.id === moduleId);
    
    if (!vehicle || !moduleItem) return;
    
    // Списываем деньги если нужно
    if (installCost > 0) {
        state.money = parseInt(state.money) - installCost;
        updateMoneyDisplay();
    }
    
    // Проверяем взаимоисключающие модули перед установкой
    if (moduleItem.name === 'Бронирование корпуса') {
        const hasBodyReinforcement = vehicle.modules.some(m => m.name === 'Усиление корпуса');
        if (hasBodyReinforcement) {
            showModal('Несовместимые модули', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Невозможно установить!</p>
                    <p style="color: var(--muted);">Бронирование корпуса нельзя установить вместе с Усилением корпуса</p>
                </div>
            `);
            return;
        }
    }
    
    if (moduleItem.name === 'Усиление корпуса') {
        const hasBodyArmoring = vehicle.modules.some(m => m.name === 'Бронирование корпуса');
        if (hasBodyArmoring) {
            showModal('Несовместимые модули', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Невозможно установить!</p>
                    <p style="color: var(--muted);">Усиление корпуса нельзя установить вместе с Бронированием корпуса</p>
                </div>
            `);
            return;
        }
    }
    
    // Проверяем ограничение на количество Дополнительных сидений
    if (moduleItem.name === 'Дополнительные сиденья') {
        const seatsCount = vehicle.modules.filter(m => m.name === 'Дополнительные сиденья').length;
        if (seatsCount >= 3) {
            showModal('Лимит достигнут', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Нельзя установить больше!</p>
                    <p style="color: var(--muted);">Максимум можно установить 3 модуля "Дополнительные сиденья"</p>
                </div>
            `);
            return;
        }
    }
    
    // Для форсированных двигателей - замена предыдущей стадии
    if (moduleItem.name === 'Форсированный двигатель (Стадия 2)') {
        const stage1Index = vehicle.modules.findIndex(m => m.name === 'Форсированный двигатель (Стадия 1)');
        if (stage1Index !== -1) {
            vehicle.modules.splice(stage1Index, 1);
        }
    }
    
    if (moduleItem.name === 'Форсированный двигатель (Стадия 3)') {
        const stage2Index = vehicle.modules.findIndex(m => m.name === 'Форсированный двигатель (Стадия 2)');
        if (stage2Index !== -1) {
            vehicle.modules.splice(stage2Index, 1);
        }
    }
    
    // Устанавливаем модуль
    vehicle.modules.push({
        name: moduleItem.name,
        description: moduleItem.description,
        price: moduleItem.price
    });
    
    // Удаляем модуль из багажника
    vehicle.trunk = vehicle.trunk.filter(m => m.id !== moduleId);
    
    // Пересчитываем характеристики транспорта
    if (typeof recalculateVehicleStats === 'function') {
        recalculateVehicleStats(vehicleId);
    }
    
    renderTransport();
    renderGear();
    scheduleSave();
    
    // Закрываем модальное окно оплаты установки, если оно было открыто
    if (installCost > 0) {
        // Находим и удаляем модальное окно оплаты
        const paymentModals = document.querySelectorAll('.modal-overlay');
        paymentModals.forEach(modal => {
            const modalText = modal.textContent || '';
            if (modalText.includes('Оплата установки') || modalText.includes('Оплатить и установить')) {
                modal.remove();
            }
        });
    }
    
    // Обновляем содержимое модала управления модулями
    const modal = document.querySelector('.modal-overlay[data-vehicle-modules-modal]');
    if (modal) {
        updateVehicleModulesModalContent(modal, vehicleId);
    }
    
    // Логируем установку
    if (installCost > 0) {
        console.log(`✅ ${moduleItem.name} установлен! Списано ${installCost} уе за установку`);
    } else {
        console.log(`✅ ${moduleItem.name} установлен бесплатно!`);
    }
}

function removeVehicleModule(vehicleId, moduleIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const module = vehicle.modules[moduleIndex];
    if (!module) return;
    
    // Возвращаем модуль в багажник
    vehicle.trunk.push({
        id: generateId('vehicleModule'),
        name: module.name,
        description: module.description,
        price: module.price,
        category: vehicle.category,
        requirements: [],
        moduleType: 'vehicle_module'
    });
    
    // Удаляем модуль из транспорта
    vehicle.modules.splice(moduleIndex, 1);
    
    // Пересчитываем характеристики транспорта
    if (typeof recalculateVehicleStats === 'function') {
        recalculateVehicleStats(vehicleId);
    }
    
    renderTransport();
    scheduleSave();
    
    // Обновляем содержимое модала управления модулями
    const modal = document.querySelector('.modal-overlay[data-vehicle-modules-modal]');
    if (modal) {
        updateVehicleModulesModalContent(modal, vehicleId);
    }
    
    // Показываем toast-уведомление
    showToast(`${module.name} возвращён в багажник`, 2000);
}

console.log('âœ… shops.js Ð·Ð°Ð³Ñ€ÑƒÐ¶ÐµÐ½ - Ð²ÑÐµ Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ñ‹ Ð³Ð¾Ñ‚Ð¾Ð²Ñ‹');

// Функция рендеринга жилья (копия из deck.js для совместимости)
function renderHousing() {
    const container = document.getElementById('housingContainer');
    if (!container) return;
    
    if (state.property.housing.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Жилье не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.property.housing.map((housing, index) => `
        <div class="property-item" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div class="property-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div class="property-name" style="cursor: pointer; color: var(--accent); font-weight: 600; font-size: 1rem;" onclick="toggleHousingDescription(${index})" title="Кликните, чтобы свернуть/развернуть описание">${housing.name}</div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
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
            <div id="housing-description-${index}" class="property-description" style="display: ${getCollapsedDisplayStyle('housing', index)}; color: var(--text); font-size: 0.9rem; margin: 0.5rem 0; line-height: 1.4;">${housing.description || 'Без описания'}</div>
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
    updateMoneyDisplay();
    
    // Логируем операцию
    addToRollLog('rent', { 
        item: housing.name, 
        price: rentAmount, 
        category: 'Аренда жилья' 
    });
    
    // Обновляем UI
    renderHousing();
    updateUIFromState();
    scheduleSave();
    
    showToast(`Оплачена аренда "${housing.name}" за ${rentAmount.toLocaleString()} уе`, 3000);
    console.log(`[RENT] Оплачена аренда жилья: ${housing.name} за ${rentAmount} уе`);
}

// Функция получения уровня профессионального навыка (копия из deck.js для совместимости)
function getProfessionalSkillLevel(skillName) {
    if (!state.professionalSkills) return 0;
    const skill = state.professionalSkills.find(s => s && s.name === skillName);
    console.log(`getProfessionalSkillLevel(${skillName}):`, skill);
    return skill && skill.level ? parseInt(skill.level) : 0;
}

// Функция рендеринга коммерческой недвижимости (копия из deck.js для совместимости)
function renderCommercialProperty() {
    const container = document.getElementById('commercialPropertyContainer');
    if (!container) return;
    
    if (state.property.commercialProperty.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Коммерческая недвижимость не добавлена</p>';
        return;
    }
    
    container.innerHTML = state.property.commercialProperty.map((property, index) => `
        <div class="property-item" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div class="property-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div class="property-name" onclick="toggleCommercialPropertyDescription(${index})" style="color: var(--accent); font-weight: 600; font-size: 1rem; cursor: pointer; user-select: none;">${property.name}</div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
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
    
    // Обновляем UI
    renderCommercialProperty();
    updateUIFromState();
    scheduleSave();
    
    showToast(`Выселились из "${propertyName}"`, 3000);
    console.log(`[EVICT] Выселились из коммерческой недвижимости: ${propertyName}`);
}

// ============================================================================
// ЗАГЛУШКИ ФУНКЦИЙ ДЛЯ СОВМЕСТИМОСТИ
// Эти функции будут переопределены в deck.js после его загрузки
// ============================================================================

console.log('✅ shops.js загружен - все магазины готовы');