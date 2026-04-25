<h1>MboaCollecte</h1>

<p>Application web de collecte de profils culinaires étudiants. Le formulaire fonctionne en mode local, et le dashboard affiche les données partagées via Firebase si la configuration est activée.</p>

<h2>Structure du projet</h2>
<ul>
  <li><strong>index.html</strong> : questionnaire principal.</li>
  <li><strong>Assets/dashboard.html</strong> : page de visualisation des données.</li>
  <li><strong>Assets/style.css</strong> : styles pour le questionnaire et le dashboard.</li>
  <li><strong>Assets/script.js</strong> : logique de collecte locale et partage Firebase.</li>
</ul>

<h2>Installation</h2>
<ol>
  <li>Ouvre <code>index.html</code> dans un navigateur.</li>
  <li>Remplis le formulaire et soumets ton profil.</li>
  <li>Pour voir les résultats, clique sur <strong>Voir ce que les autres étudiants mangent</strong>.</li>
</ol>

<h2>Configuration Firebase</h2>
<p>Pour activer le partage en temps réel, crée un projet Firebase et une <strong>Realtime Database</strong>. Puis remplace les valeurs dans <code>Assets/script.js</code> :</p>
<pre><code>const FIREBASE_CONFIG = {
  apiKey: '<REMPLACE_PAR_TA_CLE_API>',
  authDomain: '<TON_PROJET>.firebaseapp.com',
  databaseURL: 'https://<TON_PROJET>.firebaseio.com',
  projectId: '<TON_PROJET>',
  storageBucket: '<TON_PROJET>.appspot.com',
  messagingSenderId: '<TON_SENDER_ID>',
  appId: '<TON_APP_ID>'
};
</code></pre>

<h2>Fonctionnalités</h2>
<ul>
  <li>Collecte de réponses locales via <code>localStorage</code>.</li>
  <li>Partage en temps réel via Firebase Realtime Database.</li>
  <li>Dashboard avec graphiques en barres et camembert.</li>
  <li>Export JSON pour partager les réponses manuellement si Firebase n'est pas configuré.</li>
</ul>

<h2>Notes</h2>
<p>Si Firebase n'est pas configuré, l'application fonctionne en mode local. Le formulaire ne peut être soumis qu'une seule fois par appareil.</p>
