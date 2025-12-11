// menuOrder.js - Updated with Category Filtering, Cart Refinements, and Checkout Logic

let cart = [];
let allMenuItems = []; // Dito natin ise-save ang lahat ng na-fetch na items
const SERVICE_FEE = 50.00; // Constant service fee (gawing float)
const QUEUE_TYPE = 'Dine-In';

// --- Table Data (Ito ay hardcoded lang; sa totoong app, galing ito sa API) ---
const tableData = [
    { id: 'T01', name: 'Table 1', status: 'available' },
    { id: 'T02', name: 'Table 2', status: 'occupied' },
    { id: 'T03', name: 'Table 3', status: 'available' },
    { id: 'T04', name: 'Table 4', status: 'available' },
    { id: 'T05', name: 'Table 5', status: 'occupied' },
    { id: 'T06', name: 'Table 6', status: 'available' },
    { id: 'T07', name: 'Table 7', status: 'available' },
    { id: 'T08', name: 'Table 8', status: 'available' },
    { id: 'T09', name: 'Table 9', status: 'occupied' },
    { id: 'T10', name: 'Table 10', status: 'available' },
    { id: 'T11', name: 'Table 11', status: 'available' },
    { id: 'T12', name: 'Table 12', status: 'occupied' },
];
let selectedTable = null; // New variable to track the selected table


// --- Helper function to normalize category strings ---
function normalizeString(str) {
    if (!str) return '';
    // Ginagawang lowercase at tinatanggal ang lahat ng spaces at hyphens
    return str.toLowerCase().replace(/[\s-]/g, ''); 
}

// =========================================================
// === FIXED: MOVED generateDescription to GLOBAL SCOPE ===
// =========================================================
function generateDescription(category) {
    const normCategory = category.toLowerCase();
    if (normCategory.includes('appetizer')) {
        return "Crispy, savory, and ready to kickstart your meal. Served with a delicious dip.";
    }
    if (normCategory.includes('dessert')) {
        return "A sweet finish to a perfect meal. Indulge in our delightful homemade dessert.";
    }
    if (normCategory.includes('drink')) {
        return "Refreshing and perfectly chilled to quench your thirst. Choose your favorite flavor.";
    }
    if (normCategory.includes('main dish')) {
        return "Our signature dish, cooked to perfection and served with satisfying side dishes.";
    }
    if (normCategory.includes('side dish')) {
        return "The perfect complement to any main course. Great for sharing!";
    }
    return "Delicious item on the menu. Order now!";
}
// =========================================================


// --- Fetch menu items from server ---
async function fetchMenu() {
    try {
        const res = await fetch('http://localhost:3000/api/menu'); 
        let rawMenuItems = await res.json(); 
        
        // =========================================================
        // === START OF TEMPORARY IMAGE/DESCRIPTION INJECTION FIX ===
        // =========================================================
        allMenuItems = rawMenuItems.map(item => {
            // Logic para sa Image URL
            const fileNameBase = item.item_name.toLowerCase().replace(/\s/g, '-');
            const imagePath = `Images&Icons/Menu/${fileNameBase}.jpg`; 

            // NEW LOGIC: Generate at I-inject ang Description
            const description = generateDescription(item.category); 

            return {
                ...item,
                image_url: imagePath,
                description: description // Injects the generated description
            };
        });
        // =========================================================
        // === END OF TEMPORARY IMAGE/DESCRIPTION INJECTION FIX ===
        // =========================================================

        // Initial load: filter for 'all' items
        filterMenu('all'); 
        setupCategoryTabs(); 
    } catch (err) {
        console.error('Error fetching menu:', err);
        document.querySelector('.items-grid').innerHTML = '<p class="empty-menu">Error loading menu. Please check the server connection.</p>';
    }
}

// --- Filter and Render menu cards ---
function filterMenu(category) {
    const normalizedCategory = normalizeString(category); 
    
    // TEMPORARY DEBUG LOGS (TANGGALIN PAG WALA NANG BUGS)
    // console.log('--- Filtering started ---');
    // console.log('Normalized Category from Tab:', normalizedCategory);

    const filteredItems = category === 'all'
        ? allMenuItems
        : allMenuItems.filter(item => {
            const normalizedItemCategory = normalizeString(item.category);
            
            // console.log(`Checking item: ${item.item_name} (DB Value: ${item.category}) -> Normalized: ${normalizedItemCategory}`);
            
            return normalizedItemCategory === normalizedCategory;
        });
        
    // console.log(`Found ${filteredItems.length} items for ${category}.`);
    // console.log('--- Filtering finished ---'); 

    renderMenu(filteredItems);
}

// --- Setup click handlers for tabs ---
function setupCategoryTabs() {
    const tabs = document.querySelectorAll('.category-tabs .tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 1. I-clear ang 'active' class sa lahat ng tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // 2. I-set ang 'active' class sa pinindot na tab
            this.classList.add('active');
            
            // 3. I-filter ang menu gamit ang data-category attribute (from HTML)
            const category = this.getAttribute('data-category');
            filterMenu(category);
        });
    });
}


// --- Render menu cards dynamically --- 
function renderMenu(items) {
    const container = document.querySelector('.items-grid');
    container.innerHTML = ''; // clear previous

    if (!items || items.length === 0) {
        container.innerHTML = `
            <div class="empty-menu">
                <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="var(--secondary-text)"><path d="m400-80 56-114q11-22 28.5-33t42.5-11q25 0 42.5 11t28.5 33l56 114h280L560-480 840-880H120l280 800Zm40-540-100-260h440L440-620Zm-28-500h288L440-620 412-160l-58-132q-11-25-33-38.5t-51-13.5H40V-880Z"/></svg>
                <p>No menu items available in this category.</p>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.innerHTML = `
            <div class="item-image">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.item_name}">` : '🍴'}
            </div>
            <div class="item-details">
                <h3>${item.item_name}</h3>
                <p class="item-description">${item.description || item.category}</p>
                <div class="item-footer">
                    <span class="price">₱${item.price.toFixed(2)}</span>
                    <button class="add-btn">Add +</button>
                </div>
            </div>
            <span class="category-badge">${item.category}</span>
        `;

        // Add button functionality
        card.querySelector('.add-btn').addEventListener('click', () => {
            // I-pass ang lahat ng kailangan na details
            addToCart(item.item_id, item.item_name, item.price);
        });

        container.appendChild(card);
    });
}

// --- Add to cart ---
function addToCart(itemId, itemName, itemPrice) {
    const existing = cart.find(i => i.id === itemId);
    if(existing){
        existing.qty++;
    } else {
        // Tiyakin na ang price ay number
        const priceNum = parseFloat(itemPrice);
        cart.push({id: itemId, name: itemName, price: priceNum, qty: 1});
    }
    updateCartUI();
}

// --- Update cart UI ---
function updateCartUI() {
    const cartList = document.getElementById('cartItemsList');
    cartList.innerHTML = ''; // clear previous
    
    // Calculate totals
    const subtotalValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const grandTotalValue = subtotalValue + SERVICE_FEE; 

    // FIXED: Removed misplaced generateDescription function here

    document.getElementById('cartItemCount').textContent = totalItems;
    
    // Tiyakin na may element na 'cartBadge' sa HTML mo, kung ginagamit mo
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }

    document.getElementById('subtotal').textContent = `₱${subtotalValue.toFixed(2)}`;
    
    // FIX: Tiyakin na tama ang Service Fee display (assuming second span in cart-total)
    const deliveryFeeSpan = document.querySelector('.cart-total .summary-line:nth-child(2) span:last-child');
    if(deliveryFeeSpan) {
        deliveryFeeSpan.textContent = `₱${SERVICE_FEE.toFixed(2)}`;
    }
    
    document.getElementById('total').textContent = `₱${grandTotalValue.toFixed(2)}`;

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.disabled = cart.length === 0; // Disable checkout if cart is empty

    if(cart.length === 0){
        cartList.innerHTML = `<p style="text-align:center; color:#888; margin-top:40px;">
                                Your cart is empty. Add some delicious items!
                              </p>`;
        return;
    }

    // Render cart items
    cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div>
                <span class="cart-item-name">${item.name}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn minus-btn" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="quantity-btn plus-btn" data-id="${item.id}">+</button>
                </div>
            </div>
            <span class="cart-item-total">₱${(item.price * item.qty).toFixed(2)}</span>
        `;

        // Attach event listeners using data-id
        div.querySelector('.minus-btn').addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-id');
            changeQuantity(itemId, -1);
        });
        div.querySelector('.plus-btn').addEventListener('click', (e) => {
            const itemId = e.target.getAttribute('data-id');
            changeQuantity(itemId, 1);
        });

        cartList.appendChild(div);
    });
}

// --- Change item quantity ---
function changeQuantity(itemId, delta) {
    // Note: itemId is likely a string here, make sure it matches the type in cart array
    const item = cart.find(i => i.id == itemId); 
    if(!item) return;

    item.qty += delta;
    if(item.qty <= 0) {
        cart = cart.filter(i => i.id != itemId);
    }

    updateCartUI();
}

// --- Cart sidebar toggle ---
function toggleCart() {
    document.getElementById('cartSidebar').classList.toggle('open');
    
    // Tiyakin na nagtu-tulak ang main content
    document.body.classList.toggle('cart-open');
}

function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
    
    // Tiyakin na bumabalik ang main content
    document.body.classList.remove('cart-open');
}


// =========================================================
// === CHECKOUT AND TABLE SELECTION LOGIC ==================
// =========================================================

// --- Checkout Logic (New Function) ---
function proceedToCheckout() {
    if (cart.length === 0) {
        alert('Please add items to your cart first.');
        return;
    }
    // 1. I-render ang tables at i-display ang modal
    renderTables();
    document.getElementById('tableModal').classList.add('open');
    closeCart(); // Isara ang cart sidebar
}


// --- Table Modal Functions ---
function renderTables() {
    const tableGrid = document.getElementById('tableGrid');
    tableGrid.innerHTML = '';
    selectedTable = null; // Reset selection

    tableData.forEach(table => {
        const tableSeat = document.createElement('div');
        // I-set ang class based sa status
        tableSeat.className = `table-seat ${table.status}`;
        tableSeat.textContent = table.name;
        tableSeat.setAttribute('data-id', table.id);

        if (table.status === 'available') {
            tableSeat.addEventListener('click', () => selectTable(table.id, table.name));
        }

        tableGrid.appendChild(tableSeat);
    });

    // Tiyakin na disabled ang Confirm button pag-load
    const confirmBtn = document.getElementById('confirmTableBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
    }
}

function selectTable(tableId, tableName) {
    // 1. I-clear ang previous selection
    document.querySelectorAll('.table-seat.selected').forEach(seat => {
        seat.classList.remove('selected');
    });

    // 2. I-set ang new selection
    const selectedSeat = document.querySelector(`.table-seat[data-id="${tableId}"]`);
    selectedSeat.classList.add('selected');
    selectedTable = { id: tableId, name: tableName };

    // 3. I-enable ang Confirm button
    const confirmBtn = document.getElementById('confirmTableBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
    }
}

function closeTableModal() {
    document.getElementById('tableModal').classList.remove('open');
    selectedTable = null;
}

// --- Confirm Table & Place Order (Fixed) ---
async function confirmOrder() {
    // Tiyakin na may table at may laman ang cart
    if (!selectedTable || cart.length === 0) {
         alert('Please confirm your table location and ensure your cart is not empty.');
         return;
    }

    // Calculation (I-a-assume na tama na ang calculation logic mo)
    const subtotalValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const grandTotalValue = subtotalValue + SERVICE_FEE;

    // Order Payload: Tugma sa columns ng iyong orders table at complexity function
    const orderPayload = {
        table_id: selectedTable.id, 
        table_name: selectedTable.name, // Kahit hindi ito sine-save, okay lang na isama
        queue_type: QUEUE_TYPE,         // 'Dine-In'
        items: cart.map(item => ({
            // CRITICAL: Dapat may item_id, name, qty (quantity), at price
            item_id: item.id,
            name: item.name, 
            qty: item.qty, 
            price: item.price
        })),
        subtotal: subtotalValue,
        total_amount: grandTotalValue,
        service_fee: SERVICE_FEE
    };

    console.log('Sending order to server:', orderPayload);

    // --- REAL API CALL (Ito ang magpapadala sa database) ---
    try {
        const response = await fetch('http://localhost:3000/api/orders', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(orderPayload)
        });
        
        // Error handling kung hindi 200/201 ang status
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Order submission failed! Server says: ${errorData.error || response.statusText}`);
        }
        
        // Kunin ang Order ID at iba pang resulta mula sa server
        const result = await response.json(); 

        // Success! Ipakita ang Order Summary Modal
        // Dapat ibalik ng server ang order_id, table_id, total_amount, at queue_type
        showOrderSummary(result, selectedTable, result.queue_type, orderPayload.items);
        
        // I-reset ang Cart
        cart = [];
        updateCartUI(); 
        document.getElementById('tableModal').classList.remove('open');
        selectedTable = null; 
        
    } catch (error) {
        // Ipakita ang error sa user
        console.error('Order submission failed:', error);
        alert('Order failed! Please check your server connection and try again. Error: ' + error.message);
    }
}

// --- Order Summary Modal Functions (Fixed) ---
function showOrderSummary(orderData, tableInfo, queueType, itemsList) { // 🚨 FIXED: Dinagdagan ng queueType parameter
    // I-populate ang modal details
    document.getElementById('summaryOrderID').textContent = `#${orderData.order_id || '00000'}`;
    document.getElementById('selectedTableDisplay').textContent = tableInfo.name;
    document.getElementById('summaryQueueType').textContent = queueType; // NEW! I-display ang Queue Type
    
    // Note: Hindi pa natin sinasama ang 'summaryTotalScore' logic
    
    document.getElementById('summarySubtotal').textContent = `₱${orderData.subtotal.toFixed(2)}`;
    document.getElementById('summaryGrandTotal').textContent = `₱${orderData.total_amount.toFixed(2)}`;
    
    // I-populate ang item list
    const summaryList = document.getElementById('orderItemsListSummary');
    summaryList.innerHTML = '';
    itemsList.forEach(item => { // <-- Gamit ang itemsList na galing sa orderPayload
        const div = document.createElement('div');
        div.className = 'summary-item'; 
        div.innerHTML = `
            <span>${item.name} (x${item.qty})</span>
            <span>₱${(item.price * item.qty).toFixed(2)}</span>
        `;
        summaryList.appendChild(div);
    });

    // I-display ang modal
    document.getElementById('orderSummaryModal').classList.add('open');
}

function closeOrderSummary() {
    document.getElementById('orderSummaryModal').classList.remove('open');
}


// --- Expose functions to the global scope (HTML onclick) ---
window.toggleCart = toggleCart;
window.closeCart = closeCart;
window.proceedToCheckout = proceedToCheckout; 
window.closeTableModal = closeTableModal; 
window.confirmOrder = confirmOrder; 
window.closeOrderSummary = closeOrderSummary; 
window.changeQuantity = changeQuantity; 

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
    updateCartUI(); 
});