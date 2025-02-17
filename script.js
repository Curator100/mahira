// Product data with 33 products
const products = Array.from({ length: 33 }, (_, i) => {
    let price;
    const id = i + 1;
    
    // Set specific prices based on product ID
    switch(id) {
        case 1: price = 70; break;
        case 2: price = 200; break;
        case 3: price = 120; break;
        case 4: price = 100; break;
        case 5: price = 350; break;
        case 6: price = 300; break;
        case 7: price = 200; break;
        case 8: price = 300; break;
        case 9: price = 200; break;
        case 10: price = 200; break;
        case 11: price = 200; break;
        case 12: case 13: case 14: case 15: case 16: 
        case 17: case 18: case 19: case 20: case 21:
        case 22: case 23: 
            price = 350; break;
        case 24: case 25: case 26: case 27: case 28:
            price = 340; break;
        case 29: price = 100; break;
        case 30: price = 400; break;
        default: price = 200; // Default price for remaining products (31-33)
    }

    return {
        id,
        name: `Product ${id}`,
        price: price * 1.1, // Adding 10% to original price for showing cut price
        originalPrice: price, // Keeping original price for reference
        image: `${id}.jpg`
    };
});

let cart = [];

// Initialize products
function initializeProducts() {
    const productsGrid = document.getElementById('productsGrid');
    products.forEach(product => {
        productsGrid.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="original-price">৳${product.price.toFixed(2)}</p>
                <p class="discounted-price">৳${product.originalPrice.toFixed(2)}</p>
                <button onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    });
}

// Show discount popup after 15 seconds
setTimeout(() => {
    document.getElementById('discountPopup').style.display = 'block';
    setTimeout(() => {
        document.getElementById('discountPopup').style.display = 'none';
    }, 7000);
}, 15000);

function addToCart(productId) {
    const quantityPrompt = document.createElement('div');
    quantityPrompt.className = 'quantity-prompt';
    quantityPrompt.innerHTML = `
        <div class="prompt-content">
            <h3>আপনি কয়টা প্রোডাক্ট কিনতে চান?</h3>
            <select id="quantitySelect">
                ${Array.from({length: 20}, (_, i) => 
                    `<option value="${i + 1}">${i + 1}</option>`
                ).join('')}
            </select>
            <div class="prompt-buttons">
                <button onclick="confirmQuantity(${productId})">ঠিক আছে</button>
                <button onclick="closeQuantityPrompt()">বাতিল</button>
            </div>
        </div>
    `;
    document.body.appendChild(quantityPrompt);
}

function confirmQuantity(productId) {
    const quantitySelect = document.getElementById('quantitySelect');
    const quantity = quantitySelect.value;
    
    if (quantity && !isNaN(quantity) && quantity > 0) {
        const product = products.find(p => p.id === productId);
        cart.push({
            ...product,
            quantity: parseInt(quantity)
        });
        updateCart();
    }
    closeQuantityPrompt();
}

function closeQuantityPrompt() {
    const prompt = document.querySelector('.quantity-prompt');
    if (prompt) {
        prompt.remove();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const deliveryCharge = document.getElementById('deliveryCharge');
    const cartTotal = document.getElementById('cartTotal');
    
    cartCount.textContent = cart.length;
    cartItems.innerHTML = '';
    let subtotal = 0;
    let totalQuantity = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.originalPrice * item.quantity; // Use original price instead of applying discount
        subtotal += itemTotal;
        totalQuantity += parseInt(item.quantity);
        
        cartItems.innerHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                    <p>৳${itemTotal.toFixed(2)}</p>
                </div>
                <button class="delete-item" onclick="removeFromCart(${index})">×</button>
            </div>
        `;
    });
    
    // Check if total quantity is 10 or more for free delivery
    const delivery = totalQuantity >= 10 ? 0 : 70;
    
    cartSubtotal.textContent = subtotal.toFixed(2);
    deliveryCharge.textContent = delivery;
    cartTotal.textContent = (subtotal + delivery).toFixed(2);
}

function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('active');
}

function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    chatWindow.style.display = chatWindow.style.display === 'none' ? 'block' : 'none';
}

function showCheckoutForm() {
    document.getElementById('checkoutForm').style.display = 'block';
}

// Submit order to Telegram
async function submitOrder(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    const totalQuantity = cart.reduce((sum, item) => sum + parseInt(item.quantity), 0);
    const deliveryCharge = totalQuantity >= 10 ? 0 : 70;
    
    const orderDetails = {
        name: formData.get('name'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        items: cart.map(item => `${item.name} x${item.quantity}`).join('\n'),
        subtotal: document.getElementById('cartSubtotal').textContent,
        delivery: deliveryCharge,
        total: document.getElementById('cartTotal').textContent
    };

    const message = `
New Order:
Name: ${orderDetails.name}
Address: ${orderDetails.address}
Phone: ${orderDetails.phone}
Items:
${orderDetails.items}
Subtotal: ৳${orderDetails.subtotal}
Delivery: ৳${orderDetails.delivery}
Total: ৳${orderDetails.total}
    `;

    try {
        await fetch(`https://api.telegram.org/bot7447671480:AAFtEWOh_y3k5UpIeUnV-5fJdV3L-RlqC6M/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: '906269717',
                text: message
            })
        });
        
        alert('Order placed successfully!');
        cart = [];
        updateCart();
        document.getElementById('checkoutForm').style.display = 'none';
    } catch (error) {
        alert('Error placing order. Please try again.');
    }
}

// Initialize
initializeProducts();
