document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('button');
    let currentValue = '';
    let operator = '';
    let previousValue = '';

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.textContent;

            if (value === 'C') {
                clearDisplay();
            } else if (['+', '-', '*', '/'].includes(value)) {
                handleOperator(value);
            } else if (value === '=') {
                calculate();
            } else if (value === '.') {
                addDecimal();
            } else {
                appendNumber(value);
            }

            updateDisplay();
        });
    });

    function clearDisplay() {
        currentValue = '';
        operator = '';
        previousValue = '';
    }

    function handleOperator(op) {
        if (currentValue === '') return;
        if (previousValue !== '') {
            calculate();
        }
        operator = op;
        previousValue = currentValue;
        currentValue = '';
    }

    function calculate() {
        if (previousValue === '' || currentValue === '') return;
        let result;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                result = prev / current;
                break;
            default:
                return;
        }
        currentValue = result.toString();
        operator = '';
        previousValue = '';
    }

    function addDecimal() {
        if (!currentValue.includes('.')) {
            currentValue += '.';
        }
    }

    function appendNumber(number) {
        currentValue += number;
    }

    function updateDisplay() {
        display.value = currentValue;
    }
});