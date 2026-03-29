package linketinder.service

import linketinder.model.Empresa
import linketinder.model.Vaga
import linketinder.data.DadosMock

class EmpresaService {
    private static List<Empresa> empresas = DadosMock.empresas()

    static void cadastrar(Empresa empresa) {
        boolean emailExiste = empresas.any { it.email.equalsIgnoreCase(empresa.email) }

        if (emailExiste) {
            throw new IllegalArgumentException("Erro: O e-mail " + empresa.email + " já está cadastrado.")
        }

        empresas.add(empresa)
    }

    static List<Empresa> listar() {
        return empresas
    }

    static Empresa buscarPorEmail(String email) {
        return empresas.find { it.email.equalsIgnoreCase(email) }
    }

    static Empresa buscarPorId(int id) {
        return empresas.find { it.id == id }
    }

    static List<Vaga> listarTodasVagas() {
        List<Vaga> todas = []
        empresas.each { todas.addAll(it.vagas) }
        return todas
    }

    // ---- CRUD de Vagas ----

    static void criarVaga(int idEmpresa, Vaga vaga) {
        Empresa empresa = buscarPorId(idEmpresa)
        if (empresa == null) throw new IllegalArgumentException("Empresa não encontrada.")
        empresa.vagas.add(vaga)
    }

    static List<Vaga> listarVagasDaEmpresa(int idEmpresa) {
        Empresa empresa = buscarPorId(idEmpresa)
        if (empresa == null) return []
        return empresa.vagas
    }

    static void editarVaga(int idEmpresa, int indice, Vaga vagaAtualizada) {
        Empresa empresa = buscarPorId(idEmpresa)
        if (empresa == null) throw new IllegalArgumentException("Empresa não encontrada.")
        if (indice < 0 || indice >= empresa.vagas.size()) throw new IllegalArgumentException("Índice de vaga inválido.")
        // Preserva o id original da vaga ao editar
        vagaAtualizada.id = empresa.vagas[indice].id
        empresa.vagas[indice] = vagaAtualizada
    }

    static void excluirVaga(int idEmpresa, int indice) {
        Empresa empresa = buscarPorId(idEmpresa)
        if (empresa == null) throw new IllegalArgumentException("Empresa não encontrada.")
        if (indice < 0 || indice >= empresa.vagas.size()) throw new IllegalArgumentException("Índice de vaga inválido.")
        empresa.vagas.remove(indice)
        // Qualquer like nessa vaga passa a não encontrar mais a vaga — match some automaticamente
    }
}