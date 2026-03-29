## Linketinder – Groovy

**Autor:** Henrique Roberto dos Santos

---
## Descrição

Este é o projeto do sistema **Linketinder**, uma aplicação inspirada na ideia de unir o conceito de perfis profissionais (LinkedIn) com a lógica de visualização interativa de perfis (Tinder).

O objetivo é permitir a interação entre **candidatos** e **empresas** por meio de um menu de terminal. O sistema possibilita que usuários realizem cadastro, login e demonstrem interesse (Like) em vagas ou candidatos, gerando um "Match" automático quando a reciprocidade é detectada entre candidato e vaga.

O sistema foi desenvolvido em **Groovy**, utilizando **POO**, **Interfaces** e o padrão **MVC (Model–View–Controller)**.


## Front-end

O front-end do projeto foi desenvolvido utilizando **HTML, CSS e TypeScript**, seguindo uma abordagem simples e organizada baseada em manipulação direta do DOM, sem o uso de frameworks. A interface é composta por páginas dinâmicas que se adaptam ao tipo de usuário (candidato ou empresa), com renderização condicional de conteúdos como perfil, vagas e matches. A navegação e as interações são controladas por controllers (como `CandidatoController` e `EmpresaController`), que centralizam a lógica de exibição e comportamento da interface. O sistema inclui funcionalidades como criação e edição de vagas, gerenciamento de perfil, sistema de likes e matches, além de visualização detalhada de candidatos e vagas. Também foram implementadas melhorias de usabilidade, como compatibilidade com dispositivos móveis (eliminando dependência de `dblclick`), dropdowns dinâmicos e feedback visual para ações do usuário. O estado da aplicação é persistido localmente através do `localStorage`, garantindo uma experiência contínua mesmo após recarregar a página.


---
# Funcionalidades

### Candidato
- **Login e Cadastro:** Autenticação via e-mail e senha, com validação de e-mail único.
- **Perfil Próprio:** Visualização e edição dos dados da conta logada.
- **Gerenciamento de Competências:** CRUD completo de competências do perfil (adicionar, editar, excluir, listar).
- **Exploração de Vagas:** Navegação por vagas disponíveis uma a uma, com as ações:
  - **[L] Like:** Demonstrar interesse na vaga.
  - **[P] Próximo:** Pular para a próxima vaga.
  - **[S] Sair:** Retornar ao menu principal.
- **Sistema de Match:** Identificação em tempo real de match entre candidato e vaga.
- **Lista de Matches:** Exibição das vagas com match, incluindo os dados completos da empresa responsável.

### Empresa
- **Login e Cadastro:** Autenticação via e-mail e senha, com validação de e-mail único.
- **Perfil Próprio:** Visualização e edição dos dados da conta logada.
- **Gerenciamento de Vagas:** CRUD completo de vagas (criar, editar, excluir, listar).
- **Competências por Vaga:** Gerenciamento de competências dentro de cada vaga (adicionar, excluir, listar).
- **Exploração de Candidatos:** Visualização de candidatos um a um com dados restritos (descrição, competências, estado e CEP — sem nome, CPF, idade ou e-mail) com as ações:
  - **[L] Like:** Demonstrar interesse na vaga.
  - **[P] Próximo:** Pular para a próxima vaga.
  - **[S] Sair:** Retornar ao menu principal.
- **Sistema de Match:** Identificação em tempo real de match ao curtir um candidato.
- **Lista de Matches por Vaga:** Exibição das vagas com match e os candidatos correspondentes, com dados completos.

### Regra de Match
O match ocorre quando:
1. A empresa dá like no candidato.
2. O candidato dá like em uma vaga dessa mesma empresa.

O match é vinculado ao **id único da vaga**. Se a vaga for excluída, o match some automaticamente.

---

### Dados do Candidato
- Nome, E-mail, CPF, Idade, Estado, CEP, Descrição pessoal e Competências.

### Dados da Empresa
- Nome, E-mail corporativo, CNPJ, País, Estado, CEP e Descrição da empresa.

### Dados da Vaga
- Descrição, Horário, Localização, Remuneração e Competências exigidas.

---

## 🛠️ Tecnologias Utilizadas

- **Groovy 4**
- **Padrão MVC**: Organização em Model, View e Controller.
- **Spock Framework**: Testes de unidade para validação das regras de negócio.
- **Html5
- **Css3
- **TypeScript

---

## 💻 Ambiente de Desenvolvimento

- **SO:** Linux (Pop!_OS)

---

## 🏃 Como Executar

### Passos
1. Clone o repositório:
   ```bash
   git clone [https://github.com/HenriqueRoberto/Linketinder-Project-k1-t5.git](https://github.com/HenriqueRoberto/Linketinder-Project-k1-t5.git)
   ```
2. Acesse a pasta do projeto:
   ```bash
    cd Linketinder-Project
   ```
3. Execute a aplicação:
   ```bash
    # Caso use o terminal direto:
    groovy src/main/groovy/linketinder/Main.groovy
   ```

4. Para rodar testes:
   ```bash
   ./gradlew test
    ```
