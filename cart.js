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

function showMessage(message) {
    const messageBox = document.getElementById('message-box');
    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.classList.add('show');

    clearTimeout(showMessage.timeoutId);
    showMessage.timeoutId = setTimeout(() => {
        messageBox.classList.remove('show');
    }, 1600);
}

function addToCart(product) {
    const cartItems = getCartItems();
    const existingItem = cartItems.find((item) => item.id === product.id);

    if (!existingItem) {
        cartItems.push({ ...product });
        saveCartItems(cartItems);
    }

    showMessage('Item successfully added to cart');

    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
}

function removeFromCart(productId) {
    const updatedCart = getCartItems().filter((item) => item.id !== productId);
    saveCartItems(updatedCart);
    renderCartPage();
}

function getCartSubtotal() {
    return getCartItems().reduce((sum, item) => sum + item.price, 0);
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

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.className = 'remove-button';
        removeButton.addEventListener('click', () => removeFromCart(item.id));

        details.append(title, price, removeButton);
        row.append(image, details);
        cartItemsContainer.appendChild(row);
    });

    const subtotal = getCartSubtotal();
    billSummaryContainer.innerHTML = `
        <h3>Summary</h3>
        <p>Items: ${cartItems.length}</p>
        <p>Subtotal: Rs ${subtotal}/-</p>
        <button class="checkout-button">Checkout</button>
    `;
}

function bindCartButtons() {
    document.addEventListener('click', (event) => {
        const addToCartButton = event.target.closest('.add-to-cart-button');
        if (addToCartButton) {
            event.preventDefault();
            event.stopPropagation();

            addToCart({
                id: Number(addToCartButton.dataset.productId),
                title: addToCartButton.dataset.productTitle,
                price: Number(addToCartButton.dataset.productPrice),
                thumbnail: addToCartButton.dataset.productThumbnail,
            });
            return;
        }

        const checkoutButton = event.target.closest('.checkout-button');
        if (checkoutButton) {
            event.preventDefault();
            event.stopPropagation();
            showMessage('Checkout successful');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindCartButtons();

    if (document.getElementById('cart-items')) {
        renderCartPage();
    }
});
