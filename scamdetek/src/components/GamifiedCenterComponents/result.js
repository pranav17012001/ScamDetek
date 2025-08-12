import React, { Fragment, useState } from 'react';
import '../GamifiedCenter.css';
import scoreGood from '../../assets/img/score_40to60.png';
import scoreMiddle from '../../assets/img/score_0to30.png';
import scoreBad from '../../assets/img/score_0to-60.png';
import cup from '../../assets/img/cup.png';

const Result = (props) => {
    const handlePageChange = (page) => {
        props.onPageChange(page);
    };
    return (
        <div className='result-container'>
            <div className='result-box'>
                <div className='result-box-title'>Tips</div>
                <div className='result-box-content'>Phishing scams combine urgent alerts, counterfeit websites, OTP harvesting, social-engineering calls, and malware distribution to overwhelm you. Always verify URLs and caller identities, refuse unsolicited downloads, use official channels for sensitive actions, and report suspicious activity immediately.</div>
                <div className='cap-bar'>
                    <img src={cup} alt="cup" style={{ width: '60px', verticalAlign: 'middle' }} />
                    <span style={{
                        color: '#fff700',
                        fontWeight: 'bold',
                        fontSize: '2rem',
                        marginLeft: '20px',
                        verticalAlign: 'middle'
                    }}>
                        Final score ：{props.score}
                    </span>
                </div>
                <div className='box-left-img-bar'>
                    {props.score >= 40 && props.score <= 60 && <img className='score-img' src={scoreGood} alt="scoreGood" />}
                    {props.score >= 0 && props.score <= 30 && <img className='score-img' src={scoreMiddle} alt="scoreMiddle" />}
                    {props.score >= -60 && props.score < 0 && <img className='score-img' src={scoreBad} alt="scoreBad" />}
                </div>
                <div className='box-button-bar'>
                    <button className="custom-btn" onClick={() => handlePageChange('game')}>Retry Again</button>
                    <button className="custom-btn" onClick={() => handlePageChange('home')}>Return<br />Gamified Center</button>
                </div>
            </div>
        </div>
    )
}

export default Result;