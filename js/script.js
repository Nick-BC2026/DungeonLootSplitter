// Placed at the top so it is available to all functions and prevents typos
const STORAGE_KEY = "lootSplitterState";

// Global variables act as the single source of truth for the app state
let lootArray = [];
let partySize = 1;

// Converts the state object to a string and saves it to localStorage
function saveState() {
    const stateObj = {
        loot: lootArray,
        partySize: partySize
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
}

// Runs on page load. Pulls the string from storage, safely parses it, 
// and rigorously validates the data before updating live variables.
function restoreState() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            
            if (parsed.partySize && typeof parsed.partySize === 'number' && parsed.partySize >= 1) {
                partySize = parsed.partySize;
                document.getElementById('party-size-input').value = partySize;
            }

            if (Array.isArray(parsed.loot)) {
                lootArray = []; 
                for (let i = 0; i < parsed.loot.length; i++) {
                    let item = parsed.loot[i];
                    
                    if (item.name && item.name.trim() !== "" &&
                        typeof item.value === 'number' && item.value >= 0 &&
                        typeof item.quantity === 'number' && item.quantity >= 1) {
                        
                        lootArray.push(item);
                    }
                }
            }
        } catch (error) {
            // Safely falls back to empty defaults if the saved data is corrupted
            lootArray = [];
            partySize = 1;
        }
    } else {
        document.getElementById('party-size-input').value = partySize;
    }
}

// Clears active memory and saved storage, then refreshes the UI
function resetAll() {
    lootArray = [];
    partySize = 1;
    document.getElementById('party-size-input').value = partySize;
    
    localStorage.removeItem(STORAGE_KEY);
    clearMessages();
    updateUI();
}

function displayMessage(message) {
    const messageBox = document.getElementById('ui-messages');
    messageBox.textContent = message;
    messageBox.classList.remove('hidden');
    messageBox.classList.add('error');
}

function clearMessages() {
    const messageBox = document.getElementById('ui-messages');
    messageBox.textContent = '';
    messageBox.classList.add('hidden');
    messageBox.classList.remove('error');
}

// Validates inputs to protect state. If valid, adds the item, saves, and updates.
function addLoot() {
    clearMessages();
    
    const nameInput = document.getElementById('loot-name-input');
    const valueInput = document.getElementById('loot-value-input');
    const quantityInput = document.getElementById('loot-quantity-input');
    
    const name = nameInput.value.trim();
    const value = parseFloat(valueInput.value);
    const quantity = parseInt(quantityInput.value, 10);

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

    const lootItem = { name: name, value: value, quantity: quantity };

    lootArray.push(lootItem);
    saveState();

    nameInput.value = "";
    valueInput.value = "";
    quantityInput.value = "";

    updateUI();
}

// Removes the specific item from the array, saves the new state, and updates the screen
function removeLoot(index) {
    lootArray.splice(index, 1);
    saveState();
    updateUI();
}

// Updates the party size in memory and storage whenever a valid number is typed
function handlePartySizeChange(e) {
    const newSize = parseInt(e.target.value, 10);
    if (!isNaN(newSize) && newSize >= 1) {
        partySize = newSize;
        saveState();
    }
    updateUI();
}

// Central function that handles all math and DOM updates based on the current state
function updateUI() {
    const lootRows = document.getElementById('lootRows');
    const noLootMessage = document.getElementById('noLootMessage');
    const runningTotalDisplay = document.getElementById('running-total-display');
    const splitBtn = document.getElementById('split-loot-btn');
    const splitResultsArea = document.getElementById('split-results-area');
    
    lootRows.innerHTML = "";
    let currentTotal = 0;

    // 1. Calculate totals
    // 2. Render loot list
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

    // 5. Show/hide results (Empty State logic)
    if (hasLoot) {
        noLootMessage.classList.add('hidden');
        document.querySelector('.loot-table').classList.remove('hidden');
    } else {
        noLootMessage.classList.remove('hidden');
        document.querySelector('.loot-table').classList.add('hidden');
    }

    // 3. Calculate split
    // 4. Enable/disable Split button
    if (hasLoot && isPartyValid) {
        splitBtn.disabled = false;
        let splitAmount = currentTotal / partySize;
        document.getElementById('split-amount-display').textContent = splitAmount.toFixed(2);
    } else {
        splitBtn.disabled = true;
        splitResultsArea.classList.add('hidden'); 
    }
}

// Simply reveals the results panel since updateUI already completed the math
function splitLoot() {
    clearMessages();
    document.getElementById('split-results-area').classList.remove('hidden');
}

// Binds all interactions to their respective elements
document.getElementById('add-loot-btn').addEventListener('click', addLoot);
document.getElementById('split-loot-btn').addEventListener('click', splitLoot);
document.getElementById('party-size-input').addEventListener('input', handlePartySizeChange);
document.getElementById('reset-all-btn').addEventListener('click', resetAll);

// Ensures the HTML is fully loaded before attempting to restore state or update the screen
document.addEventListener('DOMContentLoaded', function() {
    restoreState();
    updateUI();
});
