import { Candidato, Empresa, Vaga } from "../types.js";
import { StorageService } from "../services/StorageService.js";
import { MatchController } from "./MatchController.js";

export class CandidatoController {
  private fotoBase64 = "";
  private competencias: string[] = [];

  constructor(private user: Candidato) {
    this.init();
  }

  private init(): void {
    document.getElementById("menu-nav-candidato")?.classList.remove("hidden");
    document.getElementById("profile-candidato")?.classList.remove("hidden");

    this.load();
    this.events();
    this.competenciasEvents();
    this.initMatchVagas();
    this.renderMatches();
  }

  private input(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
  }

  private textarea(id: string): HTMLTextAreaElement {
    return document.getElementById(id) as HTMLTextAreaElement;
  }

  private el<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }

  // ================= PROFILE =================

  private load(): void {
    (
      document.getElementById("nome-perfil-candidato") as HTMLElement
    ).textContent = this.user.nome;

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

      const foto = document.getElementById("foto-candidato") as HTMLDivElement;
      foto.style.backgroundImage = `url(${this.user.foto})`;
      foto.style.backgroundSize = "cover";
      foto.style.backgroundPosition = "center";
    }
  }

  private events(): void {
    document
      .getElementById("btn-salvar-candidato")
      ?.addEventListener("click", () => this.save());

    const foto = document.getElementById("foto-candidato");
    const inputFoto = document.getElementById("input-foto") as HTMLInputElement;

    foto?.addEventListener("click", () => inputFoto.click());
    inputFoto?.addEventListener("change", (e) => this.handleFoto(e));

    document
      .getElementById("btn-fechar-card")
      ?.addEventListener("click", () => {
        document.getElementById("view-vaga")?.classList.add("hidden");
        document.getElementById("empresa-view-dados")?.classList.add("hidden");
      });

    document
      .getElementById("btn-excluir-conta-candidato")
      ?.addEventListener("click", () => this.deleteAccount());
  }

  private handleFoto(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.fotoBase64 = reader.result as string;

      const foto = document.getElementById("foto-candidato") as HTMLDivElement;
      foto.style.backgroundImage = `url(${this.fotoBase64})`;
      foto.style.backgroundSize = "cover";
      foto.style.backgroundPosition = "center";
    };

    reader.readAsDataURL(file);
  }

  private save(): void {
    const current = StorageService.getCurrentUser() as Candidato;

    const senhaAtualDigitada = this.input("senha-atual").value.trim();
    const novaSenha = this.input("nova-senha").value.trim();

    if (senhaAtualDigitada && senhaAtualDigitada !== current.senha) {
      alert("Senha atual incorreta.");
      return;
    }

    const updated: Candidato = {
      ...current,
      nome: this.input("nome-candidato").value,
      email: this.input("email-candidato").value,
      cpf: this.input("cpf-candidato").value,
      idade: this.input("idade-candidato").value,
      estado: this.input("estado-candidato").value,
      cep: this.input("cep-candidato").value,
      descricao: this.textarea("descricao-candidato").value,
      foto: this.fotoBase64 || current.foto,
      competencias: this.competencias,
      senha: novaSenha || current.senha,
    };

    StorageService.updateUser(updated);
    this.user = updated;

    (
      document.getElementById("nome-perfil-candidato") as HTMLElement
    ).textContent = updated.nome;

    this.input("senha-atual").value = "";
    this.input("nova-senha").value = "";

    alert("Salvo!");
  }

  private deleteAccount(): void {
    if (!confirm("Tem certeza que deseja excluir sua conta?")) return;

    StorageService.deleteUser(this.user.id);
    alert("Conta excluída com sucesso.");
    window.location.href = "auth.html";
  }

  // ================= COMPETENCIAS =================

  private renderCompetencias(): void {
    const lista = document.getElementById("lista-competencias");
    const template = document.getElementById(
      "competencia-template",
    ) as HTMLDivElement;

    if (!lista || !template) return;

    lista.innerHTML = "";

    this.competencias.forEach((c, index) => {
      const item = template.cloneNode(true) as HTMLDivElement;
      item.classList.remove("hidden");

      item.querySelector(".competencia-texto")!.textContent = c;

      item.addEventListener("click", () => {
        if (!confirm("Remover competência?")) return;

        this.competencias.splice(index, 1);
        this.renderCompetencias();
      });

      lista.appendChild(item);
    });
  }

  private competenciasEvents(): void {
    const btn = document.getElementById("btn-add-competencia");
    const popup = document.getElementById("popup-competencia");
    const input = document.getElementById(
      "input-competencia",
    ) as HTMLInputElement;
    const confirmar = document.getElementById(
      "confirmar-competencia",
    ) as HTMLButtonElement;
    const cancelar = document.getElementById("cancelar-competencia");

    if (!btn || !popup || !input || !confirmar || !cancelar) return;

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

  private initMatchVagas(): void {
    const likes = StorageService.getLikes();

    const vagas = StorageService.getAllVagas().filter(
      (vaga) =>
        !likes.some(
          (like) =>
            "vagaId" in like &&
            like.candidatoId === this.user.id &&
            like.vagaId === vaga.id,
        ),
    );

    new MatchController<Vaga>(
      vagas,
      (vaga) => this.renderCardVaga(vaga),
      (vaga) => {
        StorageService.saveLike({
          candidatoId: this.user.id,
          vagaId: vaga.id,
        });

        this.renderMatches();
      },
      () => {
        document.getElementById("card-for-match")?.classList.add("hidden");
        document.getElementById("card-sem-vagas")?.classList.remove("hidden");
      },
    );
  }

  private renderCardVaga(vaga: Vaga): void {
    document.getElementById("card-for-match")?.classList.remove("hidden");

    // mostra vaga e esconde candidato
    document.getElementById("dados-vaga-match")?.classList.remove("hidden");
    document.getElementById("dados-candidato-match")?.classList.add("hidden");

    // título
    (document.getElementById("titulo-card-match") as HTMLElement).textContent =
      vaga.titulo;

    // dados
    (
      document.getElementById(
        "descricao-vaga-input-match",
      ) as HTMLTextAreaElement
    ).value = vaga.descricao || "";

    (
      document.getElementById("horario-vaga-input-match") as HTMLInputElement
    ).value = vaga.horario || "";

    (
      document.getElementById(
        "localizacao-vaga-input-match",
      ) as HTMLInputElement
    ).value = vaga.localizacao || "";

    (
      document.getElementById("salario-vaga-input-match") as HTMLInputElement
    ).value = vaga.remuneracao || "";

    (
      document.getElementById(
        "requisitos-vaga-input-match",
      ) as HTMLTextAreaElement
    ).value = vaga.requisitos || "";
  }

  // ================= MATCH LIST =================

  private renderMatches(): void {
    const lista = document.getElementById("match-list");
    const template = lista?.querySelector(".match-item") as HTMLElement;

    if (!lista || !template) return;

    lista.innerHTML = "";
    lista.appendChild(template);
    template.classList.add("hidden");

    const matches = MatchController.getMatches().filter(
      (m) => m.candidatoId === this.user.id,
    );

    matches.forEach((match) => {
      const vaga = StorageService.getAllVagas().find(
        (v) => v.id === match.vagaId,
      );

      if (!vaga) return;

      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");

      item.querySelector(".titulo-vaga")!.textContent = vaga.titulo;

      item.addEventListener("click", () => this.openVagaView(vaga));

      lista.appendChild(item);
    });
  }

  private openVagaView(vaga: Vaga): void {
    this.el("view-vaga").classList.remove("hidden");
    this.el("empresa-view-dados").classList.remove("hidden");

    (this.el("titulo-vaga-card") as HTMLElement).textContent = vaga.titulo;
    this.el<HTMLTextAreaElement>("descricao-vaga").value = vaga.descricao || "";
    this.el<HTMLInputElement>("horario-vaga").value = vaga.horario || "";
    this.el<HTMLInputElement>("localizacao-vaga").value =
      vaga.localizacao || "";
    this.el<HTMLInputElement>("salario-vaga").value = vaga.remuneracao || "";
    this.el<HTMLTextAreaElement>("requisitos-vaga").value =
      vaga.requisitos || "";
    this.el<HTMLTextAreaElement>("competencias-vaga").value =
      vaga.competencias.join(", ");

    const empresa = StorageService.getUsers().find(
      (u): u is Empresa => u.tipo === "empresa" && u.id === vaga.empresaId,
    );

    if (!empresa) return;

    this.el<HTMLInputElement>("nome-empresa-match").value = empresa.nome;
    this.el<HTMLInputElement>("email-empresa-match").value = empresa.email;
    this.el<HTMLInputElement>("cnpj-empresa-match").value = empresa.cnpj;
    this.el<HTMLTextAreaElement>("descricao-empresa-match").value =
      empresa.descricao;
    this.el<HTMLInputElement>("pais-empresa-match").value = empresa.pais;
    this.el<HTMLInputElement>("estado-empresa-match").value = empresa.estado;
    this.el<HTMLInputElement>("cep-empresa-match").value = empresa.cep;
  }
}
