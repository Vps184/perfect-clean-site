// Perfect Clean - Advanced JavaScript Functions
// Integração da base técnica sólida com design premium

class PerfectCleanApp {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupOptimizations();
    }

    init() {
        // Elementos DOM
        this.elements = {
            mobileMenuBtn: document.getElementById('mobile-menu-btn'),
            mobileMenu: document.getElementById('mobile-menu'),
            agendamentoForm: document.getElementById('agendamento-form'),
            nomeInput: document.getElementById('nome'),
            telefoneInput: document.getElementById('telefone'),
            servicoSelect: document.getElementById('servico')
        };

        // Estado da aplicação
        this.state = {
            isMenuOpen: false,
            isSubmitting: false,
            formData: {}
        };

        // Configurações
        this.config = {
            apiEndpoint: '/api/contato',
            rateLimit: 5,
            retryAttempts: 3,
            timeout: 10000
        };

        console.log('🚀 Perfect Clean App initialized');
    }

    bindEvents() {
        // Mobile menu toggle
        if (this.elements.mobileMenuBtn && this.elements.mobileMenu) {
            this.elements.mobileMenuBtn.addEventListener('click', () => this.toggleMobileMenu());
        }

        // Form submission
        if (this.elements.agendamentoForm) {
            this.elements.agendamentoForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Telefone formatting
        if (this.elements.telefoneInput) {
            this.elements.telefoneInput.addEventListener('input', (e) => this.formatTelefone(e));
            this.elements.telefoneInput.addEventListener('blur', (e) => this.validateTelefone(e));
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Scroll spy for navigation
        window.addEventListener('scroll', () => this.handleScroll());

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    setupOptimizations() {
        // Performance optimizations
        this.setupIntersectionObserver();
        this.setupPrefetch();
        this.setupLazyLoading();
        this.setupTouchOptimizations();
        this.setupAccessibility();
        
    }

    // Mobile Menu Functions
    toggleMobileMenu() {
        this.state.isMenuOpen = !this.state.isMenuOpen;
        this.elements.mobileMenu.classList.toggle('hidden');
        this.elements.mobileMenuBtn.classList.toggle('active');
        this.elements.mobileMenuBtn.setAttribute('aria-expanded', this.state.isMenuOpen);
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = this.state.isMenuOpen ? 'hidden' : '';
    }

    closeMobileMenu() {
        this.state.isMenuOpen = false;
        this.elements.mobileMenu.classList.add('hidden');
        this.elements.mobileMenuBtn.classList.remove('active');
        this.elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    // Form Handling
    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.state.isSubmitting) return;

        try {
            this.state.isSubmitting = true;
            this.showLoadingState();

            // Validate form
            const formData = this.getFormData();
            const validation = this.validateForm(formData);
            
            if (!validation.isValid) {
                this.showError(validation.message);
                return;
            }

            // Submit form
            const response = await this.submitForm(formData);
            
            if (response.success) {
                this.showSuccess(response.message);
                this.resetForm();
                this.generateWhatsAppLink(formData);
            } else {
                this.showError(response.message);
            }

        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('Erro ao enviar solicitação. Tente novamente.');
        } finally {
            this.state.isSubmitting = false;
            this.hideLoadingState();
        }
    }

    getFormData() {
        return {
            nome: this.elements.nomeInput?.value.trim() || '',
            telefone: this.elements.telefoneInput?.value.trim() || '',
            servico: this.elements.servicoSelect?.value || ''
        };
    }

    validateForm(data) {
        // Nome validation
        if (!data.nome || data.nome.length < 2) {
            return { isValid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
        }

        // Telefone validation
        const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        if (!data.telefone || !telefoneRegex.test(data.telefone)) {
            return { isValid: false, message: 'Telefone deve estar no formato (11) 99999-9999' };
        }

        // Serviço validation
        if (!data.servico) {
            return { isValid: false, message: 'Selecione um serviço' };
        }

        return { isValid: true };
    }

    async submitForm(data) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    generateWhatsAppLink(data) {
        let mensagem = `Olá! Gostaria de agendar um serviço da Perfect Clean.%0A%0A`;
        mensagem += `*Nome:* ${data.nome}%0A`;
        mensagem += `*Telefone:* ${data.telefone}%0A`;
        mensagem += `*Serviço:* ${data.servico}%0A`;
        mensagem += `%0APor favor, me envie mais informações e um orçamento!`;
        
        const whatsappURL = `https://wa.me/5511999999999?text=${mensagem}`;
        
        // Delay para permitir que o usuário veja a mensagem de sucesso
        setTimeout(() => {
            window.open(whatsappURL, '_blank');
        }, 1500);
    }

    // Telefone formatting
    formatTelefone(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 11) {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 7) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{2})(\d{0,5})/, '($1) $2');
        }
        
        e.target.value = value;
    }

    validateTelefone(e) {
        const telefoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
        const isValid = telefoneRegex.test(e.target.value);
        
        e.target.classList.toggle('border-red-500', !isValid && e.target.value);
        e.target.classList.toggle('border-tiffany', isValid);
    }

    // Smooth scrolling
    handleSmoothScroll(e) {
        e.preventDefault();
        const target = document.querySelector(e.currentTarget.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (this.state.isMenuOpen) {
                this.closeMobileMenu();
            }
        }
    }

    // Event handlers
    handleOutsideClick(e) {
        if (this.state.isMenuOpen && 
            !this.elements.mobileMenuBtn.contains(e.target) && 
            !this.elements.mobileMenu.contains(e.target)) {
            this.closeMobileMenu();
        }
    }

    handleScroll() {
        // Throttle scroll events
        if (!this.scrollTimeout) {
            this.scrollTimeout = setTimeout(() => {
                this.updateActiveNavigation();
                this.scrollTimeout = null;
            }, 100);
        }
    }

    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth >= 768 && this.state.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    handleKeyboard(e) {
        // ESC key to close mobile menu
        if (e.key === 'Escape' && this.state.isMenuOpen) {
            this.closeMobileMenu();
        }
    }

    // Navigation active state
    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('text-navy');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('text-navy');
            }
        });
    }

    // Performance optimizations
    setupIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, options);

        document.querySelectorAll('section, .fade-in').forEach(el => {
            observer.observe(el);
        });
    }

    setupPrefetch() {
        // Prefetch critical resources
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = 'https://wa.me/5511999999999';
        document.head.appendChild(link);
    }

    setupLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupTouchOptimizations() {
        // Touch-friendly improvements
        const touchElements = document.querySelectorAll('button, .btn, a, .hover-lift');
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.style.opacity = '1';
            }, { passive: true });
        });
    }

    setupAccessibility() {
        // Accessibility improvements
        const focusableElements = document.querySelectorAll('button, input, select, textarea, a[href]');
        focusableElements.forEach(element => {
            element.addEventListener('focus', function() {
                this.classList.add('focus-visible');
            });
            
            element.addEventListener('blur', function() {
                this.classList.remove('focus-visible');
            });
        });
    }

    // UI State Management
    showLoadingState() {
        const submitBtn = this.elements.agendamentoForm?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="mr-2">⏳</span>Enviando...';
        }
    }

    hideLoadingState() {
        const submitBtn = this.elements.agendamentoForm?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fab fa-whatsapp mr-2"></i>Enviar via WhatsApp';
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="mr-2">${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    resetForm() {
        if (this.elements.agendamentoForm) {
            this.elements.agendamentoForm.reset();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PerfectCleanApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerfectCleanApp;
}