const CONFIG = {
  whatsapp: {
    number: '5582993368039',
    messages: {
      'geral': 'Olá! Gostaria de iniciar meu atendimento com você. Pode me ajudar?',
      'info-geral': 'Olá! Gostaria de saber mais sobre como a sua dieta prática pode me ajudar a alcançar meus objetivos de forma saudável.',
      'hipertrofia': 'Olá! Tenho interesse em uma dieta focada em hipertrofia. Pode me ajudar?',
      'saude-mulher': 'Olá! Quero saber mais sobre os cuidados nutricionais voltados para a saúde da mulher.',
      'nutricao-clinica': 'Olá! Tenho interesse em um acompanhamento de nutrição clínica. Você pode me passar mais informações?',
      'reeducacao-alimentar': 'Olá! Quero saber mais sobre o processo de reeducação alimentar com seu acompanhamento.',
      'emagrecimento': 'Olá! Estou buscando emagrecer de forma saudável e gostaria de sua ajuda.',
      'nutricao-esportiva': 'Olá! Pratico atividades físicas e quero saber mais sobre a nutrição esportiva.',
      'consultoria-online': 'Olá! Tenho interesse na sua consulta online. Pode me explicar como funciona?'
    }
  },
  preloader: {
    minLoadTime: 4000,
    updateInterval: 40
  },
  scrollReveal: {
    distance: '50px',
    duration: 3000,
    easing: 'ease',
    reset: true,
    viewFactor: 0.10
  }
};

const Utils = {
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email.trim());
  },
  validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
  },
  formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  },
  sanitizeForURL(str) {
    return encodeURIComponent(str.trim());
  },
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  log: {
    info: (message, data = null) => {
      console.log(`ℹ️ ${message}`, data || '');
    },
    warn: (message, data = null) => {
      console.warn(`⚠️ ${message}`, data || '');
    },
    error: (message, error = null) => {
      console.error(`❌ ${message}`, error || '');
    },
    success: (message, data = null) => {
      console.log(`✅ ${message}`, data || '');
    }
  }
};

class PreloaderManager {
  constructor() {
    this.preloader = document.getElementById('preloader');
    this.percentageElement = document.getElementById('preloader-percentage');
    this.progressBar = document.querySelector('.loading-bar-container');
    this.startTime = Date.now();
    this.currentPercentage = 0;
    this.intervalId = null;
    this.init();
  }
  init() {
    if (!this.preloader || !this.percentageElement) {
      Utils.log.warn('Preloader elements not found');
      return;
    }
    this.startProgress();
    this.setupEventListeners();
  }
  startProgress() {
    const {
      minLoadTime,
      updateInterval
    } = CONFIG.preloader;
    this.intervalId = setInterval(() => {
      if (this.currentPercentage < 100) {
        this.currentPercentage++;
        this.updatePercentage();
      } else {
        this.completeProgress();
      }
    }, updateInterval);
  }
  updatePercentage() {
    this.percentageElement.textContent = `${this.currentPercentage}%`;
    if (this.progressBar) {
      this.progressBar.setAttribute('aria-valuenow', this.currentPercentage);
    }
  }
  completeProgress() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  setupEventListeners() {
    window.addEventListener('load', () => {
      const endTime = Date.now();
      const loadTime = endTime - this.startTime;
      const {
        minLoadTime
      } = CONFIG.preloader;
      const delay = Math.max(0, minLoadTime - loadTime);
      setTimeout(() => {
        this.hide();
      }, delay);
    });
  }
  hide() {
    if (this.preloader) {
      this.preloader.classList.add('hidden');
      Utils.log.success('Preloader hidden successfully');
      setTimeout(() => {
        if (this.preloader && this.preloader.parentNode) {
          this.preloader.parentNode.removeChild(this.preloader);
        }
      }, 750);
    }
  }
}

class WhatsAppManager {
  constructor() {
    this.setupEventListeners();
  }
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const element = e.target.closest('[data-whats-action]');
      if (element) {
        e.preventDefault();
        const action = element.dataset.whatsAction;
        this.openWhatsApp(action);
      }
    });
  }
  openWhatsApp(action = 'geral', customData = null) {
    try {
      const {
        number,
        messages
      } = CONFIG.whatsapp;
      let message = messages[action] || messages.geral;
      if (customData) {
        message += `\n\n*Dados do contato:*\n`;
        message += `*Nome:* ${customData.nome.trim()}\n`;
        message += `*Email:* ${customData.email.trim()}\n`;
        message += `*Telefone:* ${customData.telefone.trim()}`;
      }
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        Utils.log.error('A abertura da nova aba foi bloqueada pelo navegador.');
      } else {
        Utils.log.success('WhatsApp opened successfully', {
          action,
          url
        });
      }
    } catch (error) {
      Utils.log.error('Error opening WhatsApp', error);
      window.open(`https://wa.me/${CONFIG.whatsapp.number}`, '_blank');
    }
  }
}

class FormManager {
  constructor(whatsAppManager) {
    this.whatsAppManager = whatsAppManager;
    this.form = document.getElementById('form-agendamento');
    this.submitBtn = document.getElementById('btn-enviar');
    this.btnText = this.submitBtn?.querySelector('.btn-text');
    this.btnLoader = this.submitBtn?.querySelector('.btn-loader');
    this.formStatus = document.getElementById('form-status');
    this.validators = {
      name: this.validateName.bind(this),
      email: this.validateEmail.bind(this),
      phone: this.validatePhone.bind(this)
    };
    this.init();
  }
  init() {
    if (!this.form) {
      Utils.log.warn('Form not found');
      return;
    }
    this.setupEventListeners();
    this.setupRealTimeValidation();
  }
  setupEventListeners() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    const phoneInput = document.getElementById('inputPhone');
    if (phoneInput) {
      phoneInput.addEventListener('input', this.formatPhoneInput.bind(this));
    }
  }
  setupRealTimeValidation() {
    const inputs = this.form.querySelectorAll('input[required]');
    inputs.forEach(input => {
      const debouncedValidate = Utils.debounce(() => {
        this.validateField(input);
      }, 500);
      input.addEventListener('input', debouncedValidate);
      input.addEventListener('blur', () => this.validateField(input));
    });
  }
  validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    const validator = this.validators[fieldName];
    if (!validator) return true;
    const validation = validator(value);
    this.showFieldError(input, validation.isValid ? null : validation.message);
    return validation.isValid;
  }
  validateName(name) {
    if (!name) {
      return {
        isValid: false,
        message: 'Nome é obrigatório'
      };
    }
    if (name.length < 2) {
      return {
        isValid: false,
        message: 'Nome deve ter pelo menos 2 caracteres'
      };
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
      return {
        isValid: false,
        message: 'Nome deve conter apenas letras'
      };
    }
    return {
      isValid: true
    };
  }
  validateEmail(email) {
    if (!email) {
      return {
        isValid: false,
        message: 'Email é obrigatório'
      };
    }
    if (!Utils.validateEmail(email)) {
      return {
        isValid: false,
        message: 'Digite um email válido'
      };
    }
    return {
      isValid: true
    };
  }
  validatePhone(phone) {
    if (!phone) {
      return {
        isValid: false,
        message: 'Telefone é obrigatório'
      };
    }
    if (!Utils.validatePhone(phone)) {
      return {
        isValid: false,
        message: 'Digite um telefone válido (10-11 dígitos)'
      };
    }
    return {
      isValid: true
    };
  }
  showFieldError(input, message) {
    const errorElement = document.getElementById(`${input.name}-error`);
    if (message) {
      input.classList.add('error');
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    } else {
      input.classList.remove('error');
      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }
  }
  formatPhoneInput(e) {
    const input = e.target;
    const value = input.value.replace(/\D/g, '');
    if (value.length <= 11) {
      input.value = Utils.formatPhone(value);
    }
  }
  async handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.form);
    const data = {
      nome: formData.get('name').trim(),
      email: formData.get('email').trim(),
      telefone: formData.get('phone').trim()
    };
    const isValid = this.validateForm(data);
    if (!isValid) {
      this.showFormStatus('Por favor, corrija os erros acima.', 'error');
      return;
    }
    try {
      await this.submitForm(data);
    } catch (error) {
      Utils.log.error('Form submission error', error);
      this.showFormStatus('Erro ao enviar. Tente novamente.', 'error');
      this.resetSubmitButton();
    }
  }
  validateForm(data) {
    let isValid = true;
    Object.keys(this.validators).forEach(fieldName => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const fieldIsValid = this.validateField(input);
      if (!fieldIsValid) isValid = false;
    });
    return isValid;
  }
  async submitForm(data) {
    this.setSubmittingState();
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.whatsAppManager.openWhatsApp('geral', data);
    this.setSuccessState();
    setTimeout(() => {
      this.resetForm();
    }, 4000);
  }
  setSubmittingState() {
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.btnText.style.display = 'none';
      this.btnLoader.style.display = 'inline-block';
    }
    this.showFormStatus('Enviando...', 'info');
  }
  setSuccessState() {
    if (this.submitBtn) {
      this.btnText.textContent = 'Enviado com sucesso!';
      this.btnText.style.display = 'inline-block';
      this.btnLoader.style.display = 'none';
    }
    this.showFormStatus('Redirecionando para o WhatsApp...', 'success');
  }
  resetForm() {
    this.form.reset();
    this.resetSubmitButton();
    this.clearAllErrors();
    this.showFormStatus('', '');
  }
  resetSubmitButton() {
    if (this.submitBtn) {
      this.submitBtn.disabled = false;
      this.btnText.textContent = 'Enviar';
      this.btnText.style.display = 'inline-block';
      this.btnLoader.style.display = 'none';
    }
  }
  clearAllErrors() {
    const errorElements = this.form.querySelectorAll('.error-message');
    const inputElements = this.form.querySelectorAll('input.error');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    inputElements.forEach(el => {
      el.classList.remove('error');
    });
  }
  showFormStatus(message, type) {
    if (this.formStatus) {
      this.formStatus.textContent = message;
      this.formStatus.className = `form-status ${type}`;
    }
  }
}

class MobileMenuManager {
  constructor() {
    this.hamburgerBtn = document.getElementById('hamburger-btn');
    this.navWrapper = document.querySelector('.nav-wrapper');
    this.navLinks = document.querySelectorAll('.nav-wrapper a');
    this.isOpen = false;
    this.init();
  }
  init() {
    if (!this.hamburgerBtn || !this.navWrapper) {
      Utils.log.warn('Mobile menu elements not found');
      return;
    }
    this.setupEventListeners();
  }
  setupEventListeners() {
    this.hamburgerBtn.addEventListener('click', this.toggleMenu.bind(this));
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
      }
    });
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.navWrapper.contains(e.target) && !this.hamburgerBtn.contains(e.target)) {
        this.closeMenu();
      }
    });
  }
  toggleMenu() {
    this.isOpen ? this.closeMenu() : this.openMenu();
  }
  openMenu() {
    this.isOpen = true;
    this.navWrapper.classList.add('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'true');
    const icon = this.hamburgerBtn.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    }
    document.body.classList.add('menu-open');
    Utils.log.info('Mobile menu opened');
  }
  closeMenu() {
    this.isOpen = false;
    this.navWrapper.classList.remove('active');
    this.hamburgerBtn.setAttribute('aria-expanded', 'false');
    const icon = this.hamburgerBtn.querySelector('i');
    if (icon) {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
    document.body.classList.remove('menu-open');
    Utils.log.info('Mobile menu closed');
  }
}

class ScrollRevealManager {
  constructor() {
    this.isLoaded = false;
    this.init();
  }
  init() {    
    window.addEventListener('load', () => {
      this.loadScrollReveal()
        .then(() => {
          this.setupAnimations();
          Utils.log.success('ScrollReveal configured after full page load');
        })
        .catch((error) => {
          Utils.log.error('ScrollReveal failed to load', error);
          this.fallbackAnimations();
        });
    });
  }
  loadScrollReveal() {
    return new Promise((resolve, reject) => {
      if (window.ScrollReveal) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = "https://unpkg.com/scrollreveal@4.0.9/dist/scrollreveal.min.js";
      script.async = true;
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      script.onerror = () => {
        reject(new Error('Failed to load ScrollReveal'));
      };
      document.head.appendChild(script);
      setTimeout(() => {
        if (!this.isLoaded) {
          reject(new Error('ScrollReveal load timeout'));
        }
      }, 5000);
    });
  }
  setupAnimations() {
    if (!window.ScrollReveal) return;
    const {
      distance,
      duration,
      easing,
      reset,
      viewFactor
    } = CONFIG.scrollReveal;
    const configBase = {
      distance, duration, easing, reset, viewFactor
    };

    const sectionTitles = '.motivacao h2, .sobre h2, .servicos h2, .depoimentos h2, .receitas h2, .agendamento h2';

    const animationConfigs = [{
      selector: '.inicio > div',
      options: { origin: 'left', interval: 500, distance: '70px', scale: 0.9, opacity: 0 }
    }, {
      selector: '.motivacao-card',
      options: { origin: 'bottom', interval: 150, distance: '40px' }
    }, {
      selector: sectionTitles,
      options: { origin: 'top', distance: '30px', opacity: 0, scale: 0.95, duration: 2500 }
    }, {
      selector: '.motivacao-button',
      options: { origin: 'bottom', distance: '40px', delay: 300 }
    }, {
      selector: '.sobre-conteudo > *',
      options: { origin: 'bottom', rotate: { x: 0, y: 80, z: 0 }, interval: 500, opacity: 0 }
    }, {
      selector: '.quem-sou-eu-ster',
      options: { origin: 'bottom', opacity: 0, delay: 200 }
    }, {
      selector: '.servico-card',
      options: { origin: 'right', interval: 200 }
    }, {
      selector: '.depoimento-card',
      options: { origin: 'bottom', interval: 200 }
    }, {
      selector: '.receita-card',
      options: { origin: 'top', distance: '70px', interval: 200 }
    }, {
      selector: '.agendamento form > *',
      options: { origin: 'left', interval: 200 }
    },];

    animationConfigs.forEach(({
      selector,
      options
    }) => {
      ScrollReveal().reveal(selector, {
        ...configBase,
        ...options
      });
    });
  }
  fallbackAnimations() {
    Utils.log.info('Using fallback animations');
    const style = document.createElement('style');
    style.textContent = `
    .fade-in-up {
      animation: fadeInUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(30px);
    }
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    `;
    document.head.appendChild(style);
    this.setupIntersectionObserver();
  }
  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    const elements = document.querySelectorAll('.servico-card, .depoimento-card, .receita-card, .sobre-conteudo > *, .quem-sou-eu-ster');
    elements.forEach(el => observer.observe(el));
  }
}

class PerformanceManager {
  constructor() {
    this.init();
  }
  init() {
    this.optimizeImages();
    this.setupLazyLoading();
    this.monitorPerformance();
  }
  optimizeImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
      Utils.log.success('Native lazy loading supported');
    } else {
      Utils.log.info('Implementing fallback lazy loading');
      this.implementLazyLoadingFallback(images);
    }
  }
  implementLazyLoadingFallback(images) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    images.forEach(img => {
      imageObserver.observe(img);
    });
  }
  setupLazyLoading() {
    const heavyElements = document.querySelectorAll('.servicos-grid, .receitas-grid');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('loaded');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });
    heavyElements.forEach(el => observer.observe(el));
  }
  monitorPerformance() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          Utils.log.info('Page load time', `${Math.round(perfData.loadEventEnd - perfData.loadEventStart)}ms`);
        }
      });
    }
  }
}

class App {
  constructor() {
    this.managers = {};
    this.init();
  }
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initializeManagers.bind(this));
    } else {
      this.initializeManagers();
    }
  }
  initializeManagers() {
    try {
      this.managers.preloader = new PreloaderManager();
      this.managers.whatsapp = new WhatsAppManager();
      this.managers.form = new FormManager(this.managers.whatsapp);
      this.managers.mobileMenu = new MobileMenuManager();
      this.managers.scrollReveal = new ScrollRevealManager();
      this.managers.performance = new PerformanceManager();
      Utils.log.success('All managers initialized successfully');
      this.setupErrorHandling();
    } catch (error) {
      Utils.log.error('Error initializing app', error);
    }
  }
  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      Utils.log.error('Global error caught', {
        message: e.message,
        filename: e.filename,
        line: e.lineno
      });
    });
    window.addEventListener('unhandledrejection', (e) => {
      Utils.log.error('Unhandled promise rejection', e.reason);
    });
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href^="#"]');
  if (link && link.getAttribute('href') !== '#') {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const targetPosition = targetElement.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
      Utils.log.info('Smooth scroll to', targetId);
    }
  }
});

const handleResize = Utils.debounce(() => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}, 250);

window.addEventListener('resize', handleResize);
const app = new App();

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'k':
        e.preventDefault();
        document.getElementById('inputName')?.focus();
        break;
    }
  }
  if (e.key === 'Tab') {
    const mobileMenu = app.managers.mobileMenu;
    if (mobileMenu && mobileMenu.isOpen) {
      const focusableElements = mobileMenu.navWrapper.querySelectorAll('a, button');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
});