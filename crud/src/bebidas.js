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

	const tr = event.target.parentElement.parentElement;
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

	const bebida = { nome, preco };

	if (editando) {
		// Atualizar bebida existente
		fetch(API + `/bebidas/${idBebidaSelecionada}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(bebida),
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

		return;
	}

	// Criar nova bebida
	fetch(API + "/bebidas", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(bebida),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Erro ao criar a bebida");
			}
			return response.json();
		})
		.then((novaBebida) => {
			const tbody = document.querySelector("tbody");

			// Cria uma nova linha para a tabela
			const novaLinha = document.createElement("tr");
			novaLinha.dataset.id = novaBebida.id; // Supondo que a nova bebida tenha um ID retornado
			novaLinha.innerHTML = `
				<td>${novaBebida.id}</td>
				<td>${novaBebida.nome}</td>
				<td>${novaBebida.preco}</td>
				<td>
					<button class="editar">Editar</button>
					<button class="remover">Remover</button>
				</td>
			`;

			// Adiciona a nova linha ao final do corpo da tabela
			tbody.appendChild(novaLinha);

			// Vincular eventos de clique para editar e remover
			novaLinha
				.querySelector(".remover")
				.addEventListener("click", removerBebida);
			novaLinha.addEventListener("click", () => selecionarLinha(novaLinha));

			dialog.close();
			alert("Produto criado com sucesso!");
		})
		.catch((error) => {
			console.error("Erro:", error);
			alert("Ocorreu um erro ao criar o produto.");
		});
});

// Evento para pesquisar bebidas
document.getElementById("pesquisar").addEventListener("click", () => {
	const termoPesquisa = document.getElementById("search").value.toLowerCase();

	fetch(API + "/bebidas")
		.then((response) => response.json())
		.then((bebidas) => {
			// Filtrar bebidas pelo nome
			const bebidasFiltradas = bebidas.filter((bebida) =>
				bebida.nome.toLowerCase().includes(termoPesquisa)
			);
			mostrarBebidas(bebidasFiltradas);
		})
		.catch(mostrarErro);
});

// // Evento para pesquisar bebidas
// document.getElementById("pesquisar").addEventListener("click", () => {
// 	const termoPesquisa = document.getElementById("search").value;

// 	// Se o termo de pesquisa estiver vazio, evite a requisição
// 	if (!termoPesquisa) {
// 		alert("Digite um termo de pesquisa.");
// 		return;
// 	}

// 	// Usando o parâmetro `q` para uma busca global em todos os campos
// 	fetch(API + `/bebidas?q=${termoPesquisa}`)
// 		.then((response) => {
// 			if (!response.ok) {
// 				throw new Error("Erro ao realizar a pesquisa");
// 			}
// 			return response.json();
// 		})
// 		.then((data) => {
// 			console.log("Resultados da pesquisa:", data); // Imprime a resposta da API no console
// 			if (data.length === 0) {
// 				alert("Nenhuma bebida encontrada.");
// 			} else {
// 				mostrarBebidas(data);
// 			}
// 		})
// 		.catch(mostrarErro);
// });
