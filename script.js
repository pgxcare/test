const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');
const buttons = document.querySelectorAll('button');

let expression = '';

const appendValue = (value) => {
  if (resultEl.textContent === 'Error') {
    clearAll();
  }
  expression += value;
  updateDisplay();
};

const clearAll = () => {
  expression = '';
  expressionEl.textContent = '';
  resultEl.textContent = '0';
};

const backspace = () => {
  expression = expression.slice(0, -1);
  updateDisplay();
};

const applyPercent = () => {
  if (!expression) return;
  const match = expression.match(/(.*?)([0-9]*\.?[0-9]+)$/);
  if (!match) return;
  const [, prefix, number] = match;
  const percentValue = parseFloat(number) / 100;
  expression = `${prefix}${percentValue}`;
  updateDisplay();
};

const safeEvaluate = () => {
  if (!expression) return '0';
  try {
    const sanitized = expression.replace(/[^0-9+\-*/%.]/g, '');
    const value = Function(`"use strict"; return (${sanitized});`)();
    if (!isFinite(value)) {
      throw new Error('Invalid math');
    }
    return value.toString();
  } catch (err) {
    return 'Error';
  }
};

const updateDisplay = () => {
  expressionEl.textContent = expression;
  const evaluated = safeEvaluate();
  resultEl.textContent = evaluated;
};

const handleEquals = () => {
  const evaluated = safeEvaluate();
  expression = evaluated === 'Error' ? '' : evaluated;
  resultEl.textContent = evaluated;
  expressionEl.textContent = expression;
};

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value) {
      appendValue(value);
      return;
    }

    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'backspace':
        backspace();
        break;
      case 'percent':
        applyPercent();
        break;
      case 'equals':
        handleEquals();
        break;
      default:
        break;
    }
  });
});

const handleKeyboard = (event) => {
  const { key } = event;
  if (/^[0-9]$/.test(key)) {
    appendValue(key);
  } else if (['+', '-', '*', '/', '.'].includes(key)) {
    appendValue(key);
  } else if (key === 'Enter') {
    event.preventDefault();
    handleEquals();
  } else if (key === 'Backspace') {
    backspace();
  } else if (key.toLowerCase() === 'c') {
    clearAll();
  } else if (key === '%') {
    applyPercent();
  }
};

document.addEventListener('keydown', handleKeyboard);

clearAll();
