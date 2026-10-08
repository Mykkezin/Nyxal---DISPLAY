# Nyxal-Display

Camada visual do NyxOS.

## Arquitetura

```
Nyxal Core (Python)
  ├─ núcleo, API, serviços, residência e módulos
  └─ http://127.0.0.1:8010

Nyxal-Display (React/Vite)
  └─ desktop visual e módulos de apresentação
     └─ consome a API real do Nyxal Core
```

O Display não possui fallback de estado operacional e não deve inventar telemetria, VMs, serviços ou respostas. Quando o Core estiver indisponível, a interface deve mostrar a indisponibilidade.

## Desenvolvimento

```bash
npm install
npm run dev
```

Por padrão, o desenvolvimento usa `http://127.0.0.1:8010` como Nyxal Core. Altere `VITE_NYXAL_API_URL` quando o Core estiver em outro endereço.

## Limites

O Display não executa comandos shell arbitrários. Capacidades de alteração dependem das rotas explícitas expostas pelo Nyxal Core.
