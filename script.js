document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartModal = document.querySelector('.cart-modal');
    const cartContent = document.querySelector('.cart-content');
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
        
        const filteredProductos = filter === 'todos' 
            ? productos 
            : productos.filter(producto => producto.categoria === filter);
        
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
                        <span class="price">$${producto.precio.toFixed(2)}</span>
                        <button class="add-to-cart" data-id="${producto.id}">Añadir al carrito</button>
                    </div>
                </div>
            `;
            
            productosContainer.appendChild(productoElement);
        });
        
        // Agregar event listeners a los botones de añadir al carrito
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
    
    // Mostrar notificación de producto añadido
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
    
    // Guardar carrito en localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Actualizar contador del carrito
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    // Actualizar modal del carrito
    function updateCartModal() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            cartTotal.textContent = '$0.00';
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
                    <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
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
        
        cartTotal.textContent = `$${total.toFixed(2)}`;
        
        // Agregar event listeners a los botones de eliminar, incrementar y decrementar
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
    
    // Eliminar del carrito
    function removeFromCart(e) {
        const productId = parseInt(e.target.dataset.id);
        cart = cart.filter(item => item.id !== productId);
        updateCart();
    }
    
    // Incrementar cantidad
    function incrementQuantity(e) {
        const productId = parseInt(e.target.dataset.id);
        const item = cart.find(item => item.id === productId);
        item.quantity += 1;
        updateCart();
    }
    
    // Decrementar cantidad
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
    
    // Abrir carrito
    function openCart() {
        cartModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Cerrar carrito
    function closeCart() {
        cartModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    
    // Vaciar carrito
    function clearCart() {
        cart = [];
        updateCart();
    }
    
    // Finalizar compra
    
    function checkout() {
        if (cart.length === 0) {
            // Crear notificación de carrito vacío
            const emptyCartNotification = document.createElement('div');
            emptyCartNotification.classList.add('empty-cart-notification');
            
            emptyCartNotification.innerHTML = `
                <div class="notification-content">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Por favor, agrega al menos un producto al carrito antes de finalizar tu compra</p>
                </div>
            `;
            
            document.body.appendChild(emptyCartNotification);
            
            // Mostrar notificación
            setTimeout(() => {
                emptyCartNotification.classList.add('show');
            }, 10);
            
            // Ocultar y eliminar notificación después de 3 segundos
            setTimeout(() => {
                emptyCartNotification.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(emptyCartNotification);
                }, 300);
            }, 3000);
            
            return;
        }
        
        // Si hay productos en el carrito, proceder con la compra
        alert('¡Gracias por tu compra! Total: $' + 
              cart.reduce((total, item) => total + (item.precio * item.quantity), 0).toFixed(2));
        clearCart();
        closeCart();
    }
    
    // Toggle menú móvil
    function toggleMobileMenu() {
        navMenu.classList.toggle('active');
    }
    
    // Event listeners
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
    
    // Inicializar la aplicación
    function init() {
        displayProductos();
        updateCartCount();
        
        // Cerrar menú al hacer scroll
        window.addEventListener('scroll', () => {
            navMenu.classList.remove('active');
        });
        
        // Animación al hacer scroll
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
        
        // Configurar animaciones iniciales
        document.querySelectorAll('.menu-section, .about-section, .contact-section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        });
        
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll(); // Ejecutar una vez al cargar
    }
    
    // Estilos dinámicos para la notificación del carrito
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
    
    // Iniciar la aplicación
    init();
});