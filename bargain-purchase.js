console.log('🚀 bargain-purchase.js загружается...');

// ============================================================================
// СИСТЕМА ТОРГА ПРИ ПОКУПКЕ
// Функции для торга при покупке предметов в магазинах
// ============================================================================

// Показывает выбор: поторговаться или купить сразу
function showPurchaseBargainChoice(itemName, originalPrice, onBargain, onBuyNow) {
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
                <h3>Хотите поторговаться?</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    Цена <strong>${itemName}</strong>: <strong style="color: ${getThemeColors().accent};">${originalPrice} уе</strong>
                </p>
                <p style="color: ${getThemeColors().text}; margin-bottom: 1.5rem;">
                    У вас есть навык <strong>Торг</strong>. Хотите попробовать договориться о лучшей цене?
                </p>
                <div style="display: flex; gap: 1rem;">
                    <button class="pill-button primary-button" onclick="window.tempBargainCallback()" style="flex: 1;">Поторговаться</button>
                    <button class="pill-button muted-button" onclick="window.tempBuyNowCallback()" style="flex: 1;">Купить сразу</button>
                </div>
            </div>
        </div>
    `;
    
    // Сохраняем callback'и временно
    window.tempBargainCallback = () => {
        closeModal(modal.querySelector('.icon-button'));
        onBargain();
    };
    
    window.tempBuyNowCallback = () => {
        closeModal(modal.querySelector('.icon-button'));
        onBuyNow();
    };
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Начинает процесс торга (бросок СЛ мастером)
function startPurchaseBargaining(itemName, originalPrice, onSuccess) {
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
                <h3>Торг с продавцом</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                    Мастер должен бросить <strong>2d10</strong> для определения Сложности (СЛ) торга.
                </p>
                
                <div style="margin-bottom: 1.5rem;">
                    <button class="pill-button primary-button" onclick="rollPurchaseDifficulty()" style="width: 100%;">
                        🎲 Бросить 2d10 для СЛ
                    </button>
                    <div id="purchaseDifficultyResult" style="margin-top: 0.5rem; text-align: center; font-size: 1.2rem; font-weight: 600; color: ${getThemeColors().accent};"></div>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <label class="input-label">Или введите СЛ вручную (если мастер уже бросил):</label>
                    <input type="number" class="input-field" id="purchaseManualDifficulty" placeholder="СЛ" min="2" max="20">
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <button class="pill-button success-button" id="performPurchaseBargainBtn" style="width: 100%;">
                        Сделать проверку Торга
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Сохраняем данные для последующего использования
    modal.dataset.itemName = itemName;
    modal.dataset.originalPrice = originalPrice;
    
    // Обработчик кнопки проверки
    document.getElementById('performPurchaseBargainBtn').onclick = () => performPurchaseBargainCheck(itemName, originalPrice, onSuccess);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Бросок 2d10 для СЛ
function rollPurchaseDifficulty() {
    const d1 = Math.floor(Math.random() * 10) + 1;
    const d2 = Math.floor(Math.random() * 10) + 1;
    const total = d1 + d2;
    
    const resultDiv = document.getElementById('purchaseDifficultyResult');
    if (resultDiv) {
        resultDiv.textContent = `СЛ = ${d1} + ${d2} = ${total}`;
    }
    
    // Автоматически заполняем поле
    const manualInput = document.getElementById('purchaseManualDifficulty');
    if (manualInput) {
        manualInput.value = total;
    }
}

// Выполнение проверки Торга
function performPurchaseBargainCheck(itemName, originalPrice, onSuccess) {
    const difficultyInput = document.getElementById('purchaseManualDifficulty');
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
    
    // Показываем результат
    showPurchaseBargainResult(itemName, originalPrice, {
        bargainLevel,
        dice: [d1, d2],
        diceTotal,
        checkResult,
        difficulty,
        success
    }, onSuccess);
}

// Показывает результат торга и запрашивает уровень Решалы
function showPurchaseBargainResult(itemName, originalPrice, checkData, onSuccess) {
    const { bargainLevel, dice, diceTotal, checkResult, difficulty, success } = checkData;
    
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
    
    const resultText = success 
        ? `<div style="color: ${getThemeColors().success}; font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">✓ УСПЕХ!</div>`
        : `<div style="color: ${getThemeColors().danger}; font-size: 1.2rem; font-weight: 600; margin-bottom: 1rem;">✗ ПРОВАЛ</div>`;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Результат торга</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                ${resultText}
                <div style="background: ${getThemeColors().bgLight}; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-family: monospace;">
                    <div>Торг (${bargainLevel}) + 2d6 (${dice[0]} + ${dice[1]} = ${diceTotal}) = <strong>${checkResult}</strong></div>
                    <div>СЛ: <strong>${difficulty}</strong></div>
                    <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid ${getThemeColors().border};">
                        Результат: ${checkResult} ${success ? '>' : '≤'} ${difficulty}
                    </div>
                </div>
                
                ${success ? `
                    <p style="color: ${getThemeColors().text}; margin-bottom: 1rem;">
                        Теперь укажите уровень вашего профессионального навыка <strong>Решала</strong>:
                    </p>
                    
                    <div style="margin-bottom: 1.5rem;">
                        <label class="input-label">Уровень Решалы (1-10):</label>
                        <input type="number" class="input-field" id="purchaseFixerLevel" placeholder="Уровень" min="1" max="10" value="${getProfessionalSkillLevel('Решала') || 1}">
                    </div>
                    
                    <div style="margin-bottom: 1rem; padding: 1rem; background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px; font-size: 0.85rem;">
                        <strong>Скидка по уровню Решалы:</strong><br>
                        1-2: 10% | 3-4: 20% | 5-6: 30% | 7: 40% | 8-9: 50% | 10: 100% (бесплатно!)
                    </div>
                    
                    <button class="pill-button primary-button" id="calculatePurchasePriceBtn" style="width: 100%;">
                        Рассчитать итоговую цену
                    </button>
                ` : `
                    <p style="color: ${getThemeColors().text}; margin-bottom: 1.5rem;">
                        Продавец отказывается снижать цену. Вы покупаете по полной стоимости: <strong>${originalPrice} уе</strong>
                    </p>
                    
                    <button class="pill-button primary-button" id="buyAtFullPriceBtn" style="width: 100%;">
                        Купить за ${originalPrice} уе
                    </button>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (success) {
        document.getElementById('calculatePurchasePriceBtn').onclick = () => {
            calculatePurchaseDiscount(itemName, originalPrice, onSuccess);
        };
    } else {
        document.getElementById('buyAtFullPriceBtn').onclick = () => {
            closeModal(modal.querySelector('.icon-button'));
            onSuccess(originalPrice);
        };
    }
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// Рассчитывает скидку по уровню Решалы
function calculatePurchaseDiscount(itemName, originalPrice, onSuccess) {
    const fixerLevelInput = document.getElementById('purchaseFixerLevel');
    const fixerLevel = parseInt(fixerLevelInput?.value) || 1;
    
    if (fixerLevel < 1 || fixerLevel > 10) {
        showAlertModal('Ошибка', 'Уровень Решалы должен быть от 1 до 10.');
        return;
    }
    
    // Определяем скидку по уровню Решалы
    let discount = 0;
    if (fixerLevel >= 1 && fixerLevel <= 2) discount = 0.10;
    else if (fixerLevel >= 3 && fixerLevel <= 4) discount = 0.20;
    else if (fixerLevel >= 5 && fixerLevel <= 6) discount = 0.30;
    else if (fixerLevel === 7) discount = 0.40;
    else if (fixerLevel >= 8 && fixerLevel <= 9) discount = 0.50;
    else if (fixerLevel === 10) discount = 1.00;
    
    const finalPrice = fixerLevel === 10 ? 0 : Math.floor(originalPrice * (1 - discount));
    
    // Закрываем текущий модал
    closeModal(document.querySelector('.modal-overlay:last-child .icon-button'));
    
    // Показываем итоговую цену
    showPurchaseSuccess(itemName, originalPrice, finalPrice, discount, fixerLevel, onSuccess);
}

// Показывает успешную покупку со скидкой
function showPurchaseSuccess(itemName, originalPrice, finalPrice, discount, fixerLevel, onSuccess) {
    const savedAmount = originalPrice - finalPrice;
    const discountPercent = (discount * 100).toFixed(0);
    
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
                <h3>Торг успешен!</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="background: ${getThemeColors().successLight}; border: 1px solid ${getThemeColors().success}; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <p style="color: ${getThemeColors().success}; font-weight: 600; margin-bottom: 0.5rem;">✓ Вы успешно договорились о скидке!</p>
                    <div style="color: ${getThemeColors().text}; font-size: 0.9rem;">
                        <div>Исходная цена: ${originalPrice} уе</div>
                        <div>Уровень Решалы: ${fixerLevel}</div>
                        <div>Скидка: -${discountPercent}%</div>
                        <div style="font-weight: 600; margin-top: 0.5rem; font-size: 1.1rem; color: ${getThemeColors().success};">
                            Итоговая цена: ${finalPrice} уе
                        </div>
                        ${savedAmount > 0 ? `<div style="color: ${getThemeColors().muted}; font-size: 0.85rem; margin-top: 0.25rem;">Вы сэкономили: ${savedAmount} уе</div>` : ''}
                    </div>
                </div>
                
                <p style="color: ${getThemeColors().text}; margin-bottom: 1.5rem;">
                    Купить <strong>${itemName}</strong> за <strong style="color: ${getThemeColors().success};">${finalPrice} уе</strong>?
                </p>
                
                <div style="display: flex; gap: 1rem;">
                    <button class="pill-button" onclick="closeModal(this)" style="flex: 1;">Отмена</button>
                    <button class="pill-button success-button" id="confirmDiscountedPurchaseBtn" style="flex: 1;">Купить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmDiscountedPurchaseBtn').onclick = () => {
        closeModal(modal.querySelector('.icon-button'));
        onSuccess(finalPrice);
    };
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

// ============================================================================
// ОБЁРТКИ ДЛЯ ФУНКЦИЙ ПОКУПКИ С ПОДДЕРЖКОЙ ТОРГА
// Применяем обёртки после полной загрузки DOM
// ============================================================================

// Функция для применения обёрток
(function applyWrappers() {
    // Обёртка для buyGear
    if (typeof buyGear !== 'undefined') {
        const _originalBuyGear = buyGear;
        buyGear = function(name, price, load, description, catalogPrice = null) {
            // Если торг недоступен или цена = 0 - покупаем сразу
            if (!canBargain() || price === 0) {
                return _originalBuyGear(name, price, load, description, catalogPrice);
            }
            
            // Показываем выбор - поторговаться или купить сразу
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyGear(name, finalPrice, load, description, catalogPrice);
                    });
                },
                () => {
                    _originalBuyGear(name, price, load, description, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyMeleeWeapon
    if (typeof buyMeleeWeapon !== 'undefined') {
        const _originalBuyMeleeWeapon = buyMeleeWeapon;
        buyMeleeWeapon = function(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyMeleeWeapon(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                type,
                price,
                () => {
                    startPurchaseBargaining(type, price, (finalPrice) => {
                        _originalBuyMeleeWeapon(type, finalPrice, load, damage, concealable, stealthPenalty, examples, catalogPrice);
                    });
                },
                () => {
                    _originalBuyMeleeWeapon(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyMeleeWeaponToGear
    if (typeof buyMeleeWeaponToGear !== 'undefined') {
        const _originalBuyMeleeWeaponToGear = buyMeleeWeaponToGear;
        buyMeleeWeaponToGear = function(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyMeleeWeaponToGear(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                type,
                price,
                () => {
                    startPurchaseBargaining(type, price, (finalPrice) => {
                        _originalBuyMeleeWeaponToGear(type, finalPrice, load, damage, concealable, stealthPenalty, examples, catalogPrice);
                    });
                },
                () => {
                    _originalBuyMeleeWeaponToGear(type, price, load, damage, concealable, stealthPenalty, examples, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyRangedWeapon
    if (typeof buyRangedWeapon !== 'undefined') {
        console.log('✅ buyRangedWeapon найдена, применяем обёртку');
        const _originalBuyRangedWeapon = buyRangedWeapon;
        buyRangedWeapon = function(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice = null) {
            console.log('🔫 buyRangedWeapon вызвана:', { type, price, canBargain: canBargain() });
            console.log('🔫 Параметры:', { type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice });
            if (!canBargain() || price === 0) {
                console.log('💰 Покупаем сразу без торга');
                return _originalBuyRangedWeapon(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                type,
                price,
                () => {
                    startPurchaseBargaining(type, price, (finalPrice) => {
                        _originalBuyRangedWeapon(type, finalPrice, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
                    });
                },
                () => {
                    _originalBuyRangedWeapon(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyRangedWeaponToGear
    if (typeof buyRangedWeaponToGear !== 'undefined') {
        console.log('✅ buyRangedWeaponToGear найдена, применяем обёртку');
        const _originalBuyRangedWeaponToGear = buyRangedWeaponToGear;
        buyRangedWeaponToGear = function(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyRangedWeaponToGear(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                type,
                price,
                () => {
                    startPurchaseBargaining(type, price, (finalPrice) => {
                        _originalBuyRangedWeaponToGear(type, finalPrice, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
                    });
                },
                () => {
                    _originalBuyRangedWeaponToGear(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyAmmoWithQuantity
    if (typeof buyAmmoWithQuantity !== 'undefined') {
        const _originalBuyAmmoWithQuantity = buyAmmoWithQuantity;
        buyAmmoWithQuantity = function(ammoType, weaponType, pricePerUnit, catalogPricePerUnit = null) {
            const quantity = parseInt(document.getElementById('ammoQuantity')?.value) || 1;
            const totalPrice = quantity * pricePerUnit;
            
            if (!canBargain() || pricePerUnit === 0) {
                return _originalBuyAmmoWithQuantity(ammoType, weaponType, pricePerUnit, catalogPricePerUnit);
            }
            
            showPurchaseBargainChoice(
                `${ammoType} (${weaponType}) x${quantity}`,
                totalPrice,
                () => {
                    startPurchaseBargaining(`${ammoType} x${quantity}`, totalPrice, (finalPrice) => {
                        const newPricePerUnit = Math.floor(finalPrice / quantity);
                        _originalBuyAmmoWithQuantity(ammoType, weaponType, newPricePerUnit, catalogPricePerUnit);
                    });
                },
                () => {
                    _originalBuyAmmoWithQuantity(ammoType, weaponType, pricePerUnit, catalogPricePerUnit);
                }
            );
        };
    }

    // Обёртка для buyProgram
    if (typeof buyProgram !== 'undefined') {
        const _originalBuyProgram = buyProgram;
        buyProgram = function(name, price, ram, lethal, description, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyProgram(name, price, ram, lethal, description, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyProgram(name, finalPrice, ram, lethal, description, catalogPrice);
                    });
                },
                () => {
                    _originalBuyProgram(name, price, ram, lethal, description, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyWeaponModule
    if (typeof buyWeaponModule !== 'undefined') {
        const _originalBuyWeaponModule = buyWeaponModule;
        buyWeaponModule = function(category, name, price, load, compatible, description, slotsRequired = 1, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyWeaponModule(category, name, price, load, compatible, description, slotsRequired, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyWeaponModule(category, name, finalPrice, load, compatible, description, slotsRequired, catalogPrice);
                    });
                },
                () => {
                    _originalBuyWeaponModule(category, name, price, load, compatible, description, slotsRequired, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyVehicleModule
    if (typeof buyVehicleModule !== 'undefined') {
        const _originalBuyVehicleModule = buyVehicleModule;
        buyVehicleModule = function(name, description, price, category, requirementsStr, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyVehicleModule(name, description, price, category, requirementsStr, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyVehicleModule(name, description, finalPrice, category, requirementsStr, catalogPrice);
                    });
                },
                () => {
                    _originalBuyVehicleModule(name, description, price, category, requirementsStr, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyDrug
    if (typeof buyDrug !== 'undefined') {
        const _originalBuyDrug = buyDrug;
        buyDrug = function(name, price, description, effect, category, difficulty, secondaryEffect, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyDrug(name, price, description, effect, category, difficulty, secondaryEffect, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyDrug(name, finalPrice, description, effect, category, difficulty, secondaryEffect, catalogPrice);
                    });
                },
                () => {
                    _originalBuyDrug(name, price, description, effect, category, difficulty, secondaryEffect, catalogPrice);
                }
            );
        };
    }

    // Обёртка для buyVehicle
    if (typeof buyVehicle !== 'undefined') {
        const _originalBuyVehicle = buyVehicle;
        buyVehicle = function(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, price, category, catalogPrice = null) {
            if (!canBargain() || price === 0) {
                return _originalBuyVehicle(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, price, category, catalogPrice);
            }
            
            showPurchaseBargainChoice(
                name,
                price,
                () => {
                    startPurchaseBargaining(name, price, (finalPrice) => {
                        _originalBuyVehicle(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, finalPrice, category, catalogPrice);
                    });
                },
                () => {
                    _originalBuyVehicle(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, price, category, catalogPrice);
                }
            );
        };
    }
    
        console.log('Обёртки функций покупки применены');
        
        // Проверяем, что все критичные функции обёрнуты
        console.log('Проверка обёрток:');
        console.log('- buyRangedWeapon:', typeof buyRangedWeapon);
        console.log('- buyRangedWeaponToGear:', typeof buyRangedWeaponToGear);
        console.log('- buyGear:', typeof buyGear);
        console.log('- buyMeleeWeapon:', typeof buyMeleeWeapon);
        
        // Проверяем, что все критичные функции обёрнуты
        if (typeof buyRangedWeapon === 'undefined') {
            console.warn('buyRangedWeapon не найдена при первой попытке');
        }
        
        if (typeof buyRangedWeaponToGear === 'undefined') {
            console.warn('buyRangedWeaponToGear не найдена при первой попытке');
        }
        
        // Обёртка для buyDeck
        if (typeof buyDeck !== 'undefined') {
            console.log('✅ buyDeck найдена, применяем обёртку');
            const _originalBuyDeck = buyDeck;
            buyDeck = function(name, memory, ram, grid, price, catalogPrice = null) {
                if (!canBargain() || price === 0) {
                    return _originalBuyDeck(name, memory, ram, grid, price, catalogPrice);
                }
                
                showPurchaseBargainChoice(
                    name,
                    price,
                    () => {
                        startPurchaseBargaining(name, price, (finalPrice) => {
                            _originalBuyDeck(name, memory, ram, grid, finalPrice, catalogPrice);
                        });
                    },
                    () => {
                        _originalBuyDeck(name, memory, ram, grid, price, catalogPrice);
                    }
                );
            };
        }
        
        // Обёртка для buyDeckGear
        if (typeof buyDeckGear !== 'undefined') {
            console.log('✅ buyDeckGear найдена, применяем обёртку');
            const _originalBuyDeckGear = buyDeckGear;
            buyDeckGear = function(name, priceStr, type, stat, maxValue, unique, maxQuantity, catalogPrice = null) {
                let price = 0;
                if (priceStr.includes('ур*')) {
                    const multiplier = parseInt(priceStr.replace('ур*', ''));
                    price = state.reputation * multiplier;
                } else {
                    price = parseInt(priceStr.replace(/\s/g, ''));
                }
                
                if (!canBargain() || price === 0) {
                    return _originalBuyDeckGear(name, priceStr, type, stat, maxValue, unique, maxQuantity, catalogPrice);
                }
                
                showPurchaseBargainChoice(
                    name,
                    price,
                    () => {
                        startPurchaseBargaining(name, price, (finalPrice) => {
                            // Для улучшений нужно пересчитать цену
                            let newPriceStr = priceStr;
                            if (priceStr.includes('ур*')) {
                                const multiplier = parseInt(priceStr.replace('ур*', ''));
                                newPriceStr = `ур*${Math.round(finalPrice / state.reputation)}`;
                            } else {
                                newPriceStr = finalPrice.toString();
                            }
                            _originalBuyDeckGear(name, newPriceStr, type, stat, maxValue, unique, maxQuantity, catalogPrice);
                        });
                    },
                    () => {
                        _originalBuyDeckGear(name, priceStr, type, stat, maxValue, unique, maxQuantity, catalogPrice);
                    }
                );
            };
        }
})(); // Применяем обёртки сразу

console.log('✅ bargain-purchase.js загружен - система торга при покупке готова');
