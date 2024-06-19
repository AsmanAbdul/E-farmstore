document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products');
    const cartContainer = document.getElementById('cart');
    const cartSidebar = document.getElementById('cart-sidebar');

    function loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        productsContainer.innerHTML = '';
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <p>${product.name}</p>
                <p class="price">${product.discountPrice ? `<span class="discount-price">KES ${product.price}</span> KES ${product.discountPrice}` : `KES ${product.price}`}</p>
                <button onclick="addToCart('${product.name}', ${product.discountPrice || product.price})">Add to Cart</button>
            `;
            productsContainer.appendChild(productDiv);
        });
    }

    window.addToCart = (name, price) => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProduct = cart.find(item => item.name === name);
        if (existingProduct) {
            existingProduct.quantity++;
        } else {
            cart.push({ name, price, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
    }

    window.removeFromCart = (name) => {
        const cart = JSON.parse(localStorage.getItem('cart'));
        const productIndex = cart.findIndex(item => item.name === name);
        if (productIndex !== -1) {
            if (cart[productIndex].quantity > 1) {
                cart[productIndex].quantity--;
            } else {
                cart.splice(productIndex, 1);
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCart();
        }
    }

    function loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            cartItemDiv.innerHTML = `
                <p>${item.name}</p>
                <p>KES ${item.price * item.quantity}</p>
                <p>Quantity: ${item.quantity}</p>
                <button onclick="addToCart('${item.name}', ${item.price})">+</button>
                <button onclick="removeFromCart('${item.name}')">-</button>
            `;
            cartContainer.appendChild(cartItemDiv);
        });
    }

    window.toggleCart = () => {
        cartSidebar.style.display = cartSidebar.style.display === 'block' ? 'none' : 'block';
    }

    loadProducts();
    loadCart();
});



document.addEventListener('DOMContentLoaded', function () {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    let productsContainer = document.getElementById('products');

    products.forEach(product => {
        let productElement = document.createElement('div');
        productElement.className = 'product';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <p>${product.name}</p>
            <p class="price">KES ${product.price}</p>
            ${product.discountPrice ? `<p class="discount-price">KES ${product.discountPrice}</p>` : ''}
            <button onclick="addToCart('${product.name}', ${product.price})">Add to Cart</button>
        `;
        productsContainer.appendChild(productElement);
    });
});

function addToCart(name, price) {
    // Add to cart functionality
}
