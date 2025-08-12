import React, {Fragment, useState} from 'react';
import Home from './GamifiedCenterComponents/home';
import Game from './GamifiedCenterComponents/game';
import Result from './GamifiedCenterComponents/result';

const GamifiedCenter = ({ onNavigate }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [score, setScore] = useState(0);

  // 把这个方法传递给Home组件
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Always scroll back to the top when we switch sub‐pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleScoreChange = (score) => {
    setScore(score);
  };

  return (
    <Fragment>
      {currentPage === 'home' && <Home onPageChange={handlePageChange} onNavigate={onNavigate} />}
      {currentPage === 'game' && <Game onScoreChange={handleScoreChange} score={score} onPageChange={handlePageChange} />}
      {currentPage === 'result' && <Result onPageChange={handlePageChange} score={score} />}
    </Fragment>
  );
};

export default GamifiedCenter;

