package linketinder.service

import linketinder.model.Candidato
import linketinder.model.Empresa
import linketinder.model.Vaga

class MatchService {

    private static Map<String, Set<Integer>> likesCandidatos = [:]

    private static Map<String, Set<String>> likesEmpresas = [:]

    // Candidato dá like em uma vaga pelo id da vaga
    static void registrarLikeCandidato(String emailCandidato, int idVaga) {
        if (!likesCandidatos[emailCandidato]) likesCandidatos[emailCandidato] = [] as Set
        likesCandidatos[emailCandidato].add(idVaga)
    }

    static void registrarLikeEmpresa(String emailEmpresa, String emailCandidato) {
        if (!likesEmpresas[emailEmpresa]) likesEmpresas[emailEmpresa] = [] as Set
        likesEmpresas[emailEmpresa].add(emailCandidato)
    }

    static boolean houveMatch(String emailCandidato, String emailEmpresa) {
        boolean empresaCurtiu = likesEmpresas[emailEmpresa]?.contains(emailCandidato) ?: false
        if (!empresaCurtiu) return false

        Empresa empresa = EmpresaService.buscarPorEmail(emailEmpresa)
        if (empresa == null) return false

        Set<Integer> vagasCurtidas = likesCandidatos[emailCandidato] ?: ([] as Set)

        // Verifica se alguma vaga curtida ainda existe na empresa
        return empresa.vagas.any { vaga -> vagasCurtidas.contains(vaga.id) }
    }

    // Retorna lista de maps com [vaga: Vaga, empresa: Empresa]
    static List<Map> obterMatchesCandidato(String emailCandidato) {
        List<Map> resultado = []

        Set<Integer> vagasCurtidas = likesCandidatos[emailCandidato] ?: ([] as Set)

        vagasCurtidas.each { idVaga ->
            // Busca a vaga pelo id em todas as empresas
            Empresa empresa = EmpresaService.listar().find { e -> e.vagas.any { v -> v.id == idVaga } }
            if (empresa == null) return  // Vaga não existe mais — match some

            Vaga vaga = empresa.vagas.find { v -> v.id == idVaga }
            if (vaga == null) return

            // Só inclui se a empresa também curtiu o candidato
            if (likesEmpresas[empresa.email]?.contains(emailCandidato)) {
                resultado << [vaga: vaga, empresa: empresa]
            }
        }

        return resultado
    }

    static List<Map> obterMatchesEmpresa(String emailEmpresa) {
        List<Map> resultado = []

        Empresa empresa = EmpresaService.buscarPorEmail(emailEmpresa)
        if (empresa == null) return resultado

        empresa.vagas.each { vaga ->
            List<Candidato> candidatosComMatch = CandidatoService.listar().findAll { candidato ->
                likesEmpresas[emailEmpresa]?.contains(candidato.email) &&
                        likesCandidatos[candidato.email]?.contains(vaga.id)
            }

            if (!candidatosComMatch.isEmpty()) {
                resultado << [vaga: vaga, candidatos: candidatosComMatch]
            }
        }

        return resultado
    }
}