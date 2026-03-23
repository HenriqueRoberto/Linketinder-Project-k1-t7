import { StorageService } from "../services/StorageService.js";
import { MatchController } from "./MatchController.js";
export class EmpresaController {
    constructor(user) {
        this.user = user;
        this.fotoBase64 = "";
        this.competenciasVaga = [];
        this.vagaEmEdicaoId = null;
        this.chart = null;
        this.init();
    }
    init() {
        var _a, _b;
        (_a = document.getElementById("menu-nav-empresa")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        (_b = document.getElementById("profile-empresa")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        this.load();
        this.events();
        this.vagas();
        this.renderVagas();
        this.initMatchCandidatos();
        this.renderMatches();
    }
    input(id) {
        return document.getElementById(id);
    }
    textarea(id) {
        return document.getElementById(id);
    }
    // ================= PROFILE =================
    load() {
        document.getElementById("nome-perfil-empresa").textContent = this.user.nome;
        this.input("nome-empresa").value = this.user.nome;
        this.input("email-empresa").value = this.user.email;
        this.input("cnpj-empresa").value = this.user.cnpj;
        this.input("pais-empresa").value = this.user.pais;
        this.input("estado-empresa").value = this.user.estado;
        this.input("cep-empresa").value = this.user.cep;
        this.textarea("descricao-empresa").value = this.user.descricao;
        if (this.user.foto) {
            this.fotoBase64 = this.user.foto;
            const foto = document.getElementById("foto-empresa");
            foto.style.backgroundImage = `url(${this.user.foto})`;
            foto.style.backgroundSize = "cover";
            foto.style.backgroundPosition = "center";
        }
    }
    events() {
        var _a, _b, _c, _d, _e;
        (_a = document
            .getElementById("btn-salvar-empresa")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.save());
        const foto = document.getElementById("foto-empresa");
        const inputFoto = document.getElementById("imagem-perfil-empresa");
        foto === null || foto === void 0 ? void 0 : foto.addEventListener("click", () => inputFoto.click());
        inputFoto === null || inputFoto === void 0 ? void 0 : inputFoto.addEventListener("change", (e) => this.handleFoto(e));
        (_b = document
            .getElementById("btn-fechar-card")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            var _a;
            (_a = document.getElementById("view-vaga")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        });
        (_c = document
            .getElementById("btn-fechar-card-candidato")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            var _a;
            (_a = document
                .getElementById("candidato-view-dados")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        });
        (_d = document
            .getElementById("btn-excluir-conta-empresa")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => this.deleteAccount());
        (_e = document
            .getElementById("btn-excluir-vaga")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => this.deleteCurrentVaga());
        this.togglePassword("senha-atual-empresa", "toggle-senha-atual-empresa");
        this.togglePassword("nova-senha-empresa", "toggle-nova-senha-empresa");
    }
    handleFoto(e) {
        var _a;
        const input = e.target;
        const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            this.fotoBase64 = reader.result;
            const foto = document.getElementById("foto-empresa");
            foto.style.backgroundImage = `url(${this.fotoBase64})`;
            foto.style.backgroundSize = "cover";
            foto.style.backgroundPosition = "center";
        };
        reader.readAsDataURL(file);
    }
    save() {
        const current = StorageService.getCurrentUser();
        const senhaAtualDigitada = this.input("senha-atual-empresa").value.trim();
        const novaSenha = this.input("nova-senha-empresa").value.trim();
        if (senhaAtualDigitada && senhaAtualDigitada !== current.senha) {
            alert("Senha atual incorreta.");
            return;
        }
        const updated = Object.assign(Object.assign({}, current), { nome: this.input("nome-empresa").value, email: this.input("email-empresa").value, cnpj: this.input("cnpj-empresa").value, pais: this.input("pais-empresa").value, estado: this.input("estado-empresa").value, cep: this.input("cep-empresa").value, descricao: this.textarea("descricao-empresa").value, foto: this.fotoBase64 || current.foto, senha: novaSenha || current.senha });
        StorageService.updateUser(updated);
        this.user = updated;
        document.querySelector(".nome-perfil-empresa").textContent = updated.nome;
        this.input("senha-atual-empresa").value = "";
        this.input("nova-senha-empresa").value = "";
        alert("Salvo!");
    }
    deleteAccount() {
        if (!confirm("Tem certeza que deseja excluir sua conta?"))
            return;
        StorageService.deleteUser(this.user.id);
        alert("Conta excluída com sucesso.");
        window.location.href = "auth.html";
    }
    togglePassword(inputId, buttonId) {
        const input = document.getElementById(inputId);
        const button = document.getElementById(buttonId);
        if (!input || !button)
            return;
        button.addEventListener("click", () => {
            input.type = input.type === "password" ? "text" : "password";
        });
    }
    // ================= VAGAS =================
    vagas() {
        const btn = document.getElementById("btn-add-vaga");
        const modal = document.getElementById("modal-add-vaga");
        const cancelar = document.getElementById("cancelar-add-vaga");
        const form = modal === null || modal === void 0 ? void 0 : modal.querySelector("form");
        btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", () => {
            this.vagaEmEdicaoId = null;
            this.resetModal();
            modal === null || modal === void 0 ? void 0 : modal.classList.remove("hidden");
        });
        cancelar === null || cancelar === void 0 ? void 0 : cancelar.addEventListener("click", (e) => {
            e.preventDefault();
            modal === null || modal === void 0 ? void 0 : modal.classList.add("hidden");
            this.resetModal();
        });
        form === null || form === void 0 ? void 0 : form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.submitVaga();
            modal === null || modal === void 0 ? void 0 : modal.classList.add("hidden");
            this.resetModal();
        });
        this.competenciasModal();
    }
    submitVaga() {
        const vaga = {
            id: this.vagaEmEdicaoId || crypto.randomUUID(),
            empresaId: this.user.id,
            titulo: this.input("titulo-vaga-input").value,
            descricao: this.textarea("descricao-vaga-input").value,
            horario: this.input("horario-vaga-input").value,
            localizacao: this.input("localizacao-vaga-input").value,
            remuneracao: this.input("salario-vaga-input").value,
            requisitos: this.textarea("requisitos-vaga-input").value,
            competencias: [...this.competenciasVaga],
        };
        const vagas = this.user.vagas || [];
        const index = vagas.findIndex((v) => v.id === vaga.id);
        if (index >= 0)
            vagas[index] = vaga;
        else
            vagas.push(vaga);
        const updated = Object.assign(Object.assign({}, this.user), { vagas });
        StorageService.updateUser(updated);
        this.user = updated;
        this.renderVagas();
        this.renderMatches();
    }
    renderVagas() {
        var _a;
        const lista = document.getElementById("lista-vagas");
        const template = lista === null || lista === void 0 ? void 0 : lista.querySelector(".vaga-item");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        lista.appendChild(template);
        template.classList.add("hidden");
        (_a = this.user.vagas) === null || _a === void 0 ? void 0 : _a.forEach((vaga) => {
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            const titulo = item.querySelector(".titulo-vaga-empresa");
            titulo.textContent = vaga.titulo;
            item.addEventListener("click", () => this.openEditVaga(vaga));
            lista.appendChild(item);
        });
    }
    openEditVaga(vaga) {
        var _a;
        this.vagaEmEdicaoId = vaga.id;
        this.competenciasVaga = [...vaga.competencias];
        this.input("titulo-vaga-input").value = vaga.titulo;
        this.textarea("descricao-vaga-input").value = vaga.descricao;
        this.input("horario-vaga-input").value = vaga.horario;
        this.input("localizacao-vaga-input").value = vaga.localizacao;
        this.input("salario-vaga-input").value = vaga.remuneracao;
        this.textarea("requisitos-vaga-input").value = vaga.requisitos;
        this.renderCompetenciasModal();
        (_a = document.getElementById("modal-add-vaga")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
    }
    resetModal() {
        this.vagaEmEdicaoId = null;
        this.competenciasVaga = [];
        this.input("titulo-vaga-input").value = "";
        this.textarea("descricao-vaga-input").value = "";
        this.input("horario-vaga-input").value = "";
        this.input("localizacao-vaga-input").value = "";
        this.input("salario-vaga-input").value = "";
        this.textarea("requisitos-vaga-input").value = "";
        document.getElementById("lista-competencias-vaga").innerHTML = "";
    }
    deleteCurrentVaga() {
        var _a;
        if (!this.vagaEmEdicaoId)
            return;
        if (!confirm("Tem certeza que deseja excluir esta vaga?"))
            return;
        StorageService.deleteVaga(this.vagaEmEdicaoId, this.user.id);
        const updated = StorageService.getCurrentUser();
        this.user = updated;
        (_a = document.getElementById("modal-add-vaga")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        this.resetModal();
        this.renderVagas();
        this.renderMatches();
        alert("Vaga excluída com sucesso.");
    }
    // ================= COMPETENCIAS =================
    competenciasModal() {
        const btn = document.getElementById("btn-add-competencia-vaga");
        const popup = document.getElementById("popup-competencia-vaga");
        const input = document.getElementById("input-competencia-vaga");
        const confirmar = document.getElementById("confirmar-competencia-vaga");
        const cancelar = document.getElementById("cancelar-competencia-vaga");
        const regex = /^[A-Za-zÀ-ÿ0-9.+#-]{2,30}(?:\s[A-Za-zÀ-ÿ0-9.+#-]{2,30})*$/;
        if (confirmar) {
            confirmar.onclick = (e) => {
                e.preventDefault();
                const valor = input.value.trim();
                if (!valor) {
                    alert("Digite uma competência");
                    return;
                }
                if (!regex.test(valor)) {
                    alert("Digite uma competência válida, como Java, React, Node.js ou C#");
                    return;
                }
                this.competenciasVaga.push(valor);
                this.renderCompetenciasModal();
                popup === null || popup === void 0 ? void 0 : popup.classList.add("hidden");
                input.value = "";
            };
        }
        btn === null || btn === void 0 ? void 0 : btn.addEventListener("click", (e) => {
            e.preventDefault();
            popup === null || popup === void 0 ? void 0 : popup.classList.remove("hidden");
            input.focus();
        });
        cancelar === null || cancelar === void 0 ? void 0 : cancelar.addEventListener("click", () => {
            popup === null || popup === void 0 ? void 0 : popup.classList.add("hidden");
            input.value = "";
        });
    }
    renderCompetenciasModal() {
        const lista = document.getElementById("lista-competencias-vaga");
        const template = document.getElementById("competencia-template-vaga");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        this.competenciasVaga.forEach((competencia, index) => {
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            item.removeAttribute("id");
            const texto = item.querySelector(".competencia-texto");
            if (texto)
                texto.textContent = competencia;
            item.addEventListener("click", () => {
                this.competenciasVaga.splice(index, 1);
                this.renderCompetenciasModal();
            });
            lista.appendChild(item);
        });
    }
    // ================= MATCH =================
    initMatchCandidatos() {
        const candidatos = StorageService.getUsers().filter((u) => u.tipo === "candidato");
        new MatchController(candidatos, (c) => this.renderCardCandidato(c), (c) => {
            StorageService.saveLike({
                empresaId: this.user.id,
                candidatoId: c.id,
            });
            this.renderMatches();
        }, () => this.showSemCandidatos());
    }
    renderCardCandidato(c) {
        var _a, _b, _c, _d, _e;
        (_a = document.getElementById("card-for-match")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        (_b = document.getElementById("card-sem-candidatos")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
        (_c = document.getElementById("card-sem-vagas")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
        (_d = document
            .getElementById("dados-candidato-match")) === null || _d === void 0 ? void 0 : _d.classList.remove("hidden");
        (_e = document.getElementById("dados-vaga-match")) === null || _e === void 0 ? void 0 : _e.classList.add("hidden");
        document.getElementById("titulo-card-match").textContent =
            c.nome;
        document.getElementById("descricao-candidato-match").value = c.descricao || "";
        document.getElementById("estado-candidato-match").value = c.estado || "";
        const lista = document.getElementById("lista-competencias-match");
        const template = document.getElementById("competencia-template-vaga");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        c.competencias.forEach((competencia) => {
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            item.querySelector(".competencia-texto").textContent = competencia;
            lista.appendChild(item);
        });
    }
    showSemCandidatos() {
        var _a, _b, _c;
        (_a = document.getElementById("card-for-match")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("card-sem-candidatos")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        (_c = document.getElementById("card-sem-vagas")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
    }
    // ================= MATCH LIST =================
    renderMatches() {
        const lista = document.getElementById("match-list");
        const template = lista === null || lista === void 0 ? void 0 : lista.querySelector(".match-item");
        const drop = document.getElementById("drop-empresa-menu-candidato");
        if (!lista || !template || !drop)
            return;
        lista.innerHTML = "";
        lista.appendChild(template);
        template.classList.add("hidden");
        lista.appendChild(drop);
        drop.classList.add("hidden");
        const matches = MatchController.getMatches().filter((m) => m.empresaId === this.user.id);
        const vagasComMatch = [...new Set(matches.map((m) => m.vagaId))];
        vagasComMatch.forEach((vagaId) => {
            var _a;
            const vaga = (_a = this.user.vagas) === null || _a === void 0 ? void 0 : _a.find((v) => v.id === vagaId);
            if (!vaga)
                return;
            const candidatosDaVaga = matches.filter((m) => m.vagaId === vagaId);
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            const titulo = item.querySelector(".titulo-vaga");
            const arrow = item.querySelector(".arrow");
            if (!titulo || !arrow)
                return;
            titulo.textContent = vaga.titulo;
            arrow.addEventListener("click", (e) => {
                e.stopPropagation();
                const mesmoItemAberto = !drop.classList.contains("hidden") &&
                    drop.previousElementSibling === item;
                document
                    .querySelectorAll(".arrow")
                    .forEach((a) => a.classList.remove("active"));
                if (mesmoItemAberto) {
                    drop.classList.add("hidden");
                    return;
                }
                const ul = drop.querySelector("#candidato-list");
                if (!ul)
                    return;
                ul.innerHTML = "";
                candidatosDaVaga.forEach((match, index) => {
                    const candidato = StorageService.getUsers().find((u) => u.tipo === "candidato" && u.id === match.candidatoId);
                    if (!candidato)
                        return;
                    const liNome = document.createElement("li");
                    liNome.className = "nome-candidato-list";
                    liNome.textContent = candidato.nome;
                    const liNumero = document.createElement("li");
                    liNumero.className = "numero-candidato-list";
                    liNumero.textContent = `#${index + 1}`;
                    const candidatoItem = document.createElement("ul");
                    candidatoItem.className = "candidato-list";
                    candidatoItem.appendChild(liNome);
                    candidatoItem.appendChild(liNumero);
                    candidatoItem.addEventListener("click", () => {
                        this.openCandidatoView(candidato);
                        drop.classList.add("hidden");
                        arrow.classList.remove("active");
                    });
                    ul.appendChild(candidatoItem);
                });
                item.insertAdjacentElement("afterend", drop);
                drop.classList.remove("hidden");
                arrow.classList.add("active");
            });
            item.addEventListener("click", (e) => {
                const target = e.target;
                if (target.classList.contains("arrow"))
                    return;
                drop.classList.add("hidden");
                document
                    .querySelectorAll(".arrow")
                    .forEach((a) => a.classList.remove("active"));
                this.openVagaView(vaga);
            });
            lista.appendChild(item);
        });
    }
    // ================= CANDIDATO VIEW =================
    openCandidatoView(c) {
        var _a;
        (_a = document.getElementById("candidato-view-dados")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        document.getElementById("nome-candidato-view").textContent = c.nome;
        const emailInput = document.getElementById("email-candidato-view");
        const emailInputComEspaco = document.getElementById("email-candidato-view  ");
        const email = emailInput || emailInputComEspaco;
        if (email)
            email.value = c.email;
        document.getElementById("cpf-candidato-view").value =
            c.cpf;
        document.getElementById("idade-candidato-view").value = c.idade;
        document.getElementById("estado-candidato-view").value = c.estado;
        document.getElementById("cep-candidato-view").value =
            c.cep;
        document.getElementById("descricao-candidato-view").value = c.descricao;
        const lista = document.getElementById("lista-competencias");
        const template = document.getElementById("competencia-template");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        c.competencias.forEach((competencia) => {
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            item.querySelector(".competencia-texto").textContent = competencia;
            lista.appendChild(item);
        });
    }
    // ================= GRAFICO =================
    gerarDadosGrafico(vaga) {
        const matches = MatchController.getMatches().filter((m) => m.empresaId === this.user.id && m.vagaId === vaga.id);
        const candidatos = StorageService.getUsers().filter((u) => u.tipo === "candidato" && matches.some((m) => m.candidatoId === u.id));
        if (!candidatos.length) {
            return vaga.competencias.map(() => 0);
        }
        return vaga.competencias.map((competencia) => {
            const totalComCompetencia = candidatos.filter((candidato) => candidato.competencias.some((c) => c.toLowerCase() === competencia.toLowerCase())).length;
            return Math.round((totalComCompetencia / candidatos.length) * 100);
        });
    }
    renderGrafico(vaga) {
        const canvas = document.getElementById("grafico-competencias");
        if (!canvas)
            return;
        const ChartClass = window.Chart;
        if (!ChartClass)
            return;
        const dados = this.gerarDadosGrafico(vaga);
        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new ChartClass(canvas, {
            type: "bar",
            data: {
                labels: vaga.competencias,
                datasets: [
                    {
                        label: "% de candidatos",
                        data: dados,
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: "x",
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.raw}%`,
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value) => `${value}%`,
                        },
                    },
                },
            },
        });
    }
    // ================= VAGA VIEW =================
    openVagaView(vaga) {
        var _a, _b;
        (_a = document.getElementById("view-vaga")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        (_b = document.getElementById("empresa-view-dados")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
        document.getElementById("titulo-vaga-card").textContent =
            vaga.titulo;
        document.getElementById("descricao-vaga").value =
            vaga.descricao || "";
        document.getElementById("horario-vaga").value =
            vaga.horario || "";
        document.getElementById("localizacao-vaga").value =
            vaga.localizacao || "";
        document.getElementById("salario-vaga").value =
            vaga.remuneracao || "";
        document.getElementById("requisitos-vaga").value =
            vaga.requisitos || "";
        document.getElementById("competencias-vaga").value = vaga.competencias.join(", ");
        this.renderGrafico(vaga);
    }
}
