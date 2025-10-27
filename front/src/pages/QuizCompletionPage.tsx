import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { completeChallengeAndEarnBadge, fetchChallenge } from '../api';
import BadgeEarnedHandler from '../components/badges/BadgeEarnedHandler';
import { Badge } from '../components/badges/BadgeDisplay';

const PageWrapper = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const CompletionCard = styled.div<{ passed: boolean }>`
  background-color: ${props => props.passed ? '#2f3a7d' : '#721c24'};
  color: #fff;
  border-radius: 20px;
  padding: 3rem 4rem;
  text-align: center;
  position: relative;
  width: 100%;
  max-width: 700px;
`;

const IconCircle = styled.div<{ passed: boolean }>`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${props => props.passed ? '#6c63ff' : '#dc3545'};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #f8f9fa;
`;

const Title = styled.h1`
  margin: 1.5rem 0 0.5rem 0;
  font-size: 2.5rem;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.2rem;
  color: #e0d8ff;
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  
  .label {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }
  
  .value {
    font-size: 1.5rem;
    font-weight: bold;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#495057'};
  color: #fff;
  border: none;
  padding: 0.9rem 2.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#5a6268' : '#343a40'};
  }
`;

const LoadingText = styled.p`
  color: #6c757d;
  font-size: 1rem;
  margin: 1rem 0;
`;

const ErrorContainer = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
  max-width: 500px;
  margin: 1rem 0;

  h3 {
    color: #721c24;
    margin-top: 0;
  }
`;

const InfoCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: #6c757d;
  max-width: 500px;
  margin: 1rem 0;
  
  h3 {
    color: #495057;
    margin-top: 0;
  }
`;

interface QuizResults {
  challengeId: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completionTime?: number;
  passed: boolean;
}

const QuizCompletionPage: React.FC = () => {
  const [badgeEarned, setBadgeEarned] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [challengeData, setChallengeData] = useState<any>(null);
  
  const { id: challengeId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  const quizResults = location.state as QuizResults | null;

  const difficultyMap: Record<string, 'EASY' | 'MEDIUM' | 'HARD'> = {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
  };

  const programMap: Record<string, 'PROIND' | 'PRODEPE' | 'PRODEAUTO'> = {
    PROIND: 'PROIND',
    PRODEPE: 'PRODEPE',
    PRODEAUTO: 'PRODEAUTO',
  };

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('⚠️ Execução já foi feita, ignorando...');
      return;
    }

    const processCompletion = async () => {
      if (!challengeId) {
        setError('ID do desafio não encontrado');
        setLoading(false);
        return;
      }

      if (!quizResults) {
        setError('Resultados do quiz não encontrados');
        setLoading(false);
        return;
      }

      try {
        const challenge = await fetchChallenge(parseInt(challengeId));
        setChallengeData(challenge);

        // NOVO: Só processa badge se passou (5 de 7 = 70%)
        if (quizResults.passed) {
          const trailMatch = challenge.track_name?.match(/(\d+)/);
          const trailNumber = trailMatch ? parseInt(trailMatch[1]) : 1;

          const mappedProgram = programMap[challenge.program_name];
          const mappedDifficulty = difficultyMap[challenge.difficulty];

          console.log('🚀 Chamando API completeChallengeAndEarnBadge...');
          const result = await completeChallengeAndEarnBadge({
            program: mappedProgram,
            trail_number: trailNumber,
            difficulty: mappedDifficulty,
            score: quizResults.score,
            challenge_id: parseInt(challengeId),
            completion_time_seconds: quizResults.completionTime || 300,
          });

          console.log('✅ Resposta da API:', result);

          if (result.badge_earned) {
            console.log('✅ Badge detectada! Setando estado:', result.badge_earned);
            setBadgeEarned(result.badge_earned);
          } else {
            console.log('⚠️ Nenhuma badge retornada pelo backend');
          }
        } else {
          console.log('❌ Usuário não atingiu 70%, badge não será concedida');
        }
      } catch (err: any) {
        console.error('❌ Erro ao processar conclusão:', err);
        setError('Erro ao processar resultado do desafio.');
      } finally {
        setLoading(false);
      }
    };

    hasProcessed.current = true;
    setTimeout(processCompletion, 1000);
  }, [challengeId]);

  const getDifficultyText = (difficulty: string): string => {
    const textMap: Record<string, string> = {
      EASY: 'Básico',
      MEDIUM: 'Intermediário',
      HARD: 'Avançado',
    };
    return textMap[difficulty] || difficulty;
  };

  const getBackLink = (): string => {
    if (!challengeData) return '/desafios';
    const program = challengeData.program_name?.toLowerCase();
    return `/trilhas/${program || 'proind'}`;
  };

  const handleRetry = () => {
    navigate(`/quiz/${challengeId}`);
  };

  if (!quizResults) {
    return (
      <PageWrapper>
        <ErrorContainer>
          <h3>⚠️ Erro</h3>
          <p>Dados do resultado não encontrados.</p>
          <Link to="/desafios">
            <ActionButton>Voltar para Desafios</ActionButton>
          </Link>
        </ErrorContainer>
      </PageWrapper>
    );
  }

  const passed = quizResults.passed;
  const correctAnswers = quizResults.correctAnswers;
  const totalQuestions = quizResults.totalQuestions;
  const scorePercentage = quizResults.score;

  return (
    <PageWrapper>
      <CompletionCard passed={passed}>
        <IconCircle passed={passed}>
            {passed ? <FaCheck size={24} /> : <FaExclamationTriangle size={24} />}
        </IconCircle>
        
        <Title>
          {passed 
            ? `Parabéns! Você concluiu o ${challengeData?.title || 'desafio'} com sucesso!`
            : `Você não atingiu a pontuação mínima`
          }
        </Title>
        
        <Subtitle>
          {challengeData?.program_name} - {challengeData?.track_name}
        </Subtitle>
        
        {challengeData && (
          <Subtitle style={{ marginTop: '0.5rem', fontSize: '1rem' }}>
            Nível: {getDifficultyText(challengeData.difficulty)}
          </Subtitle>
        )}

        <StatsContainer>
          <StatBox>
            <div className="label">Acertos</div>
            <div className="value">{correctAnswers}/{totalQuestions}</div>
          </StatBox>
          <StatBox>
            <div className="label">Pontuação</div>
            <div className="value">{scorePercentage.toFixed(1)}%</div>
          </StatBox>
        </StatsContainer>

        {!passed && (
          <Subtitle style={{ marginTop: '1.5rem', fontSize: '1rem', opacity: 0.9 }}>
            São necessários pelo menos 5 acertos (70%) para conquistar a badge
          </Subtitle>
        )}
      </CompletionCard>

      {loading && (
        <LoadingText>
          🔄 Processando resultado...
        </LoadingText>
      )}

      {error && (
        <ErrorContainer>
          <h3>⚠️ Atenção</h3>
          <p>{error}</p>
        </ErrorContainer>
      )}

      {/* Badge só aparece se passou */}
      {passed && <BadgeEarnedHandler badge={badgeEarned} />}

      {/* Mensagem de incentivo se não passou */}
      {!loading && !passed && !error && (
        <InfoCard>
          <h3>Continue praticando!</h3>
          <p>Você pode tentar novamente quantas vezes quiser para melhorar sua pontuação e conquistar a badge.</p>
        </InfoCard>
      )}

      {/* Mensagem de sucesso sem badge */}
      {!loading && passed && !badgeEarned && !error && (
        <InfoCard>
          <h3>✅ Desafio registrado com sucesso!</h3>
          <p>Você já conquistou esta badge anteriormente. Continue praticando para conquistar mais badges!</p>
        </InfoCard>
      )}

      <ButtonContainer>
        {!passed && (
          <ActionButton onClick={handleRetry} variant="primary">
            <FaSyncAlt /> Tentar Novamente
          </ActionButton>
        )}
        
        <Link to={getBackLink()}>
          <ActionButton variant="secondary">
            Voltar para trilha
          </ActionButton>
        </Link>
      </ButtonContainer>
    </PageWrapper>
  );
};

export default QuizCompletionPage;