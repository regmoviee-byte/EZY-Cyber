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

function expandSection(section) {
    const content = section.querySelector('.section-content');
    if (content) {
        content.classList.add('expanded');
        content.style.display = 'block';
    }
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    if (!content) return;
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        content.style.display = 'none';
    } else {
        content.classList.add('expanded');
        content.style.display = 'block';
    }
}

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
                loadState();
                initAvatarUpload();
                updateUIFromState();
                renderRollLog();
                updateMoneyDisplay();
                calculateAndUpdateHealth();
                updateDerivedStats();
                renderSkills();
                renderProfessionalSkills();
                renderCriticalInjuries();
                renderDeckPrograms();
                renderDeckChips();
                renderImplants();
                renderWeapons();
                renderAmmo();
                renderHousing();
                renderVehicles();
                renderGear();
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
    const maxHp = Math.ceil(((will + 10) * body) / 2);
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
    updateLoadDisplay();
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
            warningEl.style.color = 'var(--danger)';
        } else {
            warningEl.textContent = `Нагрузка: ${currentLoad}/${maxLoad}`;
            warningEl.style.color = 'var(--text)';
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
    const statValue = state.stats[selectedStat] || 5;
    const skillLevel = skillData.level || 0;
    const skillName = skillData.customName || skillData.name;
    
    // Бросаем 2d6
    const dice = rollDice(2, 6);
    let total = statValue + skillLevel + modifier + dice[0] + dice[1];
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
    const formula = `${statValue}+${skillLevel}${modifierStr}+${dice[0]}+${dice[1]}${d4Value ? (d4Type === 'penalty' ? '-' + d4Value : '+' + d4Value) : ''} = ${total}`;
    
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

function rollUniversalDice() {
    const count = parseInt(document.getElementById('diceCount')?.value) || 1;
    const sides = parseInt(document.getElementById('diceSides')?.value) || 6;
    const modifier = parseInt(document.getElementById('diceModifier')?.value) || 0;
    
    const dice = rollDice(count, sides);
    const total = dice.reduce((sum, roll) => sum + roll, 0) + modifier;
    
    // Добавляем в лог
    addToRollLog('universal', {
        count: count,
        sides: sides,
        modifier: modifier,
        dice: dice,
        total: total
    });
    
    // Показываем результат
    showUniversalResult(dice, total, modifier);
}

// Новая система лога бросков
function addToRollLog(type, data) {
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
        logContainer.innerHTML = '<div style="color: var(--muted); text-align: center; padding: 2rem; font-size: 0.9rem;">Лог бросков пуст</div>';
        return;
    }
    
    // Формируем HTML для каждой записи
    const logsHTML = state.rollLog.map(entry => {
        let text = '';
        
        switch(entry.type) {
            case 'skill':
                text = `<strong>${entry.skill}</strong>: ${entry.formula} = <strong>${entry.total}</strong>${entry.critical ? ` <span style="color: var(--danger);">${entry.critical}</span>` : ''}`;
                break;
            
            case 'weapon_damage':
                text = `<strong>${entry.weaponName}</strong>: ${entry.formula} = <strong>${entry.total}</strong>${entry.ammoType ? ` (${entry.ammoType})` : ''}${entry.fireMode ? ` [${entry.fireMode}]` : ''}${entry.isCritical ? ' <span style="color: var(--danger); font-weight: 600;">КРИТИЧЕСКАЯ ТРАВМА!</span>' : ''}`;
                break;
            
            case 'universal':
                text = `<strong>${entry.count}d${entry.sides}</strong>${entry.modifier !== 0 ? `+${entry.modifier}` : ''}: ${entry.dice.join(', ')} = <strong>${entry.total}</strong>`;
                break;
            
            case 'purchase':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Покупка: <strong>${entry.item}</strong> за <strong style="color: var(--danger);">${entry.price} уе</strong> <span style="color: var(--muted); font-size: 0.8rem;">(${entry.category})</span>`;
                break;
            
            case 'transaction':
                text = `<img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Зачислено <strong style="color: #00ff88; font-weight: bold;">${entry.amount} уе</strong> (${entry.source})${entry.taxPaid > 0 ? ` [Налог: ${entry.taxPaid} уе]` : ''}`;
                break;
            
            default:
                text = entry.text || JSON.stringify(entry);
        }
        
        return `
            <div style="padding: 0.4rem 0.75rem; border-bottom: 1px solid rgba(182, 103, 255, 0.05); font-size: 0.85rem; line-height: 1.4;">
                <span style="color: var(--muted); font-family: monospace; font-size: 0.75rem; margin-right: 0.5rem;">${entry.timestamp}</span>
                <span style="color: var(--text);">${text}</span>
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
        'CHA': 'Харизма'
    };
    
    const statName = statNames[skillStat] || skillStat;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                            <option value="CHA" ${skillStat === 'CHA' ? 'selected' : ''}>Харизма (${state.stats.CHA || 0})</option>
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
}

function closeModal(button) {
    // Находим ближайший modal-overlay к кнопке
    const modal = button ? button.closest('.modal-overlay') : null;
    if (modal) {
        modal.remove();
    }
}

function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    // Увеличиваем z-index для каждого нового модала
    const existingModals = document.querySelectorAll('.modal-overlay');
    const baseZIndex = 1000;
    modal.style.zIndex = baseZIndex + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                ${content}
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

// Функции для работы с деньгами
function updateMoneyDisplay() {
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
    showConfirmModal('Подтверждение', 'Вы уверены, что хотите очистить лог бросков?', () => {
        state.rollLog = [];
        renderRollLog();
        scheduleSave();
    });
}

// Универсальная бросалка
function showUniversalDiceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                        <div id="universalDiceTotal" style="font-size: 2rem; font-weight: bold; color: var(--text); margin-bottom: 0.5rem;">Σ 0</div>
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                <p style="color: var(--danger);">Введите описание травмы!</p>
            
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Подтверждение</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text); font-size: 1rem;">Удалить эту критическую травму?</p>
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
            <button onclick="removeCriticalInjury('${injury.id}')" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: var(--text); cursor: pointer;">×</button>
            <div style="color: var(--text); font-size: 0.9rem; padding-right: 1.5rem;">${injury.description}</div>
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                <p style="color: var(--danger);">Введите название!</p>
       
            </div>
        `);
        return;
    }
    
    const fullName = `${baseName} (${customName})`;
    
    // Проверяем, не добавлен ли уже такой вариант
    if (state.skills.find(s => s.customName === fullName)) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Этот вариант навыка уже добавлен!</p>
        
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
                'CHA': 'Харизма'
            };
            
            const availableSkills = STANDARD_SKILLS.filter(skill => {
                const canAddMultiple = skill.name === "Язык" || skill.name.startsWith("Боевые искусства");
                if (canAddMultiple) return true;
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
                                        <span style="color: var(--text); font-weight: 500;">${skill.name}</span>
                                        <span style="color: var(--muted); font-size: 0.85rem;"> (${statNames[skill.stat] || skill.stat})</span>
                                        ${skill.special ? '<span style="color: var(--success); font-size: 0.8rem;"> ★</span>' : ''}
                                        ${skill.multiplier > 1 ? `<span style="color: var(--accent-2); font-size: 0.8rem;"> ×${skill.multiplier}</span>` : ''}
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                            <option value="CHA">Харизма</option>
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
}

function saveCustomSkill() {
    const name = document.getElementById('customSkillName').value;
    const stat = document.getElementById('customSkillStat').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Введите название навыка!</p>
           
            </div>
        `);
        return;
    }
    
    // Проверяем, не добавлен ли уже этот навык
    if (state.skills.find(s => s.name === name)) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Этот навык уже добавлен!</p>
             
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
        'CHA': 'Харизма'
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
            ${sortedSkills.map(skill => `
                <div class="skill-item-compact">
                    <button class="skill-remove-btn-compact" onclick="removeSkill('${skill.id}')">×</button>
                    
                    <div class="skill-name-compact">${skill.customName || skill.name}</div>
                    
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
            `).join('')}
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
        'CHA': 'Харизма'
    };
    
    // Фильтруем навыки: скрываем уже добавленные (кроме "Язык" и "Боевые искусства")
    const availableSkills = STANDARD_SKILLS.filter(skill => {
        const canAddMultiple = skill.name === "Язык" || skill.name.startsWith("Боевые искусства");
        if (canAddMultiple) return true; // Всегда показываем
        
        // Проверяем, добавлен ли уже этот навык
        return !state.skills.find(s => s.name === skill.name);
    });
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                                        <span style="color: var(--text); font-weight: 500;">${skill.name}</span>
                                        <span style="color: var(--muted); font-size: 0.85rem;"> (${statNames[skill.stat] || skill.stat})</span>
                                        ${skill.special ? '<span style="color: var(--success); font-size: 0.8rem;"> </span>' : ''}
                                        ${skill.multiplier > 1 ? `<span style="color: var(--accent-2); font-size: 0.8rem;"> ×${skill.multiplier}</span>` : ''}
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
}

// Функции для работы с секцией "Дека"
function toggleDeckSection(sectionType) {
    const container = document.getElementById(sectionType === 'programs' ? 'deckProgramsContainer' : 'deckChipsContainer');
    const toggle = document.getElementById(sectionType === 'programs' ? 'deckProgramsToggle' : 'deckChipsToggle');
    
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
    
    if (state.deckPrograms.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem; font-size: 0.8rem;">Программы не установлены</p>';
        updateDeckCounters();
        return;
    }
    
    container.innerHTML = state.deckPrograms.map((program, index) => `
        <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <button onclick="removeDeckProgram(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: var(--text); cursor: pointer;">×</button>
            <div style="padding-right: 1.5rem;">
                <div style="color: var(--success); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${program.name}</div>
                <div style="color: var(--muted); font-size: 0.75rem; margin-bottom: 0.25rem;">
                    Цена: ${program.price} уе | ОЗУ: ${program.ram} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}
                </div>
                <div style="color: var(--muted); font-size: 0.7rem; line-height: 1.3;">
                    ${program.description}
                </div>
            </div>
        </div>
    `).join('');
    
    // Обновляем счетчик в заголовке
    updateDeckCounters();
}

function renderDeckChips() {
    const container = document.getElementById('deckChipsContainer');
    if (!container) return;
    
    if (state.deckChips.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem; font-size: 0.8rem;">Щепки памяти не добавлены</p>';
        updateDeckCounters();
        return;
    }
    
    container.innerHTML = state.deckChips.map((chip, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 6px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; gap: 0.5rem; padding-right: 3rem;">
                <button onclick="editMemoryChip(${index})" style="background: transparent; border: none; color: var(--text); cursor: pointer; font-size: 0.8rem;" title="Редактировать">&#x270F;&#xFE0F;</button>
                <button onclick="removeMemoryChip(${index})" style="position: absolute; top: 0.5rem; right: 0.5rem; font-size: 1rem; background: transparent; border: none; color: var(--text); cursor: pointer;">×</button>
            </div>
            <div>
                <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">${chip.name}</div>
                <div style="color: var(--muted); font-size: 0.75rem;">
                    ${chip.program ? `Программа: ${chip.program.name}` : chip.content ? `Содержимое: ${chip.content.substring(0, 50)}${chip.content.length > 50 ? '...' : ''}` : 'Пустая щепка'}
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

function showProgramShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px;">
            <div class="modal-header">
                <h3>💾 Магазин программ</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleProgramsFreeMode()" id="programsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    ${STANDARD_PROGRAMS.map((program, index) => `
                        <div class="program-item">
                            <div class="program-info">
                                <div class="program-name">${program.name}</div>
                                <div class="program-details">
                                    Цена: <span class="program-price-display" data-original-price="${program.price}">${program.price}</span> уе | RAM: ${program.ram} | ${program.lethal ? 'Смертельная' : 'Несмертельная'}
                                </div>
                                <div class="program-description" style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
                                    ${program.description}
                                </div>
                            </div>
                            <div class="program-actions">
                                <button class="pill-button primary-button program-buy-button" onclick="buyProgram('${program.name}', ${program.price}, ${program.ram}, ${program.lethal}, '${program.description.replace(/'/g, "\\'")}')" data-program-name="${program.name}" data-price="${program.price}" data-ram="${program.ram}" data-lethal="${program.lethal}" data-description="${program.description.replace(/'/g, "\\'")}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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

function buyProgram(name, price, ram, lethal, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши, мабой</p>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button class="pill-button" onclick="closeModal(this); setTimeout(() => showProgramInstallModal('${name}', 0, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'")}'), 100)">
                        Игнорировать
                    </button>
                    <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => showCustomPriceModal('${name}', ${price}, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'")}'), 100)">
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
    
    // Показываем модал выбора установки
    showProgramInstallModal(name, price, ram, lethal, description);
}

function showCustomPriceModal(name, originalPrice, ram, lethal, description) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Ввести свою цену</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p><strong>${name}</strong></p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Оригинальная цена: <strong style="color: var(--danger);">${originalPrice} уе</strong>
                    </p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Ваша цена</label>
                    <input type="number" class="input-field" id="customProgramPrice" value="${originalPrice}" min="0" placeholder="Введите цену">
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="buyProgramWithCustomPrice('${name}', ${ram}, ${lethal}, '${description.replace(/'/g, "\\'")}')">Купить</button>
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

function buyProgramWithCustomPrice(name, ram, lethal, description) {
    const customPrice = parseInt(document.getElementById('customProgramPrice').value) || 0;
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < customPrice) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Даже на эту сумму не хватает денег!</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - customPrice;
    updateMoneyDisplay();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    // Показываем модал установки
    showProgramInstallModal(name, customPrice, ram, lethal, description);
}

function showProgramInstallModal(name, price, ram, lethal, description) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Установка программы: ${name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p><strong>${name}</strong></p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Цена: <strong style="color: var(--accent);">${price} уе</strong> | 
                        RAM: <strong style="color: var(--success);">${ram}</strong> |
                        ${lethal ? '<strong style="color: var(--danger);">Смертельная</strong>' : '<strong style="color: var(--success);">Несмертельная</strong>'}
                    </p>
                    <p style="font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem;">
                        ${description}
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.75rem;">
                    <label class="field">
                        Установить на
                        <select id="programInstallTarget" style="width: 100%;">
                            <option value="deck">Дека</option>
                            <option value="chip">Щепку памяти</option>
                        </select>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="installProgram('${name}', ${price}, ${ram}, ${lethal}, '${description.replace(/'/g, "\\'")}')">
                    Установить
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

function installProgram(name, price, ram, lethal, description) {
    const target = document.getElementById('programInstallTarget').value;
    
    if (target === 'deck') {
        const newProgram = {
            id: generateId('program'),
            name: name,
            price: price,
            ram: ram,
            lethal: lethal,
            description: description,
            installedOn: 'deck'
        };
        
        state.deckPrograms.push(newProgram);
        renderDeckPrograms();
        
        // Добавляем в лог (только если программа была куплена за деньги)
        if (price > 0) {
            addToRollLog('purchase', {
                item: name,
                price: price,
                category: 'Программа (на Деку)'
            });
        }
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        scheduleSave();
        
        showModal('Программа установлена', `&#x2705; ${name} установлена на Деку!`);
    } else {
        // Установка на щепку - создаем новую щепку
        const currentMoney = parseInt(state.money) || 0;
        const chipCost = 10; // Стоимость создания щепки
        
        if (currentMoney < chipCost) {
            showModal('Недостаточно денег', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши для создания щепки!</p>
                    <p style="color: var(--muted); margin-bottom: 1rem;">Создание щепки стоит ${chipCost} уе</p>
                    <button class="pill-button" onclick="closeModal(this)">Понятно</button>
                </div>
            `);
            return;
        }
        
        // Списываем деньги за щепку
        state.money = currentMoney - chipCost;
        updateMoneyDisplay();
        
        // Создаем новую щепку с программой
        const newChip = {
            id: generateId('chip'),
            name: 'Сам купил',
            program: {
                name: name,
                price: price,
                ram: ram,
                lethal: lethal,
                description: description
            }
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
        
        showModal('Щепка создана', `&#x2705; Создана щепка "Сам купил" с программой ${name}!<br>Списано ${chipCost} уе за создание щепки.`);
    }
}

function removeDeckProgram(index) {
    showConfirmModal('Подтверждение', 'Удалить программу?', () => {
        state.deckPrograms.splice(index, 1);
        renderDeckPrograms();
        scheduleSave();
    });
}

function addMemoryChip() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>💾 Добавить щепку памяти</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Стоимость создания щепки: <strong style="color: var(--accent);">10 уе</strong>
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
                <p style="color: var(--danger);">Введите название щепки!</p>
            </div>
        `);
        return;
    }
    
    const currentMoney = parseInt(state.money) || 0;
    const chipCost = 10; // Стоимость создания щепки
    
    if (currentMoney < chipCost) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает Еши для создания щепки!</p>
                <p style="color: var(--muted); margin-bottom: 1rem;">Создание щепки стоит ${chipCost} уе</p>
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
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                    <h4 style="color: var(--accent); margin-bottom: 1rem;">Содержимое щепки</h4>
                    
                    ${chip.program ? `
                        <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">📀 Программа: ${chip.program.name}</div>
                            <div style="color: var(--muted); font-size: 0.9rem; margin-bottom: 0.5rem;">ОЗУ: ${chip.program.ram} | ${chip.program.lethal ? 'Смертельная' : 'Несмертельная'}</div>
                            <div style="color: var(--muted); font-size: 0.8rem;">${chip.program.description}</div>
                            <button class="pill-button danger-button" onclick="removeProgramFromChip(${index})" style="margin-top: 0.5rem; font-size: 0.8rem;">Удалить программу</button>
                        </div>
                    ` : `
                        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="color: var(--accent); font-weight: 600; margin-bottom: 1rem;">💾 Пустая щепка</div>
                            
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
                <p style="color: var(--danger);">Введите название щепки!</p>
            </div>
        `);
        return;
    }
    
    state.deckChips[index].name = newName;
    if (content) {
        state.deckChips[index].content = content;
    }
    renderDeckChips();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeMemoryChip(index) {
    showConfirmModal('Подтверждение', 'Удалить щепку памяти?', () => {
        state.deckChips.splice(index, 1);
        renderDeckChips();
        scheduleSave();
    });
}

function showProgramInstallModalForChip(chipIndex) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                                <div class="program-description" style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
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
}

function installProgramOnChip(chipIndex, name, price, ram, lethal, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Недостаточно денег для покупки программы!</p>
                <p style="color: var(--muted);">Требуется: ${price} уе | Доступно: ${currentMoney} уе</p>
            </div>
        `);
        return;
    }
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Записываем программу на щепку
    state.deckChips[chipIndex].program = {
        name: name,
        price: price,
        ram: ram,
        lethal: lethal,
        description: description
    };
    
    renderDeckChips();
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

function removeProgramFromChip(chipIndex) {
    showConfirmModal('Подтверждение', 'Удалить программу с щепки?', () => {
        delete state.deckChips[chipIndex].program;
        renderDeckChips();
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        showModal('Программа удалена', `&#x2705; Программа удалена с щепки!`);
    });
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Киберимпланты не установлены</p>';
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
                <div class="implant-name" style="color: var(--accent); font-size: 1.1rem; font-weight: bold; margin-bottom: 0.5rem;">${module.name}</div>
                <div class="implant-category" style="color: var(--success); font-size: 0.9rem; margin-bottom: 0.5rem;">
                    📍 Место установки: ${module.implantName} → ${module.partDisplayName}
                </div>
                <div class="implant-details" style="color: var(--text); font-size: 0.9rem; margin-bottom: 0.5rem;">
                    &#x26A0;&#xFE0F; Потеря осознанности: ${module.awarenessLoss}
                </div>
                <div class="implant-description" style="font-size: 0.9rem; color: var(--muted); line-height: 1.4;">
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let shopHTML = `
        <div class="modal" style="max-width: 900px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>🦾 Магазин киберимплантов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleImplantModulesFreeMode()" id="implantModulesFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="implantSearchInput" placeholder="&#x1F50D; Поиск по названию..." style="width: 100%; padding: 0.75rem; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1rem;" onkeyup="filterImplants(this.value)">
                </div>
    `;
    
    // Проходим по всем категориям
    for (const [category, implants] of Object.entries(CYBERIMPLANTS_LIBRARY)) {
        shopHTML += `
            <div class="category-section" data-category="${category}">
                <div class="category-title">${category}</div>
                <div style="display: grid; gap: 1rem;">
                    ${implants.map((implant) => `
                        <div class="implant-item" data-name="${implant.name.toLowerCase()}" data-description="${implant.description.toLowerCase()}">
                            <div class="implant-info">
                                <div class="implant-name">${implant.name}</div>
                                <div class="implant-details">
                                    <span class="implant-module-price-display" data-original-price="${implant.price}" data-awareness="${implant.awarenessLoss}">Цена: ${implant.price} уе</span> | Потеря осознанности: ${implant.awarenessLoss}
                                </div>
                                <div class="implant-description" style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
                                    ${implant.description}
                                </div>
                            </div>
                            <div class="implant-actions">
                                <button class="pill-button primary-button implant-module-buy-button" onclick="buyAndInstallImplant('${category}', '${implant.name}', ${implant.price}, '${implant.awarenessLoss}', '${implant.description.replace(/'/g, "\\'")}')" data-category="${category}" data-name="${implant.name}" data-price="${implant.price}" data-awareness="${implant.awarenessLoss}" data-description="${implant.description.replace(/'/g, "\\'")}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
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

function buyAndInstallImplant(category, name, price, awarenessLoss, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Ха-ха, не так быстро, нищюк!</p>
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
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Модуль импланта'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль куплен и готов к установке', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} куплен и добавлен в снаряжение!</p>
            <p style="color: var(--danger); margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${state.awareness.current}</p>
            <p style="color: var(--muted);">Теперь установите его через "Управление имплантами"</p>
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Киберимпланты не установлены</p>';
        return;
    }
    
    container.innerHTML = installedModules.map((implant, index) => `
        <div class="implant-item" style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(182, 103, 255, 0.2); border-radius: 8px; margin-bottom: 0.5rem;">
            <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="color: var(--accent); font-weight: 600;">${implant.name}</span>
                </div>
                <div style="color: white; font-weight: bold; font-size: 0.8rem; margin-top: 0.25rem;">${implant.location}</div>
                ${implant.description ? `<div style="color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem;">${implant.description}</div>` : ''}
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
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлен в снаряжение!</p>
            <p style="color: var(--danger); margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${state.awareness.current}</p>
            <p style="color: var(--muted);">Теперь вы можете установить его через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

function addGiftedImplant() {
    // Показываем модал магазина, но без списания денег
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                                <div class="implant-description" style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
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
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлен в снаряжение!</p>
            <p style="color: var(--danger); margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${state.awareness.current}</p>
            <p style="color: var(--muted);">Теперь вы можете установить его через "Управление имплантами"</p>
            <button class="pill-button" onclick="closeModal(this)">
                Закрыть
            </button>
        </div>
    `);
}

// Функция для управления имплантами (полная схема)
function showImplantsManagement() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let managementHTML = `
        <div class="modal" style="max-width: 95vw; max-height: 95vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🦾 Управление имплантами</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; min-height: 600px;">
                    <!-- Левая панель: Схема тела -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem; border: 1px solid var(--border);">
                        <h4 style="color: var(--accent); text-align: center; margin-bottom: 1rem;">Схема тела</h4>
                        <div style="position: relative; height: 500px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 8px; border: 1px solid var(--border);">
                            <!-- ГОЛОВА -->
                            <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: ${state.implants.head.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 50%; border: 2px solid ${state.implants.head.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.head.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.head.parts.main ? "selectImplant('head', 'main')" : 'showUnpurchasedError()'}" title="Кибер-голова">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.head.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.8rem; font-weight: bold;">ГОЛОВА</div>
                                ${!state.implants.head.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1.2rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- НЕЙРОМОДУЛЬ -->
                            <div style="position: absolute; top: 100px; left: 50%; transform: translateX(-50%); width: 40px; height: 40px; background: ${state.implants.neuromodule.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 50%; border: 2px solid ${state.implants.neuromodule.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.neuromodule.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.neuromodule.parts.main ? 'selectImplant(\'neuromodule\')' : 'showUnpurchasedError()'}" title="Нейромодуль">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.neuromodule.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.6rem; font-weight: bold;">НЕЙРО</div>
                                ${!state.implants.neuromodule.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- СПИНА - отдельные части -->
                            <div style="position: absolute; top: 150px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.cervical ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.cervical ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.cervical ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.cervical ? "selectImplant('spine', 'cervical')" : 'showUnpurchasedError()'}" title="Шейная">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.cervical ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">ШЕЙНАЯ</div>
                                ${!state.implants.spine.parts.cervical ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 170px; left: 30%; transform: translateX(-50%); width: 50px; height: 15px; background: ${state.implants.spine.parts.thoracicLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.thoracicLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.thoracicLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.thoracicLeft ? "selectImplant('spine', 'thoracicLeft')" : 'showUnpurchasedError()'}" title="Грудная левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.thoracicLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.25rem; font-weight: bold;">ГРУД Л</div>
                                ${!state.implants.spine.parts.thoracicLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 170px; right: 30%; transform: translateX(50%); width: 50px; height: 15px; background: ${state.implants.spine.parts.thoracicRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.thoracicRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.thoracicRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.thoracicRight ? "selectImplant('spine', 'thoracicRight')" : 'showUnpurchasedError()'}" title="Грудная правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.thoracicRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.25rem; font-weight: bold;">ГРУД П</div>
                                ${!state.implants.spine.parts.thoracicRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.lumbar ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.lumbar ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.lumbar ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.lumbar ? "selectImplant('spine', 'lumbar')" : 'showUnpurchasedError()'}" title="Поясничная">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.lumbar ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">ПОЯСНИЧ</div>
                                ${!state.implants.spine.parts.lumbar ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 210px; left: 50%; transform: translateX(-50%); width: 60px; height: 15px; background: ${state.implants.spine.parts.sacral ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.spine.parts.sacral ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.spine.parts.sacral ? 'pointer' : 'not-allowed'};" onclick="${state.implants.spine.parts.sacral ? "selectImplant('spine', 'sacral')" : 'showUnpurchasedError()'}" title="Крестцовая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.spine.parts.sacral ? 'var(--success)' : 'var(--danger)'}; font-size: 0.3rem; font-weight: bold;">КРЕСТЦОВ</div>
                                ${!state.implants.spine.parts.sacral ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 0.6rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ЛЕВАЯ РУКА - отдельные части -->
                            <div style="position: absolute; top: 160px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.wristLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.wristLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.wristLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.wristLeft ? "selectImplant('arms', 'wristLeft')" : 'showUnpurchasedError()'}" title="Кисть левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.wristLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">КИСТЬ</div>
                                ${!state.implants.arms.parts.wristLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.forearmLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.forearmLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.forearmLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.forearmLeft ? "selectImplant('arms', 'forearmLeft')" : 'showUnpurchasedError()'}" title="Предплечье левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.forearmLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.4rem; font-weight: bold;">ПРЕДПЛЕЧЬЕ</div>
                                ${!state.implants.arms.parts.forearmLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 220px; left: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.shoulderLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.shoulderLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.shoulderLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.shoulderLeft ? "selectImplant('arms', 'shoulderLeft')" : 'showUnpurchasedError()'}" title="Плечо левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.shoulderLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ПЛЕЧО</div>
                                ${!state.implants.arms.parts.shoulderLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ПРАВАЯ РУКА - отдельные части -->
                            <div style="position: absolute; top: 160px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.wristRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.wristRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.wristRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.wristRight ? "selectImplant('arms', 'wristRight')" : 'showUnpurchasedError()'}" title="Кисть правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.wristRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">КИСТЬ</div>
                                ${!state.implants.arms.parts.wristRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 190px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.forearmRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.forearmRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.forearmRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.forearmRight ? "selectImplant('arms', 'forearmRight')" : 'showUnpurchasedError()'}" title="Предплечье правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.forearmRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.4rem; font-weight: bold;">ПРЕДПЛЕЧЬЕ</div>
                                ${!state.implants.arms.parts.forearmRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 220px; right: 20px; width: 45px; height: 25px; background: ${state.implants.arms.parts.shoulderRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.arms.parts.shoulderRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.arms.parts.shoulderRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.arms.parts.shoulderRight ? "selectImplant('arms', 'shoulderRight')" : 'showUnpurchasedError()'}" title="Плечо правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.arms.parts.shoulderRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ПЛЕЧО</div>
                                ${!state.implants.arms.parts.shoulderRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ВНУТРЕННОСТИ -->
                            <div style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); width: 60px; height: 60px; background: ${state.implants.organs.parts.main ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 8px; border: 2px solid ${state.implants.organs.parts.main ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.organs.parts.main ? 'pointer' : 'not-allowed'};" onclick="${state.implants.organs.parts.main ? 'selectImplant(\'organs\')' : 'showUnpurchasedError()'}" title="Кибер-внутренности">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.organs.parts.main ? 'var(--success)' : 'var(--danger)'}; font-size: 0.6rem; font-weight: bold;">ВНУТРЕННОСТИ</div>
                                ${!state.implants.organs.parts.main ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ЛЕВАЯ НОГА - отдельные части -->
                            <div style="position: absolute; top: 380px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.footLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.footLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.footLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.footLeft ? "selectImplant('legs', 'footLeft')" : 'showUnpurchasedError()'}" title="Стопа левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.footLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">СТОПА</div>
                                ${!state.implants.legs.parts.footLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 410px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.shinLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.shinLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.shinLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.shinLeft ? "selectImplant('legs', 'shinLeft')" : 'showUnpurchasedError()'}" title="Голень левая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.shinLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ГОЛЕНЬ</div>
                                ${!state.implants.legs.parts.shinLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 440px; left: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.thighLeft ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.thighLeft ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.thighLeft ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.thighLeft ? "selectImplant('legs', 'thighLeft')" : 'showUnpurchasedError()'}" title="Бедро левое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.thighLeft ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">БЕДРО</div>
                                ${!state.implants.legs.parts.thighLeft ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <!-- ПРАВАЯ НОГА - отдельные части -->
                            <div style="position: absolute; top: 380px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.footRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.footRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.footRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.footRight ? "selectImplant('legs', 'footRight')" : 'showUnpurchasedError()'}" title="Стопа правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.footRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">СТОПА</div>
                                ${!state.implants.legs.parts.footRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 410px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.shinRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.shinRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.shinRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.shinRight ? "selectImplant('legs', 'shinRight')" : 'showUnpurchasedError()'}" title="Голень правая">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.shinRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">ГОЛЕНЬ</div>
                                ${!state.implants.legs.parts.shinRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                            
                            <div style="position: absolute; top: 440px; right: 20px; width: 45px; height: 25px; background: ${state.implants.legs.parts.thighRight ? 'rgba(125, 244, 198, 0.3)' : 'rgba(255, 91, 135, 0.3)'}; border-radius: 4px; border: 2px solid ${state.implants.legs.parts.thighRight ? 'var(--success)' : 'var(--danger)'}; cursor: ${state.implants.legs.parts.thighRight ? 'pointer' : 'not-allowed'};" onclick="${state.implants.legs.parts.thighRight ? "selectImplant('legs', 'thighRight')" : 'showUnpurchasedError()'}" title="Бедро правое">
                                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${state.implants.legs.parts.thighRight ? 'var(--success)' : 'var(--danger)'}; font-size: 0.5rem; font-weight: bold;">БЕДРО</div>
                                ${!state.implants.legs.parts.thighRight ? '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: var(--danger); font-size: 1rem;">✖</div>' : ''}
                            </div>
                        </div>
                    </div>
                    
                    <!-- Правая панель: Детали импланта -->
                    <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 1rem; border: 1px solid var(--border);">
                        <h4 style="color: var(--accent); text-align: center; margin-bottom: 1rem;">Детали импланта</h4>
                        <div id="implantDetails">
                            <p style="color: var(--muted); text-align: center; padding: 2rem;">Выберите имплант на схеме тела</p>
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
}

// Функция для выбора импланта
function selectImplant(implantType, partName = null) {
    const detailsContainer = document.getElementById('implantDetails');
    if (!detailsContainer) return;
    
    const implant = state.implants[implantType];
    if (!implant || !implant.installed) {
        detailsContainer.innerHTML = `
            <p style="color: var(--muted); text-align: center; padding: 2rem;">
                Имплант не установлен. Купите части импланта в магазине.
            </p>
        `;
        return;
    }
    
    let detailsHTML = `
        <div style="margin-bottom: 1rem;">
            <h5 style="color: var(--accent); margin-bottom: 0.5rem;">${getImplantName(implantType)}</h5>
            <p style="color: var(--muted); font-size: 0.9rem;">${getImplantDescription(implantType)}</p>
        </div>
    `;
    
    // Если указана конкретная часть, показываем только её
    if (partName) {
        const partData = implant.parts[partName];
        if (!partData || !partData.slots) {
            detailsContainer.innerHTML = `
                <p style="color: var(--danger); text-align: center; padding: 2rem;">
                    Эта часть импланта не куплена!
                </p>
            `;
            return;
        }
        
        const partDisplayName = getPartDisplayName(implantType, partName);
        detailsHTML += `
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                <h6 style="color: var(--accent); margin-bottom: 0.5rem;">${partDisplayName}</h6>
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    ${Array.from({length: partData.slots}, (_, i) => `
                        <div class="implant-slot" style="width: 40px; height: 40px; background: ${partData.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'rgba(182, 103, 255, 0.2)'}; border: 2px solid ${partData.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="manageSlot('${implantType}', '${partName}', ${i})">
                            ${partData.modules[i] ? '✓' : '○'}
                        </div>
                    `).join('')}
                </div>
                <p style="color: var(--muted); font-size: 0.8rem;">Слотов: ${partData.modules.filter(m => m).length}/${partData.slots}</p>
                ${partData.modules.filter(m => m).length > 0 ? `
                    <div style="margin-top: 0.5rem;">
                        <h7 style="color: var(--success); font-size: 0.8rem;">Установленные модули:</h7>
                        ${partData.modules.map((module, i) => module ? `
                            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.5rem; margin-top: 0.25rem;">
                                <div style="color: var(--success); font-weight: bold; font-size: 0.8rem;">${module.name}</div>
                                <div style="color: var(--muted); font-size: 0.7rem;">${module.description}</div>
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
                <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--border);">
                    <h6 style="color: var(--accent); margin-bottom: 0.5rem;">${partDisplayName}</h6>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${Array.from({length: partData.slots}, (_, i) => `
                            <div class="implant-slot" style="width: 40px; height: 40px; background: ${partData.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'rgba(182, 103, 255, 0.2)'}; border: 2px solid ${partData.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 6px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="manageSlot('${implantType}', '${partName}', ${i})">
                                ${partData.modules[i] ? '✓' : '○'}
                            </div>
                        `).join('')}
                    </div>
                    <p style="color: var(--muted); font-size: 0.8rem;">Слотов: ${partData.modules.filter(m => m).length}/${partData.slots}</p>
                    ${partData.modules.filter(m => m).length > 0 ? `
                        <div style="margin-top: 0.5rem;">
                            <h7 style="color: var(--success); font-size: 0.8rem;">Установленные модули:</h7>
                            ${partData.modules.map((module, i) => module ? `
                                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 6px; padding: 0.5rem; margin-top: 0.25rem;">
                                    <div style="color: var(--success); font-weight: bold; font-size: 0.8rem;">${module.name}</div>
                                    <div style="color: var(--muted); font-size: 0.7rem;">${module.description}</div>
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
            <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">&#x274C; Эта часть импланта не куплена!</p>
            <p style="color: var(--muted); margin-bottom: 1rem;">Купите её в магазине частей имплантов.</p>
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                    <p style="color: var(--danger); text-align: center; padding: 2rem;">
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
                <p style="color: var(--muted); margin-bottom: 1rem;">
                    ${getImplantName(implantType)} → ${getPartDisplayName(implantType, partName)} → Слот ${slotIndex + 1}
                </p>
    `;
    
    if (currentModule) {
        slotHTML += `
            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: var(--success); margin-bottom: 0.5rem;">Установленный модуль:</h5>
                <p style="color: var(--text); font-weight: 600;">${currentModule.name}</p>
                <p style="color: var(--muted); font-size: 0.9rem;">${currentModule.description}</p>
                <button class="pill-button danger-button" onclick="removeModuleFromSlot('${implantType}', '${partName}', ${slotIndex}); closeModal(this);" style="margin-top: 0.5rem;">Удалить модуль</button>
            </div>
        `;
    } else {
        slotHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: var(--accent); margin-bottom: 0.5rem;">Свободный слот</h5>
                <div class="drop-zone" data-implant-type="${implantType}" data-part-name="${partName}" data-slot-index="${slotIndex}" style="background: rgba(125, 244, 198, 0.1); border: 2px dashed var(--success); border-radius: 8px; padding: 2rem; text-align: center; margin-bottom: 1rem; min-height: 80px; display: flex; align-items: center; justify-content: center;">
                    <p style="color: var(--success); font-weight: 600; margin: 0;">Перетащите модуль сюда</p>
                </div>
                <p style="color: var(--muted);">Или выберите модуль для установки:</p>
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
}

function loadAvailableModules(implantType, partName, slotIndex) {
    const container = document.getElementById('availableModules');
    if (!container) return;
    
    // Ищем модули в снаряжении
    const availableModules = state.gear.filter(item => item.type === 'implant');
    
    if (availableModules.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Нет доступных модулей в снаряжении</p>';
        return;
    }
    
    container.innerHTML = availableModules.map((module, index) => `
        <div class="draggable-module" draggable="true" data-module-index="${state.gear.findIndex(item => item === module)}" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; cursor: grab;">
            <div style="color: var(--text); font-weight: 600;">${module.implantData.name}</div>
            <div style="color: var(--muted); font-size: 0.8rem;">${module.implantData.description}</div>
            <div style="margin-top: 0.5rem;">
                <button class="pill-button success-button" onclick="installModuleInSlot('${implantType}', '${partName}', ${slotIndex}, ${state.gear.findIndex(item => item === module)}); closeModal(this);" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">
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
                closeModal(document.querySelector('.modal-overlay .icon-button'));
            }
        });
    }
}

function installModuleInSlot(implantType, partName, slotIndex, gearIndex) {
    const module = state.gear[gearIndex];
    if (!module) return;
    
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
    
    showModal('Модуль установлен', `&#x2705; ${module.implantData.name} установлен в слот!`);
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                    <button onclick="toggleImplantPartsFreeMode()" id="implantPartsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <p style="color: var(--muted); margin-bottom: 1.5rem;">
                    Выберите часть импланта для покупки. Каждая часть может быть установлена отдельно.
                </p>
                <div style="display: grid; gap: 1rem;">
    `;
    
    implantParts.forEach(implant => {
        shopHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 12px; padding: 1rem;">
                <h4 style="color: var(--accent); margin-bottom: 0.5rem;">${implant.name}</h4>
                <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">${implant.description}</p>
                <div style="display: grid; gap: 0.5rem;">
        `;
        
        implant.parts.forEach(part => {
            const partData = state.implants[implant.category].parts[part.name];
            const isPurchased = partData !== null && partData !== undefined;
            const purchasedText = isPurchased ? ' (куплена)' : '';
            
            shopHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                    <div>
                        <strong>${part.displayName}${purchasedText}</strong>
                        <div class="implant-part-price-display" style="color: var(--muted); font-size: 0.8rem;" data-original-price="${implant.price}" data-slots="${part.slots}" data-awareness="${implant.awarenessLoss}">
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
}

function buyImplantPart(category, partName, implantName, partDisplayName, price, awarenessLoss, description, slots) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Ха-ха, не так быстро, нищюк!</p>
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
        modules: new Array(slots).fill(null)
    };
    
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: `${implantName} - ${partDisplayName}`,
        price: price,
        category: 'Киберимпланты'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Часть импланта установлена', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${partDisplayName} установлена!</p>
            <p style="color: var(--danger); margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${typeof state.awareness === 'object' ? state.awareness.current : state.awareness}</p>
            <p style="color: var(--muted);">Теперь вы можете установить модули через "Управление имплантами"</p>
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
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">❌ Невозможно удалить!</p>
                <p style="color: var(--text); margin-bottom: 1rem;">В этой части импланта установлены модули. Сначала удалите все модули.</p>
            </div>
        `);
        return;
    }
    
    // Подтверждение удаления
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>⚠️ Подтверждение удаления</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">
                    Вы уверены, что хотите удалить <strong style="color: var(--accent);">${partDisplayName}</strong>?
                </p>
                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 0.75rem; margin-bottom: 1rem;">
                    <p style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">Вы получите обратно:</p>
                    <p style="color: var(--text); font-size: 0.9rem;"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Деньги: ${price} уе</p>
                    <p style="color: var(--text); font-size: 0.9rem;">🧠 Осознанность: ${awarenessLoss} (будет брошен кубик)</p>
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
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">✅ ${partDisplayName} удалена!</p>
            <p style="color: var(--text); margin-bottom: 0.5rem;"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Возвращено денег: ${price} уе</p>
            <p style="color: var(--text); margin-bottom: 1rem;">🧠 Восстановлено осознанности: ${awarenessReturn}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${typeof state.awareness === 'object' ? state.awareness.current : state.awareness}</p>
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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
function renderHousing() {
    const container = document.getElementById('housingContainer');
    if (!container) return;
    
    if (state.property.housing.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Жилье не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.property.housing.map((house, index) => `
        <div class="property-item">
            <div class="property-header">
                <div class="property-name">${house.name}</div>
                <button class="pill-button danger-button" onclick="removeHousing(${index})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Удалить</button>
            </div>
            ${house.description ? `<div class="property-description">${house.description}</div>` : ''}
        </div>
    `).join('');
}

function renderVehicles() {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (state.property.vehicles.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Транспорт не добавлен</p>';
        return;
    }
    
    container.innerHTML = state.property.vehicles.map((vehicle, index) => `
        <div class="property-item">
            <div class="property-header">
                <div class="property-name">${vehicle.name}</div>
                <button class="pill-button danger-button" onclick="removeVehicle(${index})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Удалить</button>
            </div>
            ${vehicle.description ? `<div class="property-description">${vehicle.description}</div>` : ''}
            ${vehicle.image ? `
                <div class="vehicle-image-wrapper">
                    <div class="vehicle-image">
                        <img src="${vehicle.image}" alt="${vehicle.name}" />
                    </div>
                    <div class="vehicle-image-actions">
                        <button class="pill-button danger-button" onclick="removeVehicleImage(${index})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">&#x1F5D1;&#xFE0F; Удалить фото</button>
                    </div>
                </div>
            ` : `
                <div class="vehicle-image-wrapper">
                    <div class="vehicle-image">
                        <div class="vehicle-image-placeholder">&#x1F697;</div>
                    </div>
                    <div class="vehicle-image-actions">
                        <label class="pill-button muted-button" style="cursor: pointer; font-size: 0.8rem; padding: 0.3rem 0.6rem;">
                            📷 Загрузить фото
                            <input type="file" accept="image/*" onchange="uploadVehicleImage(${index}, this)" style="display: none;" />
                        </label>
                    </div>
                </div>
            `}
        </div>
    `).join('');
}

function addHousing() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

function saveHousing() {
    const name = document.getElementById('housingName').value;
    const description = document.getElementById('housingDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Введите название жилья!</p>
            </div>
        `);
        return;
    }
    
    const newHousing = {
        id: generateId('housing'),
        name: name,
        description: description
    };
    
    state.property.housing.push(newHousing);
    renderHousing();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeHousing(index) {
    showConfirmModal('Подтверждение', 'Удалить жилье?', () => {
        state.property.housing.splice(index, 1);
        renderHousing();
        scheduleSave();
    });
}

function addVehicle() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

function saveVehicle() {
    const name = document.getElementById('vehicleName').value;
    const description = document.getElementById('vehicleDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Введите название транспорта!</p>
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
    renderVehicles();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeVehicle(index) {
    showConfirmModal('Подтверждение', 'Удалить транспорт?', () => {
        state.property.vehicles.splice(index, 1);
        renderVehicles();
        scheduleSave();
    });
}

function uploadVehicleImage(index, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.property.vehicles[index].image = e.target.result;
            renderVehicles();
            scheduleSave();
        };
        reader.readAsDataURL(file);
    }
}

function removeVehicleImage(index) {
    showConfirmModal('Подтверждение', 'Удалить изображение транспорта?', () => {
        state.property.vehicles[index].image = null;
        renderVehicles();
        scheduleSave();
    });
}

// Функции для работы со снаряжением
function renderGear() {
    const container = document.getElementById('gearContainer');
    if (!container) return;
    
    if (state.gear.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Снаряжение не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.gear.map((item, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
                <div style="flex: 1;">
                    <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">
                        ${item.name}
                    </div>
                    <div style="color: var(--text); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                        ${item.description}
                    </div>
                </div>
            </div>
            
            <!-- Блок Нагрузка и кнопка Удалить в правом верхнем углу -->
            <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                <div style="background: #003366; border-radius: 6px; padding: 0.3rem 0.6rem; color: white; font-size: 0.85rem; white-space: nowrap; font-weight: 500; text-align: center;">
                    Нагрузка: ${item.load}
                </div>
                <button onclick="removeGear(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Удалить">
                    <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" alt="Удалить" style="width: 20px; height: 20px; display: block;">
                </button>
            </div>
        </div>
    `).join('');
    
    updateLoadDisplay();
}

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

function resetLoad() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>⚖️ Сброс нагрузки</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Текущая нагрузка: <strong style="color: var(--accent);">${state.load.current}</strong> / ${state.load.max}
                    </p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Общая нагрузка предметов: <strong style="color: var(--success);">${state.gear.reduce((sum, item) => sum + (item.load || 0), 0)}</strong>
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
}

function applyLoadReset() {
    const newLoad = parseInt(document.getElementById('newLoadValue').value);
    
    if (isNaN(newLoad) || newLoad < 0 || newLoad > state.load.max) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Введите корректное значение нагрузки!</p>
                <p style="color: var(--muted); font-size: 0.9rem;">Значение должно быть от 0 до ${state.load.max}</p>
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🎒 Магазин снаряжения</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleGearFreeMode()" id="gearFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <input type="text" id="gearSearchInput" placeholder="&#x1F50D; Поиск по названию..." style="width: 100%; padding: 0.75rem; background: var(--panel); border: 1px solid var(--border); border-radius: 8px; color: var(--text); font-size: 1rem;" onkeyup="filterGear(this.value)">
                </div>
                <div style="display: grid; gap: 1rem;">
                    ${GEAR_LIBRARY.map((item) => `
                        <div class="property-item gear-item" data-name="${item.name.toLowerCase()}" data-description="${item.description.toLowerCase()}">
                            <div class="property-header">
                                <div class="property-name">${item.name}</div>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span class="gear-price-display" style="color: var(--muted); font-size: 0.9rem;" data-original-price="${item.price}" data-load="${item.load}">Цена: ${item.price} уе | Нагрузка: ${item.load}</span>
                                    <button class="pill-button primary-button gear-buy-button" onclick="buyGear('${item.name}', ${item.price}, ${item.load}, '${item.description.replace(/'/g, "\\'")}')" data-gear-name="${item.name}" data-price="${item.price}" data-load="${item.load}" data-description="${item.description.replace(/'/g, "\\'")}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                </div>
                            </div>
                            <div class="property-description">${item.description}</div>
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

function buyGear(name, price, load, description) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
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
        name: name,
        description: description,
        price: price,
        load: load
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Снаряжение'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Снаряжение куплено', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} добавлено в снаряжение!</p>
            <p style="color: var(--muted); font-size: 0.9rem;">Осталось нагрузки: ${state.load.current}</p>
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
    updateLoadDisplay();
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
            btn.setAttribute('onclick', `buyGear('${name}', ${price}, ${load}, '${description}')`);
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        // Включаем бесплатный режим
        buyButtons.forEach(btn => {
            const name = btn.getAttribute('data-gear-name');
            const load = btn.getAttribute('data-load');
            const description = btn.getAttribute('data-description');
            btn.setAttribute('onclick', `buyGear('${name}', 0, ${load}, '${description}')`);
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

function savePickedGear() {
    const name = document.getElementById('pickedGearName').value;
    const load = parseInt(document.getElementById('pickedGearLoad').value) || 0;
    const description = document.getElementById('pickedGearDescription').value;
    
    if (!name) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Введите название предмета!</p>
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
        price: 0,
        load: load
    };
    
    state.gear.push(newGear);
    renderGear();
    updateLoadDisplay();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeGear(index) {
    showConfirmModal('Подтверждение', 'Удалить снаряжение?', () => {
        const item = state.gear[index];
        if (item) {
            // Возвращаем нагрузку
            state.load.current += item.load || 0;
            
            // Удаляем предмет
            state.gear.splice(index, 1);
            
            // Обновляем отображение
            renderGear();
            updateLoadDisplay();
            scheduleSave();
        }
    });
}

// Функции для работы с оружием
function showWeaponShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild6334-3163-4362-b232-366332396435/weapon.png" alt="🔫" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Какое оружие ищешь?</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => showMeleeWeaponsShop(), 100);" style="font-size: 1rem; padding: 1rem;">
                        <img src="https://static.tildacdn.com/tild6232-3061-4366-b935-333266373362/sword.png" alt="⚔️" style="width: 20px; height: 20px; margin-right: 0.5rem; vertical-align: middle;"> Для ближнего боя
                    </button>
                    <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => showRangedWeaponsShop(), 100);" style="font-size: 1rem; padding: 1rem;">
                        <img src="https://static.tildacdn.com/tild6332-3731-4662-b731-326433633632/assault-rifle.png" alt="🔫" style="width: 20px; height: 20px; margin-right: 0.5rem; vertical-align: middle;"> Для дальнего боя
                    </button>
                    <button class="pill-button success-button" onclick="closeModal(this); setTimeout(() => showCustomWeaponCreator(), 100);" style="font-size: 1rem; padding: 1rem;">
                        🔧 Создам своё!
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

function showMeleeWeaponsShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>⚔️ Оружие ближнего боя</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleMeleeWeaponsFreeMode()" id="meleeWeaponsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
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
                                    <span class="melee-weapon-price" style="color: var(--muted); font-size: 0.9rem;" data-original-price="${weapon.price}" data-load="${weapon.load}">Цена: ${weapon.price} уе | Нагрузка: ${weapon.load}</span>
                                    <button class="pill-button primary-button melee-weapon-buy-button" onclick="buyMeleeWeapon('${weapon.type}', ${weapon.price}, ${weapon.load}, '${weapon.damage}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                    <button class="pill-button success-button melee-weapon-gear-button" onclick="buyMeleeWeaponToGear('${weapon.type}', ${weapon.price}, ${weapon.load}, '${weapon.damage}', ${weapon.concealable}, '${weapon.stealthPenalty}', '${weapon.examples}')" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-damage="${weapon.damage}" data-concealable="${weapon.concealable}" data-stealth-penalty="${weapon.stealthPenalty}" data-examples="${weapon.examples}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">В сумку</button>
                                </div>
                            </div>
                            <div class="property-description">
                                <div style="font-family: monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">
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
}

function showRangedWeaponsShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3>🔫 Оружие дальнего боя</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleRangedWeaponsFreeMode()" id="rangedWeaponsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
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
                                    <span class="ranged-weapon-price" style="color: var(--muted); font-size: 0.9rem;" data-original-price="${weapon.price}" data-load="${weapon.load}">Цена: ${weapon.price} уе | Нагрузка: ${weapon.load}</span>
                                    <button class="pill-button primary-button ranged-weapon-buy-button" onclick="if(typeof buyRangedWeapon === 'function') { buyRangedWeapon('${weapon.type.replace(/'/g, "\\'")}', ${weapon.price}, ${weapon.load}, '${weapon.primaryDamage}', '${weapon.altDamage}', '${weapon.concealable}', '${weapon.hands}', ${weapon.stealth}, '${weapon.magazine}'); }" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                    <button class="pill-button success-button ranged-weapon-gear-button" onclick="if(typeof buyRangedWeaponToGear === 'function') { buyRangedWeaponToGear('${weapon.type.replace(/'/g, "\\'")}', ${weapon.price}, ${weapon.load}, '${weapon.primaryDamage}', '${weapon.altDamage}', '${weapon.concealable}', '${weapon.hands}', ${weapon.stealth}, '${weapon.magazine}'); }" data-weapon-type="${weapon.type}" data-price="${weapon.price}" data-load="${weapon.load}" data-primary-damage="${weapon.primaryDamage}" data-alt-damage="${weapon.altDamage}" data-concealable="${weapon.concealable}" data-hands="${weapon.hands}" data-stealth="${weapon.stealth}" data-magazine="${weapon.magazine}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">В сумку</button>
                                </div>
                            </div>
                            <div class="property-description">
                                <div style="font-family: monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">
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
}

function showCustomWeaponCreator() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                        🔫 Оружие дальнего боя
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

function showCustomMeleeWeaponForm() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

function showCustomRangedWeaponForm() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

// Функции покупки оружия ближнего боя
function buyMeleeWeapon(type, price, load, damage, concealable, stealthPenalty, examples) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
        slots: 1 // У ОББ всегда 1 слот
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

function buyMeleeWeaponToGear(type, price, load, damage, concealable, stealthPenalty, examples) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
        description: `Урон: ${damage} | Можно скрыть: ${concealable} | Штраф к СКА: ${stealthPenalty} | Примеры: ${examples}`,
        price: price,
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
        description: `Урон: ${damage} | Можно скрыть: ${concealable} | Штраф к СКА: ${stealthPenalty} | Примеры: ${examples}`,
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
function buyRangedWeapon(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
        price: price,
        load: load,
        modules: [],
        slots: slots,
        // Система магазина
        maxAmmo: parseInt(magazine),
        currentAmmo: 0,
        loadedAmmoType: null,
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

function buyRangedWeaponToGear(type, price, load, primaryDamage, altDamage, concealable, hands, stealth, magazine) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${concealable} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine}`,
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

function getRangedWeaponFreeToWeapons(type, load, primaryDamage, altDamage, concealable, hands, stealth, magazine) {
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Определяем количество слотов для модулей
    const slots = getRangedWeaponSlots(type);
    
    // Добавляем оружие в блок "Оружие" бесплатно
    const newWeapon = {
        id: generateId('weapon'),
        name: type,
        customName: '',
        type: 'ranged',
        primaryDamage: primaryDamage,
        altDamage: altDamage,
        concealable: concealable,
        hands: hands,
        stealth: stealth,
        magazine: magazine,
        price: 0,
        load: load,
        modules: [],
        slots: slots,
        // Система магазина
        maxAmmo: magazine,
        currentAmmo: 0,
        loadedAmmoType: null,
        // Не дробовик
        isShotgun: false,
        shotgunAmmo1: { type: null, count: 0 },
        shotgunAmmo2: { type: null, count: 0 },
        canRemove: true
    };
    
    state.weapons.push(newWeapon);
    renderWeapons();
    updateLoadDisplay();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: 0,
        category: 'Оружие дальнего боя (бесплатно)'
    });
    
    showModal('Оружие получено', `&#x2705; ${type} добавлено в блок Оружие бесплатно!`);
}

function getRangedWeaponFreeToGear(type, load, primaryDamage, altDamage, concealable, hands, stealth, magazine) {
    // Уменьшаем доступную нагрузку
    state.load.current -= load;
    
    // Добавляем в снаряжение бесплатно
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${concealable} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine}`,
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
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: type,
        price: 0,
        category: 'Оружие дальнего боя (в сумку, бесплатно)'
    });
    
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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

function toggleRangedWeaponsFreeMode() {
    const buyButtons = document.querySelectorAll('.ranged-weapon-buy-button');
    const gearButtons = document.querySelectorAll('.ranged-weapon-gear-button');
    const toggleButton = document.getElementById('rangedWeaponsFreeModeButton');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    const isFreeMode = toggleButton.textContent === 'Отключить бесплатно';
    
    if (isFreeMode) {
        buyButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `if(typeof buyRangedWeapon === 'function') { buyRangedWeapon('${type.replace(/'/g, "\\'")}', ${price}, ${load}, '${primaryDamage}', '${altDamage}', '${concealable}', '${hands}', ${stealth}, '${magazine}'); }`);
        });
        
        gearButtons.forEach(btn => {
            const price = btn.getAttribute('data-price');
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `if(typeof buyRangedWeaponToGear === 'function') { buyRangedWeaponToGear('${type.replace(/'/g, "\\'")}', ${price}, ${load}, '${primaryDamage}', '${altDamage}', '${concealable}', '${hands}', ${stealth}, '${magazine}'); }`);
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    } else {
        buyButtons.forEach(btn => {
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `if(typeof getRangedWeaponFreeToWeapons === 'function') { getRangedWeaponFreeToWeapons('${type.replace(/'/g, "\\'")}', ${load}, '${primaryDamage}', '${altDamage}', '${concealable}', '${hands}', ${stealth}, '${magazine}'); }`);
        });
        
        gearButtons.forEach(btn => {
            const type = btn.getAttribute('data-weapon-type');
            const load = btn.getAttribute('data-load');
            const primaryDamage = btn.getAttribute('data-primary-damage');
            const altDamage = btn.getAttribute('data-alt-damage');
            const concealable = btn.getAttribute('data-concealable');
            const hands = btn.getAttribute('data-hands');
            const stealth = btn.getAttribute('data-stealth');
            const magazine = btn.getAttribute('data-magazine');
            btn.setAttribute('onclick', `if(typeof getRangedWeaponFreeToGear === 'function') { getRangedWeaponFreeToGear('${type.replace(/'/g, "\\'")}', ${load}, '${primaryDamage}', '${altDamage}', '${concealable}', '${hands}', ${stealth}, '${magazine}'); }`);
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
                <p style="color: var(--danger);">Заполните все обязательные поля!</p>
            </div>
        `);
        return;
    }
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Внешний вид: ${appearance} | Урон: ${damage} | Можно скрыть: ${concealable} | Штраф к СКА: ${stealthPenalty} | ${description}`,
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
                <p style="color: var(--danger);">Заполните все обязательные поля!</p>
            </div>
        `);
        return;
    }
    
    // Добавляем в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: type,
        description: `Урон основной: ${primaryDamage} | Урон альтернативный: ${altDamage} | Можно скрыть: ${concealable} | # рук: ${hands} | СКА: ${stealth} | Патронов в магазине: ${magazine} | ${description}`,
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem; font-size: 0.8rem;">Оружие не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.weapons.map((weapon, index) => `
        <div class="weapon-item" style="background: rgba(0,0,0,0.2); border: 1px solid rgba(182, 103, 255, 0.2); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
            <div class="weapon-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
                <div style="flex: 1;">
                    <h4 style="color: var(--accent); font-size: 0.95rem; margin: 0 0 0.25rem 0;">
                        <span contenteditable="true" onblur="updateWeaponCustomName('${weapon.id}', this.textContent)" style="outline: none; border: none; background: transparent; color: inherit; font-size: inherit; font-weight: inherit;">${weapon.customName || weapon.name}</span>
                    </h4>
                </div>
                <button class="pill-button success-button" onclick="moveWeaponToGear(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem; white-space: nowrap;">Сложить в сумку</button>
            </div>
            
            <div class="weapon-damage" style="margin-bottom: 0.5rem;">
                ${weapon.type === 'melee' ? `
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: var(--text); font-weight: 600; font-size: 0.85rem;">Урон:</span>
                        <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.damage}', '${weapon.name}', '${weapon.type}', '${weapon.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.damage}</button>
                    </div>
                ` : `
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                        <span style="color: var(--text); font-weight: 600; font-size: 0.85rem;">Урон основной:</span>
                        <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.primaryDamage}', '${weapon.name}', '${weapon.type}', '${weapon.id}', 'primary')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.primaryDamage}</button>
                    </div>
                    ${weapon.altDamage ? `
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <span style="color: var(--text); font-weight: 600; font-size: 0.85rem;">Урон альтернативный:</span>
                            <button class="pill-button primary-button" onclick="rollWeaponDamage('${weapon.altDamage}', '${weapon.name}', '${weapon.type}', '${weapon.id}', 'alt')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">${weapon.altDamage}</button>
                        </div>
                    ` : ''}
                `}
            </div>
            
            <div class="weapon-stats" style="font-family: monospace; font-size: 0.7rem; color: var(--muted); margin-bottom: 0.5rem;">
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
                            <span style="color: var(--accent); font-weight: 600; font-size: 0.85rem;">Патроны в дробовике:</span>
                            <button class="pill-button success-button" onclick="reloadShotgun('${weapon.id}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">&#x1F504; Перезарядить</button>
                        </div>
                        <div style="display: grid; gap: 0.25rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.75rem; min-width: 50px; text-align: center;">
                                    <span style="color: var(--accent); font-weight: 600;">${weapon.shotgunAmmo1.count}/3</span>
                                </div>
                                ${weapon.shotgunAmmo1.type ? `
                                    <div style="font-size: 0.7rem; color: var(--success); font-family: monospace;">
                                        ${weapon.shotgunAmmo1.type}
                                    </div>
                                ` : `
                                    <div style="font-size: 0.7rem; color: var(--muted); font-style: italic;">
                                        Не заряжено
                                    </div>
                                `}
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 4px; padding: 0.2rem 0.4rem; font-size: 0.75rem; min-width: 50px; text-align: center;">
                                    <span style="color: var(--accent); font-weight: 600;">${weapon.shotgunAmmo2.count}/3</span>
                                </div>
                                ${weapon.shotgunAmmo2.type ? `
                                    <div style="font-size: 0.7rem; color: var(--success); font-family: monospace;">
                                        ${weapon.shotgunAmmo2.type}
                                    </div>
                                ` : `
                                    <div style="font-size: 0.7rem; color: var(--muted); font-style: italic;">
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
                            <span style="color: var(--accent); font-weight: 600; font-size: 0.85rem;">Патроны в магазине:</span>
                            <button class="pill-button success-button" onclick="reloadWeapon('${weapon.id}')" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">&#x1F504; Перезарядить</button>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 4px; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                <span style="color: var(--accent); font-weight: 600;">${weapon.currentAmmo || 0}</span>
                                <span style="color: var(--muted);">/</span>
                                <span style="color: var(--text);">${weapon.maxAmmo || weapon.magazine}</span>
                            </div>
                            ${weapon.loadedAmmoType ? `
                                <div style="font-size: 0.75rem; color: var(--success); font-family: monospace;">
                                    ${weapon.loadedAmmoType}
                                </div>
                            ` : `
                                <div style="font-size: 0.75rem; color: var(--muted); font-style: italic;">
                                    Не заряжено
                                </div>
                            `}
                        </div>
                    </div>
                `}
            ` : ''}
            
            ${weapon.examples ? `<div class="weapon-examples" style="font-size: 0.75rem; color: var(--muted); margin-bottom: 0.5rem;"><strong>Примеры:</strong> ${weapon.examples}</div>` : ''}
            
            ${weapon.slots > 0 ? `
                <div class="weapon-modules">
                    <div style="color: var(--accent); font-weight: 600; margin-bottom: 0.35rem; font-size: 0.85rem;">Слоты для модулей:</div>
                    <div style="display: flex; gap: 0.35rem; margin-bottom: 0.35rem;">
                        ${Array.from({length: weapon.slots}, (_, i) => `
                            <div class="weapon-slot" data-weapon-id="${weapon.id}" data-slot-index="${i}" style="width: 26px; height: 26px; border: 2px solid ${weapon.modules[i] ? 'var(--success)' : 'var(--border)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; background: ${weapon.modules[i] ? 'rgba(125, 244, 198, 0.3)' : 'transparent'}; font-size: 0.75rem;" onclick="manageWeaponModule('${weapon.id}', ${i})">
                                ${weapon.modules[i] ? '✓' : '○'}
                            </div>
                        `).join('')}
                    </div>
                    ${weapon.modules.filter(m => m).map(module => `
                        <div style="font-size: 0.7rem; color: var(--muted); margin-left: 0.75rem;">
                            • ${module.name}: ${module.description}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
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
                        <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                            Формула урона: <strong style="color: var(--accent);">${damageFormula}</strong>
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
                        <div id="weaponDamageTotal" style="font-size: 2rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem;"></div>
                        <div id="weaponDamageFormula" style="font-size: 0.9rem; color: var(--muted);"></div>
                        <div id="weaponCriticalMessage" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(255, 0, 0, 0.2); border: 2px solid #ff0000; border-radius: 8px;">
                            <p style="color: #ff0000; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">&#x1FA78; КРИТИЧЕСКАЯ ТРАВМА! &#x1FA78;</p>
                            <p style="color: var(--text); font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
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
    // Получаем информацию об оружии
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) {
        showModal('Ошибка', 'Оружие не найдено!');
        return;
    }
    
    // Особая обработка для дробовиков
    if (weapon.isShotgun) {
        showShotgunShootingModal(damageFormula, weaponName, weaponId);
        return;
    }
    
    // Проверяем, есть ли патроны в магазине
    if (!weapon.currentAmmo || weapon.currentAmmo <= 0 || !weapon.loadedAmmoType) {
        showModal('Магазин пуст', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Магазин пуст!</p>
                <p style="color: var(--muted); margin-bottom: 1rem;">Сначала перезарядите оружие</p>
                <button class="pill-button primary-button" onclick="closeModal(this); setTimeout(() => reloadWeapon('${weaponId}'), 100)">Перезарядить</button>
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
                        <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                            Формула урона: <strong style="color: var(--accent);">${damageFormula}</strong>
                        </p>
                    </div>
                    
                    <!-- Информация о заряженных боеприпасах -->
                    <div style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px;">
                        <p style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">Заряженные боеприпасы:</p>
                        <p style="color: var(--text); font-size: 0.9rem;">
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
                        <div id="weaponDamageTotal" style="font-size: 2rem; font-weight: 700; color: var(--accent); margin-bottom: 0.5rem;"></div>
                        <div id="weaponDamageFormula" style="font-size: 0.9rem; color: var(--muted);"></div>
                        <div id="weaponCriticalMessage" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(255, 0, 0, 0.2); border: 2px solid #ff0000; border-radius: 8px;">
                            <p style="color: #ff0000; font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">&#x1FA78; КРИТИЧЕСКАЯ ТРАВМА! &#x1FA78;</p>
                            <p style="color: var(--text); font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer" id="weaponDamageFooter">
                <button class="pill-button primary-button" id="weaponShootButton" onclick="executeRangedWeaponDamageRoll('${damageFormula}', '${weaponName}', '${weaponId}', '${weaponTypeForAmmo}')">
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
}

// Вспомогательные функции для механики стрельбы
function getWeaponTypeForAmmo(weaponName) {
    // Определяем тип оружия по названию для поиска боеприпасов
    const weaponTypeMappings = {
        'Лёгкий пистолет': 'Лёгкий пистолет',
        'Обычный пистолет': 'Обычный пистолет',
        'Крупнокалиберный пистолет': 'Крупнокалиберный пистолет',
        'Пистолет-пулемёт': 'Пистолет-пулемёт',
        'Тяжёлый пистолет-пулемёт': 'Тяжёлый пистолет-пулемёт',
        'Штурмовая винтовка': 'Штурмовая винтовка',
        'Пулемёт': 'Пулемёт',
        'Снайперская винтовка': 'Снайперская винтовка',
        'Дробовик': 'Дробовик',
        'Оружие с самонаведением': 'Оружие с самонаведением',
        'Гранатомёт': 'Гранаты',
        'Ракетомёт': 'Ракеты',
        'Активная броня (Микроракета)': 'Микроракета',
        'Активная броня (Микроракеты)': 'Микроракета',
        'Активная броня (Дробовая)': 'Пиропатрон',
        'Активная броня (Лазерная)': 'Высоковольтная мини-батарея'
    };
    
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
                <p style="color: var(--danger);">Недостаточно патронов в магазине!</p>
                <p style="color: var(--muted);">Требуется: ${ammoToConsume} | В магазине: ${weapon.currentAmmo}</p>
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
            background: var(--accent);
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>&#x1F52B; Стрельба: ${weaponName}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>${weaponName}</strong></p>
                    <p style="color: var(--success); font-size: 0.9rem; margin-bottom: 0.5rem;">
                        Боеприпасы: <strong>${ammoType}</strong>
                    </p>
                    <p style="color: var(--accent); font-size: 0.9rem; margin-bottom: 0.5rem;">
                        Режим: <strong>${fireModeText}</strong>
                    </p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Потрачено патронов: <strong>${ammoConsumed}</strong>
                    </p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Формула урона: <strong style="color: var(--accent);">${damageFormula}</strong>
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
            <p style="color: var(--accent); font-size: 1.2rem; margin-bottom: 1rem;">${weaponName}</p>
            <p style="color: var(--text); font-size: 1.1rem; margin-bottom: 0.5rem;">Урон: ${damageFormula}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''}</p>
            <p style="color: var(--success); font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem;">${total}</p>
            <p style="color: var(--muted); font-size: 0.9rem;">Кости: [${dice.join(', ')}]${modifier !== 0 ? ` + ${modifier}` : ''}</p>
        </div>
    `);
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

// Функция управления модулями оружия
function manageWeaponModule(weaponId, slotIndex) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    const currentModule = weapon.modules[slotIndex];
    
    let slotHTML = `
        <div class="modal" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Управление модулем оружия</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--muted); margin-bottom: 1rem;">
                    ${weapon.name} → Слот ${slotIndex + 1}
                </p>
    `;
    
    if (currentModule) {
        slotHTML += `
            <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: var(--success); margin-bottom: 0.5rem;">Установленный модуль:</h5>
                <p style="color: var(--text); font-weight: 600;">${currentModule.name}</p>
                <p style="color: var(--muted); font-size: 0.9rem;">${currentModule.description}</p>
                <button class="pill-button danger-button" onclick="removeWeaponModule('${weaponId}', ${slotIndex}); closeModal(this);" style="margin-top: 0.5rem;">Снять модуль</button>
            </div>
        `;
    } else {
        slotHTML += `
            <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                <h5 style="color: var(--accent); margin-bottom: 0.5rem;">Свободный слот</h5>
                <p style="color: var(--muted);">Выберите модуль для установки:</p>
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
}

function loadAvailableWeaponModules(weaponId, slotIndex) {
    const container = document.getElementById('availableWeaponModules');
    if (!container) return;
    
    // Ищем модули в снаряжении
    const availableModules = state.gear.filter(item => item.type === 'weaponModule');
    
    if (availableModules.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Нет доступных модулей в снаряжении</p>';
        return;
    }
    
    container.innerHTML = availableModules.map((module, index) => `
        <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem;">
            <div style="color: var(--text); font-weight: 600;">${module.name}</div>
            <div style="color: var(--muted); font-size: 0.8rem;">${module.description}</div>
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
    showModal('Модуль установлен', `&#x2705; ${module.name} установлен в оружие!`);
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3>🔧 Магазин модулей оружия</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleWeaponModulesFreeMode()" id="weaponModulesFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 2rem;">
                    <!-- Модули для оружия ближнего боя -->
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 1rem;">⚔️ Для оружия ближнего боя</h4>
                        <div style="display: grid; gap: 1rem;">
                            ${WEAPON_MODULES.melee.map((module) => `
                                <div class="property-item">
                                    <div class="property-header">
                                        <div class="property-name">${module.name}</div>
                                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                                            <span style="color: var(--muted); font-size: 0.9rem;">Цена: ${module.price} уе | Нагрузка: ${module.load}</span>
                                            <button class="pill-button primary-button weapon-module-buy-button" onclick="buyWeaponModule('melee', '${module.name}', ${module.price}, ${module.load}, '${module.compatible}', '${module.description.replace(/'/g, "\\'")}')" data-module-type="melee" data-module-name="${module.name}" data-price="${module.price}" data-load="${module.load}" data-compatible="${module.compatible}" data-description="${module.description.replace(/'/g, "\\'")}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                        </div>
                                    </div>
                                    <div class="property-description">
                                        <div style="font-family: monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">
                                            Для чего подходит: ${module.compatible}
                                        </div>
                                        <div style="font-size: 0.9rem;">
                                            ${module.description}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Модули для оружия дальнего боя -->
                    <div>
                        <h4 style="color: var(--accent); margin-bottom: 1rem;">🔫 Для оружия дальнего боя</h4>
                        <div style="display: grid; gap: 1rem;">
                            ${WEAPON_MODULES.ranged.map((module) => `
                                <div class="property-item">
                                    <div class="property-header">
                                        <div class="property-name">${module.name}${module.slotsRequired ? ` (ТРЕБУЕТ ${module.slotsRequired} СЛОТА)` : ''}</div>
                                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                                            <span style="color: var(--muted); font-size: 0.9rem;">Цена: ${module.price} уе | Нагрузка: ${module.load}</span>
                                            <button class="pill-button primary-button weapon-module-buy-button" onclick="buyWeaponModule('ranged', '${module.name}', ${module.price}, ${module.load}, '${module.compatible}', '${module.description.replace(/'/g, "\\'")}', ${module.slotsRequired || 1})" data-module-type="ranged" data-module-name="${module.name}" data-price="${module.price}" data-load="${module.load}" data-compatible="${module.compatible}" data-description="${module.description.replace(/'/g, "\\'")}" data-slots-required="${module.slotsRequired || 1}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                        </div>
                                    </div>
                                    <div class="property-description">
                                        <div style="font-family: monospace; font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem;">
                                            Для чего подходит: ${module.compatible}
                                        </div>
                                        <div style="font-size: 0.9rem;">
                                            ${module.description}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
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
}

// Функции покупки модулей оружия
function buyWeaponModule(category, name, price, load, compatible, description, slotsRequired = 1) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
        }
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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


function renderGear() {
    const container = document.getElementById('gearContainer');
    if (!container) return;
    
    if (state.gear.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Снаряжение не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.gear.map((item, index) => {
        const gearId = `gear_${item.id}`;
        const displayName = item.isShield && item.currentHp <= 0 ? 'Щит Сломан' : item.name;
        
        return `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 8rem;">
                <div style="flex: 1;">
                    <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none;" onclick="toggleGearDescription('${gearId}')">
                        ${displayName}
                    </div>
                    <div id="${gearId}_description" style="display: block;">
                        <div style="color: var(--text); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                            ${item.description}
                        </div>
                        ${item.isShield ? `
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
                                <span style="color: var(--accent); font-size: 0.75rem;">ПЗ:</span>
                                <button onclick="decreaseShieldHP(${index})" style="background: transparent; border: 1px solid var(--accent); color: var(--accent); cursor: pointer; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.7rem;">−</button>
                                <span style="color: var(--text); font-size: 0.75rem; min-width: 20px; text-align: center;">${item.currentHp}</span>
                                <span style="color: var(--muted); font-size: 0.7rem;">/${item.hp}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${item.type === 'implant' ? `
                        <div style="margin-top: 0.5rem;">
                            <button class="pill-button success-button" onclick="installImplantFromGear(${index})" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">Установить</button>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Блок Нагрузка и кнопки в правом верхнем углу -->
            <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                <div style="background: #001122; border-radius: 6px; padding: 0.3rem 0.6rem; font-size: 0.85rem; white-space: nowrap; font-weight: 500; text-align: center;">
                    <span style="color: #cccccc;">Нагрузка:</span> <span style="color: white;">${item.load}</span>
                </div>
                <button onclick="removeGear(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Удалить">
                    <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" alt="Удалить" style="width: 20px; height: 20px; display: block;">
                </button>
                ${item.type === 'weapon' ? `
                    <button onclick="takeWeaponFromGear(${index})" style="background: transparent; border: none; cursor: pointer; padding: 0;" title="Взять в руки">
                        <img src="https://static.tildacdn.com/tild3133-3737-4835-a636-353135666661/pistol_1.png" alt="Взять в руки" style="width: 20px; height: 20px; display: block;">
                    </button>
                ` : ''}
            </div>
        </div>
        `;
    }).join('');
}

function toggleGearDescription(gearId) {
    const descriptionElement = document.getElementById(`${gearId}_description`);
    if (descriptionElement) {
        const isVisible = descriptionElement.style.display !== 'none';
        descriptionElement.style.display = isVisible ? 'none' : 'block';
    }
}

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

function installImplantFromGear(gearIndex) {
    const gear = state.gear[gearIndex];
    if (!gear || !gear.implantData) return;
    
    const implantData = gear.implantData;
    const lossRoll = rollDiceForAwarenessLoss(implantData.awarenessLoss);
    
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
    
    // Удаляем из снаряжения
    state.gear.splice(gearIndex, 1);
    
    // Обновляем отображение
    renderGear();
    scheduleSave();
    
    showModal('Имплант установлен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${implantData.name} успешно установлен!</p>
            <p style="color: var(--danger); margin-bottom: 1rem;">Потеря осознанности: ${lossRoll}</p>
            <p style="color: var(--muted);">Текущая осознанность: ${typeof state.awareness === 'object' ? state.awareness.current : state.awareness}</p>
        </div>
    `);
}

function removeGear(index) {
    showConfirmModal('Подтверждение', 'Удалить предмет из снаряжения?', () => {
        const item = state.gear[index];
        if (item) {
            // Возвращаем нагрузку
            state.load.current += item.load || 0;
            // Удаляем предмет
            state.gear.splice(index, 1);
            // Обновляем UI и сохраняем
            renderGear();
            updateLoadDisplay();
            scheduleSave();
        }
    });
}

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
        description = `Урон: ${weapon.damage} | Можно скрыть: ${weapon.concealable} | Штраф к СКА: ${weapon.stealthPenalty}`;
    } else {
        description = `Урон основной: ${weapon.primaryDamage} | Урон альтернативный: ${weapon.altDamage} | Можно скрыть: ${weapon.concealable} | # рук: ${weapon.hands} | СКА: ${weapon.stealth} | Патронов в магазине: ${weapon.magazine}`;
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem; font-size: 0.8rem;">Боеприпасы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.ammo.map((ammo, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 6px; padding: 0.5rem 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="color: var(--accent); font-weight: 600; font-size: 0.85rem;">${ammo.type}</div>
                <div style="color: var(--muted); font-size: 0.7rem; font-family: monospace; margin-top: 0.1rem;">${ammo.weaponType}</div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                    <button onclick="changeAmmoQuantity(${index}, -1)" style="font-size: 0.75rem; padding: 0.2rem 0.4rem; min-width: 24px; background: transparent; border: none; color: var(--text); cursor: pointer;">−</button>
                    <span style="color: var(--accent); font-weight: 600; min-width: 35px; text-align: center; font-size: 0.85rem;">${ammo.quantity}</span>
                </div>
                <button class="pill-button danger-button" onclick="removeAmmo(${index})" style="font-size: 0.7rem; padding: 0.25rem 0.5rem;">Удалить</button>
            </div>
        </div>
    `).join('');
}

function showAmmoShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let shopHTML = `
        <div class="modal" style="max-width: 900px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3334-6338-4439-a262-316631336461/bullets.png" alt="🔫" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин боеприпасов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleAmmoFreeMode()" id="ammoFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
                <div style="margin-bottom: 1rem; padding: 1rem; background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px;">
                    <p style="color: var(--success); font-weight: 600; margin-bottom: 0.5rem;">ℹ️ Информация о боеприпасах:</p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 0.25rem;">• 1 пачка патронов = 10 патронов</p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 0.25rem;">• Гранаты и ракеты продаются по 1 штуке</p>
                    <p style="color: var(--muted); font-size: 0.9rem;">• Все боеприпасы имеют нагрузку = 1</p>
                </div>
                <div style="display: grid; gap: 2rem;" id="ammoShopContent">
    `;
    
    // Проходим по каждому типу боеприпасов
    for (const ammoType of AMMO_DATA.types) {
        shopHTML += `
            <div>
                <h4 style="color: var(--accent); margin-bottom: 1rem;">${ammoType}</h4>
                <div style="display: grid; gap: 0.75rem;">
        `;
        
        // Проходим по каждому типу оружия
        for (const [weaponTypeFull, weaponTypeShort] of Object.entries(AMMO_DATA.weaponTypes)) {
            const price = AMMO_DATA.prices[ammoType][weaponTypeShort];
            
            if (price !== null) {
                shopHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                        <div>
                            <span style="color: var(--text); font-weight: 600;">${weaponTypeFull}</span>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="ammo-price" style="color: var(--accent); font-size: 0.9rem;" data-original-price="${price}">${price} уе</span>
                            <button class="pill-button primary-button" onclick="showAmmoQuantityModal('${ammoType}', '${weaponTypeFull}', ${price})" data-ammo-type="${ammoType}" data-weapon-type="${weaponTypeFull}" data-price="${price}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                        </div>
                    </div>
                `;
            }
        }
        
        shopHTML += `
                </div>
            </div>
        `;
    }
    
    // Добавляем раздел "Активная защита" в самый низ
    shopHTML += `
            <div>
                <h4 style="color: var(--accent); margin-bottom: 1rem;">Активная защита</h4>
                <div style="display: grid; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                        <div>
                            <span style="color: var(--text); font-weight: 600;">Пиропатрон</span>
                            <div style="color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem;">Для дробовой Активной защиты</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="ammo-price" style="color: var(--accent); font-size: 0.9rem;" data-original-price="50">50 уе</span>
                            <button class="pill-button primary-button" onclick="showAmmoQuantityModal('Активная защита', 'Пиропатрон', 50)" data-ammo-type="Активная защита" data-weapon-type="Активная защита (Пиропатрон)" data-price="50" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                        <div>
                            <span style="color: var(--text); font-weight: 600;">Высоковольтная мини-батарея</span>
                            <div style="color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem;">Для лазерной Активной защиты</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="ammo-price" style="color: var(--accent); font-size: 0.9rem;" data-original-price="250">250 уе</span>
                            <button class="pill-button primary-button" onclick="showAmmoQuantityModal('Активная защита', 'Высоковольтная мини-батарея', 250)" data-ammo-type="Активная защита" data-weapon-type="Высоковольтная мини-батарея" data-price="250" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: 6px;">
                        <div>
                            <span style="color: var(--text); font-weight: 600;">Микроракета</span>
                            <div style="color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem;">Для Активной защита с Микроракетами</div>
                        </div>
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="ammo-price" style="color: var(--accent); font-size: 0.9rem;" data-original-price="500">500 уе</span>
                            <button class="pill-button primary-button" onclick="showAmmoQuantityModal('Активная защита', 'Микроракета', 500)" data-ammo-type="Активная защита" data-weapon-type="Микроракета" data-price="500" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                        </div>
                    </div>
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
            modalOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Для: <strong style="color: var(--accent);">${weaponType}</strong>
                    </p>
                    <p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">
                        Цена за ${isSingleUnit ? '1 штуку' : '1 пачку'}: <strong style="color: var(--success);">${price} уе</strong>
                    </p>
                </div>
                
                <div class="input-group">
                    <label class="input-label">Количество ${contentText}</label>
                    <input type="number" class="input-field" id="ammoQuantity" value="1" min="1" max="99" onchange="updateAmmoTotal(${price})">
                </div>
                
                <div style="margin-top: 1rem; padding: 0.75rem; background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; text-align: center;">
                    <div style="color: var(--accent); font-weight: 600;">Итого: <span id="ammoTotalPrice">${price}</span> уе</div>
                    ${!isSingleUnit ? '<div style="color: var(--muted); font-size: 0.8rem; margin-top: 0.25rem;">Патронов: <span id="ammoTotalBullets">10</span> шт.</div>' : ''}
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
    
    // Фокусируемся на поле количества
    setTimeout(() => {
        const input = document.getElementById('ammoQuantity');
        if (input) input.focus();
    }, 100);
    
    // Обработка клавиши Enter для покупки
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            buyAmmoWithQuantity(ammoType, weaponType, price);
        } else if (e.key === 'Escape') {
            closeModal(modal.querySelector('.icon-button'));
        }
    });
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

function buyAmmoWithQuantity(ammoType, weaponType, pricePerUnit) {
    const quantity = parseInt(document.getElementById('ammoQuantity').value) || 1;
    const totalPrice = quantity * pricePerUnit;
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < totalPrice) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
    // Ищем по типу и weaponType для всех боеприпасов
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
            price: pricePerUnit
        };
        state.ammo.push(newAmmo);
    }
    
    renderAmmo();
    scheduleSave();
    
    const quantityText = isSingleUnit 
        ? `${quantity} шт.` 
        : `${addQuantity} патронов (${quantity} пачек)`;
    
    // Закрываем окно покупки (самый верхний модал с заголовком "🛒 Покупка боеприпасов")
    const allModals = document.querySelectorAll('.modal-overlay');
    for (const modal of allModals) {
        const modalTitle = modal.querySelector('h3');
        if (modalTitle && modalTitle.textContent.includes('🛒 Покупка боеприпасов')) {
            modal.remove();
            break;
        }
    }
    
    showModal('Боеприпасы куплены', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; Боеприпасы куплены!</p>
            <p style="color: var(--text); margin-bottom: 0.5rem;"><strong>${ammoName}</strong></p>
            <p style="color: var(--muted); margin-bottom: 1rem;">Для: ${weaponType}</p>
            <p style="color: var(--accent); margin-bottom: 1rem;">Получено: ${quantityText}</p>
            <p style="color: var(--muted);">Потрачено: ${totalPrice} уе</p>
        </div>
    `);
}

function buyAmmo(ammoType, weaponType, price) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem; background: var(--danger); color: white; border-radius: 8px;">
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
            price: price
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
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${ammoType} (${weaponType}) куплены!</p>
            <p style="color: var(--muted); font-size: 0.9rem;">Куплено: ${quantityText}</p>
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
    showConfirmModal('Подтверждение', 'Удалить этот тип боеприпасов?', () => {
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
    });
}

// Функция перезарядки оружия
function reloadWeapon(weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
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
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">У вас нет подходящих боеприпасов!</p>
                <p style="color: var(--muted); margin-bottom: 1rem;">Купите боеприпасы для ${weaponTypeForAmmo}</p>
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
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--text); margin-bottom: 0.5rem;"><strong>Текущее состояние:</strong></p>
                    <p style="color: var(--muted); font-size: 0.9rem;">
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
                    <p style="color: var(--text); font-size: 0.8rem;" id="reloadWarningText">
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
            closeModal(modal.querySelector('.icon-button'));
        }
    });
}

function executeReload(weaponId) {
    const weapon = state.weapons.find(w => w.id === weaponId);
    if (!weapon) return;
    
    const selectedAmmoIndex = parseInt(document.getElementById('reloadAmmoType').value);
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
        renderWeapons();
        scheduleSave();
        
        closeModal(document.querySelector('.modal-overlay .icon-button'));
        
        const reloadMessage = ammoToTake === ammoNeeded ? 
            'Магазин полностью заряжен!' : 
            `Заряжено ${ammoToTake} из ${ammoNeeded} патронов (не хватило боеприпасов)`;
        
        showModal('Перезарядка завершена', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${weapon.name}</p>
                <p style="color: var(--text); margin-bottom: 0.5rem;">${reloadMessage}</p>
                <p style="color: var(--muted); font-size: 0.9rem;">Тип: ${selectedAmmo.type} | Патронов: ${weapon.currentAmmo}/${weapon.maxAmmo}</p>
            </div>
        `);
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
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">У вас нет патронов для дробовика!</p>
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
                <h3>&#x1F504; Перезарядка дробовика: ${weapon.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1rem;">
                    <p style="color: var(--text); margin-bottom: 0.5rem;"><strong>Текущее состояние:</strong></p>
                    <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
                        <p style="color: var(--muted); font-size: 0.9rem;">
                            Слот 1: ${weapon.shotgunAmmo1.count}/3 ${weapon.shotgunAmmo1.type ? `(${weapon.shotgunAmmo1.type})` : '(пусто)'}
                        </p>
                        <p style="color: var(--muted); font-size: 0.9rem;">
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
                <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${weapon.name}</p>
                <p style="color: var(--text); margin-bottom: 0.5rem;">${reloadMessage}</p>
                <p style="color: var(--muted); font-size: 0.9rem;">Тип: ${selectedAmmo.type} | Патронов: ${slotData.count}/3</p>
            </div>
        `);
    }
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
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Дробовик не заряжен!</p>
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
                                <p style="color: var(--text); font-size: 0.9rem;">
                                    Слот 1: <strong>${weapon.shotgunAmmo1.type}</strong> (${weapon.shotgunAmmo1.count}/3)
                                </p>
                            ` : ''}
                            ${weapon.shotgunAmmo2.count > 0 ? `
                                <p style="color: var(--text); font-size: 0.9rem;">
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
                            <p style="color: var(--text); font-size: 0.9rem;">Ты нанёс Критическую травму! Сообщи Мастеру!</p>
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

// Функции для работы с профессиональными навыками
function addProfessionalSkill() {
    showPromptModal('Добавить профессиональный навык', 'Введите название профессионального навыка:', '', (name) => {
        if (!name) return;
        
        showPromptModal('Добавить профессиональный навык', 'Введите описание навыка:', '', (description) => {
            if (!description) return;
            
            showPromptModal('Добавить профессиональный навык', 'Введите уровень навыка (0-10):', '1', (level) => {
                const skillLevel = Math.max(0, Math.min(10, parseInt(level) || 0));
                
                // Проверяем, не добавлен ли уже этот навык
                if (state.professionalSkills.find(s => s.name === name)) {
                    showModal('Ошибка', 'Этот профессиональный навык уже добавлен!');
                    return;
                }
                
                const newSkill = {
                    id: generateId('proSkill'),
                    name: name,
                    description: description,
                    level: skillLevel
                };
                
                state.professionalSkills.push(newSkill);
                renderProfessionalSkills();
                scheduleSave();
            });
        });
    });
}

function updateProfessionalSkillLevel(skillId, newLevel) {
    const skill = state.professionalSkills.find(s => s.id === skillId);
    if (skill) {
        skill.level = Math.max(0, Math.min(10, parseInt(newLevel)));
        renderProfessionalSkills();
        scheduleSave();
    }
}

function removeProfessionalSkill(skillId) {
    state.professionalSkills = state.professionalSkills.filter(s => s.id !== skillId);
    renderProfessionalSkills();
    scheduleSave();
}

function renderProfessionalSkills() {
    const container = document.getElementById('professionalSkillsContainer');
    if (!container) return;
    
    if (state.professionalSkills.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Профессиональные навыки не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.professionalSkills.map(skill => `
        <div class="card" style="margin-bottom: 1rem;">
            <div class="card-header">
                <div class="card-title">${skill.name}</div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <input type="number" class="stat-input" value="${skill.level}" min="0" max="10" onchange="updateProfessionalSkillLevel('${skill.id}', this.value)" style="width: 50px;">
                    <button class="pill-button danger-button" onclick="removeProfessionalSkill('${skill.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;"><img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" style="width: 16px; height: 16px;"></button>
                </div>
            </div>
            <div class="card-content">
                ${skill.description}
            </div>
        </div>
    `).join('');
}

function showAddProfessionalSkillModal() {
    const modal = createModal('Добавить профессиональный навык', `
        <div class="modal-content">
            <div class="input-group">
                <label class="input-label">Название навыка</label>
                <input type="text" class="input-field" id="proSkillName" placeholder="Например: Киберхирургия">
            </div>
            <div class="input-group">
                <label class="input-label">Описание</label>
                <textarea class="input-field" id="proSkillDescription" rows="3" placeholder="Подробное описание навыка..."></textarea>
            </div>
            <div class="input-group">
                <label class="input-label">Уровень (0-10)</label>
                <input type="number" class="input-field" id="proSkillLevel" value="0" min="0" max="10">
            </div>
            <div class="modal-actions">
                <button class="pill-button" onclick="closeModal(this)">Отмена</button>
                <button class="pill-button primary-button" onclick="addProfessionalSkillFromModal(); closeModal(this);">Добавить</button>
            </div>
        </div>
    `);
}

function addProfessionalSkillFromModal() {
    const name = document.getElementById('proSkillName').value;
    const description = document.getElementById('proSkillDescription').value;
    const level = parseInt(document.getElementById('proSkillLevel').value) || 0;
    
    if (!name || !description) {
        showModal('Ошибка', 'Заполните все поля!');
        return;
    }
    
    // Проверяем, не добавлен ли уже этот навык
    if (state.professionalSkills.find(s => s.name === name)) {
        showModal('Ошибка', 'Этот профессиональный навык уже добавлен!');
        return;
    }
    
    const newSkill = {
        id: generateId('proSkill'),
        name: name,
        description: description,
        level: Math.max(0, Math.min(10, level))
    };
    
    state.professionalSkills.push(newSkill);
    renderProfessionalSkills();
    scheduleSave();
}

// Функции для работы с критическими травмами
function addCriticalInjury() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
                <p style="color: var(--danger);">Введите описание травмы!</p>
            </div>
        `);
        return;
    }
    
    const newInjury = {
        id: generateId('injury'),
        description: description,
        date: new Date().toLocaleDateString('ru-RU')
    };
    
    state.criticalInjuries.push(newInjury);
    renderCriticalInjuries();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function removeCriticalInjury(injuryId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Подтверждение</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text); font-size: 1rem;">Удалить эту критическую травму?</p>
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
}

function confirmRemoveCriticalInjury(injuryId) {
    state.criticalInjuries = state.criticalInjuries.filter(injury => injury.id !== injuryId);
    renderCriticalInjuries();
    scheduleSave();
    closeModal(document.querySelector('.modal-overlay .icon-button'));
}

function renderCriticalInjuries() {
    const container = document.getElementById('injuriesList');
    if (!container) return;
    
    if (state.criticalInjuries.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); font-size: 0.9rem; margin-top: 0.5rem;">Травмы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.criticalInjuries.map(injury => `
        <div class="injury-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: rgba(0,0,0,0.2); border: 1px solid rgba(182, 103, 255, 0.2); border-radius: 6px; margin-bottom: 0.5rem;">
            <div style="flex: 1;">
                <div style="color: var(--text); font-size: 0.9rem;">${injury.description}</div>
                <div style="color: var(--muted); font-size: 0.8rem;">${injury.date}</div>
            </div>
            <button class="pill-button danger-button" onclick="removeCriticalInjury('${injury.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;"><img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" style="width: 16px; height: 16px;"></button>
        </div>
    `).join('');
}

// Функции для работы с препаратами
function showDrugsShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let shopHTML = `
        <div class="modal" style="max-width: 900px; max-height: 90vh; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3532-3565-4033-a136-653464353038/drugs.png" alt="💊" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин препаратов</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleDrugsFreeMode()" id="drugsFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="overflow-y: auto; flex: 1;">
    `;
    
    // Проходим по всем категориям препаратов
    for (const [category, drugs] of Object.entries(DRUGS_LIBRARY)) {
        shopHTML += `
            <div class="category-section" style="margin-bottom: 2rem;">
                <div class="category-title" style="color: var(--accent); font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">${category}</div>
                <div style="display: grid; gap: 1rem;">
                    ${drugs.map((drug) => `
                        <div class="property-item">
                            <div class="property-header">
                                <div class="property-name">${drug.name}</div>
                                <div style="display: flex; gap: 0.5rem; align-items: center;">
                                    <span class="drug-price" style="color: var(--muted); font-size: 0.9rem;" data-original-price="${drug.price}">Цена: ${drug.price} уе</span>
                                    <button class="pill-button primary-button drug-buy-button" onclick="buyDrug('${drug.name}', ${drug.price}, '${drug.description.replace(/'/g, "\\'")}', '${drug.effect ? drug.effect.replace(/'/g, "\\'") : ''}', '${drug.category}', ${drug.difficulty || 0}, '${drug.secondaryEffect ? drug.secondaryEffect.replace(/'/g, "\\'") : ''}')" data-drug-name="${drug.name}" data-price="${drug.price}" data-description="${drug.description.replace(/'/g, "\\'")}" data-effect="${drug.effect ? drug.effect.replace(/'/g, "\\'") : ''}" data-category="${drug.category}" data-difficulty="${drug.difficulty || 0}" data-secondary-effect="${drug.secondaryEffect ? drug.secondaryEffect.replace(/'/g, "\\'") : ''}" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Купить</button>
                                </div>
                            </div>
                            <div class="property-description">
                                <div style="font-size: 0.9rem; margin-bottom: 0.5rem;">
                                    <strong>Описание:</strong> ${drug.description}
                                </div>
                                <div style="font-size: 0.9rem; color: var(--success); margin-bottom: 0.5rem;">
                                    <strong>Эффект:</strong> ${drug.effect || drug.description}
                                </div>
                                ${drug.difficulty ? `<div style="font-size: 0.9rem; color: var(--accent); margin-bottom: 0.5rem;"><strong>СЛ:</strong> ${drug.difficulty}</div>` : ''}
                                ${drug.secondaryEffect ? `<div style="font-size: 0.9rem; color: var(--danger);"><strong>Вторичный эффект:</strong> ${drug.secondaryEffect}</div>` : ''}
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
}

function buyDrug(name, price, description, effect, category, difficulty, secondaryEffect) {
    const currentMoney = parseInt(state.money) || 0;
    
    if (currentMoney < price) {
        showModal('Недостаточно денег', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
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
        purchaseDate: new Date().toLocaleDateString('ru-RU')
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
    
    showModal('Препарат куплен', `&#x2705; ${name} добавлен в коллекцию препаратов!`);
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Подтверждение</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text); font-size: 1rem;">Принять этот препарат (удалить из списка)?</p>
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
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Препараты не добавлены</p>';
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
                <h4 style="color: var(--accent); font-size: 0.9rem; font-weight: 600; margin-bottom: 0.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem;">${categoryNames[category]}</h4>
        `;
        
        for (const [drugName, drugList] of Object.entries(drugGroups)) {
            const firstDrug = drugList[0]; // Берем первый экземпляр для отображения
            const count = drugList.length;
            const drugId = `drug_${category}_${drugName.replace(/\s+/g, '_')}`;
            
            html += `
                <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
                        <div style="flex: 1;">
                            <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; cursor: pointer; user-select: none;" onclick="toggleDrugDescription('${drugId}')">
                                ${firstDrug.name} <span style="color: var(--muted); font-size: 0.8rem;">${count > 1 ? `(${count} шт.)` : ''}</span>
                            </div>
                            <div id="${drugId}_description" style="display: block;">
                                <div style="color: var(--text); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                                    <strong>Описание:</strong> ${firstDrug.description}
                                </div>
                                <div style="color: var(--success); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                                    <strong>Эффект:</strong> ${firstDrug.effect}
                                </div>
                                ${firstDrug.difficulty > 0 ? `<div style="color: var(--accent); font-size: 0.75rem; margin-bottom: 0.25rem;"><strong>СЛ:</strong> ${firstDrug.difficulty}</div>` : ''}
                                ${firstDrug.secondaryEffect ? `<div style="color: var(--danger); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;"><strong>Вторичный эффект:</strong> ${firstDrug.secondaryEffect}</div>` : ''}
                                <div style="color: var(--muted); font-size: 0.75rem; margin-top: 0.25rem;">
                                    Куплено: ${firstDrug.purchaseDate} | Цена: ${firstDrug.price} уе
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            ${count > 1 ? `<span style="color: var(--muted); font-size: 0.8rem; font-weight: 600;">×${count} шт.</span>` : ''}
                            <button onclick="removeDrug('${firstDrug.id}')" style="font-size: 0.9rem; background: transparent; border: none; color: var(--text); cursor: pointer;" title="Принять препарат">💊</button>
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

// Функции для работы с транспортом
function renderVehicles() {
    const container = document.getElementById('vehiclesContainer');
    if (!container) return;
    
    if (state.property.vehicles.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Транспорт не добавлен</p>';
        return;
    }
    
    container.innerHTML = state.property.vehicles.map(vehicle => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; position: relative;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 2rem;">
                <div style="flex: 1;">
                    <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">
                        ${vehicle.name}
                    </div>
                    <div style="color: var(--text); font-size: 0.75rem; margin-bottom: 0.25rem; line-height: 1.3;">
                        <strong>Описание:</strong> ${vehicle.description}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.7rem; color: var(--muted);">
                        <div><strong>ПЗ:</strong> ${vehicle.currentHp}/${vehicle.hp}</div>
                        <div><strong>Места:</strong> ${vehicle.seats}</div>
                        <div><strong>Скорость:</strong> ${vehicle.mechanicalSpeed}</div>
                        <div><strong>Макс. скорость:</strong> ${vehicle.narrativeSpeed}</div>
                    </div>
                    ${vehicle.modules.length > 0 ? `
                        <div style="margin-top: 0.5rem;">
                            <div style="color: var(--accent); font-size: 0.7rem; font-weight: 600; margin-bottom: 0.25rem;">Установленные модули:</div>
                            <div style="font-size: 0.7rem; color: var(--muted);">
                                ${vehicle.modules.map(module => module.name).join(', ')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <button onclick="sellVehicle('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: var(--danger); cursor: pointer;" title="Продать транспорт"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"></button>
                    <button onclick="manageVehicleModules('${vehicle.id}')" style="font-size: 0.8rem; background: transparent; border: none; color: var(--accent); cursor: pointer;" title="Управление модулями">&#x2699;&#xFE0F;</button>
                </div>
            </div>
        </div>
    `).join('');
}

function showVehicleShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    let shopHTML = `
        <div class="modal" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3130-6637-4132-a334-663633373435/car.png" alt="🚗" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин транспорта</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button onclick="toggleVehiclesFreeMode()" id="vehiclesFreeModeButton" style="background: transparent; border: 1px solid var(--border); color: var(--text); padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">Бесплатно</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body">
    `;
    
    // Проходим по всем категориям транспорта
    for (const [category, vehicles] of Object.entries(VEHICLES_LIBRARY)) {
        shopHTML += `
            <div style="margin-bottom: 2rem;">
                <h4 style="color: var(--accent); font-size: 1rem; font-weight: 600; margin-bottom: 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem;">${category}</h4>
                <div style="display: grid; gap: 1rem;">
                    ${vehicles.map((vehicle) => `
                        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                                <div style="flex: 1;">
                                    <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.5rem;">${vehicle.name}</div>
                                    <div style="color: var(--muted); font-size: 0.85rem; margin-bottom: 0.75rem;">${vehicle.description}</div>
                                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.8rem; color: var(--text); margin-bottom: 0.75rem;">
                                        <div><strong>ПЗ:</strong> ${vehicle.hp}</div>
                                        <div><strong>Места:</strong> ${vehicle.seats}</div>
                                        <div><strong>Скорость:</strong> ${vehicle.mechanicalSpeed}</div>
                                        <div><strong>Макс. скорость:</strong> ${vehicle.narrativeSpeed}</div>
                                    </div>
                                    <div class="vehicle-price-display" style="color: var(--success); font-weight: 600; font-size: 1rem;" data-original-price="${vehicle.price}">Цена: ${vehicle.price} уе</div>
                                </div>
                                <div style="margin-left: 1rem;">
                                    <button class="pill-button primary-button vehicle-buy-button" onclick="buyVehicle('${vehicle.name.replace(/'/g, "\\'")}', '${vehicle.description.replace(/'/g, "\\'")}', ${vehicle.hp}, ${vehicle.seats}, ${vehicle.mechanicalSpeed}, '${vehicle.narrativeSpeed}', ${vehicle.price}, '${vehicle.category}')" data-vehicle-name="${vehicle.name.replace(/'/g, "\\'")}" data-description="${vehicle.description.replace(/'/g, "\\'")}" data-hp="${vehicle.hp}" data-seats="${vehicle.seats}" data-mechanical-speed="${vehicle.mechanicalSpeed}" data-narrative-speed="${vehicle.narrativeSpeed}" data-price="${vehicle.price}" data-category="${vehicle.category}" style="font-size: 0.85rem; padding: 0.5rem 1rem;">Купить</button>
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
}

function buyVehicle(name, description, hp, seats, mechanicalSpeed, narrativeSpeed, price, category) {
    const currentMoney = parseInt(state.money) || 0;
    
    // Проверяем навык "Транспорт" для скидки
    const transportSkill = state.skills.find(s => s.name === 'Транспорт' || s.customName?.includes('Транспорт'));
    const skillLevel = transportSkill ? transportSkill.level : 0;
    const discount = skillLevel >= 4 ? 0.1 : 0; // 10% скидка при навыке 4+
    const finalPrice = Math.floor(price * (1 - discount));
    
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
        price: price,
        category: category,
        modules: [],
        isDefault: false
    };
    
    state.property.vehicles.push(newVehicle);
    renderVehicles();
    scheduleSave();
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: finalPrice,
        category: 'Транспорт'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    const discountText = discount > 0 ? `<p style="color: var(--success); margin-bottom: 0.5rem;">Скидка ${discount * 100}% благодаря навыку "Транспорт"!</p>` : '';
    
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
            btn.setAttribute('onclick', `buyVehicle('${name}', '${description}', ${hp}, ${seats}, ${mechanicalSpeed}, '${narrativeSpeed}', ${price}, '${category}')`);
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
            btn.setAttribute('onclick', `buyVehicle('${name}', '${description}', ${hp}, ${seats}, ${mechanicalSpeed}, '${narrativeSpeed}', 0, '${category}')`);
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
    
    // Для стартового микромобиля цена продажи фиксированная 7500уе
    const sellPrice = vehicle.isDefault ? 7500 : Math.floor(vehicle.price * 0.5);
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
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
}

function confirmSellVehicle(vehicleId, sellPrice) {
    state.property.vehicles = state.property.vehicles.filter(v => v.id !== vehicleId);
    state.money = parseInt(state.money) + sellPrice;
    updateMoneyDisplay();
    renderVehicles();
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

function showVehicleModulesShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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
                                    <div class="vehicle-module-price-display" style="color: var(--success); font-weight: 600; font-size: 1rem;" data-original-price="${module.price}">Цена: ${module.price} уе</div>
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
}

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

function buyVehicleModule(name, description, price, category, requirementsStr) {
    const currentMoney = parseInt(state.money) || 0;
    const requirements = JSON.parse(requirementsStr);
    
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
    
    // Списываем деньги
    state.money = currentMoney - price;
    updateMoneyDisplay();
    
    // Добавляем модуль в снаряжение
    const newGear = {
        id: generateId('gear'),
        name: name,
        description: description,
        price: price,
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
    
    // Добавляем в лог
    addToRollLog('purchase', {
        item: name,
        price: price,
        category: 'Модуль транспорта'
    });
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль куплен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${name} куплен!</p>
            <p style="color: var(--muted); margin-bottom: 0.5rem;">Модуль добавлен в снаряжение.</p>
            <p style="color: var(--muted);">Установите его через меню управления модулями транспорта.</p>
        </div>
    `);
}

function manageVehicleModules(vehicleId) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    // Получаем доступные модули из снаряжения
    const availableModules = state.gear.filter(item => 
        item.type === 'vehicle_module' && 
        item.moduleData.category === vehicle.category
    );
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3>&#x2699;&#xFE0F; Управление модулями: ${vehicle.name}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="color: var(--accent); font-size: 0.95rem; margin-bottom: 0.75rem;">Установленные модули:</h4>
                    ${vehicle.modules.length > 0 ? `
                        <div style="display: grid; gap: 0.75rem;">
                            ${vehicle.modules.map((module, index) => `
                                <div style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="color: var(--success); font-weight: 600; font-size: 0.9rem;">${module.name}</div>
                                        <div style="color: var(--muted); font-size: 0.75rem;">${module.description}</div>
                                    </div>
                                    <button class="pill-button danger-button" onclick="removeVehicleModule('${vehicleId}', ${index})" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Удалить</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--muted); text-align: center; padding: 1rem;">Модули не установлены</p>'}
                </div>
                
                <div>
                    <h4 style="color: var(--accent); font-size: 0.95rem; margin-bottom: 0.75rem;">Доступные модули в снаряжении:</h4>
                    ${availableModules.length > 0 ? `
                        <div style="display: grid; gap: 0.75rem;">
                            ${availableModules.map(module => `
                                <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem;">${module.name}</div>
                                        <div style="color: var(--muted); font-size: 0.75rem;">${module.description}</div>
                                        ${module.moduleData.requirements && module.moduleData.requirements.length > 0 ? `
                                            <div style="color: var(--danger); font-size: 0.7rem; margin-top: 0.25rem;">
                                                Требует: ${module.moduleData.requirements.join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <button class="pill-button primary-button" onclick="installVehicleModule('${vehicleId}', '${module.id}')" style="font-size: 0.8rem; padding: 0.3rem 0.6rem;">Установить</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--muted); text-align: center; padding: 1rem;">Нет доступных модулей для этого типа транспорта</p>'}
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

function installVehicleModule(vehicleId, moduleId) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    const moduleItem = state.gear.find(g => g.id === moduleId);
    
    if (!vehicle || !moduleItem) return;
    
    // Проверяем требования модуля сначала
    const requirements = moduleItem.moduleData.requirements || [];
    if (requirements.length > 0) {
        const hasRequiredModules = requirements.every(req => 
            vehicle.modules.some(m => m.name === req)
        );
        
        if (!hasRequiredModules) {
            showModal('Требования не выполнены', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не выполнены требования!</p>
                    <p style="color: var(--muted);">Для установки требуется: ${requirements.join(', ')}</p>
                </div>
            `);
            return;
        }
    }
    
    // Проверяем навык "Транспорт"
    const transportSkill = state.skills.find(s => s.name === 'Транспорт' || s.customName?.includes('Транспорт'));
    const skillLevel = transportSkill ? transportSkill.level : 0;
    
    if (skillLevel < 4) {
        // Нужно заплатить 500 уе за установку - показываем окно подтверждения
        const installCost = 500;
        const currentMoney = parseInt(state.money) || 0;
        
        if (currentMoney < installCost) {
            showModal('Недостаточно денег', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Недостаточно средств для установки!</p>
                    <p style="color: var(--muted);">У вас навык "Транспорт" < 4, поэтому установка стоит ${installCost} уе</p>
                    <p style="color: var(--muted);">Доступно: ${currentMoney} уе</p>
                </div>
            `);
            return;
        }
        
        // Показываем окно подтверждения оплаты
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        const existingModals = document.querySelectorAll('.modal-overlay');
        modal.style.zIndex = 1000 + (existingModals.length * 100);
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Оплата установки</h3>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
                <div class="modal-body">
                    <p style="text-align: center; color: var(--text); font-size: 1rem; margin-bottom: 1rem;">
                        Установить <strong>${moduleItem.name}</strong>?
                    </p>
                    <p style="text-align: center; color: var(--muted); font-size: 0.9rem; margin-bottom: 0.5rem;">
                        У вас навык "Транспорт" < 4
                    </p>
                    <p style="text-align: center; color: var(--danger); font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">
                        Стоимость установки: ${installCost} уе
                    </p>
                    <p style="text-align: center; color: var(--muted); font-size: 0.85rem;">
                        Доступно: ${currentMoney} уе
                    </p>
                </div>
                <div class="modal-footer">
                    <button class="pill-button primary-button" onclick="confirmInstallVehicleModule('${vehicleId}', '${moduleId}', ${installCost})">Оплатить и установить</button>
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
        
        return;
    }
    
    // Если навык >= 4, устанавливаем бесплатно
    confirmInstallVehicleModule(vehicleId, moduleId, 0);
}

function confirmInstallVehicleModule(vehicleId, moduleId, installCost) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    const moduleItem = state.gear.find(g => g.id === moduleId);
    
    if (!vehicle || !moduleItem) return;
    
    // Списываем деньги если нужно
    if (installCost > 0) {
        state.money = parseInt(state.money) - installCost;
        updateMoneyDisplay();
    }
    
    // Устанавливаем модуль
    vehicle.modules.push({
        name: moduleItem.name,
        description: moduleItem.description,
        price: moduleItem.price
    });
    
    // Удаляем модуль из снаряжения
    state.gear = state.gear.filter(g => g.id !== moduleId);
    
    renderVehicles();
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    const installText = installCost > 0 ? 
        `<p style="color: var(--muted);">Списано: ${installCost} уе за установку</p>` : 
        '<p style="color: var(--success);">Установка бесплатна благодаря навыку "Транспорт" ≥ 4</p>';
    
    showModal('Модуль установлен', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${moduleItem.name} установлен!</p>
            ${installText}
        </div>
    `);
}

function removeVehicleModule(vehicleId, moduleIndex) {
    const vehicle = state.property.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;
    
    const module = vehicle.modules[moduleIndex];
    if (!module) return;
    
    // Возвращаем модуль в снаряжение
    state.gear.push({
        id: generateId('gear'),
        name: module.name,
        description: module.description,
        price: module.price,
        load: 5,
        type: 'vehicle_module',
        moduleData: {
            category: vehicle.category,
            requirements: []
        }
    });
    
    // Удаляем модуль из транспорта
    vehicle.modules.splice(moduleIndex, 1);
    
    renderVehicles();
    renderGear();
    scheduleSave();
    
    closeModal(document.querySelector('.modal-overlay .icon-button'));
    
    showModal('Модуль удалён', `
        <div style="text-align: center; padding: 1rem;">
            <p style="color: var(--success); font-size: 1.1rem; margin-bottom: 1rem;">&#x2705; ${module.name} возвращён в снаряжение!</p>
        </div>
    `);
}

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
                "Они не знают, но сам не человек. Я не знаю как сюда попал. Нельзя, чтобы они узнали мою тайну."
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
        backstoryText += `${table.title}: ${selectedOption}\n\n`;
    }
    
    // Записываем в textarea
    const textarea = document.getElementById('backstoryText');
    if (textarea) {
        textarea.value = backstoryText.trim();
        state.backstory = backstoryText.trim();
        scheduleSave();
    }
}

// Функции для работы с аватаром
function initAvatarUpload() {
    console.log('initAvatarUpload called');
    const avatarInput = document.getElementById('avatarInput');
    const removeAvatarButton = document.getElementById('removeAvatarButton');
    
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
        console.log('Avatar input listener attached');
    }
    
    if (removeAvatarButton) {
        removeAvatarButton.addEventListener('click', handleAvatarRemove);
        console.log('Remove avatar button listener attached');
    }
    
    // Загружаем существующий аватар при инициализации
    console.log('Current state.avatar:', state.avatar ? state.avatar.substring(0, 50) + '...' : 'empty');
    loadAvatarFromState();
}

function handleAvatarUpload(event) {
    console.log('handleAvatarUpload called');
    const file = event.target.files[0];
    if (!file) {
        console.log('No file selected');
        return;
    }
    
    console.log('File selected:', file.name, 'Original size:', file.size, 'bytes');
    
    // Создаем временный Image для сжатия
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            console.log('Original image dimensions:', img.width, 'x', img.height);
            
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
            
            console.log('Compressed image dimensions:', width, 'x', height);
            console.log('Compressed size:', Math.round(compressedBase64.length * 0.75), 'bytes');
            
            // Сохраняем сжатое изображение
            state.avatar = compressedBase64;
            displayAvatar(compressedBase64);
            saveState();
            console.log('Avatar saved to state and localStorage');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleAvatarRemove() {
    console.log('handleAvatarRemove called');
    state.avatar = '';
    displayAvatar('');
    saveState();
    console.log('Avatar removed from state and localStorage');
}

function loadAvatarFromState() {
    console.log('loadAvatarFromState called, state.avatar:', state.avatar ? 'exists' : 'empty');
    if (state.avatar) {
        displayAvatar(state.avatar);
    } else {
        displayAvatar('');
    }
}

function displayAvatar(imageData) {
    console.log('displayAvatar called with:', imageData ? 'image data' : 'no data');
    const avatarDisplay = document.getElementById('avatarDisplay');
    if (!avatarDisplay) {
        console.error('avatarDisplay element not found!');
        return;
    }
    
    if (imageData) {
        avatarDisplay.innerHTML = `<img src="${imageData}" alt="Аватар персонажа" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />`;
        console.log('Avatar displayed');
    } else {
        avatarDisplay.innerHTML = '🤖';
        console.log('Default avatar icon displayed');
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
    
    if (screenWidth < 1024) {
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


// Функции для профессиональных навыков
function updateProfessionalSkill(index, name, level) {
    if (!state.professionalSkills) {
        state.professionalSkills = [];
    }
    
    if (!state.professionalSkills[index]) {
        state.professionalSkills[index] = { name: '', level: 0 };
    }
    
    state.professionalSkills[index].name = name;
    state.professionalSkills[index].level = parseInt(level) || 0;
    
    scheduleSave();
}

function loadProfessionalSkills() {
    if (!state.professionalSkills) {
        state.professionalSkills = [
            { name: '', level: 0 },
            { name: '', level: 0 },
            { name: '', level: 0 },
            { name: '', level: 0 }
        ];
    }
    
    for (let i = 0; i < 4; i++) {
        const nameInput = document.getElementById(`professionalSkillName${i}`);
        const levelInput = document.getElementById(`professionalSkillLevel${i}`);
        
        if (nameInput && levelInput && state.professionalSkills[i]) {
            nameInput.value = state.professionalSkills[i].name || '';
            levelInput.value = state.professionalSkills[i].level || 0;
        }
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
    showConfirmModal('Подтверждение', 'Удалить эту заметку навсегда?', () => {
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
    });
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
        
        updateArmorPenalty();
        scheduleSave();
    }
}

function updateArmorPenalty() {
    const penaltyText = document.getElementById('armorPenaltyText');
    if (!penaltyText) return;

    // Определяем максимальный тип брони
    const armorTypes = ['Лёгкая', 'Средняя', 'Тяжёлая', 'Титаническая'];
    const armorLevels = {
        'Лёгкая': 0,
        'Средняя': 1,
        'Тяжёлая': 2,
        'Титаническая': 3
    };

    let maxLevel = 0;
    let maxType = 'Лёгкая';
    let hasAnyArmor = false;

    // Проверяем все части тела (только с типом брони, отличным от "Лёгкая")
    for (const part of ['head', 'body', 'arms', 'legs']) {
        const type = state.armor[part].type || 'Лёгкая';
        // Проверяем только тип брони, а не ОС, так как штрафы зависят от типа
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
        penaltyText.textContent = 'Без штрафа';
        return;
    }

    // Определяем штрафы
    let penaltyText_content = '';
    switch (maxType) {
        case 'Лёгкая':
            penaltyText_content = 'Без штрафа';
            break;
        case 'Средняя':
            penaltyText_content = '-1 СКО, РЕА и ЛВК (не влияет на СКО)';
            break;
        case 'Тяжёлая':
            penaltyText_content = '-3 РЕА и ЛВК (не влияет на СКО) до минимум 1; -3 СКО, если ТЕЛО менее 8 до минимум 1';
            break;
        case 'Титаническая':
            penaltyText_content = '-6 СКО, РЕА и ЛВК (не влияет на СКО)';
            break;
    }

    penaltyText.textContent = penaltyText_content;
}

// Функция для уменьшения ОС брони
function decreaseArmorOS(part) {
    const currentOS = parseInt(state.armor[part].os) || 0;
    if (currentOS > 0) {
        state.armor[part].os = currentOS - 1;
        document.getElementById(`armor${part.charAt(0).toUpperCase() + part.slice(1)}OS`).value = state.armor[part].os;
        // Не вызываем updateArmorPenalty(), так как изменение ОС не влияет на штрафы
        scheduleSave();
    }
}

// Магазин брони
function showArmorShop() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    // Проверяем режим бесплатно
    const isFreeMode = window.armorShopFreeMode || false;
    
    // Устанавливаем фон в зависимости от режима
    if (isFreeMode) {
        modal.style.background = 'rgba(0, 100, 50, 0.85)';
    }
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 700px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3531-3730-4631-a438-353361653361/bulletproof-vest.png" alt="🛡️" style="width: 24px; height: 24px; margin-right: 0.5rem; vertical-align: middle;"> Магазин брони</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <button class="pill-button ${isFreeMode ? 'success-button' : 'muted-button'}" onclick="toggleArmorShopFreeMode()" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">${isFreeMode ? 'Бесплатно' : 'Бесплатно'}</button>
                    <button class="icon-button" onclick="closeModal(this)">×</button>
                </div>
            </div>
            <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                <div style="background: rgba(255, 193, 7, 0.1); border: 1px solid #ffc107; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <div style="color: #ffc107; font-weight: 600; margin-bottom: 0.5rem;">📝 Памятка:</div>
                    <div style="color: var(--text); font-size: 0.9rem; line-height: 1.4;">
                        Броня всегда покупается отдельно для <strong>Головы</strong> и <strong>Тела</strong>. 
                        Руки и Ноги уже входят в стоимость брони для Тела.
                    </div>
                </div>
                
                <div style="display: grid; gap: 0.75rem;">
                    <div class="armor-shop-item" onclick="buyArmor('Простые шмотки', 10, 0, 'Лёгкая')" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Простые шмотки</div>
                                <div style="color: var(--text); font-size: 0.85rem;">ОС: 0 | Обычная одежда</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '10 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyArmor('Лёгкая', 100, 10, 'Лёгкая')" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Лёгкая броня</div>
                                <div style="color: var(--text); font-size: 0.85rem;">ОС: 10 | Без штрафов</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '100 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyArmor('Средняя', 500, 15, 'Средняя')" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Средняя броня</div>
                                <div style="color: var(--text); font-size: 0.85rem;">ОС: 15 | Штраф: -1 СКО, РЕА, ЛВК</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '500 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyArmor('Тяжёлая', 2500, 18, 'Тяжёлая')" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Тяжёлая броня</div>
                                <div style="color: var(--text); font-size: 0.85rem;">ОС: 18 | Штраф: -3 РЕА, ЛВК, СКО</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '2 500 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyArmor('Титаническая', 20000, 25, 'Титаническая')" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Титаническая броня</div>
                                <div style="color: var(--text); font-size: 0.85rem;">ОС: 25 | Штраф: -6 СКО, РЕА, ЛВК</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '20 000 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyActiveArmor()" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Активная броня</div>
                                <div style="color: var(--text); font-size: 0.85rem;">Защищает от неожиданных угроз</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '500 уе'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="armor-shop-item" onclick="buyBallisticShield()" style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s ease;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="flex: 1;">
                                <div style="color: var(--accent); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">Пуленепробиваемый щит</div>
                                <div style="color: var(--text); font-size: 0.85rem;">20 ПЗ | Требует 1 руку | Снаряжение</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="color: var(--success); font-weight: 600; font-size: 1.1rem;">${isFreeMode ? 'Бесплатно' : '100 уе'}</div>
                            </div>
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
    
    // Добавляем эффекты наведения
    const items = modal.querySelectorAll('.armor-shop-item');
    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.background = 'rgba(182, 103, 255, 0.2)';
            item.style.transform = 'translateY(-2px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.background = 'rgba(182, 103, 255, 0.1)';
            item.style.transform = 'translateY(0)';
        });
    });
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

function buyArmor(name, price, os, type) {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : price;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки ${name}.`);
        return;
    }
    
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
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
    
    // Закрываем магазин
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Показываем уведомление
    showModal('Покупка завершена', `✅ ${name} куплена! Деньги списаны с вашего счета.`);
    
    scheduleSave();
}

function buyActiveArmor() {
    const isFreeMode = window.armorShopFreeMode || false;
    const actualPrice = isFreeMode ? 0 : 500;
    
    // Проверяем, достаточно ли денег
    if (state.money < actualPrice) {
        showModal('Недостаточно средств', `У вас ${state.money} уе, а нужно ${actualPrice} уе для покупки Активной брони.`);
        return;
    }
    
    // Списываем деньги
    state.money -= actualPrice;
    updateMoneyDisplay();
    
    // Логируем покупку
    if (actualPrice > 0) {
        addToRollLog('purchase', {
            item: 'Активная броня',
            price: actualPrice,
            category: 'Броня'
        });
    } else {
        addToRollLog('purchase', {
            item: 'Активная броня',
            price: 0,
            category: 'Броня (бесплатно)'
        });
    }
    
    // Закрываем магазин
    const currentModal = document.querySelector('.modal-overlay');
    if (currentModal) {
        currentModal.remove();
    }
    
    // Показываем выбор типа ракет
    showActiveArmorTypeSelection();
    
    scheduleSave();
}

function showActiveArmorTypeSelection() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Выберите тип ракет для Активной брони</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div style="display: grid; gap: 1rem;">
                    <button class="pill-button primary-button" onclick="createActiveArmor('Микроракеты')" style="font-size: 1rem; padding: 1rem;">
                        Микроракеты
                    </button>
                    <button class="pill-button primary-button" onclick="createActiveArmor('Дробовая')" style="font-size: 1rem; padding: 1rem;">
                        Дробовая
                    </button>
                    <button class="pill-button primary-button" onclick="createActiveArmor('Лазерная')" style="font-size: 1rem; padding: 1rem;">
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
}

function createActiveArmor(rocketType) {
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
        price: 500,
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

function buyBallisticShield() {
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
        isShield: true
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
                    <button class="atm-button" onclick="showExitConfirmation()" style="width: 100%; background: #666666; border: none; color: #ffffff; padding: 0.5rem; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">Отмена</button>
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
    
    // Очки опыта и ролевые очки
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
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
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

// Функции для работы с недвижимостью (жильем)
function addHousing() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Добавить жилье</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <div class="input-group">
                    <label class="input-label">Название</label>
                    <input type="text" class="input-field" id="housingName" placeholder="Например: Квартира в Мегаполисе">
                </div>
                <div class="input-group">
                    <label class="input-label">Описание</label>
                    <textarea class="input-field" id="housingDescription" rows="3" placeholder="Опишите жилье..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="pill-button primary-button" onclick="confirmAddHousing()">Добавить</button>
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

function confirmAddHousing() {
    const name = document.getElementById('housingName').value.trim();
    const description = document.getElementById('housingDescription').value.trim();
    
    if (!name) {
        showModal('Ошибка', 'Укажите название жилья!');
        return;
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

function renderHousing() {
    const container = document.getElementById('housingContainer');
    if (!container) return;
    
    if (state.property.housing.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 1rem;">Жилье не добавлено</p>';
        return;
    }
    
    container.innerHTML = state.property.housing.map(housing => `
        <div class="property-item" style="background: rgba(125, 244, 198, 0.1); border: 1px solid var(--success); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
            <div class="property-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <div style="flex: 1;">
                    <div class="property-name" style="color: var(--success); font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">${housing.name}</div>
                    <div class="property-description" style="color: var(--text); font-size: 0.9rem; margin-bottom: 0.5rem;">${housing.description || 'Без описания'}</div>
                    <div style="color: var(--muted); font-size: 0.75rem;">Добавлено: ${housing.addedDate}</div>
                </div>
                <button onclick="removeHousing('${housing.id}')" style="font-size: 1.2rem; background: transparent; border: none; color: var(--danger); cursor: pointer; margin-left: 0.5rem;" title="Удалить">×</button>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
                <button class="pill-button primary-button" onclick="payRent('${housing.id}')" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;"><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Заплатить за аренду</button>
            </div>
        </div>
    `).join('');
}

function payRent(housingId) {
    const housing = state.property.housing.find(h => h.id === housingId);
    if (!housing) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3><img src="https://static.tildacdn.com/tild3663-3731-4561-b539-383739323739/money.png" alt="💰" style="width: 16px; height: 16px; vertical-align: middle;"> Оплата аренды</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="text-align: center; color: var(--text); margin-bottom: 1rem;">
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
                <p style="color: var(--danger); font-size: 1.1rem; margin-bottom: 1rem;">Не хватает денег!</p>
                <p style="color: var(--muted);">Нужно: ${rentAmount} уе</p>
                <p style="color: var(--muted);">Доступно: ${currentMoney} уе</p>
                <p style="color: var(--danger); font-weight: 600; margin-top: 0.5rem;">Не хватает: ${shortage} уе</p>
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
    
    showConfirmModal('Подтверждение', `Удалить жилье "${housing.name}"?`, () => {
        state.property.housing = state.property.housing.filter(h => h.id !== housingId);
        renderHousing();
        scheduleSave();
    });
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

// Функции для управления профессиональными навыками
function increaseProfessionalSkillLevel(index) {
    const input = document.getElementById(`professionalSkillLevel${index}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.min(15, currentValue + 1);
        input.value = newValue;
        updateProfessionalSkill(index, document.getElementById(`professionalSkillName${index}`).value, newValue);
    }
}

function decreaseProfessionalSkillLevel(index) {
    const input = document.getElementById(`professionalSkillLevel${index}`);
    if (input) {
        const currentValue = parseInt(input.value) || 0;
        const newValue = Math.max(0, currentValue - 1);
        input.value = newValue;
        updateProfessionalSkill(index, document.getElementById(`professionalSkillName${index}`).value, newValue);
    }
}

// Функция для обновления вычисляемых характеристик
function updateDerivedStats() {
    // Обновляем ВОС (Врождённая Останавливающая Сила)
    const derivedArmor = document.getElementById('derivedArmor');
    if (derivedArmor) {
        // ВОС = ТЕЛО / 3, округлено вниз, но не менее 1
        const body = state.stats.BODY || 5;
        const armor = Math.max(1, Math.floor(body / 3));
        derivedArmor.textContent = armor;
    }
    
    // Обновляем Скорость Перемещения
    const derivedSpeed = document.getElementById('derivedSpeed');
    if (derivedSpeed) {
        // Скорость = ЛВК
        const speed = state.stats.DEX || 5;
        derivedSpeed.textContent = speed;
    }
    
    // Обновляем Скорость Рукопашной Атаки
    const derivedAttackSpeed = document.getElementById('derivedAttackSpeed');
    if (derivedAttackSpeed) {
        // Скорость атаки = ЛВК / 2, округлено вниз, минимум 1
        const attackSpeed = Math.max(1, Math.floor((state.stats.DEX || 5) / 2));
        derivedAttackSpeed.textContent = attackSpeed;
    }
}


// Функция для отображения боеприпасов
function renderAmmo() {
    const container = document.getElementById('ammoContainer');
    if (!container) return;
    
    if (state.ammo.length === 0) {
        container.innerHTML = '<p style="color: var(--muted); text-align: center; padding: 2rem;">Боеприпасы не добавлены</p>';
        return;
    }
    
    container.innerHTML = state.ammo.map((ammo, index) => `
        <div style="background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <div style="color: var(--accent); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem;">
                    ${ammo.type} (${ammo.weaponType})
                </div>
                <div style="color: var(--text); font-size: 0.8rem; margin-bottom: 0.25rem;">
                    Количество: ${ammo.quantity} ${ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты' ? 'шт.' : 'патронов'}
                </div>
                <div style="color: var(--muted); font-size: 0.75rem;">
                    Цена: ${ammo.price} уе | Нагрузка: ${ammo.weaponType === 'Гранаты' || ammo.weaponType === 'Ракеты' ? ammo.quantity : Math.ceil(ammo.quantity / 10)}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="changeAmmoQuantity(${index}, -1)" style="background: transparent; border: none; color: var(--text); cursor: pointer; font-size: 1rem;" title="Уменьшить количество">-</button>
                <span style="color: var(--text); font-weight: 600; min-width: 30px; text-align: center;">${ammo.quantity}</span>
                <button onclick="changeAmmoQuantity(${index}, 1)" style="background: transparent; border: none; color: var(--text); cursor: pointer; font-size: 1rem;" title="Увеличить количество">+</button>
                <button onclick="removeAmmo(${index})" style="background: transparent; border: none; color: var(--danger); cursor: pointer; margin-left: 0.5rem;" title="Удалить">
                    <img src="https://static.tildacdn.com/tild6166-3331-4338-b038-623539346365/x-button.png" style="width: 16px; height: 16px;">
                </button>
            </div>
        </div>
    `).join('');
}

// Универсальные функции для модальных окон (замена alert/confirm/prompt)

function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.tabIndex = -1; // Позволяет модальному окну получать фокус
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1.5rem;">${message}</p>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="pill-button secondary-button" onclick="closeConfirmModal(false, this.closest('.modal-overlay'))">Отмена</button>
                    <button class="pill-button danger-button" onclick="closeConfirmModal(true, this.closest('.modal-overlay'))">Да</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Сохраняем функции обратного вызова
    modal.onConfirm = onConfirm;
    modal.onCancel = onCancel;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeConfirmModal(false, modal);
        }
    });
    
    // Обработка клавиши Enter для подтверждения
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            closeConfirmModal(true, modal);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            closeConfirmModal(false, modal);
        }
    });
    
    // Фокусируемся на модальном окне для обработки клавиш
    setTimeout(() => {
        modal.focus();
    }, 100);
}

function closeConfirmModal(result, modalElement = null) {
    const modal = modalElement || document.querySelector('.modal-overlay:last-child');
    if (modal) {
        modal.remove();
        if (result && modal.onConfirm) {
            modal.onConfirm();
        } else if (!result && modal.onCancel) {
            modal.onCancel();
        }
    }
}

function showPromptModal(title, message, defaultValue = '', onConfirm, onCancel = null) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closePromptModal(null)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1rem;">${message}</p>
                <input type="text" id="promptInput" value="${defaultValue}" style="width: 100%; padding: 0.5rem; margin-bottom: 1.5rem; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; color: var(--text);">
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="pill-button secondary-button" onclick="closePromptModal(null)">Отмена</button>
                    <button class="pill-button primary-button" onclick="closePromptModal(document.getElementById('promptInput').value)">ОК</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const input = document.getElementById('promptInput');
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
    
    // Обработка Enter и Escape
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            closePromptModal(document.getElementById('promptInput').value);
        } else if (e.key === 'Escape') {
            closePromptModal(null);
        }
    });
    
    // Сохраняем функции обратного вызова
    modal.onConfirm = onConfirm;
    modal.onCancel = onCancel;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePromptModal(null);
        }
    });
}

function closePromptModal(result) {
    const modal = document.querySelector('.modal-overlay:last-child');
    if (modal) {
        modal.remove();
        if (result !== null && modal.onConfirm) {
            modal.onConfirm(result);
        } else if (result === null && modal.onCancel) {
            modal.onCancel();
        }
    }
}

function showAlertModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    const existingModals = document.querySelectorAll('.modal-overlay');
    modal.style.zIndex = 1000 + (existingModals.length * 100);
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="icon-button" onclick="closeModal(this)">×</button>
            </div>
            <div class="modal-body">
                <p style="color: var(--text); margin-bottom: 1.5rem;">${message}</p>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="pill-button primary-button" onclick="closeModal(this.parentElement.parentElement.parentElement)">ОК</button>
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
