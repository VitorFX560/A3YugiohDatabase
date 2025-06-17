import {upsertCard,removeCard,listarDecks,listarCards} from './deckService.js';
import readline from 'readline/promises';
import { stdin, stdout } from 'process';

const MAIN_GROUPS = ['Monstros', 'Magias', 'Armadilhas'];

async function chooseDeck(rl) {
  const decks = await listarDecks();
  decks.forEach((d, i) => console.log(`  ${i+1}) ${d}`));
  const idx = parseInt(await rl.question(`Escolha deck [1–${decks.length}]: `),10) - 1;
  return decks[idx];
}

async function chooseSection(rl) {
  console.log('Seção: 1) Main Deck   2) Extra Deck');
  const opt = (await rl.question('Opção [1–2]: ')).trim();
  return opt === '2' ? 'Extra Deck' : 'Main Deck';
}

async function chooseGroup(rl) {
  console.log('Grupo: 1) Monstros   2) Magias   3) Armadilhas');
  const idx = parseInt(await rl.question('Opção [1–3]: '),10) - 1;
  return MAIN_GROUPS[idx];
}

async function addFlow(rl) {
  const deckId = await chooseDeck(rl);
  const section = await chooseSection(rl);
  let group;
  if (section === 'Main Deck') group = await chooseGroup(rl);

  const cardId = (await rl.question('Nome do card: ')).trim();
  const attrs = {};

  if (section === 'Main Deck' && group === 'Monstros') {
    attrs.ATK         = Number(await rl.question('ATK: ')) || 0;
    attrs.Atributo    = (await rl.question('Atributo: ')).trim();
    attrs.DEF         = Number(await rl.question('DEF: ')) || 0;
    attrs.MonstroTipo = (await rl.question('Monstro Tipo: ')).trim();
    attrs.Nivel       = Number(await rl.question('Nível: ')) || 0;
    attrs.Tipo        = (await rl.question('Tipo: ')).trim();
    attrs.Descricao   = (await rl.question('Descrição: ')).trim();
  } else {
    attrs.Descricao = (await rl.question('Descrição: ')).trim();
    attrs.Tipo      = (await rl.question('Tipo: ')).trim();
    attrs.Icone     = (await rl.question('Ícone: ')).trim();
  }

  await upsertCard(deckId, section, cardId, attrs, group);
  console.log('Card adicionado/atualizado.');
}

async function deleteFlow(rl) {
  const deckId = await chooseDeck(rl);
  const section = await chooseSection(rl);
  let group;
  if (section === 'Main Deck') group = await chooseGroup(rl);

  const cards = await listarCards(deckId, section, group);
  if (!cards.length) {
    console.log('Nenhum card para deletar nesta categoria.');
    return;
  }
  cards.forEach((c, i) => console.log(`  ${i+1}) ${c}`));
  const idx = parseInt(await rl.question(`Escolha card [1–${cards.length}]: `),10) - 1;
  const cardId = cards[idx];

  await removeCard(deckId, section, cardId, group);
  console.log('Card removido.');
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  console.log('\n### GERENCIAR CARDS ###');
  console.log('1) Adicionar/Atualizar card');
  console.log('2) Excluir card');
  const opt = (await rl.question('Opção [1–2]: ')).trim();

  try {
    if (opt === '1')      await addFlow(rl);
    else if (opt === '2') await deleteFlow(rl);
    else                  console.log('Opção inválida.');
  } catch (err) {
    console.error('Erro:', err.message);
  } finally {
    rl.close();
  }
}

main();
