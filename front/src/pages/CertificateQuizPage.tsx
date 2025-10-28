import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { getCertificateQuestions, CertificateQuestion, submitCertificateTest } from '../api';
import QuizProgress from '../components/quiz/QuizProgress';
import QuestionCard from '../components/quiz/QuestionCard';

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #212529;
  position: absolute;
  top: 2rem;
  left: 3rem;
`;

const QuizContainer = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8rem 2rem 4rem 2rem;
  position: relative;
`;

const FeedbackCard = styled.div<{ isCorrect: boolean }>`
  background: #fff;
  border: 1px solid #e9ecef;
  border-left: 5px solid ${props => props.isCorrect ? '#28a745' : '#dc3545'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 800px;
  text-align: left;
  h3 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.isCorrect ? '#28a745' : '#dc3545'};
  }
  p {
    margin: 0;
    color: #495057;
  }
`;

const ActionButton = styled.button`
  background-color: #495057;
  color: #fff;
  border: none;
  padding: 0.9rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 2rem;
  transition: background-color 0.2s;
  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }
`;

const AnswerInput = styled.input`
  width: 100%;
  max-width: 300px;
  padding: 1rem;
  font-size: 1.1rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  text-align: center;
  margin: 1rem 0;
  &:focus {
    outline: none;
    border-color: #495057;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: #dc3545;
`;

interface CertificateQuizPageProps {
  program: string;
  track: string;
}

const CertificateQuizPage: React.FC = () => {
  const [questions, setQuestions] = useState<CertificateQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ question_id: number; user_answer: number; is_correct: boolean }[]>([]);
  const navigate = useNavigate();
  const { program, track } = useParams<{ program: string; track: string }>();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!program || !track) {
        setError('Programa e trilha são obrigatórios');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getCertificateQuestions(program, track);
        console.log('🔍 Questões carregadas:', {
          totalQuestions: response.questions.length,
          questions: response.questions.map(q => ({ id: q.id, statement: q.statement.substring(0, 50) + '...' }))
        });
        setQuestions(response.questions);
      } catch (err: any) {
        console.error('Error fetching certificate questions:', err);
        setError(err.response?.data?.error || 'Erro ao carregar questões do certificado');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [program, track]);

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleAnswerChange = (value: string) => {
    if (!isAnswered) {
      setUserAnswer(value);
    }
  };
  
  const handleConfirmAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const numericAnswer = parseFloat(userAnswer);
    const correctAnswer = currentQuestion.correct_answer;
    const tolerance = 0.01;
    
    const isAnswerCorrect = Math.abs(numericAnswer - correctAnswer) <= tolerance;
    setIsAnswered(true);
    
    const newAnswer = {
      question_id: currentQuestion.id,
      user_answer: numericAnswer,
      is_correct: isAnswerCorrect
    };
    
    console.log('🔍 handleConfirmAnswer debug:', {
      currentQuestionIndex,
      questionId: currentQuestion.id,
      userAnswer: numericAnswer,
      correctAnswer,
      isAnswerCorrect,
      totalAnswersBefore: answers.length
    });
    
    setAnswers(prev => {
      const newAnswers = [...prev, newAnswer];
      console.log('📝 Answers updated:', {
        totalAnswers: newAnswers.length,
        answers: newAnswers.map(a => ({ 
          question_id: a.question_id, 
          is_correct: a.is_correct 
        }))
      });
      
      // CORREÇÃO: Verificar se é a última questão antes de chamar handleNext
      setTimeout(() => {
        if (currentQuestionIndex === questions.length - 1) {
          // É a última questão, finalizar diretamente
          console.log('🏁 Última questão respondida, finalizando quiz');
          finishQuizWithAnswers(newAnswers);
        } else {
          // Não é a última questão, continuar normalmente
          handleNext();
        }
      }, 1000);
      
      return newAnswers;
    });
  };
  
  const handleNext = () => {
    const newIndex = currentQuestionIndex + 1;
    
    console.log('🔍 handleNext debug:', {
      currentQuestionIndex,
      newIndex,
      questionsLength: questions.length,
      answersLength: answers.length,
      willFinish: newIndex >= questions.length
    });
    
    // CORREÇÃO: Garantir que todas as questões sejam processadas
    if (newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
      setUserAnswer('');
      setIsAnswered(false);
    } else {
      console.log('🏁 Finalizando quiz - todas as questões respondidas');
      console.log('🔍 Verificação final:', {
        totalQuestions: questions.length,
        totalAnswers: answers.length,
        answers: answers.map(a => ({ question_id: a.question_id, is_correct: a.is_correct }))
      });
      finishQuiz();
    }
  };

  const finishQuizWithAnswers = async (finalAnswers: { question_id: number; user_answer: number; is_correct: boolean }[]) => {
    // CORREÇÃO: Usar as respostas passadas como parâmetro
    const correctAnswers = finalAnswers.filter(a => a.is_correct).length;
    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const passed = correctAnswers >= 4; // 4 de 5 = 80%

    console.log('🔍 Dados do teste (com respostas finais):', {
      program,
      track,
      correctAnswers,
      totalQuestions,
      score,
      passed,
      answers: finalAnswers.map(a => ({ 
        question_id: a.question_id, 
        user_answer: a.user_answer,
        is_correct: a.is_correct 
      }))
    });

    try {
      const result = await submitCertificateTest({
        program: program!,
        track: track!,
        answers: finalAnswers.map(a => ({ 
          question_id: a.question_id, 
          user_answer: a.user_answer,
          is_correct: a.is_correct 
        })),
        score,
        passed
      });

      console.log('✅ Teste enviado com sucesso:', result);
      console.log('🏆 Badge recebida?', result.badge_earned);

      // Navegar para página de resultado COM os dados do certificado e badge
      navigate(`/certificados/resultado/${program}/${track}`, {
        state: {
          score,
          passed,
          correctAnswers,
          totalQuestions,
          answers: finalAnswers,
          questions,
          program,
          track,
          certificateData: result // NOVO: Passa todos os dados da resposta incluindo badge_earned
        }
      });
    } catch (err: any) {
      console.error('❌ Erro ao enviar teste:', err);
      console.error('❌ Detalhes do erro:', err.response?.data);
      console.error('❌ Status do erro:', err.response?.status);
      setError(`Erro ao enviar resultado do teste: ${err.response?.data?.message || err.message}`);
    }
  };

  const finishQuiz = async () => {
    // CORREÇÃO: Validação adicional para garantir que todas as questões foram respondidas
    if (answers.length !== questions.length) {
      console.error('❌ ERRO: Número de respostas não confere com número de questões!', {
        answersLength: answers.length,
        questionsLength: questions.length,
        answers: answers.map(a => a.question_id),
        questions: questions.map(q => q.id)
      });
      setError(`Erro interno: ${answers.length} respostas para ${questions.length} questões. Recarregue a página e tente novamente.`);
      return;
    }
    
    const correctAnswers = answers.filter(a => a.is_correct).length;
    const totalQuestions = questions.length;
    const score = (correctAnswers / totalQuestions) * 100;
    const passed = correctAnswers >= 4; // 4 de 5 = 80%

    console.log('🔍 Dados do teste:', {
      program,
      track,
      correctAnswers,
      totalQuestions,
      score,
      passed,
      answers: answers.map(a => ({ 
        question_id: a.question_id, 
        user_answer: a.user_answer,
        is_correct: a.is_correct 
      }))
    });

    try {
      const result = await submitCertificateTest({
        program: program!,
        track: track!,
        answers: answers.map(a => ({ 
          question_id: a.question_id, 
          user_answer: a.user_answer,
          is_correct: a.is_correct 
        })),
        score,
        passed
      });

      console.log('✅ Teste enviado com sucesso:', result);
      console.log('🏆 Badge recebida?', result.badge_earned);

      // Navegar para página de resultado COM os dados do certificado e badge
      navigate(`/certificados/resultado/${program}/${track}`, {
        state: {
          score,
          passed,
          correctAnswers,
          totalQuestions,
          answers,
          questions,
          program,
          track,
          certificateData: result // NOVO: Passa todos os dados da resposta incluindo badge_earned
        }
      });
    } catch (err: any) {
      console.error('❌ Erro ao enviar teste:', err);
      console.error('❌ Detalhes do erro:', err.response?.data);
      console.error('❌ Status do erro:', err.response?.status);
      setError(`Erro ao enviar resultado do teste: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <QuizContainer>
        <LoadingContainer>
          <h2>Carregando questões do certificado...</h2>
          <p>Por favor, aguarde...</p>
        </LoadingContainer>
      </QuizContainer>
    );
  }

  if (error) {
    return (
      <QuizContainer>
        <ErrorContainer>
          <h2>Erro</h2>
          <p>{error}</p>
          <ActionButton onClick={() => navigate('/certificados')}>
            Voltar aos Certificados
          </ActionButton>
        </ErrorContainer>
      </QuizContainer>
    );
  }

  if (questions.length === 0) {
    return (
      <QuizContainer>
        <ErrorContainer>
          <h2>Nenhuma questão encontrada</h2>
          <p>Não há questões disponíveis para este certificado.</p>
          <ActionButton onClick={() => navigate('/certificados')}>
            Voltar aos Certificados
          </ActionButton>
        </ErrorContainer>
      </QuizContainer>
    );
  }

  return (
    <QuizContainer>
      <QuizProgress
        totalSteps={questions.length}
        currentStep={currentQuestionIndex + 1}
      />
      <QuestionCard
        questionNumber={currentQuestionIndex + 1}
        questionText={currentQuestion.statement}
      />
      
      <AnswerInput
        type="number"
        step="0.01"
        placeholder="Digite sua resposta numérica"
        value={userAnswer}
        onChange={(e) => handleAnswerChange(e.target.value)}
        disabled={isAnswered}
      />

      <ActionButton 
        onClick={handleConfirmAnswer}
        disabled={!userAnswer.trim() || isAnswered}
      >
        {currentQuestionIndex === questions.length - 1 ? 'Finalizar Certificado' : 'Confirmar resposta'}
      </ActionButton>
    </QuizContainer>
  );
};

export default CertificateQuizPage;