// Array stores the current state of all items
let lootArray = [];

// Shows error messages in the UI instead of using popups
function displayMessage(message) {
    const messageBox = document.getElementById('ui-messages');
    messageBox.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('error');
}

// Clears existing errors before new actions run
function clearMessages() {
    const messageBox = document.getElementById('ui-messages');
    messageBox.textContent = '';
    messageBox.classList.add('hidden');
    messageBox.classList.remove('error');
}

function addLoot() {
    clearMessages();
    
    const nameInput = document.getElementById('loot-name-input');
    const valueInput = document.getElementById('loot-value-input');
    const quantityInput = document.getElementById('loot-quantity-input');
    
    const name = nameInput.value.trim();
    const value = parseFloat(valueInput.value);
    const quantity = parseInt(quantityInput.value, 10);

    // Stop execution if inputs are empty or mathematically invalid
    if (name === "") {
        displayMessage("Loot Name cannot be empty.");
        return; 
    }
    if (isNaN(value) || value < 0) {
        displayMessage("Please enter a valid, non-negative Loot Value.");
        return;
    }
    if (isNaN(quantity) || quantity < 1) {
        displayMessage("Please enter a valid quantity of 1 or greater.");
        return;
    }

    // Bundle the item data together
    const lootItem = {
        name: name,
        value: value,
        quantity: quantity
    };

    lootArray.push(lootItem);

    nameInput.value = "";
    valueInput.value = "";
    quantityInput.value = "";

    // Refresh the screen to show the new item
    updateUI();
}

function removeLoot(index) {
    // Delete the specific item from the array
    lootArray.splice(index, 1);
    updateUI();
}

// Central function that handles all math, rendering, and logic checks
function updateUI() {
    const lootRows = document.getElementById('lootRows');
    const noLootMessage = document.getElementById('noLootMessage');
    const runningTotalDisplay = document.getElementById('running-total-display');
    const splitBtn = document.getElementById('split-loot-btn');
    const splitResultsArea = document.getElementById('split-results-area');
    
    const partySizeInput = document.getElementById('party-size-input');
    const partySize = parseInt(partySizeInput.value, 10);

    // Wipe the display to prevent duplicates
    lootRows.innerHTML = "";
    
    let currentTotal = 0;

    // Build the HTML list and add up the total value
    for (let i = 0; i < lootArray.length; i++) {
        let row = document.createElement("div");
        row.className = "loot-row";

        let nameCell = document.createElement("div");
        nameCell.className = "loot-cell";
        nameCell.innerText = lootArray[i].name;

        let valueCell = document.createElement("div");
        valueCell.className = "loot-cell";
        valueCell.innerText = "$" + lootArray[i].value.toFixed(2);

        let quantityCell = document.createElement("div");
        quantityCell.className = "loot-cell";
        quantityCell.innerText = lootArray[i].quantity;

        let actionCell = document.createElement("div");
        actionCell.className = "loot-cell loot-actions";

        let removeBtn = document.createElement("button");
        removeBtn.innerText = "Remove";
        removeBtn.addEventListener("click", function () {
            removeLoot(i);
        });

        actionCell.appendChild(removeBtn);
        row.appendChild(nameCell);
        row.appendChild(valueCell);
        row.appendChild(quantityCell);
        row.appendChild(actionCell);

        lootRows.appendChild(row);
        
        currentTotal += (lootArray[i].value * lootArray[i].quantity);
    }

    runningTotalDisplay.textContent = currentTotal.toFixed(2);
    document.getElementById('final-total-display').textContent = currentTotal.toFixed(2);

    let isPartyValid = !isNaN(partySize) && partySize >= 1;
    let hasLoot = lootArray.length > 0;

    // Show or hide the empty state message
    if (hasLoot) {
        noLootMessage.classList.add('hidden');
        document.querySelector('.loot-table').classList.remove('hidden');
    } else {
        noLootMessage.classList.remove('hidden');
        document.querySelector('.loot-table').classList.add('hidden');
    }

    // Lock the split button if the state is invalid, otherwise calculate the split
    if (hasLoot && isPartyValid) {
        splitBtn.disabled = false;
        let splitAmount = currentTotal / partySize;
        document.getElementById('split-amount-display').textContent = splitAmount.toFixed(2);
    } else {
        splitBtn.disabled = true;
        splitResultsArea.classList.add('hidden'); 
    }
}

function splitLoot() {
    clearMessages();
    // Reveal the results panel (math is already done by updateUI)
    document.getElementById('split-results-area').classList.remove('hidden');
}

document.getElementById('add-loot-btn').addEventListener('click', addLoot);
document.getElementById('split-loot-btn').addEventListener('click', splitLoot);
// Automatically update math when the party size changes
document.getElementById('party-size-input').addEventListener('input', updateUI);

// Run once on load to set up the default hidden states
updateUI();