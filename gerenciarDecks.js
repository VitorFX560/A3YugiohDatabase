import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

// Inicializa Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(new URL('./services/serviceAccountKey.json', import.meta.url))
);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// Retorna todos os IDs de deck sob a coleção 'Decks' 
async function listarDecks() {
  const snap = await db.collection('Decks').get();
  return snap.docs.map(doc => doc.id);
}

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('\n### GERENCIAR DECKS ###\n');

  // 1) Lista decks
  const deckIds = await listarDecks();
  if (deckIds.length === 0) {
    console.log('Nenhum deck encontrado. Saindo.');
    rl.close();
    return;
  }
  deckIds.forEach((id, i) => console.log(`  ${i+1}) ${id}`));
  const idxDeck = parseInt(await rl.question('\nEscolha um deck [1–'+deckIds.length+']: '), 10);
  if (!(idxDeck >= 1 && idxDeck <= deckIds.length)) {
    console.error('Escolha inválida. Saindo.');
    rl.close();
    return;
  }
  const deckId = deckIds[idxDeck - 1];
  console.log(`\nDeck selecionado: ${deckId}\n`);

  // 2) Menu de ações
  console.log('O que deseja fazer?');
  console.log('  1) Atualizar nome');
  console.log('  2) Atualizar descrição');
  console.log('  3) Deletar deck');
  console.log('  4) Cancelar');
  const action = parseInt(await rl.question('Escolha [1–4]: '), 10);

  try {
    switch (action) {
      case 1: {
        const novoNome = (await rl.question('Novo nome do deck: ')).trim();
        await db.doc(`Decks/${deckId}`).update({ name: novoNome });
        console.log(` Nome atualizado para '${novoNome}'`);
        break;
      }
      case 2: {
        const novaDesc = (await rl.question('Descrição do deck: ')).trim();
        await db.doc(`Decks/${deckId}`).update({ description: novaDesc });
        console.log(`Descrição atualizada para:\n  "${novaDesc}"`);
        break;
      }
      case 3: {
        const confirm = (await rl.question('Confirma excluir TODO o deck? [s/n]: ')).trim().toLowerCase();
        if (confirm === 's') {
          await db.recursiveDelete(db.doc(`Decks/${deckId}`));
          console.log(`Deck '${deckId}' e toda a hierarquia removidos.`);
        } else {
          console.log('Operação de exclusão cancelada.');
        }
        break;
      }
      default:
        console.log('Operação cancelada.');
    }
  } catch (e) {
    console.error('Erro durante a operação:', e.message);
  }

  rl.close();
}

main();
