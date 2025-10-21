import React from 'react';
import styles from './TrackDetailHeader.module.css';

import PROIND_T1 from '../../assets/images/PROIND/Cards das trilhas/PROIND-card-trilha01.png';
import PROIND_T2 from '../../assets/images/PROIND/Cards das trilhas/PROIND-card-trilha02.png';
import PROIND_T3 from '../../assets/images/PROIND/Cards das trilhas/PROIND-card-trilha03.png';
import PROIND_T4 from '../../assets/images/PROIND/Cards das trilhas/PROIND-card-trilha04.png';

import PRODEAUTO_T1 from '../../assets/images/PRODEAUTO/Cards das trilhas/PRODEAUTO-card-trilha01.png';
import PRODEAUTO_T2 from '../../assets/images/PRODEAUTO/Cards das trilhas/PRODEAUTO-card-trilha02.png';
import PRODEAUTO_T3 from '../../assets/images/PRODEAUTO/Cards das trilhas/PRODEAUTO-card-trilha03.png';
import PRODEAUTO_T4 from '../../assets/images/PRODEAUTO/Cards das trilhas/PRODEAUTO-card-trilha04.png';

import PRODEPE_T1 from '../../assets/images/PRODEPE/Cards das trilhas/PRODEPE-card-trilha01.png';
import PRODEPE_T2 from '../../assets/images/PRODEPE/Cards das trilhas/PRODEPE-card-trilha02.png';
import PRODEPE_T3 from '../../assets/images/PRODEPE/Cards das trilhas/PRODEPE-card-trilha03.png';
import PRODEPE_T4 from '../../assets/images/PRODEPE/Cards das trilhas/PRODEPE-card-trilha04.png';

type TrackDetailHeaderProps = {
  trilhaId: string; 
  title: string;
  description: string;
  programa: string;
};

const TrackDetailHeader = ({ trilhaId, title, description, programa }: TrackDetailHeaderProps) => {
  // Mapa completo com ID de trilha -> imagem e cor
  const trilhasConfig: Record<string, { imagem: string; cor: string }> = {
    // PROIND
    'proind-calculo-incentivo': { imagem: PROIND_T1, cor: '#72D4A1' },
    'proind-lançamentos-incentivo': { imagem: PROIND_T2, cor: '#72D4A1' },
    'proind-controle-suplementar': { imagem: PROIND_T3, cor: '#72D4A1' },
    'proind-concessao-incentivo': { imagem: PROIND_T4, cor: '#72D4A1' },

    // PRODEAUTO
    'prodeauto-calculo-incentivo': { imagem: PRODEAUTO_T1, cor: '#BDA3E4' },
    'prodeauto-lancamentos-incentivo': { imagem: PRODEAUTO_T2, cor: '#BDA3E4' },
    'prodeauto-controles-suplementares': { imagem: PRODEAUTO_T3, cor: '#BDA3E4' },
    'prodeauto-concessao-incentivo': { imagem: PRODEAUTO_T4, cor: '#BDA3E4' },

    // PRODEPE
    'prodepe-calculo-incentivo': { imagem: PRODEPE_T1, cor: '#BCE8E7' },
    'prodepe-lancamentos-incentivo': { imagem: PRODEPE_T2, cor: '#BCE8E7' },
    'prodepe-controles-suplementares': { imagem: PRODEPE_T3, cor: '#BCE8E7' },
    'prodepe-concessao-incentivo': { imagem: PRODEPE_T4, cor: '#BCE8E7' },
  };

  const trilhaConfig = trilhasConfig[trilhaId];
  const imagem = trilhaConfig?.imagem || PROIND_T1;
  const corDeFundo = trilhaConfig?.cor || '#ddd';

  return (
    <div className={styles.headerContainer} style={{ backgroundColor: corDeFundo }}>
      <div className={styles.leftContent}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
        <span className={styles.programTag}>{programa}</span>
      </div>

      <img
        src={imagem}
        alt={`Imagem da trilha ${title}`}
        className={styles.rightImage}
      />
    </div>
  );
};

export default TrackDetailHeader;