import { Match, LikeCandidatoVaga, LikeEmpresaCandidato } from "../types.js";
import { StorageService } from "../services/StorageService.js";

export class MatchController<T> {
  private index = 0;

  constructor(
    private items: T[],
    private renderItem: (item: T) => void,
    private onLike: (item: T) => void,
    private onEmpty: () => void,
  ) {
    this.init();
  }

  static getMatches(): Match[] {
    const likes = StorageService.getLikes();

    const likesCandidatoVaga = likes.filter(
      (l): l is LikeCandidatoVaga => "vagaId" in l,
    );

    const likesEmpresaCandidato = likes.filter(
      (l): l is LikeEmpresaCandidato => "empresaId" in l && !("vagaId" in l),
    );

    const matches: Match[] = [];

    likesCandidatoVaga.forEach((likeCV) => {
      const empresa = StorageService.getEmpresaByVaga(likeCV.vagaId);
      if (!empresa) return;

      const empresaCurtiu = likesEmpresaCandidato.some(
        (likeEC) =>
          likeEC.empresaId === empresa.id &&
          likeEC.candidatoId === likeCV.candidatoId,
      );

      if (!empresaCurtiu) return;

      const exists = matches.some(
        (m) =>
          m.candidatoId === likeCV.candidatoId && m.vagaId === likeCV.vagaId,
      );

      if (!exists) {
        matches.push({
          candidatoId: likeCV.candidatoId,
          vagaId: likeCV.vagaId,
          empresaId: empresa.id,
        });
      }
    });

    return matches;
  }

  private init(): void {
    if (!this.items.length) {
      this.onEmpty();
      return;
    }

    document.getElementById("card-for-match")?.classList.remove("hidden");

    this.showCurrent();

    document.getElementById("like-btn")?.addEventListener("click", () => {
      const current = this.items[this.index];
      if (!current) return;

      this.onLike(current);
      this.next();
    });

    document.getElementById("dislike-btn")?.addEventListener("click", () => {
      const current = this.items[this.index];
      if (!current) return;

      this.items.splice(this.index, 1);

      if (!this.items.length) {
        this.onEmpty();
        return;
      }

      if (this.index >= this.items.length) {
        this.onEmpty();
        return;
      }

      this.showCurrent();
    });
  }

  private showCurrent(): void {
    const current = this.items[this.index];

    if (!current) {
      this.onEmpty();
      return;
    }

    this.renderItem(current);
  }

  private next(): void {
    this.index++;

    if (this.index >= this.items.length) {
      this.onEmpty();
      return;
    }

    this.showCurrent();
  }
}
