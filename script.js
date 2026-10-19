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
   Motor de Estela de Cursor (60 FPS Canvas)
   ========================================================================== */
(function initInteractiveCursorTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'trail-canvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    let mouse = { x: -100, y: -100, isHoveringTarget: false };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        const elem = document.elementFromPoint(e.clientX, e.clientY);
        mouse.isHoveringTarget = !!(elem && elem.closest('.trail-target'));

        if (mouse.isHoveringTarget) {
            particles.push({
                x: e.clientX,
                y: e.clientY,
                radius: 12 + Math.random() * 4,
                life: 1.0,
                decay: 0.012 + Math.random() * 0.005 
            });
        }
    });

    function render() {
        ctx.clearRect(0, 0, width, height);

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

            ctx.fillStyle = `rgba(13, 13, 13, ${p.life * 0.85})`;
            ctx.strokeStyle = `rgba(238, 193, 75, ${p.life * 0.9})`;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = 'rgba(238, 193, 75, 0.6)';
            ctx.shadowBlur = 10 * p.life;

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }

        if (mouse.isHoveringTarget) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
            
            ctx.fillStyle = 'rgba(13, 13, 13, 0.9)';
            ctx.strokeStyle = '#eec14b';
            ctx.lineWidth = 2;
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
   Modales y Estela del Logo Rasgos
   ========================================================================== */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

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

(function initLogoTrailCanvas() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

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

    const logoImg = new Image();
    logoImg.src = 'IMG/logo.png';

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

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = p.life * 0.85;
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


/* ==========================================================================
   Lógica de Autenticación y Manejo de Sesión de Usuarios
   ========================================================================== */
(function initAuthModule() {
    const MOCK_USERS = [
        { email: 'admin@rasgos.com', pin: '1234' },
        { email: 'karen@rasgos.com', pin: '2024' },
        { email: 'cliente@rasgos.com', pin: '0000' }
    ];

    const STORAGE_KEY = 'rasgos_active_session';

    function getActiveSession() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    }

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

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    email: matchedUser.email,
                    loginTime: new Date().toISOString()
                }));
                window.location.href = 'usuarios.html';
            } else {
                errorBox.classList.remove('hidden');
                loginForm.classList.add('shake');
                setTimeout(() => loginForm.classList.remove('shake'), 400);
            }
        });
    }

    const userDisplay = document.getElementById('user-display-email');
    if (userDisplay) {
        const session = getActiveSession();
        if (!session) {
            window.location.href = 'login.html';
            return;
        }
        userDisplay.textContent = session.email;

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
   Interacción Hover de Video (caminito1)
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
   Transición de Video a Imagen en el Logo y Menú Móvil
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const logoVideo = document.getElementById("logo-video");
    const logoImg = document.getElementById("logo-img");

    if (logoVideo && logoImg) {
        logoVideo.play().catch(error => console.log("Autoplay restringido:", error));
        logoVideo.addEventListener("ended", function() {
            logoVideo.classList.add("hidden");
            logoImg.classList.remove("hidden");
        });
    }

    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuIcon = document.getElementById("menu-icon");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
            menuIcon.textContent = mobileMenu.classList.contains("hidden") ? "menu" : "close";
        });
    }
});


/* ==========================================================================
   Modales Emergentes (Archivos y Servicios)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", function() {
    const btnArchivos = document.getElementById("btn-archivos");
    const modalArchivos = document.getElementById("modal-archivos");
    const btnCerrarModal = document.getElementById("btn-cerrar-modal");

    if (btnArchivos && modalArchivos) {
        btnArchivos.addEventListener("click", function(e) {
            e.preventDefault();
            modalArchivos.classList.remove("hidden");
        });

        if (btnCerrarModal) {
            btnCerrarModal.addEventListener("click", function() {
                modalArchivos.classList.add("hidden");
            });
        }

        modalArchivos.addEventListener("click", function(e) {
            if (e.target === modalArchivos) {
                modalArchivos.classList.add("hidden");
            }
        });
    }

    const btnExplorar = document.getElementById("btn-explorar-servicios");
    const modalServicios = document.getElementById("modal-servicios");
    const btnCerrarServicios = document.getElementById("btn-cerrar-servicios");

    if (btnExplorar && modalServicios) {
        btnExplorar.addEventListener("click", function(e) {
            e.preventDefault();
            modalServicios.classList.remove("hidden");
        });

        if (btnCerrarServicios) {
            btnCerrarServicios.addEventListener("click", function() {
                modalServicios.classList.add("hidden");
            });
        }

        modalServicios.addEventListener("click", function(e) {
            if (e.target === modalServicios) {
                modalServicios.classList.add("hidden");
            }
        });
    }
});


/* ==========================================================================
   Control Dinámico de Enlace Activo y Línea Dorada
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
    let currentPage = window.location.pathname.split("/").pop();
    
    if (!currentPage || currentPage === "" || currentPage === "index.html") {
        currentPage = "inicio.html";
    }

    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');

        link.classList.remove('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
        link.classList.add('text-[#c4c7c7]');

        if (linkHref === currentPage) {
            link.classList.remove('text-[#c4c7c7]');
            link.classList.add('text-[#eec14b]', 'border-b', 'border-[#eec14b]', 'pb-1');
        } else {
            link.classList.add('hover:text-[#eec14b]');
        }
    });
});


/* ==========================================================================
   Diccionario de Traducciones Completo (ES / EN) y Control de Idioma
   ========================================================================== */
const translations = {
    es: {
        // --- Navegación Común ---
        "nav-inicio": "Inicio",
        "nav-quienes": "Quiénes Somos",
        "nav-servicios": "Servicios",
        "nav-contacto": "Contáctanos",
        "btn-login": "Iniciar Sesión",
        "btn-logout": "Salir",

        // --- Inicio ---
        "home-badge": "ESTUDIO DE CREACIÓN MULTIMEDIA",
        "home-title": "Transformamos historias en <span>experiencias memorables</span>",
        "home-subtitle": "Diseñamos estrategias de marca, producción cinematográfica y estética digital <br class=\"hidden md:inline\"/> diseñadas para cautivar audiencias exigentes e imponer liderazgo en su industria.",
        "home-cta-proyecto": "Iniciar Proyecto",
        "home-cta-showreel": "Ver Showreel",
        "metric-retention": "Retención de Marca",
        "metric-projects": "Proyectos Lanzados",
        "metric-quality": "Calidad de Producción",
        "metric-warranty": "Garantía Estética",
        "portfolio-badge": "PORTAFOLIO RECIENTE",
        "portfolio-title": "Obras en las que <span class=\"text-[#eec14b]\">Dejamos Huella</span>",
        "portfolio-link": "Ver Portafolio",
        "proj-1-tag": "Producción de Cine",
        "proj-1-title": "Caminito — Muestra Audiovisual",
        "proj-1-desc": "Diseño UI/UX y narrativa de marca para restaurante.",
        "proj-2-tag": "Branding & Dark Kitchen",
        "proj-2-title": "Sabor Oculto — Identidad de Marca",
        "proj-2-desc": "Concepto visual misterioso y desarrollo de manual de marca para cocina oculta.",
        "manifesto-text": "\"El silencio visual es tan <span class=\"text-[#eec14b]\">poderoso</span> como la imagen más vibrante. Diseñamos para el impacto, no para el ruido.\"",
        "manifesto-label": "MANIFIESTO RASGOS",
        "contact-section-label": "HABLEMOS",
        "contact-section-title": "Inicie una nueva <br/> <span class=\"text-[#eec14b]\">conversación</span>",
        "contact-section-desc": "Estamos listos para materializar su visión. Déjenos sus datos y nuestro equipo estratégico se pondrá en contacto en menos de 24 horas.",
        "label-email-direct": "Email Directo",
        "label-studio": "Estudio",
        "location-detail": "Cali | Colombia | Remoto",
        "ph-nombre": "Nombre completo",
        "ph-email": "Email corporativo",
        "ph-mensaje": "Cuéntenos sobre su visión y objetivos...",
        "opt-select-default": "Seleccione Tipo de Proyecto",
        "opt-audiovisual": "Producción Audiovisual & Cine",
        "opt-uiux": "Identidad Digital & UI/UX",
        "opt-branding": "Estrategia 360 & Branding",
        "form-btn-submit": "ENVIAR MENSAJE",

        // --- Quiénes Somos ---
        "about-badge": "ESENCIA & FILOSOFÍA",
        "about-title": "<span>Narrativas que </span><br class=\"hidden sm:inline\"/><span class=\"text-[#eec14b] italic font-normal underline decoration-[#eec14b]/30 underline-offset-8\">trascienden</span> el tiempo.",
        "about-subtitle": "Somos una agencia multimedia dedicada al minimalismo cinematográfico, donde cada fotograma cuenta una historia de lujo silencioso y precisión artística.",
        "story-badge": "TRAYECTORIA",
        "story-title": "Nuestra Historia",
        "story-p1": "Nacida de la necesidad de elevar el contenido digital a la categoría de arte, Rasgos fusiona la técnica cinematográfica clásica con las demandas de la era moderna.",
        "story-p2": "No solo producimos multimedia; curamos experiencias visuales. Creemos que la belleza reside en lo que se omite, permitiendo que la esencia de la marca brille con autoridad propia.",
        "founder-role": "FUNDADORA & CEO",
        "leader-badge": "LIDERAZGO CREATIVO",
        "leader-title": "La visión detrás de la <span class=\"text-[#eec14b] italic\">marca</span>",
        "leader-quote": "\"El diseño multimedia no consiste solo en crear imágenes bellas, sino en proyectar el alma de una marca a través de la síntesis perfecta entre estética y emoción.\"",
        "leader-desc-1": "Como fundadora y directora creativa de Rasgos Multimedia Agency, impulsa una filosofía centrada en la excelencia visual, la narrativa atemporal y el rigor técnico en cada producción audiovisual e identidad gráfica.",
        "leader-desc-2": "Con una trayectoria enfocada en el diseño boutique y la dirección de proyectos multimedia, lidera un equipo multidisciplinario enfocado en transformar la presencia digital de marcas con una perspectiva elegante, minimalista y de alto impacto.",
        "stat-commitment": "Compromiso Estético",
        "stat-boutique-label": "Boutique",
        "stat-custom": "Enfoque Personalizado",
        "phil-badge": "FILOSOFÍA CORPORATIVA",
        "phil-title": "Donde el Arte encuentra la <span class=\"text-[#eec14b]\">Tecnología</span>",
        "phil-subtitle": "Nuestros pilares fundamentales definen cada proyecto que emprendemos.",
        "card-mission-title": "Nuestra Misión",
        "card-mission-desc": "Crear narrativas audiovisuales de alto impacto que transformen la identidad visual de las marcas globales.",
        "popup-mission-title": "Misión Estratégica",
        "popup-mission-text": "Ayudar a los negocios a lograr un mayor reconocimiento de marca por medio de estrategias digitales innovadoras y creativas mejorando su imagen corporativa. Ayudamos a todo tipo de cliente a visibilizar su negocio en redes sociales. Educación digital ya que se le va a instruir al cliente para que también aprenda cómo posicionar su marca en redes sociales.",
        "card-vision-title": "Nuestra Visión",
        "card-vision-desc": "Ser el referente internacional en narrativa multimedia minimalista y diseño experiencial de vanguardia.",
        "popup-vision-title": "Visión de Futuro",
        "popup-vision-text": "Para el año 2030 Rasgos será una agencia de diseño líder en nuestra comunidad por impulsar el éxito de nuevos emprendimientos a través de contenido visual innovador. Buscamos expandir nuestros servicios a nivel regional, consolidándonos como el aliado principal de los negocios que desean destacar en el mundo digital.",
        "card-values-title": "Nuestros Valores",
        "card-values-desc": "Excelencia técnica, minimalismo con propósito, integridad artística e innovación constante.",
        "popup-values-title": "Principios Rasgos",
        "val-1-head": "Educación y Empoderamiento:",
        "val-1-text": "No solo ejecutamos estrategias; compartimos nuestro conocimiento.",
        "val-2-head": "Creatividad e Innovación:",
        "val-2-text": "Buscamos formas originales de comunicar, garantizando que cada negocio destaque.",
        "val-3-head": "Escucha Activa y Cercanía:",
        "val-3-text": "Entendemos las necesidades, historia y carácter de cada cliente.",
        "modal-doc-badge": "RECURSOS DE MARCA",
        "modal-doc-title": "Documentación Oficial",
        "doc-brief-title": "Brief Corporativo",
        "doc-brief-sub": "PDF • Visión & Alcance",
        "doc-manual-title": "Manual de Identidad",
        "doc-manual-sub": "PDF • Guía Estética",
        "modal-serv-badge": "CATÁLOGO EXCLUSIVO",
        "modal-serv-title": "Nuestros Servicios",
        "cat-serv-1-title": "Creación de Post Publicitario",
        "cat-serv-1-desc": "Diseños gráficos atractivos optimizados para redes sociales, enfocados en captar atención y maximizar interacciones.",
        "cat-serv-1-tag": "Social Media & Ads",
        "cat-serv-2-title": "Creación de Logo",
        "cat-serv-2-desc": "Desarrollo de identidad visual única, atemporal e icónica que proyecta la personalidad y valores de tu marca.",
        "cat-serv-2-tag": "Branding e Identidad",
        "cat-serv-3-title": "Videos Publicitarios",
        "cat-serv-3-desc": "Producción audiovisual cinematográfica de alto impacto para campañas digitales, comerciales y Reels corporativos.",
        "cat-serv-3-tag": "Producción Audiovisual",
        "cat-serv-4-title": "Stop Motion & Animación",
        "cat-serv-4-desc": "Creación de animaciones fotograma a fotograma y motion graphics envolventes para dar vida a proyectos únicos.",
        "cat-serv-4-tag": "Técnica Artesanal",
        "cat-serv-5-title": "Spot Comercial & Reel",
        "cat-serv-5-desc": "Videos publicitarios de alta fidelidad orientados a conversiones, narrativas cinematográficas de producto y lanzamientos de marca.",
        "cat-serv-5-tag": "Cine & Comercial",
        "modal-serv-btn": "Cotizar un Servicio",
        "about-cta-title": "¿Listo para definir tus rasgos?",
        "about-cta-btn1": "Explorar Servicios",
        "about-cta-btn2": "Contáctanos",

        // --- Servicios ---
        "serv-badge": "NUESTRA PROPUESTA",
        "serv-title": "Nuestros Rasgos: <span class=\"italic text-[#eec14b] font-normal underline decoration-[#eec14b]/30 underline-offset-8\">Especialidades</span>",
        "serv-subtitle": "Ofrecemos soluciones integrales de alto impacto diseñadas bajo estándares de estética cinematográfica y precisión digital.",
        "serv-card-1-title": "Producción Audiovisual",
        "serv-card-1-desc": "Narrativas cinemáticas que capturan la esencia de tu marca a través del lente. Cine publicitario, contenido digital y cobertura de alto nivel.",
        "serv-card-2-title": "Identidad Digital",
        "serv-card-2-desc": "Diseño de interfaces y experiencias web que respiran sofisticación. Construimos ecosistemas digitales que trascienden la pantalla.",
        "serv-card-3-title": "Estrategia",
        "serv-card-3-desc": "Consultoría creativa basada en datos y visión artística. Trazamos el camino para que tu marca destaque en un mundo saturado.",
        "btn-explore": "EXPLORAR",
        "serv-cta-badge": "COLABORACIÓN",
        "serv-cta-title": "¿Listo para dejar <br/><span class=\"text-[#eec14b]\">tu huella?</span>",
        "serv-cta-desc": "Cada proyecto es un nuevo rasgo. Trabajemos juntos para definir el tuyo.",
        "serv-cta-btn": "INICIAR PROYECTO",
        "modal-1-title": "Producción Audiovisual",
        "modal-1-desc": "Desplegamos equipos de cinematografía de formato completo para capturar la esencia narrativa de su marca. Nuestro enfoque abarca desde la dirección conceptual y cinematografía de alta velocidad hasta el etalonaje de color avanzado en resolución 8K y diseño sonoro inmersivo.",
        "modal-scope-title": "Alcance del Servicio",
        "modal-1-item1": "Cine Publicitario",
        "modal-1-item2": "Post-producción 8K",
        "modal-1-item3": "Color Grading",
        "modal-1-item4": "Sound Design 3D",
        "modal-btn-quote": "Solicitar Cotización",
        "modal-2-title": "Identidad Digital",
        "modal-2-desc": "Diseñamos ecosistemas digitales a la medida que combinan arquitectura de información intuitiva con estética vanguardista. Creamos marcas memorables mediante sistemas de diseño escalables, pautas tipográficas de lujo y experiencias de usuario fluida.",
        "modal-2-item1": "Diseño UI/UX Premium",
        "modal-2-item2": "Branding y Logotipos",
        "modal-2-item3": "Sistemas de Diseño",
        "modal-2-item4": "Guías de Estilo",
        "modal-3-title": "Estrategia",
        "modal-3-desc": "Transformamos datos de mercado e insights del consumidor en hojas de ruta creativas de alto impacto. Definimos el posicionamiento estratégico de su marca para asegurar relevancia, alcance omnicanal y retorno de inversión sostenible.",
        "modal-3-item1": "Market Insights",
        "modal-3-item2": "Estrategia de Contenido",
        "modal-3-item3": "Lanzamiento de Campaña",
        "modal-3-item4": "Posicionamiento de Marca",

        // --- Contacto ---
        "contact-badge": "CONECTEMOS",
        "contact-title": "Hablemos de tu <br/><span class=\"italic text-[#eec14b] font-normal\">próximo proyecto</span>",
        "label-name": "Nombre",
        "label-email": "Email",
        "label-company": "Empresa (opcional)",
        "label-message": "Mensaje",
        "ph-name": "Tu nombre completo",
        "ph-email-contact": "hola@ejemplo.com",
        "ph-company": "Nombre de tu organización",
        "ph-message": "Cuéntanos un poco sobre tu visión...",
        "btn-send-msg": "ENVIAR MENSAJE",
        "contact-dir-email": "CORREO DIRECTO",
        "contact-social-title": "SIGUE NUESTRA HUELLA",
        "contact-location-title": "UBICACIÓN",
        "contact-location-desc": "Studio Rasgos<br/>Cra 52 #2-51, Cali, Colombia",
        "map-label": "Ver en Google Maps",

        // --- Panel de Usuarios ---
        "dash-badge": "AGENCIA MULTIMEDIA",
        "dash-title": "Panel de <span class=\"italic text-[#eec14b]\">Recursos Exclusivos</span>",
        "card-assets-title": "Activos de Marca",
        "card-assets-desc": "Descarga guías de estilo, logotipos vectoriales y paletas de color oficiales.",
        "card-reels-title": "Reels en Alta Resolución",
        "card-reels-desc": "Previsualización de proyectos cinematográficos en edición preliminar 8K.",
        "card-metrics-title": "Métricas de Campaña",
        "card-metrics-desc": "Reportes de rendimiento audiovisual e impacto de marcas activas.",
        "link-access": "Acceder",
        "link-watch-reels": "Ver Reels",
        "link-consult": "Consultar",

        // --- Footer Común ---
        "footer-desc": "Agencia Boutique de diseño multimedia y narrativa cinematográfica. Transformamos la presencia digital de marcas exclusivas a través del arte y la síntesis visual.",
        "footer-status": "Disponibles para Proyectos",
        "footer-nav": "Navegación",
        "footer-specs": "Especialidades",
        "spec-1": "Cine Publicitario",
        "spec-2": "Identidad & UI/UX",
        "spec-3": "Motion Graphics",
        "spec-4": "Estrategia de Marca",
        "footer-connect": "Conectemos",
        "footer-corp": "Correo Corporativo",
        "footer-social": "Redes Sociales",
        "footer-rights": "© 2025 Rasgos Multimedia Agency. Todos los derechos reservados.",
        "footer-location": "Cali, Colombia",
        "footer-studio": "Estudio Boutique"
    },
    en: {
        // --- Common Navigation ---
        "nav-inicio": "Home",
        "nav-quienes": "About Us",
        "nav-servicios": "Services",
        "nav-contacto": "Contact Us",
        "btn-login": "Sign In",
        "btn-logout": "Sign Out",

        // --- Home ---
        "home-badge": "MULTIMEDIA CREATION STUDIO",
        "home-title": "We transform stories into <span>memorable experiences</span>",
        "home-subtitle": "We design brand strategies, cinematic production, and digital aesthetics <br class=\"hidden md:inline\"/> tailored to captivate demanding audiences and impose industry leadership.",
        "home-cta-proyecto": "Start Project",
        "home-cta-showreel": "Watch Showreel",
        "metric-retention": "Brand Retention",
        "metric-projects": "Launched Projects",
        "metric-quality": "Production Quality",
        "metric-warranty": "Aesthetic Warranty",
        "portfolio-badge": "RECENT PORTFOLIO",
        "portfolio-title": "Works Where We <span class=\"text-[#eec14b]\">Leave Our Mark</span>",
        "portfolio-link": "View Portfolio",
        "proj-1-tag": "Cinema Production",
        "proj-1-title": "Caminito — Audiovisual Showcase",
        "proj-1-desc": "UI/UX design and brand narrative for restaurant.",
        "proj-2-tag": "Branding & Dark Kitchen",
        "proj-2-title": "Sabor Oculto — Brand Identity",
        "proj-2-desc": "Mysterious visual concept and brand guidelines development for dark kitchen.",
        "manifesto-text": "\"Visual silence is as <span class=\"text-[#eec14b]\">powerful</span> as the most vibrant image. We design for impact, not noise.\"",
        "manifesto-label": "RASGOS MANIFESTO",
        "contact-section-label": "LET'S TALK",
        "contact-section-title": "Start a new <br/> <span class=\"text-[#eec14b]\">conversation</span>",
        "contact-section-desc": "Estamos listos para materializar su visión. Déjenos sus datos y nuestro equipo estratégico se pondrá en contacto en menos de 24 horas.",
        "label-email-direct": "Direct Email",
        "label-studio": "Studio",
        "location-detail": "Cali | Colombia | Remote",
        "ph-nombre": "Full name",
        "ph-email": "Corporate email",
        "ph-mensaje": "Tell us about your vision and goals...",
        "opt-select-default": "Select Project Type",
        "opt-audiovisual": "Audiovisual Production & Cinema",
        "opt-uiux": "Digital Identity & UI/UX",
        "opt-branding": "360 Strategy & Branding",
        "form-btn-submit": "SEND MESSAGE",

        // --- About Us ---
        "about-badge": "ESSENCE & PHILOSOPHY",
        "about-title": "<span>Narratives that </span><br class=\"hidden sm:inline\"/><span class=\"text-[#eec14b] italic font-normal underline decoration-[#eec14b]/30 underline-offset-8\">transcend</span> time.",
        "about-subtitle": "We are a multimedia agency dedicated to cinematic minimalism, where every frame tells a story of silent luxury and artistic precision.",
        "story-badge": "TRAYECTORIA",
        "story-title": "Our History",
        "story-p1": "Born from the need to elevate digital content to the category of art, Rasgos fuses classical cinematic technique with modern demands.",
        "story-p2": "We don't just produce multimedia; we curate visual experiences. We believe beauty lies in what is omitted, allowing the brand's essence to shine with its own authority.",
        "founder-role": "FOUNDER & CEO",
        "leader-badge": "CREATIVE LEADERSHIP",
        "leader-title": "The vision behind the <span class=\"text-[#eec14b] italic\">brand</span>",
        "leader-quote": "\"Multimedia design is not just about creating beautiful images, but projecting the soul of a brand through the perfect synthesis of aesthetics and emotion.\"",
        "leader-desc-1": "As founder and creative director of Rasgos Multimedia Agency, she drives a philosophy focused on visual excellence, timeless narrative, and technical rigor in every audiovisual production and graphic identity.",
        "leader-desc-2": "With a background focused on boutique design and multimedia project direction, she leads a multidisciplinary team focused on transforming the digital presence of brands with an elegant, minimalist, and high-impact perspective.",
        "stat-commitment": "Aesthetic Commitment",
        "stat-boutique-label": "Boutique",
        "stat-custom": "Custom Approach",
        "phil-badge": "CORPORATE PHILOSOPHY",
        "phil-title": "Where Art meets <span class=\"text-[#eec14b]\">Technology</span>",
        "phil-subtitle": "Our fundamental pillars define every project we undertake.",
        "card-mission-title": "Our Mission",
        "card-mission-desc": "To create high-impact audiovisual narratives that transform the visual identity of global brands.",
        "popup-mission-title": "Strategic Mission",
        "popup-mission-text": "To help businesses achieve greater brand recognition through innovative and creative digital strategies, improving their corporate image. We help all types of clients make their business visible on social media. Digital education by instructing the client so they also learn how to position their brand on social media.",
        "card-vision-title": "Our Vision",
        "card-vision-desc": "To be the international benchmark in minimalist multimedia narrative and cutting-edge experiential design.",
        "popup-vision-title": "Future Vision",
        "popup-vision-text": "By 2030, Rasgos will be a leading design agency in our community for boosting the success of new ventures through innovative visual content. We aim to expand our services regionally, establishing ourselves as the primary ally for businesses wishing to stand out in the digital world.",
        "card-values-title": "Our Values",
        "card-values-desc": "Technical excellence, purpose-driven minimalism, artistic integrity, and constant innovation.",
        "popup-values-title": "Rasgos Principles",
        "val-1-head": "Education and Empowerment:",
        "val-1-text": "We don't just execute strategies; we share our knowledge.",
        "val-2-head": "Creativity and Innovation:",
        "val-2-text": "We seek original ways to communicate, ensuring every business stands out.",
        "val-3-head": "Active Listening and Closeness:",
        "val-3-text": "We understand the needs, history, and character of each client.",
        "modal-doc-badge": "BRAND RESOURCES",
        "modal-doc-title": "Official Documentation",
        "doc-brief-title": "Corporate Brief",
        "doc-brief-sub": "PDF • Vision & Scope",
        "doc-manual-title": "Identity Manual",
        "doc-manual-sub": "PDF • Aesthetic Guide",
        "modal-serv-badge": "EXCLUSIVE CATALOG",
        "modal-serv-title": "Our Services",
        "cat-serv-1-title": "Advertising Post Creation",
        "cat-serv-1-desc": "Attractive graphic designs optimized for social media, focused on capturing attention and maximizing interactions.",
        "cat-serv-1-tag": "Social Media & Ads",
        "cat-serv-2-title": "Logo Creation",
        "cat-serv-2-desc": "Development of a unique, timeless, and iconic visual identity that projects your brand's personality and values.",
        "cat-serv-2-tag": "Branding & Identity",
        "cat-serv-3-title": "Advertising Videos",
        "cat-serv-3-desc": "High-impact cinematic audiovisual production for digital campaigns, commercials, and corporate Reels.",
        "cat-serv-3-tag": "Audiovisual Production",
        "cat-serv-4-title": "Stop Motion & Animation",
        "cat-serv-4-desc": "Creation of frame-by-frame animations and engaging motion graphics to bring unique projects to life.",
        "cat-serv-4-tag": "Handcrafted Technique",
        "cat-serv-5-title": "Commercial Spot & Reel",
        "cat-serv-5-desc": "High-fidelity conversion-oriented advertising videos, cinematic product narratives, and brand launches.",
        "cat-serv-5-tag": "Cinema & Commercial",
        "modal-serv-btn": "Request a Quote",
        "about-cta-title": "Ready to define your traits?",
        "about-cta-btn1": "Explore Services",
        "about-cta-btn2": "Contact Us",

        // --- Services ---
        "serv-badge": "OUR PROPOSAL",
        "serv-title": "Our Traits: <span class=\"italic text-[#eec14b] font-normal underline decoration-[#eec14b]/30 underline-offset-8\">Specialties</span>",
        "serv-subtitle": "We offer high-impact comprehensive solutions designed under standards of cinematic aesthetics and digital precision.",
        "serv-card-1-title": "Audiovisual Production",
        "serv-card-1-desc": "Cinematic narratives that capture your brand's essence through the lens. Advertising cinema, digital content, and high-level coverage.",
        "serv-card-2-title": "Digital Identity",
        "serv-card-2-desc": "UI design and web experiences that breathe sophistication. We build digital ecosystems that transcend the screen.",
        "serv-card-3-title": "Strategy",
        "serv-card-3-desc": "Creative consultancy based on data and artistic vision. We pave the way for your brand to stand out in a saturated world.",
        "btn-explore": "EXPLORE",
        "serv-cta-badge": "COLLABORATION",
        "serv-cta-title": "Ready to leave <br/><span class=\"text-[#eec14b]\">your mark?</span>",
        "serv-cta-desc": "Every project is a new trait. Let's work together to define yours.",
        "serv-cta-btn": "START PROJECT",
        "modal-1-title": "Audiovisual Production",
        "modal-1-desc": "We deploy full-format cinematography equipment to capture your brand's narrative essence. Our approach ranges from conceptual direction and high-speed cinematography to advanced color grading in 8K resolution and immersive sound design.",
        "modal-scope-title": "Service Scope",
        "modal-1-item1": "Advertising Cinema",
        "modal-1-item2": "8K Post-production",
        "modal-1-item3": "Color Grading",
        "modal-1-item4": "3D Sound Design",
        "modal-btn-quote": "Request Quote",
        "modal-2-title": "Digital Identity",
        "modal-2-desc": "We design custom digital ecosystems combining intuitive information architecture with cutting-edge aesthetics. We build memorable brands through scalable design systems, luxury typographic guidelines, and fluid user experiences.",
        "modal-2-item1": "Premium UI/UX Design",
        "modal-2-item2": "Branding & Logos",
        "modal-2-item3": "Design Systems",
        "modal-2-item4": "Style Guides",
        "modal-3-title": "Strategy",
        "modal-3-desc": "We transform market data and consumer insights into high-impact creative roadmaps. We define your brand's strategic positioning to ensure relevance, omnichannel reach, and sustainable return on investment.",
        "modal-3-item1": "Market Insights",
        "modal-3-item2": "Content Strategy",
        "modal-3-item3": "Campaign Launch",
        "modal-3-item4": "Brand Positioning",

        // --- Contact ---
        "contact-badge": "LET'S CONNECT",
        "contact-title": "Let's talk about your <br/><span class=\"italic text-[#eec14b] font-normal\">next project</span>",
        "label-name": "Name",
        "label-email": "Email",
        "label-company": "Company (optional)",
        "label-message": "Message",
        "ph-name": "Your full name",
        "ph-email-contact": "hello@example.com",
        "ph-company": "Your organization name",
        "ph-message": "Tell us a bit about your vision...",
        "btn-send-msg": "SEND MESSAGE",
        "contact-dir-email": "DIRECT EMAIL",
        "contact-social-title": "FOLLOW OUR TRACK",
        "contact-location-title": "LOCATION",
        "contact-location-desc": "Studio Rasgos<br/>Cra 52 #2-51, Cali, Colombia",
        "map-label": "View on Google Maps",

        // --- User Dashboard ---
        "dash-badge": "MULTIMEDIA AGENCY",
        "dash-title": "Exclusive <span class=\"italic text-[#eec14b]\">Resources Panel</span>",
        "card-assets-title": "Brand Assets",
        "card-assets-desc": "Download style guides, vector logos, and official color palettes.",
        "card-reels-title": "High Resolution Reels",
        "card-reels-desc": "Preview cinematic projects in 8K preliminary edition.",
        "card-metrics-title": "Campaign Metrics",
        "card-metrics-desc": "Audiovisual performance reports and active brand impact.",
        "link-access": "Access",
        "link-watch-reels": "View Reels",
        "link-consult": "Consult",

        // --- Common Footer ---
        "footer-desc": "Boutique agency for multimedia design and cinematic narrative. We transform the digital presence of exclusive brands through art and visual synthesis.",
        "footer-status": "Available for Projects",
        "footer-nav": "Navigation",
        "footer-specs": "Specialties",
        "spec-1": "Advertising Cinema",
        "spec-2": "Identity & UI/UX",
        "spec-3": "Motion Graphics",
        "spec-4": "Brand Strategy",
        "footer-connect": "Let's Connect",
        "footer-corp": "Corporate Email",
        "footer-social": "Social Media",
        "footer-rights": "© 2025 Rasgos Multimedia Agency. All rights reserved.",
        "footer-location": "Cali, Colombia",
        "footer-studio": "Boutique Studio"
    }
};

function toggleLanguage() {
    const currentLang = localStorage.getItem('rasgos_lang') === 'en' ? 'es' : 'en';
    localStorage.setItem('rasgos_lang', currentLang);
    applyLanguage(currentLang);
}

function applyLanguage(lang) {
    const langEs = document.getElementById('lang-es');
    const langEn = document.getElementById('lang-en');
    if (langEs && langEn) {
        langEs.className = lang === 'es' ? 'text-[#eec14b] transition-colors' : 'text-[#c4c7c7] transition-colors';
        langEn.className = lang === 'en' ? 'text-[#eec14b] transition-colors' : 'text-[#c4c7c7] transition-colors';
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.innerHTML = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('rasgos_lang') || 'es';
    applyLanguage(savedLang);
});