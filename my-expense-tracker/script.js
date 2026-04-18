const STORAGE_KEY = "daily-expenses";

const expenseForm = document.getElementById("expense-form");
const dateInput = document.getElementById("date");
const descriptionInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const filterDateInput = document.getElementById("filter-date");
const expenseList = document.getElementById("expense-list");
const dailyTotal = document.getElementById("daily-total");

const today = new Date().toISOString().split("T")[0];
dateInput.value = today;
filterDateInput.value = today;

function readExpenses() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }
  return JSON.parse(raw);
}

function saveExpenses(expenses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function getFilteredExpenses() {
  const selectedDate = filterDateInput.value;
  const expenses = readExpenses();
  return expenses.filter((expense) => expense.date === selectedDate);
}

function renderExpenses() {
  const filtered = getFilteredExpenses();

  expenseList.innerHTML = "";

  if (filtered.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty";
    emptyState.textContent = "No expenses for this date.";
    expenseList.appendChild(emptyState);
    dailyTotal.textContent = formatCurrency(0);
    return;
  }

  let total = 0;

  filtered.forEach((expense) => {
    total += expense.amount;

    const item = document.createElement("li");
    item.className = "expense-item";

    const details = document.createElement("div");
    details.className = "expense-details";

    const description = document.createElement("span");
    description.textContent = expense.description;

    const amount = document.createElement("span");
    amount.className = "expense-amount";
    amount.textContent = formatCurrency(expense.amount);

    details.appendChild(description);
    details.appendChild(amount);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
      const allExpenses = readExpenses();
      const updated = allExpenses.filter((item) => item.id !== expense.id);
      saveExpenses(updated);
      renderExpenses();
    });

    item.appendChild(details);
    item.appendChild(deleteButton);
    expenseList.appendChild(item);
  });

  dailyTotal.textContent = formatCurrency(total);
}

expenseForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const date = dateInput.value;

  if (!description || Number.isNaN(amount) || amount <= 0 || !date) {
    return;
  }

  const expenses = readExpenses();
  expenses.push({
    id: crypto.randomUUID(),
    description,
    amount,
    date,
  });

  saveExpenses(expenses);
  expenseForm.reset();
  dateInput.value = today;
  renderExpenses();
});

filterDateInput.addEventListener("change", renderExpenses);

renderExpenses();
