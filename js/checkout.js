let checkoutCart = {};
let checkoutProducts = [];

const orderTbody = document.getElementById('checkout-order-tbody');
const checkoutSubtotal = document.getElementById('checkout-subtotal');
const checkoutTotal = document.getElementById('checkout-total');
const checkoutAlert = document.getElementById('checkout-alert');
const placeOrderBtn = document.getElementById('place-order-btn');

function money(value) {
    return `$${Number(value).toFixed(2)}`;
}

function showCheckoutError(message) {
    if (!checkoutAlert) return;
    checkoutAlert.innerText = message;
    checkoutAlert.style.display = 'block';
}

function clearCheckoutError() {
    if (!checkoutAlert) return;
    checkoutAlert.innerText = '';
    checkoutAlert.style.display = 'none';
}

function getFieldValue(id) {
    const input = document.getElementById(id);
    return input ? input.value.trim() : '';
}

function buildCheckoutItems() {
    return Object.entries(checkoutCart).map(([productId, quantity]) => ({
        productId: Number(productId),
        quantity: Number(quantity)
    }));
}

function renderOrderSummary() {
    if (!orderTbody) return;

    const items = buildCheckoutItems();

    if (items.length === 0) {
        orderTbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center py-4">
                    Your cart is empty. <a href="shop.html">Return to shop</a>
                </td>
            </tr>
            <tr>
                <td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td>
                <td class="text-black" id="checkout-subtotal">$0.00</td>
            </tr>
            <tr>
                <td class="text-black font-weight-bold"><strong>Order Total</strong></td>
                <td class="text-black font-weight-bold"><strong id="checkout-total">$0.00</strong></td>
            </tr>
        `;
        if (placeOrderBtn) placeOrderBtn.disabled = true;
        return;
    }

    let subtotal = 0;
    const rows = [];

    for (const item of items) {
        const product = checkoutProducts.find((entry) => entry.id === item.productId);
        if (!product) continue;

        const lineTotal = Number(product.price) * item.quantity;
        subtotal += lineTotal;
        rows.push(`
            <tr>
                <td>${product.title} <strong class="mx-2">x</strong> ${item.quantity}</td>
                <td>${money(lineTotal)}</td>
            </tr>
        `);
    }

    orderTbody.innerHTML = `
        ${rows.join('')}
        <tr>
            <td class="text-black font-weight-bold"><strong>Cart Subtotal</strong></td>
            <td class="text-black" id="checkout-subtotal">${money(subtotal)}</td>
        </tr>
        <tr>
            <td class="text-black font-weight-bold"><strong>Order Total</strong></td>
            <td class="text-black font-weight-bold"><strong id="checkout-total">${money(subtotal)}</strong></td>
        </tr>
    `;

    if (checkoutSubtotal) checkoutSubtotal.innerText = money(subtotal);
    if (checkoutTotal) checkoutTotal.innerText = money(subtotal);
    if (placeOrderBtn) placeOrderBtn.disabled = false;
}

function buildCheckoutPayload() {
    return {
        billing: {
            firstName: getFieldValue('c_fname'),
            lastName: getFieldValue('c_lname'),
            address: getFieldValue('c_address'),
            stateCountry: getFieldValue('c_state_country'),
            postalZip: getFieldValue('c_postal_zip'),
            email: getFieldValue('c_email_address'),
            phone: getFieldValue('c_phone')
        },
        payment: {
            cardNumber: getFieldValue('c_card_number')
        },
        items: buildCheckoutItems()
    };
}

async function submitCheckout() {
    clearCheckoutError();

    if (!placeOrderBtn) return;

    const originalText = placeOrderBtn.innerText;
    placeOrderBtn.innerText = 'Placing order...';
    placeOrderBtn.disabled = true;

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(buildCheckoutPayload())
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Unable to place order.');
        }

        localStorage.removeItem('shopping_cart');
        localStorage.setItem('last_order', JSON.stringify(data.order));
        window.location.href = 'thankyou.html';
    } catch (error) {
        showCheckoutError(error.message);
        placeOrderBtn.innerText = originalText;
        placeOrderBtn.disabled = false;
    }
}

async function initCheckout() {
    const savedCart = localStorage.getItem('shopping_cart');
    checkoutCart = savedCart ? JSON.parse(savedCart) : {};

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Unable to load products.');
        checkoutProducts = await response.json();
        renderOrderSummary();
    } catch (error) {
        showCheckoutError(error.message);
    }
}

if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', submitCheckout);
}

initCheckout();
