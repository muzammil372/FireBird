const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
const cartOpen = document.getElementById('cartOpen');
const cartClose = document.getElementById('cartClose');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartTotal = document.getElementById('cartTotal');
const toast = document.getElementById('toast');
const cart = new Map();
let toastTimer;

document.getElementById('year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menuToggle.textContent = open ? '×' : '☰';
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = '☰';
}));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function openCart() {
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
cartOpen.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartBackdrop.addEventListener('click', closeCart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

document.querySelectorAll('.add-btn').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const existing = cart.get(name);
    cart.set(name, { price, qty: existing ? existing.qty + 1 : 1 });
    renderCart();
    showToast(`${name} added to your order`);
  });
});

function renderCart() {
  const entries = [...cart.entries()];
  const count = entries.reduce((sum, [, item]) => sum + item.qty, 0);
  const total = entries.reduce((sum, [, item]) => sum + item.qty * item.price, 0);
  cartCount.textContent = count;
  cartTotal.textContent = `Rs. ${total.toLocaleString('en-PK')}`;
  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">Your order is looking a little empty. Add something delicious!</p>';
    return;
  }
  cartItems.innerHTML = entries.map(([name, item]) => `
    <div class="cart-row">
      <div><strong>${escapeHTML(name)}</strong><small>Rs. ${item.price.toLocaleString('en-PK')} each</small></div>
      <div class="qty-controls">
        <button aria-label="Remove one ${escapeHTML(name)}" data-action="minus" data-name="${escapeHTML(name)}">−</button>
        <span>${item.qty}</span>
        <button aria-label="Add one ${escapeHTML(name)}" data-action="plus" data-name="${escapeHTML(name)}">+</button>
      </div>
    </div>`).join('');
  cartItems.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    const name = button.dataset.name;
    const item = cart.get(name);
    if (!item) return;
    if (button.dataset.action === 'plus') item.qty++;
    else item.qty--;
    if (item.qty <= 0) cart.delete(name);
    renderCart();
  }));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
function sendWhatsAppOrder() {
  if (!cart.size) {
    showToast('Add at least one item first');
    return;
  }
  const lines = [...cart.entries()].map(([name, item]) => `${item.qty} x ${name} — Rs. ${item.qty * item.price}`).join('\n');
  const total = [...cart.values()].reduce((sum, item) => sum + item.qty * item.price, 0);
  const message = `Assalam-o-Alaikum! I would like to place this demo order:\n\n${lines}\n\nSubtotal: Rs. ${total}\n\nPlease confirm availability and delivery details.`;
  // Replace 923000000000 with the restaurant's real WhatsApp number in international format.
  const whatsappNumber = '923232136450';
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}
document.getElementById('checkoutBtn').addEventListener('click', sendWhatsAppOrder);
document.getElementById('contactOrder').addEventListener('click', () => {
  const whatsappNumber = '92300000000'; // Replace with the restaurant's real number.
  const message = 'Assalam-o-Alaikum! I would like to know more about your menu and deals.';
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
});
document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(item => item.classList.toggle('active', item === tab));
  const category = tab.dataset.category;
  document.querySelectorAll('.menu-card').forEach(card => {
    card.hidden = category !== 'all' && card.dataset.category !== category;
  });
}));
