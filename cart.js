const CART_STORAGE_KEY = 'ecommerce-cart';

function getCartItems() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Unable to read cart from storage', error);
        return [];
    }
}

function saveCartItems(cartItems) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

function updateCartCount() {
    const countElement = document.getElementById('cart-count');
    if (!countElement) return;

    const cartItems = getCartItems();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    countElement.textContent = totalItems;
}

function showCartFeedback(message) {
    let feedback = document.querySelector('.cart-feedback');
    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        document.body.prepend(feedback);
    }

    feedback.textContent = message;
    feedback.classList.add('visible');
    clearTimeout(showCartFeedback.timeoutId);
    showCartFeedback.timeoutId = setTimeout(() => {
        feedback.classList.remove('visible');
    }, 1600);
}

function addToCart(product) {
    const cartItems = getCartItems();
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({ ...product, quantity: 1 });
    }

    saveCartItems(cartItems);
    updateCartCount();
    showCartFeedback(`${product.title} added to cart`);

    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
}

function removeFromCart(productId) {
    const updatedCart = getCartItems().filter((item) => item.id !== productId);
    saveCartItems(updatedCart);
    updateCartCount();
    renderCartPage();
}

function changeQuantity(productId, quantity) {
    const cartItems = getCartItems();
    const targetItem = cartItems.find((item) => item.id === productId);

    if (!targetItem) return;

    targetItem.quantity = Math.max(0, quantity);

    const filteredCart = cartItems.filter((item) => item.quantity > 0);
    saveCartItems(filteredCart);
    updateCartCount();
    renderCartPage();
}

function getCartSubtotal() {
    return getCartItems().reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const billSummaryContainer = document.getElementById('bill-summary');

    if (!cartItemsContainer || !billSummaryContainer) return;

    const cartItems = getCartItems();

    if (!cartItems.length) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        billSummaryContainer.innerHTML = '<h3>Summary</h3><p>No items selected yet.</p>';
        return;
    }

    cartItemsContainer.innerHTML = '';

    cartItems.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'cart-item';

        const image = document.createElement('img');
        image.src = item.thumbnail;
        image.alt = item.title;
        image.className = 'cart-item-image';

        const details = document.createElement('div');
        details.className = 'cart-item-details';

        const title = document.createElement('h3');
        title.textContent = item.title;

        const price = document.createElement('p');
        price.textContent = `Rs ${item.price}/-`;

        const controls = document.createElement('div');
        controls.className = 'quantity-controls';

        const decrementButton = document.createElement('button');
        decrementButton.textContent = '-';
        decrementButton.className = 'qty-button';
        decrementButton.addEventListener('click', () => changeQuantity(item.id, item.quantity - 1));

        const quantity = document.createElement('span');
        quantity.textContent = item.quantity;

        const incrementButton = document.createElement('button');
        incrementButton.textContent = '+';
        incrementButton.className = 'qty-button';
        incrementButton.addEventListener('click', () => changeQuantity(item.id, item.quantity + 1));

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-button';
        removeButton.addEventListener('click', () => removeFromCart(item.id));

        controls.append(decrementButton, quantity, incrementButton);
        details.append(title, price, controls, removeButton);
        row.append(image, details);
        cartItemsContainer.appendChild(row);
    });

    const subtotal = getCartSubtotal();
    billSummaryContainer.innerHTML = `
        <h3>Summary</h3>
        <p>Items: ${cartItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
        <p>Subtotal: Rs ${subtotal}/-</p>
        <button class="checkout-button">Checkout</button>
    `;
}

function bindCartButtons() {
    document.addEventListener('click', (event) => {
        const addToCartButton = event.target.closest('.add-to-cart-button');
        if (!addToCartButton) return;

        event.preventDefault();
        event.stopPropagation();

        addToCart({
            id: Number(addToCartButton.dataset.productId),
            title: addToCartButton.dataset.productTitle,
            price: Number(addToCartButton.dataset.productPrice),
            thumbnail: addToCartButton.dataset.productThumbnail,
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    bindCartButtons();

    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
});
