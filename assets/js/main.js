/**
 * MariSIP Landing Page - Main JavaScript
 * =============================================
 */

// ============================================
// TELEGRAM CONFIGURATION
// ============================================
// ВАЖНО: Замените на свои значения!
const TG_BOT_TOKEN = "ВСТАВИТЬ_СЮДА_ТОКЕН_БОТА";
const TG_CHAT_ID = "ВСТАВИТЬ_СЮДА_CHAT_ID";

// URL каталога (замените на реальный домен)
const CATALOG_URL = "https://marisip.ru/assets/pdf/catalog.pdf";

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format phone number
 */
function formatPhone(value) {
    const phone = value.replace(/\D/g, '');
    const match = phone.match(/^(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);

    if (!match) return value;

    let result = '+7';
    if (match[2]) result += ' (' + match[2];
    if (match[3]) result += ') ' + match[3];
    if (match[4]) result += '-' + match[4];
    if (match[5]) result += '-' + match[5];

    return result;
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 11;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'error') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');

    toast.className = 'toast active';
    if (type === 'error') toast.classList.add('toast--error');
    if (type === 'success') toast.classList.add('toast--success');

    toastMessage.textContent = message;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 5000);
}

/**
 * Close toast
 */
function closeToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('active');
}

// ============================================
// TELEGRAM SEND FUNCTION
// ============================================

/**
 * Send message to Telegram
 */
async function sendToTelegram(payload) {
    const { source, data } = payload;

    // Build message
    let message = `📩 <b>Новая заявка MariSIP</b>\n\n`;
    message += `📋 <b>Источник:</b> ${source}\n`;
    message += `━━━━━━━━━━━━━━━\n`;

    if (data.house) message += `🏠 <b>Дом:</b> ${data.house}\n`;
    if (data.purpose) message += `🎯 <b>Цель:</b> ${data.purpose}\n`;
    if (data.land) message += `📍 <b>Участок:</b> ${data.land}\n`;
    if (data.package) message += `📦 <b>Комплектация:</b> ${data.package}\n`;
    if (data.mortgage) message += `💳 <b>Ипотека:</b> ${data.mortgage}\n`;
    if (data.timeline) message += `📅 <b>Старт:</b> ${data.timeline}\n`;

    message += `━━━━━━━━━━━━━━━\n`;
    message += `👤 <b>Имя:</b> ${data.name}\n`;
    message += `📱 <b>Телефон:</b> ${data.phone}\n`;

    if (data.contactMethod) message += `💬 <b>Способ связи:</b> ${data.contactMethod}\n`;
    if (data.comment) message += `💭 <b>Комментарий:</b> ${data.comment}\n`;

    if (data.region) {
        message += `🌍 <b>Регион:</b> ${data.region}\n`;
        message += `\n🎁 <b>ПОДАРОК: БЕСЕДКА</b> 🎁\n`;
    }

    message += `\n📎 <a href="${CATALOG_URL}">Каталог</a>`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TG_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(result.description || 'Telegram API error');
        }

        return true;
    } catch (error) {
        console.error('Telegram send error:', error);
        throw error;
    }
}

// ============================================
// HEADER & NAVIGATION
// ============================================

/**
 * Initialize header functionality
 */
function initHeader() {
    const header = document.getElementById('header');
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = mobileMenu.querySelectorAll('a, button[data-scroll]');

    // Scroll detection for sticky header
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Burger menu toggle
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu on link click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Initialize smooth scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('[data-scroll]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = element.getAttribute('data-scroll');
            const target = document.getElementById(targetId);

            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // If button has data-house attribute, pre-select in quiz
                const house = element.getAttribute('data-house');
                if (house && targetId === 'quiz') {
                    setTimeout(() => {
                        const radioInput = document.querySelector(`input[name="house"][value="${house}"]`);
                        if (radioInput) {
                            radioInput.checked = true;
                        }
                    }, 500);
                }
            }
        });
    });

    // Anchor links in nav
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// PHONE MASK
// ============================================

/**
 * Initialize phone input masks
 */
function initPhoneMask() {
    const phoneInputs = document.querySelectorAll('input[type="tel"]');

    phoneInputs.forEach(input => {
        // Set initial value
        if (!input.value) {
            input.value = '+7 ';
        }

        input.addEventListener('focus', function() {
            if (!this.value) {
                this.value = '+7 ';
            }
        });

        input.addEventListener('input', function(e) {
            const cursorPosition = this.selectionStart;
            const oldLength = this.value.length;

            this.value = formatPhone(this.value);

            const newLength = this.value.length;
            const diff = newLength - oldLength;

            // Adjust cursor position
            this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
        });

        input.addEventListener('keydown', function(e) {
            // Allow backspace and delete
            if (e.key === 'Backspace' && this.value.length <= 4) {
                e.preventDefault();
            }
        });
    });
}

// ============================================
// QUIZ FUNCTIONALITY
// ============================================

/**
 * Initialize quiz
 */
function initQuiz() {
    const form = document.getElementById('quiz-form');
    const steps = form.querySelectorAll('.quiz__step');
    const progressFill = document.getElementById('quiz-progress');
    const stepCurrent = document.getElementById('quiz-step-current');
    const prevBtn = document.getElementById('quiz-prev');
    const nextBtn = document.getElementById('quiz-next');
    const submitBtn = document.getElementById('quiz-submit');
    const successScreen = document.getElementById('quiz-success');
    const regionSelect = document.getElementById('quiz-region');
    const otherRegionGroup = document.getElementById('other-region-group');

    let currentStep = 1;
    const totalSteps = 7;
    let isSubmitting = false;

    /**
     * Update progress bar
     */
    function updateProgress() {
        const percent = (currentStep / totalSteps) * 100;
        progressFill.style.width = `${percent}%`;
        stepCurrent.textContent = currentStep;
    }

    /**
     * Show step
     */
    function showStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        const targetStep = form.querySelector(`[data-step="${step}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // Update buttons
        prevBtn.style.display = step > 1 ? 'inline-flex' : 'none';

        if (step === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'inline-flex';
        } else {
            nextBtn.style.display = 'inline-flex';
            submitBtn.style.display = 'none';
        }

        updateProgress();
    }

    /**
     * Validate current step
     */
    function validateStep(step) {
        const currentStepEl = form.querySelector(`[data-step="${step}"]`);

        if (step < 7) {
            // Steps 1-6: Radio selection required
            const radios = currentStepEl.querySelectorAll('input[type="radio"]');
            const radioName = radios[0]?.name;

            if (radioName) {
                const checked = form.querySelector(`input[name="${radioName}"]:checked`);
                if (!checked) {
                    showToast('Пожалуйста, выберите один из вариантов');
                    return false;
                }
            }
        } else {
            // Step 7: Name and phone required
            const nameInput = document.getElementById('quiz-name');
            const phoneInput = document.getElementById('quiz-phone');

            let isValid = true;

            if (!nameInput.value.trim()) {
                nameInput.classList.add('error');
                isValid = false;
            } else {
                nameInput.classList.remove('error');
            }

            if (!isValidPhone(phoneInput.value)) {
                phoneInput.classList.add('error');
                isValid = false;
            } else {
                phoneInput.classList.remove('error');
            }

            if (!isValid) {
                showToast('Пожалуйста, заполните обязательные поля');
                return false;
            }
        }

        return true;
    }

    /**
     * Get form data
     */
    function getFormData() {
        const data = {};

        // Radio values from steps 1-6
        const fields = ['house', 'purpose', 'land', 'package', 'mortgage', 'timeline'];
        fields.forEach(field => {
            const checked = form.querySelector(`input[name="${field}"]:checked`);
            if (checked) {
                data[field] = checked.value;
            }
        });

        // Step 7 fields
        data.name = document.getElementById('quiz-name').value.trim();
        data.phone = document.getElementById('quiz-phone').value.trim();

        const contactMethod = form.querySelector('input[name="contact_method"]:checked');
        if (contactMethod) {
            data.contactMethod = contactMethod.value;
        }

        // Region
        const region = regionSelect.value;
        if (region === 'Другой') {
            const otherRegion = document.getElementById('quiz-region-other').value.trim();
            if (otherRegion) {
                data.region = otherRegion;
            }
        } else if (region) {
            data.region = region;
        }

        return data;
    }

    /**
     * Handle submit
     */
    async function handleSubmit(e) {
        e.preventDefault();

        if (isSubmitting) return;

        // Check honeypot
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) {
            return; // Bot detected
        }

        if (!validateStep(currentStep)) return;

        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            const data = getFormData();

            await sendToTelegram({
                source: 'Квиз',
                data: data
            });

            // Show success screen
            form.style.display = 'none';
            document.querySelector('.quiz__progress').style.display = 'none';
            successScreen.style.display = 'block';

            showToast('Заявка успешно отправлена!', 'success');

        } catch (error) {
            showToast('Не удалось отправить заявку. Пожалуйста, позвоните нам: 8 999 609 26 66');
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Получить расчёт';
        }
    }

    // Event listeners
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            showStep(currentStep);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            showStep(currentStep);
        }
    });

    form.addEventListener('submit', handleSubmit);

    // Region "Other" toggle
    regionSelect.addEventListener('change', function() {
        if (this.value === 'Другой') {
            otherRegionGroup.classList.remove('form-group--hidden');
        } else {
            otherRegionGroup.classList.add('form-group--hidden');
        }
    });

    // Allow clicking on option to select radio
    document.querySelectorAll('.quiz__option').forEach(option => {
        option.addEventListener('click', function() {
            const radio = this.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
            }
        });
    });

    // Initialize
    showStep(currentStep);
}

// ============================================
// CONTACT FORM
// ============================================

/**
 * Initialize contact form
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit');
    const successScreen = document.getElementById('contact-success');

    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        // Check honeypot
        const honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) {
            return; // Bot detected
        }

        const nameInput = document.getElementById('contact-name');
        const phoneInput = document.getElementById('contact-phone');
        const commentInput = document.getElementById('contact-comment');

        // Validation
        let isValid = true;

        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameInput.classList.remove('error');
        }

        if (!isValidPhone(phoneInput.value)) {
            phoneInput.classList.add('error');
            isValid = false;
        } else {
            phoneInput.classList.remove('error');
        }

        if (!isValid) {
            showToast('Пожалуйста, заполните обязательные поля');
            return;
        }

        isSubmitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            await sendToTelegram({
                source: 'Форма контактов',
                data: {
                    name: nameInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    comment: commentInput.value.trim()
                }
            });

            // Show success
            form.style.display = 'none';
            successScreen.style.display = 'block';

            showToast('Заявка успешно отправлена!', 'success');

        } catch (error) {
            showToast('Не удалось отправить заявку. Пожалуйста, позвоните нам: 8 999 609 26 66');
        } finally {
            isSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Оставить заявку';
        }
    });
}

// ============================================
// REVIEWS SLIDER
// ============================================

/**
 * Initialize reviews slider
 */
function initReviewsSlider() {
    const track = document.getElementById('reviews-track');
    const prevBtn = document.getElementById('reviews-prev');
    const nextBtn = document.getElementById('reviews-next');
    const cards = track.querySelectorAll('.review-card');

    let currentIndex = 0;
    let cardsPerView = 1;

    /**
     * Calculate cards per view based on screen width
     */
    function calculateCardsPerView() {
        const width = window.innerWidth;
        if (width >= 1200) {
            cardsPerView = 3;
        } else if (width >= 768) {
            cardsPerView = 2;
        } else {
            cardsPerView = 1;
        }
    }

    /**
     * Update slider position
     */
    function updateSlider() {
        const cardWidth = cards[0].offsetWidth;
        const gap = 24; // var(--spacing-lg) = 1.5rem = 24px
        const offset = currentIndex * (cardWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;
    }

    /**
     * Go to next slide
     */
    function nextSlide() {
        const maxIndex = cards.length - cardsPerView;
        if (currentIndex < maxIndex) {
            currentIndex++;
        } else {
            currentIndex = 0;
        }
        updateSlider();
    }

    /**
     * Go to previous slide
     */
    function prevSlide() {
        if (currentIndex > 0) {
            currentIndex--;
        } else {
            currentIndex = cards.length - cardsPerView;
        }
        updateSlider();
    }

    // Event listeners
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Recalculate on resize
    window.addEventListener('resize', debounce(() => {
        calculateCardsPerView();
        currentIndex = Math.min(currentIndex, cards.length - cardsPerView);
        updateSlider();
    }, 250));

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Auto-play
    let autoplayInterval = setInterval(nextSlide, 5000);

    // Pause on hover
    track.parentElement.addEventListener('mouseenter', () => {
        clearInterval(autoplayInterval);
    });

    track.parentElement.addEventListener('mouseleave', () => {
        autoplayInterval = setInterval(nextSlide, 5000);
    });

    // Initialize
    calculateCardsPerView();
    updateSlider();
}

// ============================================
// HOUSE MODALS
// ============================================

/**
 * House data
 */
const housesData = {
    'house-mini': {
        title: 'CLASSIC MINI',
        area: '36 м²',
        price: 'от 1,35 млн ₽',
        features: [
            '1 спальня',
            'Кухня-гостиная',
            'Санузел',
            'Терраса (опционально)',
            'Высота потолков 2.7 м',
            'Тёплые полы (опционально)'
        ],
        description: 'Компактный и функциональный дом для одного человека или пары. Идеально подходит для дачи или как гостевой дом.'
    },
    'house-comfort': {
        title: 'CLASSIC COMFORT',
        area: '48 м²',
        price: 'от 1,6 млн ₽',
        features: [
            '2 комнаты',
            'Кухня-гостиная',
            'Котельная',
            'Санузел',
            'Высота потолков 2.7 м',
            'Возможность расширения'
        ],
        description: 'Оптимальный вариант для небольшой семьи или для постоянного проживания. Продуманная планировка с отдельной котельной.'
    },
    'house-family': {
        title: 'CLASSIC FAMILY',
        area: '72 м²',
        price: 'от 2,27 млн ₽',
        features: [
            '3 спальни',
            'Большая кухня-гостиная',
            'Санузел',
            'Гардеробная',
            'Высота потолков 2.7 м',
            'Второй свет (опционально)'
        ],
        description: 'Просторный семейный дом с тремя спальнями. Большая кухня-гостиная станет центром семейных вечеров.'
    },
    'house-max': {
        title: 'CLASSIC MAX',
        area: '96 м²',
        price: 'от 2,75 млн ₽',
        features: [
            '4 комнаты',
            '2 санузла',
            'Кухня-гостиная',
            'Котельная',
            'Терраса',
            'Возможность мансарды'
        ],
        description: 'Максимальный комфорт для большой семьи. Два санузла, четыре комнаты и просторная общая зона.'
    }
};

/**
 * Initialize house modals
 */
function initHouseModals() {
    const modal = document.getElementById('house-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = modal.querySelector('.modal__close');
    const overlay = modal.querySelector('.modal__overlay');

    /**
     * Open modal
     */
    function openModal(houseId) {
        const house = housesData[houseId];
        if (!house) return;

        modalBody.innerHTML = `
            <div class="modal__gallery">
                <div class="modal__image-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                </div>
            </div>
            <h3 class="modal__title">${house.title}</h3>
            <div class="modal__area">${house.area}</div>
            <div class="modal__price">${house.price}</div>
            <p style="color: var(--color-gray-600); margin-bottom: var(--spacing-lg);">${house.description}</p>
            <ul class="modal__features">
                ${house.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <div class="modal__actions">
                <button class="btn btn--primary" data-scroll="quiz" data-house="${house.title} — ${house.area}">Рассчитать стоимость</button>
            </div>
        `;

        // Add event listener to the new button
        const calcBtn = modalBody.querySelector('[data-scroll="quiz"]');
        calcBtn.addEventListener('click', () => {
            closeModalFn();
            setTimeout(() => {
                const quizSection = document.getElementById('quiz');
                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = quizSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Pre-select house in quiz
                const house = calcBtn.getAttribute('data-house');
                setTimeout(() => {
                    const radioInput = document.querySelector(`input[name="house"][value="${house}"]`);
                    if (radioInput) {
                        radioInput.checked = true;
                    }
                }, 500);
            }, 300);
        });

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    function closeModalFn() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event listeners for house modal triggers only
    document.querySelectorAll('[data-modal^="house-"]').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    // Close events
    closeBtn.addEventListener('click', closeModalFn);
    overlay.addEventListener('click', closeModalFn);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFn();
        }
    });
}

// ============================================
// CONSULTATION MODALS
// ============================================

/**
 * Initialize consultation modals
 */
function initConsultationModals() {
    // Consultation modal
    const consultModal = document.getElementById('consultation-modal');
    const consultForm = document.getElementById('consultation-form');
    const consultSuccess = document.getElementById('consultation-success');

    // Mortgage consultation modal
    const mortgageModal = document.getElementById('mortgage-consultation-modal');
    const mortgageForm = document.getElementById('mortgage-form');
    const mortgageSuccess = document.getElementById('mortgage-success');

    /**
     * Generic open modal function
     */
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Generic close modal function
     */
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Setup modal close events
     */
    function setupModalCloseEvents(modal) {
        const closeBtn = modal.querySelector('.modal__close');
        const overlay = modal.querySelector('.modal__overlay');

        closeBtn.addEventListener('click', () => closeModal(modal));
        overlay.addEventListener('click', () => closeModal(modal));
    }

    // Setup close events for both modals
    setupModalCloseEvents(consultModal);
    setupModalCloseEvents(mortgageModal);

    // Open consultation modal
    document.querySelectorAll('[data-modal="consultation"]').forEach(trigger => {
        trigger.addEventListener('click', () => openModal(consultModal));
    });

    // Open mortgage consultation modal
    document.querySelectorAll('[data-modal="mortgage-consultation"]').forEach(trigger => {
        trigger.addEventListener('click', () => openModal(mortgageModal));
    });

    // Escape key closes all modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal(consultModal);
            closeModal(mortgageModal);
        }
    });

    // Consultation form submit
    let isConsultSubmitting = false;
    consultForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isConsultSubmitting) return;

        // Check honeypot
        const honeypot = consultForm.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) return;

        const nameInput = document.getElementById('consult-name');
        const phoneInput = document.getElementById('consult-phone');

        // Validation
        let isValid = true;

        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameInput.classList.remove('error');
        }

        if (!isValidPhone(phoneInput.value)) {
            phoneInput.classList.add('error');
            isValid = false;
        } else {
            phoneInput.classList.remove('error');
        }

        if (!isValid) {
            showToast('Пожалуйста, заполните обязательные поля');
            return;
        }

        isConsultSubmitting = true;
        const submitBtn = document.getElementById('consult-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            await sendToTelegram({
                source: 'Консультация',
                data: {
                    name: nameInput.value.trim(),
                    phone: phoneInput.value.trim()
                }
            });

            consultForm.style.display = 'none';
            consultSuccess.style.display = 'block';
            showToast('Заявка успешно отправлена!', 'success');

        } catch (error) {
            showToast('Не удалось отправить заявку. Позвоните нам: 8 999 609 26 66');
        } finally {
            isConsultSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Получить консультацию';
        }
    });

    // Mortgage form submit
    let isMortgageSubmitting = false;
    mortgageForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isMortgageSubmitting) return;

        // Check honeypot
        const honeypot = mortgageForm.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) return;

        const nameInput = document.getElementById('mortgage-name');
        const phoneInput = document.getElementById('mortgage-phone');

        // Validation
        let isValid = true;

        if (!nameInput.value.trim()) {
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameInput.classList.remove('error');
        }

        if (!isValidPhone(phoneInput.value)) {
            phoneInput.classList.add('error');
            isValid = false;
        } else {
            phoneInput.classList.remove('error');
        }

        if (!isValid) {
            showToast('Пожалуйста, заполните обязательные поля');
            return;
        }

        isMortgageSubmitting = true;
        const submitBtn = document.getElementById('mortgage-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        try {
            await sendToTelegram({
                source: 'Консультация по ипотеке',
                data: {
                    name: nameInput.value.trim(),
                    phone: phoneInput.value.trim()
                }
            });

            mortgageForm.style.display = 'none';
            mortgageSuccess.style.display = 'block';
            showToast('Заявка успешно отправлена!', 'success');

        } catch (error) {
            showToast('Не удалось отправить заявку. Позвоните нам: 8 999 609 26 66');
        } finally {
            isMortgageSubmitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Получить консультацию';
        }
    });
}

// ============================================
// COPYRIGHT YEAR
// ============================================

/**
 * Set current year in footer
 */
function initCopyrightYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// TOAST CLOSE
// ============================================

function initToast() {
    const closeBtn = document.querySelector('.toast__close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeToast);
    }
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initSmoothScroll();
    initPhoneMask();
    initQuiz();
    initContactForm();
    initHouseModals();
    initConsultationModals();
    initScrollAnimations();
    initToast();
    initCopyrightYear();

    console.log('MariSIP Landing initialized');
});
