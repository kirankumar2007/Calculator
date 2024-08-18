document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const memoryValue = document.getElementById('memory-value');
    const angleMode = document.getElementById('angle-mode');
    const notationMode = document.getElementById('notation-mode');
    const buttons = document.querySelectorAll('button');
    const themeToggle = document.getElementById('theme-toggle');

    let currentValue = '';
    let operator = '';
    let previousValue = '';
    let lastResult = '';
    let memory = 0;
    let isInRadianMode = true;
    let isInScientificNotation = false;
    let isInSecondMode = false;

    const operations = {
        add: (a, b) => a + b,
        subtract: (a, b) => a - b,
        multiply: (a, b) => a * b,
        divide: (a, b) => a / b,
        modulo: (a, b) => a % b,
        percentage: (a) => a / 100,
        'square-root': (a) => Math.sqrt(a),
        'cube-root': (a) => Math.cbrt(a),
        'nth-root': (a, b) => Math.pow(a, 1/b),
        square: (a) => a * a,
        cube: (a) => a * a * a,
        power: (a, b) => Math.pow(a, b),
        sin: (a) => isInRadianMode ? Math.sin(a) : Math.sin(a * Math.PI / 180),
        cos: (a) => isInRadianMode ? Math.cos(a) : Math.cos(a * Math.PI / 180),
        tan: (a) => isInRadianMode ? Math.tan(a) : Math.tan(a * Math.PI / 180),
        asin: (a) => isInRadianMode ? Math.asin(a) : Math.asin(a) * 180 / Math.PI,
        acos: (a) => isInRadianMode ? Math.acos(a) : Math.acos(a) * 180 / Math.PI,
        atan: (a) => isInRadianMode ? Math.atan(a) : Math.atan(a) * 180 / Math.PI,
        log: (a) => Math.log10(a),
        ln: (a) => Math.log(a),
        exp: (a) => Math.exp(a),
        factorial: (a) => {
            if (a < 0 || !Number.isInteger(a)) return NaN;
            if (a === 0) return 1;
            let result = 1;
            for (let i = 2; i <= a; i++) result *= i;
            return result;
        },
        pi: () => Math.PI,
        e: () => Math.E
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => handleButtonClick(button));
    });

    themeToggle.addEventListener('click', toggleTheme);

    function handleButtonClick(button) {
        const action = button.dataset.action;
        const value = button.textContent;

        switch(action) {
            case 'clear':
                clearDisplay();
                break;
            case 'backspace':
                backspace();
                break;
            case 'calculate':
                calculate();
                break;
            case 'toggle-sign':
                toggleSign();
                break;
            case 'toggle-rad-deg':
                toggleRadDeg();
                break;
            case 'toggle-notation':
                toggleNotation();
                break;
            case 'second':
                toggleSecondMode();
                break;
            case 'pi':
            case 'e':
                appendConstant(action);
                break;
            default:
                if (action in operations) {
                    handleOperator(action);
                } else if (action && action.startsWith('memory')) {
                    handleMemoryOperation(action);
                } else if (value === '.') {
                    addDecimal();
                } else {
                    appendNumber(value);
                }
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

    function backspace() {
        currentValue = currentValue.slice(0, -1);
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
        return ['percentage', 'square-root', 'cube-root', 'square', 'cube', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'factorial', 'pi', 'e'].includes(op);
    }

    function getOperatorSymbol(op) {
        const symbols = {
            add: '+', subtract: '-', multiply: '×', divide: '÷', modulo: '%',
            percentage: '%', 'square-root': '√', 'cube-root': '∛', 'nth-root': 'ⁿ√',
            square: '²', cube: '³', power: '^',
            sin: 'sin', cos: 'cos', tan: 'tan',
            asin: 'arcsin', acos: 'arccos', atan: 'arctan',
            log: 'log', ln: 'ln', exp: 'exp', factorial: '!'
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

    function appendConstant(constant) {
        currentValue = operations[constant]().toString();
    }

    function toggleSign() {
        if (currentValue !== '') {
            currentValue = (parseFloat(currentValue) * -1).toString();
        }
    }

    function toggleRadDeg() {
        isInRadianMode = !isInRadianMode;
        angleMode.textContent = isInRadianMode ? 'RAD' : 'DEG';
    }

    function toggleNotation() {
        isInScientificNotation = !isInScientificNotation;
        notationMode.textContent = isInScientificNotation ? 'SCI' : 'NORM';
        updateDisplay();
    }

    function toggleSecondMode() {
        isInSecondMode = !isInSecondMode;
        buttons.forEach(button => {
            if (button.classList.contains('trig')) {
                const action = button.dataset.action;
                if (isInSecondMode) {
                    button.textContent = `arc${action}`;
                    button.dataset.action = `a${action}`;
                } else {
                    button.textContent = action;
                    button.dataset.action = action;
                }
            }
        });
    }

    function handleMemoryOperation(action) {
        const value = parseFloat(currentValue) || 0;
        switch (action) {
            case 'memory-clear':
                memory = 0;
                break;
            case 'memory-recall':
                currentValue = memory.toString();
                break;
            case 'memory-add':
                memory += value;
                break;
            case 'memory-subtract':
                memory -= value;
                break;
            case 'memory-store':
                memory = value;
                break;
        }
        memoryValue.textContent = memory;
    }

    function updateDisplay() {
        let displayValue = currentValue || '0';
        if (isInScientificNotation && displayValue !== '0' && displayValue !== 'Error') {
            const num = parseFloat(displayValue);
            displayValue = num.toExponential(4);
        }
        display.value = displayValue;
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
            backspace();
        }
        updateDisplay();
    });
});