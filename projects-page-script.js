const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
const navOverlay = document.getElementById('nav-overlay');
const projectContainer = document.getElementById('project-container');
const projectCount = document.getElementById('project-count');
const adminStatus = document.getElementById('admin-status');
const adminAccessBtn = document.getElementById('admin-access-btn');
const projectFormSection = document.getElementById('project-form-section');
const backBtn = document.getElementById('back-btn');
const cancelBtn = document.getElementById('cancel-btn');
const addProjectForm = document.getElementById('add-project-form');
const modalTitle = document.getElementById('modal-title');
const projectIdField = document.getElementById('project-id');
const existingProjectImageField = document.getElementById('existing-project-image');
const projectImageInput = document.getElementById('project-image');
const projectImageHint = document.getElementById('project-image-hint');
const submitBtn = addProjectForm.querySelector('.submit-btn');

const STORAGE_KEY = 'portfolio_projects';
const ADMIN_PASSWORD = 'admin123';
let isAdminAuthenticated = false;

if (hamburger && navLinks) {
    const setNavState = (isOpen) => {
        navLinks.classList.toggle('active', isOpen);
        document.body.classList.toggle('nav-open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        if (navOverlay) {
            navOverlay.setAttribute('aria-hidden', String(!isOpen));
        }
    };

    const toggleNav = () => {
        setNavState(!navLinks.classList.contains('active'));
    };

    const closeNav = () => {
        setNavState(false);
    };

    hamburger.addEventListener('click', toggleNav);
    hamburger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleNav();
        }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });

    if (navOverlay) {
        navOverlay.addEventListener('click', closeNav);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });
}

const defaultProjects = [
    {
        id: 'amazon-clone',
        title: 'Amazon Clone',
        description: 'A frontend recreation of the Amazon homepage focused on layout structure, product section styling, and visual familiarity.',
        image: 'amazon.png',
        link: 'project-amazon.html',
        tag: 'E-commerce UI Practice',
        badges: ['HTML', 'CSS', 'Responsive Layout']
    },
    {
        id: 'portfolio-website',
        title: 'Portfolio Website',
        description: 'A personal developer portfolio designed to present work clearly with a clean layout, modern sections, and stronger professional tone.',
        image: 'portfolio.png',
        link: 'project-portfolio.html',
        tag: 'Personal Branding',
        badges: ['Portfolio Design', 'UI Styling', 'Responsive Pages']
    },
    {
        id: 'gym-website',
        title: 'Gym Website',
        description: 'A landing page for a fitness brand created to highlight bold sections, clear calls to action, and energetic visual presentation.',
        image: 'gym.png',
        link: 'project-gym.html',
        tag: 'Landing Page Design',
        badges: ['Landing Page', 'Brand Layout', 'Visual Hierarchy']
    }
];

function normalizeText(value) {
    return String(value || '').trim();
}

function normalizeLink(value) {
    const trimmedValue = normalizeText(value);

    if (!trimmedValue) {
        return '';
    }

    if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmedValue) || trimmedValue.startsWith('./') || trimmedValue.startsWith('../') || trimmedValue.startsWith('/')) {
        return trimmedValue;
    }

    if (/^[\w-]+\.(html?|php)([#?].*)?$/i.test(trimmedValue)) {
        return trimmedValue;
    }

    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmedValue)) {
        return `https://${trimmedValue}`;
    }

    return trimmedValue;
}

function isSafeProjectLink(value) {
    if (!value) {
        return false;
    }

    return /^(https?:\/\/|mailto:|tel:|\.{0,2}\/|\/)/i.test(value) || /^[\w-]+\.(html?|php)([#?].*)?$/i.test(value);
}

function getProjectOpenLink(value) {
    const normalizedValue = normalizeLink(value);
    return isSafeProjectLink(normalizedValue) ? normalizedValue : '#';
}

function getStoredProjects() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {
        const parsedProjects = JSON.parse(saved);
        return Array.isArray(parsedProjects) ? parsedProjects : null;
    } catch (error) {
        console.error('Error parsing saved projects:', error);
        return null;
    }
}

function loadProjects() {
    const storedProjects = getStoredProjects();
    return storedProjects && storedProjects.length > 0 ? storedProjects : [...defaultProjects];
}

function saveProjects(projects) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        return true;
    } catch (error) {
        console.error('Error saving projects:', error);
        return false;
    }
}

function setAdminState(isEnabled) {
    isAdminAuthenticated = isEnabled;
    adminAccessBtn.querySelector('span').textContent = isEnabled ? 'Admin Access Enabled' : 'Add New Project';
    adminStatus.textContent = isEnabled
        ? 'Admin mode is active. You can now add, edit, and delete projects.'
        : 'Admin mode is off. Verify as admin to add, edit, or delete projects.';
}

function ensureAdminAccess() {
    if (isAdminAuthenticated) {
        return true;
    }

    const password = prompt('Enter Admin Password:');

    if (password === null) {
        return false;
    }

    if (password !== ADMIN_PASSWORD) {
        alert('Incorrect password! Only admin can manage projects.');
        return false;
    }

    setAdminState(true);
    renderProjects(loadProjects());
    return true;
}

function setModalMode(mode, project = null) {
    const isEditMode = mode === 'edit';

    modalTitle.textContent = isEditMode ? 'Edit Project' : 'Add New Project';
    submitBtn.textContent = isEditMode ? 'Save Changes' : 'Add Project';
    projectImageInput.required = !isEditMode;
    projectImageHint.textContent = isEditMode
        ? 'Upload a new image only if you want to replace the current one. Max 5MB.'
        : 'Supported formats: JPG, PNG, GIF, WebP (Max 5MB)';

    addProjectForm.reset();
    projectIdField.value = '';
    existingProjectImageField.value = '';

    if (!project) {
        return;
    }

    projectIdField.value = project.id || '';
    existingProjectImageField.value = project.image || '';
    document.getElementById('project-title').value = project.title || '';
    document.getElementById('project-description').value = project.description || '';
    document.getElementById('project-tag').value = project.tag || '';
    document.getElementById('project-link').value = project.link || '';
    document.getElementById('project-badges').value = Array.isArray(project.badges) ? project.badges.join(', ') : '';
}

function openModal(mode = 'add', project = null, options = {}) {
    const { skipAuthCheck = false } = options;

    if (!skipAuthCheck && !ensureAdminAccess()) {
        return;
    }

    setModalMode(mode, project);
    projectFormSection.hidden = false;
    projectFormSection.setAttribute('aria-hidden', 'false');
    projectFormSection.classList.add('is-visible');
    projectFormSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    document.getElementById('project-title').focus();
}

function closeModal() {
    projectFormSection.hidden = true;
    projectFormSection.setAttribute('aria-hidden', 'true');
    projectFormSection.classList.remove('is-visible');
    setModalMode('add');
}

function getProjectPayload(formData, imageSource) {
    const badges = normalizeText(formData.get('badges')).split(',').map((badge) => badge.trim()).filter(Boolean);
    const payload = {
        id: normalizeText(formData.get('projectId')) || `project-${Date.now()}`,
        title: normalizeText(formData.get('title')),
        description: normalizeText(formData.get('description')),
        image: imageSource,
        link: normalizeLink(formData.get('link')),
        tag: normalizeText(formData.get('tag')),
        badges
    };

    if (!payload.title || !payload.description || !payload.image || !payload.link || !payload.tag || badges.length === 0) {
        return null;
    }

    return payload;
}

function upsertProject(project) {
    const projects = loadProjects();
    const existingIndex = projects.findIndex((item) => item.id === project.id);

    if (existingIndex >= 0) {
        projects[existingIndex] = project;
    } else {
        projects.push(project);
    }

    return saveProjects(projects);
}

function deleteProject(projectId) {
    const filteredProjects = loadProjects().filter((project) => project.id !== projectId);
    return saveProjects(filteredProjects.length > 0 ? filteredProjects : [...defaultProjects]);
}

function findProjectById(projectId) {
    return loadProjects().find((project) => project.id === projectId) || null;
}

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (loadEvent) => {
            const image = new Image();

            image.onload = () => {
                const maxWidth = 1600;
                const maxHeight = 1000;
                let { width, height } = image;

                const widthRatio = maxWidth / width;
                const heightRatio = maxHeight / height;
                const scaleRatio = Math.min(widthRatio, heightRatio, 1);

                width = Math.round(width * scaleRatio);
                height = Math.round(height * scaleRatio);

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const context = canvas.getContext('2d');

                if (!context) {
                    reject(new Error('Canvas is not supported.'));
                    return;
                }

                context.drawImage(image, 0, 0, width, height);

                const preferredType = file.type === 'image/png' ? 'image/png' : 'image/webp';
                const quality = preferredType === 'image/png' ? undefined : 0.82;
                const compressedDataUrl = canvas.toDataURL(preferredType, quality);
                resolve(compressedDataUrl);
            };

            image.onerror = () => {
                reject(new Error('Failed to load the selected image.'));
            };

            image.src = loadEvent.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read the selected image.'));
        };

        reader.readAsDataURL(file);
    });
}

function handleProjectSave(imageSource) {
    const formData = new FormData(addProjectForm);
    const projectPayload = getProjectPayload(formData, imageSource);

    if (!projectPayload) {
        alert('Please fill in all required fields correctly.');
        return;
    }

    if (!upsertProject(projectPayload)) {
        alert('Unable to save project. The browser storage may be full or unavailable.');
        return;
    }

    closeModal();
    renderProjects(loadProjects());
}

addProjectForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const imageFile = projectImageInput.files[0];
    const existingImage = existingProjectImageField.value;

    if (!imageFile && !existingImage) {
        alert('Please select an image');
        return;
    }

    if (!imageFile) {
        handleProjectSave(existingImage);
        return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (imageFile.size > maxSize) {
        alert('Image size must be less than 5MB');
        return;
    }

    compressImage(imageFile)
        .then((compressedImage) => {
            handleProjectSave(compressedImage);
        })
        .catch(() => {
            alert('Failed to process the image file');
        });
});

adminAccessBtn.addEventListener('click', () => {
    if (!ensureAdminAccess()) {
        return;
    }

    openModal('add', null, { skipAuthCheck: true });
});
backBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !projectFormSection.hidden) {
        closeModal();
    }
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderProjects(projects) {
    projectContainer.innerHTML = '';

    projects.forEach((project, index) => {
        const article = document.createElement('article');
        article.className = `project-card project-card-pro fade-in-on-scroll${isAdminAuthenticated ? ' admin-enabled' : ''}`;
        article.style.setProperty('--reveal-delay', `${80 + (index * 120)}ms`);

        const badgesHtml = (project.badges || []).map((badge) => `<span>${escapeHtml(badge)}</span>`).join('');
        const safeLink = getProjectOpenLink(project.link);
        const opensInNewTab = /^(https?:\/\/|mailto:|tel:)/i.test(safeLink);
        const buttonLabel = safeLink === '#' ? 'Link Missing' : 'Open Project';
        const adminActionsHtml = isAdminAuthenticated ? `
                <div class="project-admin-actions">
                    <button type="button" class="project-admin-btn" data-action="edit" data-project-id="${escapeHtml(project.id)}">Edit</button>
                    <button type="button" class="project-admin-btn" data-action="delete" data-project-id="${escapeHtml(project.id)}">Delete</button>
                </div>
        ` : '';

        article.innerHTML = `
            <a href="${escapeHtml(safeLink)}" class="project-image-link"${opensInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}${safeLink === '#' ? ' aria-disabled="true"' : ''}>
                <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)} project preview" loading="lazy" decoding="async">
            </a>
            <div class="project-card-body">
                <p class="project-tag">${escapeHtml(project.tag || 'Project')}</p>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description)}</p>
                <div class="project-meta">${badgesHtml}</div>
                <a href="${escapeHtml(safeLink)}" class="project-btn"${opensInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ''}${safeLink === '#' ? ' aria-disabled="true"' : ''}>${buttonLabel}</a>
                ${adminActionsHtml}
            </div>
        `;

        projectContainer.appendChild(article);
    });

    projectCount.textContent = String(projects.length);
    initRevealAnimations();
}

projectContainer.addEventListener('click', (event) => {
    const adminButton = event.target.closest('[data-action]');

    if (!adminButton || !isAdminAuthenticated) {
        return;
    }

    const action = adminButton.dataset.action;
    const projectId = adminButton.dataset.projectId;
    const project = findProjectById(projectId);

    if (!project) {
        alert('Project not found.');
        return;
    }

    if (action === 'edit') {
        openModal('edit', project, { skipAuthCheck: true });
        return;
    }

    if (action === 'delete') {
        const confirmed = confirm(`Delete "${project.title}"?`);

        if (!confirmed) {
            return;
        }

        if (!deleteProject(projectId)) {
            alert('Unable to delete the project right now.');
            return;
        }

        renderProjects(loadProjects());
    }
});

function initRevealAnimations() {
    const revealItems = document.querySelectorAll('.fade-in-on-scroll:not(.is-visible)');

    if (revealItems.length === 0) {
        return;
    }

    const pendingItems = [];
    const immediateThreshold = Math.max(window.innerHeight * 0.92, 560);

    revealItems.forEach((item) => {
        if (item.getBoundingClientRect().top <= immediateThreshold) {
            item.classList.add('reveal-now', 'is-visible');
            return;
        }

        pendingItems.push(item);
    });

    if (pendingItems.length === 0) {
        return;
    }

    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        pendingItems.forEach((item) => item.classList.add('is-visible'));
        return;
    }

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px'
    });

    pendingItems.forEach((item) => revealObserver.observe(item));
}

setAdminState(false);
renderProjects(loadProjects());
