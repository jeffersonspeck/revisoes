# Listas Interativas

Projeto de **listas de exercícios com correção imediata**, feito em HTML, CSS e JavaScript, sem framework, banco de dados ou etapa de compilação. Preparado para **GitHub Pages**.

## 🌐 Acessar a página de exercícios

**[Abrir o catálogo de listas no GitHub Pages]([https://jeffersonspeck.github.io/revisoes/listas-interativas/](https://jeffersonspeck.github.io/revisoes/))**

**[Abrir diretamente a lista Dart, POO, persistência e UML — 40 questões]([https://jeffersonspeck.github.io/revisoes/listas-interativas/lista.html?lista=dart-poo-persistencia-uml](https://jeffersonspeck.github.io/revisoes/lista.html?lista=dart-poo-persistencia-uml))**

> Os links acima serão ativados **depois da publicação**. Eles consideram que o repositório será criado com o nome `listas-interativas`, no usuário GitHub `jeffersonspeck`. Se usar outro nome, substitua o trecho do endereço correspondente.

## Lista disponível

| Lista | Questões | Assuntos |
| --- | ---: | --- |
| Dart, POO, persistência e UML | 40 | Classes, instâncias, `final`/`const`, encapsulamento, getters, construtores, `copyWith`, `toMap`/`fromMap`, listas, estado, SQLite, Firebase RTDB, `Future`/`Stream` e diagramas UML |

### O que o aluno encontra

- Questões **verdadeiro/falso**, **asserção e razão**, **interpretação de código Dart** e **análise de diagramas UML**.
- Feedback **imediato após clicar em uma alternativa**. Resposta certa: explicação curta. Resposta errada: motivo do erro, alternativa correta e justificativa.
- **Pegadinhas conceituais**, com enunciados precisos e alternativas plausíveis.
- Em **cada exercício**, o botão **“Onde revisar este conteúdo”** indica o PDF e a página ou o arquivo correspondente no GitHub.
- Contador de acertos/erros, filtro por conteúdo e por situação (todas, pendentes, erradas, corretas), botão para refazer somente as erradas e opção de zerar a lista.
- Progresso salvo em `localStorage`, **no navegador usado pelo aluno**, sem login ou envio a servidor.
- Layout responsivo para computadores e celulares, com navegação por teclado.

## Publicação no GitHub Pages

1. Crie no GitHub um repositório **público**, preferencialmente chamado **`listas-interativas`**, na conta **`jeffersonspeck`**.
2. Envie **o conteúdo desta pasta para a raiz do repositório**, mantendo `index.html`, `lista.html`, `assets/` e `data/` nos caminhos originais.
3. No repositório, vá em **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Selecione a branch **main** e a pasta **/(root)**; salve.
6. Abra: **https://jeffersonspeck.github.io/listas-interativas/**.

Não é preciso criar workflow, hospedar API ou instalar pacotes JavaScript. O projeto usa caminhos relativos para funcionar em repositórios hospedados em subdiretórios.

### Testar antes de publicar

Ao abrir `index.html` diretamente como `file://`, alguns navegadores bloqueiam a leitura dos arquivos `.json`. Use um servidor HTTP local:

```bash
# No diretório que contém index.html:
python -m http.server 8000
```

Acesse `http://localhost:8000/` no navegador. O comando não requer instalar bibliotecas.

## Como adicionar novas listas

Esta estrutura foi planejada para suportar **múltiplas listas independentes**, sem criar um novo site a cada disciplina:

```text
listas-interativas/
├── index.html                       # catálogo das listas
├── lista.html                       # página de exercícios (genérica)
├── 404.html
├── assets/
│   ├── css/style.css                # apresentação e responsividade
│   └── js/app.js                    # renderização, correção e progresso
├── data/
│   ├── catalogo.json                # cadastro das listas
│   └── listas/
│       ├── dart-poo-persistencia-uml.json
│       └── modelo-lista.json        # exemplo para copiar
├── scripts/
│   └── validar_listas.py
└── README.md
```

**Passos para uma lista nova:**

1. Faça uma cópia de `data/listas/modelo-lista.json` e renomeie, por exemplo, para `banco-de-dados-sql.json`.
2. Altere o campo `id` para um identificador exclusivo (`banco-de-dados-sql`); preencha título, enunciados, alternativas, gabarito, feedback e fonte de estudo.
3. Cadastre a nova lista dentro do array `listas` em `data/catalogo.json`. O campo `arquivo` deve apontar para o JSON criado e `questoes` deve corresponder à quantidade de exercícios.
4. Rode `python scripts/validar_listas.py` e envie as alterações ao repositório. O catálogo passará a exibir a lista automaticamente.

**Não é necessário alterar `index.html`, `lista.html` ou `app.js` para criar novas listas.**

### Formato de cada questão

Cada exercício contém:

```json
{
  "id": 1,
  "tipo": "vf",
  "topico": "Dart e POO",
  "pergunta": "Uma classe representa um modelo para instâncias?",
  "opcoes": [
    {"texto": "Verdadeiro"},
    {"texto": "Falso", "porque": "Objeto é a instância; classe é o modelo."}
  ],
  "correta": 0,
  "acerto": "Classe define; objeto instancia.",
  "fonte": {
    "titulo": "Apostila — POO",
    "local": "Página 25 · Classes"
  }
}
```

- `tipo`: `vf`, `assercao`, `codigo`, `uml` ou `multipla`.
- `opcoes`: exatamente 2 (V/F) ou 5 (A–E), de acordo com o modelo. Cada opção **errada** deve ter um campo `porque` explicando brevemente o erro.
- `correta`: índice da alternativa correta **começando em 0**. Assim, `0` é A (ou Verdadeiro); `1` é B (ou Falso).
- `acerto`: explicação curta da correta (também mostrada depois de um erro).
- `fonte`: `titulo` e `local` são obrigatórios; o campo `url` é opcional para um link clicável.
- `codigo`: string contendo o exemplo Dart. Aparece num bloco formatado.
- `afirmativa` e `razao`: textos das asserções I e II. As cinco alternativas são as habituais da prova.
- `diagrama`: identificador de um dos diagramas declarados no objeto `diagramas` da lista. São desenhados na página com HTML/CSS.

**Convenção para asserção e razão:** A = ambas verdadeiras com justificativa; B = ambas verdadeiras sem justificativa; C = I verdadeira e II falsa; D = I falsa e II verdadeira; E = ambas falsas. Essa escala é a mesma utilizada na prova.

### Mudanças posteriores nas questões

O sistema salva respostas usando a chave da lista e a propriedade `versao`. Se você substituir as questões de uma lista de forma que o gabarito antigo deixe de fazer sentido, **aumente `versao` tanto no JSON da lista quanto no `catalogo.json`**. Assim, respostas antigas não serão aplicadas incorretamente à versão nova.

## Materiais utilizados na lista de Dart

A lista foi elaborada a partir dos quatro conjuntos de estudo fornecidos para a avaliação:

1. **`Apostila_Atendimento_Dart.pdf` (20 páginas):** classes, atributos, getters, construtores, encapsulamento, validações, coleções e estados.
2. **`uml(1).pdf` (71 páginas, Fundação Bradesco):** notação, classe, objeto, atributos, métodos, visibilidade, associações e multiplicidades.
3. **[persistencia_flutter](https://github.com/jeffersonspeck/persistencia_flutter)**: implementação de `Pessoa`, `DatabaseHelper` e SQLite, com README didático.
4. **[persistencia_flutter_firebase_RTDB](https://github.com/jeffersonspeck/persistencia_flutter_firebase_RTDB)**: `TodoItem`, `TodoRepository`, `FirebaseTodoRepository`, `Future`, `Stream` e operações no RTDB.

**Observação sobre PDFs:** para evitar republicar material de terceiros sem autorização, os PDFs não estão incluídos neste repositório. O aluno vê o **nome do documento e a página exata** em cada questão e utiliza a cópia da apostila disponibilizada pelo professor. Os links do GitHub levam diretamente a arquivos públicos dos projetos.

## Características técnicas

- Tudo roda no navegador; não há backend nem armazenamento de respostas no servidor.
- O progresso de cada lista é individual, mantido apenas naquele navegador/dispositivo. Limpar dados do navegador apaga esse progresso.
- O script `scripts/validar_listas.py` verifica IDs, quantidade de perguntas, gabaritos, alternativas, referências e justificativas de erros.
- Fontes tipográficas são carregadas do Google Fonts quando há internet; as fontes substitutas locais mantêm a página utilizável sem elas.
- Os exemplos de código são escritos para interpretação do comportamento do Dart, sem necessidade de executar Flutter.

---

**Uso:** apoio à revisão e preparação para avaliações de Programação Orientada a Objetos, persistência e UML.
