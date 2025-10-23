import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import StatsCards from '../components/admin/StatsCards';
import ChallengesGrid from '../components/admin/ChallengesGrid';
import BackButton from '../components/common/BackButton';
import ToastManager from '../components/common/ToastManager';
import ConfirmModal from '../components/common/ConfirmModal';
import { useToast } from '../hooks/useToast';
import { fetchApprovedChallenges, fetchPendingChallenges, deleteChallenge } from '../api';


const PageWrapper = styled.div`
  background-color: #f4f5fa;
  min-height: 100vh;
`;

const MainContent = styled.main`
  padding: 2rem 3rem;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: #333;
`;

const ApprovedChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<number | null>(null);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  useEffect(() => {
    const loadChallenges = async () => {
      try {
        // Carregar desafios aprovados
        const approvedData = await fetchApprovedChallenges();
        const formattedChallenges = approvedData.map((challenge: any) => ({
          id: challenge.id,
          title: `Desafio ${challenge.id} - ${challenge.title}`,
          tags: [
            challenge.program_name || 'Programa',
            challenge.track_name || 'Trilha',
            `Nível: ${challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}`
          ]
        }));
        setChallenges(formattedChallenges);

        // Carregar contagem de desafios pendentes
        const pendingData = await fetchPendingChallenges();
        setPendingCount(pendingData.length);
      } catch (error) {
        console.error('Erro ao carregar desafios aprovados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChallenges();
  }, []);

  const handleDeleteChallenge = (challengeId: number) => {
    setChallengeToDelete(challengeId);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!challengeToDelete) return;
    
    try {
      await deleteChallenge(challengeToDelete);
      // Recarregar ambas as listas
      const approvedData = await fetchApprovedChallenges();
      const pendingData = await fetchPendingChallenges();
      
      const formattedChallenges = approvedData.map((challenge: any) => ({
        id: challenge.id,
        title: `Desafio ${challenge.id} - ${challenge.title}`,
        tags: [
          challenge.program_name || 'Programa',
          challenge.track_name || 'Trilha',
          `Nível: ${challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}`
        ]
      }));
      setChallenges(formattedChallenges);
      setPendingCount(pendingData.length);
      showSuccess('Sucesso!', 'Desafio excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir desafio:', error);
      showError('Erro', 'Erro ao excluir desafio. Tente novamente.');
    } finally {
      setShowConfirmModal(false);
      setChallengeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setChallengeToDelete(null);
  };

  return (
    <PageWrapper>
      <MainContent>
        <PageHeader>
          <BackButton to="/admin" />
          <PageTitle>Desafios Aprovados</PageTitle>
        </PageHeader>
        <div style={{ margin: '2rem 0' }}>
            {/* Aqui passamos a prop para destacar o card correto */}
            <StatsCards 
                activeStat="Desafios Aprovados" 
                pendingCount={pendingCount}
                approvedCount={challenges.length}
            />
        </div>
        
        {/* E aqui passamos o título e a lista de desafios aprovados */}
        {loading ? (
          <div>Carregando desafios aprovados...</div>
        ) : (
          <ChallengesGrid 
            title="Desafios Aprovados" 
            challenges={challenges} 
            showApproveButton={false}
            onDelete={handleDeleteChallenge}
          />
        )}

      </MainContent>
      <ToastManager toasts={toasts} onRemoveToast={removeToast} />
      <ConfirmModal
        isOpen={showConfirmModal}
        title="Confirmar exclusão"
        message="Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </PageWrapper>
  );
};

export default ApprovedChallenges;