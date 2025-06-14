// createDeckClient.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Suas credenciais de configuração do Firebase
// ATENÇÃO: Estas chaves são públicas e usadas em apps cliente.
// Para scripts backend, o Firebase Admin SDK (Opção 1) é geralmente mais apropriado.
const firebaseConfig = {
  apiKey: "AIzaSyDhVyOHZWAKBvDVE1B5IHHECoYZLIyQs78",
  authDomain:  "myyugiohdeckbase.firebaseapp.com",
  projectId: "myyugiohdeckbase",
  storageBucket:  "myyugiohdeckbase.firebasestorage.app",
  messagingSenderId: "47070645186",
  appId: "1:47070645186:web:b98d1c621583e65483245b"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createRokketRevoltDeck() {
  const deckName = "rokketrevolt deck";
  const category = "deck";

  try {
    const docRef = await addDoc(collection(db, category), {
      name: deckName,
      createdAt: serverTimestamp()
    });
    console.log(`Deck '${deckName}' criado com sucesso na categoria '${category}'. ID do documento: ${docRef.id}`);
  } catch (error) {
    console.error('Erro ao criar o deck:', error);
  }
}

// Chame a função para criar o deck
createRokketRevoltDeck();