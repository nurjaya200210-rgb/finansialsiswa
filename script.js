

/* 1. AMBIL DATA TRANSAKSI */


const defaultTransactions = [];


function loadTransactions() {
  try {
    const saved = localStorage.getItem("finsiswa_transactions");

    if (saved === null) {
      return [...defaultTransactions];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Format transaksi tidak valid.");
    }

    const validTransactions = parsed.filter(isValidTransaction);

    if (validTransactions.length !== parsed.length) {
      console.warn("Sebagian transaksi tidak valid dan tidak dimuat.");
    }

    return validTransactions;
  } catch (error) {
    console.error("Gagal memuat transaksi:", error);
    alert("Data transaksi tidak dapat dibaca. Data contoh akan digunakan.");

    return [...defaultTransactions];
  }
}

function isValidDateString(dateString) {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    return false;
  }

  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTransaction(transaction) {
  return (
    transaction !== null &&
    typeof transaction === "object" &&
    !Array.isArray(transaction) &&
    (transaction.type === "income" ||
      transaction.type === "expense") &&
    Number.isSafeInteger(transaction.amount) &&
    transaction.amount > 0 &&
    typeof transaction.note === "string" &&
    transaction.note.trim() !== "" &&
    (
      transaction.category === undefined ||
      typeof transaction.category === "string"
    ) &&
    (
  transaction.date === undefined ||
  isValidDateString(transaction.date)
)
  );
}


const transactions = loadTransactions();

/* 2. FUNGSI MENYIMPAN DATA */

function saveTransactions() {
  try {
    localStorage.setItem(
      "finsiswa_transactions",
      JSON.stringify(transactions)
    );

    return true;
  } catch (error) {
    console.error("Gagal menyimpan transaksi:", error);
    alert(
      "Transaksi gagal disimpan. Penyimpanan browser mungkin tidak tersedia atau penuh."
    );

    return false;
  }
}


/* PENYIMPANAN ANGGARAN */

function loadBudgets() {
  try {
    const saved = localStorage.getItem("finsiswa_budgets");

    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Format data anggaran tidak valid.");
    }

    const validBudgets = parsed.filter(function (budget) {
      return (
        budget !== null &&
        typeof budget === "object" &&
        !Array.isArray(budget) &&
        typeof budget.category === "string" &&
        budget.category.trim() !== "" &&
        Number.isSafeInteger(budget.amount) &&
        budget.amount > 0
      );
    });

    if (validBudgets.length !== parsed.length) {
      console.warn("Sebagian data anggaran tidak valid dan tidak dimuat.");
    }

    return validBudgets;
  } catch (error) {
    console.error("Gagal memuat anggaran:", error);
    alert("Data anggaran tidak dapat dibaca. Silakan buat ulang anggaran.");

    return [];
  }
}

const budgets = loadBudgets();


function saveBudgets() {
  try {
    localStorage.setItem(
      "finsiswa_budgets",
      JSON.stringify(budgets)
    );

    return true;
  } catch (error) {
    console.error("Gagal menyimpan anggaran:", error);
    alert(
      "Anggaran gagal disimpan. Penyimpanan browser mungkin tidak tersedia atau penuh."
    );

    return false;
  }
}

/* PENYIMPANAN TABUNGAN */



function loadSavings() {
  try {
    const saved = localStorage.getItem("finsiswa_savings");

    if (saved === null) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Format data tabungan tidak valid.");
    }

    const validSavings = parsed.filter(function (item) {
      return (
        item !== null &&
        typeof item === "object" &&
        !Array.isArray(item) &&
        typeof item.name === "string" &&
        item.name.trim() !== "" &&
        Number.isSafeInteger(item.target) &&
        item.target > 0 &&
        Number.isSafeInteger(item.current) &&
item.current >= 0
      );
    });

    if (validSavings.length !== parsed.length) {
      console.warn("Sebagian data tabungan tidak valid dan tidak dimuat.");
    }

    return validSavings;
  } catch (error) {
    console.error("Gagal memuat tabungan:", error);
    alert("Data tabungan tidak dapat dibaca. Silakan periksa data tersimpan.");

    return [];
  }
}

const savings = loadSavings();


// Memberikan ID pada target lama yang belum memilikinya


const usedSavingsIds = new Set();
let savingsIdsChanged = false;

savings.forEach(function (item) {
  let id = String(item.id || "");

  if (!id || usedSavingsIds.has(id)) {
    do {
      id =
        Date.now().toString() +
        Math.random().toString(36).slice(2);
    } while (usedSavingsIds.has(id));

    item.id = id;
    savingsIdsChanged = true;
  }

  usedSavingsIds.add(id);
});

if (savingsIdsChanged) {
  saveSavings();
}

function saveSavings() {
  try {
    localStorage.setItem(
      "finsiswa_savings",
      JSON.stringify(savings)
    );

    return true;
  } catch (error) {
    console.error("Gagal menyimpan tabungan:", error);
    alert(
      "Tabungan gagal disimpan. Penyimpanan browser mungkin tidak tersedia atau penuh."
    );

    return false;
  }
}

function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

function formatTanggal(dateString) {
  if (!dateString) {
    return "Tanggal tidak tersedia";
  }

  const [year, month, day] = dateString.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}


/* PENGAMAN TEKS INPUT */

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}


/* 3. HITUNG DAN TAMPILKAN RINGKASAN */

function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const transaction of transactions) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    } else if (transaction.type === "expense") {
      totalExpense += transaction.amount;
    }
  }

  
  if (
    !Number.isSafeInteger(totalIncome) ||
    !Number.isSafeInteger(totalExpense)
  ) {
    console.error("Total transaksi melebihi batas angka aman.");
    alert(
      "Total transaksi terlalu besar untuk dihitung dengan aman."
    );
    return;
  }

  const balance = totalIncome - totalExpense;

  document.getElementById("balance-amount").textContent =
    formatRupiah(balance);

  document.getElementById("income-amount").textContent =
    formatRupiah(totalIncome);

  document.getElementById("expense-amount").textContent =
    formatRupiah(totalExpense);
    updateReport();
}


/* LAPORAN KEUANGAN */

function updateReport() {
  let totalIncome = 0;
  let totalExpense = 0;
  const expensesByCategory = {};

  const categoryLabels = {
    makanan: "Makanan",
    pendidikan: "Pendidikan",
    transportasi: "Transportasi",
    hiburan: "Hiburan",
    lainnya: "Lainnya",
    "uang-saku": "Uang saku",
    "penjualan-usaha": "Penjualan / usaha",
    hadiah: "Hadiah"
  };

  transactions.forEach(function (transaction) {
    if (transaction.type === "income") {
      totalIncome += transaction.amount;
    }

    if (transaction.type === "expense") {
      totalExpense += transaction.amount;

      const category = transaction.category || "lainnya";

      
if (!expensesByCategory[category]) {
  expensesByCategory[category] = 0;
}

const categoryTotal =
  expensesByCategory[category] + transaction.amount;

if (!Number.isSafeInteger(categoryTotal)) {
  console.error(
    "Total pengeluaran kategori melebihi batas angka aman:",
    category
  );
  return;
}

expensesByCategory[category] = categoryTotal;

    }
  });

  if (
    !Number.isSafeInteger(totalIncome) ||
    !Number.isSafeInteger(totalExpense)
  ) {
    console.error("Total laporan melebihi batas angka aman.");
    return;
  }
const hasUnsafeCategoryTotal = Object.values(
  expensesByCategory
).some(function (amount) {
  return !Number.isSafeInteger(amount);
});

if (hasUnsafeCategoryTotal) {
  console.error(
    "Total pengeluaran pada salah satu kategori melebihi batas angka aman."
  );
  return;
}
  const balance = totalIncome - totalExpense;

  document.getElementById("report-income").textContent =
    formatRupiah(totalIncome);

  document.getElementById("report-expense").textContent =
    formatRupiah(totalExpense);

  document.getElementById("report-balance").textContent =
    formatRupiah(balance);

  const categoryList =
    document.getElementById("report-category-list");

  const categories = Object.keys(expensesByCategory);

  if (categories.length === 0) {
    categoryList.innerHTML =
      "<p>Belum ada data pengeluaran.</p>";
    return;
  }

  categoryList.innerHTML = categories.map(function (category) {
    const label = escapeHTML(
  categoryLabels[category] || category
);

    return `
      <div class="transaction-item">
        <strong>${label}</strong>
        <strong>${formatRupiah(expensesByCategory[category])}</strong>
      </div>
    `;
  }).join("");
}

/* 4. JALANKAN PERHITUNGAN */

const transactionForm = document.getElementById("transaction-form");

const typeSelect = document.getElementById("transaction-type");
const categorySelect = document.getElementById("transaction-category");

const incomeCategories = [
  { value: "uang-saku", label: "Uang saku" },
  { value: "penjualan-usaha", label: "Penjualan / usaha" },
  { value: "hadiah", label: "Hadiah" },
  { value: "lainnya", label: "Lainnya" }
];

const expenseCategories = [
  { value: "makanan", label: "Makanan" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "transportasi", label: "Transportasi" },
  { value: "hiburan", label: "Hiburan" },
  { value: "lainnya", label: "Lainnya" }
];

function updateCategoryOptions() {
  const categories =
    typeSelect.value === "income"
      ? incomeCategories
      : expenseCategories;

  categorySelect.innerHTML = "";

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category.value;
    option.textContent = category.label;

    categorySelect.appendChild(option);
  }
}

typeSelect.addEventListener("change", updateCategoryOptions);
updateCategoryOptions();

const typeFilter = document.getElementById("transaction-filter-type");
const dateFilter = document.getElementById("transaction-filter-date");

/* DROPDOWN KUSTOM TRANSAKSI DAN FILTER */

function createCustomDropdown(select) {
  // Hindari membuat dropdown dua kali
  if (select.dataset.customized === "true") return;

  select.dataset.customized = "true";

  const wrapper = document.createElement("div");
  wrapper.className = "custom-dropdown";
  wrapper.id = select.id + "-dropdown";

  select.parentNode.insertBefore(wrapper, select);
  wrapper.appendChild(select);

  select.classList.add("custom-select-source");

  const label = document.querySelector(
    `label[for="${select.id}"]`
  );

  const labelId = label
    ? label.id || (label.id = select.id + "-label")
    : null;

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "custom-dropdown-trigger";
  trigger.setAttribute("aria-haspopup", "listbox");
  trigger.setAttribute("aria-expanded", "false");

  const valueText = document.createElement("span");
  valueText.id = select.id + "-value";

  const arrow = document.createElement("span");
  arrow.className = "dropdown-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "⌄";

  trigger.append(valueText, arrow);

  if (labelId) {
    trigger.setAttribute("aria-labelledby", labelId + " " + valueText.id);
  } else {
    trigger.setAttribute("aria-label", select.id);
  }

  const menu = document.createElement("div");
  menu.className = "custom-dropdown-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;

  if (labelId) {
    menu.setAttribute("aria-labelledby", labelId);
  }

  wrapper.append(trigger, menu);

  function syncOptions() {
    const previousValue = select.value;

    menu.replaceChildren();

    Array.from(select.options).forEach(function (option, index) {
      const item = document.createElement("button");
      item.type = "button";
      item.setAttribute("role", "option");
      item.dataset.value = option.value;
      item.textContent = option.textContent;

      const selected = option.value === select.value;
      item.setAttribute("aria-selected", String(selected));

      item.addEventListener("click", function () {
        select.value = option.value;
        select.dispatchEvent(
          new Event("change", { bubbles: true })
        );

        syncOptions();
        closeMenu();
        trigger.focus();
      });

      item.addEventListener("keydown", function (event) {
        const items = Array.from(
          menu.querySelectorAll('[role="option"]')
        );

        const currentIndex = items.indexOf(item);
        let nextIndex = currentIndex;

        if (event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % items.length;
        } else if (event.key === "ArrowUp") {
          nextIndex =
            (currentIndex - 1 + items.length) % items.length;
        } else {
          return;
        }

        event.preventDefault();
        items[nextIndex].focus();
      });

      menu.appendChild(item);
    });

    const selectedOption =
      select.options[select.selectedIndex];

    valueText.textContent = selectedOption
      ? selectedOption.textContent
      : "Pilih opsi";

    menu.querySelectorAll('[role="option"]').forEach(function (item) {
      item.setAttribute(
        "aria-selected",
        String(item.dataset.value === select.value)
      );
    });
  }

  function closeMenu() {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    syncOptions();
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  trigger.addEventListener("click", function () {
    const isOpen =
      trigger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  trigger.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown" || event.key === "Enter" ||
        event.key === " ") {
      event.preventDefault();
      openMenu();

      const items = menu.querySelectorAll('[role="option"]');
      const selectedIndex = Array.from(select.options).findIndex(
        option => option.value === select.value
      );

      if (items.length) {
        items[Math.max(0, selectedIndex)].focus();
      }
    } else if (event.key === "Escape") {
      closeMenu();
    }
  });

  menu.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
      trigger.focus();
    }
  });

  select.addEventListener("change", syncOptions);

  document.addEventListener("click", function (event) {
    if (!wrapper.contains(event.target)) {
      closeMenu();
    }
  });

  // Sinkronkan saat pilihan berubah secara dinamis
  const observer = new MutationObserver(syncOptions);
  observer.observe(select, {
    childList: true,
    subtree: true
  });

  syncOptions();
}

// Terapkan pada tiga dropdown transaksi
createCustomDropdown(
  document.getElementById("transaction-type")
);

createCustomDropdown(
  document.getElementById("transaction-category")
);

createCustomDropdown(
  document.getElementById("transaction-filter-type")
);


const addButton = document.querySelector(".page-header .add-button");
const formPanel = document.getElementById("transaction-form-panel");

addButton.addEventListener("click", function () {
  const isFormVisible =
    !formPanel.classList.contains("hidden-form");

  showPage("transaction-section");

  formPanel.hidden = false;

  if (isFormVisible) {
    formPanel.classList.add("hidden-form");
  } else {
    formPanel.classList.remove("hidden-form");
  }
});


transactionForm.addEventListener("submit", function (event) {
  event.preventDefault();

  
const type = document.getElementById("transaction-type").value;
const amountInput = document.getElementById("transaction-amount");
const amount = Number(amountInput.value);
const note = document.getElementById("transaction-note").value.trim();

// Validasi jenis transaksi
if (type !== "income" && type !== "expense") {
  alert("Pilih jenis transaksi yang valid.");
  return;
}

// Validasi nominal transaksi
if (
  amountInput.value.trim() === "" ||
  !Number.isSafeInteger(amount) ||
  amount <= 0
) {
  alert("Nominal harus berupa bilangan bulat positif yang valid.");
  amountInput.focus();
  return;
}

// Validasi keterangan
if (note === "") {
  alert("Keterangan transaksi tidak boleh kosong.");
  document.getElementById("transaction-note").focus();
  return;
}


 
  transactions.push({
  type: type,
  category: categorySelect.value,
  amount: amount,
  note: note,
  date: [
    new Date().getFullYear(),
    String(new Date().getMonth() + 1).padStart(2, "0"),
    String(new Date().getDate()).padStart(2, "0")
  ].join("-")
});

if (!saveTransactions()) {
  transactions.pop();
  return;
}

updateDashboard();
renderTransactions();
renderCashFlowChart();
renderBudgets();

  transactionForm.reset();
formPanel.classList.add("hidden-form");
});


function showConfirmModal(
  message,
  title = "Konfirmasi penghapusan"
) {
  const modal = document.getElementById("confirm-modal");
  const titleElement = document.getElementById("confirm-title");
  const messageElement = document.getElementById("confirm-message");
  const cancelButton = document.getElementById("confirm-cancel");
  const deleteButton = document.getElementById("confirm-delete");

  const previousFocus = document.activeElement;

  titleElement.textContent = title;
  messageElement.textContent = message;
  modal.hidden = false;

  return new Promise(function (resolve) {
    let finished = false;

    function finish(result) {
      if (finished) return;
      finished = true;

      modal.hidden = true;

      cancelButton.removeEventListener("click", onCancel);
      deleteButton.removeEventListener("click", onDelete);
      modal.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKeyDown);

      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }

      resolve(result);
    }

    function onCancel() {
      finish(false);
    }

    function onDelete() {
      finish(true);
    }

    function onOverlayClick(event) {
      if (event.target === modal) {
        finish(false);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        finish(false);
      }
    }

    cancelButton.addEventListener("click", onCancel);
    deleteButton.addEventListener("click", onDelete);
    modal.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeyDown);

    cancelButton.focus();
  });
}


function renderTransactions() {
  const transactionList = document.getElementById("transaction-list");

  transactionList.innerHTML = "";

  if (transactions.length === 0) {
    transactionList.innerHTML = "<p>Belum ada transaksi.</p>";
    return;
  }

  
const selectedType = typeFilter.value;
const selectedDate = dateFilter.value;

const filteredTransactions = transactions.filter(function (transaction) {
  const matchesType =
    selectedType === "all" || transaction.type === selectedType;

  const matchesDate =
    !selectedDate || transaction.date === selectedDate;

  return matchesType && matchesDate;
});

const latestTransactions = [...filteredTransactions].reverse();

  for (const transaction of latestTransactions) {
    const item = document.createElement("div");
    item.className = "transaction-item";

    const isIncome = transaction.type === "income";
    const sign = isIncome ? "+" : "-";
    const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";
const categoryLabels = {
  "uang-saku": "Uang saku",
  "penjualan-usaha": "Penjualan / usaha",
  hadiah: "Hadiah",
  makanan: "Makanan",
  pendidikan: "Pendidikan",
  transportasi: "Transportasi",
  hiburan: "Hiburan",
  lainnya: "Lainnya"
};

const categoryLabel =
  categoryLabels[transaction.category] || "Tanpa kategori";
    item.innerHTML = `
      <div class="transaction-info">
        <strong>${escapeHTML(transaction.note)}</strong>
        <span>${escapeHTML(categoryLabel)}</span>
        <span>${typeLabel} · ${formatTanggal(transaction.date)}</span>
      </div>
      <strong class="${transaction.type}">
        ${sign} ${formatRupiah(transaction.amount)}
      </strong>
      <button type="button" class="delete-button">Hapus</button>
    `;

    transactionList.appendChild(item);
    
const deleteButton = item.querySelector(".delete-button");

deleteButton.addEventListener("click", async function () {
  const confirmed = await showConfirmModal(
    `Hapus transaksi "${transaction.note}"?`
  );

  if (!confirmed) {
    return;
  }

  const transactionIndex = transactions.indexOf(transaction);

if (transactionIndex === -1) {
  return;
}

transactions.splice(transactionIndex, 1);

if (!saveTransactions()) {
  transactions.splice(transactionIndex, 0, transaction);
  return;
}

updateDashboard();
renderTransactions();
renderCashFlowChart();
renderBudgets();
});

  }
}

typeFilter.addEventListener("change", renderTransactions);
dateFilter.addEventListener("change", renderTransactions);

function renderCashFlowChart() {
  const chart = document.getElementById("cash-flow-chart");

  // Kelompokkan transaksi berdasarkan tanggal
  const dailyTotals = {};

  for (const transaction of transactions) {
    const date = transaction.date || "Tanpa tanggal";

    if (!dailyTotals[date]) {
      dailyTotals[date] = {
        income: 0,
        expense: 0
      };
    }

    if (transaction.type === "income") {
      dailyTotals[date].income += transaction.amount;
    } else if (transaction.type === "expense") {
      dailyTotals[date].expense += transaction.amount;
    }
  }

  // Ambil maksimal 7 tanggal terbaru
  const dates = Object.keys(dailyTotals).sort().slice(-7);

  if (dates.length === 0) {
    chart.innerHTML = "<p>Belum ada data untuk ditampilkan.</p>";
    return;
  }

  const maxAmount = Math.max(
    1,
    ...dates.flatMap(date => [
      dailyTotals[date].income,
      dailyTotals[date].expense
    ])
  );

  chart.innerHTML = dates.map(date => {
    const income = dailyTotals[date].income;
    const expense = dailyTotals[date].expense;

    const incomeHeight = (income / maxAmount) * 100;
    const expenseHeight = (expense / maxAmount) * 100;

    return `
      <div class="chart-day">
        <div class="chart-bars">
          <div
            class="chart-bar income-bar"
            style="height: ${incomeHeight}%"
            title="Pemasukan: ${formatRupiah(income)}"
          ></div>
          <div
            class="chart-bar expense-bar"
            style="height: ${expenseHeight}%"
            title="Pengeluaran: ${formatRupiah(expense)}"
          ></div>
        </div>
        <span class="chart-date">${date.slice(5)}</span>
      </div>
    `;
  }).join("");
}

updateDashboard();
renderTransactions();
renderCashFlowChart();

/* FITUR ANGGARAN BULANAN */

const budgetForm = document.getElementById("budget-form");
const budgetCategory = document.getElementById("budget-category");
const budgetAmount = document.getElementById("budget-amount");
createCustomDropdown(budgetCategory);
const budgetList = document.getElementById("budget-list");
const budgetNoteGroup = document.getElementById("budget-note-group");
const budgetNote = document.getElementById("budget-note");

function toggleBudgetNote() {
  const isOther = budgetCategory.value === "lainnya";

  budgetNoteGroup.hidden = !isOther;
  budgetNote.required = isOther;

  if (!isOther) {
    budgetNote.value = "";
  }
}

budgetCategory.addEventListener("change", toggleBudgetNote);
toggleBudgetNote();
function renderBudgets() {
  if (budgets.length === 0) {
    budgetList.innerHTML =
      "<p>Belum ada anggaran yang dibuat.</p>";
    return;
  }

  const categoryLabels = {
    makanan: "Makanan",
    pendidikan: "Pendidikan",
    transportasi: "Transportasi",
    hiburan: "Hiburan",
    lainnya: "Lainnya"
  };
const now = new Date();

const currentMonth =
  now.getFullYear() + "-" +
  String(now.getMonth() + 1).padStart(2, "0");
  

  budgetList.innerHTML = budgets.map(function (budget) {
    const categoryLabel = escapeHTML(
  categoryLabels[budget.category] || budget.category
);

const budgetNoteHTML =
  budget.category === "lainnya" && budget.note
    ? `<p class="budget-note">${escapeHTML(budget.note)}</p>`
    : "";

    const spent = transactions
      .filter(function (transaction) {
        return (
          transaction.type === "expense" &&
          transaction.category === budget.category &&
          transaction.date &&
          transaction.date.startsWith(currentMonth)
        );
      })
      .reduce(function (total, transaction) {
        return total + transaction.amount;
      }, 0);

    const remaining = budget.amount - spent;
    const percentage = Math.min(
      100,
      (spent / budget.amount) * 100
    );

const budgetStatus =
  spent > budget.amount ? "over-budget" :
  percentage >= 80 ? "near-limit" :
  "safe";

    return `
  <div class="budget-item">
    <strong>${categoryLabel}</strong>
    ${budgetNoteHTML}
    <p>Anggaran: ${formatRupiah(budget.amount)}</p>
    <p>Terpakai: ${formatRupiah(spent)}</p>
    <p>Sisa anggaran: ${formatRupiah(remaining)}</p>

    <div class="budget-progress">
      <div
         class="budget-progress-fill ${budgetStatus}"
        style="width: ${percentage}%"
      ></div>
    </div>

    <button
      type="button"
      class="delete-budget-button"
      data-category="${escapeHTML(budget.category)}"
    >
      Hapus Anggaran
    </button>
  </div>
`;
  }).join("");
  budgetList.querySelectorAll(".delete-budget-button")
  .forEach(function (button) {
    button.addEventListener("click", async function () {
  const confirmed = await showConfirmModal(
    "Hapus anggaran ini?"
  );

      if (!confirmed) {
        return;
      }

      const category = button.dataset.category;

      const budgetIndex = budgets.findIndex(function (budget) {
        return budget.category === category;
      });

      if (budgetIndex !== -1) {
  const deletedBudget = budgets[budgetIndex];

  budgets.splice(budgetIndex, 1);

  if (!saveBudgets()) {
    budgets.splice(budgetIndex, 0, deletedBudget);
    return;
  }

  renderBudgets();
}
    });
  });
}

/* SIMPAN ANGGARAN */

budgetForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const category = budgetCategory.value;
  const amount = Number(budgetAmount.value);

  // Ambil keterangan jika kategori Lainnya dipilih
  const note =
    category === "lainnya" ? budgetNote.value.trim() : "";

  if (
    budgetAmount.value.trim() === "" ||
    !Number.isSafeInteger(amount) ||
    amount <= 0
  ) {
    alert("Nominal anggaran harus berupa bilangan bulat positif yang valid.");
    budgetAmount.focus();
    return;
  }

  if (category === "lainnya" && note === "") {
    alert("Silakan isi keterangan untuk kategori Lainnya.");
    budgetNote.focus();
    return;
  }

  const existingBudget = budgets.find(function (budget) {
    return budget.category === category;
  });

  let isNewBudget = false;
  let previousAmount;
  let previousNote;

  if (existingBudget) {
    previousAmount = existingBudget.amount;
    previousNote = existingBudget.note;

    existingBudget.amount = amount;
    existingBudget.note = note;
  } else {
    budgets.push({
      category: category,
      amount: amount,
      note: note
    });

    isNewBudget = true;
  }

  if (!saveBudgets()) {
    if (isNewBudget) {
      budgets.pop();
    } else {
      existingBudget.amount = previousAmount;
      existingBudget.note = previousNote;
    }

    return;
  }

  renderBudgets();
  budgetForm.reset();
  toggleBudgetNote();
});


/* TAMPILKAN ANGGARAN SAAT HALAMAN DIBUKA */

renderBudgets();

/* FITUR TABUNGAN */

const savingsForm = document.getElementById("savings-form");
const savingsName = document.getElementById("savings-name");
const savingsTarget = document.getElementById("savings-target");
const savingsCurrent = document.getElementById("savings-current");
const savingsList = document.getElementById("savings-list");


function renderSavings() {
  if (savings.length === 0) {
    savingsList.innerHTML =
      "<p>Belum ada target tabungan.</p>";
    return;
  }

  savingsList.innerHTML = savings.map(function (item) {
    const percentage = Math.min(
      100,
      (item.current / item.target) * 100
    );

    return `
      <div class="savings-item">
        <strong>${escapeHTML(item.name)}</strong>
        <p>Target: ${formatRupiah(item.target)}</p>
        <p>Terkumpul: ${formatRupiah(item.current)}</p>
        <p>Kurang: ${formatRupiah(Math.max(0, item.target - item.current))}</p>

        <div class="budget-progress">
          <div
            class="budget-progress-fill"
            style="width: ${percentage}%"
          ></div>
        </div>

        <p>Progres: ${percentage.toFixed(1)}%</p>

        <div class="savings-actions">
          <button
            type="button"
            class="add-savings-button"
            data-id="${escapeHTML(item.id)}"
          >
            Tambah Uang
          </button>

          <button
            type="button"
            class="delete-savings-button"
            data-id="${escapeHTML(item.id)}"
          >
            Hapus
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/* AKSI TARGET TABUNGAN — EVENT DELEGATION */
savingsList.addEventListener("click", async function (event) {
  const addButton = event.target.closest(".add-savings-button");
  const deleteButton = event.target.closest(".delete-savings-button");

  if (!addButton && !deleteButton) {
    return;
  }

  const button = addButton || deleteButton;
  const id = button.dataset.id;

  const item = savings.find(function (saving) {
    return String(saving.id) === id;
  });

  if (!item) {
    alert("Target tabungan tidak ditemukan.");
    return;
  }

  // Tambah uang
  
if (addButton) {
  const modal = document.getElementById("add-money-modal");
  const form = document.getElementById("add-money-form");
  const amountInput = document.getElementById("add-money-amount");
  const description = document.getElementById("add-money-description");
  const cancelButton = document.getElementById("add-money-cancel");

  description.textContent =
    `Target: ${item.name}. Masukkan nominal uang yang ingin ditambahkan.`;

  amountInput.value = "";
  modal.hidden = false;
  amountInput.focus();

  const amount = await new Promise(function (resolve) {
    function cleanup() {
      form.removeEventListener("submit", onSubmit);
      cancelButton.removeEventListener("click", onCancel);
      modal.removeEventListener("click", onOverlayClick);
      document.removeEventListener("keydown", onKeyDown);
    }

    function finish(value) {
      cleanup();
      modal.hidden = true;
      resolve(value);
    }

    function onSubmit(event) {
      event.preventDefault();

      const value = amountInput.value.trim();
      const number = Number(value);

      if (
        value === "" ||
        !Number.isSafeInteger(number) ||
        number <= 0
      ) {
        alert("Nominal harus berupa bilangan bulat positif.");
        amountInput.focus();
        return;
      }

      finish(number);
    }

    function onCancel() {
      finish(null);
    }

    function onOverlayClick(event) {
      if (event.target === modal) {
        finish(null);
      }
    }

    function onKeyDown(event) {
      if (event.key === "Escape" && !modal.hidden) {
        finish(null);
      }
    }

    form.addEventListener("submit", onSubmit);
    cancelButton.addEventListener("click", onCancel);
    modal.addEventListener("click", onOverlayClick);
    document.addEventListener("keydown", onKeyDown);
  });

  if (amount === null) return;

  if (!Number.isSafeInteger(item.current + amount)) {
    alert("Jumlah tabungan melebihi batas nominal yang didukung.");
    return;
  }

  const previousAmount = item.current;
  item.current += amount;

  if (!saveSavings()) {
    item.current = previousAmount;
    return;
  }

  renderSavings();
  return;
}


  // Hapus target
  const confirmed = await showConfirmModal(
    `Yakin ingin menghapus target tabungan "${item.name}"?`
  );

  if (!confirmed) return;

  const index = savings.indexOf(item);

  if (index === -1) return;

  savings.splice(index, 1);

  if (!saveSavings()) {
    savings.splice(index, 0, item);
    return;
  }

  renderSavings();
});

savingsForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const name = savingsName.value.trim();
  const target = Number(savingsTarget.value);
  const current = Number(savingsCurrent.value);

  
if (
  name === "" ||
  !Number.isSafeInteger(target) ||
  !Number.isSafeInteger(current) ||
  target <= 0 ||
  current < 0
) {
  alert(
    "Nama target wajib diisi. Target harus berupa bilangan bulat positif, sedangkan jumlah terkumpul tidak boleh negatif."
  );

  if (name === "") {
    savingsName.focus();
  } else if (!Number.isSafeInteger(target) || target <= 0) {
    savingsTarget.focus();
  } else {
    savingsCurrent.focus();
  }

  return;
}


  savings.push({
  id: Date.now().toString(),
  name: name,
  target: target,
  current: current
});

if (!saveSavings()) {
  savings.pop();
  return;
}

renderSavings();
savingsForm.reset();
savingsCurrent.value = 0;
});

renderSavings();


/* NAVIGASI ANTARBAGIAN */

const navLinks = document.querySelectorAll(".nav-link");

const pageSections = [
  document.getElementById("dashboard-section"),
  document.getElementById("dashboard-chart-section"),
  document.getElementById("transaction-section"),
  document.getElementById("transaction-form-panel"),
  document.getElementById("budget-section"),
  document.getElementById("savings-section"),
  document.getElementById("report-section")
];

function showPage(targetId) {
  // Sembunyikan semua bagian terlebih dahulu
  pageSections.forEach(function (section) {
  if (section && section.id !== "transaction-form-panel") {
    section.hidden = true;
  }
});

  // Tampilkan bagian sesuai menu yang dipilih
  if (targetId === "dashboard-section") {
    document.getElementById("dashboard-section").hidden = false;
    document.getElementById("dashboard-chart-section").hidden = false;
  }

  if (targetId === "transaction-section") {
    document.getElementById("transaction-section").hidden = false;
    formPanel.hidden = false;
  formPanel.classList.add("hidden-form");
  }

  if (targetId === "budget-section") {
    document.getElementById("budget-section").hidden = false;
  }

  if (targetId === "savings-section") {
    document.getElementById("savings-section").hidden = false;
  }

if (targetId === "report-section") {
  document.getElementById("report-section").hidden = false;
}

  // Perbarui tampilan menu aktif
  navLinks.forEach(function (link) {
    link.classList.toggle(
      "active",
      link.dataset.target === targetId
    );
  });
}

navLinks.forEach(function (link) {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    showPage(link.dataset.target);
  });
});

// Tampilkan Dashboard saat website dibuka
formPanel.classList.add("hidden-form");
showPage("dashboard-section");
