// adicionarCards.js
import { upsertCard, listarDecks } from './deckService.js';
import readline from 'readline/promises';
import { stdin, stdout } from 'process';

const MAIN_GROUPS = ['Monstros', 'Magias', 'Armadilhas'];

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    // 1) lista decks
    const decks = await listarDecks();
    if (decks.length === 0) {
      console.error('❌ Não há decks cadastrados. Crie um deck primeiro.');
      return;
    }
    console.log('\nDecks disponíveis:');
    decks.forEach((d, i) => console.log(`  ${i + 1}) ${d}`));
    const idxDeck = parseInt(
      await rl.question(`\nEscolha um deck [1–${decks.length}]: `),
      10
    ) - 1;
    if (idxDeck < 0 || idxDeck >= decks.length) {
      console.error('❌ Seleção inválida de deck.');
      return;
    }
    const deckId = decks[idxDeck];
    console.log(`\nDeck selecionado: ${deckId}\n`);

    // 2) escolhe seção
    console.log('Seção: 1) Main Deck   2) Extra Deck');
    const secOpt = await rl.question('Escolha [1–2]: ');
    const section = secOpt.trim() === '2' ? 'Extra Deck' : 'Main Deck';

    // 3) se Main Deck, escolhe grupo
    let group;
    if (section === 'Main Deck') {
      console.log('\nGrupo: 1) Monstros   2) Magias   3) Armadilhas');
      const idxG = parseInt(await rl.question('Escolha [1–3]: '), 10) - 1;
      if (idxG < 0 || idxG >= MAIN_GROUPS.length) {
        console.error('❌ Seleção inválida de grupo.');
        return;
      }
      group = MAIN_GROUPS[idxG];
      console.log(`Grupo selecionado: ${group}\n`);
    }

    // 4) ID do card
    const cardId = (await rl.question('ID do card (sem espaços): ')).trim();
    if (!cardId) {
      console.error('❌ ID do card não pode ficar vazio.');
      return;
    }

    // 5) atributos dinâmicos
    const attrs = {};
    if (section === 'Main Deck' && group === 'Monstros') {
      const atk = await rl.question('ATK: ');
      const def = await rl.question('DEF: ');
      const nivel = await rl.question('Nível: ');
      attrs.ATK = Number(atk) || 0;
      attrs.DEF = Number(def) || 0;
      attrs.Nivel = Number(nivel) || 0;
      attrs.Atributo   = (await rl.question('Atributo: ')).trim();
      attrs.MonstroTipo = (await rl.question('Monstro Tipo: ')).trim();
      attrs.Tipo       = (await rl.question('Tipo: ')).trim();
      attrs.Descricao  = (await rl.question('Descrição: ')).trim();
    } else {
      attrs.Descricao = (await rl.question('Descrição: ')).trim();
      attrs.Tipo      = (await rl.question('Tipo: ')).trim();
      attrs.Icone     = (await rl.question('Ícone: ')).trim();
    }

    // 6) grava no Firestore
    await upsertCard(deckId, section, cardId, attrs, group);
    console.log('\n✔ Card inserido com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao adicionar o card:', err.message);
  } finally {
    rl.close();
  }
}

main();
