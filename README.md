# 🏛️ FiscoLab - Plataforma de Aprendizado Fiscal

Uma plataforma completa de aprendizado fiscal com IA, desenvolvida com Django, React e tecnologias de processamento de linguagem natural.

## 🚀 Deploy Gratuito no Render

Este projeto está configurado para deploy gratuito no Render. Veja o guia completo em [RENDER_DEPLOY.md](./RENDER_DEPLOY.md).

## 📋 Tecnologias

### Backend
- **Django 5.2** - Framework web Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Banco de dados
- **LangChain** - Framework de IA
- **OpenAI** - Modelos de linguagem
- **ChromaDB** - Banco vetorial

### Frontend
- **React 19** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Mantine** - Componentes UI
- **Styled Components** - CSS-in-JS

### IA e Processamento
- **RAG Pipeline** - Retrieval Augmented Generation
- **PDF Processing** - Extração de texto
- **OCR** - Reconhecimento óptico de caracteres
- **Embeddings** - Representações vetoriais

## 🏗️ Estrutura do Projeto

```
fiscolab4/
├── back/                    # Backend Django
│   ├── config/             # Configurações Django
│   ├── users/              # Sistema de usuários
│   ├── progress/           # Sistema de progresso
│   ├── questions/          # Sistema de questões
│   ├── chatbot_api/       # API do chatbot
│   └── requirements.txt    # Dependências Python
├── front/                  # Frontend React
│   ├── src/               # Código fonte
│   ├── public/            # Arquivos públicos
│   └── package.json       # Dependências Node.js
├── chatbot/               # Sistema de IA
│   ├── app/               # Aplicação principal
│   ├── rag_pipeline/      # Pipeline RAG
│   └── requirements.txt   # Dependências IA
├── render.yaml            # Configuração Render
├── Procfile              # Comando de produção
└── RENDER_DEPLOY.md      # Guia de deploy
```

## 🎯 Funcionalidades

### 👤 Sistema de Usuários
- Registro e autenticação
- Perfis personalizados
- Sistema de permissões

### 📚 Sistema de Aprendizado
- Trilhas de conhecimento
- Questões múltipla escolha
- Questões discursivas
- Sistema de badges

### 🤖 Chatbot Inteligente
- Processamento de documentos PDF
- RAG (Retrieval Augmented Generation)
- Respostas contextuais
- Integração com OpenAI

### 📊 Sistema de Progresso
- Acompanhamento de evolução
- Certificados automáticos
- Estatísticas detalhadas

## 🚀 Deploy Rápido

### 1. Preparar Repositório
```bash
git add .
git commit -m "Configure Render deployment"
git push origin main
```

### 2. Deploy no Render
1. Acesse [render.com](https://render.com)
2. Conecte seu repositório GitHub
3. Siga o guia em [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)

### 3. URLs Finais
- **Frontend**: `https://fiscolab-frontend.onrender.com`
- **Backend**: `https://fiscolab-backend.onrender.com`
- **Admin**: `https://fiscolab-backend.onrender.com/admin/`

## 🔧 Desenvolvimento Local

### Backend
```bash
cd back
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd front
npm install
npm start
```

### Chatbot
```bash
cd chatbot
pip install -r requirements.txt
python app/main.py
```

## 📝 Variáveis de Ambiente

### Backend
```env
DJANGO_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
OPENAI_API_KEY=your-openai-key
EMAIL_HOST_USER=your-email
EMAIL_HOST_PASSWORD=your-password
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🎨 Interface

- **Design Responsivo** - Funciona em desktop e mobile
- **Tema Moderno** - Interface limpa e intuitiva
- **Componentes Reutilizáveis** - Código organizado
- **Acessibilidade** - Seguindo padrões WCAG

## 📈 Performance

- **Build Otimizado** - React com otimizações de produção
- **Lazy Loading** - Carregamento sob demanda
- **Cache Inteligente** - Reduz requisições desnecessárias
- **CDN** - Arquivos estáticos otimizados

## 🔒 Segurança

- **Autenticação JWT** - Tokens seguros
- **CORS Configurado** - Controle de origem
- **Validação de Dados** - Sanitização de inputs
- **HTTPS** - Conexões seguras

## 📚 Documentação

- [Guia de Deploy](./RENDER_DEPLOY.md) - Deploy no Render
- [API Documentation](./back/README.md) - Documentação da API
- [Frontend Guide](./front/README.md) - Guia do Frontend

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/fiscolab4/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/fiscolab4/wiki)
- **Email**: suporte@fiscolab.com

---

**Desenvolvido com ❤️ para democratizar o aprendizado fiscal no Brasil**
