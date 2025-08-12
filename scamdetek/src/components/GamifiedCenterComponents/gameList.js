import game_1_pic_left from '../../assets/img/level1_scenario_image1.png';
import game_1_pic_right from '../../assets/img/level1_scenario_image2.png';
import level1_optionA from '../../assets/img/level1_optionA.png';
import level1_optionB from '../../assets/img/level1_optionB.png';
import level1_optionC from '../../assets/img/level1_optionC.png';
import level1_resultA from '../../assets/img/level1_resultA.png';
import level1_resultB from '../../assets/img/level1_resultB.png';
import level1_resultC from '../../assets/img/level1_resultC.png';
import level1_scoreA from '../../assets/img/level1_scoreA.png';
import level1_scoreB from '../../assets/img/level1_scoreB.png';
import level1_scoreC from '../../assets/img/level1_scoreC.png';

import level2_scenario_image1 from '../../assets/img/level2_scenario_image1.png';
import level2_scenario_image2 from '../../assets/img/level2_scenario_image2.png';
import level2_optionA from '../../assets/img/level2_optionA.png';
import level2_optionB from '../../assets/img/level2_optionB.png';
import level2_optionC from '../../assets/img/level2_optionC.png';
import level2_resultA from '../../assets/img/level2_resultA.png';
import level2_resultB from '../../assets/img/level2_resultB.png';
import level2_resultC from '../../assets/img/level2_resultC.png';

import level3_scenario_image1 from '../../assets/img/level3_scenario_image1.png';
import level3_scenario_image2 from '../../assets/img/level3_scenario_image2.png';
import level3_optionA from '../../assets/img/level3_optionA.png';
import level3_optionB from '../../assets/img/level3_optionB.png';
import level3_optionC from '../../assets/img/level3_optionC.png';
import level3_resultA from '../../assets/img/level3_resultA.png';
import level3_resultB from '../../assets/img/level3_resultB.png';
import level3_resultC from '../../assets/img/level3_resultC.png';

import level4_scenario_image1 from '../../assets/img/level4_scenario_image1.png';
import level4_scenario_image2 from '../../assets/img/level4_scenario_image2.png';
import level4_optionA from '../../assets/img/level4_optionA.png';
import level4_optionB from '../../assets/img/level4_optionB.png';
import level4_optionC from '../../assets/img/level4_optionC.png';
import level4_resultA from '../../assets/img/level4_resultA.png';
import level4_resultB from '../../assets/img/level4_resultB.png';
import level4_resultC from '../../assets/img/level4_resultC.png';

import level5_scenario_image1 from '../../assets/img/level5_scenario_image1.png';
import level5_scenario_image2 from '../../assets/img/level5_scenario_image2.png';
import level5_optionA from '../../assets/img/level5_optionA.png';
import level5_optionB from '../../assets/img/level5_optionB.png';
import level5_optionC from '../../assets/img/level5_optionC.png';
import level5_resultA from '../../assets/img/level5_resultA.png';
import level5_resultB from '../../assets/img/level5_resultB.png';
import level5_resultC from '../../assets/img/level5_resultC.png';

import level6_scenario_image1 from '../../assets/img/level6_scenario_image1.png';
import level6_scenario_image2 from '../../assets/img/level6_scenario_image2.png';
import level6_optionA from '../../assets/img/level6_optionA.png';
import level6_optionB from '../../assets/img/level6_optionB.png';
import level6_optionC from '../../assets/img/level6_optionC.png';
import level6_resultA from '../../assets/img/level6_resultA.png';
import level6_resultB from '../../assets/img/level6_resultB.png';
import level6_resultC from '../../assets/img/level6_resultC.png';


export const gameList = [
    {
        id: 1,
        title: 'Scam Survival',
        description: 'Your name is Aishah Rahman, a 29-year-old marketing executive in Kuala Lumpur.',
        subDescription: 'As you sip your morning coffee at 8 am, your phone buzzes with an SMS:',
        subDescription2: 'MyBank: Your account is frozen.Reactivate now ➜ mybank-secure.com"',
        imageLeft: game_1_pic_left,
        imageRight: game_1_pic_right,
        options: [
            {
                id: 'A',
                title: 'Click the link immediately, worried about your home-down-payment savings.',
                image: level1_optionA,
                result: level1_resultA,
                score: level1_scoreA,
                scoreText: 'You land on a convincing fake site ',
                point: -10
            },
            {
                id: 'B',
                title: 'Grab your debit card and call the number printed on it.',
                image: level1_optionB,
                result: level1_resultB,
                score: level1_scoreB,
                scoreText: 'You verify through the official channel ',
                point: 10
            },
            {
                id: 'C',
                title: 'Ignore the message for now and discuss it with your fiancé later',
                image: level1_optionC,
                result: level1_resultC,
                score: level1_scoreC,
                scoreText: 'You avoid the trap',
                point: 0
            }
        ]
    },
    {
        id: 2,
        title: 'Phishing Scam',
        description: 'Later, curiosity gets the better of you, and you tap the link. ',
        subDescription: 'The page looks just like MyBank’s homepage',
        subDescription2: 'except there’s no padlock icon and the URL has a subtle typo.',
        imageLeft: level2_scenario_image1,
        imageRight: level2_scenario_image2,
        options: [
            {
                id: 'A',
                title: 'Enter your username and password, hoping to “unfreeze” your account',
                image: level2_optionA,
                result: level2_resultA,
                score: level1_scoreA,
                scoreText: 'Your credentials are stolen',
                point: -10
            },
            {
                id: 'B',
                title: 'Inspect the URL closely, realize it’s wrong, then close the tab',
                image: level2_optionB,
                result: level2_resultB,
                score: level1_scoreB,
                scoreText: 'You expose the fake domain ',
                point: 0
            },
            {
                id: 'C',
                title: 'Open your bank’s official app and use its link scanner',
                image: level2_optionC,
                result: level2_resultC,
                score: level1_scoreC,
                scoreText: 'You detect the malicious link',
                point: 10
            }
        ]
    },
    {
        id: 3,
        title: 'Phishing Scam',
        description: 'A prompt appears:“For security, we’ve sent a 6-digit OTP to your phone. Enter within two minutes.”',
        subDescription: 'Your phone buzzes again, it’s the real OTP from MyBank.',
        subDescription2: 'You hesitate, nervous about what might happen next.',
        imageLeft: level3_scenario_image1,
        imageRight: level3_scenario_image2,
        options: [
            {
                id: 'A',
                title: 'Type in the real OTP without hesitation',
                image: level3_optionA,
                result: level3_resultA,
                score: level1_scoreA,
                scoreText: 'You give scammers full access ',
                point: -10
            }, 
            {
                id: 'B',
                title: 'Close the page and ignore further prompts',
                image: level3_optionB,
                result: level3_resultB,
                score: level1_scoreB, 
                scoreText: 'You block the phishing attempt ',
                point: 0
            },
            {
                id: 'C',
                title: 'Forward the SMS to MyBank’s official fraud email',
                image: level3_optionC,
                result: level3_resultC,
                score: level1_scoreC,
                scoreText: 'You alert the real bank ',
                point: 10
            }
        ]

    },
    {
        id: 4,
        title: 'Phishing Scam',
        description: 'Moments later, your phone rings. It says: “I\'m Aaron from MyBank, please verify your balance immediately.”',
        subDescription: 'You feel the pressure',
        subDescription2: 'between work deadlines and wedding planning.',
        imageLeft: level4_scenario_image1,
        imageRight: level4_scenario_image2,
        options: [
            {
                id: 'A',
                title: 'Ask for Aaron’s employee ID and search it online',
                image: level4_optionA,
                result: level4_resultA,
                score: level1_scoreA,
                scoreText: 'You discover it’s fake',
                point: 10
            },  
            {
                id: 'B',
                title: 'Answer and provide your account details',
                image: level4_optionB,
                result: level4_resultB, 
                score: level1_scoreA,
                scoreText: 'You reveal sensitive information ',
                point: -10
            },
            {
                id: 'C',
                title: 'Hang up and call MyBank’s official support number',
                image: level4_optionC,
                result: level4_resultC,
                score: level1_scoreA,
                scoreText: 'You confirm the truth ',
                point: 0
            }
        ]

    },
    {
        id: 5,
        title: 'Phishing Scam',
        description: 'Aaron sends you an email with a file named ShieldGuard.apk, claiming it will help lift the freeze. ',
        subDescription: 'He sounds professional ',
        subDescription2: 'almost trustworthy.',
        imageLeft: level5_scenario_image1,
        imageRight: level5_scenario_image2,
        options: [
            {
                id: 'A',
                title: 'Ask for an official app-store link instead',
                image: level5_optionA,
                result: level5_resultA,
                score: level1_scoreA,
                scoreText: 'You avoid sideloaded malware ',
                point: 0
            },
            {
                id: 'B',
                title: 'Refuse to install anything not from a trusted source',
                image: level5_optionB,
                result: level5_resultB,
                score: level1_scoreB,
                scoreText: 'You block the malware vector',
                point: 10
            },
            {
                id: 'C',
                title: ' Download the APK and grant full permissions',
                image: level5_optionC,
                result: level5_resultC,
                score: level1_scoreC,
                scoreText: 'You install malware that can drain your account',
                point: -10
            }
        ]
    },
    {
        id: 6,
        title: 'Phishing Scam',
        description: 'Later that evening, you check your real MyBank app and see multiple large withdrawals pending.',
        subDescription: 'Panic sets in',
        subDescription2: 'your fiancé will see them too.',
        imageLeft: level6_scenario_image1,
        imageRight: level6_scenario_image2,
        options: [
            {
                id: 'A',
                title: 'Try to cancel them directly in the app',
                image: level6_optionA,
                result: level6_resultA,
                score: level1_scoreA,
                scoreText: 'You intercept some transfers ',
                point: 0
            },
            {
                id: 'B',
                title: ' Call MyBank’s official fraud hotline immediately',
                image: level6_optionB,
                result: level6_resultB,
                score: level1_scoreB,
                scoreText: 'You halt further losses',
                point: 10
            },
            {
                id: 'C',
                title: ' Do nothing and hope the bank reverses them',
                image: level6_optionC,
                result: level6_resultC,
                score: level1_scoreC,
                scoreText: 'The funds are lost ',
                point: -10
            }
        ]
    }
    
]
