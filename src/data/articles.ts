import { Article, Series, CategoryColor } from "../types";

export const ARTICLES: Article[] = [
  {
    id: "generics-wildcards-pecs",
    title: "Generics: Dominando Wildcards e o Princípio PECS",
    category: "Generics",
    tags: ["generics", "clean-code", "java-advanced"],
    date: "2026-06-20",
    imageUrl: "https://picsum.photos/seed/generics/600/400",
    summary: "Entenda de uma vez por todas como funcionam as regras de covariância e contravariância no Java e escreva APIs genéricas flexíveis.",
    content: `
      <p>Generics foram introduzidos no Java 5 para trazer segurança de tipos em tempo de compilação. No entanto, o uso avançado de tipos genéricos com Wildcards (o famoso caractere coringa <code>?</code>) costuma ser um grande ponto de confusão.</p>
      
      <h3>O Problema da Invariância</h3>
      <p>Por padrão, os tipos genéricos em Java são <strong>invariantes</strong>. Isso significa que, embora <code>Integer</code> seja um subtipo de <code>Number</code>, uma <code>List&lt;Integer&gt;</code> <strong>não é</strong> uma <code>List&lt;Number&gt;</code>.</p>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="type">List</span>&lt;<span class="type">Integer</span>&gt; inteiros = <span class="keyword">new</span> <span class="type">ArrayList</span>&lt;&gt;();
<span class="comment">// List&lt;Number&gt; numeros = inteiros; // Erro de compilação!</span></code></pre>
      </div>
      
      <h3>Entendendo o PECS (Producer Extends, Consumer Super)</h3>
      <p>Para flexibilizar suas APIs de forma segura, o arquiteto Joshua Bloch definiu o acrônimo PECS no livro <em>Effective Java</em>:</p>
      
      <ul>
        <li><strong>Producer Extends (<code>? extends T</code>)</strong>: Se a sua estrutura genérica serve para produzir/fornecer dados para o seu código, use <code>extends</code>. Isso permite a leitura segura (Covariância).</li>
        <li><strong>Consumer Super (<code>? super T</code>)</strong>: Se a sua estrutura genérica serve para consumir/receber dados do seu código, use <code>super</code>. Isso permite a escrita segura (Contravariância).</li>
      </ul>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="comment">// Método produtor de dados (lê de 'fonte' e faz algo)</span>
<span class="keyword">public void</span> processarNumeros(<span class="type">List</span>&lt;<span class="keyword">? extends</span> <span class="type">Number</span>&gt; fonte) {
    <span class="keyword">for</span> (<span class="type">Number</span> n : fonte) { <span class="comment">// Leitura permitida</span>
        <span class="type">System</span>.out.println(n.doubleValue());
    }
    <span class="comment">// fonte.add(10); // Erro de compilação! Não podemos produzir para a lista.</span>
}

<span class="comment">// Método consumidor de dados (adiciona elementos na 'listaDestino')</span>
<span class="keyword">public void</span> adicionarNumeros(<span class="type">List</span>&lt;<span class="keyword">? super</span> <span class="type">Integer</span>&gt; listaDestino) {
    listaDestino.add(<span class="number">42</span>); <span class="comment">// Escrita permitida!</span>
    <span class="comment">// Object obj = listaDestino.get(0); // Só podemos ler como Object</span>
}</code></pre>
      </div>
    `
  },
  {
    id: "stream-api-operators",
    title: "Stream API: Operações Intermediárias vs. Terminais",
    category: "Streams",
    tags: ["streams", "lambdas", "functional"],
    date: "2026-06-18",
    imageUrl: "https://picsum.photos/seed/streams/600/400",
    summary: "Domine o processamento declarativo de coleções, Lazy Evaluation e saiba quando o fluxo é realmente executado.",
    content: `
      <p>A Stream API do Java 8 permite processar conjuntos de dados de forma declarativa. Para usá-la corretamente, é essencial distinguir os dois tipos de operações que compõem seu pipeline.</p>
      
      <h3>Operações Intermediárias (Lazy Evaluation)</h3>
      <p>Essas operações não processam os dados imediatamente. Elas apenas configuram um novo fluxo (Stream) de dados para ser avaliado no futuro de forma preguiçosa (<em>lazy</em>).</p>
      <ul>
        <li><code>filter(Predicate)</code>: filtra dados segundo um critério.</li>
        <li><code>map(Function)</code>: transforma cada elemento em outro tipo.</li>
        <li><code>flatMap(Function)</code>: unifica listas aninhadas em um único fluxo plano.</li>
      </ul>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="type">Stream</span>&lt;<span class="type">String</span>&gt; stream = nomes.stream()
    .filter(n -&gt; n.startsWith(<span class="string">"A"</span>)) <span class="comment">// Configura filtro</span>
    .map(<span class="type">String</span>::toUpperCase);      <span class="comment">// Configura caixa alta</span>
<span class="comment">// Nada foi executado ainda!</span></code></pre>
      </div>

      <h3>Operações Terminais (Eager Evaluation)</h3>
      <p>Ao invocar uma operação terminal, todo o pipeline é executado e o resultado final é produzido. Depois de executada, a Stream é fechada.</p>
      <ul>
        <li><code>collect()</code>: exporta o resultado para listas, mapas, etc.</li>
        <li><code>forEach()</code>: consome cada elemento aplicando uma ação.</li>
        <li><code>reduce()</code>: combina os elementos gerando um único valor final.</li>
      </ul>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="type">List</span>&lt;<span class="type">String</span>&gt; resultado = nomes.stream()
    .filter(n -&gt; n.length() &gt; <span class="number">4</span>)
    .map(<span class="type">String</span>::trim)
    .collect(<span class="type">Collectors</span>.toList()); <span class="comment">// Execução de todo o fluxo aqui!</span></code></pre>
      </div>
    `
  },
  {
    id: "java-records-immutability",
    title: "Java Records: Imutabilidade e Dados Concisos",
    category: "OOP",
    tags: ["oop", "records", "java16"],
    date: "2026-06-15",
    imageUrl: "https://picsum.photos/seed/records/600/400",
    summary: "Reduza drasticamente o boilerplate de classes DTO mantendo imutabilidade por padrão de forma limpa.",
    content: `
      <p>Antes do Java 14/16, criar uma classe de transporte de dados simples exigia dezenas de linhas de código boilerplate para definir getters, construtores, <code>equals</code>, <code>hashCode</code> e <code>toString</code>.</p>
      
      <h3>A Revolução dos Records</h3>
      <p>Os <strong>Records</strong> introduzem uma sintaxe ultra concisa para classes que servem apenas para carregar dados imutáveis:</p>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="keyword">public record</span> <span class="type">Produto</span>(<span class="type">String</span> nome, <span class="type">double</span> preco) {}</code></pre>
      </div>
      
      <p>O compilador Java gera automaticamente:</p>
      <ul>
        <li>Campos privados e <code>final</code> de forma transparente.</li>
        <li>Um construtor canônico completo.</li>
        <li>Métodos acessores de leitura sem o prefixo 'get' (ex: <code>produto.nome()</code>).</li>
        <li>Métodos estruturais <code>equals()</code>, <code>hashCode()</code> e <code>toString()</code>.</li>
      </ul>

      <h3>Construtores Compactos para Validação</h3>
      <p>Você pode validar os argumentos do record no momento da criação usando a sintaxe de construtor compacto:</p>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="keyword">public record</span> <span class="type">Produto</span>(<span class="type">String</span> nome, <span class="type">double</span> preco) {
    <span class="keyword">public</span> <span class="type">Produto</span> {
        <span class="keyword">if</span> (preco &lt; <span class="number">0</span>) {
            <span class="keyword">throw new</span> <span class="type">IllegalArgumentException</span>(<span class="string">"O preço não pode ser negativo!"</span>);
        }
    }
}</code></pre>
      </div>
    `
  },
  {
    id: "virtual-threads-loom",
    title: "Virtual Threads (Loom): Alta Escalabilidade na JVM",
    category: "Concurrency",
    tags: ["concurrency", "loom", "java21"],
    date: "2026-06-10",
    imageUrl: "https://picsum.photos/seed/loom/600/400",
    youtubeId: "UVo6n9U_b04",
    summary: "Entenda como o Java 21 revolucionou o processamento concorrente com threads de peso-mosca gerenciadas pela JVM (vídeo incluso).",
    content: `
      <p>Historicamente, cada Thread do Java mapeava diretamente para uma Thread cara do Sistema Operacional (OS). Isso limitava o número total de threads ativas a poucas milhares.</p>
      
      <h3>O que são Virtual Threads?</h3>
      <p>Virtual Threads (Projeto Loom) são threads extremamente leves gerenciadas pela própria JVM e não pelo OS. Milhares de Virtual Threads rodam no topo de um pool pequeno de threads de hardware (Carrier Threads).</p>
      
      <p>Quando uma Virtual Thread inicia um bloqueio de I/O (ex: chamada HTTP ou consulta ao Banco de Dados), a JVM \"desmolda\" a thread virtual, permitindo que a thread física execute outras tarefas imediatamente. Isso elimina gargalos de I/O de forma mágica!</p>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="comment">// Criando e iniciando uma Virtual Thread simples</span>
<span class="type">Thread</span> vThread = <span class="type">Thread</span>.ofVirtual().start(() -&gt; {
    <span class="type">System</span>.out.println(<span class="string">"Rodando em uma thread virtual ultra-leve!"</span>);
});

<span class="comment">// Usando um Executor moderno para milhares de requisições de I/O</span>
<span class="keyword">try</span> (<span class="type">var</span> executor = <span class="type">Executors</span>.newVirtualThreadPerTaskExecutor()) {
    <span class="type">IntStream</span>.range(<span class="number">0</span>, <span class="number">100_000</span>).forEach(i -&gt; {
        executor.submit(() -&gt; {
            <span class="type">Thread</span>.sleep(<span class="type">Duration</span>.ofMillis(<span class="number">100</span>)); <span class="comment">// Bloqueio não afeta OS</span>
            <span class="keyword">return</span> i;
        });
    });
} <span class="comment">// Auto-close aguarda a conclusão de todos de forma eficiente</span></code></pre>
      </div>
    `
  },
  {
    id: "spring-boot-3",
    title: "Spring Boot 3: APIs REST Concorrentes e Arquitetura",
    category: "Spring",
    tags: ["spring", "spring-boot", "apis"],
    date: "2026-06-07",
    imageUrl: "https://picsum.photos/seed/spring/600/400",
    youtubeId: "sbPSjI9a_HY",
    summary: "Aprenda a estruturar e rodar uma API REST ultra-rápida com Spring Boot 3, Tomcat embutido e o JDK 21 (vídeo tutorial incluso).",
    content: `
      <p>O Spring Boot simplificou drasticamente o desenvolvimento de aplicações Java empresariais eliminando configurações XML complexas e fornecendo dependências auto-configuráveis prontas para uso.</p>
      
      <h3>Criando seu Primeiro REST Controller</h3>
      <p>Veja como é extremamente direto expor um endpoint JSON com Spring Boot moderno:</p>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="annotation">@RestController</span>
<span class="annotation">@RequestMapping</span>(<span class="string">"/api/v1/produtos"</span>)
<span class="keyword">public class</span> <span class="type">ProdutoController</span> {

    <span class="annotation">@GetMapping</span>
    <span class="keyword">public</span> <span class="type">List</span>&lt;<span class="type">Produto</span>&gt; listar() {
        <span class="keyword">return</span> <span class="type">List</span>.of(
            <span class="keyword">new</span> <span class="type">Produto</span>(<span class="string">"Teclado Mecânico"</span>, <span class="number">349.90</span>),
            <span class="keyword">new</span> <span class="type">Produto</span>(<span class="string">"Mouse Gamer"</span>, <span class="number">199.00</span>)
        );
    }
}</code></pre>
      </div>

      <h3>Vantagens de Spring Boot Moderno</h3>
      <ul>
        <li><strong>Servidor Embutido:</strong> Não requer configurar Tomcat externo. Basta rodar o jar compilado.</li>
        <li><strong>Spring Boot Starters:</strong> Dependências agregadas que facilitam a importação de bibliotecas de banco, filas e segurança.</li>
        <li><strong>GraalVM Native Image:</strong> Suporte nativo para compilar sua API em binário de máquina de inicialização instantânea e baixo uso de memória.</li>
      </ul>
    `
  },
  {
    id: "sealed-classes-pattern-matching",
    title: "Sealed Classes: Controle de Herança e Pattern Matching",
    category: "OOP",
    tags: ["oop", "sealed", "java17"],
    date: "2026-06-08",
    summary: "Saiba como restringir quais subclasses podem estender suas classes ou interfaces, trazendo mais robustez ao código.",
    content: `
      <p>Até o Java 15, a herança era aberta (qualquer classe podia estender uma classe não-final) ou fechada (usando <code>final</code>).</p>
      
      <h3>Sintaxe de Sealed Classes</h3>
      <p>Com o modificador <code>sealed</code> e a palavra-chave <code>permits</code>, você declara quais subclasses têm permissão explícita para estender ou implementar sua estrutura:</p>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="keyword">public sealed interface</span> <span class="type">Forma</span> <span class="keyword">permits</span> <span class="type">Circulo</span>, <span class="type">Quadrado</span> {}</code></pre>
      </div>

      <p>Cada subclasse permitida deve declarar seu próprio comportamento de herança usando um destes modificadores:</p>
      <ul>
        <li><code>final</code>: impede novas subclasses.</li>
        <li><code>non-sealed</code>: abre novamente a classe para qualquer herança.</li>
        <li><code>sealed</code>: restringe a herança apenas a um grupo específico.</li>
      </ul>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="keyword">public final class</span> <span class="type">Circulo</span> <span class="keyword">implements</span> <span class="type">Forma</span> {}
<span class="keyword">public final class</span> <span class="type">Quadrado</span> <span class="keyword">implements</span> <span class="type">Forma</span> {}</code></pre>
      </div>

      <h3>Exaustividade em Switch (Java 21)</h3>
      <p>Sealed classes brilham no uso de switch expressions. O compilador garante de forma estática que todos os tipos possíveis foram cobertos, dispensando a necessidade de um caso <code>default</code>!</p>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="keyword">public double</span> obterArea(<span class="type">Forma</span> f) {
    <span class="keyword">return switch</span> (f) {
        <span class="keyword">case</span> <span class="type">Circulo</span> c -&gt; <span class="number">3.14</span>;
        <span class="keyword">case</span> <span class="type">Quadrado</span> q -&gt; <span class="number">1.0</span>;
        <span class="comment">// Sem default! Se uma nova classe for permitida na interface,</span>
        <span class="comment">// o compilador nos alertará instantaneamente sobre a falta dela.</span>
    };
}</code></pre>
      </div>
    `
  },
  {
    id: "optional-api-best-practices",
    title: "Optional API: Como Evitar o NullPointerException Corretamente",
    category: "Misc",
    tags: ["clean-code", "optional", "null-safety"],
    date: "2026-06-05",
    imageUrl: "https://picsum.photos/seed/optional/600/400",
    summary: "Evite anti-padrões comuns da Optional API do Java e aprenda a escrever fallbacks de forma declarativa e limpa.",
    content: `
      <p>O <code>java.util.Optional&lt;T&gt;</code> foi criado no Java 8 para representar a possibilidade da ausência de um valor, reduzindo a necessidade de validações nulas e evitando o famoso <code>NullPointerException</code>.</p>
      
      <h3>Anti-padrão: O uso de .get() sem validação</h3>
      <p>Muitos desenvolvedores tratam Optional como uma validação comum de 'if-else', caindo no erro de usar o método <code>get()</code> diretamente, o que pode lançar exceções indesejadas:</p>
      
      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="comment">// ❌ EVITE ESTE ESTILO!</span>
<span class="type">Optional</span>&lt;<span class="type">User</span>&gt; optUser = findUser();
<span class="keyword">if</span> (optUser.isPresent()) {
    <span class="type">User</span> u = optUser.get();
}</code></pre>
      </div>

      <h3>Práticas Recomendadas: Programação Declarativa</h3>
      <p>Utilize métodos que resolvem o fallback diretamente em uma única linha legível:</p>

      <h4>1. orElse vs orElseGet</h4>
      <p>O método <code>orElseGet</code> é <em>lazy</em> e só executa a lógica se o valor estiver nulo, enquanto o <code>orElse</code> sempre instancia o argumento padrão mesmo com o valor presente:</p>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="comment">// ✅ Perfeito para fallbacks simples</span>
<span class="type">String</span> nome = optNome.orElse(<span class="string">"Usuário Padrão"</span>);

<span class="comment">// ✅ orElseGet: Ideal quando a criação do objeto padrão é custosa</span>
<span class="type">User</span> user = optUser.orElseGet(() -&gt; carregarDoBancoDeDados());</code></pre>
      </div>

      <h4>2. Mapeamento e Encadeamento com map e flatMap</h4>
      <p>Você pode extrair dados internos sem receio de nulos encadeando operadores:</p>

      <div class="code-container">
        <div class="code-header"><span>Java</span></div>
        <pre><code><span class="comment">// Retorna a cidade de forma segura, tratando nulos em todo o caminho</span>
<span class="type">String</span> cidade = optUser
    .map(<span class="type">User</span>::getEndereco)
    .map(<span class="type">Endereco</span>::getCidade)
    .orElse(<span class="string">"Não Informada"</span>);</code></pre>
      </div>
    `
  }
];

export const SERIES: Series[] = [
  {
    id: "java-core-series",
    name: "Trilha Dominando o Core do Java Moderno",
    description: "Aprenda recursos cruciais do Java moderno que elevam a qualidade do código de legibilidade a segurança de tipos.",
    articles: ["generics-wildcards-pecs", "java-records-immutability", "sealed-classes-pattern-matching"]
  },
  {
    id: "java-functional-series",
    name: "Trilha Programação Funcional Prática",
    description: "Entenda o paradigma funcional no Java, otimizando fluxos de dados e mitigando erros de referência nula.",
    articles: ["stream-api-operators", "optional-api-best-practices"]
  }
];

export const ENRICHMENTS: Record<string, { seriesId?: string; changelog?: { date: string; version: string; author: string; changes: string }[] }> = {
  "generics-wildcards-pecs": {
    seriesId: "java-core-series",
    changelog: [
      { date: "2026-06-20", version: "Java 21", author: "Equipe Java Base", changes: "Lançamento inicial do guia prático de Generics e PECS." },
      { date: "2026-06-21", version: "Java 21", author: "Equipe Java Base", changes: "Melhoria dos exemplos teóricos sobre covariância." }
    ]
  },
  "stream-api-operators": {
    seriesId: "java-functional-series",
    changelog: [
      { date: "2026-06-18", version: "Java 8", author: "Equipe Java Base", changes: "Guia completo de Lazy Evaluation e pipelines de processamento." }
    ]
  },
  "java-records-immutability": {
    seriesId: "java-core-series",
    changelog: [
      { date: "2026-06-15", version: "Java 16", author: "Equipe Java Base", changes: "Demonstração de construtores compactos e imutabilidade de records." }
    ]
  },
  "virtual-threads-loom": {
    seriesId: "java-concurrency-series",
    changelog: [
      { date: "2026-06-10", version: "Java 21", author: "Equipe Java Base", changes: "Revisão detalhada do Projeto Loom com exemplos de Carrier Threads." }
    ]
  },
  "spring-boot-3": {
    changelog: [
      { date: "2026-06-07", version: "Spring Boot 3", author: "Equipe Java Base", changes: "Configuração inicial de REST controller com Tomcat embutido." }
    ]
  },
  "sealed-classes-pattern-matching": {
    seriesId: "java-core-series",
    changelog: [
      { date: "2026-06-08", version: "Java 17", author: "Equipe Java Base", changes: "Exemplos práticos de exaustividade de Switch Expressions." }
    ]
  },
  "optional-api-best-practices": {
    seriesId: "java-functional-series",
    changelog: [
      { date: "2026-06-05", version: "Java 8", author: "Equipe Java Base", changes: "Guia completo sobre anti-padrões comuns com Optional.get()." }
    ]
  }
};

// Apply enrichments to articles programmatically at initialization
ARTICLES.forEach(art => {
  const data = ENRICHMENTS[art.id];
  if (data) {
    art.seriesId = data.seriesId || null;
    art.changelog = data.changelog || [];
  } else {
    art.seriesId = null;
    art.changelog = [];
  }
});

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  "Collections": { bg: "#f3e8ff", text: "#7c3aed", border: "rgba(124, 58, 237, 0.15)" },
  "Streams": { bg: "#e8f5e9", text: "#1b5e20", border: "rgba(27, 94, 32, 0.15)" },
  "Concurrency": { bg: "#fff3e0", text: "#e65100", border: "rgba(230, 81, 0, 0.15)" },
  "Spring": { bg: "#f1f8e9", text: "#33691e", border: "rgba(51, 105, 30, 0.15)" },
  "OOP": { bg: "#f3e5f5", text: "#4a148c", border: "rgba(74, 20, 140, 0.15)" },
  "Generics": { bg: "#fffde7", text: "#f57f17", border: "rgba(245, 127, 23, 0.15)" },
  "JVM": { bg: "#efebe9", text: "#4e342e", border: "rgba(78, 52, 46, 0.15)" },
  "Misc": { bg: "#f5f5f7", text: "#6e6e73", border: "rgba(110, 110, 115, 0.15)" }
};

export const SNIPPETS_DATA = [
  {
    title: "HTTP Client (Java 11)",
    description: "Envio de requisição GET simples e assíncrona utilizando o HttpClient moderno.",
    code: `HttpClient client = HttpClient.newHttpClient();\nHttpRequest request = HttpRequest.newBuilder()\n    .uri(URI.create("https://api.github.com"))\n    .header("Accept", "application/json")\n    .build();\n\nclient.sendAsync(request, BodyHandlers.ofString())\n    .thenApply(HttpResponse::body)\n    .thenAccept(System.out::println)\n    .join();`
  },
  {
    title: "List.of() Imutável (Java 9)",
    description: "Criação de coleções estáticas imutáveis de forma concisa.",
    code: `List<String> fruits = List.of("Apple", "Banana", "Orange");\n// fruits.add("Grape"); // Lança UnsupportedOperationException`
  },
  {
    title: "Pattern Matching instanceof (Java 16)",
    description: "Verificação de tipo e cast automático em uma única expressão.",
    code: `if (obj instanceof String s) {\n    System.out.println("String com tamanho: " + s.length());\n} else {\n    System.out.println("Não é uma String");\n}`
  },
  {
    title: "Record Imutável (Java 16)",
    description: "Definição compacta de classe portadora de dados imutável com equals, hashCode e toString auto-gerados.",
    code: `public record User(String name, int age) {\n    // Construtor compacto para validações\n    public User {\n        if (age < 0) throw new IllegalArgumentException("Age negative");\n    }\n}`
  }
];
