const cartCount = document.querySelector('.cart-count');
const toast = document.querySelector('.toast');
const cartButton = document.querySelector('#cartButton');
const cartPanel = document.querySelector('#cartPanel');
const cartOverlay = document.querySelector('#cartOverlay');
const cartClose = document.querySelector('#cartClose');
const cartItemsContainer = document.querySelector('#cartItems');
const cartSubtotal = document.querySelector('#cartSubtotal');
const productCards = document.querySelectorAll('.product-card');

let toastTimer;
const cart = [];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);

const toggleCart = (shouldOpen) => {
  const isOpen = typeof shouldOpen === 'boolean' ? shouldOpen : !cartPanel.classList.contains('open');
  cartPanel.classList.toggle('open', isOpen);
  cartOverlay.classList.toggle('visible', isOpen);
  cartPanel.setAttribute('aria-hidden', String(!isOpen));
  cartOverlay.setAttribute('aria-hidden', String(!isOpen));
};

const updateCart = () => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty">No items yet. Add your market essentials.</p>';
    cartSubtotal.textContent = formatCurrency(0);
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
          <div>
            <h4>${item.name}</h4>
            <p>${item.category}</p>
            <strong>${formatCurrency(item.price)}</strong>
          </div>
          <div class="cart-item-actions">
            <div class="qty-controls">
              <button type="button" data-action="decrease" data-name="${item.name}">−</button>
              <span>${item.quantity}</span>
              <button type="button" data-action="increase" data-name="${item.name}">+</button>
            </div>
          </div>
        </div>
      `
    )
    .join('');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSubtotal.textContent = formatCurrency(subtotal);
};

const addToCart = (name, price, category) => {
  const existing = cart.find((item) => item.name === name);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, category, quantity: 1 });
  }

  updateCart();
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
};

document.querySelectorAll('.quick-add').forEach((button) => {
  button.addEventListener('click', () => {
    const productCard = button.closest('.product-card');
    addToCart(productCard.dataset.name, Number(productCard.dataset.price), productCard.dataset.subcategory || productCard.dataset.category);
    toggleCart(true);
  });
});

cartItemsContainer.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const name = button.dataset.name;
  const action = button.dataset.action;
  const item = cart.find((entry) => entry.name === name);

  if (!item) return;

  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity -= 1;

  if (item.quantity <= 0) {
    const index = cart.findIndex((entry) => entry.name === name);
    cart.splice(index, 1);
  }

  updateCart();
});

cartButton.addEventListener('click', () => toggleCart());
cartClose.addEventListener('click', () => toggleCart(false));
cartOverlay.addEventListener('click', () => toggleCart(false));

document.querySelectorAll('.filter').forEach((filter) => {
  filter.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    filter.classList.add('active');

    const selectedFilter = filter.dataset.filter;
    productCards.forEach((card) => {
      const isVisible = selectedFilter === 'All' || card.dataset.category === selectedFilter;
      card.hidden = !isVisible;
    });
  });
});

document.querySelectorAll('.category-card').forEach((category) => {
  category.addEventListener('click', () => {
    const targetFilter = document.querySelector(`.filter[data-filter="${category.dataset.filter}"]`);
    if (targetFilter) targetFilter.click();
  });
});

document.querySelector('.menu-toggle').addEventListener('click', () => {
  document.querySelector('.nav-links').classList.toggle('open');
});

document.querySelector('.signup-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const message = document.querySelector('.form-message');
  message.textContent = 'Thanks for joining us — see you at the market.';
  event.target.reset();
});

updateCart();