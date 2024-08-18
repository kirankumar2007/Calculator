document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const buttons = document.querySelectorAll('button');
    let currentValue = '';
    let operator = '';
    let previousValue = '';
    let lastResult = '';

    const operations = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
        percentage: (a) => a / 100,
        'square-root': (a) => Math.sqrt(a),
        square: (a) => a * a,
        sin: (a) => Math.sin(a * Math.PI / 180),
        cos: (a) => Math.cos(a * Math.PI / 180),
        tan: (a) => Math.tan(a * Math.PI / 180),
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.dataset.action;
            const value = button.textContent;

            if (action === 'clear') {
                clearDisplay();
            } else if (action in operations) {
                handleOperator(action);
            } else if (action === 'calculate') {
                calculate();
            } else if (action === 'toggle-sign') {
                toggleSign();
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
        lastResult = '';
        history.textContent = '';
    }

    function handleOperator(op) {
        if (currentValue === '' && lastResult !== '') {
            currentValue = lastResult;
        }
        if (currentValue === '') return;
        if (previousValue !== '') {
            calculate();
        }
        operator = op;
        previousValue = currentValue;
        currentValue = '';
        history.textContent = `${previousValue} ${getOperatorSymbol(op)}`;
    }

    function calculate() {
        if (previousValue === '' || (currentValue === '' && !isUnaryOperator(operator))) return;
        let result;
        const prev = parseFloat(previousValue);
        const current = parseFloat(currentValue);
        
        if (isUnaryOperator(operator)) {
            result = operations[operator](prev);
            history.textContent += ` = ${result}`;
        } else {
            result = operations[operator](prev, current);
            history.textContent += ` ${currentValue} = ${result}`;
        }
        
        currentValue = result.toString();
        lastResult = currentValue;
        operator = '';
        previousValue = '';
    }

    function isUnaryOperator(op) {
        return ['percentage', 'square-root', 'square', 'sin', 'cos', 'tan'].includes(op);
    }

    function getOperatorSymbol(op) {
        const symbols = {
            add: '+',
            subtract: '-',
            multiply: '×',
            divide: '÷',
            percentage: '%',
            'square-root': '√',
            square: '²',
            sin: 'sin',
            cos: 'cos',
            tan: 'tan'
        };
        return symbols[op] || op;
    }

    function addDecimal() {
        if (!currentValue.includes('.')) {
            currentValue += '.';
        }
    }

    function appendNumber(number) {
        currentValue += number;
    }

    function toggleSign() {
        if (currentValue !== '') {
            currentValue = (parseFloat(currentValue) * -1).toString();
        }
    }

    function updateDisplay() {
        display.value = currentValue || '0';
    }

    // Keyboard support
    document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (/\d/.test(key)) {
            appendNumber(key);
        } else if (key === '.') {
            addDecimal();
        } else if (key === '+') {
            handleOperator('add');
        } else if (key === '-') {
            handleOperator('subtract');
        } else if (key === '*') {
            handleOperator('multiply');
        } else if (key === '/') {
            handleOperator('divide');
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Escape') {
            clearDisplay();
        }
        updateDisplay();
    });
});