"use strict";

const IVA = 0.21;
const PRODUCTS = [
  "Notebook empresarial", "PC de escritorio", "Monitor LED", "Servidor", "Router", "Switch de red",
  "Access point", "Cámara IP", "UPS / estabilizador", "Impresora", "Disco de almacenamiento", "Otro producto"
];
const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const body = document.querySelector("#items-body");
const addButton = document.querySelector("#add-item");
const message = document.querySelector("#form-message");
const quoteNumber = document.querySelector("#quote-number");
let rowId = 0;

function makeRow() {
  const id = ++rowId;
  const row = document.createElement("tr");
  row.className = "item-row";
  row.innerHTML = `
    <td><label class="sr-only" for="product-${id}">Producto ${id}</label><select id="product-${id}" name="product" required><option value="">Seleccionar producto</option>${PRODUCTS.map((product) => `<option value="${product}">${product}</option>`).join("")}</select></td>
    <td><label class="sr-only" for="quantity-${id}">Cantidad ${id}</label><input id="quantity-${id}" name="quantity" type="number" min="1" step="1" value="1" inputmode="numeric" required></td>
    <td><label class="sr-only" for="price-${id}">Precio unitario ${id}</label><input id="price-${id}" name="price" type="number" min="0" step="0.01" placeholder="0,00" inputmode="decimal" required></td>
    <td class="line-total">$ 0,00</td>
    <td><button class="remove-item" type="button" aria-label="Quitar producto ${id}" title="Quitar producto">×</button></td>`;
  row.addEventListener("input", calculate);
  row.addEventListener("change", calculate);
  row.querySelector(".remove-item").addEventListener("click", () => {
    row.remove();
    if (!body.children.length) makeRow();
    syncRows();
    calculate();
  });
  body.append(row);
  syncRows();
}

function syncRows() {
  const rows = [...body.querySelectorAll(".item-row")];
  rows.forEach((row, index) => {
    row.querySelector(".remove-item").disabled = rows.length === 1;
    row.querySelector(".remove-item").setAttribute("aria-label", `Quitar producto ${index + 1}`);
  });
  addButton.disabled = rows.length >= 5;
  addButton.hidden = rows.length >= 5;
}

function calculate() {
  let subtotal = 0;
  body.querySelectorAll(".item-row").forEach((row) => {
    const product = row.querySelector('[name="product"]').value;
    const quantity = Number(row.querySelector('[name="quantity"]').value);
    const price = Number(row.querySelector('[name="price"]').value);
    const amount = product && quantity > 0 && price >= 0 ? quantity * price : 0;
    row.querySelector(".line-total").textContent = money.format(amount);
    subtotal += amount;
  });
  const tax = subtotal * IVA;
  const total = subtotal + tax;
  document.querySelector("#subtotal").textContent = money.format(subtotal);
  document.querySelector("#tax").textContent = money.format(tax);
  document.querySelector("#total").textContent = money.format(total);
  document.querySelector("#installment-12").textContent = money.format(total / 12);
  document.querySelector("#installment-18").textContent = money.format((total * 1.75) / 18);
}

function validateQuote() {
  message.textContent = "";
  const client = document.querySelector("#client-name").value.trim();
  if (!client) {
    message.textContent = "Ingresá el nombre y apellido del cliente para emitir el presupuesto.";
    document.querySelector("#client-name").focus();
    return false;
  }
  const rows = [...body.querySelectorAll(".item-row")];
  const invalid = rows.find((row) => {
    const product = row.querySelector('[name="product"]').value;
    const quantity = Number(row.querySelector('[name="quantity"]').value);
    const priceField = row.querySelector('[name="price"]');
    return !product || !Number.isInteger(quantity) || quantity < 1 || priceField.value === "" || !Number.isFinite(Number(priceField.value)) || Number(priceField.value) < 0;
  });
  if (invalid) {
    message.textContent = "Completá el producto, la cantidad y un precio unitario válido en cada fila.";
    invalid.querySelector("select").focus();
    return false;
  }
  return true;
}

function printQuote() {
  if (!validateQuote()) return;
  window.print();
}

addButton.addEventListener("click", () => {
  if (body.children.length < 5) makeRow();
});
document.querySelector("#print-button").addEventListener("click", printQuote);
document.querySelector("#pdf-button").addEventListener("click", printQuote);
document.querySelector("#quote-form").addEventListener("submit", (event) => event.preventDefault());
document.querySelector("#client-name").addEventListener("input", () => { message.textContent = ""; });
quoteNumber.textContent = `PRESUPUESTO · ${new Intl.DateTimeFormat("es-AR").format(new Date())}`;
makeRow();
calculate();
