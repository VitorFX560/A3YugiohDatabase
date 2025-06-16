import { createDeckSkeleton } from './deckService.js';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('\n ### CRIAR DECK ### \n');

  const deckId = (await rl.question('Nome do Deck: ')).trim();
  await createDeckSkeleton(deckId);
    console.log(`✅ "${deckId}" criado com sucesso.`);
    rl.close();
}

main();
