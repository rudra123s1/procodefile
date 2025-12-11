/* =========================================
   1. DOM Elements Selection
   ========================================= */
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const closePopupBtn = document.getElementById('close-popup');
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const historyToggleBtn = document.getElementById('history-toggle');
const historyPanel = document.getElementById('history');

// State variables
let isResultDisplayed = false; // To clear display on new input after a calculation

/* =========================================
   2. Core Calculator Logic
   ========================================= */

// Append numbers or operators to the display
function appendValue(value) {
    // If a result is currently displayed and the user types a number, start fresh
    if (isResultDisplayed && !isOperator(value)) {
        display.innerText = '';
        isResultDisplayed = false;
    }
    // If the user types an operator after a result, continue using that result
    else if (isResultDisplayed && isOperator(value)) {
        isResultDisplayed = false;
    }

    display.innerText += value;
    scrollToEnd();
}

// Check if value is a math operator
function isOperator(char) {
    return ['+', '-', '*', '/', '%'].includes(char);
}

// Clear the entire display (AC)
function clearInput() {
    display.innerText = '';
}

// Backspace (Delete last character)
function backspace() {
    if (display.innerText === 'Error') {
        clearInput();
    } else {
        display.innerText = display.innerText.slice(0, -1);
    }
}

// Calculate the Result (=)
function calculate() {
    try {
        let expression = display.innerText;

        // Validation: Prevent empty calculation
        if (expression.trim() === '') return;

        // Security: Ensure only valid characters are evaluated
        // Allows numbers, operators, dots, and parenthesis
        if (/[^0-9+\-*/().%]/.test(expression)) {
            throw new Error("Invalid Input");
        }

        // Evaluate the expression safely
        // Note: Using Function constructor is slightly safer than eval(), 
        // though for a simple calculator eval is often acceptable.
        // We replace 'x' visual with '*' for math if user pasted it, 
        // but our buttons send '*'.
        const safeExpression = expression.replace(/x/g, '*');

        const result = new Function('return ' + safeExpression)();

        // Check for Infinity (Division by zero) or NaN
        if (!isFinite(result) || isNaN(result)) {
            throw new Error("Math Error");
        }

        // Round long decimals to 8 places to fit screen
        const formattedResult = parseFloat(result.toFixed(8));

        // Add to History before updating display
        addToHistory(expression, formattedResult);

        // Update Display
        display.innerText = formattedResult;
        isResultDisplayed = true;

    } catch (error) {
        showPopup(error.message || "Invalid Syntax");
    }
}

// Auto-scroll display to the right when typing long numbers
function scrollToEnd() {
    display.scrollLeft = display.scrollWidth;
}

/* =========================================
   3. History Management
   ========================================= */

function addToHistory(expression, result) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');
    historyItem.style.marginBottom = '10px';
    historyItem.style.borderBottom = '1px solid rgba(0,0,0,0.1)';
    historyItem.style.paddingBottom = '5px';

    historyItem.innerHTML = `
        <div style="font-size: 0.85rem; opacity: 0.7;">${expression}</div>
        <div style="font-size: 1.1rem; font-weight: bold;">= ${result}</div>
    `;

    // Add to top of list
    historyList.prepend(historyItem);
}

function clearHistory() {
    historyList.innerHTML = '';
}

// Toggle History Panel (Slide in/out)
historyToggleBtn.addEventListener('click', () => {
    // The CSS uses .show to bring the panel in
    historyPanel.classList.toggle('show');

    // Accessibility: remove 'hide' class if present in HTML
    historyPanel.classList.remove('hide');
});

/* =========================================
   4. Theme Management (Dark/Light)
   ========================================= */

// Check local storage for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.innerText = '☀️';
}

themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        themeIcon.innerText = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.innerText = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

/* =========================================
   5. Popup (Error Handling) Logic
   ========================================= */

function showPopup(message) {
    popupMessage.innerText = message;
    popup.classList.add('active'); // CSS class to show flex
}

// Close popup on button click
closePopupBtn.addEventListener('click', () => {
    popup.classList.remove('active');
});

// Close popup if clicking outside the content box
popup.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.classList.remove('active');
    }
});

/* =========================================
   6. Keyboard Support (Professional Touch)
   ========================================= */

document.addEventListener('keydown', (event) => {
    const key = event.key;

    // Numbers 0-9
    if (!isNaN(key)) {
        appendValue(key);
    }
    // Operators
    else if (['+', '-', '*', '/', '%'].includes(key)) {
        appendValue(key);
    }
    // Enter key for Equals
    else if (key === 'Enter') {
        event.preventDefault(); // Prevent default form submission if any
        calculate();
    }
    // Backspace
    else if (key === 'Backspace') {
        backspace();
    }
    // Escape key for Clear
    else if (key === 'Escape') {
        clearInput();
    }
    // Period / Decimal
    else if (key === '.') {
        appendValue('.');
    }
});
/* =========================================
   Add this to the bottom of javascript.js
   ========================================= */

const closeHistoryBtn = document.getElementById('close-history-btn');

// Function to close the history panel
function closeHistory() {
    const historyPanel = document.getElementById('history');
    historyPanel.classList.remove('show');
}

// Event Listener for the Back Button
closeHistoryBtn.addEventListener('click', closeHistory);

// OPTIONAL: If you want 'Clear History' to ALSO auto-close the panel:
/* Find your existing clearHistory() function and update it like this:
   
   function clearHistory() {
       historyList.innerHTML = '';
       closeHistory(); // <--- Add this line to auto-close
   }
*/