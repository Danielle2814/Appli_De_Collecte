// Script cross-page pour MboaCollecte
const STORAGE_KEY = 'mboaResponses';
const LAST_RESPONSE_KEY = 'mboaLastResponse';

// Remplace les valeurs ci-dessous par la configuration de ton projet Firebase.
const FIREBASE_CONFIG = {
  apiKey: '<REMPLACE_PAR_TA_CLE_API>',
  authDomain: '<TON_PROJET>.firebaseapp.com',
  databaseURL: 'https://<TON_PROJET>.firebaseio.com',
  projectId: '<TON_PROJET>',
  storageBucket: '<TON_PROJET>.appspot.com',
  messagingSenderId: '<TON_SENDER_ID>',
  appId: '<TON_APP_ID>'
};

const firebaseEnabled =
  FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.includes('<') &&
  FIREBASE_CONFIG.databaseURL && !FIREBASE_CONFIG.databaseURL.includes('<') &&
  FIREBASE_CONFIG.projectId && !FIREBASE_CONFIG.projectId.includes('<');
let firebaseDb = null;

function initFirebase() {
  if (!firebaseEnabled || typeof firebase === 'undefined') {
    console.warn('Firebase non configuré ou non disponible. Le partage en temps réel est désactivé.');
    return;
  }
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    firebaseDb = firebase.database();
  } catch (err) {
    console.warn('Erreur initialisation Firebase:', err);
    firebaseDb = null;
  }
}

function pushSharedResponse(response) {
  if (!firebaseDb) {
    return Promise.reject(new Error('Firebase non initialisé'));
  }
  const ref = firebaseDb.ref('responses');
  return ref.push(response);
}

function subscribeSharedResponses(listener, errorCallback) {
  if (!firebaseDb) {
    errorCallback?.(new Error('Firebase non initialisé'));
    return;
  }
  const ref = firebaseDb.ref('responses');
  ref.on('value', (snapshot) => {
    const shared = [];
    snapshot.forEach((child) => {
      const item = child.val();
      if (item) shared.push(item);
    });
    listener(shared);
  }, (error) => {
    errorCallback?.(error);
  });
}

const sampleResponses = [
  {
    id: 'demo-1',
    timestamp: '2026-04-25T09:12:00',
    equipement: ['plaque_unique', 'micro_ondes'],
    frigo_vide: '2',
    repas_3_jours: 'Riz-sauce tomate, omelette, poissions grillé',
    plat_saoulant: 'Spaghettis tout secs',
    repas_flemme: 'Indomie au cube',
    budget_max: '1000',
    ingredients: 'Riz, oeufs, huile, oignon',
    plats_capable: 'Omelette, riz sauté, sauce tomate',
    temps_max: '30',
    peur: 'rater_cuisson',
    odeur_maison: 'Odeur de poisson braisé',
    odeur_select: 'viande_braisee',
    genie_choix: 'rapide'
  },
  {
    id: 'demo-2',
    timestamp: '2026-04-24T14:40:00',
    equipement: ['frigo', 'congelateur'],
    frigo_vide: '1',
    repas_3_jours: 'Salade, poulet grillé, frites',
    plat_saoulant: 'Riz blanc sec',
    repas_flemme: 'Beignets',
    budget_max: '2000',
    ingredients: 'Pâtes, sauce, oignons',
    plats_capable: 'Spaghetti, poulet DG',
    temps_max: '60',
    peur: 'gachis',
    odeur_maison: 'Sauce arachide qui mijote',
    odeur_select: 'sauce_arachide',
    genie_choix: 'economique'
  },
  {
    id: 'demo-3',
    timestamp: '2026-04-24T20:05:00',
    equipement: ['rien'],
    frigo_vide: '3',
    repas_3_jours: 'Pain, sardines, eau chaude',
    plat_saoulant: 'Omelette pain',
    repas_flemme: 'Céréales',
    budget_max: '500',
    ingredients: 'Bouilloire, pain, sardines',
    plats_capable: 'Pain grillé, omelette',
    temps_max: '15',
    peur: 'vaisselle',
    odeur_maison: 'Oignon sauté',
    odeur_select: 'oignon_ail',
    genie_choix: 'nostalgie'
  },
  {
    id: 'demo-4',
    timestamp: '2026-04-23T18:30:00',
    equipement: ['frigo', 'micro_ondes'],
    frigo_vide: '4',
    repas_3_jours: 'Sandwich, salade, yaourt',
    plat_saoulant: 'Riz sauté',
    repas_flemme: 'Wrap rapide',
    budget_max: '1000',
    ingredients: 'Pain, salade, tomates',
    plats_capable: 'Salade composée',
    temps_max: '30',
    peur: 'temps',
    odeur_maison: 'Beignets chauds',
    odeur_select: 'beignets',
    genie_choix: 'seduction'
  }
];

function getStoredResponses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Impossible de lire les données locales', err);
    return [];
  }
}

function setStoredResponses(responses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
}

function getLastResponse() {
  try {
    return JSON.parse(localStorage.getItem(LAST_RESPONSE_KEY));
  } catch (err) {
    return null;
  }
}

function setLastResponse(response) {
  localStorage.setItem(LAST_RESPONSE_KEY, JSON.stringify(response));
}

function getPageId() {
  return window.location.pathname.split('/').pop();
}

function pageIsIndex() {
  return getPageId().toLowerCase().includes('index');
}

function pageIsDashboard() {
  return getPageId().toLowerCase().includes('dashboard');
}

function formatLabel(value) {
  return value
    .replace(/_/g, ' ')
    .replace(/^(.)/, (c) => c.toUpperCase());
}

function createColorPalette(count) {
  const baseColors = ['#E67E22', '#3498DB', '#2ECC71', '#E74C3C', '#9B59B6', '#F1C40F', '#1ABC9C', '#D35400'];
  return Array.from({ length: count }, (_, index) => baseColors[index % baseColors.length]);
}

function sortCounts(countMap) {
  return Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

function drawBarChart(canvas, labels, values, color) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth * devicePixelRatio;
  const height = canvas.clientHeight * devicePixelRatio;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  const maxValue = Math.max(...values, 1);
  const barWidth = width / (values.length * 2);
  labels.forEach((label, idx) => {
    const barHeight = (values[idx] / maxValue) * (height * 0.6);
    const x = idx * barWidth * 2 + barWidth * 0.5;
    const y = height - barHeight - 25 * devicePixelRatio;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = '#2C3E50';
    ctx.font = `${12 * devicePixelRatio}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(values[idx], x + barWidth / 2, y - 8 * devicePixelRatio);
    ctx.fillText(label, x + barWidth / 2, height - 8 * devicePixelRatio);
  });
}

function drawPieChart(canvas, labels, values, colors) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.clientWidth * devicePixelRatio;
  const height = canvas.clientHeight * devicePixelRatio;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);
  const total = values.reduce((sum, val) => sum + val, 0) || 1;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.35;
  let startAngle = -Math.PI / 2;
  values.forEach((value, index) => {
    const slice = (value / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[index];
    ctx.fill();
    startAngle += slice;
  });
}

function buildLegend(containerId, labels, values, colors) {
  const target = document.getElementById(containerId);
  if (!target) return;
  target.innerHTML = '';
  labels.forEach((label, idx) => {
    const item = document.createElement('div');
    item.className = 'chart-legend-item';
    const marker = document.createElement('span');
    marker.className = 'chart-legend-color';
    marker.style.backgroundColor = colors[idx];
    const text = document.createElement('span');
    text.textContent = `${label} (${values[idx]})`;
    item.appendChild(marker);
    item.appendChild(text);
    target.appendChild(item);
  });
}

function renderDashboard(sharedResponses = null) {
  const stored = getStoredResponses();
  const responses = sharedResponses
    ? [...sampleResponses, ...sharedResponses]
    : stored.length > 0
      ? [...sampleResponses, ...stored]
      : sampleResponses;

  const total = responses.length;
  const budgetSum = responses.reduce((sum, entry) => sum + Number(entry.budget_max || '0'), 0);
  const budgetMoyen = total === 0 ? 0 : Math.round(budgetSum / total);

  document.getElementById('total-reponses').textContent = total;
  document.getElementById('budget-moyen').textContent = `${budgetMoyen} FCFA`;

  const usingShared = sharedResponses !== null && sharedResponses.length > 0;
  const fromLocal = stored.length > 0 ? stored.length : 0;
  if (firebaseEnabled) {
    document.getElementById('insight-box').textContent = usingShared
      ? `Données partagées en temps réel. Le dashboard montre maintenant les réponses de tous les utilisateurs.`
      : 'Connexion à la base partagée... Si elle est active, les réponses s’afficheront ici en direct.';
  } else {
    document.getElementById('insight-box').textContent = fromLocal
      ? `Données locales : ${fromLocal} réponses enregistrées sur ton téléphone. Elles sont incluses dans le dashboard.`
      : 'Aucune réponse locale détectée. Envoie un profil depuis le questionnaire pour voir tes données ici.';
  }

  const countBy = (key, extractor) => {
    return responses.reduce((acc, entry) => {
      const value = extractor ? extractor(entry[key], entry) : entry[key];
      if (Array.isArray(value)) {
        value.forEach((item) => { acc[item] = (acc[item] || 0) + 1; });
      } else {
        acc[value] = (acc[value] || 0) + 1;
      }
      return acc;
    }, {});
  };

  const topPlat = sortCounts(countBy('plat_saoulant')).slice(0, 5);
  const topFlemme = sortCounts(countBy('repas_flemme')).slice(0, 5);
  const odeurs = sortCounts(countBy('odeur_select')).slice(0, 5);
  const equipementCounts = sortCounts(countBy('equipement')).slice(0, 6);
  const peurCounts = sortCounts(countBy('peur')).slice(0, 6);
  const budgetCounts = sortCounts(countBy('budget_max')).slice(0, 5);
  const odeursMaison = countBy('odeur_maison');
  const maisonItems = Object.entries(odeursMaison).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const drawChart = (canvasId, labels, values, colors, legendId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (legendId) {
      buildLegend(legendId, labels, values, colors);
    }
    const pieCharts = ['odeurChart'];
    if (pieCharts.includes(canvasId)) {
      drawPieChart(canvas, labels, values, colors);
    } else if (labels.length > 0) {
      drawBarChart(canvas, labels, values, colors[0]);
    }
  };

  drawChart('platSaoulantChart', topPlat.map(([label]) => label), topPlat.map(([, count]) => count), createColorPalette(topPlat.length), null);
  drawChart('repasFlemmeChart', topFlemme.map(([label]) => label), topFlemme.map(([, count]) => count), createColorPalette(topFlemme.length), null);
  drawChart('odeurChart', odeurs.map(([label]) => formatLabel(label)), odeurs.map(([, count]) => count), createColorPalette(odeurs.length), 'odeur-legend');
  drawChart('equipementChart', equipementCounts.map(([label]) => formatLabel(label)), equipementCounts.map(([, count]) => count), createColorPalette(equipementCounts.length), 'equipement-legend');
  drawChart('peurChart', peurCounts.map(([label]) => formatLabel(label)), peurCounts.map(([, count]) => count), createColorPalette(peurCounts.length), 'peur-legend');
  drawChart('budgetChart', budgetCounts.map(([label]) => `${label} FCFA`), budgetCounts.map(([, count]) => count), createColorPalette(budgetCounts.length), 'budget-legend');

  const odeursMaisonContainer = document.getElementById('odeurs-maison-container');
  if (odeursMaisonContainer) {
    odeursMaisonContainer.innerHTML = maisonItems.length
      ? maisonItems.map(([mot, count]) => `<span class="mot-tag">${mot} (${count})</span>`).join('')
      : '<span>Aucune donnée disponible.</span>';
  }

  const last = getLastResponse();
  const localResponseContainer = document.getElementById('local-response-container');
  if (localResponseContainer) {
    localResponseContainer.innerHTML = last
      ? `<strong>Dernière réponse envoyée :</strong><br>${new Date(last.timestamp).toLocaleString()}<br><em>${last.plat_saoulant}</em> / <em>${last.repas_flemme}</em> / ${last.budget_max} FCFA`
      : 'Aucune réponse locale détectée.';
  }
}

function setupExportImport() {
  const exportBtn = document.getElementById('export-data-btn');
  const importBtn = document.getElementById('import-data-btn');
  const fileInput = document.getElementById('import-file-input');
  const status = document.getElementById('share-status');

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const data = getStoredResponses();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mboa_reponses.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (status) status.textContent = 'Données exportées localement. Tu peux les partager par AirDrop / Bluetooth / message.';
    });
  }

  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        const incoming = JSON.parse(text);
        if (!Array.isArray(incoming)) throw new Error('Format invalide');
        const current = getStoredResponses();
        const merged = [...current, ...incoming.filter((item) => item && item.id)];
        setStoredResponses(merged);
        if (status) status.textContent = 'Données importées avec succès. Le dashboard est mis à jour.';
        renderDashboard();
      } catch (err) {
        if (status) status.textContent = 'Impossible d’importer le fichier. Vérifie qu’il s’agit d’un export JSON valide.';
      }
      event.target.value = '';
    });
  }
}

function disableIndexForm(message) {
  const form = document.getElementById('sondage-form');
  const submitBtn = document.getElementById('submit-btn');
  const messageEl = document.getElementById('form-message');

  if (form) {
    Array.from(form.elements).forEach((field) => {
      if (field.tagName !== 'A' && field.type !== 'hidden') {
        field.disabled = true;
      }
    });
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Questionnaire déjà envoyé';
  }
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.style.color = '#E74C3C';
  }
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initIndexPage() {
  const budgetButtons = Array.from(document.querySelectorAll('.btn-choice'));
  const budgetInput = document.getElementById('budget-input');
  const form = document.getElementById('sondage-form');
  const messageEl = document.getElementById('form-message');
  const exportLocalBtn = document.getElementById('export-local-data-btn');
  const shareHint = document.getElementById('share-hint');

  if (firebaseEnabled) {
    initFirebase();
  }

  const localResponses = getStoredResponses();
  if (localResponses.length > 0) {
    disableIndexForm('Tu as déjà rempli le questionnaire une fois. Le questionnaire ne peut être soumis qu’une seule fois par appareil.');
    if (exportLocalBtn) {
      exportLocalBtn.disabled = false;
      exportLocalBtn.addEventListener('click', () => {
        downloadJsonFile('mboa_reponses_partagees.json', localResponses);
        if (shareHint) shareHint.textContent = 'Fichier exporté. Partage-le pour que d’autres utilisateurs puissent l’importer dans leur dashboard.';
      });
    }
    return;
  }

  if (exportLocalBtn) {
    exportLocalBtn.disabled = true;
    if (shareHint) shareHint.textContent = 'Le bouton s’active après le premier envoi pour partager ton profil.';
  }

  budgetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      budgetButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      if (budgetInput) budgetInput.value = button.dataset.budget || '1000';
    });
  });

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const values = {
        id: `resp-${Date.now()}`,
        timestamp: new Date().toISOString(),
        equipement: Array.from(document.querySelectorAll('input[name="equipement"]:checked')).map((input) => input.value),
        frigo_vide: document.getElementById('frigo-vide')?.value || '',
        repas_3_jours: document.getElementById('repas-3-jours')?.value.trim() || 'Non précisé',
        plat_saoulant: document.getElementById('plat-saoulant')?.value.trim() || 'Non précisé',
        repas_flemme: document.getElementById('repas-flemme')?.value.trim() || 'Non précisé',
        budget_max: budgetInput?.value || '1000',
        ingredients: document.getElementById('ingredients-input')?.value.trim() || 'Non précisé',
        plats_capable: document.getElementById('plats-capable')?.value.trim() || 'Non précisé',
        temps_max: document.getElementById('temps-max')?.value || '30',
        peur: document.querySelector('input[name="peur"]:checked')?.value || 'rater_cuisson',
        odeur_maison: document.getElementById('odeur-maison')?.value.trim() || 'Non précisé',
        odeur_select: document.getElementById('odeur-select')?.value || 'friture_poisson',
        genie_choix: document.getElementById('genie-choix')?.value || 'rapide'
      };

      const responses = getStoredResponses();
      responses.push(values);
      setStoredResponses(responses);
      setLastResponse(values);

      const firebasePromise = firebaseDb ? pushSharedResponse(values) : Promise.reject(new Error('Firebase non disponible'));

      firebasePromise.then(() => {
        if (messageEl) {
          messageEl.textContent = 'Merci ! Ton profil culinaire est sauvegardé localement et partagé en direct pour tous.';
          messageEl.style.color = '#2ECC71';
        }
      }).catch(() => {
        if (messageEl) {
          messageEl.textContent = 'Ton profil est sauvegardé localement. Le partage en direct n’est pas disponible.';
          messageEl.style.color = '#E67E22';
        }
      }).finally(() => {
        disableIndexForm('Ton questionnaire a bien été enregistré. Tu ne peux le soumettre qu’une seule fois.');
        if (exportLocalBtn) {
          exportLocalBtn.disabled = false;
          exportLocalBtn.addEventListener('click', () => {
            downloadJsonFile('mboa_reponses_partagees.json', getStoredResponses());
            if (shareHint) shareHint.textContent = 'Fichier exporté. Partage-le pour que d’autres utilisateurs puissent l’importer dans leur dashboard.';
          });
        }
      });
    });
  }
}

function runApp() {
  if (pageIsIndex()) {
    initIndexPage();
  }
  if (pageIsDashboard()) {
    if (firebaseEnabled) {
      initFirebase();
      subscribeSharedResponses(
        (shared) => {
          renderDashboard(shared);
        },
        () => {
          renderDashboard();
        }
      );
    } else {
      renderDashboard();
    }
    setupExportImport();
  }
}

runApp();
