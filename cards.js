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


// Variável global para armazenar o ID do deck atualmente selecionado pelo usuário
let currentSelectedDeckId = null;
// Array para armazenar todos os IDs de decks disponíveis, usado para validação da entrada do usuário
let allAvailableDeckIds = []; 

// --- Referências aos Elementos HTML ---
// Elementos relacionados à seleção de deck
const deckSelectionInput = document.getElementById('deck-selection-input');
const selectDeckButton = document.getElementById('select-deck-button');
const deckSelectionMessage = document.getElementById('deck-selection-message');
const availableDecksHint = document.getElementById('available-decks-hint');
const currentSelectedDeckDisplay = document.getElementById('current-selected-deck');

// Elementos relacionados à exibição de listas de cards
const loadingCardsMessage = document.getElementById('loading-cards-message');
const monstrosSection = document.getElementById('monstros-section');
const monstrosCountElement = document.getElementById('monstros-count');
const monstrosListElement = document.getElementById('monstros-list');
const magiaSection = document.getElementById('magia-section');
const magiaCountElement = document.getElementById('magia-count');
const magiaListElement = document.getElementById('magia-list');
const armadilhasSection = document.getElementById('armadilhas-section');
const armadilhasCountElement = document.getElementById('armadilhas-count');
const armadilhasListElement = document.getElementById('armadilhas-list');

// Elementos relacionados à busca de card
const cardSearchInput = document.getElementById('card-search-input');
const searchCardButton = document.getElementById('search-card-button');
const cardDetailsElement = document.getElementById('card-details');

/**
 * Exibe uma mensagem de feedback ao usuário na interface.
 * @param {string} message - A mensagem de texto a ser exibida.
 * @param {boolean} isError - Se true, a mensagem é exibida como erro (texto vermelho); caso contrário, como informação (texto verde).
 */
const showFeedbackMessage = (message, isError) => {
    deckSelectionMessage.textContent = message;
    deckSelectionMessage.classList.remove('hidden', 'text-green-500', 'text-red-500');
    if (isError) {
        deckSelectionMessage.classList.add('text-red-500');
    } else {
        deckSelectionMessage.classList.add('text-green-500');
    }
};

/**
 * Função auxiliar para buscar a contagem e os nomes (IDs) dos documentos em uma coleção do Firestore.
 * @param {import("firebase/firestore").CollectionReference} collectionRef - A referência da coleção a ser consultada.
 * @returns {Promise<{count: number, cardNames: string[]}>} - Um objeto contendo a contagem de documentos e um array com seus nomes (IDs). Retorna 0 e um array vazio em caso de erro.
 */
const getCollectionData = async (collectionRef) => {
    try {
        const snapshot = await getDocs(collectionRef);
        const cardNames = snapshot.docs.map(doc => doc.id); // Mapeia para obter apenas os IDs dos documentos (nomes dos cards)
        return { count: snapshot.size, cardNames: cardNames };
    } catch (error) {
        console.error(`Erro ao obter dados para a coleção ${collectionRef.path}:`, error);
        return { count: 0, cardNames: [] };
    }
};

/**
 * Carrega e exibe os nomes de todos os decks disponíveis para servir como dica para o usuário.
 */
const loadAvailableDecksHint = async () => {
    try {
        // Ajusta o caminho da coleção para o padrão do ambiente Canvas para dados públicos
        const decksCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'Decks');
        console.log("Tentando buscar decks do caminho:", decksCollectionRef.path);
        const queryDecksSnapshot = await getDocs(decksCollectionRef);

        if (queryDecksSnapshot.empty) {
            availableDecksHint.textContent = 'Nenhum deck encontrado.';
            allAvailableDeckIds = []; // Garante que o array esteja vazio se não houver decks
            return;
        }

        // Popula o array global com os IDs de todos os decks
        allAvailableDeckIds = queryDecksSnapshot.docs.map(doc => doc.id);
        // Exibe os IDs dos decks como uma lista separada por vírgulas na dica
        availableDecksHint.textContent = allAvailableDeckIds.join(', ');
    }
    catch (error) {
        console.error('Erro ao carregar decks disponíveis para dica:', error);
        availableDecksHint.textContent = 'Erro ao carregar decks.';
    }
};

/**
 * Lida com a seleção de um deck pelo usuário (via campo de texto e botão).
 * Valida a entrada e, se válida, carrega os cards do deck selecionado.
 */
const handleDeckSelection = async () => {
    const deckIdInput = deckSelectionInput.value.trim(); // Pega o valor do input e remove espaços em branco
    
    // Esconde qualquer mensagem de feedback anterior
    deckSelectionMessage.classList.add('hidden');

    // Valida se o campo de input está vazio
    if (!deckIdInput) {
        showFeedbackMessage('Por favor, digite o nome de um deck.', true);
        return;
    }

    // Valida se o deck digitado existe na lista de decks disponíveis
    if (!allAvailableDeckIds.includes(deckIdInput)) {
        showFeedbackMessage(`Deck "${deckIdInput}" não encontrado. Verifique a grafia.`, true);
        // Reseta o estado da UI para "nenhum deck selecionado"
        currentSelectedDeckId = null;
        currentSelectedDeckDisplay.textContent = 'Nenhum';
        loadingCardsMessage.textContent = 'Selecione um deck válido para carregar os cards...';
        loadingCardsMessage.classList.remove('hidden'); // Garante que a mensagem seja visível
        // Oculta as seções de cards vazias
        monstrosSection.classList.add('hidden');
        magiaSection.classList.add('hidden');
        armadilhasSection.classList.add('hidden');
        cardDetailsElement.innerHTML = '<p>Nenhum card selecionado para exibição.</p>';
        return;
    }

    // Se o deck for válido, atualiza o deck selecionado e carrega os cards
    currentSelectedDeckId = deckIdInput;
    currentSelectedDeckDisplay.textContent = deckIdInput; // Atualiza o display do deck selecionado na UI
    showFeedbackMessage(`Deck "${deckIdInput}" selecionado com sucesso!`, false); // Feedback de sucesso
    
    // Inicia o carregamento dos cards para o deck selecionado
    await loadCardsForSelectedDeck();
};


/**
 * Carrega e exibe os cards (Monstros, Magia, Armadilhas) para o deck atualmente selecionado.
 */
const loadCardsForSelectedDeck = async () => {
    // Exibe mensagem de carregamento e oculta seções de cards anteriores
    loadingCardsMessage.classList.remove('hidden');
    monstrosSection.classList.add('hidden');
    magiaSection.classList.add('hidden');
    armadilhasSection.classList.add('hidden');
    
    // Limpa as listas de cards para evitar duplicações ou dados antigos
    monstrosListElement.innerHTML = '';
    magiaListElement.innerHTML = '';
    armadilhasListElement.innerHTML = '';
    
    // Limpa os detalhes de busca de card
    cardDetailsElement.innerHTML = '<p>Nenhum card selecionado para exibição.</p>';

    if (!currentSelectedDeckId) {
        loadingCardsMessage.textContent = 'Por favor, selecione um deck para carregar os cards.';
        return;
    }

    try {
        console.log(`Carregando cards para o deck: ${currentSelectedDeckId}`);
        // Define os tipos de cards a serem buscados e os elementos HTML correspondentes
        const cardTypes = [
            { name: 'Monstros', countElement: monstrosCountElement, listElement: monstrosListElement, sectionElement: monstrosSection },
            { name: 'Magia', countElement: magiaCountElement, listElement: magiaListElement, sectionElement: magiaSection },
            { name: 'Armadilhas', countElement: armadilhasCountElement, listElement: armadilhasListElement, sectionElement: armadilhasSection }
        ];

        // Itera sobre cada tipo de card e busca seus dados no Firestore
        for (const type of cardTypes) {
            // Constrói a referência para a coleção de cards dentro do deck e tipo específicos
            // Adaptação para o caminho do Firestore no ambiente Canvas
            const cardsCollectionRef = collection(db, 'artifacts', appId, 'public', 'data', 'Decks', currentSelectedDeckId, 'Main Deck', type.name, 'Cards');
            // Obtém a contagem e os nomes dos cards da coleção
            const { count, cardNames } = await getCollectionData(cardsCollectionRef);

            // Atualiza a contagem na UI
            type.countElement.textContent = count;
            // Popula a lista na UI com os nomes dos cards
            cardNames.forEach(cardName => {
                const li = document.createElement('li');
                li.textContent = cardName;
                type.listElement.appendChild(li);
            });
            // Torna a seção visível se houver cards ou se for para exibir a contagem zero
            type.sectionElement.classList.remove('hidden');
        }
        loadingCardsMessage.classList.add('hidden'); // Esconde a mensagem de carregamento após a conclusão
    }
    catch (error) {
        console.error(`Erro ao carregar cards para o deck ${currentSelectedDeckId}:`, error);
        loadingCardsMessage.textContent = `Erro ao carregar cards: ${error.message}`;
        loadingCardsMessage.classList.remove('hidden'); // Garante que a mensagem de erro seja visível
        showFeedbackMessage(`Erro ao carregar cards para o deck: ${error.message}`, true);
    }
};

/**
 * Busca e exibe os detalhes de um card específico no deck atualmente selecionado.
 */
const handleCardSearch = async () => {
    const cardName = cardSearchInput.value.trim(); // Pega o nome do card do input e remove espaços

    // Limpa a área de detalhes do card e exibe mensagem de busca
    cardDetailsElement.innerHTML = '<p>Buscando card...</p>';

    // Valida se um deck foi selecionado
    if (!currentSelectedDeckId) {
        cardDetailsElement.innerHTML = '<p class="text-red-500">Por favor, selecione um deck primeiro.</p>';
        return;
    }

    // Valida se o nome do card foi digitado
    if (!cardName) {
        cardDetailsElement.innerHTML = '<p class="text-red-500">Por favor, digite o nome do card.</p>';
        return;
    }

    const cardTypesToSearch = ['Monstros', 'Magia', 'Armadilhas'];
    let cardFound = false;

    // Itera sobre os tipos de cards para encontrar o card buscado
    for (const type of cardTypesToSearch) {
        try {
            // Constrói a referência para o documento do card específico
            // Caminho esperado: Decks/{deckId}/Main Deck/{type}/Cards/{cardName}
            // Adaptação para o caminho do Firestore no ambiente Canvas
            const cardDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'Decks', currentSelectedDeckId, 'Main Deck', type, 'Cards', cardName);
            
            const cardDocSnap = await getDoc(cardDocRef);

            // Se o card for encontrado
            if (cardDocSnap.exists()) {
                const cardData = cardDocSnap.data();
                
                // Constrói o HTML para exibir os detalhes do card
                let detailsHtml = `
                    <h3 class="text-xl font-bold text-green-700">${cardDocSnap.id}</h3>
                    <p class="text-gray-800 mt-2"><strong>Tipo:</strong> ${type}</p>
                `;
                // Adiciona todos os campos do documento do card de forma dinâmica
                // Verifica se há dados para exibir antes de iterar
                if (Object.keys(cardData).length > 0) {
                    for (const key in cardData) {
                        if (Object.hasOwnProperty.call(cardData, key)) {
                            // Verifica se o valor é nulo ou indefinido para exibir 'N/A'
                            const value = cardData[key] !== undefined && cardData[key] !== null ? cardData[key] : 'N/A';
                            detailsHtml += `<p class="text-gray-700"><strong>${key}:</strong> ${value}</p>`;
                        }
                    }
                } else {
                    detailsHtml += `<p class="text-gray-700">Nenhum detalhe adicional para este card.</p>`;
                }

                cardDetailsElement.innerHTML = detailsHtml; // Insere o HTML na área de detalhes
                cardFound = true; // Marca que o card foi encontrado
                break; // Sai do loop, pois o card já foi encontrado
            }
        } catch (error) {
            console.error(`Erro ao buscar card '${cardName}' em ${type}:`, error);
            // Continua a busca em outras categorias mesmo se houver erro em uma
        }
    }

    // Se o card não for encontrado em nenhuma categoria
    if (!cardFound) {
        cardDetailsElement.innerHTML = `<p class="text-yellow-600">Card "${cardName}" não encontrado no deck selecionado.</p>`;
    }
};

// --- Event Listeners ---
// Adiciona um listener para carregar a dica de decks disponíveis quando o DOM estiver pronto.
document.addEventListener('DOMContentLoaded', () => {
    loadAvailableDecksHint(); 
    console.log("DOM Carregado. Carregando decks disponíveis.");
});


// Adiciona listener ao botão de seleção de deck para chamar handleDeckSelection
selectDeckButton.addEventListener('click', handleDeckSelection);

// Permite selecionar o deck ao pressionar "Enter" no campo de seleção de deck
deckSelectionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleDeckSelection();
    }
});

// Adiciona listener ao botão de busca de card para chamar handleCardSearch
searchCardButton.addEventListener('click', handleCardSearch);

// Permite buscar o card ao pressionar "Enter" no campo de busca de card
cardSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleCardSearch();
    }
});