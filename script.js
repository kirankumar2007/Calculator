document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    const history = document.getElementById('history');
    const memoryValue = document.getElementById('memory-value');
    const angleMode = document.getElementById('angle-mode');
    const notationMode = document.getElementById('notation-mode');
    const buttons = document.querySelectorAll('button');
    const themeToggle = document.getElementById('theme-toggle');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const unitFrom = document.getElementById('unit-from');
    const unitTo = document.getElementById('unit-to');
    const unitValue = document.getElementById('unit-value');
    const convertUnitBtn = document.getElementById('convert-unit');
    const conversionResult = document.getElementById('conversion-result');
    const constantSelect = document.getElementById('constant-select');
    const insertConstantBtn = document.getElementById('insert-constant');
    const equationInput = document.getElementById('equation-input');
    const solveEquationBtn = document.getElementById('solve-equation');
    const equationSolution = document.getElementById('equation-solution');

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
    clearHistoryBtn.addEventListener('click', clearHistory);
    convertUnitBtn.addEventListener('click', convertUnit);
    insertConstantBtn.addEventListener('click', insertConstant);
    solveEquationBtn.addEventListener('click', solveEquation);

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
            addToHistory(`${history.textContent}`);
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

    function addToHistory(calculation) {
        const li = document.createElement('li');
        li.textContent = calculation;
        historyList.appendChild(li);
    }

    function clearHistory() {
        historyList.innerHTML = '';
    }

    function convertUnit() {
        const value = parseFloat(unitValue.value);
        const from = unitFrom.value;
        const to = unitTo.value;
        let result;

        const conversionFactors = {
            m: 1,
            ft: 0.3048,
            km: 1000,
            mi: 1609.34
        };

        result = value * conversionFactors[from] / conversionFactors[to];
        conversionResult.textContent = `${value} ${from} = ${result.toFixed(4)} ${to}`;
    }

    function insertConstant() {
        const constants = {
            g: 9.81,
            c: 299792458,
            h: 6.62607015e-34,
            Na: 6.02214076e23
        };
        const selectedConstant = constantSelect.value;
        currentValue = constants[selectedConstant].toString();
        updateDisplay();
    }

    function solveEquation() {
        const equation = equationInput.value;
        let solution;

        try {
            // This is a very simple equation solver for linear equations
            // For more complex equations, you'd need a more sophisticated solver
            const parts = equation.split('=');
            if (parts.length !== 2) throw new Error('Invalid equation format');

            const left = parts[0].trim();
            const right = parts[1].trim();

            const x = left.indexOf('x');
            if (x === -1) throw new Error('No variable x found');

            const a = parseFloat(left.substring(0, x)) || 1;
            const b = parseFloat(right) || 0;

            solution = b / a;
            equationSolution.textContent = `x = ${solution}`;
        } catch (error) {
            equationSolution.textContent = 'Error: ' + error.message;
        }
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