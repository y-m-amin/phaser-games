let wordList = {};

// Load words.json
fetch('words.json')
  .then((response) => response.json())
  .then((data) => {
    wordList = data;
  });

document.addEventListener('DOMContentLoaded', () => {
  const submitBtn = document.querySelector('button');
  const inputFields = document.querySelectorAll(
    '#game-container .inputs-row input'
  );
  const container = document.getElementById('game-container');

  submitBtn.addEventListener('click', () => {
    const values = Array.from(inputFields).map((input) =>
      input.value.trim().toLowerCase()
    );
    const fields = ['name', 'country', 'fruit', 'flower'];

    // Create new row for result
    const resultRow = document.createElement('div');
    resultRow.classList.add('inputs-row');

    values.forEach((val, i) => {
      const box = document.createElement('div');
      box.classList.add('input');
      const resultInput = document.createElement('input');
      resultInput.type = 'text';
      resultInput.value = val;
      resultInput.disabled = true;

      // Color based on correctness
      if (wordList[fields[i]].includes(val)) {
        resultInput.style.backgroundColor = '#c8f7c5'; // green
      } else {
        resultInput.style.backgroundColor = '#f7c5c5'; // red
      }

      box.appendChild(resultInput);
      resultRow.appendChild(box);
    });

    // Insert result above submit button
    container.insertBefore(resultRow, container.querySelector('.submit'));

    // Clear inputs
    inputFields.forEach((input) => (input.value = ''));
  });
});
