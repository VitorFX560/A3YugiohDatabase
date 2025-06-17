import { createDeckSkeleton } from './deckService.js';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('\n### CRIAR DECK ###\n');

  const deckId = (await rl.question('Nome do Deck: ')).trim();
  if (!deckId) {
    console.error('Nome inválido.'); 
    rl.close();
    return;
  }

  try {
    await createDeckSkeleton(deckId);
    console.log(` Deck "${deckId}" criado com os grupos em Main Deck.`);
  } catch (e) {
    console.error('Erro ao criar o deck:', e.message);
  }

  rl.close();
}

main();
