// AdminSefaz.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';
import StatsCards from '../components/admin/StatsCards';
import ChallengesGrid from '../components/admin/ChallengesGrid';
import BackButton from '../components/common/BackButton';
import ToastManager from '../components/common/ToastManager';
import { useToast } from '../hooks/useToast';
import { FiPlus } from 'react-icons/fi';
import { fetchPendingChallenges, fetchApprovedChallenges, updateChallengeStatus, deleteChallenge } from '../api'; 

const AdminWrapper = styled.div`
  background-color: #f4f5fa;
  min-height: 100vh;
`;

const MainContent = styled.main`
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Removed BackLink styled component - using BackButton component instead

const PageTitle = styled.h1`
  margin: 0;
  font-size: 2rem;
  color: #333;
`;

const TopSection = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
`;

const GenerateButton = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #2f3a7d;
  color: #fff;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s;
  &:hover { background-color: #212529; }
`;


const AdminSefaz: React.FC = () => {
    const [challenges, setChallenges] = useState<any[]>([]);
    const [approvedCount, setApprovedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const { toasts, showSuccess, showError, removeToast } = useToast();

    useEffect(() => {
        const loadChallenges = async () => {
            try {
                // Carregar desafios pendentes
                const pendingData = await fetchPendingChallenges();
                const formattedChallenges = pendingData.map((challenge: any) => ({
                    id: challenge.id,
                    title: `Desafio ${challenge.id} - ${challenge.title}`,
                    tags: [
                        challenge.program_name || 'Programa',
                        challenge.track_name || 'Trilha',
                        `Nível: ${challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}`
                    ]
                }));
                setChallenges(formattedChallenges);

                // Carregar contagem de desafios aprovados
                const approvedData = await fetchApprovedChallenges();
                setApprovedCount(approvedData.length);
            } catch (error) {
                console.error('Erro ao carregar desafios:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChallenges();
    }, []);

    const handleApproveChallenge = async (challengeId: number) => {
        try {
            await updateChallengeStatus(challengeId, 'APPROVED');
            // Recarregar ambas as listas
            const pendingData = await fetchPendingChallenges();
            const approvedData = await fetchApprovedChallenges();
            
            const formattedChallenges = pendingData.map((challenge: any) => ({
                id: challenge.id,
                title: `Desafio ${challenge.id} - ${challenge.title}`,
                tags: [
                    challenge.program_name || 'Programa',
                    challenge.track_name || 'Trilha',
                    `Nível: ${challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}`
                ]
            }));
            setChallenges(formattedChallenges);
            setApprovedCount(approvedData.length);
            showSuccess('Sucesso!', 'Desafio aprovado com sucesso!');
        } catch (error) {
            console.error('Erro ao aprovar desafio:', error);
            showError('Erro', 'Erro ao aprovar desafio. Tente novamente.');
        }
    };

    const handleDeleteChallenge = async (challengeId: number) => {
        if (window.confirm('Tem certeza que deseja excluir este desafio? Esta ação não pode ser desfeita.')) {
            try {
                await deleteChallenge(challengeId);
                // Recarregar ambas as listas
                const pendingData = await fetchPendingChallenges();
                const approvedData = await fetchApprovedChallenges();
                
                const formattedChallenges = pendingData.map((challenge: any) => ({
                    id: challenge.id,
                    title: `Desafio ${challenge.id} - ${challenge.title}`,
                    tags: [
                        challenge.program_name || 'Programa',
                        challenge.track_name || 'Trilha',
                        `Nível: ${challenge.difficulty === 'EASY' ? 'Fácil' : challenge.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}`
                    ]
                }));
            setChallenges(formattedChallenges);
            setApprovedCount(approvedData.length);
            showSuccess('Sucesso!', 'Desafio excluído com sucesso!');
        } catch (error) {
            console.error('Erro ao excluir desafio:', error);
            showError('Erro', 'Erro ao excluir desafio. Tente novamente.');
        }
        }
    };

  return (
    <AdminWrapper>
      <MainContent>
        <div>
          <PageHeader>
            <BackButton to="/" />
            <PageTitle>Administrador Sefaz</PageTitle>
          </PageHeader>
        </div>
        <TopSection>
            <div style={{ flexGrow: 1 }}>
                <StatsCards 
                    activeStat="Desafios Gerados" 
                    pendingCount={challenges.length}
                    approvedCount={approvedCount}
                />
            </div>
            <GenerateButton to="/admin/gerador">
                <FiPlus /> Gerar Desafios
            </GenerateButton>
        </TopSection>
        {loading ? (
            <div>Carregando desafios...</div>
        ) : (
            <ChallengesGrid 
                title="Desafios Pendentes" 
                challenges={challenges} 
                showApproveButton={true}
                onApprove={handleApproveChallenge}
                onDelete={handleDeleteChallenge}
            />
        )}
      </MainContent>
      <ToastManager toasts={toasts} onRemoveToast={removeToast} />
    </AdminWrapper>
  );
};

export default AdminSefaz;