(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const d of n.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function o(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=o(a);fetch(a.href,n)}})();const h=[{id:"generics-wildcards-pecs",title:"Generics: Dominando Wildcards e o Princípio PECS",category:"Generics",tags:["generics","clean-code","java-advanced"],date:"2026-06-20",imageUrl:"https://picsum.photos/seed/generics/600/400",summary:"Entenda de uma vez por todas como funcionam as regras de covariância e contravariância no Java e escreva APIs genéricas flexíveis.",content:`
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
    `},{id:"stream-api-operators",title:"Stream API: Operações Intermediárias vs. Terminais",category:"Streams",tags:["streams","lambdas","functional"],date:"2026-06-18",imageUrl:"https://picsum.photos/seed/streams/600/400",summary:"Domine o processamento declarativo de coleções, Lazy Evaluation e saiba quando o fluxo é realmente executado.",content:`
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
    `},{id:"java-records-immutability",title:"Java Records: Imutabilidade e Dados Concisos",category:"OOP",tags:["oop","records","java16"],date:"2026-06-15",imageUrl:"https://picsum.photos/seed/records/600/400",summary:"Reduza drasticamente o boilerplate de classes DTO mantendo imutabilidade por padrão de forma limpa.",content:`
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
    `},{id:"virtual-threads-loom",title:"Virtual Threads (Loom): Alta Escalabilidade na JVM",category:"Concurrency",tags:["concurrency","loom","java21"],date:"2026-06-10",imageUrl:"https://picsum.photos/seed/loom/600/400",youtubeId:"UVo6n9U_b04",summary:"Entenda como o Java 21 revolucionou o processamento concorrente com threads de peso-mosca gerenciadas pela JVM (vídeo incluso).",content:`
      <p>Historicamente, cada Thread do Java mapeava diretamente para uma Thread cara do Sistema Operacional (OS). Isso limitava o número total de threads ativas a poucas milhares.</p>
      
      <h3>O que são Virtual Threads?</h3>
      <p>Virtual Threads (Projeto Loom) são threads extremamente leves gerenciadas pela própria JVM e não pelo OS. Milhares de Virtual Threads rodam no topo de um pool pequeno de threads de hardware (Carrier Threads).</p>
      
      <p>Quando uma Virtual Thread inicia um bloqueio de I/O (ex: chamada HTTP ou consulta ao Banco de Dados), a JVM "desmolda" a thread virtual, permitindo que a thread física execute outras tarefas imediatamente. Isso elimina gargalos de I/O de forma mágica!</p>

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
    `},{id:"spring-boot-3",title:"Spring Boot 3: APIs REST Concorrentes e Arquitetura",category:"Spring",tags:["spring","spring-boot","apis"],date:"2026-06-07",imageUrl:"https://picsum.photos/seed/spring/600/400",youtubeId:"sbPSjI9a_HY",summary:"Aprenda a estruturar e rodar uma API REST ultra-rápida com Spring Boot 3, Tomcat embutido e o JDK 21 (vídeo tutorial incluso).",content:`
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
    `},{id:"sealed-classes-pattern-matching",title:"Sealed Classes: Controle de Herança e Pattern Matching",category:"OOP",tags:["oop","sealed","java17"],date:"2026-06-08",summary:"Saiba como restringir quais subclasses podem estender suas classes ou interfaces, trazendo mais robustez ao código.",content:`
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
    `},{id:"optional-api-best-practices",title:"Optional API: Como Evitar o NullPointerException Corretamente",category:"Misc",tags:["clean-code","optional","null-safety"],date:"2026-06-05",imageUrl:"https://picsum.photos/seed/optional/600/400",summary:"Evite anti-padrões comuns da Optional API do Java e aprenda a escrever fallbacks de forma declarativa e limpa.",content:`
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
    `}],P=[{id:"java-core-series",name:"Trilha Dominando o Core do Java Moderno",description:"Aprenda recursos cruciais do Java moderno que elevam a qualidade do código de legibilidade a segurança de tipos.",articles:["generics-wildcards-pecs","java-records-immutability","sealed-classes-pattern-matching"]},{id:"java-functional-series",name:"Trilha Programação Funcional Prática",description:"Entenda o paradigma funcional no Java, otimizando fluxos de dados e mitigando erros de referência nula.",articles:["stream-api-operators","optional-api-best-practices"]}],D={"generics-wildcards-pecs":{seriesId:"java-core-series",changelog:[{date:"2026-06-20",version:"Java 21",author:"Equipe Java Base",changes:"Lançamento inicial do guia prático de Generics e PECS."},{date:"2026-06-21",version:"Java 21",author:"Equipe Java Base",changes:"Melhoria dos exemplos teóricos sobre covariância."}]},"stream-api-operators":{seriesId:"java-functional-series",changelog:[{date:"2026-06-18",version:"Java 8",author:"Equipe Java Base",changes:"Guia completo de Lazy Evaluation e pipelines de processamento."}]},"java-records-immutability":{seriesId:"java-core-series",changelog:[{date:"2026-06-15",version:"Java 16",author:"Equipe Java Base",changes:"Demonstração de construtores compactos e imutabilidade de records."}]},"virtual-threads-loom":{seriesId:"java-concurrency-series",changelog:[{date:"2026-06-10",version:"Java 21",author:"Equipe Java Base",changes:"Revisão detalhada do Projeto Loom com exemplos de Carrier Threads."}]},"spring-boot-3":{changelog:[{date:"2026-06-07",version:"Spring Boot 3",author:"Equipe Java Base",changes:"Configuração inicial de REST controller com Tomcat embutido."}]},"sealed-classes-pattern-matching":{seriesId:"java-core-series",changelog:[{date:"2026-06-08",version:"Java 17",author:"Equipe Java Base",changes:"Exemplos práticos de exaustividade de Switch Expressions."}]},"optional-api-best-practices":{seriesId:"java-functional-series",changelog:[{date:"2026-06-05",version:"Java 8",author:"Equipe Java Base",changes:"Guia completo sobre anti-padrões comuns com Optional.get()."}]}};h.forEach(e=>{const t=D[e.id];t?(e.seriesId=t.seriesId||null,e.changelog=t.changelog||[]):(e.seriesId=null,e.changelog=[])});const I={Collections:{bg:"#f3e8ff",text:"#7c3aed",border:"rgba(124, 58, 237, 0.15)"},Streams:{bg:"#e8f5e9",text:"#1b5e20",border:"rgba(27, 94, 32, 0.15)"},Concurrency:{bg:"#fff3e0",text:"#e65100",border:"rgba(230, 81, 0, 0.15)"},Spring:{bg:"#f1f8e9",text:"#33691e",border:"rgba(51, 105, 30, 0.15)"},OOP:{bg:"#f3e5f5",text:"#4a148c",border:"rgba(74, 20, 140, 0.15)"},Generics:{bg:"#fffde7",text:"#f57f17",border:"rgba(245, 127, 23, 0.15)"},JVM:{bg:"#efebe9",text:"#4e342e",border:"rgba(78, 52, 46, 0.15)"},Misc:{bg:"#f5f5f7",text:"#6e6e73",border:"rgba(110, 110, 115, 0.15)"}},V=[{title:"HTTP Client (Java 11)",description:"Envio de requisição GET simples e assíncrona utilizando o HttpClient moderno.",code:`HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.github.com"))
    .header("Accept", "application/json")
    .build();

client.sendAsync(request, BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println)
    .join();`},{title:"List.of() Imutável (Java 9)",description:"Criação de coleções estáticas imutáveis de forma concisa.",code:`List<String> fruits = List.of("Apple", "Banana", "Orange");
// fruits.add("Grape"); // Lança UnsupportedOperationException`},{title:"Pattern Matching instanceof (Java 16)",description:"Verificação de tipo e cast automático em uma única expressão.",code:`if (obj instanceof String s) {
    System.out.println("String com tamanho: " + s.length());
} else {
    System.out.println("Não é uma String");
}`},{title:"Record Imutável (Java 16)",description:"Definição compacta de classe portadora de dados imutável com equals, hashCode e toString auto-gerados.",code:`public record User(String name, int age) {
    // Construtor compacto para validações
    public User {
        if (age < 0) throw new IllegalArgumentException("Age negative");
    }
}`}],r={activeCategory:"Todos",searchQuery:"",selectedArticleId:null,searchMode:"articles",activeView:"articles",recentArticles:[],drawerOpen:!1,accessCount:{articles:{},dicas:{}}};function H(){try{sessionStorage.setItem("kb_access_articles",JSON.stringify(r.accessCount.articles)),sessionStorage.setItem("kb_access_dicas",JSON.stringify(r.accessCount.dicas))}catch(e){console.error("Erro ao salvar contagens de popularidade no sessionStorage:",e)}}function q(){try{const e=sessionStorage.getItem("kb_access_articles");e&&(r.accessCount.articles=JSON.parse(e));const t=sessionStorage.getItem("kb_access_dicas");t&&(r.accessCount.dicas=JSON.parse(t))}catch(e){console.error("Erro ao carregar contagens de popularidade do sessionStorage:",e)}try{const e=localStorage.getItem("java-kb-recent");e&&(r.recentArticles=JSON.parse(e))}catch(e){console.error("Erro ao carregar histórico recente do localStorage:",e)}}function B(e){const t=e.split("-");if(t.length!==3)return e;const o=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"],s=t[2],a=parseInt(t[1],10)-1,n=t[0];return`${s} de ${o[a]}, ${n}`}function C(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}function N(e,t){let o=null;return function(...s){o!==null&&clearTimeout(o),o=setTimeout(()=>e.apply(this,s),t)}}function O(e,t){return[...e].sort((o,s)=>{const a=t[o.id]||0,n=t[s.id]||0;if(n!==a)return n-a;const d=new Date(o.date||o.lastUpdated||0).getTime();return new Date(s.date||s.lastUpdated||0).getTime()-d})}function z(e,t){if(!t)return"";const o=document.createElement("div");o.innerHTML=e;const s=Array.from(o.querySelectorAll(".code-container pre code, pre code, code"));for(const n of s){const d=n.textContent||"";if(d.toLowerCase().indexOf(t)!==-1){const l=d.split(`
`).find(i=>i.toLowerCase().includes(t));if(l){const i=l.toLowerCase().indexOf(t),m=l.substring(0,i),y=l.substring(i,i+t.length),f=l.substring(i+t.length);return`
          <div class="code-container" style="margin-top: 8px; border: 1px solid var(--accent); background-color: var(--bg-secondary);">
            <div class="code-header" style="padding: 2px 8px; font-size:10px;"><span>Trecho de código correspondente</span></div>
            <pre style="margin:0; padding:8px 12px;"><code style="font-size: 11px; white-space: pre-wrap;">${C(m)}<mark style="background-color: #ffd166; color: #000; border-radius: 2px; padding: 0 2px; font-weight:600;">${C(y)}</mark>${C(f)}</code></pre>
          </div>
        `}}}const a=Array.from(o.querySelectorAll("p, h3, h4, li"));for(const n of a){const d=n.textContent||"",p=d.toLowerCase().indexOf(t);if(p!==-1){const c=Math.max(0,p-60),l=Math.min(d.length,p+t.length+80);let i=d.substring(c,l).replace(/\s+/g," ");c>0&&(i="..."+i),l<d.length&&(i=i+"...");const m=i.toLowerCase().indexOf(t);if(m!==-1){const y=i.substring(0,m),f=i.substring(m,m+t.length),v=i.substring(m+t.length);return`
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">
            ${C(y)}<mark style="background-color: #ffd166; color: #000; border-radius: 2px; padding: 0 2px; font-weight:600;">${C(f)}</mark>${C(v)}
          </p>
        `}}}return""}window.state=r;function J(){r.activeView==="cheatsheet"?window.openCheatsheet(r.activeCategory||"Todos"):r.activeView==="snippets"?window.openSnippets():T()}function j(){const e=document.getElementById("search-input"),t=document.getElementById("search-clear-btn"),o=s=>{r.searchQuery=s,e&&e.value!==s&&(e.value=s),r.searchQuery.trim()!==""?(t&&t.classList.remove("hidden"),r.selectedArticleId!==null&&window.closeArticle()):t&&t.classList.add("hidden"),J()};e&&e.addEventListener("input",s=>{const a=s.target;o(a.value)})}window.selectCategory=function(e){r.activeCategory=e,r.selectedArticleId=null,r.searchQuery="";const t=document.getElementById("search-input"),o=document.getElementById("search-clear-btn");t&&(t.value=""),o&&o.classList.add("hidden");const s=document.getElementById("article-view"),a=document.getElementById("home-view"),n=document.getElementById("mobile-categories"),d=document.getElementById("cheatsheet-view"),p=document.getElementById("snippets-view");s&&s.classList.add("hidden"),d&&d.classList.add("hidden"),p&&p.classList.add("hidden"),a&&a.classList.remove("hidden"),n&&n.classList.remove("hidden");const c=document.getElementById("nav-btn-cheatsheets");c&&c.classList.remove("active"),A(),k(),T(),window.scrollTo({top:0,behavior:"smooth"})};window.clearSearch=function(){r.searchQuery="";const e=document.getElementById("search-input"),t=document.getElementById("search-clear-btn");e&&(e.value=""),t&&t.classList.add("hidden"),J()};function A(){const e=document.getElementById("sidebar-categories");if(!e)return;e.innerHTML="";const t=document.createElement("li");t.className=`category-item ${r.activeCategory==="Todos"?"active":""}`,t.innerHTML="<span>Todos os Artigos</span>",t.onclick=()=>window.selectCategory("Todos"),e.appendChild(t);const o=document.createElement("div");o.className="sidebar-divider",e.appendChild(o);const s=c=>{const l=document.createElement("li");return l.className=`category-item ${r.activeCategory===c?"active":""}`,l.style.display="flex",l.style.justifyContent="space-between",l.style.alignItems="center",l.style.position="relative",l.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${c}</span>
      </div>
      <button class="cheatsheet-link" title="Ver Dicas" style="background: none; border: none; padding: 2px 6px; font-size: 11px; font-weight: 600; color: var(--accent); cursor: pointer; opacity: 0; transition: opacity 0.2s; white-space: nowrap;" onclick="event.stopPropagation(); window.openCheatsheet('${c}')">
        Dicas ⚡
      </button>
    `,l.addEventListener("mouseenter",()=>{const i=l.querySelector(".cheatsheet-link");i&&(i.style.opacity="1")}),l.addEventListener("mouseleave",()=>{const i=l.querySelector(".cheatsheet-link");i&&(i.style.opacity="0")}),l.onclick=()=>window.selectCategory(c),l},a=document.createElement("p");a.className="menu-section-title",a.textContent="Core Concepts",e.appendChild(a),["Generics","Streams","Collections","OOP"].forEach(c=>{e.appendChild(s(c))});const d=document.createElement("p");d.className="menu-section-title",d.textContent="Advanced",e.appendChild(d),["Concurrency","JVM","Spring","Misc"].forEach(c=>{e.appendChild(s(c))})}function k(){const e=document.getElementById("mobile-categories");if(!e)return;e.innerHTML="";const t=document.createElement("button");t.className=`mobile-cat-btn ${r.activeCategory==="Todos"?"active":""}`,t.textContent=`Todos (${h.length})`,t.onclick=()=>window.selectCategory("Todos"),e.appendChild(t),["Collections","Streams","Concurrency","Spring","OOP","Generics","JVM","Misc"].forEach(s=>{const a=h.filter(d=>d.category===s).length,n=document.createElement("button");n.className=`mobile-cat-btn ${r.activeCategory===s?"active":""}`,n.textContent=`${s} (${a})`,n.onclick=()=>window.selectCategory(s),e.appendChild(n)})}function T(){const e=document.getElementById("articles-grid"),t=document.getElementById("empty-state"),o=document.getElementById("filter-status-bar");if(!e||!t||!o)return;let s=O(h,r.accessCount.articles);r.activeCategory!=="Todos"&&(s=s.filter(i=>i.category===r.activeCategory));const a=r.searchQuery.trim().toLowerCase(),n=a!=="",d=document.querySelector(".home-hero-banner"),p=document.getElementById("home-intro-card"),c=document.getElementById("recent-articles-section"),l=document.getElementById("home-series-section");if(r.activeCategory==="Todos"&&!n?(d&&(d.style.display="block"),p&&(p.style.display="block")):(d&&(d.style.display="none"),p&&(p.style.display="none")),n||r.activeCategory!=="Todos"?(c&&(c.style.display="none"),l&&(l.style.display="none")):(c&&(c.style.display=""),l&&(l.style.display="")),n?(s=s.filter(i=>{const m=i.title.toLowerCase().includes(a),y=i.summary.toLowerCase().includes(a),f=i.content.toLowerCase().includes(a),v=i.tags.some(x=>x.toLowerCase().includes(a));return m||y||f||v}),o.innerHTML=`
      <span>Encontrado(s) <strong style="color:var(--text-primary);">${s.length}</strong> artigo(s) ${r.activeCategory!=="Todos"?`na categoria <strong style="color:var(--text-primary);">${r.activeCategory}</strong>`:""} para a busca: <strong style="color:var(--accent);">${r.searchQuery}</strong></span>
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
        ${r.activeCategory!=="Todos"?`<span class="clear-filter-link" onclick="window.openCheatsheet('${r.activeCategory}')" style="color: var(--accent); font-weight: 600;">⚡ Ver Cheatsheet</span>`:""}
        <span class="clear-filter-link" onclick="window.clearSearch()">Limpar Busca</span>
      </div>
    `,e.style.display="flex",e.style.flexDirection="column",e.style.gap="16px"):(e.style.display="",e.style.flexDirection="",e.style.gap="",r.activeCategory!=="Todos"?o.innerHTML=`
        <span>Categoria ativa: <strong style="color:var(--text-primary);">${r.activeCategory}</strong> (<strong style="color:var(--accent);">${s.length}</strong> artigos)</span>
        <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
          <span class="clear-filter-link" onclick="window.openCheatsheet('${r.activeCategory}')" style="color: var(--accent); font-weight: 600;">⚡ Ver Dicas</span>
          <span class="clear-filter-link" onclick="window.selectCategory('Todos')">Ver todos</span>
        </div>
      `:o.innerHTML=`<span>Exibindo todos os <strong style="color:var(--accent);">${h.length}</strong> artigos disponíveis</span>`),e.innerHTML="",s.length===0){e.classList.add("hidden"),t.classList.remove("hidden");const i=document.getElementById("empty-search-term");i&&(i.textContent=r.searchQuery)}else t.classList.add("hidden"),e.classList.remove("hidden"),s.forEach(i=>{if(n){const m=document.createElement("div");m.className="search-result-item",m.style.backgroundColor="var(--bg-card)",m.style.border="1px solid var(--border-color)",m.style.borderRadius="14px",m.style.padding="20px",m.style.cursor="pointer",m.style.transition="transform 0.15s, border-color 0.15s",m.onmouseenter=()=>{m.style.transform="translateY(-2px)",m.style.borderColor="var(--accent)"},m.onmouseleave=()=>{m.style.transform="none",m.style.borderColor="var(--border-color)"};const y=z(i.content,a)||`
          <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-top: 6px;">${C(i.summary)}</p>
        `,f=I[i.category]||I.Misc,v=B(i.date),x=i.tags.map(g=>`<span class="tag">#${g}</span>`).join(" ");m.innerHTML=`
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge" style="background-color: ${f.bg}; color: ${f.text}; border: 1px solid ${f.border}; margin:0;">
                ${i.category}
              </span>
              <span style="font-size:11px; color:var(--text-tertiary); font-weight:500;">${v}</span>
            </div>
            <div class="tags-container" style="margin:0;">${x}</div>
          </div>
          <h3 style="font-size:16px; font-weight:700; color:var(--text-primary); margin:0; line-height:1.4;">${i.title}</h3>
          <div style="margin-top:10px;">
            ${y}
          </div>
        `,m.onclick=()=>window.openArticle(i.id),e.appendChild(m)}else{const m=document.createElement("div");m.className="card",m.style.position="relative";const y=I[i.category]||I.Misc,f=B(i.date),v=i.tags.map(g=>`<span class="tag">#${g}</span>`).join(""),x=i.imageUrl?`
          <div class="card-image-wrapper">
            <img src="${i.imageUrl}" alt="${i.title}" class="card-image" loading="lazy" referrerPolicy="no-referrer" />
          </div>
        `:"";m.innerHTML=`
          ${x}
          <div style="display: flex; flex-direction: column; justify-content: space-between; flex-grow: 1;">
            <div>
              <div class="card-header">
                <span class="badge" style="background-color: ${y.bg}; color: ${y.text}; border: 1px solid ${y.border};">
                  ${i.category}
                </span>
                <span class="card-date">${f}</span>
              </div>
              <h2 class="card-title">${i.title}</h2>
              <p class="card-summary">${i.summary}</p>
            </div>
            <div class="card-footer" style="margin-top: 16px;">
              <div class="tags-container">${v}</div>
              <span class="read-link">
                Ler artigo completo 
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                  <path d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.751.751 0 0 1 0 1.06l-4.25 4.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06Z"/>
                </svg>
              </span>
            </div>
          </div>
        `,m.onclick=()=>window.openArticle(i.id),e.appendChild(m)}})}window.openArticle=function(e){r.selectedArticleId=e;const t=h.find(w=>w.id===e);if(!t)return;try{r.accessCount.articles[e]=(r.accessCount.articles[e]||0)+1,H()}catch(w){console.error("Erro ao registrar estatística do artigo:",w)}const o=document.getElementById("home-view"),s=document.getElementById("mobile-categories"),a=document.getElementById("article-view"),n=document.getElementById("cheatsheet-view"),d=document.getElementById("snippets-view");o&&o.classList.add("hidden"),s&&s.classList.add("hidden"),n&&n.classList.add("hidden"),d&&d.classList.add("hidden"),a&&a.classList.remove("hidden"),window.scrollTo({top:0,behavior:"smooth"});const p=I[t.category]||I.Misc,c=B(t.date),l=t.tags.map(w=>`<span class="tag">#${w}</span>`).join(""),m=t.content.replace(/<[^>]*>/g,"").split(/\s+/).length,y=Math.max(1,Math.round(m/160)),f=document.getElementById("art-title"),v=document.getElementById("art-date"),x=document.getElementById("art-reading-time"),g=document.getElementById("art-tags"),u=document.getElementById("art-category");f&&(f.textContent=t.title),v&&(v.textContent=c),x&&(x.textContent=`⏱️ ${y} min de leitura`),g&&(g.innerHTML=l),u&&(u.textContent=t.category,u.style.backgroundColor=p.bg,u.style.color=p.text,u.style.border=`1px solid ${p.border}`);let E="";t.youtubeId?E+=`
      <div class="video-wrapper">
        <iframe 
          src="https://www.youtube.com/embed/${t.youtubeId}" 
          title="YouTube video player" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
    `:t.imageUrl&&(E+=`
      <div class="article-banner-wrapper" style="width:100%; height:320px; overflow:hidden; border-radius:18px; margin:24px 0; background-color:var(--bg-tertiary); border: 1px solid var(--border-color);">
        <img src="${t.imageUrl}" alt="${t.title}" style="width:100%; height:100%; object-fit:cover;" referrerPolicy="no-referrer" />
      </div>
    `);const b=document.getElementById("article-content");b&&(b.innerHTML=E+t.content),M(),R(e),_(e),F(),Y(),Z(t),W(t);const S=document.getElementById("reading-progress");S&&(S.classList.remove("hidden"),S.style.width="0%")};function M(){document.querySelectorAll(".code-container").forEach(t=>{if(t.querySelector(".copy-btn"))return;const o=t.querySelector(".code-header"),s=t.querySelector("pre");if(!o||!s)return;const a=document.createElement("button");a.className="copy-btn",a.title="Copiar código para a área de transferência",a.innerHTML=`
      <svg class="copy-svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
        <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
        <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
      </svg>
      <span>Copiar</span>
    `,a.onclick=()=>{const n=s.querySelector("code");if(n){const d=n.textContent||"";navigator.clipboard.writeText(d).then(()=>{const p=t.getAttribute("data-dica-id");if(p&&r.activeView==="cheatsheet")try{r.accessCount.dicas[p]=(r.accessCount.dicas[p]||0)+1,H()}catch(c){console.error("Erro ao registrar estatística de cópia de dica:",c)}a.innerHTML=`
            <svg viewBox="0 0 16 16" width="12" height="12" fill="#56d364">
              <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 .042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
            </svg>
            <span style="color:#56d364;">Copiado ✓</span>
          `,setTimeout(()=>{a.innerHTML=`
              <svg class="copy-svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path>
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path>
              </svg>
              <span>Copiar</span>
            `},2e3)}).catch(p=>{console.error("Falha ao copiar trecho de código: ",p)})}},o.appendChild(a)})}function R(e){const t=h.findIndex(a=>a.id===e),o=document.getElementById("nav-prev"),s=document.getElementById("nav-next");if(!(!o||!s)){if(t>0){const a=h[t-1];o.classList.remove("disabled"),o.innerHTML="← anterior",o.onclick=()=>window.openArticle(a.id)}else o.classList.add("disabled"),o.innerHTML="← anterior",o.onclick=null;if(t<h.length-1){const a=h[t+1];s.classList.remove("disabled"),s.innerHTML="próximo →",s.onclick=()=>window.openArticle(a.id)}else s.classList.add("disabled"),s.innerHTML="próximo →",s.onclick=null}}window.closeArticle=function(){r.selectedArticleId=null;const e=document.getElementById("article-view"),t=document.getElementById("cheatsheet-view"),o=document.getElementById("home-view"),s=document.getElementById("mobile-categories");e&&e.classList.add("hidden"),t&&t.classList.add("hidden"),o&&o.classList.remove("hidden"),s&&s.classList.remove("hidden");const a=document.getElementById("reading-progress");a&&a.classList.add("hidden"),T()};window.goHome=function(){r.activeCategory="Todos",r.searchQuery="",r.selectedArticleId=null,r.activeView="articles";const e=document.getElementById("search-input");e&&(e.value="");const t=document.getElementById("search-clear-btn");t&&t.classList.add("hidden");const o=document.getElementById("article-view"),s=document.getElementById("cheatsheet-view"),a=document.getElementById("snippets-view"),n=document.getElementById("home-view"),d=document.getElementById("mobile-categories");o&&o.classList.add("hidden"),s&&s.classList.add("hidden"),a&&a.classList.add("hidden"),n&&n.classList.remove("hidden"),d&&d.classList.remove("hidden");const p=document.getElementById("reading-progress");p&&p.classList.add("hidden");const c=document.getElementById("nav-btn-cheatsheets");c&&c.classList.remove("active"),A(),k(),T(),window.scrollTo({top:0,behavior:"smooth"})};window.toggleTheme=function(){const e=document.body,t=document.querySelector(".sun-icon"),o=document.querySelector(".moon-icon");e.classList.toggle("dark-theme"),document.documentElement.classList.toggle("dark");const s=e.classList.contains("dark-theme");localStorage.setItem("java-kb-theme",s?"dark":"light"),s?(t&&t.classList.remove("hidden"),o&&o.classList.add("hidden")):(t&&t.classList.add("hidden"),o&&o.classList.remove("hidden"))};function U(){document.addEventListener("keydown",e=>{if(document.activeElement&&(document.activeElement.tagName==="INPUT"||document.activeElement.tagName==="TEXTAREA")){e.key==="Escape"&&(document.activeElement.blur(),window.clearSearch());return}if(e.key==="/"){e.preventDefault();const t=document.getElementById("search-input");t&&(t.focus(),t.select())}else if(e.key==="Escape"){if(r.drawerOpen){window.closeDrawer();return}window.clearSearch(),r.selectedArticleId&&window.closeArticle()}else if(e.key==="ArrowLeft"){if(r.selectedArticleId){const t=h.findIndex(o=>o.id===r.selectedArticleId);t>0&&window.openArticle(h[t-1].id)}}else if(e.key==="ArrowRight"){if(r.selectedArticleId){const t=h.findIndex(o=>o.id===r.selectedArticleId);t<h.length-1&&window.openArticle(h[t+1].id)}}else e.key.toLowerCase()==="p"?r.selectedArticleId&&window.print():e.key==="?"&&window.toggleShortcutsModal()})}window.toggleShortcutsModal=function(){const e=document.getElementById("shortcuts-modal");e&&e.classList.toggle("hidden")};function G(){window.addEventListener("scroll",()=>{const e=document.getElementById("reading-progress");if(!e||e.classList.contains("hidden"))return;const t=window.scrollY||document.documentElement.scrollTop,o=document.documentElement.scrollHeight-document.documentElement.clientHeight;if(o<=0){e.style.width="0%";return}const s=t/o*100;e.style.width=`${Math.min(100,Math.max(0,s))}%`})}function Q(){q(),$()}function $(){const e=document.getElementById("recent-articles-list"),t=document.getElementById("recent-empty");if(!(!e||!t)){if(e.innerHTML="",r.recentArticles.length===0){t.classList.remove("hidden");return}t.classList.add("hidden"),r.recentArticles.forEach(o=>{const s=h.find(n=>n.id===o);if(!s)return;const a=document.createElement("div");a.className="recent-item",a.style.display="flex",a.style.justifyContent="space-between",a.style.alignItems="center",a.style.padding="8px 12px",a.style.borderRadius="8px",a.style.backgroundColor="var(--bg-secondary)",a.style.cursor="pointer",a.style.transition="transform 0.15s, background-color 0.15s",a.innerHTML=`
      <span style="font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">${s.title}</span>
      <span style="font-size: 11px; color: var(--accent); font-weight: 600;">Ler ↗</span>
    `,a.onclick=()=>window.openArticle(s.id),e.appendChild(a)})}}function _(e){r.recentArticles=r.recentArticles.filter(t=>t!==e),r.recentArticles.unshift(e),r.recentArticles.length>4&&r.recentArticles.pop(),localStorage.setItem("java-kb-recent",JSON.stringify(r.recentArticles)),$()}window.clearRecentHistory=function(){r.recentArticles=[],localStorage.removeItem("java-kb-recent"),$()};function F(){const e=document.getElementById("article-content");if(!e)return;Array.from(e.querySelectorAll("h2, h3")).forEach(o=>{const a=(o.textContent||"").trim().toLowerCase().replace(/[^\w\s-]/g,"").replace(/\s+/g,"-");o.id=a,o.style.position="relative",o.classList.add("group");const n=document.createElement("a");n.href=`#${a}`,n.className="anchor-link",n.style.position="absolute",n.style.left="-24px",n.style.paddingRight="8px",n.style.opacity="0",n.style.color="var(--accent)",n.style.textDecoration="none",n.style.transition="opacity 0.2s",n.innerHTML="🔗",n.onclick=d=>{d.preventDefault(),navigator.clipboard.writeText(window.location.origin+window.location.pathname+"#"+a).then(()=>{const p=n.innerHTML;n.innerHTML="✓",setTimeout(()=>{n.innerHTML=p},1500)}),o.scrollIntoView({behavior:"smooth"})},o.insertBefore(n,o.firstChild),o.addEventListener("mouseenter",()=>{n.style.opacity="1"}),o.addEventListener("mouseleave",()=>{n.style.opacity="0"})})}function Y(){const e=document.getElementById("toc-list"),t=document.getElementById("article-content");if(!e||!t)return;e.innerHTML="";const o=Array.from(t.querySelectorAll("h2, h3"));if(o.length===0){e.innerHTML='<li style="color:var(--text-secondary); font-size:12px;">Nenhuma seção encontrada</li>';return}o.forEach(n=>{const d=document.createElement("li"),p=n.tagName.toLowerCase()==="h3";d.style.paddingLeft=p?"12px":"0",d.style.marginBottom="6px";const c=document.createElement("a");c.href=`#${n.id}`;const l=(n.textContent||"").replace("🔗","").trim();c.textContent=l,c.style.color="var(--text-secondary)",c.style.fontSize="12px",c.style.textDecoration="none",c.style.transition="color 0.2s",c.onclick=i=>{i.preventDefault(),n.scrollIntoView({behavior:"smooth"})},d.appendChild(c),e.appendChild(d)});const s={root:null,rootMargin:"0px 0px -60% 0px",threshold:0},a=new IntersectionObserver(n=>{n.forEach(d=>{if(d.isIntersecting){const p=d.target.id;e.querySelectorAll("a").forEach(c=>{c.getAttribute("href")===`#${p}`?(c.style.color="var(--accent)",c.style.fontWeight="600"):(c.style.color="var(--text-secondary)",c.style.fontWeight="normal")})}})},s);o.forEach(n=>a.observe(n))}function Z(e){const t=document.getElementById("related-articles-list");if(!t)return;t.innerHTML="";const o=h.filter(s=>s.id!==e.id&&s.tags.some(a=>e.tags.includes(a)));if(o.length===0){t.innerHTML='<p style="color:var(--text-secondary); font-size:13px;">Nenhum artigo relacionado encontrado.</p>';return}o.slice(0,3).forEach(s=>{const a=document.createElement("div");a.style.backgroundColor="var(--bg-secondary)",a.style.border="1px solid var(--border-color)",a.style.borderRadius="12px",a.style.padding="14px",a.style.cursor="pointer",a.style.transition="transform 0.15s, border-color 0.15s",a.innerHTML=`
      <span style="font-size:11px; font-weight:600; text-transform:uppercase; color:var(--accent); letter-spacing:0.5px;">${s.category}</span>
      <h4 style="font-size:13px; font-weight:600; margin:4px 0 8px 0; line-height:1.3;">${s.title}</h4>
      <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${s.summary}</p>
    `,a.onmouseenter=()=>{a.style.transform="translateY(-2px)",a.style.borderColor="var(--accent)"},a.onmouseleave=()=>{a.style.transform="none",a.style.borderColor="var(--border-color)"},a.onclick=()=>window.openArticle(s.id),t.appendChild(a)})}function W(e){const t=document.getElementById("changelog-container");if(t){if(!e.changelog||e.changelog.length===0){t.innerHTML='<p style="color:var(--text-secondary); font-size:12px;">Nenhum histórico disponível para este artigo.</p>';return}t.innerHTML=`
    <div style="display:flex; flex-direction:column; gap:16px; border-left:2px solid var(--border-color); padding-left:14px; margin-left:6px;">
      ${e.changelog.map(o=>`
        <div style="position:relative;">
          <span style="position:absolute; left:-21px; top:4px; width:10px; height:10px; border-radius:50%; background-color:var(--accent); border: 2px solid var(--bg-card);"></span>
          <div style="font-size:11px; font-weight:600; color:var(--text-secondary);">${B(o.date)} — <span style="color:var(--accent);">v${o.version}</span></div>
          <div style="font-size:13px; font-weight:600; margin:2px 0;">${o.author}</div>
          <p style="font-size:11px; color:var(--text-secondary); line-height:1.4; margin:0;">${o.changes}</p>
        </div>
      `).join("")}
    </div>
  `}}window.renderHomeSeries=function(){const e=document.getElementById("home-series-list");e&&(e.innerHTML="",P.forEach(t=>{const o=h.filter(a=>a.seriesId===t.id);if(o.length===0)return;const s=document.createElement("div");s.style.backgroundColor="var(--bg-card)",s.style.border="1px solid transparent",s.style.borderRadius="18px",s.style.padding="20px",s.style.cursor="pointer",s.style.transition="transform 0.15s, border-color 0.15s",s.innerHTML=`
      <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--accent); letter-spacing:1px; background-color:var(--bg-secondary); padding:4px 8px; border-radius:6px; border:1px solid var(--border-color);">SÉRIE ESPECIAL</span>
      <h3 style="font-size:16px; font-weight:700; margin:10px 0 6px 0; line-height:1.3;">${t.name}</h3>
      <p style="font-size:12px; color:var(--text-secondary); line-height:1.4; margin-bottom:14px;">${t.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:var(--accent); font-weight:600;">
        <span>⚡ ${o.length} Artigos na trilha</span>
        <span>Iniciar trilha →</span>
      </div>
    `,s.onmouseenter=()=>{s.style.transform="translateY(-2px)"},s.onmouseleave=()=>{s.style.transform="none"},s.onclick=()=>window.openArticle(o[0].id),e.appendChild(s)}))};window.openCheatsheet=function(e){r.activeView="cheatsheet",r.activeCheatsheetCategory=e;const t=document.getElementById("home-view"),o=document.getElementById("article-view"),s=document.getElementById("snippets-view"),a=document.getElementById("mobile-categories"),n=document.getElementById("reading-progress"),d=document.getElementById("cheatsheet-view");t&&t.classList.add("hidden"),o&&o.classList.add("hidden"),s&&s.classList.add("hidden"),a&&a.classList.add("hidden"),n&&n.classList.add("hidden"),d&&d.classList.remove("hidden");const p=document.getElementById("nav-btn-cheatsheets");p&&p.classList.add("active");const c=document.getElementById("cheatsheet-title"),l=document.getElementById("cheatsheet-subtitle"),i=document.getElementById("cheatsheet-grid");if(!c||!i)return;c.textContent=`Dicas de ${e}`,l&&(l.textContent=`Acesso rápido a estruturas, sintaxes, boas práticas e truques extraídos dos artigos de ${e}.`),i.innerHTML="";let m=!1;const y=r.searchQuery.trim().toLowerCase(),f=[];h.forEach(g=>{const u=document.createElement("div");u.innerHTML=g.content,u.querySelectorAll(".code-container").forEach((b,S)=>{let w=b.previousElementSibling,L="";for(;w;){if(["h3","h4","h5","p"].includes(w.tagName.toLowerCase())){L=w.textContent||"",L=L.replace("🔗","").trim();break}w=w.previousElementSibling}L||(L="Exemplo Prático"),f.push({id:`${g.id}-dica-${S}`,artId:g.id,article:g,category:g.category,description:L,innerHTML:b.innerHTML,textContent:b.textContent||"",date:g.date})})}),O(f,r.accessCount.dicas).filter(g=>{if(e&&e!=="Todos"&&g.category!==e)return!1;if(y){const u=g.textContent.toLowerCase().includes(y),E=g.description.toLowerCase().includes(y),b=g.article.title.toLowerCase().includes(y);if(!u&&!E&&!b)return!1}return!0}).forEach(g=>{m=!0;const u=document.createElement("div");u.style.backgroundColor="var(--bg-card)",u.style.border="none",u.style.borderRadius="18px",u.style.padding="20px",u.style.display="flex",u.style.flexDirection="column",u.style.gap="12px",u.style.cursor="pointer",u.style.transition="transform 0.15s",u.style.height="340px",u.style.overflow="hidden",u.onmouseenter=()=>{u.style.transform="translateY(-2px)"},u.onmouseleave=()=>{u.style.transform="none"},u.innerHTML=`
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <span style="font-size:11px; font-weight:700; text-transform:uppercase; color:var(--accent); letter-spacing:0.5px;">${g.category}</span>
        <span style="font-size:11px; color:var(--text-secondary); font-weight: 500;">Origem: <strong>${g.article.title}</strong></span>
      </div>
      <div style="flex-shrink: 0;">
        <h3 style="font-size:14px; font-weight:700; margin:0; display:flex; align-items:center; gap:6px; color: var(--text-primary);">⚡ ${g.description}</h3>
      </div>
      <div class="code-container" data-dica-id="${g.id}" style="margin:0; border: 1px solid var(--border-color); background-color: var(--bg-secondary); flex-grow: 1; overflow-y: auto;">
        ${g.innerHTML}
      </div>
    `,u.onclick=()=>{window.openArticle(g.artId)},i.appendChild(u)}),m||(i.innerHTML=`
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <p>Nenhum bloco de código encontrado para os critérios de filtragem em "${e}".</p>
      </div>
    `),M(),window.scrollTo({top:0,behavior:"smooth"})};window.openDrawer=function(){r.drawerOpen=!0,document.body.classList.add("drawer-open"),document.documentElement.classList.add("drawer-open"),K()};window.closeDrawer=function(){r.drawerOpen=!1,document.body.classList.remove("drawer-open"),document.documentElement.classList.remove("drawer-open")};window.openSnippets=function(){r.activeView="snippets";const e=document.getElementById("home-view"),t=document.getElementById("article-view"),o=document.getElementById("cheatsheet-view"),s=document.getElementById("snippets-view"),a=document.getElementById("mobile-categories"),n=document.getElementById("reading-progress");e&&e.classList.add("hidden"),t&&t.classList.add("hidden"),o&&o.classList.add("hidden"),a&&a.classList.add("hidden"),n&&n.classList.add("hidden"),s&&s.classList.remove("hidden");const d=document.getElementById("nav-btn-cheatsheets");d&&d.classList.remove("active");const p=document.getElementById("snippets-grid");p&&(p.innerHTML=V.map(c=>`
    <div class="category-card" style="padding: 20px; border-radius: 12px; border: 1px solid var(--border); background-color: var(--bg-card); display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">${c.title}</h3>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">${c.description}</p>
        <div class="code-container" style="position: relative;">
          <pre style="margin: 0; padding: 12px; border-radius: 8px; background-color: var(--code-bg); overflow-x: auto;"><code class="language-java" style="font-family: var(--font-mono); font-size: 11px; color: #fff;">${C(c.code)}</code></pre>
        </div>
      </div>
    </div>
  `).join(""),M(),window.closeDrawer())};function K(){const e=document.getElementById("drawer-categories");if(!e)return;e.innerHTML="";const t=document.createElement("li");t.className=`category-item ${r.activeCategory==="Todos"?"active":""}`,t.style.display="flex",t.style.justifyContent="space-between",t.style.alignItems="center",t.style.padding="8px 12px",t.style.borderRadius="8px",t.style.cursor="pointer",t.style.gap="8px",t.innerHTML=`
    <div style="display: flex; align-items: center; gap: 8px; flex: 1;" onclick="window.selectCategory('Todos'); window.closeDrawer();">
      <span style="font-size: 14px; font-weight: 600;">Todos os Artigos</span>
      <span class="category-count" style="font-size: 11px; color: var(--text-tertiary); opacity: 0.8;">(${h.length})</span>
    </div>
  `,e.appendChild(t);const o=document.createElement("div");o.className="sidebar-divider",o.style.margin="8px 0",e.appendChild(o);const s=c=>{const l=document.createElement("li");l.className=`category-item ${r.activeCategory===c?"active":""}`,l.style.display="flex",l.style.justifyContent="space-between",l.style.alignItems="center",l.style.padding="8px 12px",l.style.borderRadius="8px",l.style.cursor="pointer",l.style.gap="8px";const i=h.filter(m=>m.category===c).length;return l.innerHTML=`
      <div style="display: flex; align-items: center; gap: 8px; flex: 1;" onclick="window.selectCategory('${c}'); window.closeDrawer();">
        <span style="font-size: 14px; font-weight: 500;">${c}</span>
        <span class="category-count" style="font-size: 11px; color: var(--text-tertiary); opacity: 0.8;">(${i})</span>
      </div>
    `,l},a=document.createElement("p");a.className="drawer-section-title",a.textContent="Core Concepts",e.appendChild(a),["Generics","Streams","Collections","OOP"].forEach(c=>{e.appendChild(s(c))});const d=document.createElement("p");d.className="drawer-section-title",d.textContent="Advanced",e.appendChild(d),["Concurrency","JVM","Spring","Misc"].forEach(c=>{e.appendChild(s(c))})}window.addEventListener("resize",N(()=>{window.innerWidth>=1024&&r.drawerOpen&&window.closeDrawer()},100));document.addEventListener("DOMContentLoaded",()=>{if(localStorage.getItem("java-kb-theme")==="dark"){document.body.classList.add("dark-theme"),document.documentElement.classList.add("dark");const o=document.querySelector(".sun-icon"),s=document.querySelector(".moon-icon");o&&o.classList.remove("hidden"),s&&s.classList.add("hidden")}Q();const t=document.getElementById("stats-articles-count");t&&(t.textContent=h.length.toString()),j(),A(),k(),T(),U(),G(),window.renderHomeSeries()});
