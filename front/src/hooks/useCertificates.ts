import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchApprovedChallenges, getCertificateQuestions, getCompletedCertificates, getPersistentCertificates } from '../api';

export interface Certificate {
  id: string;
  title: string;
  program: 'PROIND' | 'PRODEPE' | 'PRODEAUTO';
  level: string;
  status: 'completed' | 'available' | 'blocked';
  isCompleted: boolean;
  downloadUrl?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  score?: number;
  earnedAt?: string;
  certificateId?: string;
}

export const useCertificates = () => {
  const { isLoggedIn } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🚀 Iniciando fetchCertificates...');
      console.log('🔍 Usuário logado?', isLoggedIn);

      // Buscar certificações persistentes do usuário
      let persistentCertificates: any[] = [];
      
      if (isLoggedIn) {
        try {
          console.log('🔍 Buscando certificações persistentes...');
          const persistentData = await getPersistentCertificates();
          console.log('✅ Resposta completa da API persistent:', persistentData);
          
          if (persistentData && persistentData.certificates && Array.isArray(persistentData.certificates)) {
            persistentCertificates = persistentData.certificates;
            console.log('✅ Certificações persistentes encontradas:', persistentCertificates.length);
            console.log('🔍 Detalhes das certificações:', persistentCertificates);
          } else {
            console.log('⚠️ Formato inesperado da resposta persistent:', persistentData);
            persistentCertificates = [];
          }
        } catch (err: any) {
          console.error('❌ Erro ao buscar certificações persistentes:', err);
          console.error('❌ Status do erro:', err.response?.status);
          console.error('❌ Dados do erro:', err.response?.data);
          persistentCertificates = [];
        }
      } else {
        console.log('⚠️ Usuário não está logado, pulando busca de certificações persistentes');
      }

      // Buscar desafios aprovados da API para certificados disponíveis
      console.log('🔍 Buscando desafios aprovados...');
      const approvedChallenges = await fetchApprovedChallenges();
      console.log('✅ Desafios aprovados recebidos:', approvedChallenges.length);

      // Filtrar apenas desafios com dificuldade HARD
      const hardChallenges = approvedChallenges.filter((challenge: any) => 
        challenge.difficulty === 'HARD'
      );
      console.log('🔍 Desafios HARD filtrados:', hardChallenges.length);

      // Agrupar por Program + Track para criar apenas um certificado por par
      const programTrackMap = new Map<string, Certificate>();
      
      // Primeiro, adicionar certificações persistentes (já completadas)
      console.log('🔍 Processando certificações persistentes...');
      persistentCertificates.forEach((cert: any) => {
        const key = `${cert.program}-${cert.track}`;
        console.log(`✅ Adicionando certificação persistente: ${key}`, cert);
        
        programTrackMap.set(key, {
          id: key,
          title: cert.certificate_name || `${cert.program} - ${cert.track}`,
          program: cert.program as 'PROIND' | 'PRODEPE' | 'PRODEAUTO',
          level: cert.track,
          status: 'completed',
          isCompleted: true,
          difficulty: 'HARD',
          score: cert.score,
          earnedAt: cert.earned_at,
          certificateId: cert.id
        });
      });
      
      console.log('🔍 Total de certificações completadas no map:', 
        Array.from(programTrackMap.values()).filter(c => c.isCompleted).length
      );
      
      // Agrupar desafios por Program + Track
      const challengesByProgramTrack = new Map<string, any[]>();
      
      hardChallenges.forEach((challenge: any) => {
        const program = challenge.program_name || 'PROIND';
        const track = challenge.track_name || 'T1';
        const key = `${program}-${track}`;
        
        // Só processar se não for uma certificação já persistente
        if (!programTrackMap.has(key)) {
          if (!challengesByProgramTrack.has(key)) {
            challengesByProgramTrack.set(key, []);
          }
          challengesByProgramTrack.get(key)!.push(challenge);
        }
      });
      
      console.log('🔍 Grupos de desafios por Program-Track:', challengesByProgramTrack.size);
      
      // Para cada grupo, verificar se tem questões suficientes fazendo uma chamada à API
      const certificatePromises = Array.from(challengesByProgramTrack.entries()).map(async ([key, challenges]) => {
        const [program, track] = key.split('-');
        
        try {
          // Fazer uma chamada de teste para verificar se há questões suficientes
          await getCertificateQuestions(program, track);
          
          console.log(`✅ Certificado disponível: ${key}`);
          
          // Se chegou até aqui, significa que há pelo menos 5 questões
          return {
            id: key,
            title: `${program} - ${track}`,
            program: program as 'PROIND' | 'PRODEPE' | 'PRODEAUTO',
            level: track,
            status: 'available' as const,
            isCompleted: false,
            difficulty: 'HARD' as const
          };
        } catch (error) {
          // Se a API retornou erro, significa que não há questões suficientes
          console.warn(`⚠️ Questões insuficientes para ${program}-${track}:`, error);
          return null;
        }
      });
      
      // Aguardar todas as verificações
      const certificateResults = await Promise.all(certificatePromises);
      
      // Adicionar apenas os certificados válidos
      certificateResults.forEach(certificate => {
        if (certificate) {
          programTrackMap.set(certificate.id, certificate);
        }
      });

      // Converter Map para array de certificados
      const certificates: Certificate[] = Array.from(programTrackMap.values());

      console.log('📊 RESUMO FINAL:');
      console.log('   Total de certificados:', certificates.length);
      console.log('   Certificados completados:', certificates.filter(c => c.isCompleted).length);
      console.log('   Certificados disponíveis:', certificates.filter(c => !c.isCompleted).length);
      console.log('📋 Lista de certificados completados:', 
        certificates.filter(c => c.isCompleted).map(c => ({ id: c.id, title: c.title }))
      );

      setCertificates(certificates);
    } catch (err: any) {
      console.error('❌ Erro fatal ao buscar certificados:', err);
      console.error('❌ Stack trace:', err.stack);
      setError('Erro ao carregar certificados');
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const searchCertificates = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      return certificates;
    }

    return certificates.filter(cert =>
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.program.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filterCompletedCertificates = () => {
    const completed = certificates.filter(cert => cert.isCompleted);
    console.log('🔍 filterCompletedCertificates chamado - Total:', certificates.length, 'Completados:', completed.length);
    return completed;
  };

  const getCompletedCertificatesCount = () => {
    return certificates.filter(cert => cert.isCompleted).length;
  };

  const filterAvailableCertificates = () => {
    const available = certificates.filter(cert => !cert.isCompleted && cert.status === 'available');
    console.log('🔍 filterAvailableCertificates - Total:', certificates.length, 'Disponíveis:', available.length);
    return available;
  };

  const groupCertificatesByProgram = (certs: Certificate[]) => {
    const grouped: { [key: string]: Certificate[] } = {};
    certs.forEach(cert => {
      if (!grouped[cert.program]) {
        grouped[cert.program] = [];
      }
      grouped[cert.program].push(cert);
    });
    return grouped;
  };

  return {
    certificates,
    loading,
    error,
    searchCertificates,
    getCompletedCertificates: filterCompletedCertificates,
    getCompletedCertificatesCount, 
    getAvailableCertificates: filterAvailableCertificates,
    groupCertificatesByProgram,
    refreshCertificates: fetchCertificates
  };
};
