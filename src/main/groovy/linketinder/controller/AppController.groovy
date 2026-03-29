package linketinder.controller

import linketinder.service.*
import linketinder.model.*
import linketinder.view.MenuView
import java.util.Scanner

class AppController {

    private static Scanner scanner = new Scanner(System.in)

    // Armazena o objeto do usuário logado para persistência de sessão durante a execução
    private static Object usuarioLogado = null

    static void iniciar() {
        while (true) {
            MenuView.mostrarMenuInicial()
            int opcao = scanner.nextInt()
            scanner.nextLine()

            switch (opcao) {
                case 1: fluxoLogin(); break
                case 2: fluxoCadastroCandidato(); break
                case 3: fluxoCadastroEmpresa(); break
                case 0: return
            }
        }
    }

    private static void fluxoLogin() {
        println "\n--- LOGIN ---"
        print "Email: "; String email = scanner.nextLine().trim()
        print "Senha: "; String senha = scanner.nextLine().trim()

        usuarioLogado = LoginService.realizarLogin(email, senha)

        if (usuarioLogado != null) {
            if (usuarioLogado instanceof Candidato) fluxoCandidato()
            else if (usuarioLogado instanceof Empresa) fluxoEmpresa()
        } else {
            println "Erro: Credenciais invalidas."
        }
    }

    // -------------------------
    // FLUXO CANDIDATO
    // -------------------------

    private static void fluxoCandidato() {
        while (usuarioLogado != null) {
            MenuView.menuCandidato(usuarioLogado.nome)
            int op = scanner.nextInt()
            scanner.nextLine()

            switch (op) {
                case 1: MenuView.exibirPerfilLogado(usuarioLogado); break
                case 2: editarDadosCandidato(); break
                case 3: gerenciarCompetencias(); break
                case 4: explorarVagas(); break
                case 5:
                    def matches = MatchService.obterMatchesCandidato(usuarioLogado.email)
                    MenuView.exibirMatchesCandidato(matches)
                    break
                case 0:
                    usuarioLogado = null
                    break
            }
        }
    }

    private static void editarDadosCandidato() {
        println "\n--- EDITAR MEUS DADOS ---"
        println "Deixe em branco para manter o valor atual."

        print "Nome [" + usuarioLogado.nome + "]: "
        String nome = scanner.nextLine().trim()

        print "CPF [" + usuarioLogado.cpf + "]: "
        String cpf = scanner.nextLine().trim()

        print "Idade [" + usuarioLogado.idade + "]: "
        String idadeStr = scanner.nextLine().trim()

        print "Estado [" + usuarioLogado.estado + "]: "
        String estado = scanner.nextLine().trim()

        print "CEP [" + usuarioLogado.cep + "]: "
        String cep = scanner.nextLine().trim()

        print "Descrição [" + usuarioLogado.descricao + "]: "
        String descricao = scanner.nextLine().trim()

        print "Senha [****]: "
        String senha = scanner.nextLine().trim()

        // Aplica apenas os campos preenchidos, mantendo os atuais nos vazios
        if (!nome.isEmpty())     usuarioLogado.nome = nome
        if (!cpf.isEmpty())      usuarioLogado.cpf = cpf
        if (!idadeStr.isEmpty()) usuarioLogado.idade = idadeStr.toInteger()
        if (!estado.isEmpty())   usuarioLogado.estado = estado
        if (!cep.isEmpty())      usuarioLogado.cep = cep
        if (!descricao.isEmpty()) usuarioLogado.descricao = descricao
        if (!senha.isEmpty())    usuarioLogado.senha = senha

        println "Sucesso: Dados atualizados!"
    }

    private static void gerenciarCompetencias() {
        while (true) {
            List<String> comps = usuarioLogado.competencias

            MenuView.menuCompetencias()
            int op = scanner.nextInt()
            scanner.nextLine()

            switch (op) {
                case 1:
                    print "Nova competência: "
                    String entrada = scanner.nextLine().trim()
                    if (!entrada.isEmpty()) {
                        comps.add(entrada)
                        println "Sucesso: '" + entrada + "' adicionada!"
                    }
                    break
                case 2:
                    if (comps.isEmpty()) {
                        println "Nenhuma competência para editar."
                        break
                    }
                    print "Número da competência para editar: "
                    int numE = scanner.nextInt()
                    scanner.nextLine()
                    int indiceE = numE - 1
                    if (indiceE < 0 || indiceE >= comps.size()) {
                        println "Erro: Número inválido."
                        break
                    }
                    print "Novo valor [" + comps[indiceE] + "]: "
                    String novoValor = scanner.nextLine().trim()
                    if (!novoValor.isEmpty()) {
                        String antiga = comps[indiceE]
                        comps[indiceE] = novoValor
                        println "Sucesso: '" + antiga + "' alterada para '" + novoValor + "'!"
                    }
                    break
                case 3:
                    if (comps.isEmpty()) {
                        println "Nenhuma competência para excluir."
                        break
                    }
                    print "Número da competência para excluir: "
                    int numX = scanner.nextInt()
                    scanner.nextLine()
                    int indiceX = numX - 1
                    if (indiceX < 0 || indiceX >= comps.size()) {
                        println "Erro: Número inválido."
                    } else {
                        String removida = comps.remove(indiceX)
                        println "Sucesso: '" + removida + "' removida!"
                    }
                    break
                case 4:
                    println "\n--- SUAS COMPETÊNCIAS ---"
                    if (comps.isEmpty()) {
                        println "Nenhuma competência cadastrada."
                    } else {
                        comps.eachWithIndex { comp, i -> println "${i + 1}. ${comp}" }
                    }
                    break
                case 0: return
            }
        }
    }

    private static void explorarVagas() {
        List<Vaga> vagas = EmpresaService.listarTodasVagas()

        if (vagas.isEmpty()) {
            println "\nNenhuma vaga disponível no momento."
            return
        }

        for (vaga in vagas) {
            MenuView.exibirVaga(vaga)
            MenuView.interagirOpcoes()
            String acao = scanner.nextLine().toUpperCase()

            if (acao == "L") {
                // Registra o like pelo id único da vaga — sem depender de índice
                MatchService.registrarLikeCandidato(usuarioLogado.email, vaga.id)

                Empresa empresa = EmpresaService.buscarPorId(vaga.idEmpresa)
                if (empresa && MatchService.houveMatch(usuarioLogado.email, empresa.email)) {
                    println "MATCH com a empresa " + empresa.nome + "!"
                }
            } else if (acao == "S") break
        }
    }

    // -------------------------
    // FLUXO EMPRESA
    // -------------------------

    private static void fluxoEmpresa() {
        while (usuarioLogado != null) {
            MenuView.menuEmpresa(usuarioLogado.nome)
            int op = scanner.nextInt()
            scanner.nextLine()

            switch (op) {
                case 1: MenuView.exibirPerfilLogado(usuarioLogado); break
                case 2: editarDadosEmpresa(); break
                case 3: explorarCandidatos(); break
                case 4:
                    def matches = MatchService.obterMatchesEmpresa(usuarioLogado.email)
                    MenuView.exibirMatchesEmpresa(matches)
                    break
                case 5: fluxoGerenciarVagas(); break
                case 0: usuarioLogado = null; break
            }
        }
    }

    private static void editarDadosEmpresa() {
        println "\n--- EDITAR MEUS DADOS ---"
        println "Deixe em branco para manter o valor atual."

        print "Nome [" + usuarioLogado.nome + "]: "
        String nome = scanner.nextLine().trim()

        print "CNPJ [" + usuarioLogado.cnpj + "]: "
        String cnpj = scanner.nextLine().trim()

        print "País [" + usuarioLogado.pais + "]: "
        String pais = scanner.nextLine().trim()

        print "Estado [" + usuarioLogado.estado + "]: "
        String estado = scanner.nextLine().trim()

        print "CEP [" + usuarioLogado.cep + "]: "
        String cep = scanner.nextLine().trim()

        print "Descrição [" + usuarioLogado.descricao + "]: "
        String descricao = scanner.nextLine().trim()

        print "Senha [****]: "
        String senha = scanner.nextLine().trim()

        if (!nome.isEmpty())     usuarioLogado.nome = nome
        if (!cnpj.isEmpty())     usuarioLogado.cnpj = cnpj
        if (!pais.isEmpty())     usuarioLogado.pais = pais
        if (!estado.isEmpty())   usuarioLogado.estado = estado
        if (!cep.isEmpty())      usuarioLogado.cep = cep
        if (!descricao.isEmpty()) usuarioLogado.descricao = descricao
        if (!senha.isEmpty())    usuarioLogado.senha = senha

        println "Sucesso: Dados atualizados!"
    }

    private static void explorarCandidatos() {
        for (candidato in CandidatoService.listar()) {
            // Exibe dados restritos: sem nome, CPF, idade e email
            MenuView.exibirCandidatoRestrito(candidato)
            MenuView.interagirOpcoes()
            String acao = scanner.nextLine().toUpperCase()

            if (acao == "L") {
                MatchService.registrarLikeEmpresa(usuarioLogado.email, candidato.email)
                if (MatchService.houveMatch(candidato.email, usuarioLogado.email)) {
                    println "MATCH!"
                }
            } else if (acao == "S") break
        }
    }

    private static void fluxoGerenciarVagas() {
        while (true) {
            MenuView.menuGerenciarVagas()
            int op = scanner.nextInt()
            scanner.nextLine()

            switch (op) {
                case 1: criarVaga(); break
                case 2: editarVaga(); break
                case 3: excluirVaga(); break
                case 4: listarVagasDaEmpresa(); break
                case 0: return
            }
        }
    }

    private static void criarVaga() {
        println "\n--- NOVA VAGA ---"
        print "Descrição: "; String desc = scanner.nextLine().trim()
        print "Horário: "; String horario = scanner.nextLine().trim()
        print "Localização: "; String local = scanner.nextLine().trim()
        print "Remuneração: "; String remun = scanner.nextLine().trim()

        if (desc.isEmpty() || horario.isEmpty() || local.isEmpty() || remun.isEmpty()) {
            println "Erro: Todos os campos são obrigatórios."
            return
        }

        // Empresa gerencia competências dentro da vaga
        List<String> competencias = []
        gerenciarCompetenciasVaga(competencias)

        Vaga nova = new Vaga(desc, horario, local, remun, competencias, usuarioLogado.id)

        try {
            EmpresaService.criarVaga(usuarioLogado.id, nova)
            println "Sucesso: Vaga criada!"
        } catch (IllegalArgumentException e) {
            println "Erro: " + e.getMessage()
        }
    }

    private static void editarVaga() {
        List<Vaga> vagas = EmpresaService.listarVagasDaEmpresa(usuarioLogado.id)

        if (vagas.isEmpty()) {
            println "\nVocê não possui vagas cadastradas."
            return
        }

        println "\n--- SUAS VAGAS ---"
        vagas.eachWithIndex { v, i -> println "${i + 1}. ${v.descricao} | ${v.localizacao}" }

        print "Número da vaga para editar: "
        int num = scanner.nextInt()
        scanner.nextLine()
        int indice = num - 1

        if (indice < 0 || indice >= vagas.size()) {
            println "Erro: Número inválido."
            return
        }

        Vaga vaga = vagas[indice]
        println "\n--- EDITANDO: " + vaga.descricao + " ---"
        println "Deixe em branco para manter o valor atual."

        print "Descrição [" + vaga.descricao + "]: "; String desc = scanner.nextLine().trim()
        print "Horário [" + vaga.horario + "]: "; String horario = scanner.nextLine().trim()
        print "Localização [" + vaga.localizacao + "]: "; String local = scanner.nextLine().trim()
        print "Remuneração [" + vaga.remuneracao + "]: "; String remun = scanner.nextLine().trim()

        // Mantém o valor atual se deixado em branco
        String novaDesc    = desc.isEmpty()    ? vaga.descricao   : desc
        String novoHorario = horario.isEmpty() ? vaga.horario     : horario
        String novoLocal   = local.isEmpty()   ? vaga.localizacao : local
        String novoRemun   = remun.isEmpty()   ? vaga.remuneracao : remun

        List<String> competencias = new ArrayList<>(vaga.competencias)
        gerenciarCompetenciasVaga(competencias)

        Vaga atualizada = new Vaga(novaDesc, novoHorario, novoLocal, novoRemun, competencias, usuarioLogado.id)

        try {
            EmpresaService.editarVaga(usuarioLogado.id, indice, atualizada)
            println "Sucesso: Vaga atualizada!"
        } catch (IllegalArgumentException e) {
            println "Erro: " + e.getMessage()
        }
    }

    // Empresa gerencia competências dentro de uma vaga (adicionar, excluir, listar)
    private static void gerenciarCompetenciasVaga(List<String> competencias) {
        while (true) {
            MenuView.menuCompetenciasVaga()
            int op = scanner.nextInt()
            scanner.nextLine()

            switch (op) {
                case 1:
                    print "Nova competência: "
                    String entrada = scanner.nextLine().trim()
                    if (!entrada.isEmpty()) {
                        competencias.add(entrada)
                        println "Sucesso: '" + entrada + "' adicionada!"
                    }
                    break
                case 2:
                    if (competencias.isEmpty()) {
                        println "Nenhuma competência para excluir."
                        break
                    }
                    print "Número da competência para excluir: "
                    int num = scanner.nextInt()
                    scanner.nextLine()
                    int idx = num - 1
                    if (idx < 0 || idx >= competencias.size()) {
                        println "Erro: Número inválido."
                    } else {
                        String removida = competencias.remove(idx)
                        println "Sucesso: '" + removida + "' removida!"
                    }
                    break
                case 3:
                    println "\n--- COMPETÊNCIAS DA VAGA ---"
                    if (competencias.isEmpty()) {
                        println "Nenhuma competência cadastrada."
                    } else {
                        competencias.eachWithIndex { comp, i -> println "${i + 1}. ${comp}" }
                    }
                    break
                case 0: return
            }
        }
    }

    private static void excluirVaga() {
        List<Vaga> vagas = EmpresaService.listarVagasDaEmpresa(usuarioLogado.id)

        if (vagas.isEmpty()) {
            println "\nVocê não possui vagas cadastradas."
            return
        }

        println "\n--- SUAS VAGAS ---"
        vagas.eachWithIndex { v, i -> println "${i + 1}. ${v.descricao} | ${v.localizacao}" }

        print "Número da vaga para excluir: "
        int num = scanner.nextInt()
        scanner.nextLine()
        int indice = num - 1

        try {
            EmpresaService.excluirVaga(usuarioLogado.id, indice)
            println "Sucesso: Vaga excluída!"
        } catch (IllegalArgumentException e) {
            println "Erro: " + e.getMessage()
        }
    }

    private static void listarVagasDaEmpresa() {
        List<Vaga> vagas = EmpresaService.listarVagasDaEmpresa(usuarioLogado.id)

        println "\n--- SUAS VAGAS ---"
        if (vagas.isEmpty()) {
            println "Nenhuma vaga cadastrada."
            return
        }

        vagas.eachWithIndex { v, i ->
            println "\n[" + (i + 1) + "]"
            println v.toString()
        }
    }

    // -------------------------
    // CADASTRO
    // -------------------------

    private static void fluxoCadastroCandidato() {
        println "\n--- NOVO CANDIDATO ---"
        print "Nome: "; String nome = scanner.nextLine().trim()
        print "Email: "; String email = scanner.nextLine().trim()
        print "CPF: "; String cpf = scanner.nextLine().trim()
        print "Idade: "; int idade = scanner.nextInt(); scanner.nextLine()
        print "Estado: "; String estado = scanner.nextLine().trim()
        print "CEP: "; String cep = scanner.nextLine().trim()
        print "Senha: "; String senha = scanner.nextLine().trim()
        print "Descrição: "; String desc = scanner.nextLine().trim()

        if (nome.isEmpty() || email.isEmpty() || cpf.isEmpty() || estado.isEmpty() || cep.isEmpty() || senha.isEmpty() || desc.isEmpty()) {
            println "Erro: Todos os campos são obrigatórios."
            return
        }

        try {
            Candidato novo = new Candidato(nome, email, cpf, idade, estado, cep, desc, [], senha)
            CandidatoService.cadastrar(novo)
            println "Sucesso: Cadastrado com sucesso!"
        } catch (IllegalArgumentException e) {
            println "Erro: " + e.getMessage()
        }
    }

    private static void fluxoCadastroEmpresa() {
        println "\n--- NOVA EMPRESA ---"
        print "Nome: "; String nome = scanner.nextLine().trim()
        print "Email: "; String email = scanner.nextLine().trim()
        print "CNPJ: "; String cnpj = scanner.nextLine().trim()
        print "País: "; String pais = scanner.nextLine().trim()
        print "Estado: "; String estado = scanner.nextLine().trim()
        print "CEP: "; String cep = scanner.nextLine().trim()
        print "Senha: "; String senha = scanner.nextLine().trim()
        print "Descrição: "; String desc = scanner.nextLine().trim()

        if (nome.isEmpty() || email.isEmpty() || cnpj.isEmpty() || pais.isEmpty() || estado.isEmpty() || cep.isEmpty() || senha.isEmpty() || desc.isEmpty()) {
            println "Erro: Todos os campos são obrigatórios."
            return
        }

        try {
            Empresa nova = new Empresa(nome, email, cnpj, pais, estado, cep, desc, senha)
            EmpresaService.cadastrar(nova)
            println "Sucesso: Cadastrada com sucesso!"
        } catch (IllegalArgumentException e) {
            println "Erro: " + e.getMessage()
        }
    }
}