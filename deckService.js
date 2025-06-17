// deckService.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// inicializa Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(new URL('./services/serviceAccountKey.json', import.meta.url))
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const MAIN_GROUPS = ['Monstros', 'Magias', 'Armadilhas'];


 // Cria o deck raiz e os docs de cada grupo em Main Deck.

export async function createDeckSkeleton(deckId) {
  await db.doc(`Decks/${deckId}`).set({});
  for (const grp of MAIN_GROUPS) {
    await db.doc(`Decks/${deckId}/Main Deck/${grp}`).set({});
  }
}

// Insere/atualiza um card.
 
export async function upsertCard(deckId, section, cardId, attrs, group) {
  const path = 
    section === 'Extra Deck'
      ? `Decks/${deckId}/Extra Deck/${cardId}`
      : `Decks/${deckId}/Main Deck/${group}/Cards/${cardId}`;
  await db.doc(path).set(attrs, { merge: true });
}


 // Remove um card.
 
export async function removeCard(deckId, section, cardId, group) {
  const path = 
    section === 'Extra Deck'
      ? `Decks/${deckId}/Extra Deck/${cardId}`
      : `Decks/${deckId}/Main Deck/${group}/Cards/${cardId}`;
  await db.doc(path).delete();
}


 // Lista todos os IDs de decks existentes.

export async function listarDecks() {
  const snap = await db.collection('Decks').get();
  return snap.docs.map(d => d.id);
}

/**
 * Lista todos os IDs de cards em uma categoria.
 * @param {string} deckId
 * @param {'Main Deck'|'Extra Deck'} section
 * @param {string} [group] para Main Deck
 */
export async function listarCards(deckId, section, group) {
  let ref;
  if (section === 'Extra Deck') {
    ref = db.collection(`Decks/${deckId}/Extra Deck`);
  } else {
    ref = db.collection(`Decks/${deckId}/Main Deck/${group}/Cards`);
  }
  const snap = await ref.get();
  return snap.docs.map(d => d.id);
}
