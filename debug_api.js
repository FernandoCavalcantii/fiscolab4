// Teste de debug da API
const API_URL = 'https://fiscolab-backend.onrender.com';

console.log('🔍 Testando conexão com a API...');

// Teste 1: Verificar se a API está respondendo
fetch(`${API_URL}/api/auth/`)
  .then(response => {
    console.log('✅ API respondendo:', response.status);
    return response.text();
  })
  .then(data => {
    console.log('📄 Resposta da API:', data);
  })
  .catch(error => {
    console.error('❌ Erro na API:', error);
  });

// Teste 2: Testar login
console.log('🔍 Testando login...');
fetch(`${API_URL}/api/auth/jwt/create/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'testpass123'
  })
})
.then(response => {
  console.log('📊 Status do login:', response.status);
  return response.json();
})
.then(data => {
  console.log('🎫 Tokens recebidos:', data);
  if (data.access) {
    console.log('✅ Login bem-sucedido!');
  } else {
    console.log('❌ Login falhou:', data);
  }
})
.catch(error => {
  console.error('❌ Erro no login:', error);
});

// Teste 3: Verificar variáveis de ambiente
console.log('🌍 Variáveis de ambiente:');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
