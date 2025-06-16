import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { upsertCard, listarDecks } from './deckService.js';

const MAIN_GROUPS = ['Monstros', 'Magia', 'Armadilhas'];

async function main() {
  const rl = readline.createInterface({ input, output });
  console.log('\n→ ADICIONAR CARD ←\n');

  // 1) Lista decks existentes
  const decks = await listarDecks();
  if (decks.length === 0) {
    console.log('❌ Não há decks cadastrados. Primeiro crie um deck.');
    rl.close();
    return;
  }
  decks.forEach((id, i) => console.log(`  ${i+1}) ${id}`));
  const idxDeck = parseInt(
    await rl.question('\nEscolha um deck [1–'+decks.length+']: '),
    10
  ) - 1;
  if (idxDeck < 0 || idxDeck >= decks.length) {
    console.log('❌ Escolha inválida.');
    rl.close();
    return;
  }
  const deckId = decks[idxDeck];
  console.log(`→ Deck selecionado: ${deckId}\n`);

  // 2) Escolhe seção
  console.log('Seção: 1) Main Deck   2) Extra Deck');
  const secOpt  = (await rl.question('Escolha [1–2]: ')).trim();
  const section = secOpt === '2' ? 'Extra Deck' : 'Main Deck';

  // 3) Se Main Deck, escolhe grupo
  let group;
  if (section === 'Main Deck') {
    console.log('\nGrupo:');
    MAIN_GROUPS.forEach((g, i) => console.log(`  ${i+1}) ${g}`));
    const idxG = parseInt(await rl.question('Escolha [1–3]: '), 10) - 1;
    if (idxG < 0 || idxG > 2) {
      console.log('❌ Grupo inválido.');
      rl.close();
      return;
    }
    group = MAIN_GROUPS[idxG];
    console.log(`→ Grupo selecionado: ${group}\n`);
  }

  // 4) Dados do card
  const cardId      = (await rl.question('ID do card (sem espaços): ')).trim();
  const name        = (await rl.question('Nome do card: ')).trim();
  const type        = (await rl.question('Tipo (ex: Spell Card): ')).trim();
  const atkStr      = (await rl.question('ATK (ou vazio): ')).trim();
  const defStr      = (await rl.question('DEF (ou vazio): ')).trim();
  const description = (await rl.question('Descrição (opcional): ')).trim();

  rl.close();

  // 5) Monta objeto attrs
  const attrs = { name, type };
  if (atkStr) attrs.ATK = Number(atkStr);
  if (defStr) attrs.DEF = Number(defStr);
  if (description) attrs.description = description;

  // 6) Grava no Firestore
  try {
    await upsertCard(deckId, section, cardId, attrs, group);
    console.log('\n✅ Card inserido com sucesso em', section + (group ? ` → ${group}` : ''));
  } catch (e) {
    console.error('\n❌ Erro ao inserir card:', e.message);
  }
}

main();
