/* ==========================================================================
   Funcionalidades de UI y Scroll
   ========================================================================== */

// Scroll Progress Handler
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    const progressBar = document.getElementById("scroll-progress");
    if (progressBar) {
        progressBar.style.width = scrolled + "%";
    }
});

// Form Field Focus Handler
const inputs = document.querySelectorAll('input, textarea, select');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        if(input.parentElement) input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
        if(input.parentElement) input.parentElement.classList.remove('focused');
    });
});

// Dynamic Navbar Link Highlighting
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 120) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.classList.remove('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
            link.classList.add('text-[#c4c7c7]');
            if (current && href.includes(current)) {
                link.classList.add('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
                link.classList.remove('text-[#c4c7c7]');
            }
        }
    });
});

/* ==========================================================================
   Motor de Estela de Huellas (HTML5 Canvas 60 FPS)
   ========================================================================== */
(function () {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'footprint-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const footprintPath = new Path2D(
        'M12 2C10.34 2 9 3.34 9 5c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.66-1.34-3-3-3zm-5 3c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-8.5 5C6.12 10 4 12.12 4 14.5 4 17.5 7 22 12 22s8-4.5 8-7.5C20 12.12 17.88 10 15.5 10c-1.2 0-2.28.48-3.08 1.26-.14.14-.32.24-.52.24s-.38-.1-.52-.24C10.78 10.48 9.7 10 8.5 10z'
    );

    const footprints = [];
    let lastX = 0;
    let lastY = 0;
    let stepToggle = false;

    window.addEventListener('mousemove', (e) => {
        const elem = document.elementFromPoint(e.clientX, e.clientY);
        const isHoveringTarget = !!(elem && elem.closest('.footprint-target'));

        if (!isHoveringTarget) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 24) {
            const angle = Math.atan2(dy, dx) + Math.PI / 2;
            stepToggle = !stepToggle;
            
            footprints.push({
                x: e.clientX,
                y: e.clientY,
                angle: angle,
                side: stepToggle ? 1 : -1,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.005
            });

            lastX = e.clientX;
            lastY = e.clientY;
        }
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = footprints.length - 1; i >= 0; i--) {
            const fp = footprints[i];
            fp.life -= fp.decay;

            if (fp.life <= 0) {
                footprints.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(fp.x, fp.y);
            ctx.rotate(fp.angle);
            ctx.translate(fp.side * 6, 0);
            ctx.scale(0.7, 0.7);

            ctx.fillStyle = `rgba(238, 193, 75, ${fp.life * 0.85})`;
            ctx.shadowColor = 'rgba(238, 193, 75, 0.4)';
            ctx.shadowBlur = 6;

            ctx.fill(footprintPath);
            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();


/* ==========================================================================
   ANEXAR AL FINAL DE script.js - Motor de Estela de Cursor (60 FPS Canvas)
   ========================================================================== */

(function initInteractiveCursorTrail() {
    // Responsividad: Desactivar en dispositivos táctiles (pointer: coarse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Crear dinámicamente el Canvas Overlay
    const canvas = document.createElement('canvas');
    canvas.id = 'trail-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Ajustar resolución en cambio de tamaño de ventana
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    let mouse = { x: -100, y: -100, isHoveringTarget: false };

    // Detección de posición y targets con clase .trail-target
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        const elem = document.elementFromPoint(e.clientX, e.clientY);
        mouse.isHoveringTarget = !!(elem && elem.closest('.trail-target'));

        // Generar partícula en la estela si estamos sobre la frase objetivo
        if (mouse.isHoveringTarget) {
            particles.push({
                x: e.clientX,
                y: e.clientY,
                radius: 12 + Math.random() * 4,
                life: 1.0,
                // Decaimiento progresivo calculado para durar entre 1s y 1.5s a 60FPS
                decay: 0.012 + Math.random() * 0.005 
            });
        }
    });

    // Bucle principal de animación a 60 FPS con requestAnimationFrame
    function render() {
        ctx.clearRect(0, 0, width, height);

        // 1. Dibujar Estela Secuencial
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);

            // Fondo negro con opacidad progresiva
            ctx.fillStyle = `rgba(13, 13, 13, ${p.life * 0.85})`;
            
            // Borde y Resplandor Glow con la paleta de la marca Rasgos (#eec14b)
            ctx.strokeStyle = `rgba(238, 193, 75, ${p.life * 0.9})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(238, 193, 75, 0.6)';
            ctx.shadowBlur = 10 * p.life;

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        // 2. Dibujar Cursor Circular Principal sobre la frase objetivo
        if (mouse.isHoveringTarget) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
            
            ctx.fillStyle = 'rgba(13, 13, 13, 0.9)';
            ctx.strokeStyle = '#eec14b';
            ctx.lineWidth = 2;
            
            // Glow radiante
            ctx.shadowColor = 'rgba(238, 193, 75, 0.8)';
            ctx.shadowBlur = 14;

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();



/* ==========================================================================
   ANEXAR AL FINAL DE script.js - Modales y Estela del Logo Rasgos
   ========================================================================== */

// --- 1. Lógica Interactiva de Modales ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Bloquear scroll del fondo
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restablecer scroll
    }
}

// Cerrar al presionar la tecla ESC o clic en el backdrop
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal-backdrop.active');
        if (activeModal) closeModal(activeModal.id);
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
        closeModal(e.target.id);
    }
});


// --- 2. Motor de Estela Canvas con la Imagen del Logo RASGOS ---
(function initLogoTrailCanvas() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Crear el Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'logo-trail-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Carga de la Imagen del Logo de RASGOS
    const logoImg = new Image();
    logoImg.src = '../Mi_Proyecto Karen/imagenes/logo.png';

    const particles = [];
    let mouse = { x: -100, y: -100, isHoveringTarget: false };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        const elem = document.elementFromPoint(e.clientX, e.clientY);
        mouse.isHoveringTarget = !!(elem && elem.closest('.trail-logo-target'));

        if (mouse.isHoveringTarget) {
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: 28 + Math.random() * 8,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.005
            });
        }
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Renderizado de partículas con el logo
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life * 0.85;
            
            // Efecto Glow dorado alrededor de la imagen
            ctx.shadowColor = 'rgba(238, 193, 75, 0.8)';
            ctx.shadowBlur = 12 * p.life;

            const currentSize = p.size * p.life;
            if (logoImg.complete && logoImg.naturalWidth !== 0) {
                ctx.drawImage(
                    logoImg,
                    p.x - currentSize / 2,
                    p.y - currentSize / 2,
                    currentSize,
                    currentSize
                );
            }
            ctx.restore();
        }

        // Puntero interactivo sobre la frase
        if (mouse.isHoveringTarget && logoImg.complete && logoImg.naturalWidth !== 0) {
            ctx.save();
            ctx.globalAlpha = 1.0;
            ctx.shadowColor = 'rgba(238, 193, 75, 0.9)';
            ctx.shadowBlur = 16;
            ctx.drawImage(logoImg, mouse.x - 18, mouse.y - 18, 36, 36);
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();


/* --- NUEVO: Modales y Estela --- */

(function initLogoTrailCanvas() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Crear dinámicamente el Canvas Overlay si no existe
    let canvas = document.getElementById('logo-trail-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'logo-trail-canvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Cargar la imagen del logo desde la ruta relativa unificada del proyecto
    const logoImg = new Image();
    logoImg.src = '../Mi_Proyecto Karen/imagenes/logo.png';

    const particles = [];
    let mouse = { x: -100, y: -100, isHoveringTarget: false };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        const elem = document.elementFromPoint(e.clientX, e.clientY);
        mouse.isHoveringTarget = !!(elem && elem.closest('.trail-logo-target'));

        if (mouse.isHoveringTarget) {
            particles.push({
                x: e.clientX,
                y: e.clientY,
                size: 28 + Math.random() * 8,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.005
            });
        }
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

        // Renderizar cada partícula de la estela
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life * 0.85;
            
            // Resplandor dorado (#eec14b)
            ctx.shadowColor = 'rgba(238, 193, 75, 0.8)';
            ctx.shadowBlur = 12 * p.life;

            const currentSize = p.size * p.life;
            if (logoImg.complete && logoImg.naturalWidth !== 0) {
                ctx.drawImage(
                    logoImg,
                    p.x - currentSize / 2,
                    p.y - currentSize / 2,
                    currentSize,
                    currentSize
                );
            }
            ctx.restore();
        }

        // Dibujar el cursor activo con el logo en la posición del mouse
        if (mouse.isHoveringTarget && logoImg.complete && logoImg.naturalWidth !== 0) {
            ctx.save();
            ctx.globalAlpha = 1.0;
            ctx.shadowColor = 'rgba(238, 193, 75, 0.9)';
            ctx.shadowBlur = 16;
            ctx.drawImage(logoImg, mouse.x - 18, mouse.y - 18, 36, 36);
            ctx.restore();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
})();


// ==========================================================================
// === LÓGICA DE AUTENTICACIÓN Y MANEJO DE SESIÓN DE USUARIOS ===
// ==========================================================================

(function initAuthModule() {
    // 1. Usuarios simulados (Mock Data)
    const MOCK_USERS = [
        { email: 'admin@rasgos.com', pin: '1234' },
        { email: 'karen@rasgos.com', pin: '2024' },
        { email: 'cliente@rasgos.com', pin: '0000' }
    ];

    const STORAGE_KEY = 'rasgos_active_session';

    // Helper: Obtener usuario autenticado
    function getActiveSession() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

    // --- A. Redirección global de botones "Iniciar Sesión" existentes ---
    const loginNavButtons = document.querySelectorAll('a[href="contacto.html"], button');
    loginNavButtons.forEach(btn => {
        if (btn.textContent.trim().toLowerCase().includes('iniciar sesión')) {
            if (btn.tagName === 'A') {
                btn.setAttribute('href', 'login.html');
            } else if (btn.tagName === 'BUTTON') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'login.html';
                });
            }
        }
    });

    // --- B. Lógica en login.html ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Redirigir a usuarios.html si ya inició sesión
        if (getActiveSession()) {
            window.location.href = 'usuarios.html';
            return;
        }

        const emailInput = document.getElementById('email');
        const pinInput = document.getElementById('pin');
        const errorBox = document.getElementById('login-error');

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailVal = emailInput.value.trim().toLowerCase();
            const pinVal = pinInput.value.trim();

            const matchedUser = MOCK_USERS.find(
                user => user.email.toLowerCase() === emailVal && user.pin === pinVal
            );

            if (matchedUser) {
                // Guardar sesión y redirigir
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    email: matchedUser.email,
                    loginTime: new Date().toISOString()
                }));
                window.location.href = 'usuarios.html';
            } else {
                // Mostrar error visual
                errorBox.classList.remove('hidden');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
            }
        });
    }

    // --- C. Lógica en usuarios.html (Vista Privada) ---
    const userDisplay = document.getElementById('user-display-email');
    if (userDisplay) {
        const session = getActiveSession();

        // Guardián de navegación: Control de Acceso
        if (!session) {
            window.location.href = 'login.html';
            return;
        }

        // Renderizar email del usuario autenticado
        userDisplay.textContent = session.email;

        // Botón de Cerrar Sesión
        const logoutBtn = document.getElementById('btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.href = 'login.html';
            });
        }
    }
})();

/* ==========================================================================
   INTERACCIÓN HOVER DE VIDEO (caminito1)
   ========================================================================== */

const miVideo = document.getElementById('miVideo');

if (miVideo) {
    miVideo.addEventListener('mouseenter', () => {
        miVideo.play().catch(error => {
            console.log("Error al reproducir el video:", error);
        });
    });

    miVideo.addEventListener('mouseleave', () => {
        miVideo.pause();
        miVideo.currentTime = 0;
    });
}

/* ==========================================================================
   Transición de Video a Imagen Externa en el Logo del Menú
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const logoVideo = document.getElementById("logo-video");
    const logoImg = document.getElementById("logo-img");

    if (logoVideo && logoImg) {
        // Asegurarse de que el video comience a reproducirse
        logoVideo.play().catch(error => {
            console.log("El navegador restringió la reproducción automática del video del logo:", error);
        });

        // Cuando el video finaliza su reproducción
        logoVideo.addEventListener("ended", function() {
            // Oculta completamente el video
            logoVideo.classList.add("hidden");
            // Muestra la imagen externa del logo
            logoImg.classList.remove("hidden");
        });
    }
});

/* ==========================================================================
   Modal Emergente de Archivos de Marca (Brief y Manual de Identidad)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const btnArchivos = document.getElementById("btn-archivos");
    const modalArchivos = document.getElementById("modal-archivos");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");

    if (btnArchivos && modalArchivos) {
        // Abrir modal
        btnArchivos.addEventListener("click", function(e) {
            e.preventDefault();
            modalArchivos.classList.remove("hidden");
        });

        // Cerrar modal al presionar la 'X'
        if (btnCerrarModal) {
            btnCerrarModal.addEventListener("click", function() {
                modalArchivos.classList.add("hidden");
            });
        }

        // Cerrar modal al hacer clic fuera del contenido
        modalArchivos.addEventListener("click", function(e) {
            if (e.target === modalArchivos) {
                modalArchivos.classList.add("hidden");
            }
        });
    }
});



/* ==========================================================================
   Modal Emergente de Servicios (Post Publicitario, Logo y Video)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const btnExplorar = document.getElementById("btn-explorar-servicios");
    const modalServicios = document.getElementById("modal-servicios");
    const btnCerrarServicios = document.getElementById("btn-cerrar-servicios");

    if (btnExplorar && modalServicios) {
        // Abrir ventana al hacer clic en Explorar Servicios
        btnExplorar.addEventListener("click", function(e) {
            e.preventDefault();
            modalServicios.classList.remove("hidden");
        });

        // Cerrar al hacer clic en la equis
        if (btnCerrarServicios) {
            btnCerrarServicios.addEventListener("click", function() {
                modalServicios.classList.add("hidden");
            });
        }

        // Cerrar al hacer clic en el fondo oscuro
        modalServicios.addEventListener("click", function(e) {
            if (e.target === modalServicios) {
                modalServicios.classList.add("hidden");
            }
        });
    }
});

/* ==========================================================================
   Control Dinámico de Enlace Activo, Línea Dorada y Menú Celular
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    // 1. Lógica de la Línea Dorada y Enlace Activo
    let currentPage = window.location.pathname.split("/").pop();
    
    if (!currentPage || currentPage === "" || currentPage === "index.html") {
        currentPage = "inicio.html";
    }

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        // Limpiamos estilos previos
        link.classList.remove('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
        link.classList.add('text-[#c4c7c7]');

        // Activamos la página actual con texto dorado y la línea inferior
        if (linkHref === currentPage) {
            link.classList.remove('text-[#c4c7c7]');
            link.classList.add('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
        } else {
            link.classList.add('hover:text-[#eec14b]');
        }
    });

    // 2. Lógica del Menú Desplegable para Celulares (Hamburguesa)
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            
            if (mobileMenu.classList.contains("hidden")) {
                menuIcon.textContent = "menu";
            } else {
                menuIcon.textContent = "close";
            }
        });
    }
});

/const translations = {
    es: {
        // Navegación común
        "nav-inicio": "Inicio",
        "nav-quienes": "Quiénes Somos",
        "nav-servicios": "Servicios",
        "nav-contacto": "Contáctanos",
        "btn-login": "Iniciar Sesión",
        
        // Textos de Quiénes Somos
        "about-badge": "ESENCIA & FILOSOFÍA",
        "about-title": "Narrativas que trascienden el tiempo.",
        
        // Textos de Servicios
        "services-badge": "NUESTRA PROPUESTA",
        "services-title": "Nuestros Rasgos: Especialidades",
        
        // Textos de Contacto
        "contact-badge": "CONECTEMOS",
        "contact-title": "Hablemos de tu próximo proyecto"
    },
    en: {
        // Common Navigation
        "nav-inicio": "Home",
        "nav-quienes": "About Us",
        "nav-servicios": "Services",
        "nav-contacto": "Contact Us",
        "btn-login": "Sign In",
        
        // About Us Texts
        "about-badge": "ESSENCE & PHILOSOPHY",
        "about-title": "Narratives that transcend time.",
        
        // Services Texts
        "services-badge": "OUR PROPOSAL",
        "services-title": "Our Traits: Specialties",
        
        // Contact Texts
        "contact-badge": "LET'S CONNECT",
        "contact-title": "Let's talk about your next project"
    }
};

// Función de ejemplo para alternar el idioma y actualizar el DOM
function toggleLanguage() {
    const currentLang = localStorage.getItem('rasgos_lang') === 'en' ? 'es' : 'en';
    localStorage.setItem('rasgos_lang', currentLang);
    
    // Actualizar clases visuales de los botones ES / EN
    document.getElementById('lang-es').className = currentLang === 'es' ? 'text-[#eec14b] transition-colors' : 'text-[#c4c7c7] transition-colors';
    document.getElementById('lang-en').className = currentLang === 'en' ? 'text-[#eec14b] transition-colors' : 'text-[#c4c7c7] transition-colors';

    // Aplicar traducciones a elementos que usen atributos data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            element.innerHTML = translations[currentLang][key];
        }
    });
}