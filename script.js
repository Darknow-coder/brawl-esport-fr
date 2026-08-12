/* =========================================================
   BRAWL ESPORT FR — script.js
   Vanilla JS only. Chaque bloc est indépendant : si une page
   ne contient pas l'élément concerné, le bloc ne fait rien.
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollReveal();
  initSmoothScroll();
  initGuideSearch();
  initChecklist();
  initTeamNotice();
  setCurrentYear();
  initNavScrollSpy();
  initRoutineGenerator();
  initRoleQuiz();
  initGuideAccordion();
  initReviews();
  initLFG();
});

/* ---------------------------------------------------------
   1. Menu mobile (hamburger)
--------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.hamburger');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('mobile-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Ferme le menu si on clique sur un lien (utile en navigation SPA-like)
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('mobile-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------------------------------------------------------
   2. Recherche des guides (guides.html)
--------------------------------------------------------- */
function initGuideSearch() {
  const input = document.getElementById('guide-search');
  const cards = document.querySelectorAll('[data-guide-card]');
  const noResults = document.getElementById('no-results');
  const chips = document.querySelectorAll('.filter-chip');
  if (!input || cards.length === 0) return;

  let activeCategory = 'toutes';

  function applyFilters() {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const desc = (card.dataset.desc || '').toLowerCase();
      const category = card.dataset.category || '';

      const matchesQuery = query === '' || title.includes(query) || desc.includes(query);
      const matchesCategory = activeCategory === 'toutes' || category === activeCategory;

      const visible = matchesQuery && matchesCategory;
      card.style.display = visible ? '' : 'none';
      if (visible) visibleCount++;
    });

    if (noResults) noResults.classList.toggle('show', visibleCount === 0);
  }

  input.addEventListener('input', applyFilters);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.filter || 'toutes';
      applyFilters();
    });
  });
}

/* ---------------------------------------------------------
   3. Checklist interactive avec sauvegarde localStorage
   (persistance de l'état coché entre deux visites)
--------------------------------------------------------- */
function initChecklist() {
  const container = document.querySelector('.checklist');
  const items = document.querySelectorAll('.check-item input[type="checkbox"]');
  const progressEl = document.getElementById('checklist-progress');
  if (items.length === 0) return;

  const STORAGE_KEY = 'brawlEsportFR.checklist.v1';

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      // localStorage indisponible (navigation privée, etc.) : on continue sans persistance
      console.warn('Checklist : lecture localStorage impossible', e);
      return null;
    }
  }

  function saveState() {
    try {
      const state = Array.from(items).map(item => item.checked);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Checklist : sauvegarde localStorage impossible', e);
    }
  }

  // Crée (une seule fois) le message de félicitations affiché à 6/6
  function getOrCreateCongrats() {
    let el = document.getElementById('checklist-congrats');
    if (!el && progressEl) {
      el = document.createElement('div');
      el.id = 'checklist-congrats';
      el.className = 'checklist-congrats';
      el.style.cssText = [
        'display:none',
        'margin:4px 0 18px',
        'padding:12px 16px',
        'border-radius:10px',
        'background:rgba(255,176,32,.12)',
        'border:1px solid rgba(255,176,32,.35)',
        'color:var(--primary)',
        'font-size:14px',
        'font-weight:600'
      ].join(';');
      el.textContent = '🏆 Checklist complète — vous êtes prêts pour le tournoi !';
      progressEl.insertAdjacentElement('afterend', el);
    }
    return el;
  }

  function updateProgress() {
    const checked = document.querySelectorAll('.check-item input:checked').length;
    const total = items.length;
    const isComplete = checked === total;

    if (progressEl) {
      progressEl.textContent = `${checked} / ${total} étapes validées`;
      progressEl.classList.toggle('completed', isComplete);
    }
    if (container) {
      container.classList.toggle('completed', isComplete);
    }

    const congrats = getOrCreateCongrats();
    if (congrats) {
      congrats.style.display = isComplete ? 'block' : 'none';
    }
  }

  // Restaure les cases déjà cochées lors d'une précédente visite
  const savedState = loadState();
  if (savedState) {
    items.forEach((item, index) => {
      if (typeof savedState[index] === 'boolean') {
        item.checked = savedState[index];
      }
    });
  }

  // Sauvegarde + mise à jour à chaque changement de case
  items.forEach(item => {
    item.addEventListener('change', () => {
      saveState();
      updateProgress();
    });
  });

  updateProgress();
}

/* ---------------------------------------------------------
   4. Scroll fluide pour les ancres internes
--------------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ---------------------------------------------------------
   5. Petites animations d'apparition au scroll
--------------------------------------------------------- */
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------
   6. Bouton "Je cherche une équipe" (equipes.html)
   Fonctionnalité prévue pour une future version.
--------------------------------------------------------- */
function initTeamNotice() {
  const btn = document.getElementById('find-team-btn');
  const notice = document.getElementById('find-team-notice');
  if (!btn || !notice) return;

  btn.addEventListener('click', () => {
    notice.classList.add('show');
    btn.setAttribute('aria-disabled', 'true');
  });
}

/* ---------------------------------------------------------
   7. Année courante dans le footer
--------------------------------------------------------- */
function setCurrentYear() {
  document.querySelectorAll('[data-current-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ---------------------------------------------------------
   8. Mise en avant du lien de navigation actif au scroll
   (site one-page : chaque section = une ancre du menu)
--------------------------------------------------------- */
function initNavScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (sections.length === 0 || navLinks.length === 0 || !('IntersectionObserver' in window)) return;

  const linkFor = (id) => document.querySelector(`.nav-links a[href="#${id}"]`);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = linkFor(entry.target.id);
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ---------------------------------------------------------
   9. Générateur de routine d'entraînement (#routine)
   Calcule un plan concret selon le temps et l'objectif choisis.
--------------------------------------------------------- */
function initRoutineGenerator() {
  const timeChips = document.querySelectorAll('[data-routine-time]');
  const goalChips = document.querySelectorAll('[data-routine-goal]');
  const generateBtn = document.getElementById('generate-routine-btn');
  const resultEl = document.getElementById('routine-result');
  if (!generateBtn || !resultEl || timeChips.length === 0 || goalChips.length === 0) return;

  const GOAL_LABELS = {
    mecanique: 'Aim / mécanique',
    draft: 'Draft / cartes',
    equipe: 'Jeu en équipe & communication'
  };

  // Chaque objectif = une suite de blocs avec leur poids (ratio) dans le temps total.
  const ROUTINES = {
    mecanique: {
      tip: 'Répète cette routine 3 fois par semaine pour voir une vraie progression sur ta visée.',
      steps: [
        { label: 'Chauffe en entraînement libre : viser sans réfléchir', ratio: 0.25 },
        { label: 'Ranked ou amicale, focus visée et esquive', ratio: 0.45 },
        { label: 'Revoir 2 replays : noter 1 erreur de placement à corriger', ratio: 0.30 }
      ]
    },
    draft: {
      tip: 'Garde une note perso avec ton meilleur pick par carte : elle te sert à chaque session.',
      steps: [
        { label: 'Revoir les cartes du moment : bushs, zones à risque', ratio: 0.30 },
        { label: 'Simuler 3 drafts contre un ami ou seul, à tête reposée', ratio: 0.45 },
        { label: 'Noter le meilleur pick pour chaque carte jouée', ratio: 0.25 }
      ]
    },
    equipe: {
      tip: 'Une session avec des callouts clairs vaut mieux que trois sessions silencieuses.',
      steps: [
        { label: 'Échauffement en duo : bouger et viser ensemble', ratio: 0.20 },
        { label: 'Session en équipe avec callouts à voix haute', ratio: 0.55 },
        { label: 'Débrief vocal : 1 point à corriger par joueur', ratio: 0.25 }
      ]
    }
  };

  let selectedTime = 30;
  let selectedGoal = 'mecanique';

  function wireChipGroup(chips, onSelect) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        onSelect(chip);
      });
    });
  }

  wireChipGroup(timeChips, (chip) => {
    selectedTime = parseInt(chip.dataset.routineTime, 10) || 30;
  });

  wireChipGroup(goalChips, (chip) => {
    selectedGoal = chip.dataset.routineGoal || 'mecanique';
  });

  // Répartit le temps total sur les blocs de la routine, arrondi à 5 min,
  // en ajustant le dernier bloc pour que le total tombe juste.
  function buildSteps(totalMinutes, goal) {
    const routine = ROUTINES[goal];
    if (!routine) return [];

    const steps = routine.steps.map(step => ({
      label: step.label,
      minutes: Math.max(5, Math.round((totalMinutes * step.ratio) / 5) * 5)
    }));

    const sumExceptLast = steps.slice(0, -1).reduce((sum, s) => sum + s.minutes, 0);
    steps[steps.length - 1].minutes = Math.max(5, totalMinutes - sumExceptLast);

    return steps;
  }

  function formatTime(minutes) {
    if (minutes === 60) return '1h';
    if (minutes === 120) return '2h';
    return `${minutes} min`;
  }

  function renderResult() {
    const routine = ROUTINES[selectedGoal];
    const steps = buildSteps(selectedTime, selectedGoal);
    const timeLabel = formatTime(selectedTime);

    const stepsHtml = steps.map(step => `
      <div class="routine-step">
        <span class="routine-step-time">${step.minutes} min</span>
        <span class="routine-step-label">${step.label}</span>
      </div>
    `).join('');

    resultEl.innerHTML = `
      <div class="routine-result-head">
        <h3 class="routine-result-title">Routine ${timeLabel} — ${GOAL_LABELS[selectedGoal]}</h3>
        <span class="routine-result-total">${timeLabel} au total</span>
      </div>
      ${stepsHtml}
      <p class="routine-tip">💡 ${routine.tip}</p>
    `;
    resultEl.classList.add('show');

    // Défilement fluide vers le résultat : l'utilisateur n'a pas à chercher
    // la routine générée, surtout sur mobile où elle sort de l'écran visible.
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  generateBtn.addEventListener('click', renderResult);
}

/* ---------------------------------------------------------
   10. Quiz "Quel est ton rôle e-sport ?" (#quiz)
   4 questions -> score par rôle -> résultat + brawlers conseillés.
--------------------------------------------------------- */
function initRoleQuiz() {
  const questions = document.querySelectorAll('#quiz-questions .quiz-question');
  const questionsWrap = document.getElementById('quiz-questions');
  const resultWrap = document.getElementById('quiz-result');
  const progressBar = document.getElementById('quiz-progress-bar');
  const stepLabel = document.getElementById('quiz-step-label');
  const restartBtn = document.getElementById('quiz-restart-btn');
  if (questions.length === 0 || !questionsWrap || !resultWrap) return;

  const ROLE_RESULTS = {
    carry: {
      icon: '🎯',
      title: 'Carry / Damage Dealer',
      desc: "Tu es à l'aise pour infliger des dégâts à distance et punir la moindre erreur adverse. Ton équipe compte sur toi pour finir les échanges.",
      brawlers: ['Colt', 'Brock', 'Piper', 'Rico']
    },
    tank: {
      icon: '🛡️',
      title: 'Tank / Initiateur',
      desc: "Tu ouvres les engagements et encaisses les premiers dégâts pour créer de l'espace à ton équipe. Sans toi, personne n'avance.",
      brawlers: ['El Primo', 'Rosa', 'Frank', 'Bull']
    },
    support: {
      icon: '💠',
      title: 'Support / Contrôle',
      desc: "Tu protèges, soignes ou ralentis l'ennemi pour que ton équipe garde l'avantage. Ton impact se voit dans la durée du combat, pas sur le tableau des scores.",
      brawlers: ['Poco', 'Pam', 'Byron', 'Gene']
    },
    flex: {
      icon: '🔄',
      title: 'Flex / Polyvalent',
      desc: "Tu t'adaptes au poste qui manque dans ton équipe plutôt que de t'enfermer dans un rôle. C'est une vraie force en compétition amateur.",
      brawlers: ['Shelly', 'Colette', 'Chester', 'Max']
    }
  };

  const scores = { carry: 0, tank: 0, support: 0, flex: 0 };
  let currentIndex = 0;

  function showQuestion(index) {
    questions.forEach((q, i) => { q.hidden = i !== index; });
    if (stepLabel) stepLabel.textContent = `Question ${index + 1} / ${questions.length}`;
    if (progressBar) progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
  }

  // Le rôle avec le score le plus haut gagne ; en cas d'égalité entre
  // plusieurs rôles, le profil "Flex / Polyvalent" prend le dessus.
  function computeResult() {
    const entries = Object.entries(scores);
    const maxScore = Math.max(...entries.map(([, value]) => value));
    const topRoles = entries.filter(([, value]) => value === maxScore).map(([role]) => role);
    return topRoles.length > 1 ? 'flex' : topRoles[0];
  }

  function showResult() {
    const roleKey = computeResult();
    const role = ROLE_RESULTS[roleKey];

    const iconEl = document.getElementById('quiz-result-icon');
    const titleEl = document.getElementById('quiz-result-title');
    const descEl = document.getElementById('quiz-result-desc');
    const brawlersEl = document.getElementById('quiz-result-brawlers');

    if (iconEl) iconEl.textContent = role.icon;
    if (titleEl) titleEl.textContent = role.title;
    if (descEl) descEl.textContent = role.desc;
    if (brawlersEl) {
      brawlersEl.innerHTML = role.brawlers
        .map(name => `<span class="quiz-brawler-chip">${name}</span>`)
        .join('');
    }

    questionsWrap.hidden = true;
    resultWrap.hidden = false;

    // Défilement fluide vers le résultat après la dernière réponse,
    // pour ne pas laisser l'utilisateur chercher où il est passé.
    resultWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetQuiz() {
    Object.keys(scores).forEach(role => { scores[role] = 0; });
    currentIndex = 0;
    document.querySelectorAll('#quiz-questions .quiz-option').forEach(btn => btn.classList.remove('selected'));
    resultWrap.hidden = true;
    questionsWrap.hidden = false;
    showQuestion(0);
    questionsWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  questions.forEach((question, index) => {
    const options = question.querySelectorAll('.quiz-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        options.forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        const role = option.dataset.role;
        if (role && Object.prototype.hasOwnProperty.call(scores, role)) {
          scores[role] += 1;
        }

        window.setTimeout(() => {
          if (index < questions.length - 1) {
            currentIndex = index + 1;
            showQuestion(currentIndex);
          } else {
            showResult();
          }
        }, 300);
      });
    });
  });

  if (restartBtn) restartBtn.addEventListener('click', resetQuiz);

  showQuestion(0);
}

/* ---------------------------------------------------------
   11. Cartes de guides dépliables (accordéon) — #guides
   Un clic sur la carte affiche/masque .guide-details.
--------------------------------------------------------- */
function initGuideAccordion() {
  const cards = document.querySelectorAll('#guides .guide-card[data-guide-card]');
  if (cards.length === 0) return;

  function toggleCard(card) {
    const isExpanded = card.classList.toggle('expanded');
    card.setAttribute('aria-expanded', String(isExpanded));

    const toggleText = card.querySelector('.guide-toggle-text');
    if (toggleText) {
      toggleText.textContent = isExpanded ? 'Réduire' : 'Lire la suite';
    }
  }

  cards.forEach(card => {
    // Accessibilité clavier : la carte se comporte comme un bouton
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');

    // Le bouton interne n'est qu'un indicateur visuel : la carte entière
    // gère déjà l'activation, on évite donc un second arrêt au clavier.
    const innerToggle = card.querySelector('.guide-toggle');
    if (innerToggle) innerToggle.tabIndex = -1;

    card.addEventListener('click', () => toggleCard(card));

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleCard(card);
      }
    });
  });
}

/* ---------------------------------------------------------
   Config Firebase partagée (Avis + LFG utilisent le même projet).
--------------------------------------------------------- */
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCaGCtB23h1VKjJvnNlDMh3qzLsxAGtrSI',
  authDomain: 'site-esport-vraie-version.firebaseapp.com',
  projectId: 'site-esport-vraie-version',
  storageBucket: 'site-esport-vraie-version.firebasestorage.app',
  messagingSenderId: '255435160470',
  appId: '1:255435160470:web:50acf8117b181cb0b57bb7'
};

// Initialise l'app Firebase une seule fois, quel que soit le module qui
// l'appelle en premier (Avis ou LFG). Lève une erreur si le SDK ou la
// config est indisponible — à appeler dans un try/catch.
function ensureFirebaseApp() {
  if (typeof firebase === 'undefined') {
    throw new Error('SDK Firebase (compat) non chargé');
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(FIREBASE_CONFIG);
  }
  return firebase;
}

/* ---------------------------------------------------------
   12. Avis de la communauté — Firebase Firestore (#avis)
   Envoi + lecture en temps réel (onSnapshot), tri du plus récent
   au plus ancien. Nécessite les SDK compat "firebase-app-compat.js"
   et "firebase-firestore-compat.js" chargés avant ce fichier.
--------------------------------------------------------- */
function initReviews() {
  const form = document.getElementById('review-form');
  const listEl = document.getElementById('reviews-list');
  if (!form || !listEl) return;

  const nameInput = document.getElementById('review-name');
  const commentInput = document.getElementById('review-comment');
  const ratingValueInput = document.getElementById('review-rating-value');
  const starButtons = document.querySelectorAll('.star-btn');
  const statusEl = document.getElementById('review-status');
  const submitBtn = document.getElementById('review-submit-btn');
  const countEl = document.getElementById('reviews-count');

  let selectedRating = 0;

  function setRating(value) {
    selectedRating = value;
    if (ratingValueInput) ratingValueInput.value = String(value);
    starButtons.forEach(btn => {
      const starValue = parseInt(btn.dataset.star, 10);
      btn.classList.toggle('active', starValue <= value);
      btn.setAttribute('aria-checked', String(starValue === value));
    });
  }

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'review-status' + (type ? ` ${type}` : '');
  }

  // Le choix des étoiles est une simple interaction DOM : elle doit
  // fonctionner même si Firebase ne se charge pas (réseau, bloqueur de
  // pub, SDK indisponible...). On la câble donc en tout premier, avant
  // toute dépendance à Firebase plus bas — un souci Firebase ne doit
  // jamais empêcher les étoiles de répondre au clic.
  starButtons.forEach(btn => {
    btn.addEventListener('click', () => setRating(parseInt(btn.dataset.star, 10)));
  });

  let reviewsRef;
  try {
    reviewsRef = ensureFirebaseApp().firestore().collection('avis');
  } catch (error) {
    // Une erreur d'initialisation Firebase (config invalide, Firestore non
    // activé côté console, etc.) ne doit affecter que la partie avis —
    // jamais les étoiles, déjà câblées juste au-dessus.
    console.warn('Avis : initialisation Firebase impossible', error);
    listEl.innerHTML = '<p class="reviews-empty">Les avis ne sont pas disponibles pour le moment.</p>';
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  function formatDate(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') return "à l'instant";
    try {
      return timestamp.toDate().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  // Étoiles affichées à partir de la note stockée, bornée à [0, 5] par
  // sécurité (une base ouverte en écriture peut recevoir des valeurs invalides).
  function renderStars(note) {
    const safeNote = Math.min(5, Math.max(0, Math.round(Number(note) || 0)));
    return '★'.repeat(safeNote) + '☆'.repeat(5 - safeNote);
  }

  function renderReviews(snapshot) {
    if (countEl) {
      countEl.textContent = `${snapshot.size} avis`;
    }

    if (snapshot.empty) {
      listEl.innerHTML = '<p class="reviews-empty">Aucun avis pour le moment — sois le premier à donner ton avis !</p>';
      return;
    }

    listEl.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data() || {};

      const card = document.createElement('article');
      card.className = 'review-card';

      const head = document.createElement('div');
      head.className = 'review-card-head';

      // .textContent uniquement pour tout ce qui vient d'un visiteur :
      // jamais d'innerHTML avec du contenu non maîtrisé (pseudo/commentaire).
      const author = document.createElement('span');
      author.className = 'review-author';
      author.textContent = String(data.pseudo || 'Anonyme').slice(0, 40);

      const stars = document.createElement('span');
      stars.className = 'review-stars';
      stars.textContent = renderStars(data.note);
      stars.setAttribute('aria-label', `${data.note || 0} sur 5 étoiles`);

      const date = document.createElement('span');
      date.className = 'review-date';
      date.textContent = formatDate(data.createdAt);

      head.appendChild(author);
      head.appendChild(stars);
      head.appendChild(date);

      const comment = document.createElement('p');
      comment.className = 'review-comment';
      comment.textContent = String(data.commentaire || '').slice(0, 500);

      card.appendChild(head);
      card.appendChild(comment);
      listEl.appendChild(card);
    });
  }

  reviewsRef.orderBy('createdAt', 'desc').onSnapshot(
    renderReviews,
    (error) => {
      console.warn('Avis : lecture Firestore impossible', error);
      listEl.innerHTML = '<p class="reviews-empty">Impossible de charger les avis pour le moment.</p>';
    }
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const pseudo = (nameInput.value || '').trim();
    const commentaire = (commentInput.value || '').trim();

    if (!pseudo || !commentaire || selectedRating < 1) {
      setStatus('Merci de renseigner un pseudo, une note et un commentaire.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Publication en cours…', 'loading');

    reviewsRef.add({
      pseudo: pseudo.slice(0, 40),
      note: selectedRating,
      commentaire: commentaire.slice(0, 500),
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      form.reset();
      setRating(0);
      setStatus('Merci, ton avis a bien été publié !', 'success');
    }).catch((error) => {
      console.warn('Avis : envoi Firestore impossible', error);
      setStatus("Impossible d'envoyer ton avis pour le moment. Réessaie plus tard.", 'error');
    }).finally(() => {
      submitBtn.disabled = false;
    });
  });
}

/* ---------------------------------------------------------
   13. Recherche de coéquipiers — LFG — Firebase Firestore (#lfg)
   Même projet Firebase que les avis, collection distincte ('lfg').
   Envoi + lecture en temps réel, tri du plus récent au plus ancien.
--------------------------------------------------------- */
function initLFG() {
  const form = document.getElementById('lfg-form');
  const listEl = document.getElementById('lfg-list');
  if (!form || !listEl) return;

  const pseudoInput = document.getElementById('lfg-pseudo');
  const trophiesInput = document.getElementById('lfg-trophies');
  const modeInput = document.getElementById('lfg-mode');
  const contactInput = document.getElementById('lfg-contact');
  const statusEl = document.getElementById('lfg-status');
  const submitBtn = document.getElementById('lfg-submit-btn');
  const countEl = document.getElementById('lfg-count');

  const MODE_LABELS = {
    '3v3': '3v3',
    brawlball: 'Brawlball',
    'coupe-etoiles': 'Coupe Stars',
    duel: 'Duel',
    autre: 'Autre'
  };

  // Modération légère, réalisable sans serveur : une annonce signalée
  // plusieurs fois ou trop ancienne disparaît de l'affichage (elle reste
  // en base — une vraie suppression nécessiterait une Cloud Function,
  // voir la note fournie à part).
  const REPORT_THRESHOLD = 3;
  const MAX_AGE_DAYS = 14;
  const REPORTED_IDS_KEY = 'brawlEsportFR.lfgReportedIds';

  function getReportedIds() {
    try {
      const raw = localStorage.getItem(REPORTED_IDS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function markAsReported(postId) {
    try {
      const ids = getReportedIds();
      if (!ids.includes(postId)) {
        ids.push(postId);
        localStorage.setItem(REPORTED_IDS_KEY, JSON.stringify(ids));
      }
    } catch (e) {
      // localStorage indisponible : le signalement fonctionne quand même,
      // seul le garde-fou anti-double-clic local est perdu.
    }
  }

  function setStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'review-status' + (type ? ` ${type}` : '');
  }

  let lfgRef;
  try {
    lfgRef = ensureFirebaseApp().firestore().collection('lfg');
  } catch (error) {
    console.warn('LFG : initialisation Firebase impossible', error);
    listEl.innerHTML = '<p class="reviews-empty">Les annonces ne sont pas disponibles pour le moment.</p>';
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  function formatDate(timestamp) {
    if (!timestamp || typeof timestamp.toDate !== 'function') return "à l'instant";
    try {
      return timestamp.toDate().toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  }

  function renderLFG(snapshot) {
    const now = Date.now();
    const maxAgeMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const reportedIds = getReportedIds();

    // On ne masque que ce qu'on peut évaluer avec certitude : une annonce
    // dont l'horodatage serveur n'est pas encore résolu (venant tout juste
    // d'être publiée en local) est toujours considérée comme récente.
    const visibleDocs = snapshot.docs.filter(doc => {
      const data = doc.data() || {};

      const reportsCount = Number(data.reportsCount) || 0;
      if (reportsCount >= REPORT_THRESHOLD) return false;

      if (data.createdAt && typeof data.createdAt.toMillis === 'function') {
        const ageMs = now - data.createdAt.toMillis();
        if (ageMs > maxAgeMs) return false;
      }

      return true;
    });

    if (countEl) {
      countEl.textContent = `${visibleDocs.length} annonce${visibleDocs.length > 1 ? 's' : ''}`;
    }

    if (visibleDocs.length === 0) {
      listEl.innerHTML = '<p class="reviews-empty">Aucune annonce active pour le moment — sois le premier à en publier une !</p>';
      return;
    }

    listEl.innerHTML = '';
    visibleDocs.forEach(doc => {
      const data = doc.data() || {};
      const postId = doc.id;

      const card = document.createElement('article');
      card.className = 'review-card';

      const head = document.createElement('div');
      head.className = 'review-card-head';

      // .textContent uniquement : tout ce qui vient d'un visiteur (pseudo,
      // contact) doit rester du texte brut, jamais interprété comme HTML.
      const author = document.createElement('span');
      author.className = 'review-author';
      author.textContent = String(data.pseudo || 'Anonyme').slice(0, 30);

      const trophies = document.createElement('span');
      trophies.className = 'lfg-trophies';
      const safeTrophies = Math.max(0, Math.round(Number(data.trophees) || 0));
      trophies.textContent = `🏆 ${safeTrophies.toLocaleString('fr-FR')}`;

      const date = document.createElement('span');
      date.className = 'review-date';
      date.textContent = formatDate(data.createdAt);

      head.appendChild(author);
      head.appendChild(trophies);
      head.appendChild(date);

      const meta = document.createElement('div');
      meta.className = 'lfg-meta';

      const modeTag = document.createElement('span');
      modeTag.className = 'lfg-mode-tag';
      modeTag.textContent = MODE_LABELS[data.mode] || String(data.mode || 'Autre').slice(0, 20);

      const contact = document.createElement('span');
      contact.className = 'lfg-contact';
      contact.textContent = `Contact : ${String(data.contact || '').slice(0, 40)}`;

      meta.appendChild(modeTag);
      meta.appendChild(contact);

      const reportBtn = document.createElement('button');
      reportBtn.type = 'button';
      reportBtn.className = 'lfg-report-btn';
      const alreadyReported = reportedIds.includes(postId);
      reportBtn.textContent = alreadyReported ? 'Signalé' : 'Signaler';
      reportBtn.disabled = alreadyReported;

      reportBtn.addEventListener('click', () => {
        reportBtn.disabled = true;
        reportBtn.textContent = 'Signalé';
        markAsReported(postId);

        lfgRef.doc(postId).update({
          reportsCount: firebase.firestore.FieldValue.increment(1)
        }).catch((error) => {
          console.warn('LFG : signalement impossible', error);
        });
      });

      card.appendChild(head);
      card.appendChild(meta);
      card.appendChild(reportBtn);
      listEl.appendChild(card);
    });
  }

  lfgRef.orderBy('createdAt', 'desc').onSnapshot(
    renderLFG,
    (error) => {
      console.warn('LFG : lecture Firestore impossible', error);
      listEl.innerHTML = '<p class="reviews-empty">Impossible de charger les annonces pour le moment.</p>';
    }
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const pseudo = (pseudoInput.value || '').trim();
    const trophees = parseInt(trophiesInput.value, 10);
    const mode = modeInput.value;
    const contact = (contactInput.value || '').trim();

    if (!pseudo || !mode || !contact || !Number.isFinite(trophees) || trophees < 0 || trophees > 500000) {
      setStatus('Merci de renseigner un pseudo, un nombre de trophées valide, un mode et un contact.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Publication en cours…', 'loading');

    lfgRef.add({
      pseudo: pseudo.slice(0, 30),
      trophees: trophees,
      mode: mode,
      contact: contact.slice(0, 40),
      reportsCount: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      form.reset();
      setStatus('Merci, ton annonce a bien été publiée !', 'success');
    }).catch((error) => {
      console.warn('LFG : envoi Firestore impossible', error);
      setStatus("Impossible de publier ton annonce pour le moment. Réessaie plus tard.", 'error');
    }).finally(() => {
      submitBtn.disabled = false;
    });
  });
}
