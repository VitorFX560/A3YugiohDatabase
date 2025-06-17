// cards.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js';
import {
getFirestore,
  collection,
  getDocs,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js';

// → Sua configuração do Firebase (troque pelos valores do seu projeto)
const firebaseConfig = {
  apiKey:      "AIzaSyDhVyOHZWAKBvDVE1B5IHHECoYZLIyQs78",
  authDomain:  "myyugiohdeckbase.firebaseapp.com",
  projectId:   "myyugiohdeckbase",
  storageBucket:"myyugiohdeckbase.firebasestorage.app",
  messagingSenderId: "47070645186",
  appId:       "1:47070645186:web:b98d1c621583e65483245b"
};

// Inicializa o SDK cliente
initializeApp(firebaseConfig);
const db = getFirestore();

// Referências de DOM (confira que batem com o seu HTML)
const deckSelectionInput    = document.getElementById('deck-selection-input');
const selectDeckButton      = document.getElementById('select-deck-button');
const deckSelectionMessage  = document.getElementById('deck-selection-message');
const availableDecksHint    = document.getElementById('available-decks-hint');
const currentSelectedDeck   = document.getElementById('current-selected-deck');
const loadingCardsMessage   = document.getElementById('loading-cards-message');

const monstrosSection  = document.getElementById('monstros-section');
const monstrosCount    = document.getElementById('monstros-count');
const monstrosList     = document.getElementById('monstros-list');

const magiasSection    = document.getElementById('magia-section');
const magiasCount      = document.getElementById('magia-count');
const magiasList       = document.getElementById('magia-list');

const armadilhasSection= document.getElementById('armadilhas-section');
const armadilhasCount  = document.getElementById('armadilhas-count');
const armadilhasList   = document.getElementById('armadilhas-list');

const cardSearchInput  = document.getElementById('card-search-input');
const searchCardButton = document.getElementById('search-card-button');
const cardDetails      = document.getElementById('card-details');

let currentDeckId = null;

// 1) Carrega e exibe todos os decks existentes
async function loadAvailableDecks() {
  const snap = await getDocs(collection(db, 'Decks'));
  const ids  = snap.docs.map(d => d.id);
  availableDecksHint.textContent = ids.join(' • ');
}

// 2) Dado um caminho, carrega a coleção e preenche a lista
async function loadCards(pathSegments, countEl, listEl, sectionEl) {
  const snap = await getDocs(collection(db, ...pathSegments));
  countEl.textContent = snap.size;
  listEl.innerHTML = '';
  snap.docs.forEach(d => {
    const li = document.createElement('li');
    li.textContent = d.id;
    listEl.append(li);
  });
  sectionEl.classList.remove('hidden');
}

// 3) Carrega todas as 3 categorias para o deck selecionado
async function loadAllCategories() {
  if (!currentDeckId) return;
  loadingCardsMessage.classList.remove('hidden');
  [monstrosSection, magiasSection, armadilhasSection].forEach(sec => sec.classList.add('hidden'));

  await loadCards(['Decks', currentDeckId, 'Main Deck', 'Monstros',  'Cards'], monstrosCount,  monstrosList,  monstrosSection);
  await loadCards(['Decks', currentDeckId, 'Main Deck', 'Magias',    'Cards'], magiasCount,   magiasList,    magiasSection);
  await loadCards(['Decks', currentDeckId, 'Main Deck', 'Armadilhas','Cards'], armadilhasCount, armadilhasList, armadilhasSection);

  loadingCardsMessage.classList.add('hidden');
}

// 4) Seleciona um deck, valida e chama loadAllCategories()
async function handleDeckSelection() {
  const id = deckSelectionInput.value.trim();
  deckSelectionMessage.classList.add('hidden');

  if (!id) {
    deckSelectionMessage.textContent = 'Digite o ID de um deck.';
    deckSelectionMessage.classList.remove('hidden', 'text-green-500');
    deckSelectionMessage.classList.add('text-red-500');
    return;
  }

  const snap = await getDoc(doc(db, 'Decks', id));
  if (!snap.exists()) {
    deckSelectionMessage.textContent = `Deck "${id}" não encontrado.`;
    deckSelectionMessage.classList.remove('hidden', 'text-green-500');
    deckSelectionMessage.classList.add('text-red-500');
    return;
  }

  currentDeckId = id;
  currentSelectedDeck.textContent = id;
  deckSelectionMessage.textContent = `Deck "${id}" selecionado!`;
  deckSelectionMessage.classList.remove('hidden', 'text-red-500');
  deckSelectionMessage.classList.add('text-green-500');

  await loadAllCategories();
}

// 5) Busca detalhes de um único card
async function handleCardSearch() {
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

  // Tenta em cada categoria
  for (const grp of ['Monstros','Magias','Armadilhas']) {
    const docRef = doc(db, 'Decks', currentDeckId, 'Main Deck', grp, 'Cards', name);
    const snap   = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      let html = `<h3 class="font-bold">${snap.id}</h3>`;
      for (const [k,v] of Object.entries(data)) {
        html += `<p><strong>${k}:</strong> ${v}</p>`;
      }
      cardDetails.innerHTML = html;
      return;
    }
  }

  cardDetails.innerHTML = `<p class="text-yellow-600">Card "${name}" não encontrado.</p>`;
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', loadAvailableDecks);
selectDeckButton.addEventListener('click', handleDeckSelection);
deckSelectionInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleDeckSelection();
});
searchCardButton.addEventListener('click', handleCardSearch);
cardSearchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleCardSearch();
});
