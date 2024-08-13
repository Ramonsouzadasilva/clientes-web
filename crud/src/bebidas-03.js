import { API } from "./servidor.js";

fetch(API + "/bebidas")
	.then((response) => {
		if (!response.ok) {
			throw new Error("Erro ao consultar as bebidas");
		}
		return response.json();
	})
	.then(mostrarBebidas)
	.catch(mostrarErro);

function mostrarErro(err) {
	alert(err.message);
}

function mostrarBebidas(bebidas) {
	const tbody = document.querySelector("tbody");
	removerFilhos(tbody);
	for (const b of bebidas) {
		const tr = document.createElement("tr");
		tr.dataset.id = b.id;

		const button = document.createElement("button");
		button.innerText = "Remover";
		button.addEventListener("click", removerBebida);

		const tdBotao = document.createElement("td");
		tdBotao.append(button);

		tr.append(celula(b.id), celula(b.nome), celula(b.preco), tdBotao);
		tbody.append(tr);

		// Vincular a seleção da linha ao clique
		tr.addEventListener("click", () => selecionarLinha(tr));
	}
}

function celula(conteudo) {
	const td = document.createElement("td");
	td.innerText = conteudo;
	return td;
}

function removerFilhos(elemento) {
	while (elemento.lastChild) {
		elemento.removeChild(elemento.lastChild);
	}
}

function removerBebida(event) {
	if (!confirm("Deseja mesmo remover?")) {
		return;
	}

	// Pai do botão é a célula. Pai da célula é a linha.
	const tr = event.target.parentElement.parentElement;
	// console.log( tr );
	const id = tr.dataset.id;
	fetch(API + `/bebidas/${id}`, { method: "DELETE" })
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erro ao remover a bebida");
			}
		})
		.then(() => {
			tr.remove();
			alert("Removido");
		})
		.catch((err) => alert(err.message));
}

//ALETAR COM MODAL

// Variáveis para controle
let idBebidaSelecionada;
let linhaSelecionada;
let editando = false;

// Função para selecionar uma linha
function selecionarLinha(tr) {
	if (linhaSelecionada) {
		linhaSelecionada.classList.remove("selecionada");
	}

	tr.classList.add("selecionada");
	idBebidaSelecionada = tr.dataset.id;
	linhaSelecionada = tr;
}

// Evento do botão "Novo" para abrir o diálogo de cadastro
document.getElementById("novo").addEventListener("click", () => {
	editando = false; // Criar novo
	document.getElementById("dialog-title").innerText = "Nova Bebida";
	document.getElementById("nome").value = "";
	document.getElementById("preco").value = "";
	const dialog = document.querySelector("dialog");
	dialog.showModal();
});

// Evento do botão "Alterar" para abrir o diálogo de edição
document.getElementById("alterar").addEventListener("click", () => {
	if (!linhaSelecionada) {
		alert("Selecione uma linha primeiro!");
		return;
	}

	editando = true; // Editar existente
	document.getElementById("dialog-title").innerText = "Alterar Bebida";

	const nomeAtual = linhaSelecionada.children[1].innerText;
	const precoAtual = linhaSelecionada.children[2].innerText;

	document.getElementById("nome").value = nomeAtual;
	document.getElementById("preco").value = precoAtual;

	const dialog = document.querySelector("dialog");
	dialog.showModal();
});

// Função para salvar as alterações ou criar nova bebida
document.getElementById("salvar").addEventListener("click", () => {
	const dialog = document.querySelector("dialog");
	const nome = document.getElementById("nome").value.trim();
	const preco = Number(document.getElementById("preco").value);

	if (!nome || isNaN(preco) || preco <= 0) {
		alert("Nome e preço são obrigatórios e preço deve ser maior que zero.");
		return;
	}

	if (editando) {
		// Atualizar bebida existente
		fetch(API + `/bebidas/${idBebidaSelecionada}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nome, preco }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Erro ao atualizar a bebida");
				}
				return response.json();
			})
			.then((bebidaAtualizada) => {
				linhaSelecionada.children[1].innerText = bebidaAtualizada.nome;
				linhaSelecionada.children[2].innerText = bebidaAtualizada.preco;
				dialog.close();
				alert("Produto atualizado com sucesso!");
			})
			.catch((error) => {
				console.error("Erro:", error);
				alert("Ocorreu um erro ao atualizar o produto.");
			});
	} else {
		// Criar nova bebida
		fetch(API + "/bebidas", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ nome, preco }),
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Erro ao criar a bebida");
				}
				return response.json();
			})
			.then((novaBebida) => {
				mostrarBebidas(
					[...document.querySelectorAll("tbody tr")].map((tr) => ({
						id: tr.dataset.id,
						nome: tr.children[1].innerText,
						preco: tr.children[2].innerText,
					})),
					novaBebida
				);
				dialog.close();
				alert("Produto criado com sucesso!");
			})
			.catch((error) => {
				console.error("Erro:", error);
				alert("Ocorreu um erro ao criar o produto.");
			});
	}
});
