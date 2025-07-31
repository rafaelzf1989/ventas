let productos = [];
let categorias = [];
let config = {};

window.addEventListener('DOMContentLoaded', function() {
    fetch('./productos.csv')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar productos.csv');
            return response.text();
        })
        .then(csvText => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    productos = [];
                    categorias = [];
                    config = {};
                    results.data.forEach(row => {
                        if (row.tipo === 'config') {
                            config.nombre = row.nombre;
                            config.eslogan = row.eslogan;
                            config.sobre_nosotros = row.sobre_nosotros;
                            config.direccion = row.direccion;
                            config.telefono = row.telefono;
                            config.email = row.email;
                            config.facebook = row.facebook;
                            config.instagram = row.instagram;
                            config.twitter = row.twitter;
                            config.horario_lunes_viernes = row.horario_lunes_viernes;
                            config.horario_sabado_domingo = row.horario_sabado_domingo;
                            config.imagen_cabecera = row.imagen_cabecera;
                            config.imagen_nosotros = row.imagen_nosotros;
                            config.moneda = row.moneda;
                            config.telefono_empresa = row.telefono_empresa;
                            config.costo_envio = parseFloat(row.costo_envio);
                        }
                        if (row.tipo === 'categoria' && row.nombre) {
                            categorias.push(row.nombre);
                        }
                        if (row.tipo === 'producto') {
                            productos.push({
                                id: productos.length + 1,
                                nombre: row.nombre,
                                descripcion: row.descripcion,
                                precio: parseFloat(row.precio),
                                imagen: row.imagen,
                                categoria: row.categoria || 'otros'
                            });
                        }
                    });
                    applyConfigToDOM();
                    displayCategorias();
                    displayProductos();
                    document.getElementById('delivery-cost').textContent = `${config.costo_envio} ${config.moneda}`;
                },
                error: function(err) {
                    document.getElementById('productos-container').innerHTML = '<p style="color:#c00">No se pudo cargar productos.csv</p>';
                }
            });
        })
        .catch(err => {
            document.getElementById('productos-container').innerHTML = '<p style="color:#c00">No se pudo cargar productos.csv</p>';
        });
});

function applyConfigToDOM() {
    document.getElementById('site-title').innerText = config.nombre;
    document.getElementById('logo-title').innerHTML = config.nombre.replace(/ (.+)$/, '<span id="logo-title-span">$1</span>');
    document.getElementById('site-eslogan').innerText = config.eslogan;
    document.getElementById('sobre-nosotros-desc').innerText = config.sobre_nosotros;
    document.getElementById('contacto-direccion').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${config.direccion}`;
    document.getElementById('contacto-telefono').innerHTML = `<i class="fas fa-phone"></i> ${config.telefono}`;
    document.getElementById('contacto-email').innerHTML = `<i class="fas fa-envelope"></i> ${config.email}`;
    document.getElementById('link-facebook').href = config.facebook || "#";
    document.getElementById('link-instagram').href = config.instagram || "#";
    document.getElementById('link-twitter').href = config.twitter || "#";
    document.getElementById('footer-nombre').innerText = config.nombre;
    document.getElementById('footer-eslogan').innerText = config.eslogan;
    document.getElementById('footer-horario-lv').innerText = config.horario_lunes_viernes;
    document.getElementById('footer-horario-sd').innerText = config.horario_sabado_domingo;
    document.getElementById('footer-year').innerText = new Date().getFullYear();
    document.getElementById('footer-nombre-corto').innerText = config.nombre;

    if (config.imagen_cabecera) {
        const hero = document.getElementById('hero-section');
        hero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)), url('${config.imagen_cabecera}')`;
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
        hero.style.backgroundRepeat = 'no-repeat';
    }
    if (config.imagen_nosotros) {
        document.getElementById('imagen-nosotros').src = config.imagen_nosotros;
    }
}

function displayCategorias() {
    const cont = document.getElementById('menu-categorias');
    cont.innerHTML = '';
    let btnTodos = document.createElement('button');
    btnTodos.className = "filter-btn active";
    btnTodos.dataset.filter = "todos";
    btnTodos.innerText = "Todos";
    cont.appendChild(btnTodos);
    btnTodos.addEventListener('click', function () {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        btnTodos.classList.add('active');
        displayProductos("todos");
    });
    categorias.forEach(cat => {
        let btn = document.createElement('button');
        btn.className = "filter-btn";
        btn.dataset.filter = cat;
        btn.innerText = cat;
        btn.addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            displayProductos(cat);
        });
        cont.appendChild(btn);
    });
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartModal = document.querySelector('.cart-modal');
const cartCount = document.querySelector('.cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productosContainer = document.getElementById('productos-container');
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');

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

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

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

function checkout() {
    if (cart.length === 0) {
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

document.getElementById('cancel-client-modal').onclick = function() {
    document.getElementById('client-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

document.getElementById('client-form').onsubmit = function(e) {
    e.preventDefault();
    const nombre = document.getElementById('client-name').value;
    const telefono = document.getElementById('client-phone').value;
    const direccion = document.getElementById('client-address').value;
    const delivery = document.getElementById('delivery-check').checked;
    let total = cart.reduce((t, i) => t + (i.precio * i.quantity), 0);
    let mensaje = `*Nuevo pedido ${config.nombre}*\n\nCliente: ${nombre}\nTel: ${telefono}\nDirección: ${direccion}\n\nProductos:\n`;
    cart.forEach(item => {
        mensaje += `- ${item.nombre} x${item.quantity}: ${(item.precio * item.quantity).toFixed(2)} ${config.moneda}\n`;
    });
    if (delivery) {
        mensaje += `\nEntrega a domicilio: ${config.costo_envio} ${config.moneda}`;
        total += config.costo_envio;
    }
    mensaje += `\n\nTotal: ${total.toFixed(2)} ${config.moneda}`;
    const url = `https://wa.me/${config.telefono_empresa}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    clearCart();
    document.getElementById('client-modal').style.display = 'none';
    document.body.style.overflow = 'auto';
    closeCart();
};

function toggleMobileMenu() {
    navMenu.classList.toggle('active');
}

document.querySelector('.cart-icon').addEventListener('click', openCart);
document.querySelector('.close-cart').addEventListener('click', closeCart);
document.querySelector('.clear-cart').addEventListener('click', clearCart);
document.querySelector('.checkout-btn').addEventListener('click', checkout);
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

cartModal.addEventListener('click', function(e) {
    if (e.target === cartModal) {
        closeCart();
    }
});

document.querySelectorAll('nav ul li a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
    });
});

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

function init() {
    displayProductos();
    updateCartCount();

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
    document.querySelectorAll('.menu-section, .about-section, .contact-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
}

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

init();