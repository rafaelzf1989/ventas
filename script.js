// ----- CONFIGURACIÓN GLOBAL -----
let productos = [];
let config = {
    moneda: 'CUP',
    telefono_empresa: '5358707434',
    costo_envio: 50
};

// CARGAR CSV AUTOMÁTICAMENTE DESDE LA RAÍZ
document.addEventListener('DOMContentLoaded', function() {
    fetch('productos.csv')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar productos.csv');
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                complete: function(results) {
                    productos = [];
                    results.data.forEach(row => {
                        if (row.tipo && row.tipo.trim() === 'producto') {
                            productos.push({
                                id: productos.length + 1,
                                nombre: row.nombre,
                                descripcion: row.descripcion,
                                precio: parseFloat(row.precio),
                                imagen: row.imagen,
                                categoria: row.categoria || 'otros'
                            });
                        }
                        if (row.tipo && row.tipo.trim() === 'config') {
                            config.moneda = row.moneda || config.moneda;
                            config.telefono_empresa = row.telefono_empresa || config.telefono_empresa;
                            config.costo_envio = parseFloat(row.costo_envio) || config.costo_envio;
                        }
                    });
                    displayProductos();
                    document.getElementById('delivery-cost').textContent = `${config.costo_envio} ${config.moneda}`;
                }
            });
        })
        .catch(err => {
            document.getElementById('productos-container').innerHTML = '<p style="color:#c00">No se pudo cargar productos.csv</p>';
        });
});

// ----- VARIABLES Y FUNCIONES DE UI -----
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartModal = document.querySelector('.cart-modal');
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productosContainer = document.getElementById('productos-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');

// Mostrar productos
function displayProductos(filter = 'todos') {
    productosContainer.innerHTML = '';
    let filteredProductos = filter === 'todos'
        ? productos
        : productos.filter(producto => producto.categoria === filter);

    if (!filteredProductos || filteredProductos.length === 0) {
        productosContainer.innerHTML = '<p style="color:#c00">No hay productos para mostrar.</p>';
        return;
    }

    filteredProductos.forEach(producto => {
        const productoElement = document.createElement('div');
        productoElement.classList.add('product-card');
        productoElement.dataset.category = producto.categoria;

        productoElement.innerHTML = `
            <div class="product-image">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="product-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion}</p>
                <div class="product-price">
                    <span class="price">${producto.precio.toFixed(2)} ${config.moneda}</span>
                    <button class="add-to-cart" data-id="${producto.id}">Añadir al carrito</button>
                </div>
            </div>
        `;
        productosContainer.appendChild(productoElement);
    });

    // Event listeners a los botones de añadir al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Filtrar productos
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        displayProductos(button.dataset.filter);
    });
});

// Añadir al carrito
function addToCart(e) {
    const productId = parseInt(e.target.dataset.id);
    const producto = productos.find(p => p.id === productId);

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...producto,
            quantity: 1
        });
    }

    updateCart();
    showCartNotification();
}

// Notificación añadida al carrito
function showCartNotification() {
    const notification = document.createElement('div');
    notification.classList.add('cart-notification');
    notification.textContent = 'Producto añadido al carrito';
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Actualizar carrito
function updateCart() {
    saveCart();
    updateCartCount();
    updateCartModal();
}
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
}
function updateCartModal() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
        cartTotal.textContent = `0.00 ${config.moneda}`;
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.classList.add('cart-item');

        const itemTotal = item.precio * item.quantity;
        total += itemTotal;

        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.imagen}" alt="${item.nombre}">
            </div>
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <p class="cart-item-price">${item.precio.toFixed(2)} ${config.moneda}</p>
                <p class="cart-item-remove" data-id="${item.id}">Eliminar</p>
                <div class="cart-item-quantity">
                    <button class="decrement" data-id="${item.id}">-</button>
                    <span>${item.quantity}</span>
                    <button class="increment" data-id="${item.id}">+</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemElement);
    });

    cartTotal.textContent = `${total.toFixed(2)} ${config.moneda}`;

    // Botones de eliminar, incrementar y decrementar
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
    document.querySelectorAll('.increment').forEach(button => {
        button.addEventListener('click', incrementQuantity);
    });
    document.querySelectorAll('.decrement').forEach(button => {
        button.addEventListener('click', decrementQuantity);
    });
}

// Eliminar producto del carrito
function removeFromCart(e) {
    const productId = parseInt(e.target.dataset.id);
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}
function incrementQuantity(e) {
    const productId = parseInt(e.target.dataset.id);
    const item = cart.find(item => item.id === productId);
    item.quantity += 1;
    updateCart();
}
function decrementQuantity(e) {
    const productId = parseInt(e.target.dataset.id);
    const item = cart.find(item => item.id === productId);
    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart = cart.filter(item => item.id !== productId);
    }
    updateCart();
}

// Abrir y cerrar carrito
function openCart() {
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeCart() {
    cartModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}
function clearCart() {
    cart = [];
    updateCart();
}

// FINALIZAR COMPRA: Mostrar formulario modal
function checkout() {
    if (cart.length === 0) {
        // Notificación de carrito vacío
        const emptyCartNotification = document.createElement('div');
        emptyCartNotification.classList.add('empty-cart-notification');
        emptyCartNotification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-exclamation-circle"></i>
                <p>Por favor, agrega al menos un producto al carrito antes de finalizar tu compra</p>
            </div>
        `;
        document.body.appendChild(emptyCartNotification);
        setTimeout(() => { emptyCartNotification.classList.add('show'); }, 10);
        setTimeout(() => {
            emptyCartNotification.classList.remove('show');
            setTimeout(() => { document.body.removeChild(emptyCartNotification); }, 300);
        }, 3000);
        return;
    }
    document.getElementById('client-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Cerrar modal cliente
document.getElementById('cancel-client-modal').onclick = function() {
    document.getElementById('client-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Enviar formulario de cliente (pedido por WhatsApp)
document.getElementById('client-form').onsubmit = function(e) {
    e.preventDefault();
    const nombre = document.getElementById('client-name').value;
    const telefono = document.getElementById('client-phone').value;
    const direccion = document.getElementById('client-address').value;
    const delivery = document.getElementById('delivery-check').checked;
    let total = cart.reduce((t, i) => t + (i.precio * i.quantity), 0);
    let mensaje = `*Nuevo pedido BurgerDelight*\n\nCliente: ${nombre}\nTel: ${telefono}\nDirección: ${direccion}\n\nProductos:\n`;
    cart.forEach(item => {
        mensaje += `- ${item.nombre} x${item.quantity}: ${(item.precio * item.quantity).toFixed(2)} ${config.moneda}\n`;
    });
    if (delivery) {
        mensaje += `\nEntrega a domicilio: ${config.costo_envio} ${config.moneda}`;
        total += config.costo_envio;
    }
    mensaje += `\n\nTotal: ${total.toFixed(2)} ${config.moneda}`;
    // Enviar a WhatsApp
    const url = `https://wa.me/${config.telefono_empresa}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    clearCart();
    document.getElementById('client-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    closeCart();
};

// Toggle menú móvil
function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

// Event listeners generales
document.querySelector('.cart-icon').addEventListener('click', openCart);
document.querySelector('.close-cart').addEventListener('click', closeCart);
document.querySelector('.clear-cart').addEventListener('click', clearCart);
document.querySelector('.checkout-btn').addEventListener('click', checkout);
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Cerrar carrito al hacer clic fuera
cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        closeCart();
    }
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling para enlaces
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Inicializar la app
function init() {
    displayProductos();
    updateCartCount();

    // Animación scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.menu-section, .about-section, .contact-section');
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    // Inicializar animaciones
    document.querySelectorAll('.menu-section, .about-section, .contact-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
}

// Notificación estilos carrito
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .empty-cart-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #FF5252;
        color: white;
        padding: 16px 25px;
        border-radius: 8px;
        box-shadow: 0 6px 20px rgba(255, 82, 82, 0.3);
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
        max-width: 90%;
        width: 400px;
    }
    .empty-cart-notification.show {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
    .empty-cart-notification .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .empty-cart-notification i {
        font-size: 1.5rem;
        flex-shrink: 0;
    }
    .empty-cart-notification p {
        margin: 0;
        font-size: 0.95rem;
        line-height: 1.4;
    }
    @media (max-width: 576px) {
        .empty-cart-notification {
            width: 90%;
            padding: 12px 18px;
        }
        .empty-cart-notification .notification-content {
            flex-direction: column;
            text-align: center;
            gap: 8px;
        }
    }
`;
document.head.appendChild(notificationStyle);

// Inicializar la app al cargar
init();