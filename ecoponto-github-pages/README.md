# EcoPerto

Aplicação web acadêmica vinculada à **ODS 12 - Consumo e Produção Responsáveis**.

O EcoPerto permite:
- localizar pontos de coleta e eventos próximos;
- filtrar por material;
- usar a geolocalização do navegador;
- cadastrar, editar, consultar e excluir pontos de coleta;
- cadastrar, editar, consultar e excluir eventos;
- armazenar os dados em um **banco PostgreSQL real**, por meio do Supabase.

## Tecnologias

- HTML5
- CSS3
- JavaScript
- Supabase (PostgreSQL)
- GitHub Pages

## Requisitos da AEP demonstrados

### POO
Arquivo: `js/models.js`

- **Herança:** `CollectionPoint` e `RecyclingEvent` herdam de `RecyclableDestination`.
- **Composição:** todo destino possui um objeto `Address`.
- **Polimorfismo:** `getTypeLabel()` é sobrescrito nas subclasses.
- **Encapsulamento lógico:** comportamento de cálculo de distância fica na classe base.

### CRUD
Arquivo: `js/app.js`

Há operações de:
- Create
- Read
- Update
- Delete

nas tabelas `collection_points` e `recycling_events`.

### Banco de dados
Arquivo: `database/schema.sql`

O banco é PostgreSQL e fica hospedado no Supabase.

---

# Como colocar para funcionar

## 1. Criar o banco gratuito no Supabase

1. Acesse https://supabase.com
2. Crie uma conta.
3. Clique em **New project**.
4. Crie o projeto.
5. Abra **SQL Editor**.
6. Copie todo o conteúdo de `database/schema.sql`.
7. Cole no SQL Editor.
8. Clique em **Run**.

Isso cria as tabelas e alguns registros de demonstração.

## 2. Copiar as chaves do Supabase

No Supabase:

1. Abra **Project Settings**.
2. Abra **API**.
3. Copie:
   - Project URL
   - anon/public key

Abra:

`js/config.js`

e substitua:

```javascript
const SUPABASE_URL = "COLE_AQUI_SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_SUPABASE_ANON_KEY";
```

pelos valores do seu projeto.

**Nunca use a service_role key no GitHub.**

## 3. Testar no computador

Como é um site estático, você pode abrir `index.html`.

Para a geolocalização funcionar melhor, recomenda-se usar um servidor local simples, por exemplo a extensão **Live Server** do VS Code.

## 4. Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste projeto.
3. Entre em **Settings** do repositório.
4. Clique em **Pages**.
5. Em **Build and deployment**, escolha:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
6. Clique em **Save**.

Depois o GitHub exibirá o endereço público do site.

Exemplo:

`https://seuusuario.github.io/ecoperto/`

## Observação acadêmica importante

As políticas do arquivo `schema.sql` permitem escrita pública para simplificar a demonstração da AEP.
Isso é adequado apenas para protótipo acadêmico. Em um sistema real, seria necessário adicionar autenticação e restringir as políticas de segurança.

## Estrutura

```text
ecoperto-pages/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── config.js
│   ├── models.js
│   └── app.js
├── database/
│   └── schema.sql
├── docs/
│   └── AEP.md
└── README.md
```
