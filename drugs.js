// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ПРЕПАРАТАМИ
// Магазин препаратов, покупка, отображение, удаление
// ============================================================================

console.log('💊 drugs.js загружается...');

// Функции для работы с препаратами
function showDrugsShop() {
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
                <h3><img src="https://static.tildacdn.com/tild3532-3565-4033-a136-653464353038/drugs.png" alt="💊" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин препаратов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleDrugsFreeMode()" id="drugsFreeModeButton" style="background: transparent; border: 1px solid ${getThemeColors().border}; color: ${getThemeColors().text}; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            
            <!-- Фильтры по категориям препаратов -->
            <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${Object.keys(DRUGS_LIBRARY).map((category, idx) => `
                    <button class="pill-button drugs-category-filter ${idx === 0 ? 'active' : ''}" onclick="filterDrugs('${category}')" data-drugs-category="${category}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        ${category}
                    </button>
                `).join('')}
            </div>
            
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                       <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; padding: 1rem;" id="drugsShopContent">
                    <!-- Контент будет загружен через filterDrugs -->
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
        .drugs-category-filter.active {
            background: ${getThemeColors().accent} !important;
            color: white !important;
        }
    `;
    if (!document.getElementById('drugs-filter-styles')) {
        style.id = 'drugs-filter-styles';
        document.head.appendChild(style);
    }
    
    // Загружаем первую категорию по умолчанию
    const firstCategory = Object.keys(DRUGS_LIBRARY)[0];
    filterDrugs(firstCategory);
    
    // Добавляем обработчики клавиатуры для правильной работы Enter
    addModalKeyboardHandlers(modal);
}

// Функция фильтрации препаратов
function filterDrugs(category) {
    const container = document.getElementById('drugsShopContent');
    if (!container) return;
    
    // Обновляем активный фильтр
    document.querySelectorAll('.drugs-category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-drugs-category') === category) {
            btn.classList.add('active');
        }
    });
    
    const drugs = DRUGS_LIBRARY[category] || [];
    
    container.innerHTML = drugs.map((drug) => `
        <div class="shop-item">
            <div class="shop-item-header">
                <h4 class="shop-item-title">${drug.name}</h4>
            </div>
            
            <p class="shop-item-description">
                ${drug.description}
            </p>
            
            ${drug.effect ? `
                <div style="background: ${getThemeColors().successLight}; border-left: 3px solid ${getThemeColors().success}; padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px;">
                    <div style="font-size: 0.85rem; color: ${getThemeColors().success};">
                        <strong>Эффект:</strong> ${drug.effect}
                    </div>
                </div>
            ` : ''}
            
            ${drug.difficulty ? `
                <div style="background: ${getThemeColors().accentLight}; border-left: 3px solid ${getThemeColors().accent}; padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px;">
                    <div style="font-size: 0.85rem; color: ${getThemeColors().accent};">
                        <strong>СЛ:</strong> ${drug.difficulty}
                    </div>
                </div>
            ` : ''}
            
            ${drug.secondaryEffect ? `
                <div style="background: ${getThemeColors().dangerLight}; border-left: 3px solid ${getThemeColors().danger}; padding: 0.5rem; margin: 0.5rem 0; border-radius: 4px;">
                    <div style="font-size: 0.85rem; color: ${getThemeColors().danger};">
                        <strong>Вторичный эффект:</strong> ${drug.secondaryEffect}
                    </div>
                </div>
            ` : ''}
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); gap: 0.5rem;">
                <span class="drug-price" style="color: ${getThemeColors().muted}; font-size: 0.9rem; font-weight: 600;" data-original-price="${drug.price}">
                    ${drug.price} уе
                </span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" class="drug-quantity-input" data-drug-name="${drug.name}" value="1" maxlength="2" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 2); if(parseInt(this.value) > 99) this.value = '99';" style="width: 50px; padding: 0.25rem; text-align: center; border: 1px solid ${getThemeColors().border}; border-radius: 4px; background: ${getThemeColors().bg}; color: ${getThemeColors().text}; font-size: 0.8rem;">
                    <button class="pill-button primary-button drug-buy-button" onclick="buyDrugWithQuantity('${drug.name}', ${drug.price}, '${drug.description.replace(/'/g, "\\'")}', '${drug.effect ? drug.effect.replace(/'/g, "\\'") : ''}', '${drug.category}', ${drug.difficulty || 0}, '${drug.secondaryEffect ? drug.secondaryEffect.replace(/'/g, "\\'") : ''}')" data-drug-name="${drug.name}" data-price="${drug.price}" data-description="${drug.description.replace(/'/g, "\\'")}" data-effect="${drug.effect ? drug.effect.replace(/'/g, "\\'") : ''}" data-category="${drug.category}" data-difficulty="${drug.difficulty || 0}" data-secondary-effect="${drug.secondaryEffect ? drug.secondaryEffect.replace(/'/g, "\\'") : ''}" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                        Купить
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function buyDrug(name, price, description, effect, category, difficulty, secondaryEffect, catalogPrice = null) {
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
    
    // Добавляем препарат
    const newDrug = {
        id: generateId('drug'),
        name: name,
        description: description,
        effect: effect,
        category: category,
        difficulty: difficulty,
        secondaryEffect: secondaryEffect,
        price: price,
        purchaseDate: new Date().toLocaleDateString('ru-RU'),
        catalogPrice: catalogPrice,
        purchasePrice: price,
        itemType: catalogPrice ? 'free_catalog' : 'purchased'
    };
    
    state.drugs.push(newDrug);
    renderDrugs();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Препараты'
    });
    
    // Показываем toast-уведомление, не закрывая магазин
    showToast(`${name} куплен за ${price} уе`, 2000);
}

// Новая функция для покупки препаратов с количеством
function buyDrugWithQuantity(name, price, description, effect, category, difficulty, secondaryEffect, catalogPrice = null) {
    const currentMoney = parseInt(state.money) || 0;
    
    // Получаем количество из поля ввода
    const quantityInput = document.querySelector(`input[data-drug-name="${name}"]`);
    const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
    
    const totalPrice = price * quantity;
    
    if (currentMoney < totalPrice) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: ${getThemeColors().danger}; font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem;">Нужно: ${totalPrice} уе, у вас: ${currentMoney} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - totalPrice;
    updateMoneyDisplay();
    
    // Добавляем препараты
    for (let i = 0; i < quantity; i++) {
        const newDrug = {
            id: generateId('drug'),
            name: name,
            description: description,
            effect: effect,
            category: category,
            difficulty: difficulty,
            secondaryEffect: secondaryEffect,
            price: price,
            purchaseDate: new Date().toLocaleDateString('ru-RU'),
            catalogPrice: catalogPrice,
            purchasePrice: price,
            itemType: catalogPrice ? 'free_catalog' : 'purchased'
        };
        
        state.drugs.push(newDrug);
    }
    
    renderDrugs();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: quantity > 1 ? `${name} (${quantity} шт.)` : name,
        price: totalPrice,
        category: 'Препараты'
    });
    
    // Показываем toast-уведомление
    const message = quantity > 1 ? 
        `${name} (${quantity} шт.) куплены за ${totalPrice} уе` : 
        `${name} куплен за ${price} уе`;
    showToast(message, 2000);
}

function getDrugFree(name, description, effect, category, difficulty, secondaryEffect) {
    // Добавляем препарат бесплатно
    const newDrug = {
        id: generateId('drug'),
        name: name,
        description: description,
        effect: effect,
        category: category,
        difficulty: difficulty,
        secondaryEffect: secondaryEffect,
        price: 0,
        purchaseDate: new Date().toLocaleDateString('ru-RU')
    };
    
    state.drugs.push(newDrug);
    renderDrugs();
    scheduleSave();
    
    showModal('Препарат получен', `&#x2705; ${name} добавлен в коллекцию препаратов бесплатно!`);
}

function removeDrug(drugId) {
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
                <p style="text-align: center; color: ${getThemeColors().text}; font-size: 1rem;">Принять этот препарат (удалить из списка)?</p>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="confirmRemoveDrug('${drugId}')">Принять</button>
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

function confirmRemoveDrug(drugId) {
    state.drugs = state.drugs.filter(drug => drug.id !== drugId);
    renderDrugs();
    scheduleSave();
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function toggleDrugsFreeMode() {
    const priceElements = document.querySelectorAll('.drug-price');
    const buyButtons = document.querySelectorAll('.drug-buy-button');
    const toggleButton = document.getElementById('drugsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        priceElements.forEach(el => {
            const originalPrice = el.getAttribute('data-original-price');
            el.textContent = `Цена: ${originalPrice} уе`;
        });
        
        buyButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const name = btn.getAttribute('data-drug-name');
            const description = btn.getAttribute('data-description');
            const effect = btn.getAttribute('data-effect');
            const category = btn.getAttribute('data-category');
            const difficulty = btn.getAttribute('data-difficulty');
            const secondaryEffect = btn.getAttribute('data-secondary-effect');
            btn.setAttribute('onclick', `buyDrug('${name}', ${price}, '${description}', '${effect}', '${category}', ${difficulty}, '${secondaryEffect}')`);
        });
        
        toggleButton.textContent = 'Бесплатно';
        toggleButton.style.background = 'transparent';
        
        // Возвращаем обычный фон
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        priceElements.forEach(el => {
            el.textContent = 'Цена: 0 уе';
        });
        
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-drug-name');
            const description = btn.getAttribute('data-description');
            const effect = btn.getAttribute('data-effect');
            const category = btn.getAttribute('data-category');
            const difficulty = btn.getAttribute('data-difficulty');
            const secondaryEffect = btn.getAttribute('data-secondary-effect');
            btn.setAttribute('onclick', `buyDrug('${name}', 0, '${description}', '${effect}', '${category}', ${difficulty}, '${secondaryEffect}')`);
        });
        
        toggleButton.textContent = 'Отключить бесплатно';
        toggleButton.style.background = 'linear-gradient(135deg, #7DF4C6, #5b9bff)';
        
        // Меняем фон на зеленоватый
        if (modalOverlay) {
            modalOverlay.style.background = 'rgba(0, 100, 50, 0.85)';
        }
    }
}

function renderDrugs() {
    const container = document.getElementById('drugsContainer');
    if (!container) return;
    
    if (state.drugs.length === 0) {
        container.innerHTML = '<p style="color: ${getThemeColors().muted}; text-align: center; padding: 2rem;">Препараты не добавлены</p>';
        return;
    }
    
    // Группируем препараты по категориям и названиям
    const drugsByCategory = {
        'street': {},
        'clinical': {},
        'drugs': {}
    };
    
    state.drugs.forEach(drug => {
        if (!drugsByCategory[drug.category][drug.name]) {
            drugsByCategory[drug.category][drug.name] = [];
        }
        drugsByCategory[drug.category][drug.name].push(drug);
    });
    
    const categoryNames = {
        'street': 'Уличные препараты',
        'clinical': 'Клинические препараты', 
        'drugs': 'Уличные наркотики'
    };
    
    let html = '';
    
    for (const [category, drugGroups] of Object.entries(drugsByCategory)) {
        if (Object.keys(drugGroups).length === 0) continue;
        
        html += `
            <div style="margin-bottom: 1.5rem;">
                <h4 style="color: ${getThemeColors().accent}; font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem;">${categoryNames[category]}</h4>
        `;
        
        for (const [drugName, drugList] of Object.entries(drugGroups)) {
            const firstDrug = drugList[0]; // Берем первый экземпляр для отображения
            const count = drugList.length;
            const drugId = `drug_${category}_${drugName.replace(/\s+/g, '_')}`;
            
            html += `
                <div style="background: ${getThemeColors().accentLight}; border: 1px solid ${getThemeColors().accent}; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
                        <div style="flex: 1;">
                            <div style="color: ${getThemeColors().accent}; font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none;" onclick="toggleDrugDescription('${drugId}')">
                                ${firstDrug.name} <span style="color: ${getThemeColors().muted}; font-size: 0.8rem;">${count > 1 ? `(${count} шт.)` : ''}</span>
                            </div>
                            <div id="${drugId}_description" style="display: block;">
                                <div style="color: ${getThemeColors().text}; font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                                    <strong>Описание:</strong> ${firstDrug.description}
                                </div>
                                <div style="color: ${getThemeColors().success}; font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                                    <strong>Эффект:</strong> ${firstDrug.effect}
                                </div>
                                ${firstDrug.difficulty > 0 ? `<div style="color: ${getThemeColors().accent}; font-size: 0.75rem; margin-bottom: 0.25rem;"><strong>СЛ:</strong> ${firstDrug.difficulty}</div>` : ''}
                                ${firstDrug.secondaryEffect ? `<div style="color: ${getThemeColors().danger}; font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;"><strong>Вторичный эффект:</strong> ${firstDrug.secondaryEffect}</div>` : ''}
                                <div style="color: ${getThemeColors().muted}; font-size: 0.75rem; margin-top: 0.25rem;">
                                    Куплено: ${firstDrug.purchaseDate} | Цена: ${firstDrug.price} уе
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${count > 1 ? `<span style="color: ${getThemeColors().muted}; font-size: 0.8rem; font-weight: 600;">×${count} шт.</span>` : ''}
                            <button onclick="removeDrug('${firstDrug.id}')" style="font-size: 0.9rem; background: transparent; border: none; color: ${getThemeColors().text}; cursor: pointer;" title="Принять препарат">💊</button>
                        </div>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
    }
    
    container.innerHTML = html;
}

function toggleDrugDescription(drugId) {
    const description = document.getElementById(`${drugId}_description`);
    if (description) {
        if (description.style.display === 'none') {
            description.style.display = 'block';
        } else {
            description.style.display = 'none';
        }
    }
}

console.log('✅ drugs.js загружен - система препаратов готова');


