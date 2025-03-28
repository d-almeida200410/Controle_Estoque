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
const alertMessage = document.createElement('div');
alertMessage.className = 'alert-message';
document.body.insertBefore(alertMessage, document.body.firstChild);

// Função para mostrar alerta de estoque baixo
function showLowStockAlert(itemName) {
    alertMessage.textContent = `ALERTA: Estoque baixo para ${itemName}! Restam apenas 3 unidades ou menos.`;
    alertMessage.style.display = 'block';
    alertMessage.style.backgroundColor = '#ffcccc';
    alertMessage.style.padding = '10px';
    alertMessage.style.margin = '10px 0';
    alertMessage.style.borderRadius = '5px';
    alertMessage.style.textAlign = 'center';
    alertMessage.style.color = '#d8000c';
    
    // Remove o alerta após 5 segundos
    setTimeout(() => {
        alertMessage.style.display = 'none';
    }, 5000);
}

// Função para adicionar item
addItem.addEventListener('click', () => {
    const name = itemName.value;
    const quantity = parseInt(itemQuantity.value);
    const price = parseFloat(itemPrice.value);
    const imageUrl = itemImageUrl.value;

    if (name && quantity && price && imageUrl) {
        db.collection('estoque').add({
            name: name,
            quantity: quantity,
            price: price,
            imageUrl: imageUrl
        }).then(() => {
            itemName.value = '';
            itemQuantity.value = '';
            itemPrice.value = '';
            itemImageUrl.value = '';
            
            // Verifica se o item adicionado já está com estoque baixo
            if (quantity <= 3) {
                showLowStockAlert(name);
            }
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
        const quantity = parseInt(newQuantity);
        db.collection('estoque').doc(id).update({
            quantity: quantity
        }).then(() => {
            // Verifica se o estoque ficou baixo após a atualização
            if (quantity <= 3) {
                db.collection('estoque').doc(id).get().then(doc => {
                    if (doc.exists) {
                        showLowStockAlert(doc.data().name);
                    }
                });
            }
        });
    }
};

// Renderiza os itens na tela
const renderItems = (doc) => {
    const item = doc.data();
    const card = document.createElement('div');
    card.className = 'card';
    
    // Adiciona classe de alerta se o estoque estiver baixo
    if (item.quantity <= 3) {
        card.classList.add('low-stock');
        card.style.border = '2px solid red';
    }
    
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
    let hasLowStock = false;
    
    snapshot.forEach(doc => {
        const item = doc.data();
        renderItems(doc);
        
        // Verifica se há itens com estoque baixo
        if (item.quantity <= 3) {
            hasLowStock = true;
            showLowStockAlert(item.name);
        }
    });
    
    if (!hasLowStock) {
        alertMessage.style.display = 'none';
    }
});