# Deploy no Render - FiscoLab

Este guia explica como fazer o deploy gratuito da aplicação FiscoLab no Render.

## 📋 Pré-requisitos

1. **Conta no Render**: [render.com](https://render.com)
2. **Repositório no GitHub**: Código deve estar em um repositório público
3. **Variáveis de ambiente**: Configurar as chaves necessárias

## 🚀 Passo a Passo

### 1. Preparar o Repositório

```bash
# Fazer commit dos arquivos de configuração
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2. Criar Conta no Render

1. Acesse [render.com](https://render.com)
2. Clique em "Get Started for Free"
3. Conecte sua conta do GitHub

### 3. Deploy do Backend (Django)

1. **New → Web Service**
2. **Conectar repositório**: Selecione seu repositório
3. **Configurações**:
   - **Name**: `fiscolab-backend-2`
   - **Environment**: `Python 3`
   - **Build Command**: `cd back && pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - **Start Command**: `cd back && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
   - **Plan**: `Free`

4. **Variáveis de Ambiente**:
   ```
   DJANGO_SETTINGS_MODULE=config.settings_simple
   DJANGO_SECRET_KEY=vxYx1JpDvU2vhwhaen6Bf-b2I1aIDBYpL8sOpVLO46yewzsrbkVgTjlyma03v7xrO2U
   DJANGO_DEBUG=False
   ALLOWED_HOSTS=fiscolab-backend-2.onrender.com
   OPENAI_API_KEY=<sua-chave-openai>
   ```

### 4. Deploy do Frontend (React)

1. **New → Static Site**
2. **Conectar repositório**: Mesmo repositório
3. **Configurações**:
   - **Name**: `fiscolab-frontend-2`
   - **Build Command**: `cd front && npm install && npm run build`
   - **Publish Directory**: `front/build`
   - **Plan**: `Free`

4. **Variáveis de Ambiente**:
   ```
   REACT_APP_API_URL=https://fiscolab-backend-2.onrender.com
   ```

### 5. Banco de Dados PostgreSQL

1. **New → PostgreSQL**
2. **Configurações**:
   - **Name**: `fiscolab-db`
   - **Plan**: `Free`
   - **Database**: `fiscolab`
   - **User**: `fiscolab_user`

3. **Conectar ao Backend**:
   - Copie a **Internal Database URL** do banco
   - Adicione como variável `DATABASE_URL` no backend

## 🔧 Configurações Importantes

### Backend (Django)
- ✅ Usa PostgreSQL (não SQLite)
- ✅ Configurações de produção
- ✅ WhiteNoise para arquivos estáticos
- ✅ Gunicorn como servidor WSGI
- ✅ CORS configurado para o frontend

### Frontend (React)
- ✅ Build otimizado para produção
- ✅ Conectado à API do backend
- ✅ Site estático (mais rápido)

### Banco de Dados
- ✅ PostgreSQL gratuito (1GB)
- ✅ Backup automático
- ✅ Conexão segura

## 📊 Limites do Plano Gratuito

| Recurso | Limite |
|---------|--------|
| **Horas/mês** | 750h |
| **RAM** | 512MB |
| **CPU** | 0.1 CPU |
| **Banco** | 1GB |
| **Suspensão** | 15min inatividade |

## 🔍 Troubleshooting

### Backend não inicia
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme se o `DATABASE_URL` está correto
- Verifique os logs no dashboard do Render

### Frontend não carrega
- Confirme se `REACT_APP_API_URL` aponta para o backend correto
- Verifique se o build foi executado com sucesso

### Banco de dados
- Confirme se a conexão está ativa
- Verifique se as migrações foram executadas

## 🌐 URLs Finais

Após o deploy, você terá:
- **Backend**: `https://fiscolab-backend-2.onrender.com`
- **Frontend**: `https://fiscolab-frontend-2.onrender.com`
- **Admin Django**: `https://fiscolab-backend-2.onrender.com/admin/`

## 💡 Dicas Importantes

1. **Primeira execução**: Pode demorar alguns minutos para "esquentar"
2. **Suspensão**: Após 15min sem uso, o serviço suspende (reativa automaticamente)
3. **Logs**: Use o dashboard do Render para monitorar
4. **Backup**: O banco tem backup automático
5. **Domínio customizado**: Disponível no plano pago

## 🆘 Suporte

- **Documentação Render**: [render.com/docs](https://render.com/docs)
- **Logs**: Dashboard → Seu serviço → Logs
- **Status**: Dashboard → Seu serviço → Status

---

✅ **Deploy gratuito funcionando!** Sua aplicação estará online em poucos minutos.
