import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheck, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import BadgeEarnedHandler from '../components/badges/BadgeEarnedHandler';
import { Badge } from '../components/badges/BadgeDisplay';

const ResultContainer = styled.div`
  background-color: #ffffff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const FeedbackBanner = styled.div<{ passed: boolean }>`
  background-color: ${props => props.passed ? '#1e3a8a' : '#991b1b'};
  width: 100%;
  padding: 3rem 2rem;
  text-align: center;
  color: white;
  position: relative;
  border-radius: 0 0 20px 20px;
`;

const StatusIcon = styled.div<{ passed: boolean }>`
  width: 60px;
  height: 60px;
  background-color: ${props => props.passed ? '#3b82f6' : '#dc2626'};
  border: 2px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  font-size: 24px;
  color: white;
`;

const BannerTitle = styled.h1`
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 1rem 0;
  line-height: 1.3;
`;

const BannerSubtitle = styled.p`
  font-size: 1rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
`;

const ScoreDisplay = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1rem;
`;

const QuestionsSection = styled.div`
  width: 100%;
  max-width: 800px;
  padding: 2rem;
`;

const QuestionItem = styled.div`
  margin-bottom: 2rem;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
`;

const QuestionNumber = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-right: 0.5rem;
`;

const FeedbackText = styled.span<{ isCorrect: boolean }>`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => props.isCorrect ? '#059669' : '#dc2626'};
  margin-left: 0.5rem;
`;

const QuestionText = styled.p`
  font-size: 1rem;
  color: #1f2937;
  line-height: 1.5;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 2rem auto;
  flex-wrap: wrap;
`;

const ReturnButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#1e3a8a'};
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#5a6268' : '#1e40af'};
  }
`;

const InfoCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  color: #6c757d;
  max-width: 500px;
  margin: 1rem auto;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  
  h3 {
    color: #495057;
    margin-top: 0;
  }
`;

const LoadingText = styled.p`
  color: #6c757d;
  font-size: 1rem;
  margin: 1rem 0;
  text-align: center;
`;

const CertificateResultPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);
  
  const [badgeEarned, setBadgeEarned] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    score, 
    passed, 
    correctAnswers, 
    totalQuestions, 
    answers, 
    questions, 
    program, 
    track,
    certificateData 
  } = location.state || {};

  useEffect(() => {
    if (hasProcessed.current) {
      console.log('⚠️ Já processado, ignorando...');
      return;
    }

    const processBadge = () => {
      console.log('🔍 Dados recebidos no resultado:', { passed, certificateData });
      
      // Se passou e há badge no certificateData
      if (passed && certificateData?.badge_earned) {
        console.log('🏆 Badge de certificado detectada:', certificateData.badge_earned);
        setBadgeEarned(certificateData.badge_earned);
      } else if (passed && !certificateData?.badge_earned) {
        console.log('⚠️ Passou mas sem badge (já conquistada anteriormente)');
      } else {
        console.log('❌ Não passou - badge não será concedida');
      }
      
      setLoading(false);
    };

    hasProcessed.current = true;
    setTimeout(processBadge, 500);
  }, [passed, certificateData]);

  if (!location.state) {
    return (
      <ResultContainer>
        <FeedbackBanner passed={false}>
          <StatusIcon passed={false}>
            <FaExclamationTriangle />
          </StatusIcon>
          <BannerTitle>Erro</BannerTitle>
          <BannerSubtitle>Dados do resultado não encontrados.</BannerSubtitle>
          <ReturnButton onClick={() => navigate('/certificados')}>
            Voltar para Certificações
          </ReturnButton>
        </FeedbackBanner>
      </ResultContainer>
    );
  }

  const getFeedbackMessage = () => {
    if (passed) {
      return {
        title: `Parabéns! Você atingiu a média necessária para o teste de certificação ${program?.toUpperCase() || 'PROIND'}`,
        subtitle: "Você conquistou seu certificado e pode continuar sua jornada de aprendizado!"
      };
    } else {
      return {
        title: `Infelizmente você não atingiu a média necessária para o teste de certificação`,
        subtitle: "Mas não se preocupe! Você pode tentar novamente depois."
      };
    }
  };

  const feedback = getFeedbackMessage();

  const handleReturnToTrack = () => {
    navigate('/certificados');
  };

  const handleRetry = () => {
    navigate(`/certificados/${program}/${track}`);
  };

  return (
    <ResultContainer>
      <FeedbackBanner passed={passed}>
        <StatusIcon passed={passed}>
          {passed ? <FaCheck /> : <FaExclamationTriangle />}
        </StatusIcon>
        <BannerTitle>{feedback.title}</BannerTitle>
        <BannerSubtitle>{feedback.subtitle}</BannerSubtitle>
        <ScoreDisplay>{correctAnswers}/{totalQuestions} acertos ({score?.toFixed(1)}%)</ScoreDisplay>
        
        {!passed && (
          <BannerSubtitle style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
            São necessários pelo menos 4 acertos (80%) para conquistar o certificado e a badge
          </BannerSubtitle>
        )}
      </FeedbackBanner>

      {loading && (
        <LoadingText>
          🔄 Processando resultado...
        </LoadingText>
      )}

      {/* Badge Handler - só aparece se passou */}
      {passed && <BadgeEarnedHandler badge={badgeEarned} />}

      {/* Mensagem de incentivo se não passou */}
      {!loading && !passed && (
        <InfoCard>
          <h3>Continue praticando!</h3>
          <p>Você pode tentar novamente quantas vezes quiser para melhorar sua pontuação e conquistar o certificado e a badge platina.</p>
        </InfoCard>
      )}

      {/* Mensagem de sucesso sem badge (já tinha conquistado) */}
      {!loading && passed && !badgeEarned && (
        <InfoCard>
          <h3>✅ Certificado registrado com sucesso!</h3>
          <p>Você já conquistou esta badge anteriormente. Continue praticando para conquistar mais badges!</p>
        </InfoCard>
      )}

      <QuestionsSection>
        {questions && answers && questions.map((question: any, index: number) => {
          const userAnswer = answers.find((a: any) => a.question_id === question.id);
          const isCorrect = userAnswer?.is_correct || false;
          
          return (
            <QuestionItem key={question.id}>
              <QuestionHeader>
                <QuestionNumber>{index + 1}. Questão</QuestionNumber>
                <FeedbackText isCorrect={isCorrect}>
                  {isCorrect ? 'Você acertou!' : 'Você errou!'}
                </FeedbackText>
              </QuestionHeader>
              <QuestionText>{question.statement}</QuestionText>
            </QuestionItem>
          );
        })}
      </QuestionsSection>

      <ButtonContainer>
        {!passed && (
          <ReturnButton variant="primary" onClick={handleRetry}>
            <FaSyncAlt /> Tentar Novamente
          </ReturnButton>
        )}
        
        <ReturnButton variant="secondary" onClick={handleReturnToTrack}>
          Voltar para Certificações
        </ReturnButton>
      </ButtonContainer>
    </ResultContainer>
  );
};

export default CertificateResultPage;