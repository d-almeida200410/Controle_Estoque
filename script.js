// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDrTfjEoF5McvUm0kZLQURVjKJPkBD3gWM",
    authDomain: "estoquepapelaria-da1a7.firebaseapp.com",
    projectId: "estoquepapelaria-da1a7",
    storageBucket: "estoquepapelaria-da1a7.firebasestorage.app",
    messagingSenderId: "91379078877",
    appId: "1:91379078877:web:eb87052e4e061c9b25ed34"
  };

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Referências aos elementos do DOM
const itemName = document.getElementById('itemName');
const itemQuantity = document.getElementById('itemQuantity');
const itemPrice = document.getElementById('itemPrice');
const itemImageUrl = document.getElementById('itemImageUrl');
const addItem = document.getElementById('addItem');
const itemList = document.getElementById('itemList');

// Função para adicionar item
addItem.addEventListener('click', () => {
    const name = itemName.value;
    const quantity = itemQuantity.value;
    const price = parseFloat(itemPrice.value);
    const imageUrl = itemImageUrl.value;

    if (name && quantity && price && imageUrl) {
        db.collection('estoque').add({
            name: name,
            quantity: parseInt(quantity),
            price: price,
            imageUrl: imageUrl
        }).then(() => {
            itemName.value = '';
            itemQuantity.value = '';
            itemPrice.value = '';
            itemImageUrl.value = '';
        }).catch(error => {
            console.error("Erro ao adicionar item: ", error);
            alert("Erro ao adicionar item. Verifique o console para mais detalhes.");
        });
    } else {
        alert("Preencha todos os campos.");
    }
});

// Função para deletar item
const deleteItem = (id) => {
    if (confirm("Tem certeza que deseja deletar este item?")) {
        db.collection('estoque').doc(id).delete();
    }
};

// Função para atualizar item
const updateItem = (id) => {
    const newQuantity = prompt("Nova quantidade:");
    if (newQuantity) {
        db.collection('estoque').doc(id).update({
            quantity: parseInt(newQuantity)
        });
    }
};

// Renderiza os itens na tela
const renderItems = (doc) => {
    const item = doc.data();
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <img src="${item.imageUrl}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>Quantidade: ${item.quantity}</p>
        <p class="price">Preço: R$ ${item.price.toFixed(2)}</p>
        <div class="actions">
            <button class="update" onclick="updateItem('${doc.id}')">Atualizar</button>
            <button class="delete" onclick="deleteItem('${doc.id}')">Deletar</button>
        </div>
    `;
    itemList.appendChild(card);
};

// Atualiza a lista de itens em tempo real
db.collection('estoque').onSnapshot(snapshot => {
    itemList.innerHTML = '';
    snapshot.forEach(doc => {
        renderItems(doc);
    });
});