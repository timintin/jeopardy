let categories = [];

async function getCategoryIds() {
  const response = await axios.get('categories.json');
  const allCategories = response.data;
  const randomCategories = _.sampleSize(allCategories, 6);
  return randomCategories.map(cat => cat.id);
}

async function getCategory(catId) {
  const response = await axios.get('categories.json');
  const allCategories = response.data;
  const category = allCategories.find(cat => cat.id === catId);
  const clues = category.clues.map(clue => ({
    question: clue.question,
    answer: clue.answer,
    showing: null
  }));
  return { title: category.title, clues: clues };
}

async function fillTable() {
  const tableHead = document.querySelector('#jeopardy thead');
  const tableBody = document.querySelector('#jeopardy tbody');
  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  const headerRow = document.createElement('tr');
  for (let category of categories) {
    const th = document.createElement('th');
    th.innerText = category.title;
    headerRow.appendChild(th);
  }
  tableHead.appendChild(headerRow);

  for (let i = 0; i < 5; i++) { // Assuming 5 clues per category
    const row = document.createElement('tr');
    for (let category of categories) {
      const td = document.createElement('td');
      td.innerText = '?';
      td.dataset.categoryIndex = categories.indexOf(category);
      td.dataset.clueIndex = i;
      td.addEventListener('click', handleClick);
      row.appendChild(td);
    }
    tableBody.appendChild(row);
  }
}

function handleClick(evt) {
  const categoryIndex = evt.target.dataset.categoryIndex;
  const clueIndex = evt.target.dataset.clueIndex;
  const clue = categories[categoryIndex].clues[clueIndex];

  if (!clue.showing) {
    evt.target.innerText = clue.question;
    clue.showing = 'question';
  } else if (clue.showing === 'question') {
    evt.target.innerText = clue.answer;
    clue.showing = 'answer';
  }
}

function showLoadingView() {
  const startButton = document.getElementById('start');
  startButton.innerText = 'Loading...';
  startButton.disabled = true;
}

function hideLoadingView() {
  const startButton = document.getElementById('start');
  startButton.style.display = 'none';
}

async function setupAndStart() {
  showLoadingView();
  const categoryIds = await getCategoryIds();
  const categoriesData = await Promise.all(categoryIds.map(id => getCategory(id)));
  categories = categoriesData;
  fillTable();
  hideLoadingView();
}

document.getElementById('start').addEventListener('click', setupAndStart);
