// ============================================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ПРОФЕССИОНАЛЬНЫМИ НАВЫКАМИ
// Выбор, добавление, удаление и управление профессиональными навыками
// ============================================================================

// Базовая функция рендеринга профессиональных навыков
window.renderProfessionalSkills = function() {
    const container = document.getElementById('professionalSkillsContainer');
    if (!container) return;
    
    // Проверяем и инициализируем массив профессиональных навыков
    if (!state.professionalSkills) {
        state.professionalSkills = [null, null, null, null];
    }
    
    // Убеждаемся, что массив содержит 4 элемента
    while (state.professionalSkills.length < 4) {
        state.professionalSkills.push(null);
    }
    
    // Создаем 4 слота
    let html = '';
    for (let i = 0; i < 4; i++) {
        const skill = state.professionalSkills[i];
        
        if (skill && skill.name) {
            // Слот занят - показываем навык
            html += `
                <div class="professional-skill-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem; align-items: center;">
                    <div style="flex: 1; display: flex; align-items: center; gap: 0.25rem; background: ${getThemeColors().bgMedium}; border: 1px solid var(--border); border-radius: 3px; padding: 0.25rem;">
                        <span style="color: ${getThemeColors().text}; font-size: 0.7rem; flex: 1;">${skill.name}</span>
                        <button class="prof-skill-info-btn" onclick="showProfessionalSkillInfo('${i}')" title="Описание навыка">i</button>
                        <button class="prof-skill-remove-btn" onclick="removeProfessionalSkillFromSlot(${i})" title="Удалить навык">×</button>
                    </div>
                    <div class="integrated-numeric-input" style="width: 60px;">
                        <input type="text" class="integrated-numeric-field" value="${skill.level || 1}" min="1" max="10" onchange="updateProfessionalSkillLevelNew(${i}, this.value);" style="font-size: 0.7rem; width: 100%; text-align: center;">
                    </div>
                </div>
            `;
        } else {
            // Слот пуст - показываем заглушку
            html += `
                <div class="professional-skill-row" style="display: flex; gap: 0.5rem; margin-bottom: 0.25rem; align-items: center;">
                    <div style="flex: 1; display: flex; align-items: center; background: ${getThemeColors().bgLight}; border: 1px dashed rgba(182, 103, 255, 0.3); border-radius: 3px; padding: 0.25rem;">
                        <span style="color: ${getThemeColors().muted}; font-size: 0.7rem; font-style: italic;">Пустой слот</span>
                    </div>
                    <div style="width: 60px; text-align: center;">
                        <span style="color: ${getThemeColors().muted}; font-size: 0.7rem;">—</span>
                    </div>
                </div>
            `;
        }
    }
    
    container.innerHTML = html;
}

// Показать модальное окно выбора профессионального навыка
window.showProfessionalSkillsModal = function() {
    // Проверяем, есть ли свободные слоты
    if (!state.professionalSkills) {
        state.professionalSkills = [null, null, null, null];
    }
    
    // Блокируем скролл фоновой страницы
    document.body.style.overflow = 'hidden';
    
    const freeSlots = 4 - state.professionalSkills.filter(s => s && s.name).length;
    if (freeSlots === 0) {
        // Восстанавливаем скролл перед показом модала
        document.body.style.overflow = '';
        showModal('Все слоты заняты', 'У вас уже изучено 4 профессиональных навыка. Чтобы изучить новый, удалите один из существующих.');
        return;
    }
    
    // Получаем список навыков, которые еще не изучены
    const learnedSkillNames = state.professionalSkills.map(s => s ? s.name : null).filter(n => n);
    const availableSkills = PROFESSIONAL_SKILLS_LIBRARY.filter(skill => !learnedSkillNames.includes(skill.name));
    
    if (availableSkills.length === 0) {
        // Восстанавливаем скролл перед показом модала
        document.body.style.overflow = '';
        showModal('Нет доступных навыков', 'Все доступные профессиональные навыки уже изучены!');
        return;
    }
    
    // Группируем навыки по профессиям
    const groupedSkills = {
        'Воин улиц': availableSkills.filter(s => ['Гора', 'Ассасин', 'Снайпер', 'Солдат'].includes(s.name)),
        'Вольный народ': availableSkills.filter(s => ['Член семьи', 'Друг семьи'].includes(s.name)),
        'Журналист': availableSkills.filter(s => ['Глас народа'].includes(s.name)),
        'Инженер': availableSkills.filter(s => ['Изобретатель', 'Гаражный мастер', 'Кибер-техник', 'Самоделкин'].includes(s.name)),
        'Корпорат': availableSkills.filter(s => ['Директор', 'Цепной пёс корпорации'].includes(s.name)),
        'Медик': availableSkills.filter(s => ['Фармацевт', 'Инженер криосистем', 'Специалист по клонированию'].includes(s.name)),
        'Сёрфер': availableSkills.filter(s => ['Белый хакер', 'Чёрный хакер', 'Программист'].includes(s.name)),
        'Уличный панк': availableSkills.filter(s => ['Решала', 'Актёр', 'Гримёр'].includes(s.name))
    };
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${document.body.classList.contains('light-theme') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.8)'};
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal" style="max-width: 800px; width: 90%; max-height: 90vh;">
            <div class="modal-header">
                <h3>Выберите профессиональный навык</h3>
                <button class="icon-button" onclick="document.body.style.overflow = ''; this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body" style="overflow-y: auto; max-height: 70vh;">
                <div id="professionalSkillsList">
                    <!-- Список навыков будет добавлен динамически -->
            </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Заполняем список навыков по группам
    const skillsList = document.getElementById('professionalSkillsList');
    if (skillsList) {
        let skillsListHTML = '';
        for (const [profession, skills] of Object.entries(groupedSkills)) {
            if (skills.length === 0) continue;
            
            skillsListHTML += `
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 700; color: ${getThemeColors().accent}; margin-bottom: 0.75rem; font-size: 1rem; text-transform: uppercase; padding-bottom: 0.5rem; border-bottom: 2px solid var(--accent);">${profession}</div>
                    ${skills.map(skill => `
                        <div class="professional-skill-card" onclick="selectProfessionalSkill('${skill.id}')" style="padding: 1rem; margin-bottom: 0.75rem; background: ${getThemeColors().bgMedium}; border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--accent)'; this.style.background='rgba(182, 103, 255, 0.1)'" onmouseout="this.style.borderColor='var(--border)'; this.style.background='rgba(0,0,0,0.3)'">
                            <div style="color: ${getThemeColors().accent}; font-weight: 600; margin-bottom: 0.5rem;">${skill.name}</div>
                            <div style="color: ${getThemeColors().muted}; font-size: 0.8rem; line-height: 1.4;">${formatProfessionalSkillDescription(skill.description)}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        skillsList.innerHTML = skillsListHTML;
    }
}

// Библиотека профессиональных навыков загружается из data.js

// Форматирование описания с таблицами для детального модала
window.formatDescriptionWithTables = function(description) {
    // Просто заменяем переносы строк на <br>, без автоматического определения таблиц
    return description.replace(/\n/g, '<br>');
};

// Форматирование описания для списка выбора (сокращенная версия)
window.formatProfessionalSkillDescription = function(description) {
    // В списке выбора показываем только первые 200 символов
    if (description.length > 200) {
        return description.substring(0, 200) + '...';
    }
    return description;
};

// Выбрать профессиональный навык из библиотеки
window.selectProfessionalSkill = function(skillId) {
    const skillTemplate = PROFESSIONAL_SKILLS_LIBRARY.find(s => s.id === skillId);
    if (!skillTemplate) return;
    
    // Сохраняем позицию прокрутки списка перед закрытием
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            // Сохраняем позицию прокрутки во временную переменную
            window.professionalSkillsScrollPosition = modalBody.scrollTop;
        }
        modal.remove();
    }
    
    // Форматируем описание с таблицами
    const formattedDescription = formatDescriptionWithTables(skillTemplate.description);
    
    // Определяем максимальный уровень (для Снайпера - 4, для остальных - 10)
    const maxLevel = skillTemplate.name === 'Снайпер' ? 4 : 10;
    const levelLabel = skillTemplate.name === 'Снайпер' ? 'Начальный уровень (1-4)' : 'Начальный уровень (1-10)';
    
    // Добавляем обработчик клавиш
    const handleKeyPress = (event) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            returnToProfessionalSkillsModal();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            addProfessionalSkillToSlotAndClose(skillId);
        }
    };
    
    // Показываем модальное окно для ввода уровня
    const levelModal = document.createElement('div');
    levelModal.className = 'modal-overlay';
    levelModal.style.zIndex = '10001';
    levelModal.innerHTML = `
        <div class="modal" style="max-width: 600px; max-height: 85vh; overflow: hidden; display: flex; flex-direction: column;">
            <div class="modal-header">
                <h3 style="margin: 0; color: ${getThemeColors().accent};">${skillTemplate.name}</h3>
                <button class="icon-button" onclick="returnToProfessionalSkillsModal()">×</button>
            </div>
            <div class="modal-body" style="flex: 1; overflow-y: auto; padding-bottom: 0;">
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(182, 103, 255, 0.1); border: 1px solid var(--accent); border-radius: 8px;">
                    <div style="color: ${getThemeColors().text}; font-size: 0.85rem; line-height: 1.6;">${formattedDescription}</div>
                </div>
            </div>
            <div style="padding: 1rem; border-top: 1px solid var(--border); background: ${getThemeColors().bgLight};">
                <div class="input-group" style="margin-bottom: 1rem;">
                    <label class="input-label">${levelLabel}</label>
                    <div class="integrated-numeric-input">
                        <button type="button" class="integrated-numeric-btn" onclick="changeLevelInput(this, -1, 1, ${maxLevel})">−</button>
                        <input type="number" id="skillLevelInput" class="integrated-numeric-field" value="1" min="1" max="${maxLevel}" style="text-align: center;">
                        <button type="button" class="integrated-numeric-btn" onclick="changeLevelInput(this, 1, 1, ${maxLevel})">+</button>
                    </div>
            </div>
                <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
                    <button class="pill-button muted-button" onclick="returnToProfessionalSkillsModal()">Назад к списку</button>
                    <button class="pill-button primary-button" onclick="addProfessionalSkillToSlotAndClose('${skillId}')">Изучить навык</button>
            </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(levelModal);
    
    // Добавляем обработчик клавиш
    document.addEventListener('keydown', handleKeyPress);
    
    // Сохраняем обработчик для последующего удаления
    levelModal._keyHandler = handleKeyPress;
    
    // Фокусируемся на поле ввода
    setTimeout(() => {
        const levelInput = levelModal.querySelector('#skillLevelInput');
        if (levelInput) {
            levelInput.focus();
            levelInput.select();
        }
    }, 100);
};

// Вернуться к модальному окну выбора навыков
window.returnToProfessionalSkillsModal = function() {
    // Удаляем модальное окно выбора уровня
    const levelModal = document.querySelector('.modal-overlay[style*="z-index: 10001"]');
    if (levelModal) {
        // Удаляем обработчик клавиш
        if (levelModal._keyHandler) {
            document.removeEventListener('keydown', levelModal._keyHandler);
        }
        levelModal.remove();
    }
    
    // Восстанавливаем скролл фоновой страницы
    document.body.style.overflow = '';
    
    // Показываем модальное окно выбора навыков заново
    showProfessionalSkillsModal();
};

// Добавить навык в слот и закрыть модальное окно
window.addProfessionalSkillToSlotAndClose = function(skillId) {
    const levelInput = document.getElementById('skillLevelInput');
    const level = levelInput ? parseInt(levelInput.value) || 1 : 1;
    
    addProfessionalSkillToSlot(skillId, level);
    
    // Удаляем модальное окно выбора уровня
    const levelModal = document.querySelector('.modal-overlay[style*="z-index: 10001"]');
    if (levelModal) {
        // Удаляем обработчик клавиш
        if (levelModal._keyHandler) {
            document.removeEventListener('keydown', levelModal._keyHandler);
        }
        levelModal.remove();
    }
    
    // Восстанавливаем скролл фоновой страницы
    document.body.style.overflow = '';
    
    // Обновляем отображение навыков
    renderProfessionalSkills();
};

// Функции управления навыками
window.addProfessionalSkillToSlot = function(skillId, level) {
    const skillTemplate = PROFESSIONAL_SKILLS_LIBRARY.find(s => s.id === skillId);
    if (!skillTemplate) return;
    
    // Инициализируем массив если нужно
    if (!state.professionalSkills) {
        state.professionalSkills = [null, null, null, null];
    }
    
    // Проверяем, не изучен ли уже этот навык
    const alreadyLearned = state.professionalSkills.some(skill => 
        skill && skill.name === skillTemplate.name
    );
    if (alreadyLearned) {
        showModal('Ошибка', `
            <div style="text-align: center; padding: 1rem;">
                <p style="color: var(--danger);">Навык "${skillTemplate.name}" уже изучен!</p>
                <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-top: 0.5rem;">Сначала удалите существующий навык</p>
            </div>
        `);
        return;
    }
    
    // Проверяем взаимное исключение Белый/Черный хакер
    if (skillTemplate.name === 'Белый хакер') {
        const hasBlackHacker = state.professionalSkills && state.professionalSkills.some(skill => 
            skill && skill.name === 'Чёрный хакер'
        );
        if (hasBlackHacker) {
            showModal('Ошибка', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger);">Нельзя быть одновременно Белым и Чёрным хакером!</p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-top: 0.5rem;">Сначала удалите навык "Чёрный хакер"</p>
                </div>
            `);
            return;
        }
    }
    
    if (skillTemplate.name === 'Чёрный хакер') {
        const hasWhiteHacker = state.professionalSkills && state.professionalSkills.some(skill => 
            skill && skill.name === 'Белый хакер'
        );
        if (hasWhiteHacker) {
            showModal('Ошибка', `
                <div style="text-align: center; padding: 1rem;">
                    <p style="color: var(--danger);">Нельзя быть одновременно Белым и Чёрным хакером!</p>
                    <p style="color: ${getThemeColors().muted}; font-size: 0.9rem; margin-top: 0.5rem;">Сначала удалите навык "Белый хакер"</p>
                </div>
            `);
            return;
        }
    }
    
    // Находим свободный слот
    for (let i = 0; i < 4; i++) {
        if (!state.professionalSkills[i] || !state.professionalSkills[i].name) {
            state.professionalSkills[i] = {
                id: generateId('proSkill'),
                name: skillTemplate.name,
                description: skillTemplate.description,
                level: level || 1
            };
            break;
        }
    }
    
    renderProfessionalSkills();
    scheduleSave();
}

window.removeProfessionalSkillFromSlot = function(slotIndex) {
    if (!state.professionalSkills || !state.professionalSkills[slotIndex]) return;
    
    const skillName = state.professionalSkills[slotIndex].name;
    state.professionalSkills[slotIndex] = null;
    
    renderProfessionalSkills();
    scheduleSave();
    
    showToast(`Навык "${skillName}" удален!`, 2000);
}

window.updateProfessionalSkillLevelNew = function(slotIndex, newLevel) {
    if (!state.professionalSkills || !state.professionalSkills[slotIndex]) return;
    
    const skill = state.professionalSkills[slotIndex];
    const maxLevel = 10;
    
    state.professionalSkills[slotIndex].level = Math.max(1, Math.min(maxLevel, parseInt(newLevel) || 1));
    renderProfessionalSkills();
    scheduleSave();
}

window.showProfessionalSkillInfo = function(slotIndex) {
    const skill = state.professionalSkills[slotIndex];
    if (!skill) return;
    
    showModal(`Навык: ${skill.name}`, skill.description);
}

console.log('✅ professional-skills.js загружен - функции управления навыками добавлены');
