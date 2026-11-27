const display = document.getElementById("display");
const buttons = document.querySelector(".buttons");

let firstNumber = null;
let operator = null;
let waitingForSecondNumber = false;
let justCalculated = false;

function formatNumber(number) {
    return String(Number(number.toPrecision(12)));
}

function updateDisplay(value) {
    display.value = String(value);
}

function calculate(first, second, selectedOperator) {
    if (selectedOperator === "add") return first + second;
    if (selectedOperator === "subtract") return first - second;
    if (selectedOperator === "multiply") return first * second;
    if (selectedOperator === "divide") {
        return second === 0 ? null : first / second;
    }
    return second;
}

function showError() {
    updateDisplay("Cannot divide by zero");
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;
    justCalculated = true;
}

function clearCalculator() {
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;
    justCalculated = false;
    updateDisplay("0");
}

function inputNumber(value) {
    if (justCalculated || waitingForSecondNumber) {
        updateDisplay(value === "." ? "0." : value);
        waitingForSecondNumber = false;
        justCalculated = false;
        return;
    }

    if (value === ".") {
        if (!display.value.includes(".")) {
            updateDisplay(display.value + ".");
        }
    } else if (display.value === "0") {
        updateDisplay(value);
    } else {
        updateDisplay(display.value + value);
    }
}

function selectOperator(nextOperator) {
    const inputValue = Number(display.value);

    if (justCalculated) {
        justCalculated = false;
        firstNumber = inputValue;
        operator = nextOperator;
        waitingForSecondNumber = true;
        return;
    }

    if (waitingForSecondNumber) {
        operator = nextOperator;
        return;
    }

    if (firstNumber === null) {
        firstNumber = inputValue;
    } else if (operator) {
        const result = calculate(firstNumber, inputValue, operator);

        if (result === null) {
            showError();
            return;
        }

        updateDisplay(formatNumber(result));
        firstNumber = result;
    }

    operator = nextOperator;
    waitingForSecondNumber = true;
}

function equals() {
    if (operator === null || firstNumber === null) return;

    const result = calculate(firstNumber, Number(display.value), operator);

    if (result === null) {
        showError();
        return;
    }

    updateDisplay(formatNumber(result));
    firstNumber = null;
    operator = null;
    waitingForSecondNumber = false;
    justCalculated = true;
}

buttons.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number) {
        inputNumber(button.dataset.number);
        return;
    }

    const action = button.dataset.action;

    if (action === "clear") {
        clearCalculator();
    } else if (action === "backspace") {
        if (justCalculated) {
            clearCalculator();
        } else {
            updateDisplay(display.value.length > 1 ? display.value.slice(0, -1) : "0");
        }
    } else if (action === "equals") {
        equals();
    } else if (action) {
        selectOperator(action);
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) inputNumber(event.key);
    if (event.key === ".") inputNumber(".");
    if (event.key === "+") selectOperator("add");
    if (event.key === "-") selectOperator("subtract");
    if (event.key === "*") selectOperator("multiply");
    if (event.key === "/") {
        event.preventDefault();
        selectOperator("divide");
    }
    if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        equals();
    }
    if (event.key === "Escape") clearCalculator();
    if (event.key === "Backspace") {
        event.preventDefault();
        if (justCalculated) {
            clearCalculator();
        } else {
            updateDisplay(display.value.length > 1 ? display.value.slice(0, -1) : "0");
        }
    }
});