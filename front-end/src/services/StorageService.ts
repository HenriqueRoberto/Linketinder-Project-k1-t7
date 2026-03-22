import { Empresa, Like, User, Vaga } from "../types.js";

export class StorageService {
  private static usersKey = "users";
  private static currentUserKey = "currentUser";
  private static likesKey = "likes";

  static getUsers(): User[] {
    return JSON.parse(localStorage.getItem(this.usersKey) || "[]");
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  static getCurrentUser(): User {
    const data = localStorage.getItem(this.currentUserKey);

    if (!data) {
      window.location.href = "auth.html";
      throw new Error("Não logado");
    }

    return JSON.parse(data);
  }

  static saveCurrentUser(user: User): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  static clearCurrentUser(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  static updateUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === user.id);

    if (index === -1) return;

    users[index] = user;

    this.saveUsers(users);
    this.saveCurrentUser(user);
  }

  static getAllVagas(): Vaga[] {
    return this.getUsers()
      .filter((u): u is Empresa => u.tipo === "empresa")
      .reduce((acc: Vaga[], empresa) => acc.concat(empresa.vagas || []), []);
  }

  static getEmpresaByVaga(vagaId: string): Empresa | null {
    const empresas = this.getUsers().filter(
      (u): u is Empresa => u.tipo === "empresa",
    );

    for (const empresa of empresas) {
      const vaga = empresa.vagas?.find((v) => v.id === vagaId);
      if (vaga) return empresa;
    }

    return null;
  }

  static getLikes(): Like[] {
    return JSON.parse(localStorage.getItem(this.likesKey) || "[]");
  }

  static saveLike(like: Like): void {
    const likes = this.getLikes();

    const exists = likes.some(
      (item) => JSON.stringify(item) === JSON.stringify(like),
    );

    if (exists) return;

    likes.push(like);
    localStorage.setItem(this.likesKey, JSON.stringify(likes));
  }

  static saveLikes(likes: Like[]): void {
    localStorage.setItem(this.likesKey, JSON.stringify(likes));
  }

  static deleteVaga(vagaId: string, empresaId: string): void {
    const users = this.getUsers().map((user) => {
      if (user.tipo !== "empresa" || user.id !== empresaId) return user;

      return {
        ...user,
        vagas: (user.vagas || []).filter((vaga) => vaga.id !== vagaId),
      };
    });

    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current.tipo === "empresa" && current.id === empresaId) {
      const updated = users.find(
        (u): u is Empresa => u.tipo === "empresa" && u.id === empresaId,
      );
      if (updated) this.saveCurrentUser(updated);
    }

    const likes = this.getLikes().filter((like) => {
      if ("vagaId" in like) {
        return like.vagaId !== vagaId;
      }

      return true;
    });

    this.saveLikes(likes);
  }

  static deleteUser(userId: string): void {
    const users = this.getUsers().filter((user) => user.id !== userId);
    this.saveUsers(users);

    const likes = this.getLikes().filter((like) => {
      if ("vagaId" in like) {
        const vaga = this.getAllVagas().find((v) => v.id === like.vagaId);

        return like.candidatoId !== userId && vaga;
      }

      return like.candidatoId !== userId && like.empresaId !== userId;
    });

    this.saveLikes(likes);

    const current = localStorage.getItem(this.currentUserKey);
    if (current) {
      const parsed = JSON.parse(current) as User;
      if (parsed.id === userId) {
        this.clearCurrentUser();
      }
    }
  }
}
