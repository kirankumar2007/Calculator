document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const memoryValue = document.getElementById('memory-value');
    const buttons = document.querySelectorAll('button');
    const themeToggle = document.getElementById('theme-toggle');

    let currentValue = '';
    let operator = '';
    let previousValue = '';
    let lastResult = '';
    let memory = 0;
    let isInRadianMode = true;

    const operations = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
        percentage: (a) => a / 100,
        'square-root': (a) => Math.sqrt(a),
        square: (a) => a * a,
        cube: (a) => a * a * a,
        sin: (a) => isInRadianMode ? Math.sin(a) : Math.sin(a * Math.PI / 180),
        cos: (a) => isInRadianMode ? Math.cos(a) : Math.cos(a * Math.PI / 180),
        tan: (a) => isInRadianMode ? Math.tan(a) : Math.tan(a * Math.PI / 180),
        log: (a) => Math.log10(a),
        ln: (a) => Math.log(a),
        power: (a, b) => Math.pow(a, b),
        factorial: (a) => {
            if (a < 0) return NaN;
            if (a === 0) return 1;
            let result = 1;
            for (let i = 2; i <= a; i++) result *= i;
            return result;
        }
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button));
    });

    themeToggle.addEventListener('click', toggleTheme);

    function handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.textContent;

        if (action === 'clear') {
            clearDisplay();
        } else if (action === 'clear-entry') {
            clearEntry();
        } else if (action in operations) {
            handleOperator(action);
        } else if (action === 'calculate') {
            calculate();
        } else if (action === 'toggle-sign') {
            toggleSign();
        } else if (action === 'toggle-rad-deg') {
            toggleRadDeg();
        } else if (action.startsWith('memory')) {
            handleMemoryOperation(action);
        } else if (value === '.') {
            addDecimal();
        } else {
            appendNumber(value);
        }

        updateDisplay();
    }

    function clearDisplay() {
        currentValue = '';
        operator = '';
        previousValue = '';
        lastResult = '';
        history.textContent = '';
    }

    function clearEntry() {
        currentValue = '';
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
        
        try {
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
        } catch (error) {
            currentValue = 'Error';
        }
    }

    function isUnaryOperator(op) {
        return ['percentage', 'square-root', 'square', 'cube', 'sin', 'cos', 'tan', 'log', 'ln', 'factorial'].includes(op);
    }

    function getOperatorSymbol(op) {
        const symbols = {
            add: '+', subtract: '-', multiply: '×', divide: '÷', percentage: '%',
            'square-root': '√', square: '²', cube: '³', power: '^',
            sin: 'sin', cos: 'cos', tan: 'tan', log: 'log', ln: 'ln', factorial: '!'
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

    function toggleRadDeg() {
        isInRadianMode = !isInRadianMode;
        const modeButton = document.querySelector('[data-action="toggle-rad-deg"]');
        modeButton.textContent = isInRadianMode ? 'Rad' : 'Deg';
    }

    function handleMemoryOperation(action) {
        switch (action) {
            case 'memory-clear':
                memory = 0;
                break;
            case 'memory-recall':
                currentValue = memory.toString();
                break;
            case 'memory-add':
                memory += parseFloat(currentValue) || 0;
                break;
            case 'memory-subtract':
                memory -= parseFloat(currentValue) || 0;
                break;
        }
        memoryValue.textContent = memory;
    }

    function updateDisplay() {
        display.value = currentValue || '0';
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
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
        } else if (key === 'Backspace') {
            currentValue = currentValue.slice(0, -1);
        }
        updateDisplay();
    });
});