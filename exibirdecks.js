

// Importações do Firebase SDK usando os URLs completos da CDN
// Garanta que a versão (ex: 10.12.2) seja a mesma que você usa no seu index.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Sua configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDhVyOHZWAKBvDVE1B5IHHECoYZLIyQs78",
    authDomain: "myyugiohdeckbase.firebaseapp.com",
    projectId: "myyugiohdeckbase",
    storageBucket: "myyugiohdeckbase.firebasestorage.app",
    messagingSenderId: "47070645186",
    appId: "1:47070645186:web:b98d1c621583e65483245b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função assíncrona principal para buscar e exibir os dados dos decks
const fetchAndDisplayDecks = async () => {
    // Seleciona o elemento h1 principal da página para exibir o título e a contagem
    const mainTitle = document.querySelector('h1');
    // Seleciona o contêiner onde os detalhes dos decks serão exibidos
    const decksContainer = document.getElementById('decks-container');
    // Exibe uma mensagem de carregamento inicial
    decksContainer.innerHTML = '<p>Buscando documentos...</p>';

    try {
        // 1. Consulta apenas a coleção principal de 'Decks'
        const decksCollectionRef = collection(db,'Decks');
        console.log(`[DEBUG] Buscando documentos na coleção: Decks`);
        const queryDecksSnapshot = await getDocs(decksCollectionRef);

        // Obtém a quantidade de documentos encontrados na coleção 'Decks'
        const deckCount = queryDecksSnapshot.size;

        // Atualiza o título principal da página
        mainTitle.textContent = "Meus Decks";

        // Verifica se a coleção de decks está vazia
        if (queryDecksSnapshot.empty) {
            decksContainer.innerHTML = `<p>Decks: ${deckCount}</p><p>Nenhum documento encontrado na coleção "Decks".</p>`;
            console.log('Nenhum documento encontrado na coleção Decks.');
            return; // Sai da função se não houver documentos
        }

        // Prepara o HTML para exibir a contagem e a lista de decks
        let decksHtml = `<p>Decks: ${deckCount}</p>`; // Exibe a contagem de decks

        // Itera sobre cada documento encontrado na coleção 'Decks'
        queryDecksSnapshot.forEach((doc) => {
            // Não precisamos pegar os dados do documento para esta exibição simplificada
            decksHtml += `
                <div class="deck-item">
                    <h2>Deck: ${doc.id}</h2> <!-- Exibe o ID do documento como o nome do Deck -->
                </div>
            `;
            console.log('Deck encontrado:', doc.id); // Loga o ID do documento para depuração
        });
        decksContainer.innerHTML = decksHtml; // Insere o HTML gerado na div container

    } catch (error) {
        // Captura e exibe qualquer erro que ocorra durante a busca
        console.error('Erro ao buscar documentos da coleção Decks:', error);
        decksContainer.innerHTML = `<p class="error-message">Erro ao carregar os decks: ${error.message}</p>`;
    }
};

// Adiciona um listener para chamar a função quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', fetchAndDisplayDecks);

