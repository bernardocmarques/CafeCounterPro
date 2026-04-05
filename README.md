# CafeCounter Pro ☕

Uma aplicação simples para gerir pedidos de café em português.

## Funcionalidades

- **Tipos de café**: Curto, Longo, Normal, Descafeinado e Outro (personalizado)
- **Autocomplete de nomes**: ao escrever o nome da pessoa, sugere nomes da lista
- **Sincronização em tempo real**: múltiplos dispositivos podem ver e atualizar pedidos simultaneamente via Supabase Realtime
- **Gestão de pedidos**: marca pedidos como prontos ou remove-os

## Configuração

### 1. Supabase

1. Cria um projeto em [supabase.com](https://supabase.com)
2. Vai ao SQL Editor e executa o conteúdo de `supabase/schema.sql`
3. Copia as credenciais do projeto (URL e anon key)

### 2. Variáveis de ambiente

Cria um ficheiro `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Instalar dependências e arrancar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) no browser.

## Tecnologias

- [Next.js](https://nextjs.org) — framework React
- [Tailwind CSS](https://tailwindcss.com) — estilos
- [Supabase](https://supabase.com) — base de dados e sincronização em tempo real
