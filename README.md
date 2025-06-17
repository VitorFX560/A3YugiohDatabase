Yu-Gi-Oh!

 Este app é para criar, gerenciar e visualizar seus decks de Yu-Gi-Oh! 
usando o Firebase como backend. Via linha de comando (Node.js + Admin SDK), 
você pode criar decks, montar a estrutura de “Main Deck” e “Extra Deck”, 
adicionar/atualizar/remover cards e até renomear ou excluir decks existentes.
  há uma interface responsiva (HTML + Firebase Client SDK) protegida por login (Email/Senha), 
onde você seleciona um deck, vê listas de Monstros, Magias e Armadilhas, 
e busca detalhes de qualquer card pelo nome.

===========================================================

Instalar dependências

1 - npm install
2 - npm install firebase
3 - npm install firebase-admin

===========================================================

Comandos terminal

node criarDecks.js // Cria decks de cartas
node gerenciarDecks.js // Atualiza os decks já criados
node gerenciarCards.js // Cria ou exclui cartas nos decks

===========================================================

Web menu

Iniciar Index.html (live serer)
Menu para visualizar cartas e decks criados no terminal.
