# CafeCounter Pro ☕

Uma aplicação simples para gerir pedidos de café em português.

## Funcionalidades

- **Tipos de café**: Curto, Longo, Normal, Descafeinado e Outro (personalizado)
- **Autocomplete de nomes**: ao escrever o nome da pessoa, sugere nomes da lista
- **Sincronização em tempo real**: múltiplos dispositivos podem ver e atualizar pedidos simultaneamente via Firebase Realtime (Firestore `onSnapshot`)
- **Gestão de pedidos**: marca pedidos como prontos ou remove-os

## Configuração

### 1. Firebase

1. Abre o teu projeto em [console.firebase.google.com](https://console.firebase.google.com)
2. Vai a **Firestore Database** e cria uma base de dados (modo de produção ou teste)
3. Em **Firestore → Rules**, copia o conteúdo de `firestore/firestore.rules`
4. Nas definições do projeto, em **As tuas aplicações**, copia as credenciais da app web

### 2. Variáveis de ambiente

Cria um ficheiro `.env.local` na raiz do projeto (baseado em `.env.local.example`):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
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
- [Firebase Firestore](https://firebase.google.com/docs/firestore) — base de dados e sincronização em tempo real
