// deckService.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// inicializa Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(new URL('./services/serviceAccountKey.json', import.meta.url))
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Grupos fixos do Main Deck
const MAIN_GROUPS = ['Monstros', 'Magia', 'Armadilhas'];

/**
 * Cria o deck raiz (sem campos) e os docs de cada grupo em Main Deck.
 * @param {string} deckId
 */
export async function createDeckSkeleton(deckId) {
  // deck raiz
  await db.doc(`Decks/${deckId}`).set({});
  // docs de grupo em Main Deck
  for (const grp of MAIN_GROUPS) {
    await db.doc(`Decks/${deckId}/Main Deck/${grp}`).set({});
  }
}

/**
 * Insere ou atualiza um card:
 * - Main Deck → Decks/{deckId}/Main Deck/{group}/Cards/{cardId}
 * - Extra Deck → Decks/{deckId}/Extra Deck/{cardId}
 *
 * @param {string} deckId
 * @param {'Main Deck'|'Extra Deck'} section
 * @param {string} cardId
 * @param {object} attrs       — atributos do card (name, type, ATK, DEF…)
 * @param {string} [group]     — apenas para Main Deck
 */
export async function upsertCard(deckId, section, cardId, attrs, group) {
  let path;
  if (section === 'Extra Deck') {
    path = `Decks/${deckId}/Extra Deck/${cardId}`;
  } else {
    if (!MAIN_GROUPS.includes(group)) {
      throw new Error(`Grupo inválido para Main Deck: ${group}`);
    }
    path = `Decks/${deckId}/Main Deck/${group}/Cards/${cardId}`;
  }
  await db.doc(path).set(attrs, { merge: true });
}

/**
 * Lista todos os IDs de decks já criados.
 * @returns {Promise<string[]>}
 */
export async function listarDecks() {
  const snap = await db.collection('Decks').get();
  return snap.docs.map(doc => doc.id);
}
