// Global variables
let tabCount = 1;
let currentTip = 0;
let API_URL = 'https://lnbits.r00t.co'; // Replace with your LNBits instance URL if different
let API_KEY = '86f3ea1fe3a94d1e905a9be1861bb2be'; // Replace with your LNBits API key
const date = new Date().toLocaleDateString();

// DOM elements
const loadingDiv = document.getElementById('loading');
const createButton = document.getElementById('createButton');
const tx_info = document.getElementById('info');
const qrCodeElement = document.getElementById('qrcode');
// Tab management functions
function addItem(tabId) {
    const item = document.getElementById(`item${tabId}`).value.trim();
    const quantity = document.getElementById(`quantity${tabId}`).value;
    const itemCost = document.getElementById(`itemCost${tabId}`).value;
    const errorElement = document.getElementById(`error${tabId}`);
    
    if (!item || !quantity || !itemCost) {
        errorElement.textContent = "Please fill in all fields.";
        return;
    }

    if (isNaN(quantity) || quantity <= 0 || isNaN(itemCost) || itemCost < 0) {
        errorElement.textContent = "Please enter valid numbers for quantity and cost.";
        return;
    }

    errorElement.textContent = ""; // Clear any previous error messages
    
    const totalCost = (parseFloat(quantity) * parseFloat(itemCost)).toFixed(2);
    const itemElement = document.createElement('div');
    itemElement.className = 'item new-item';
    itemElement.draggable = true;
    itemElement.ondragstart = drag;
    itemElement.id = `item-${Date.now()}`;
    itemElement.innerHTML = `
        <span>${item} - Qty: ${quantity}, Cost: $${itemCost}, Total: $${totalCost}</span>
        <div class="edit-buttons">
            <button onclick="editItem('${itemElement.id}')">Edit</button>
            <button onclick="removeItem('${itemElement.id}')">Remove</button>
        </div>
    `;
    itemElement.dataset.item = item;
    itemElement.dataset.quantity = quantity;
    itemElement.dataset.cost = itemCost;
    itemElement.dataset.total = totalCost;
    
    document.getElementById(`list${tabId}`).appendChild(itemElement);
    
    document.getElementById(`item${tabId}`).value = '';
    document.getElementById(`quantity${tabId}`).value = '1';
    document.getElementById(`itemCost${tabId}`).value = '';
    
    updateTotal(tabId);
    updateSubTotal();
    updateGrandTotal();
}

function editItem(itemId) {
    const itemElement = document.getElementById(itemId);
    const item = itemElement.dataset.item;
    const quantity = itemElement.dataset.quantity;
    const cost = itemElement.dataset.cost;

    const newItem = prompt("Enter new item name:", item);
    const newQuantity = prompt("Enter new quantity:", quantity);
    const newCost = prompt("Enter new item cost:", cost);

    if (newItem && newQuantity && newCost) {
        if (isNaN(newQuantity) || newQuantity <= 0 || isNaN(newCost) || newCost < 0) {
            alert("Please enter valid numbers for quantity and cost.");
            return;
        }

        const newTotal = (parseFloat(newQuantity) * parseFloat(newCost)).toFixed(2);
        itemElement.innerHTML = `
            <span>${newItem} - Qty: ${newQuantity}, Cost: $${newCost}, Total: $${newTotal}</span>
            <div class="edit-buttons">
                <button onclick="editItem('${itemId}')">Edit</button>
                <button onclick="removeItem('${itemId}')">Remove</button>
            </div>
        `;
        itemElement.dataset.item = newItem;
        itemElement.dataset.quantity = newQuantity;
        itemElement.dataset.cost = newCost;
        itemElement.dataset.total = newTotal;

        updateTotal(itemElement.closest('.tab').id.replace('tab', ''));
        updateSubTotal();
        updateGrandTotal();
    }
}

function removeItem(itemId) {
    const itemElement = document.getElementById(itemId);
    const tabId = itemElement.closest('.tab').id.replace('tab', '');
    itemElement.remove();
    updateTotal(tabId);
    updateSubTotal();
    updateGrandTotal();
}
function splitTab() {
    tabCount++;
    const newTab = document.createElement('div');
    newTab.className = 'tab';
    newTab.id = `tab${tabCount}`;
    newTab.innerHTML = `
        <h2>Tab ${tabCount}</h2>
        <div class="itemized-list" id="list${tabCount}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>
        <div>
            <input type="text" id="item${tabCount}" placeholder="Item(s)">
            <input type="number" id="quantity${tabCount}" placeholder="Quantity" min="1" value="1">
            <input type="number" id="itemCost${tabCount}" placeholder="Item Cost" step="0.01" min="0">
            <button onclick="addItem(${tabCount})">Add Item</button>
        </div>
        <div id="error${tabCount}" class="error"></div>
        <div class="tabsubtotal">Sub Total: $<span id="tabsubtotal${tabCount}">0.00</span></div>
        <div class="tabtax">Tax: $<span id="tabtax${tabCount}">0.00</span></div>
        <div class="tabtip">Tip: $<span id="tabtip${tabCount}">0.00</span></div>
        <div class="tabtotal">Tab Total: $<span id="tabtotal${tabCount}">0.00</span></div>
        <div class="create-button">
                <button onclick="createPayment(1)" id="createButton">Create LN Invoice</button>
                </div>
        <div id="info${tabCount}" class="tx-info-container"></div>
        <div id="qrcode${tabCount}" class="qr-container"></div>
        </div>
    </div>
    `;
    document.getElementById('tabContainer').appendChild(newTab);
}
// Drag and Drop functions
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const draggedElement = document.getElementById(data);
    const sourceTabId = draggedElement.closest('.tab').id.replace('tab', '');
    let targetTabId;

    if (ev.target.className === 'itemized-list') {
        ev.target.appendChild(draggedElement);
        targetTabId = ev.target.closest('.tab').id.replace('tab', '');
    } else if (ev.target.className === 'item') {
        ev.target.parentNode.insertBefore(draggedElement, ev.target.nextSibling);
        targetTabId = ev.target.closest('.tab').id.replace('tab', '');
    }
    
    if (sourceTabId !== targetTabId) {
        updateTotal(sourceTabId);
        updateTotal(targetTabId);
    }
}
// Total Tip and Tax calculation functions
function updateTotal(tabId) {
    const items = document.getElementById(`list${tabId}`).getElementsByClassName('item');
    let total = 0;
    for (let item of items) {
        total += parseFloat(item.dataset.total);
    }
    document.getElementById(`tabsubtotal${tabId}`).textContent = total.toFixed(2);
    updateTotalWithTip(tabId, total);
    updateSubTotal();
    updateTaxTotal();
    updateGrandTotal();
}

function updateTotalWithTip(tabId, newTotal) {
    const tipPercentage = currentTip;
    const tipAmount = newTotal * tipPercentage;
    const totalWithTip = newTotal + tipAmount;
    
    document.getElementById(`tabtip${tabId}`).textContent = tipAmount.toFixed(2);
    document.getElementById(`tabtotal${tabId}`).textContent = totalWithTip.toFixed(2);
}

function applyTip(percentage) {
    currentTip = percentage;
    applyTipToAllTabs();
    updateSubTotal();
    updateTaxTotal();
    updateGrandTotal();
    updateTipTotal()
}

function applyCustomTip() {
    const customTipInput = document.getElementById('customTipInput');
    const customTip = parseFloat(customTipInput.value);
    if (isNaN(customTip) || customTip < 0 || customTip > 100) {
        alert("Please enter a valid tip percentage between 0 and 100.");
        customTipInput.value = ''; // Clear invalid input
        return;
    }
    currentTip = customTip / 100;
    applyTipToAllTabs();
    updateSubTotal();
    updateTaxTotal();
    updateGrandTotal();
    updateTipTotal();
    customTipInput.value = ''; // Clear input after successful application
}

function applyTipToAllTabs() {
    for (let i = 1; i <= tabCount; i++) {
        const tabsubtotal = parseFloat(document.getElementById(`tabsubtotal${i}`).textContent);
        const tabtax = parseFloat(document.getElementById(`tabtax${i}`).textContent);
        const total = tabsubtotal + tabtax;
        updateTotalWithTip(i, total);
        updateSubTotal();
        updateTaxTotal();
        updateGrandTotal();
        updateTipTotal()
    }
}

function updateSubTotal() {
    let subTotal = 0;
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const tabSubtotal = parseFloat(document.getElementById(`tabsubtotal${tabId}`).textContent);
        subTotal += tabSubtotal;
    }
    document.getElementById('subTotalAmount').textContent = subTotal.toFixed(2);
}

function updateTaxTotal() {
    let subTotal = 0;
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const tabSubtotal = parseFloat(document.getElementById(`tabtax${tabId}`).textContent);
        subTotal += tabSubtotal;
    }
    document.getElementById('taxTotalAmount').textContent = subTotal.toFixed(2);
}

function updateTipTotal() {
    const SubTotal = document.getElementById('subTotalAmount').textContent;
    const GrandTotal = document.getElementById('grandTotalAmount').textContent;
    var resultElement = document.getElementById('tipTotalPercent');
    var tipAmount = (parseFloat(GrandTotal) - parseFloat(SubTotal)).toFixed(2);
    
    var subTotalFloat = parseFloat(SubTotal);
    var grandTotalFloat = parseFloat(GrandTotal);

    document.getElementById('tipTotalAmount').textContent = tipAmount;

    if (isNaN(subTotalFloat) || isNaN(grandTotalFloat)) {
        resultElement.textContent = "Invalid input";
        return;
    }

    if (grandTotalFloat === 0) {
        resultElement.textContent = "Cannot divide by zero";
        return;
    }

    var percentage = (tipAmount / subTotalFloat) * 100;
    resultElement.textContent = percentage.toFixed(0) + "%";
}

function updateGrandTotal() {
    let grandTotal = 0;
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const tabTotal = parseFloat(document.getElementById(`tabtotal${tabId}`).textContent);
        grandTotal += tabTotal;
    }
    document.getElementById('grandTotalAmount').textContent = grandTotal.toFixed(2);
}

function roundTotal(direction) {
	const grandTotalElement = document.getElementById('grandTotalAmount');
	const currentTotal = parseFloat(grandTotalElement.textContent);
	let roundedTotal;

	if (direction === 'up') {
		roundedTotal = Math.ceil(currentTotal);
        document.getElementById("roundUp").disabled = true;
	} else {
		roundedTotal = Math.floor(currentTotal);
        document.getElementById("roundDown").disabled = true;
	}

	const difference = roundedTotal - currentTotal;

	grandTotalElement.textContent = roundedTotal.toFixed(2);

	const totalWithTip1Element = document.getElementById('tabtotal1');
	const currentTotalWithTip = parseFloat(totalWithTip1Element.textContent);
	const newTotalWithTip = (currentTotalWithTip + difference).toFixed(2);
	totalWithTip1Element.textContent = newTotalWithTip;
    updateGrandTotal();
	
}
function applyTotalTax() {
    const totalTaxInput = document.getElementById('totalTaxInput');
    const totalTax = parseFloat(totalTaxInput.value);

    if (isNaN(totalTax) || totalTax < 0) {
        alert("Please enter a valid tax amount (non-negative number).");
        totalTaxInput.value = ''; // Clear invalid input
        return;
    }

    const tabs = document.getElementsByClassName('tab');
    let totalBeforeTax = 0;

    // Calculate the total amount before tax
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const tabSubtotal = parseFloat(document.getElementById(`tabsubtotal${tabId}`).textContent);
        totalBeforeTax += tabSubtotal;
    }

    if (totalBeforeTax === 0) {
        alert("Cannot apply tax. Total before tax is zero.");
        totalTaxInput.value = '';
        return;
    }
    // Apply tax proportionally to each tab
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const tabSubtotal = parseFloat(document.getElementById(`tabsubtotal${tabId}`).textContent);
        const tabTax = (tabSubtotal / totalBeforeTax) * totalTax;

        document.getElementById(`tabtax${tabId}`).textContent = tabTax.toFixed(2);

        const currentTip = parseFloat(document.getElementById(`tabtip${tabId}`).textContent) || 0;
        const newTabTotal = tabSubtotal + tabTax + currentTip;
        document.getElementById(`tabtotal${tabId}`).textContent = newTabTotal.toFixed(2);
    }

    // Update subtotal, grand total, and tip total
    updateSubTotal();
    updateTaxTotal();
    updateGrandTotal();

    // Clear the tax input field
    totalTaxInput.value = '';
}
// Modal functions
function openSettingsModal() {
    document.getElementById('settingsModal').style.display = 'block';
    document.getElementById('apiUrl').value = API_URL;
    document.getElementById('apiKey').value = API_KEY;
}

function closeSettingsModal() {
    document.getElementById('settingsModal').style.display = 'none';
}

function saveSettings(event) {
    event.preventDefault();
    API_URL = document.getElementById('apiUrl').value;
    API_KEY = document.getElementById('apiKey').value;
    closeSettingsModal();
    console.log('Settings saved:', { API_URL, API_KEY });
}

function openInfoModal() {
    document.getElementById('infoModal').style.display = 'block';
}

function closeInfoModal() {
    document.getElementById('infoModal').style.display = 'none';
}

function dissInfo() {
    event.preventDefault();
    closeInfoModal();
}
// Event listeners
window.onclick = function(event) {
    if (event.target == document.getElementById('infoModal')) {
        closeInfoModal();
    } else if (event.target == document.getElementById('settingsModal')) {
        closeSettingsModal(); }
}
// Payment functions
async function createPayment(tabId) {
    document.getElementById("overlay").style.display = "block";
    const createButton = document.querySelector(`#tab${tabId} button[onclick="createPayment(${tabId})"]`);
    createButton.disabled = true;
    const errorElement = document.getElementById(`error${tabId}`);
    const infoElement = document.getElementById(`info${tabId}`);
    const qrCodeElement = document.getElementById(`qrcode${tabId}`);

    try {
        const usdAmount = parseFloat(document.getElementById(`tabtotal${tabId}`).textContent);
        if (isNaN(usdAmount) || usdAmount <= 0) {
            throw new Error("Invalid amount. Please check the tab total.");
        }

        const conversionResponse = await axios.post(`${API_URL}/api/v1/conversion`, {
            from_: `usd`,
            amount: usdAmount,
            to: `sat`
        }, {
            headers: { 'X-Api-Key': API_KEY }
        });

        const satsAmount = conversionResponse.data.sats;

        const paymentResponse = await axios.post(`${API_URL}/api/v1/payments`, {
            out: false,
            amount: satsAmount,
            memo: `Payment of ${usdAmount} USD for Tab ${tabId} on ${date}`
        }, {
            headers: { 'X-Api-Key': API_KEY }
        });

        const qrCodeResponse = await axios.get(`${API_URL}/api/v1/qrcode/${paymentResponse.data.payment_request}`, {
            responseType: 'blob'
        });
        const qrCodeUrl = URL.createObjectURL(qrCodeResponse.data);

        infoElement.innerHTML = `
            Amount: ${usdAmount} USD (${satsAmount} sats)<br>
            Payment hash: ${paymentResponse.data.payment_hash}<br>
            Payment request: ${paymentResponse.data.payment_request}<br>
            <div id="paymentStatus${tabId}">Payment status: Pending</div>
        `;

        qrCodeElement.innerHTML = `
            <img src="${qrCodeUrl}" alt="Payment QR Code"> <br>
        `;

        pollPaymentStatus(tabId, paymentResponse.data.payment_hash);

    } catch (error) {
        console.error('Error in createPayment:', error);
        errorElement.textContent = `Failed to create invoice: ${error.message}. Please try again.`;
        qrCodeElement.innerHTML = ''; // Clear QR code in case of error
    } finally {
        document.getElementById("overlay").style.display = "none";
        createButton.disabled = false;
    }
}
function pollPaymentStatus(tabId, paymentHash) {
    const pollInterval = setInterval(async () => {
        try {
            const statusResponse = await axios.get(`${API_URL}/api/v1/payments/${paymentHash}`, {
                headers: { 'X-Api-Key': API_KEY }
            });

            const paymentStatus = statusResponse.data.paid ? 'Paid' : 'Pending';
            document.getElementById(`paymentStatus${tabId}`).textContent = `Payment status: ${paymentStatus}`;

            if (statusResponse.data.paid) {
                clearInterval(pollInterval);
                
                // Change QR code to success animation
                const qrCodeElement = document.getElementById(`qrcode${tabId}`);
                qrCodeElement.innerHTML = `<img src="/img/ani1.gif" alt="Payment Received" style="width: 363px; height: 363px;">`;
                
                // Disable the "Create LN Invoice" button
                document.querySelector(`#tab${tabId} button[onclick="createPayment(${tabId})"]`).disabled = true;
                
                // You can add more UI updates here
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    }, 5000); // Check every 5 seconds

    // Stop polling after 10 minutes (adjust as needed)
    setTimeout(() => {
        clearInterval(pollInterval);
    }, 600000);
}