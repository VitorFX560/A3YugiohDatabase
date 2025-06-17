import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js';
import {getAuth, onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js';
import { getFirestore,collection,getDocs,doc, getDoc} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

// acesso fire base
const firebaseConfig = {
  apiKey:            "AIzaSyDhVyOHZWAKBvDVE1B5IHHECoYZLIyQs78",
  authDomain:        "myyugiohdeckbase.firebaseapp.com",
  projectId:         "myyugiohdeckbase",
  storageBucket:     "myyugiohdeckbase.appspot.com",
  messagingSenderId: "47070645186",
  appId:             "1:47070645186:web:b98d1c621583e65483245b"
};
initializeApp(firebaseConfig);
const auth = getAuth();
const db   = getFirestore();

// Processos
const authUi           = document.getElementById('auth-ui');
const appUi            = document.getElementById('app-ui');
const authMessage      = document.getElementById('auth-message');
const btnShowLogin     = document.getElementById('show-login');
const btnShowRegister  = document.getElementById('show-register');
const loginForm        = document.getElementById('login-form');
const registerForm     = document.getElementById('register-form');
const loginEmail       = document.getElementById('login-email');
const loginPass        = document.getElementById('login-pass');
const regEmail         = document.getElementById('reg-email');
const regPass          = document.getElementById('reg-pass');
const btnLogout        = document.getElementById('btn-logout');

const deckInput        = document.getElementById('deck-selection-input');
const btnSelectDeck    = document.getElementById('select-deck-button');
const decksHint        = document.getElementById('available-decks-hint');
const selectDeckMsg    = document.getElementById('deck-selection-message');
const currentDeckLabel = document.getElementById('current-selected-deck');

const cardSearchInput  = document.getElementById('card-search-input');
const btnSearchCard    = document.getElementById('search-card-button');
const cardDetails      = document.getElementById('card-details');

const loadingCardsMsg  = document.getElementById('loading-cards-message');
const monstrosSection  = document.getElementById('monstros-section');
const monstrosCount    = document.getElementById('monstros-count');
const monstrosList     = document.getElementById('monstros-list');
const magiaSection     = document.getElementById('magia-section');
const magiaCount       = document.getElementById('magia-count');
const magiaList        = document.getElementById('magia-list');
const armadilhasSection= document.getElementById('armadilhas-section');
const armadilhasCount  = document.getElementById('armadilhas-count');
const armadilhasList   = document.getElementById('armadilhas-list');

let currentDeckId = null;

// alterna visibilidade dos formulários
btnShowLogin.onclick    = () => { registerForm.classList.add('hidden'); loginForm.classList.toggle('hidden'); authMessage.textContent=''; };
btnShowRegister.onclick = () => { loginForm.classList.add('hidden'); registerForm.classList.toggle('hidden'); authMessage.textContent=''; };

// login
loginForm.onsubmit = async e => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, loginEmail.value, loginPass.value);
  } catch (err) {
    authMessage.textContent = err.message;
  }
};

// registro
registerForm.onsubmit = async e => {
  e.preventDefault();
  try {
    await createUserWithEmailAndPassword(auth, regEmail.value, regPass.value);
  } catch (err) {
    authMessage.textContent = err.message;
  }
};

// logout
btnLogout.onclick = () => signOut(auth);

// observa mudança de estado
onAuthStateChanged(auth, user => {
  if (user) {
    authUi.classList.add('hidden');
    appUi.classList.remove('hidden');
    loadDecks();
  } else {
    appUi.classList.add('hidden');
    authUi.classList.remove('hidden');
  }
});

async function loadDecks() {
  const snap = await getDocs(collection(db, 'Decks'));
  decksHint.textContent = snap.docs.map(d => d.id).join(' • ');
}

async function loadCards(path, countEl, listEl, sectionEl) {
  const snap = await getDocs(collection(db, ...path));
  countEl.textContent = snap.size;
  listEl.innerHTML = '';
  snap.docs.forEach(d => {
    const li = document.createElement('li');
    li.textContent = d.id;
    listEl.append(li);
  });
  sectionEl.classList.remove('hidden');
}

async function loadAllCards() {
  if (!currentDeckId) return;
  loadingCardsMsg.classList.remove('hidden');
  [monstrosSection, magiaSection, armadilhasSection].forEach(s=>s.classList.add('hidden'));

  await loadCards(
    ['Decks', currentDeckId, 'Main Deck', 'Monstros',  'Cards'],
    monstrosCount, monstrosList, monstrosSection
  );
  await loadCards(
    ['Decks', currentDeckId, 'Main Deck', 'Magias',    'Cards'],
    magiaCount,   magiaList,   magiaSection
  );
  await loadCards(
    ['Decks', currentDeckId, 'Main Deck', 'Armadilhas','Cards'],
    armadilhasCount, armadilhasList, armadilhasSection
  );

  loadingCardsMsg.classList.add('hidden');
}

// Selecionar deck
btnSelectDeck.onclick = async () => {
  selectDeckMsg.textContent = '';
  const id = deckInput.value.trim();
  if (!id) return selectDeckMsg.textContent = 'Digite um ID de deck.';

  const snap = await getDoc(doc(db, 'Decks', id));
  if (!snap.exists()) return selectDeckMsg.textContent = `Deck "${id}" não encontrado.`;

  currentDeckId = id;
  currentDeckLabel.textContent = id;
  selectDeckMsg.textContent = `Deck "${id}" selecionado!`;
  await loadAllCards();
};

// Buscar card
btnSearchCard.onclick = async () => {
  const name = cardSearchInput.value.trim();
  cardDetails.innerHTML = '';
  if (!currentDeckId) {
    cardDetails.innerHTML = '<p class="text-red-500">Selecione um deck primeiro.</p>';
    return;
  }
  if (!name) {
    cardDetails.innerHTML = '<p class="text-red-500">Digite o nome do card.</p>';
    return;
  }
  for (const grp of ['Monstros','Magias','Armadilhas']) {
    const snap = await getDoc(doc(db, 'Decks', currentDeckId, 'Main Deck', grp, 'Cards', name));
    if (snap.exists()) {
      let html = `<h3 class="font-bold">${snap.id}</h3>`;
      Object.entries(snap.data()).forEach(([k,v]) => {
        html += `<p><strong>${k}:</strong> ${v}</p>`;
      });
      cardDetails.innerHTML = html;
      return;
    }
  }
  cardDetails.innerHTML = `<p class="text-yellow-600">Card "${name}" não encontrado.</p>`;
};
