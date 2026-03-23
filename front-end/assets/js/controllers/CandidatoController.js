import { StorageService } from "../services/StorageService.js";
import { MatchController } from "./MatchController.js";
export class CandidatoController {
    constructor(user) {
        this.user = user;
        this.fotoBase64 = "";
        this.competencias = [];
        this.init();
    }
    init() {
        var _a, _b;
        (_a = document.getElementById("menu-nav-candidato")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        (_b = document.getElementById("profile-candidato")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        this.load();
        this.events();
        this.competenciasEvents();
        this.initMatchVagas();
        this.renderMatches();
    }
    input(id) {
        return document.getElementById(id);
    }
    textarea(id) {
        return document.getElementById(id);
    }
    el(id) {
        return document.getElementById(id);
    }
    // ================= PROFILE =================
    load() {
        document.getElementById("nome-perfil-candidato").textContent = this.user.nome;
        this.input("nome-candidato").value = this.user.nome;
        this.input("email-candidato").value = this.user.email;
        this.input("cpf-candidato").value = this.user.cpf;
        this.input("idade-candidato").value = this.user.idade;
        this.input("estado-candidato").value = this.user.estado;
        this.input("cep-candidato").value = this.user.cep;
        this.textarea("descricao-candidato").value = this.user.descricao;
        this.competencias = [...this.user.competencias];
        this.renderCompetencias();
        if (this.user.foto) {
            this.fotoBase64 = this.user.foto;
            const foto = document.getElementById("foto-candidato");
            foto.style.backgroundImage = `url(${this.user.foto})`;
            foto.style.backgroundSize = "cover";
            foto.style.backgroundPosition = "center";
        }
    }
    events() {
        var _a, _b, _c;
        (_a = document
            .getElementById("btn-salvar-candidato")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => this.save());
        const foto = document.getElementById("foto-candidato");
        const inputFoto = document.getElementById("input-foto");
        foto === null || foto === void 0 ? void 0 : foto.addEventListener("click", () => inputFoto.click());
        inputFoto === null || inputFoto === void 0 ? void 0 : inputFoto.addEventListener("change", (e) => this.handleFoto(e));
        (_b = document
            .getElementById("btn-fechar-card")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            var _a, _b;
            (_a = document.getElementById("view-vaga")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            (_b = document.getElementById("empresa-view-dados")) === null || _b === void 0 ? void 0 : _b.classList.add("hidden");
        });
        (_c = document
            .getElementById("btn-excluir-conta-candidato")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => this.deleteAccount());
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
            const foto = document.getElementById("foto-candidato");
            foto.style.backgroundImage = `url(${this.fotoBase64})`;
            foto.style.backgroundSize = "cover";
            foto.style.backgroundPosition = "center";
        };
        reader.readAsDataURL(file);
    }
    save() {
        const current = StorageService.getCurrentUser();
        const senhaAtualDigitada = this.input("senha-atual").value.trim();
        const novaSenha = this.input("nova-senha").value.trim();
        if (senhaAtualDigitada && senhaAtualDigitada !== current.senha) {
            alert("Senha atual incorreta.");
            return;
        }
        const updated = Object.assign(Object.assign({}, current), { nome: this.input("nome-candidato").value, email: this.input("email-candidato").value, cpf: this.input("cpf-candidato").value, idade: this.input("idade-candidato").value, estado: this.input("estado-candidato").value, cep: this.input("cep-candidato").value, descricao: this.textarea("descricao-candidato").value, foto: this.fotoBase64 || current.foto, competencias: this.competencias, senha: novaSenha || current.senha });
        StorageService.updateUser(updated);
        this.user = updated;
        document.getElementById("nome-perfil-candidato").textContent = updated.nome;
        this.input("senha-atual").value = "";
        this.input("nova-senha").value = "";
        alert("Salvo!");
    }
    deleteAccount() {
        if (!confirm("Tem certeza que deseja excluir sua conta?"))
            return;
        StorageService.deleteUser(this.user.id);
        alert("Conta excluída com sucesso.");
        window.location.href = "auth.html";
    }
    // ================= COMPETENCIAS =================
    renderCompetencias() {
        const lista = document.getElementById("lista-competencias");
        const template = document.getElementById("competencia-template");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        this.competencias.forEach((c, index) => {
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            item.querySelector(".competencia-texto").textContent = c;
            item.addEventListener("click", () => {
                if (!confirm("Remover competência?"))
                    return;
                this.competencias.splice(index, 1);
                this.renderCompetencias();
            });
            lista.appendChild(item);
        });
    }
    competenciasEvents() {
        const btn = document.getElementById("btn-add-competencia");
        const popup = document.getElementById("popup-competencia");
        const input = document.getElementById("input-competencia");
        const confirmar = document.getElementById("confirmar-competencia");
        const cancelar = document.getElementById("cancelar-competencia");
        if (!btn || !popup || !input || !confirmar || !cancelar)
            return;
        const regex = /^[A-Za-zÀ-ÿ0-9.+#-]{2,30}(?:\s[A-Za-zÀ-ÿ0-9.+#-]{2,30})*$/;
        btn.onclick = () => {
            popup.classList.remove("hidden");
            input.value = "";
            input.focus();
        };
        confirmar.onclick = () => {
            const valor = input.value.trim();
            if (!valor) {
                alert("Digite uma competência");
                return;
            }
            if (!regex.test(valor)) {
                alert("Digite uma competência válida (ex: Java, React, Node.js)");
                return;
            }
            this.competencias.push(valor);
            this.renderCompetencias();
            popup.classList.add("hidden");
            input.value = "";
        };
        cancelar.onclick = () => {
            popup.classList.add("hidden");
            input.value = "";
        };
    }
    // ================= MATCH =================
    initMatchVagas() {
        const likes = StorageService.getLikes();
        const vagas = StorageService.getAllVagas().filter((vaga) => !likes.some((like) => "vagaId" in like &&
            like.candidatoId === this.user.id &&
            like.vagaId === vaga.id));
        new MatchController(vagas, (vaga) => this.renderCardVaga(vaga), (vaga) => {
            StorageService.saveLike({
                candidatoId: this.user.id,
                vagaId: vaga.id,
            });
            this.renderMatches();
        }, () => {
            var _a, _b;
            (_a = document.getElementById("card-for-match")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
            (_b = document.getElementById("card-sem-vagas")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        });
    }
    renderCardVaga(vaga) {
        var _a, _b, _c;
        (_a = document.getElementById("card-for-match")) === null || _a === void 0 ? void 0 : _a.classList.remove("hidden");
        // mostra vaga e esconde candidato
        (_b = document.getElementById("dados-vaga-match")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
        (_c = document.getElementById("dados-candidato-match")) === null || _c === void 0 ? void 0 : _c.classList.add("hidden");
        // título
        document.getElementById("titulo-card-match").textContent =
            vaga.titulo;
        // dados
        document.getElementById("descricao-vaga-input-match").value = vaga.descricao || "";
        document.getElementById("horario-vaga-input-match").value = vaga.horario || "";
        document.getElementById("localizacao-vaga-input-match").value = vaga.localizacao || "";
        document.getElementById("salario-vaga-input-match").value = vaga.remuneracao || "";
        document.getElementById("requisitos-vaga-input-match").value = vaga.requisitos || "";
    }
    // ================= MATCH LIST =================
    renderMatches() {
        const lista = document.getElementById("match-list");
        const template = lista === null || lista === void 0 ? void 0 : lista.querySelector(".match-item");
        if (!lista || !template)
            return;
        lista.innerHTML = "";
        lista.appendChild(template);
        template.classList.add("hidden");
        const matches = MatchController.getMatches().filter((m) => m.candidatoId === this.user.id);
        matches.forEach((match) => {
            const vaga = StorageService.getAllVagas().find((v) => v.id === match.vagaId);
            if (!vaga)
                return;
            const item = template.cloneNode(true);
            item.classList.remove("hidden");
            item.querySelector(".titulo-vaga").textContent = vaga.titulo;
            item.addEventListener("click", () => this.openVagaView(vaga));
            lista.appendChild(item);
        });
    }
    openVagaView(vaga) {
        this.el("view-vaga").classList.remove("hidden");
        this.el("empresa-view-dados").classList.remove("hidden");
        this.el("titulo-vaga-card").textContent = vaga.titulo;
        this.el("descricao-vaga").value = vaga.descricao || "";
        this.el("horario-vaga").value = vaga.horario || "";
        this.el("localizacao-vaga").value =
            vaga.localizacao || "";
        this.el("salario-vaga").value = vaga.remuneracao || "";
        this.el("requisitos-vaga").value =
            vaga.requisitos || "";
        this.el("competencias-vaga").value =
            vaga.competencias.join(", ");
        const empresa = StorageService.getUsers().find((u) => u.tipo === "empresa" && u.id === vaga.empresaId);
        if (!empresa)
            return;
        this.el("nome-empresa-match").value = empresa.nome;
        this.el("email-empresa-match").value = empresa.email;
        this.el("cnpj-empresa-match").value = empresa.cnpj;
        this.el("descricao-empresa-match").value =
            empresa.descricao;
        this.el("pais-empresa-match").value = empresa.pais;
        this.el("estado-empresa-match").value = empresa.estado;
        this.el("cep-empresa-match").value = empresa.cep;
    }
}
