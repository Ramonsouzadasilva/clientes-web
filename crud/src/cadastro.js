import { API } from "./servidor.js";

document.getElementById("salvar").addEventListener("click", (ev) => {
	ev.preventDefault();

	const bebida = {
		nome: document.getElementById("nome").value,
		preco: Number(document.getElementById("preco").value),
	};

	const opcoes = {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bebida),
	};

	fetch(API + "/bebidas", opcoes)
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erro ao salvar a bebida.");
			}
		})
		.then(() => {
			location.href = "../bebidas.html";
			alert("Salvo");
		})
		.catch((err) => {
			console.error("Erro:", err);
			alert(err.message);
		});
});
