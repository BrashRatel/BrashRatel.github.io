let tabCount = 1;
let currentTip = 0;

let API_URL = 'https://demo.lnbits.com'; // Replace with your LNBits instance URL if different
let API_KEY = 'af244e6032ae47b6872973721a0be66c'; // Replace with your LNBits API key

date = new Date().toLocaleDateString();
const loadingDiv = document.getElementById('loading');
const createButton = document.getElementById('createButton');
const tx_info = document.getElementById('info');
const qrCodeElement = document.getElementById('qrcode');

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
    updateTipTotal()
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
        updateTipTotal()
    }
}

function removeItem(itemId) {
    const itemElement = document.getElementById(itemId);
    const tabId = itemElement.closest('.tab').id.replace('tab', '');
    itemElement.remove();
    updateTotal(tabId);
    updateSubTotal();
    updateGrandTotal();
    updateTipTotal()
}

function updateTotal(tabId) {
    const items = document.getElementById(`list${tabId}`).getElementsByClassName('item');
    let total = 0;
    for (let item of items) {
        total += parseFloat(item.dataset.total);
    }
    document.getElementById(`total${tabId}`).textContent = total.toFixed(2);
    updateTotalWithTip(tabId, total);
    updateSubTotal();
    updateGrandTotal();
    updateTipTotal()
}

function updateTotalWithTip(tabId, total) {
    const totalWithTip = total * (1 + currentTip);
    document.getElementById(`totalWithTip${tabId}`).textContent = totalWithTip.toFixed(2);
}

function applyTip(percentage) {
    currentTip = percentage;
    applyTipToAllTabs();
    updateSubTotal();
    updateGrandTotal();
    updateTipTotal()
}

function applyCustomTip() {
    const customTip = parseFloat(document.getElementById('customTipInput').value);
    if (isNaN(customTip) || customTip < 0 || customTip > 100) {
        alert("Please enter a valid tip percentage between 0 and 100.");
        return;
    }
    currentTip = customTip / 100;
    applyTipToAllTabs();
    updateSubTotal();
    updateGrandTotal();
    updateTipTotal()
}

function applyTipToAllTabs() {
    for (let i = 1; i <= tabCount; i++) {
        const total = parseFloat(document.getElementById(`total${i}`).textContent);
        updateTotalWithTip(i, total);
        updateSubTotal();
        updateGrandTotal();
        updateTipTotal()
    }
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
        <div class="total">Total: $<span id="total${tabCount}">0.00</span></div>
        <div class="total-with-tip">Total with Tip: $<span id="totalWithTip${tabCount}">0.00</span></div>
        <button onclick="createPayment(${tabCount})" id="createButton">Create LN Invoice</button>
        <div id="info${tabCount}" class="tx-info-container"></div>
        <div id="qrcode${tabCount}" class="qr-container"></div>
        </div>
    </div>
    `;
    document.getElementById('tabContainer').appendChild(newTab);
}

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

function updateSubTotal() {
    let subTotal = 0;
    const tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i].id.replace('tab', '');
        const totalNoTipElement = document.getElementById(`total${tabId}`);
        if (totalNoTipElement) {
            subTotal += parseFloat(totalNoTipElement.textContent);
        }
    }
    document.getElementById('subTotalAmount').textContent = subTotal.toFixed(2);
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
        const totalWithTipElement = document.getElementById(`totalWithTip${tabId}`);
        if (totalWithTipElement) {
            grandTotal += parseFloat(totalWithTipElement.textContent);
        }
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

	const totalWithTip1Element = document.getElementById('totalWithTip1');
	const currentTotalWithTip = parseFloat(totalWithTip1Element.textContent);
	const newTotalWithTip = (currentTotalWithTip + difference).toFixed(2);
	totalWithTip1Element.textContent = newTotalWithTip;
    updateTipTotal()
	
}

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

window.onclick = function(event) {
    if (event.target == document.getElementById('infoModal')) {
        closeInfoModal();
    } else if (event.target == document.getElementById('settingsModal')) {
        closeSettingsModal(); }
}

async function createPayment(tabId) {
    //let result = 0;
    document.getElementById("overlay").style.display = "block";
    createPayment.disabled = true;
    //
    const usdAmount = parseFloat(document.getElementById(`totalWithTip${tabId}`).textContent );
    try {
        const conversionResponse = await axios.post(`${API_URL}/api/v1/conversion`, {
            from_: `usd`,
            amount: usdAmount,
            to: `sat`
        }, {
            headers: { 'X-Api-Key': API_KEY }
        });

        const satsAmount = conversionResponse.data.sats;

        // Create payment
        const paymentResponse = await axios.post(`${API_URL}/api/v1/payments`, {
            out: false,
            amount: satsAmount,
            memo: `Payment of ${usdAmount} USD for Tab ${tabId} on ${date}`
        }, {
            headers: { 'X-Api-Key': API_KEY }
        });

        // Generate QR code
        const qrCodeResponse = await axios.get(`${API_URL}/api/v1/qrcode/${paymentResponse.data.payment_request}`, {
            responseType: 'blob'
        });
        const qrCodeUrl = URL.createObjectURL(qrCodeResponse.data);


        // Display payment details
        document.getElementById(`info${tabId}`).innerHTML = `
            Amount: ${usdAmount} USD (${satsAmount} sats)<br>
            Payment hash: ${paymentResponse.data.payment_hash}<br>
            Payment request: ${paymentResponse.data.payment_request}<br>
            <div id="paymentStatus${tabId}">Payment status: Pending</div>
        `;

        // Display payment details
        document.getElementById(`qrcode${tabId}`).innerHTML = `
            <img src="${qrCodeUrl}" alt="Payment QR Code"> <br>
        `;

        // Start polling for payment status
        pollPaymentStatus(tabId, paymentResponse.data.payment_hash);

    } catch (error) {
        document.getElementById(`error${tabId}`).textContent = `Failed to create invoice: ${error.message}. Please try again.`;
        document.getElementById(`qrcode${tabId}`).innerHTML = ''; // Clear QR code in case of error
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