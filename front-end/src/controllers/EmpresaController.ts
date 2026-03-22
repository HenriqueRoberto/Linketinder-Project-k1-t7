import { Candidato, Empresa, Vaga } from "../types.js";
import { StorageService } from "../services/StorageService.js";
import { MatchController } from "./MatchController.js";

export class EmpresaController {
  private fotoBase64 = "";
  private competenciasVaga: string[] = [];
  private vagaEmEdicaoId: string | null = null;
  private chart: any = null;

  constructor(private user: Empresa) {
    this.init();
  }

  private init(): void {
    document.getElementById("menu-nav-empresa")?.classList.remove("hidden");
    document.getElementById("profile-empresa")?.classList.remove("hidden");

    this.load();
    this.events();
    this.vagas();
    this.renderVagas();
    this.initMatchCandidatos();
    this.renderMatches();
  }

  private input(id: string): HTMLInputElement {
    return document.getElementById(id) as HTMLInputElement;
  }

  private textarea(id: string): HTMLTextAreaElement {
    return document.getElementById(id) as HTMLTextAreaElement;
  }

  // ================= PROFILE =================

  private load(): void {
    (
      document.getElementById("nome-perfil-empresa") as HTMLElement
    ).textContent = this.user.nome;

    this.input("nome-empresa").value = this.user.nome;
    this.input("email-empresa").value = this.user.email;
    this.input("cnpj-empresa").value = this.user.cnpj;
    this.input("pais-empresa").value = this.user.pais;
    this.input("estado-empresa").value = this.user.estado;
    this.input("cep-empresa").value = this.user.cep;
    this.textarea("descricao-empresa").value = this.user.descricao;

    if (this.user.foto) {
      this.fotoBase64 = this.user.foto;

      const foto = document.getElementById("foto-empresa") as HTMLDivElement;
      foto.style.backgroundImage = `url(${this.user.foto})`;
      foto.style.backgroundSize = "cover";
      foto.style.backgroundPosition = "center";
    }
  }

  private events(): void {
    document
      .getElementById("btn-salvar-empresa")
      ?.addEventListener("click", () => this.save());

    const foto = document.getElementById("foto-empresa");
    const inputFoto = document.getElementById(
      "imagem-perfil-empresa",
    ) as HTMLInputElement;

    foto?.addEventListener("click", () => inputFoto.click());
    inputFoto?.addEventListener("change", (e) => this.handleFoto(e));

    document
      .getElementById("btn-fechar-card")
      ?.addEventListener("click", () => {
        document.getElementById("view-vaga")?.classList.add("hidden");
      });

    document
      .getElementById("btn-fechar-card-candidato")
      ?.addEventListener("click", () => {
        document
          .getElementById("candidato-view-dados")
          ?.classList.add("hidden");
      });

    document
      .getElementById("btn-excluir-conta-empresa")
      ?.addEventListener("click", () => this.deleteAccount());

    document
      .getElementById("btn-excluir-vaga")
      ?.addEventListener("click", () => this.deleteCurrentVaga());

    this.togglePassword("senha-atual-empresa", "toggle-senha-atual-empresa");
    this.togglePassword("nova-senha-empresa", "toggle-nova-senha-empresa");
  }

  private handleFoto(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      this.fotoBase64 = reader.result as string;

      const foto = document.getElementById("foto-empresa") as HTMLDivElement;
      foto.style.backgroundImage = `url(${this.fotoBase64})`;
      foto.style.backgroundSize = "cover";
      foto.style.backgroundPosition = "center";
    };

    reader.readAsDataURL(file);
  }

  private save(): void {
    const current = StorageService.getCurrentUser() as Empresa;

    const senhaAtualDigitada = this.input("senha-atual-empresa").value.trim();
    const novaSenha = this.input("nova-senha-empresa").value.trim();

    if (senhaAtualDigitada && senhaAtualDigitada !== current.senha) {
      alert("Senha atual incorreta.");
      return;
    }

    const updated: Empresa = {
      ...current,
      nome: this.input("nome-empresa").value,
      email: this.input("email-empresa").value,
      cnpj: this.input("cnpj-empresa").value,
      pais: this.input("pais-empresa").value,
      estado: this.input("estado-empresa").value,
      cep: this.input("cep-empresa").value,
      descricao: this.textarea("descricao-empresa").value,
      foto: this.fotoBase64 || current.foto,
      senha: novaSenha || current.senha,
    };

    StorageService.updateUser(updated);
    this.user = updated;

    (
      document.querySelector(".nome-perfil-empresa") as HTMLElement
    ).textContent = updated.nome;

    this.input("senha-atual-empresa").value = "";
    this.input("nova-senha-empresa").value = "";

    alert("Salvo!");
  }

  private deleteAccount(): void {
    if (!confirm("Tem certeza que deseja excluir sua conta?")) return;

    StorageService.deleteUser(this.user.id);
    alert("Conta excluída com sucesso.");
    window.location.href = "auth.html";
  }

  private togglePassword(inputId: string, buttonId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const button = document.getElementById(buttonId);

    if (!input || !button) return;

    button.addEventListener("click", () => {
      input.type = input.type === "password" ? "text" : "password";
    });
  }

  // ================= VAGAS =================

  private vagas(): void {
    const btn = document.getElementById("btn-add-vaga");
    const modal = document.getElementById("modal-add-vaga");
    const cancelar = document.getElementById("cancelar-add-vaga");
    const form = modal?.querySelector("form");

    btn?.addEventListener("click", () => {
      this.vagaEmEdicaoId = null;
      this.resetModal();
      modal?.classList.remove("hidden");
    });

    cancelar?.addEventListener("click", (e) => {
      e.preventDefault();
      modal?.classList.add("hidden");
      this.resetModal();
    });

    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      this.submitVaga();
      modal?.classList.add("hidden");
      this.resetModal();
    });

    this.competenciasModal();
  }

  private submitVaga(): void {
    const vaga: Vaga = {
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

    if (index >= 0) vagas[index] = vaga;
    else vagas.push(vaga);

    const updated: Empresa = { ...this.user, vagas };

    StorageService.updateUser(updated);
    this.user = updated;

    this.renderVagas();
    this.renderMatches();
  }

  private renderVagas(): void {
    const lista = document.getElementById("lista-vagas");
    const template = lista?.querySelector(".vaga-item") as HTMLElement;

    if (!lista || !template) return;

    lista.innerHTML = "";
    lista.appendChild(template);
    template.classList.add("hidden");

    this.user.vagas?.forEach((vaga) => {
      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");

      const titulo = item.querySelector(".titulo-vaga-empresa") as HTMLElement;
      titulo.textContent = vaga.titulo;

      item.addEventListener("click", () => this.openEditVaga(vaga));

      lista.appendChild(item);
    });
  }

  private openEditVaga(vaga: Vaga): void {
    this.vagaEmEdicaoId = vaga.id;
    this.competenciasVaga = [...vaga.competencias];

    this.input("titulo-vaga-input").value = vaga.titulo;
    this.textarea("descricao-vaga-input").value = vaga.descricao;
    this.input("horario-vaga-input").value = vaga.horario;
    this.input("localizacao-vaga-input").value = vaga.localizacao;
    this.input("salario-vaga-input").value = vaga.remuneracao;
    this.textarea("requisitos-vaga-input").value = vaga.requisitos;

    this.renderCompetenciasModal();
    document.getElementById("modal-add-vaga")?.classList.remove("hidden");
  }

  private resetModal(): void {
    this.vagaEmEdicaoId = null;
    this.competenciasVaga = [];

    this.input("titulo-vaga-input").value = "";
    this.textarea("descricao-vaga-input").value = "";
    this.input("horario-vaga-input").value = "";
    this.input("localizacao-vaga-input").value = "";
    this.input("salario-vaga-input").value = "";
    this.textarea("requisitos-vaga-input").value = "";

    document.getElementById("lista-competencias-vaga")!.innerHTML = "";
  }

  private deleteCurrentVaga(): void {
    if (!this.vagaEmEdicaoId) return;
    if (!confirm("Tem certeza que deseja excluir esta vaga?")) return;

    StorageService.deleteVaga(this.vagaEmEdicaoId, this.user.id);

    const updated = StorageService.getCurrentUser() as Empresa;
    this.user = updated;

    document.getElementById("modal-add-vaga")?.classList.add("hidden");
    this.resetModal();
    this.renderVagas();
    this.renderMatches();
    alert("Vaga excluída com sucesso.");
  }

  // ================= COMPETENCIAS =================

  private competenciasModal(): void {
    const btn = document.getElementById("btn-add-competencia-vaga");
    const popup = document.getElementById("popup-competencia-vaga");
    const input = document.getElementById(
      "input-competencia-vaga",
    ) as HTMLInputElement;

    document
      .getElementById("confirmar-competencia-vaga")
      ?.addEventListener("click", (e) => {
        e.preventDefault();

        const valor = input.value.trim();
        if (!valor) return;

        this.competenciasVaga.push(valor);
        this.renderCompetenciasModal();

        popup?.classList.add("hidden");
        input.value = "";
      });

    btn?.addEventListener("click", (e) => {
      e.preventDefault();
      popup?.classList.remove("hidden");
      input.focus();
    });

    document
      .getElementById("cancelar-competencia-vaga")
      ?.addEventListener("click", () => popup?.classList.add("hidden"));
  }

  private renderCompetenciasModal(): void {
    const lista = document.getElementById("lista-competencias-vaga");
    const template = document.getElementById(
      "competencia-template-vaga",
    ) as HTMLElement;

    if (!lista || !template) return;

    lista.innerHTML = "";

    this.competenciasVaga.forEach((c, index) => {
      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");

      item.querySelector(".competencia-texto")!.textContent = c;

      item.addEventListener("dblclick", () => {
        if (!confirm("Remover competência?")) return;

        this.competenciasVaga.splice(index, 1);
        this.renderCompetenciasModal();
      });

      lista.appendChild(item);
    });
  }

  // ================= MATCH =================

  private initMatchCandidatos(): void {
    const candidatos = StorageService.getUsers().filter(
      (u): u is Candidato => u.tipo === "candidato",
    );

    new MatchController<Candidato>(
      candidatos,
      (c) => this.renderCardCandidato(c),
      (c) => {
        StorageService.saveLike({
          empresaId: this.user.id,
          candidatoId: c.id,
        });
        this.renderMatches();
      },
      () => this.showSemCandidatos(),
    );
  }

  private renderCardCandidato(c: Candidato): void {
    document.getElementById("card-for-match")?.classList.remove("hidden");
    document.getElementById("card-sem-candidatos")?.classList.add("hidden");
    document.getElementById("card-sem-vagas")?.classList.add("hidden");

    document
      .getElementById("dados-candidato-match")
      ?.classList.remove("hidden");
    document.getElementById("dados-vaga-match")?.classList.add("hidden");

    (document.getElementById("titulo-card-match") as HTMLElement).textContent =
      c.nome;

    (
      document.getElementById(
        "descricao-candidato-match",
      ) as HTMLTextAreaElement
    ).value = c.descricao || "";

    (
      document.getElementById("estado-candidato-match") as HTMLInputElement
    ).value = c.estado || "";

    const lista = document.getElementById("lista-competencias-match");
    const template = document.getElementById(
      "competencia-template-vaga",
    ) as HTMLElement;

    if (!lista || !template) return;

    lista.innerHTML = "";

    c.competencias.forEach((competencia) => {
      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");
      item.querySelector(".competencia-texto")!.textContent = competencia;
      lista.appendChild(item);
    });
  }

  private showSemCandidatos(): void {
    document.getElementById("card-for-match")?.classList.add("hidden");
    document.getElementById("card-sem-candidatos")?.classList.remove("hidden");
    document.getElementById("card-sem-vagas")?.classList.add("hidden");
  }

  // ================= MATCH LIST =================

  private renderMatches(): void {
    const lista = document.getElementById("match-list");
    const template = lista?.querySelector(".match-item") as HTMLElement;
    const drop = document.getElementById("drop-empresa-menu-candidato");

    if (!lista || !template || !drop) return;

    lista.innerHTML = "";
    lista.appendChild(template);
    template.classList.add("hidden");
    lista.appendChild(drop);
    drop.classList.add("hidden");

    const matches = MatchController.getMatches().filter(
      (m) => m.empresaId === this.user.id,
    );

    const vagasComMatch = [...new Set(matches.map((m) => m.vagaId))];

    vagasComMatch.forEach((vagaId) => {
      const vaga = this.user.vagas?.find((v) => v.id === vagaId);
      if (!vaga) return;

      const candidatosDaVaga = matches.filter((m) => m.vagaId === vagaId);

      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");

      const titulo = item.querySelector(".titulo-vaga") as HTMLElement;
      const arrow = item.querySelector(".arrow") as HTMLElement | null;

      if (!titulo || !arrow) return;

      titulo.textContent = vaga.titulo;

      arrow.addEventListener("click", (e) => {
        e.stopPropagation();

        const mesmoItemAberto =
          !drop.classList.contains("hidden") &&
          drop.previousElementSibling === item;

        document
          .querySelectorAll(".arrow")
          .forEach((a) => a.classList.remove("active"));

        if (mesmoItemAberto) {
          drop.classList.add("hidden");
          return;
        }

        const ul = drop.querySelector(
          "#candidato-list",
        ) as HTMLUListElement | null;
        if (!ul) return;

        ul.innerHTML = "";

        candidatosDaVaga.forEach((match, index) => {
          const candidato = StorageService.getUsers().find(
            (u): u is Candidato =>
              u.tipo === "candidato" && u.id === match.candidatoId,
          );

          if (!candidato) return;

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
        const target = e.target as HTMLElement;

        if (target.classList.contains("arrow")) return;

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

  private openCandidatoView(c: Candidato): void {
    document.getElementById("candidato-view-dados")?.classList.remove("hidden");

    (
      document.getElementById("nome-candidato-view") as HTMLElement
    ).textContent = c.nome;

    const emailInput = document.getElementById(
      "email-candidato-view",
    ) as HTMLInputElement | null;
    const emailInputComEspaco = document.getElementById(
      "email-candidato-view  ",
    ) as HTMLInputElement | null;
    const email = emailInput || emailInputComEspaco;
    if (email) email.value = c.email;

    (document.getElementById("cpf-candidato-view") as HTMLInputElement).value =
      c.cpf;

    (
      document.getElementById("idade-candidato-view") as HTMLInputElement
    ).value = c.idade;

    (
      document.getElementById("estado-candidato-view") as HTMLInputElement
    ).value = c.estado;

    (document.getElementById("cep-candidato-view") as HTMLInputElement).value =
      c.cep;

    (
      document.getElementById("descricao-candidato-view") as HTMLTextAreaElement
    ).value = c.descricao;

    const lista = document.getElementById("lista-competencias");
    const template = document.getElementById(
      "competencia-template",
    ) as HTMLElement;

    if (!lista || !template) return;

    lista.innerHTML = "";

    c.competencias.forEach((competencia) => {
      const item = template.cloneNode(true) as HTMLElement;
      item.classList.remove("hidden");
      item.querySelector(".competencia-texto")!.textContent = competencia;
      lista.appendChild(item);
    });
  }

  // ================= GRAFICO =================

  private gerarDadosGrafico(vaga: Vaga): number[] {
    const matches = MatchController.getMatches().filter(
      (m) => m.empresaId === this.user.id && m.vagaId === vaga.id,
    );

    const candidatos = StorageService.getUsers().filter(
      (u): u is Candidato =>
        u.tipo === "candidato" && matches.some((m) => m.candidatoId === u.id),
    );

    if (!candidatos.length) {
      return vaga.competencias.map(() => 0);
    }

    return vaga.competencias.map((competencia) => {
      const totalComCompetencia = candidatos.filter((candidato) =>
        candidato.competencias.some(
          (c) => c.toLowerCase() === competencia.toLowerCase(),
        ),
      ).length;

      return Math.round((totalComCompetencia / candidatos.length) * 100);
    });
  }

  private renderGrafico(vaga: Vaga): void {
    const canvas = document.getElementById(
      "grafico-competencias",
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const ChartClass = (window as any).Chart;
    if (!ChartClass) return;

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
              label: (context: any) => `${context.raw}%`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value: number | string) => `${value}%`,
            },
          },
        },
      },
    });
  }

  // ================= VAGA VIEW =================

  private openVagaView(vaga: Vaga): void {
    document.getElementById("view-vaga")?.classList.remove("hidden");
    document.getElementById("empresa-view-dados")?.classList.add("hidden");

    (document.getElementById("titulo-vaga-card") as HTMLElement).textContent =
      vaga.titulo;

    (document.getElementById("descricao-vaga") as HTMLTextAreaElement).value =
      vaga.descricao || "";

    (document.getElementById("horario-vaga") as HTMLInputElement).value =
      vaga.horario || "";

    (document.getElementById("localizacao-vaga") as HTMLInputElement).value =
      vaga.localizacao || "";

    (document.getElementById("salario-vaga") as HTMLInputElement).value =
      vaga.remuneracao || "";

    (document.getElementById("requisitos-vaga") as HTMLTextAreaElement).value =
      vaga.requisitos || "";

    (
      document.getElementById("competencias-vaga") as HTMLTextAreaElement
    ).value = vaga.competencias.join(", ");

    this.renderGrafico(vaga);
  }
}
