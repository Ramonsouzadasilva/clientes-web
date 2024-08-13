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
let idBebidaSelecionada;
let linhaSelecionada;

function selecionarLinha(tr) {
	// Remove a classe 'selecionada' da linha anteriormente selecionada, se houver
	if (linhaSelecionada) {
		linhaSelecionada.classList.remove("selecionada");
	}

	// Adiciona a classe 'selecionada' à linha clicada
	tr.classList.add("selecionada");

	// Armazena o ID da bebida e a linha selecionada
	idBebidaSelecionada = tr.dataset.id;
	linhaSelecionada = tr;
}

// Evento do botão "Alterar" para abrir o diálogo de edição
document.getElementById("alterar").addEventListener("click", () => {
	if (!linhaSelecionada) {
		alert("Selecione uma linha primeiro!");
		return;
	}

	// Preencher o valor atual do nome e preço no input do diálogo
	const nomeAtual = linhaSelecionada.children[1].innerText;
	const precoAtual = linhaSelecionada.children[2].innerText;

	document.getElementById("nome").value = nomeAtual;
	document.getElementById("preco").value = precoAtual;

	const dialog = document.querySelector("dialog");
	dialog.showModal(); // Exibe o diálogo de edição
});

// Função para salvar as alterações
document.getElementById("salvar").addEventListener("click", () => {
	const dialog = document.querySelector("dialog");
	const novoNome = document.getElementById("nome").value;
	const novoPreco = Number(document.getElementById("preco").value);

	fetch(API + `/bebidas/${idBebidaSelecionada}`, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ nome: novoNome, preco: novoPreco }),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erro ao atualizar a bebida");
			}
			return response.json();
		})
		.then((bebidaAtualizada) => {
			// Atualiza o nome e o preço da linha correspondente
			linhaSelecionada.children[1].innerText = bebidaAtualizada.nome;
			linhaSelecionada.children[2].innerText = bebidaAtualizada.preco;
			dialog.close();
			alert("Produto atualizado com sucesso!");
		})
		.catch((error) => {
			console.error("Erro:", error);
			alert("Ocorreu um erro ao atualizar o produto.");
		});
});
