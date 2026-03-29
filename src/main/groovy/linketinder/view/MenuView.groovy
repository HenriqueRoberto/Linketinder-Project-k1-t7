package linketinder.view

import linketinder.model.*

class MenuView {

    // Exibe as opções iniciais do sistema para usuários não autenticados
    static void mostrarMenuInicial() {
        println "\n=== LINKETINDER ==="
        println "1 - Login"
        println "2 - Cadastrar Candidato"
        println "3 - Cadastrar Empresa"
        println "0 - Sair"
        print "Escolha uma opção: "
    }

    // Menu restrito a candidatos após o login bem-sucedido
    static void menuCandidato(String nome) {
        println "\n--- MENU CANDIDATO: " + nome + " ---"
        println "1 - Ver Meus Dados"
        println "2 - Editar Meus Dados"
        println "3 - Gerenciar Competências"
        println "4 - Explorar Vagas"
        println "5 - Ver Meus Matches"
        println "0 - Logout"
        print "Escolha uma opção: "
    }

    // Submenu de competências do candidato (CRUD completo)
    static void menuCompetencias() {
        println "\n--- COMPETÊNCIAS ---"
        println "1 - Adicionar Competência"
        println "2 - Editar Competência"
        println "3 - Excluir Competência"
        println "4 - Listar Competências"
        println "0 - Voltar"
        print "Escolha uma opção: "
    }

    // Submenu de competências da vaga (sem editar — substitui a vaga inteira no editarVaga)
    static void menuCompetenciasVaga() {
        println "\n--- COMPETÊNCIAS DA VAGA ---"
        println "1 - Adicionar Competência"
        println "2 - Excluir Competência"
        println "3 - Listar Competências"
        println "0 - Voltar"
        print "Escolha uma opção: "
    }

    // Menu restrito a empresas após o login bem-sucedido
    static void menuEmpresa(String nome) {
        println "\n--- MENU EMPRESA: " + nome + " ---"
        println "1 - Ver Meus Dados"
        println "2 - Editar Meus Dados"
        println "3 - Explorar Candidatos"
        println "4 - Ver Meus Matches"
        println "5 - Gerenciar Vagas"
        println "0 - Logout"
        print "Escolha uma opção: "
    }

    // Submenu de gerenciamento de vagas da empresa
    static void menuGerenciarVagas() {
        println "\n--- GERENCIAR VAGAS ---"
        println "1 - Criar Vaga"
        println "2 - Editar Vaga"
        println "3 - Excluir Vaga"
        println "4 - Listar Minhas Vagas"
        println "0 - Voltar"
        print "Escolha uma opção: "
    }

    // Utiliza o toString() sobrescrito no model para exibir as informações do perfil
    static void exibirPerfilLogado(Object usuario) {
        println "\n--- SEU PERFIL ---"
        println usuario.toString()
    }

    // Padroniza as opções de interação durante a navegação entre perfis
    static void interagirOpcoes() {
        print "\n[L] Curtir | [P] Próximo | [S] Sair: "
    }

    // Exibe uma vaga formatada (candidato explorando vagas)
    static void exibirVaga(Vaga vaga) {
        println "\n------------------------"
        println vaga.toString()
    }

    // Exibe dados restritos do candidato para a empresa (sem nome, CPF, idade e email)
    static void exibirCandidatoRestrito(Candidato candidato) {
        println "\n------------------------"
        String compTexto = (candidato.competencias == null || candidato.competencias.isEmpty()) ?
                "sem competências cadastradas" : candidato.competencias.join(", ")

        println "Descrição: " + (candidato.descricao ?: "Sem descrição")
        println "Competências: " + compTexto
        println "Estado: " + candidato.estado
        println "CEP: " + candidato.cep
    }

    // Exibe dados completos do candidato (usado na tela de match da empresa)
    static void exibirCandidatoCompleto(Candidato candidato) {
        println "\n  Nome: " + candidato.nome
        println "  CPF: " + candidato.cpf
        println "  Idade: " + candidato.idade
        println "  Estado: " + candidato.estado
        println "  CEP: " + candidato.cep
        println "  Descrição: " + (candidato.descricao ?: "Sem descrição")
    }

    // Exibe os matches do candidato: vaga + empresa
    static void exibirMatchesCandidato(List<Map> matches) {
        println "\n--- SEUS MATCHES ---"
        if (matches.isEmpty()) {
            println "Nenhum match encontrado até o momento."
            return
        }

        matches.each { m ->
            Vaga vaga = m.vaga
            Empresa empresa = m.empresa

            println "\n============================"
            println "[ VAGA ]"
            println vaga.toString()
            println "\n[ EMPRESA ]"
            println "Nome: " + empresa.nome
            println "Email: " + empresa.email
            println "CNPJ: " + empresa.cnpj
            println "Descrição: " + (empresa.descricao ?: "Sem descrição")
            println "País: " + empresa.pais
            println "Estado: " + empresa.estado
            println "CEP: " + empresa.cep
        }
    }

    // Exibe os matches da empresa: vagas e seus candidatos
    static void exibirMatchesEmpresa(List<Map> matches) {
        println "\n--- SEUS MATCHES ---"
        if (matches.isEmpty()) {
            println "Nenhum match encontrado até o momento."
            return
        }

        matches.each { m ->
            Vaga vaga = m.vaga
            List<Candidato> candidatos = m.candidatos

            println "\n============================"
            println "[ VAGA ] " + vaga.descricao
            println "Candidatos com match:"
            candidatos.each { c ->
                println "---"
                exibirCandidatoCompleto(c)
            }
        }
    }
}