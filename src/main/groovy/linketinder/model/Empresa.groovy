package linketinder.model

class Empresa extends PessoaJuridica {

    // Contador estático para gerar ids únicos e sequenciais
    private static int proximoId = 1

    int id
    List<Vaga> vagas = []

    Empresa(String nome, String email, String cnpj, String pais, String estado, String cep, String descricao, List<String> competencias, String senha) {
        super(nome, email, cnpj, pais, estado, cep, descricao, competencias, senha)
        this.id = proximoId++
    }
}