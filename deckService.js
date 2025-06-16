import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync(new URL('./services/serviceAccountKey.json', import.meta.url))
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const MAIN_GROUPS = ['Monstros', 'Magias', 'Armadilhas'];

/**
 * Cria o deck raiz (sem campos) e os docs de cada grupo em Main Deck.
 * @param {string} deckId
 */
export async function createDeckSkeleton(deckId) {
  await db.doc(`Decks/${deckId}`).set({});
  for (const grp of MAIN_GROUPS) {
    await db.doc(`Decks/${deckId}/Main Deck/${grp}`).set({});
  }
}


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
 *
 /* @returns {Promise<string[]>}
 */
export async function listarDecks() {
  const snap = await db.collection('Decks').get();
  return snap.docs.map(d => d.id);
}
