package linketinder.data

import linketinder.model.Candidato
import linketinder.model.Competencia
import linketinder.model.Empresa
import linketinder.model.Vaga

class DadosMock {

    static List<Candidato> candidatos() {
        [
                new Candidato("Ana Silva", "ana@email.com", "11111111111", 22, "SC", "88000-000", "Desenvolvedora iniciante",
                        [new Competencia("Java"), new Competencia("SQL")], "senha123"),
                new Candidato("Bruno Costa", "bruno@email.com", "22222222222", 25, "SP", "01000-000", "Back-end Node",
                        [new Competencia("Node"), new Competencia("MongoDB")], "senha123"),
                new Candidato("Carla Souza", "carla@email.com", "33333333333", 24, "RS", "90000-000", "Front-end",
                        [new Competencia("Angular"), new Competencia("CSS")], "senha123"),
                new Candidato("Diego Alves", "diego@email.com", "44444444444", 28, "PR", "80000-000", "Fullstack",
                        [new Competencia("React"), new Competencia("Node")], "senha123"),
                new Candidato("Elisa Rocha", "elisa@email.com", "55555555555", 21, "RJ", "20000-000", "Estudante de TI",
                        [new Competencia("Python"), new Competencia("Pandas")], "senha123")
        ]
    }

    static List<Empresa> empresas() {
        def techsul = new Empresa("TechSul", "rh@techsul.com", "11111111000101", "Brasil", "RS", "90000-100", "Software sob demanda", "corp123")
        techsul.vagas << new Vaga("Dev Java Pleno", "Vaga para desenvolvedor Java pleno", "08h-17h", "Porto Alegre - RS", "R\$ 6.000",
                [new Competencia("Java"), new Competencia("Spring")], techsul.id)
        techsul.vagas << new Vaga("Analista de Sistemas", "Análise e modelagem de sistemas", "09h-18h", "Remoto", "R\$ 7.500",
                [new Competencia("Java"), new Competencia("SQL")], techsul.id)

        def datawave = new Empresa("DataWave", "jobs@datawave.com", "22222222000102", "Brasil", "SP", "01000-100", "Dados e analytics", "corp123")
        datawave.vagas << new Vaga("Engenheiro de Dados", "Pipelines e modelagem de dados", "Flexível", "São Paulo - SP", "R\$ 9.000",
                [new Competencia("Python"), new Competencia("SQL")], datawave.id)

        def cloudnova = new Empresa("CloudNova", "vagas@cloudnova.com", "33333333000103", "Brasil", "SC", "88000-100", "Infraestrutura cloud", "corp123")
        cloudnova.vagas << new Vaga("DevOps Junior", "Suporte à infraestrutura em nuvem", "08h-17h", "Florianópolis - SC", "R\$ 5.500",
                [new Competencia("Docker"), new Competencia("Linux")], cloudnova.id)

        def webprime = new Empresa("WebPrime", "contato@webprime.com", "44444444000104", "Brasil", "PR", "80000-100", "Desenvolvimento web", "corp123")
        webprime.vagas << new Vaga("Dev Front-end", "Desenvolvimento de interfaces web", "09h-18h", "Curitiba - PR", "R\$ 5.000",
                [new Competencia("React"), new Competencia("CSS")], webprime.id)
        webprime.vagas << new Vaga("Dev Back-end Node", "Desenvolvimento de APIs REST", "Flexível", "Remoto", "R\$ 6.500",
                [new Competencia("Node"), new Competencia("MongoDB")], webprime.id)

        def inovatech = new Empresa("InovaTech", "talentos@inovatech.com", "55555555000105", "Brasil", "RJ", "20000-100", "Soluções digitais", "corp123")
        inovatech.vagas << new Vaga("Dev Angular Sênior", "Desenvolvimento de SPAs com Angular", "08h-17h", "Rio de Janeiro - RJ", "R\$ 10.000",
                [new Competencia("Angular"), new Competencia("TypeScript")], inovatech.id)

        [techsul, datawave, cloudnova, webprime, inovatech]
    }
}