/**
 * Emechi Consultants Landing Page - Interactive JavaScript Features
 * Handles navigation, mobile menu, form validation, and lazy loading
 */

(function() {
    'use strict';

    // Utility: Log with context
    function log(level, message, context = {}) {
        if (typeof console !== 'undefined' && console[level]) {
            console[level](`[EmechiConsultants] ${message}`, context);
        }
    }

    // Utility: Query selector with error handling
    function qs(selector, context = document) {
        try {
            return context.querySelector(selector);
        } catch (error) {
            log('error', `Invalid selector: ${selector}`, { error });
            return null;
        }
    }

    // Utility: Query selector all with error handling
    function qsa(selector, context = document) {
        try {
            return Array.from(context.querySelectorAll(selector));
        } catch (error) {
            log('error', `Invalid selector: ${selector}`, { error });
            return [];
        }
    }

    /**
     * Smooth Scrolling Navigation
     * Handles anchor link clicks with smooth scrolling behavior
     */
    function initSmoothScrolling() {
        const anchorLinks = qsa('a[href^="#"]');

        if (anchorLinks.length === 0) {
            log('warn', 'No anchor links found for smooth scrolling');
            return;
        }

        anchorLinks.forEach(function(link) {
            link.addEventListener('click', function(event) {
                const href = link.getAttribute('href');

                // Skip if href is just "#"
                if (!href || href === '#') {
                    return;
                }

                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    event.preventDefault();

                    const headerHeight = getHeaderHeight();
                    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    try {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Update focus for accessibility
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();

                        log('info', `Scrolled to section: ${targetId}`);
                    } catch (error) {
                        // Fallback for browsers without smooth scroll support
                        window.scrollTo(0, targetPosition);
                        log('warn', 'Smooth scroll not supported, using fallback', { error });
                    }
                } else {
                    log('warn', `Target element not found: ${targetId}`);
                }
            });
        });

        log('info', `Smooth scrolling initialized for ${anchorLinks.length} links`);
    }

    /**
     * Get header height for scroll offset calculation
     */
    function getHeaderHeight() {
        const header = qs('.header');
        return header ? header.offsetHeight : 0;
    }

    /**
     * Mobile Hamburger Menu
     * Toggles mobile navigation menu
     */
    function initMobileMenu() {
        const menuButton = qs('.mobile-menu-button');
        const navMenu = qs('.nav-menu');

        if (!menuButton) {
            log('info', 'No mobile menu button found, creating one');
            createMobileMenuButton();
            return;
        }

        if (!navMenu) {
            log('error', 'Navigation menu not found');
            return;
        }

        // Set initial ARIA attributes
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-controls', 'nav-menu');
        navMenu.setAttribute('id', 'nav-menu');

        menuButton.addEventListener('click', function() {
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;

            menuButton.setAttribute('aria-expanded', newState.toString());
            navMenu.classList.toggle('nav-menu--open', newState);
            document.body.classList.toggle('menu-open', newState);

            log('info', `Mobile menu ${newState ? 'opened' : 'closed'}`);
        });

        // Close menu when clicking nav links
        const navLinks = qsa('.nav-menu__link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                menuButton.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav-menu--open');
                document.body.classList.remove('menu-open');
            });
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
                menuButton.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('nav-menu--open');
                document.body.classList.remove('menu-open');
                menuButton.focus();
            }
        });

        log('info', 'Mobile menu initialized');
    }

    /**
     * Create mobile menu button if it doesn't exist
     */
    function createMobileMenuButton() {
        const navContainer = qs('.nav-container');
        const navMenu = qs('.nav-menu');

        if (!navContainer || !navMenu) {
            log('error', 'Cannot create mobile menu button: nav container or menu not found');
            return;
        }

        const button = document.createElement('button');
        button.className = 'mobile-menu-button';
        button.setAttribute('type', 'button');
        button.setAttribute('aria-label', 'Toggle navigation menu');
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', 'nav-menu');

        // Create hamburger icon
        button.innerHTML = '<span class="hamburger-icon"><span></span><span></span><span></span></span>';

        navContainer.appendChild(button);
        navMenu.setAttribute('id', 'nav-menu');

        // Reinitialize mobile menu functionality
        initMobileMenu();
    }

    /**
     * Contact Form Validation
     * Validates form inputs using HTML5 validation API with custom messages
     */
    function initFormValidation() {
        const form = qs('.contact-form');

        if (!form) {
            log('warn', 'Contact form not found');
            return;
        }

        const nameInput = qs('#name', form);
        const emailInput = qs('#email', form);
        const messageInput = qs('#message', form);

        // Custom validation messages
        const validationMessages = {
            valueMissing: 'This field is required.',
            typeMismatch: 'Please enter a valid format.',
            tooShort: 'Please enter at least {minLength} characters.',
            tooLong: 'Please enter no more than {maxLength} characters.',
            patternMismatch: 'Please match the requested format.'
        };

        // Set custom validation messages
        function setCustomValidity(input) {
            if (!input) return;

            input.addEventListener('invalid', function(event) {
                event.preventDefault();

                const validity = input.validity;
                let message = '';

                if (validity.valueMissing) {
                    message = validationMessages.valueMissing;
                } else if (validity.typeMismatch) {
                    if (input.type === 'email') {
                        message = 'Please enter a valid email address.';
                    } else {
                        message = validationMessages.typeMismatch;
                    }
                } else if (validity.tooShort) {
                    message = validationMessages.tooShort.replace('{minLength}', input.minLength);
                } else if (validity.tooLong) {
                    message = validationMessages.tooLong.replace('{maxLength}', input.maxLength);
                } else if (validity.patternMismatch) {
                    message = validationMessages.patternMismatch;
                }

                input.setCustomValidity(message);
                showFieldError(input, message);
            });

            // Clear custom validity on input
            input.addEventListener('input', function() {
                input.setCustomValidity('');
                clearFieldError(input);
            });
        }

        // Show field-level error message
        function showFieldError(input, message) {
            clearFieldError(input);

            const errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            errorElement.setAttribute('role', 'alert');
            errorElement.textContent = message;

            const formGroup = input.closest('.contact-form__group');
            if (formGroup) {
                formGroup.appendChild(errorElement);
                input.classList.add('input-error');
            }
        }

        // Clear field-level error message
        function clearFieldError(input) {
            const formGroup = input.closest('.contact-form__group');
            if (formGroup) {
                const existingError = qs('.field-error', formGroup);
                if (existingError) {
                    existingError.remove();
                }
                input.classList.remove('input-error');
            }
        }

        // Apply validation to required fields
        if (nameInput) setCustomValidity(nameInput);
        if (emailInput) setCustomValidity(emailInput);
        if (messageInput) setCustomValidity(messageInput);

        // Handle form submission
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Validate all inputs
            const isValid = form.checkValidity();

            if (!isValid) {
                log('warn', 'Form validation failed');

                // Focus on first invalid field
                const firstInvalid = qs(':invalid', form);
                if (firstInvalid) {
                    firstInvalid.focus();
                }
                return;
            }

            handleFormSubmission(form);
        });

        log('info', 'Form validation initialized');
    }

    /**
     * Handle form submission with Formspree integration
     */
    function handleFormSubmission(form) {
        const submitButton = qs('.contact-form__submit', form);
        const originalButtonText = submitButton ? submitButton.textContent : '';

        // Disable submit button and show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';
        }

        const formData = new FormData(form);
        const formAction = form.getAttribute('action');

        // Check if form action is configured
        if (!formAction || formAction.includes('{form_id}')) {
            log('error', 'Form action not configured properly');
            showMessage('error', 'Form configuration error. Please contact us directly via email.');

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
            return;
        }

        // Submit form using Fetch API
        fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(function(response) {
            if (response.ok) {
                log('info', 'Form submitted successfully');
                showMessage('success', 'Thank you for your message! We\'ll get back to you within 24 hours.');
                form.reset();
            } else {
                return response.json().then(function(data) {
                    throw new Error(data.error || 'Form submission failed');
                });
            }
        })
        .catch(function(error) {
            log('error', 'Form submission error', { error: error.message });
            showMessage('error', 'Sorry, there was an error sending your message. Please try again or contact us directly via email.');
        })
        .finally(function() {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    /**
     * Show success/error message
     */
    function showMessage(type, message) {
        const form = qs('.contact-form');
        if (!form) return;

        // Remove existing messages
        const existingMessage = qs('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message form-message--${type}`;
        messageElement.setAttribute('role', type === 'error' ? 'alert' : 'status');
        messageElement.textContent = message;

        form.insertAdjacentElement('beforebegin', messageElement);

        // Scroll to message
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Auto-remove success messages after 10 seconds
        if (type === 'success') {
            setTimeout(function() {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 10000);
        }
    }

    /**
     * Image Lazy Loading using Intersection Observer API
     */
    function initLazyLoading() {
        // Check for native lazy loading support
        if ('loading' in HTMLImageElement.prototype) {
            log('info', 'Native lazy loading supported, using loading="lazy" attribute');

            // For images without loading attribute, add it
            const images = qsa('img:not([loading])');
            images.forEach(function(img) {
                img.setAttribute('loading', 'lazy');
            });

            return;
        }

        // Fallback: Use Intersection Observer for lazy loading
        if (!('IntersectionObserver' in window)) {
            log('warn', 'Intersection Observer not supported, loading all images immediately');
            loadAllImages();
            return;
        }

        const lazyImages = qsa('img[data-src]');

        if (lazyImages.length === 0) {
            log('info', 'No images with data-src attribute found for lazy loading');
            return;
        }

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');

                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('lazy-loaded');

                        log('info', `Lazy loaded image: ${src}`);
                    }

                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });

        log('info', `Lazy loading initialized for ${lazyImages.length} images`);
    }

    /**
     * Load all images immediately (fallback)
     */
    function loadAllImages() {
        const lazyImages = qsa('img[data-src]');
        lazyImages.forEach(function(img) {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.removeAttribute('data-src');
            }
        });
    }

    /**
     * Keyboard Navigation Support
     * Enhances accessibility with keyboard navigation
     */
    function initKeyboardNavigation() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to main content';
        skipLink.addEventListener('click', function(event) {
            event.preventDefault();
            const main = qs('main');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
                window.scrollTo(0, main.offsetTop);
            }
        });

        document.body.insertAdjacentElement('afterbegin', skipLink);

        // Focus trap for mobile menu when open
        document.addEventListener('keydown', function(event) {
            const menuButton = qs('.mobile-menu-button');
            const navMenu = qs('.nav-menu');

            if (!menuButton || !navMenu) return;

            const isMenuOpen = menuButton.getAttribute('aria-expanded') === 'true';

            if (isMenuOpen && event.key === 'Tab') {
                const focusableElements = qsa('a, button, input, select, textarea', navMenu);
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                } else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });

        log('info', 'Keyboard navigation initialized');
    }

    /**
     * Progressive Enhancement Check
     * Adds class to indicate JavaScript is available
     */
    function initProgressiveEnhancement() {
        document.documentElement.classList.add('js-enabled');
        document.documentElement.classList.remove('no-js');
        log('info', 'JavaScript enabled class added');
    }

    /**
     * Initialize all features
     */
    function init() {
        log('info', 'Initializing Emechi Consultants landing page features');

        try {
            initProgressiveEnhancement();
            initSmoothScrolling();
            initMobileMenu();
            initFormValidation();
            initLazyLoading();
            initKeyboardNavigation();

            log('info', 'All features initialized successfully');
        } catch (error) {
            log('error', 'Error during initialization', { error: error.message, stack: error.stack });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
