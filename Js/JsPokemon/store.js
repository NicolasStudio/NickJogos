function updateStore() {
  const storeDiv = document.getElementById("storeTabContent");
  storeDiv.innerHTML = "<h2>Loja</h2>";

  const saldo = document.createElement("p");
  saldo.textContent = `Dinheiro: ${dinheiro}`;
  storeDiv.appendChild(saldo);

  // Futuro: itens à venda
}
