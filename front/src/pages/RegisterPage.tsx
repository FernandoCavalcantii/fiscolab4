import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from './RegisterPage.module.css';
import { registerUser, loginUser } from "../api";
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const splitFullName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return { firstName, lastName };
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const cleanCPF = (formattedCPF: string) => {
    return formattedCPF.replace(/[^\d]/g, '');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== rePassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    const { firstName, lastName } = splitFullName(name);
    if (!firstName || !lastName) {
      setError("Por favor, digite seu nome completo (nome e sobrenome)");
      setLoading(false);
      return;
    }

    const dataToSend = {
      first_name: firstName,
      last_name: lastName,
      email: email.trim(),
      linkedin_url: linkedin.trim() || undefined,
      cpf: cleanCPF(cpf),
      password,
      re_password: rePassword,
      is_superuser: isAdmin
    };

    try {

      await registerUser(dataToSend);
      console.log('Usuário registrado com sucesso');

      await loginUser({ 
        email: email.trim(), 
        password 
      });
      console.log('Login automático realizado');

      login();
      navigate("/setup");

    } catch (err: any) {
      if (err.response?.data) {
        const backendErrors = err.response.data;
        let errorMessage = "Erro ao cadastrar usuário:\n";
        
        Object.entries(backendErrors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            errorMessage += `${field}: ${messages.join(', ')}\n`;
          }
        });
        
        setError(errorMessage);
      } else {
        setError("Erro ao cadastrar usuário");
      }
      console.error('Erro no registro:', err);
    } finally {
      setLoading(false);
    }
  };

  const [currentStep, setCurrentStep] = useState(1);

  const [step, setStep] = useState(1);

  const handleBack = () => {
  if (step > 1) {
    setStep(step - 1);
  } else {
    navigate(-1);
  }
};

  return (

    <div className={styles.pageContainer}>
    
    <div className={styles.backButtonContainer}>
      <button type="button" onClick={handleBack} className={styles.backButton}>
        <span className={styles.arrow}>&lt;</span>
        <span>Voltar</span>
      </button>
    </div>

      <form className={styles.formContainer} onSubmit={handleRegisterSubmit}>

        <h2>Cadastro</h2>

      <div className={styles.stepIndicator}>
        <div className={`${styles.step} ${currentStep === 1 ? styles.active : ""}`}>1</div>
        <div className={`${styles.line} ${currentStep > 1 ? styles.activeLine : ""}`}></div>
        <div className={`${styles.step} ${currentStep === 2 ? styles.active : ""}`}>2</div>
      </div>

        <p>Dados pessoais</p>

        {error && <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</pre>}

        <input 
          type="text" 
          placeholder="Nome Completo" 
          className={styles.inputField} 
          value={name} 
          onChange={e => setName(e.target.value)} 
          disabled={loading}
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className={styles.inputField} 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          disabled={loading}
          required 
        />
        <input 
          type="url" 
          placeholder="LinkedIn (Opcional)" 
          className={styles.inputField} 
          value={linkedin} 
          onChange={e => setLinkedin(e.target.value)} 
          disabled={loading}
        />
        <input 
          type="text" 
          placeholder="CPF" 
          className={styles.inputField} 
          value={cpf} 
          onChange={handleCpfChange} 
          maxLength={14}
          disabled={loading}
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          className={styles.inputField} 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          disabled={loading}
          required 
        />
        <input 
          type="password" 
          placeholder="Confirme sua Senha" 
          className={styles.inputField} 
          value={rePassword} 
          onChange={e => setRePassword(e.target.value)} 
          disabled={loading}
          required 
        />
        
        <div className={styles.termsContainer}>
          <input 
            type="checkbox" 
            id="isAdmin" className={styles.checkbox}
            checked={isAdmin}
            onChange={e => setIsAdmin(e.target.checked)}
            disabled={loading}
            style={{ marginRight: '10px' }}
          />
          <label htmlFor="isAdmin" className={styles.termsLabel}>
            Cadastrar como administrador do sistema.
          </label>
        </div>
        
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={loading}
          onClick={() => setCurrentStep(2)}
        >
          {loading ? "Cadastrando..." : "Continuar..."} {/* ✅ Feedback visual */}
        </button>
        
        <div className={styles.termsContainer}>
          <input type="checkbox" id="terms" className={styles.checkbox} />
          <label htmlFor="terms" className={styles.termsLabel}>
            Li e concordo com os{' '}
            <a href="#" className={styles.link}>Termos de Uso</a> da plataforma.
          </label>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;