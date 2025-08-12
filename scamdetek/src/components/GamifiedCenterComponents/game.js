import React, { Fragment, useState } from 'react';
import '../GamifiedCenter.css';
import level1_scoreA from '../../assets/img/level1_scoreA.png'; // 扣-10分
import level1_scoreB from '../../assets/img/level1_scoreB.png'; // +10分
import level1_scoreC from '../../assets/img/level1_scoreC.png'; // 0分
import scrollIcon from '../../assets/img/home-to-bottom.png';
import { gameList } from './gameList';

const Game = (props) => {
    const [showResult, setShowResult] = useState(false);
    const [fadeClass, setFadeClass] = useState('');
    const [option, setOption] = useState('');
    const [index, setIndex] = useState(0);

    const scoreImg = (point) => {
        if (point === -10) {
            return level1_scoreA;
        } else if (point === 10) {
            return level1_scoreB;
        } else if (point === 0) {
            return level1_scoreC;
        }

    }

    const handleOptionClick = (option, point) => {
        setOption(option);
        
        if (option === '') {
            // 滚动到顶部，有动画效果
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            setShowResult(false);
            if (index < gameList.length - 1) {
                setIndex(index + 1);
            } else {
                props.onPageChange('result');
            }
        } else {
            const newScore = Number(props.score) + Number(point);
            props.onScoreChange(newScore);
            setFadeClass('fade-out');
            setTimeout(() => {
                setShowResult(true);
                setFadeClass('fade-in');
            }, 400); // 动画时长与CSS一致
        }
    };

    return (
        <Fragment>
            <div className="back-button" onClick={() => props.onPageChange("home")}>
                ← Back to Gamified Center
            </div>
            <div className='game-title'>Phishing Scam</div>
            <div className='game-content'>
                <div className='game-step-bar'>
                    <div className='game-step-bar-inner' style={{ width: `${(index + 1) / (gameList.length) * 100}%` }}></div>
                </div>
                <div className='game-desc'>
                    <div className='game-desc-title-1 desc-font'>{gameList[index].description}</div>
                    <div className='game-desc-wrapper'>
                        <div className='game-desc-content-item'>
                            <img className='game-desc-content-item-img-left' src={gameList[index].imageLeft} alt='imageLeft' />
                        </div>
                        <div className='game-desc-content-item' style={{ marginTop: '30px' }}>
                            <div className='desc-font'>
                                {gameList[index].subDescription}
                            </div>
                            <div className='white-font'>{gameList[index].subDescription2}</div>
                            <img className='game-desc-content-item-img-right' src={gameList[index].imageRight} alt='imageRight' />
                        </div>
                    </div>
                </div>
                <div className='question-title'>{option === '' ? 'What do you do?' : 'What happened next?'}</div>
                <div className='question-tip'>{option === '' ? 'Click on the options below' : ''}</div>
                <img src={scrollIcon} alt='scrollIcon' className='scrollIcon' style={{ margin: '0 auto 80px auto' }} />
                <div style={{ display: showResult ? 'none' : 'block' }} className={fadeClass}>
                    <div className='question-option-wrapper'>
                        <div className='question-option-item' onClick={() => handleOptionClick('A', gameList[index].options[0].point)}>
                            <img className='question-option-item-img' src={gameList[index].options[0].image} alt='level1_optionA' />
                            {gameList[index].options[0].title}
                        </div>
                        <div className='question-option-item' onClick={() => handleOptionClick('B', gameList[index].options[1].point)}>
                            <img className='question-option-item-img' src={gameList[index].options[1].image} alt='level1_optionB' style={{ height: '390px', bottom: '-52px' }} />
                            {gameList[index].options[1].title}
                        </div>
                        <div className='question-option-item' onClick={() => handleOptionClick('C', gameList[index].options[2].point)}>
                            <img className='question-option-item-img' src={gameList[index].options[2].image} alt='level1_optionC' />
                            {gameList[index].options[2].title}
                        </div>
                    </div>
                </div>
                <div className='question-option-result'>
                    <div className='question-option-result-box' style={{ display: showResult ? 'block' : 'none' }}>
                        <div style={{ display: option === 'A' ? 'block' : 'none' }}>
                            <img className='question-option-result-box-show-img' src={gameList[index].options[0].result} alt='level1_resultA' />
                            {/* 如果当前option的point为-10则使用图片level1_scoreA，如果point为10则使用level1_scoreC，如果point为0则使用level1_scoreC */}
                            <img className='question-option-result-box-score-img' src={scoreImg(gameList[index].options[0].point)} alt='level1_scoreA' />
                            <div className='question-option-result-box-score-text'>{gameList[index].options[0].scoreText}</div>
                        </div>
                        <div style={{ display: option === 'B' ? 'block' : 'none' }}>
                            <img className='question-option-result-box-show-img' src={gameList[index].options[1].result} alt='level1_resultB' />
                            <img className='question-option-result-box-score-img' src={scoreImg(gameList[index].options[1].point)} alt='level1_scoreB' />
                            <div className='question-option-result-box-score-text'>{gameList[index].options[1].scoreText}</div>
                        </div>
                        <div style={{ display: option === 'C' ? 'block' : 'none' }}>
                            <img className='question-option-result-box-show-img' src={gameList[index].options[2].result} alt='level1_resultC' />
                            <img className='question-option-result-box-score-img' src={scoreImg(gameList[index].options[2].point)} alt='level1_scoreC' />
                            <div className='question-option-result-box-score-text'>{gameList[index].options[2].scoreText}</div>
                        </div>
                        <div className='next-level-btn' onClick={() => handleOptionClick('')}>Next Level</div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default Game;
