# EcoPerto - relação com a 2ª entrega da AEP

## Proposta
Aplicação web que usa a localização do usuário para mostrar pontos de reciclagem, estabelecimentos e eventos próximos que recebem materiais recicláveis ou reutilizáveis.

## ODS
ODS 12 - Consumo e Produção Responsáveis.

## POO
- Classe base: `RecyclableDestination`
- Subclasses: `CollectionPoint` e `RecyclingEvent`
- Composição: `Address`
- Polimorfismo: sobrescrita de `getTypeLabel()`
- Método comum herdado: `distanceFrom()`

## CRUD
O sistema implementa cadastro, consulta, alteração e exclusão de:
- pontos de coleta;
- eventos.

## Banco de dados
PostgreSQL real hospedado no Supabase.

## Integração
O frontend HTML/JavaScript consome o banco Supabase diretamente pelo SDK oficial.

## GitHub
Todos os arquivos podem ser versionados no repositório. Para demonstrar participação individual, cada integrante deve realizar commits próprios e identificáveis.

## Interface
A aplicação possui:
- navegação por seções;
- busca por material;
- busca por raio;
- obtenção da localização do usuário;
- cards de resultados;
- formulários de cadastro e edição;
- botão para abrir o destino no mapa.
