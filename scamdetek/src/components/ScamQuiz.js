import React, { useState, useEffect, useRef } from "react";
import QuizStartPage from "./QuizStartPage";

const ScamQuiz = ({ onNavigate }) => {
  // State variables
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [readyForNext, setReadyForNext] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [confetti, setConfetti] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);
  
  // Refs for explosion animation
  const correctMessageRef = useRef(null);
  const incorrectMessageRef = useRef(null);
  
  // Function to create explosion particles
  const createExplosionEffect = (element, color) => {
    if (!element) return;
    
    // Clear any existing particles
    const existingParticles = element.querySelectorAll('.particle');
    existingParticles.forEach(particle => particle.remove());
    
    // Create new particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position around the center
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      
      // Random movement direction
      const xMove = (Math.random() - 0.5) * 100;
      particle.style.setProperty('--x-move', `${xMove}px`);
      
      // Set position
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      
      // Set animation
      particle.style.animation = `particle ${0.5 + Math.random() * 0.5}s forwards`;
      
      // Add to DOM
      element.appendChild(particle);
    }
  };
  
  // Generate confetti for perfect score
  const generateConfetti = () => {
    const confettiCount = 150;
    const colors = ['#4FD1C5', '#68D391', '#F6E05E', '#FC8181', '#B794F4', '#63B3ED'];
    const newConfetti = [];

    for (let i = 0; i < confettiCount; i++) {
      newConfetti.push({
        id: i,
        x: Math.random() * 100, // random x position (0-100%)
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 5, // 5-13px
        animationDuration: Math.random() * 3 + 2, // 2-5s
      });
    }

    setConfetti(newConfetti);
    
    // Clear confetti after animation is done
    setTimeout(() => {
      setConfetti([]);
    }, 8000);
  };

  // Effect to trigger explosion animation when answered
  useEffect(() => {
    if (answered) {
      if (selectedAnswer !== null && quizQuestions[currentQuestion]?.answerOptions[selectedAnswer].isCorrect) {
        setTimeout(() => {
          createExplosionEffect(correctMessageRef.current, '#2ecc71');
        }, 100);
      } else {
        setTimeout(() => {
          createExplosionEffect(incorrectMessageRef.current, '#e74c3c');
        }, 100);
      }
    }
  }, [answered, selectedAnswer, currentQuestion, quizQuestions]);

  // Check for perfect score when showing results
  useEffect(() => {
    if (showScore && score === quizQuestions.length) {
      generateConfetti();
    }
  }, [showScore, score, quizQuestions.length]);

  // First question bank - with images (14 questions)
  const imageQuestionBank = [
    {
      questionText: `At 9pm, you get a Facebook message from your friend Amira. You've helped Amira before. But something feels off - her messages don't sound like her usual style.
      <br><br>
      What do you do?`,
      answerOptions: [
        { answerText: 'A. Transfer the money immediately - she is your friend, after all.', isCorrect: false },
        { answerText: 'B. Call Amira\'s actual number to verify her situation.', isCorrect: true },
        { answerText: 'C. Ask a few questions only Amira would know.', isCorrect: false },
      ],
      explanation: 'Explanation: This is a common scam where hackers take over a friend\'s social media account and pretend to be in urgent need of help. While your instinct may be to help, sending money without verification puts you at serious risk. Asking personal questions might help, but experienced scammers can improvise or stall. The safest option is to contact your friend through another method - like calling or texting their actual phone number - to confirm if the request is real.',
      imageUrl: '/images/quiz/quiz1.png'
    },
    {
      questionText: `You received an email, as shown in the image. 
      <br><br> 
      Do you think this is a phishing email?`,
      answerOptions: [
        { answerText: 'A. Legitimate email', isCorrect: false },
        { answerText: 'B. Phishing email', isCorrect: true },
      ],
      explanation: 'Explanation: The email claims to be from Coca-Cola, but the sending address is very random - not impossible for a legitimate email, but a sign. And the content - even the text - is all in the image. While used in some legitimate communications, this technique is used to avoid detection. So this email is very likely a phishing email - don\'t click on any links carelessly.',
      imageUrl: '/images/quiz/quiz2.png'
    },
    {
      questionText: `While browsing Facebook after dinner, you come across a polished video ad showing young Malaysians claiming they've earned RM5,000 in just one week through a crypto investment app. Testimonials fill the comments section.
<div class="message-quote">"Start with only RM500 and watch your money grow fast! DM us now!"</div>
You're saving for a holiday, and this seems like a quick way to top up your budget.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Click the link and sign up immediately, transferring RM500.', isCorrect: false },
        { answerText: 'B. Message the page asking for a phone call to learn more.', isCorrect: false },
        { answerText: 'C. Search the app name + "scam" online and find multiple red flags and police reports.', isCorrect: true },
      ],
      explanation: 'Explanation: This is a classic social media investment scam that relies on flashy videos and fake testimonials to lure victims. The promise of fast, guaranteed returns is a major red flag. Clicking the link or even chatting with the page gives scammers a chance to pressure you into handing over money or personal info. The smartest response is to step back and do your research - a quick online search can reveal scam warnings and help you avoid falling into the trap.',
      imageUrl: '/images/quiz/quiz3.png'
    },
    {
      questionText: `You receive two text messages, but you did not try to reset your password.
      <br><br>
      What do you do?`,
      answerOptions: [
        { answerText: 'A. Reply to the unknown number with "CANCEL 131025" to stop the reset.', isCorrect: false },
        { answerText: 'B. Ignore the code and assume it was a mistake.', isCorrect: false },
        { answerText: 'C. Do not reply to any number. Immediately check your Google account activity and change your password.', isCorrect: true },
      ],
      explanation: 'Explanation: Never share a two-step code outside of a real-time verification process that you initiated, such as a website login or while on the phone with your bank. When possible, you should also consider unphishable options such as passkeys or using a phone as a security key.',
      imageUrl: '/images/quiz/quiz4.png'
    },
    {
      questionText: 'Your account seems to be under attack again. Do you think this is a phishing email or a genuine security alert?',
      answerOptions: [
        { answerText: 'A. Phishing email', isCorrect: true },
        { answerText: 'B. Legitimate email', isCorrect: false },
      ],
      explanation: 'Explanation: This is based on a real warning, but links to a fake login page. Google.support is an unused address.',
      imageUrl: '/images/quiz/quiz5.png'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span>  You received a job offer through WhatsApp, but the sender did not provide any official documents such as a company contract or job description, and they used only a personal number instead of an official email.
      <br><br>
      What should your next step be?`,
      answerOptions: [
        { answerText: 'A. Agree to join and wait for them to send "first task instructions" via WhatsApp.', isCorrect: false },
        { answerText: 'B. Contact JobStreet or the official Verizon recruitment page directly to check whether your information was shared with this employer.', isCorrect: true },
        { answerText: 'C. Ask for a formal job letter or video call to verify the offer.', isCorrect: false },
      ],
      explanation: 'Explanation: Be careful, this is a classic job scam tactic. Scammers often use WhatsApp to send fake offers that seem too good to be true, without any official email, contract, or job details. Do not be fooled. Responding or asking for more info can still lead to pressure tactics, like paying "registration" fees. Protect yourself never share personal info and always verify directly with the company or trusted job platforms like JobStreet. Stay alert, your safety comes first.',
      imageUrl: '/images/quiz/quiz6.png'
    },
    {
      questionText: `You scroll through Instagram and see an ad for a minimalist fashion shop. The photos are aesthetic and the reviews in the comments are glowing. You message them to order a linen dress and transfer RM129 to the bank account they provided.
A week passes. The parcel hasn't arrived. You message again - this time, your messages are marked as seen but not replied to.
      <br><br>
      What do you do?`,
      answerOptions: [
        { answerText: 'A. Wait a few more days - maybe the courier is just slow.', isCorrect: false },
        { answerText: 'B. Leave a comment on their latest post asking for a response.', isCorrect: false },
        { answerText: 'C. Screenshot the chat, report the page to Instagram and lodge a complaint with the National Consumer Complaints Centre (NCCC)', isCorrect: true },
      ],
      explanation: 'Explanation: This is a classic case of an Instagram shopping scam. Scammers use visually appealing photos and fake positive comments to appear trustworthy, then disappear after receiving payment. Waiting or commenting gives them more time to block you or remove your messages. The best action is to document everything, report the account to the platform, and file an official complaint through the proper consumer protection channel. This not only protects you, but also helps warn and protect others.',
      imageUrl: '/images/quiz/quiz7.png'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span> At 7:14 PM, you receive a text message from an unfamiliar number (011-1155 9452). The message looks urgent and even shows an exact point amount. You recall using TnG recently and wonder if this is real. A red exclamation icon appears beside the message.
      <br><br>
      What would you do?`,
      answerOptions: [
        { answerText: 'A. Click the link immediately to secure your points before they expire', isCorrect: false },
        { answerText: 'B. Copy the link to open it in incognito mode, just to see what it says', isCorrect: false },
        { answerText: 'C. Ignore the message and directly visit the official Touch \'n Go app or website to check the status of your points', isCorrect: true },
      ],
      explanation: 'Explanation: This is a textbook example of a phishing scam that uses urgency and familiarity to trick you. The message looks real because it includes your recent activity and specific details, but that\'s part of the scammer\'s strategy. Clicking the link - even in incognito mode - can still expose your personal data or lead to credential theft. The safest way to respond is to avoid interacting with the message and instead verify your account status directly through the official Touch \'n Go app or website. When in doubt, always go to the source - not the link.',
      imageUrl: '/images/quiz/quiz8.png'
    },
    {
      questionText: 'You receive a delivery message like this, and coincidentally, you did purchase something a few days ago. You click the link, which redirects you to a website that looks like an official page. Do you think this is a scam?',
      answerOptions: [
        { answerText: 'A. scam', isCorrect: true },
        { answerText: 'B. not scam', isCorrect: false },
      ],
      explanation: 'Explanation: This is a typical phishing website. Although it is disguised as Pos Malaysia\'s official online payment page, there are several red flags indicating it\'s a scam. First, it uses a small payment amount of RM1.37 as bait to lower your guard and trick you into entering your full credit card information including the card number, expiry date, and CVV security code. Once submitted, this information can be used to fraudulently charge your account. Secondly, legitimate courier services will never request sensitive card details directly on a webpage like this; they will redirect you to a secure, trusted payment gateway. Moreover, the page lacks order numbers, tracking references, secure payment indicators, or a legitimate domain. It\'s likely a fake site designed to mimic the official style. Even though the layout looks professional, the true purpose is to steal your financial information.',
      imageUrl: '/images/quiz/quiz9.png'
    },
    {
      questionText: `You see a Facebook ad promoting a "new launch" condo project in Shah Alam. A woman named Emily messages you.
      <br><br>
      What do you do?`,
      answerOptions: [
        { answerText: 'A. Transfer the money - she seems official and has credentials.', isCorrect: false },
        { answerText: 'B. Call the developer\'s hotline to verify her name and whether this promo exists.', isCorrect: true },
        { answerText: 'C. Ask for her office number and arrange to meet in person.', isCorrect: false },
      ],
      explanation: 'Explanation: This is a common real estate scam where scammers pose as certified agents and use real-looking documents to gain your trust. Even if the person shares a REN certificate or pricing brochure, that doesn\'t guarantee legitimacy - credentials can be misused or faked. Transferring money directly to a personal bank account is a major red flag. The safest approach is to independently contact the property developer through their official hotline to verify both the agent\'s identity and the promotion. Always confirm through trusted sources before making any payment.',
      imageUrl: '/images/quiz/quiz10.png'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span>  You receive a text message. You're confused, you used Netflix last night. The message looks convincing and even has the Netflix logo.
What do you do?`,
      answerOptions: [
        { answerText: 'A. Ignore the message and go directly to the Netflix app or website to check your billing status.', isCorrect: true },
        { answerText: 'B. Click the link to investigate but stop before submitting any data', isCorrect: false },
        { answerText: 'C. Click the link and enter your credit card details to fix the payment issue.', isCorrect: false },
      ],
      explanation: 'Explanation: Do not fall for it! That Netflix issue message is a scam. It might look real, with logos and urgent warnings—but it is just a trick to steal your credit card info. Even clicking the link can secretly harm your device. It\'s scary how real these scams look, but don\'t panic. Always check your account through the real Netflix app or website. Stay calm, stay smart, and never trust links in random messages',
      imageUrl: '/images/quiz/quiz11.png'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span> You receive a text message from an unknown number.
      <br><br>
      What should you do?`,
      answerOptions: [
        { answerText: 'A. Click the link and quickly pay the toll', isCorrect: false },
        { answerText: 'B. Reply with "Y" as instructed', isCorrect: false },
        { answerText: 'C. Ignore the message, and report it as spam.', isCorrect: true },
      ],
      explanation: 'Explanation: This type of SMS scam relies on urgency and fear - making you think you\'ve missed a toll payment and must act fast. But that\'s exactly what scammers want: a rushed, emotional response. Whether you click the link or reply to the message, you risk exposing your personal or financial information. The smartest move is to stay calm, ignore the message, and check your toll status through official apps or websites like Touch \'n Go or MyRFID. By doing so, you protect your data and avoid falling into a trap.',
      imageUrl: '/images/quiz/quiz12.png'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span>  You receive a WhatsApp message from a number using a BigPay Business Account logo. Minutes later, you receive a call from the same number. The caller speaks very quickly and says things like:
<div class="message-quote">"No need to worry, we don't need full info. Just last 4 digits of your IC for verification. Also for internal security, please don't hang up, this process must be completed in one go."</div>
Toward the end, they ask you to provide a 6-digit OTP that you just received via SMS.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Hang up, block the number, and check BigPay\'s official website or app for any rewards.', isCorrect: true },
        { answerText: 'B. Provide the OTP and partial IC as requested', isCorrect: false },
        { answerText: 'C. Ask them to call back later so you can verify through BigPay\'s website.', isCorrect: false },
      ],
      explanation: 'Explanation: This is a classic example of a social engineering scam that combines urgency, fake authority, and partial information to lower your guard. Scammers often say they don\'t need your full IC to appear less threatening, but even partial details plus an OTP can allow them to reset your account or steal your money. Asking them to call back may delay the scam, but it doesn\'t stop it. The safest move is to hang up immediately, block the number, and verify any prize claims directly through BigPay\'s official app or website. Legitimate companies will never rush you or ask for sensitive codes over WhatsApp.',
      imageUrl: '/images/quiz/quiz13.png'
    },
    {
      questionText: 'What do you think about this job?',
      answerOptions: [
        { answerText: 'A. Maybe the real job', isCorrect: false },
        { answerText: 'B. It is a job scam', isCorrect: true },
      ],
      explanation: 'Explanation: This is very likely a scam, falling under the common category of "high-paying part-time jobs + task-based commission scams." Job hunting should be done through formal platforms with proper contracts. Don\'t trust any high-return tasks that seem too simple.',
      imageUrl: '/images/quiz/quiz14.png'
    }
  ];

  // Second question bank - text only (8 questions)
  const textQuestionBank = [
    {
      questionText: `<span class="phone-icon">&#128222;</span> You receive a call from someone claiming to be from LHDN. They say you owe RM3,200 in taxes and will be taken to court unless you settle today.
They sound official, provide a "case ID," and offer to "connect you to an officer."
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Transfer the money - you are scared of being arrested.', isCorrect: false },
        { answerText: 'B. Ask for a letter to be sent to your home.', isCorrect: false },
        { answerText: 'C. Hang up and call LHDN official hotline to check.', isCorrect: true },
      ],
      explanation: 'Explanation: This is a typical phone scam using fear and urgency to pressure you into paying. Scammers may sound official and even give a case ID, but real government agencies like LHDN will never ask for payments over the phone. Transferring money or staying on the line plays into their trap. The safest response is to hang up and call the official hotline to verify the claim.'
    },
    {
      questionText: `<span class="email-icon">&#128231;</span> You received this email from "netflix-account@security-check.com":
<div class="message-quote">"Dear Customer, We've detected unusual activity on your Netflix account. Your payment method has been declined. To avoid service interruption, please verify your payment details by clicking the link below."</div>
<br>
The email looks official with Netflix logo and formatting.`,
      answerOptions: [
        { answerText: 'A. Click the link and update your payment information.', isCorrect: false },
        { answerText: 'B. Reply to the email asking for more information.', isCorrect: false },
        { answerText: 'C. Ignore the email and check your Netflix account directly by typing netflix.com in your browser.', isCorrect: true },
      ],
      explanation: 'This is a phishing attempt that mimics Netflix. The suspicious domain "security-check.com" is a red flag. Legitimate companies use their own domains for official communications. Never click on links in suspicious emails. Instead, go directly to the official website by typing the address in your browser, or use the official app to check your account status.'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span> After applying to a job via JobStreet, you receive an interview call the next day. The caller uses a local number, speaks fluent English, and introduces himself with a valid REN (Real Estate Negotiator) ID and company name.
You attend a video call interview. The next morning, he emails you an offer letter - with the logo of a known company - and asks you to "complete HR verification" by uploading your IC, a utility bill, and bank slip via a file-sharing link.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Send all requested documents because the interview felt real and the documents look official.', isCorrect: false },
        { answerText: 'B. Ask the sender to copy your supervisor in the email.', isCorrect: false },
        { answerText: 'C. Call the company using a verified phone number and ask HR to confirm the hiring process.', isCorrect: true },
      ],
      explanation: 'Explanation: Even if the interview felt real and the documents look official, scammers can still fake identities, use real company logos, and request sensitive documents for fraudulent purposes - such as applying for loans under your name. Asking them to loop in others might not help, as email headers can be spoofed. The safest way to verify any job offer is by contacting the company directly using a phone number from their official website.'
    },
    {
      questionText: `<span class="alert-icon">&#128680;</span> You receive a call from someone claiming to be from Bukit Aman police. They say your identity card was used in a money laundering case, and you must "verify your assets" to clear your name. They offer to record your statement via call.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Hang up and consult the local police station.', isCorrect: true },
        { answerText: 'B. Ask them to send an official letter or come in person.', isCorrect: false },
        { answerText: 'C. Answer all their questions and disclose your bank accounts.', isCorrect: false },
      ],
      explanation: 'Explanation: This is a common scam tactic where fraudsters impersonate police to intimidate you into giving up sensitive information. Even if they claim your identity is involved in a crime, real police will never ask you to verify assets or record statements over the phone. Providing your bank details can lead to financial loss. Asking for documents will not help either - scammers will avoid anything traceable. The safest move is to hang up and consult your nearest police station directly.'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span> You receive a call from someone claiming to be from Malaysian Customs. The caller says:
<div class="message-quote">"You have a parcel detained at KLIA suspected of containing illegal items. We need your IC number and home address for verification. Otherwise, legal action will be taken."</div>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Provide your IC number and address to avoid trouble.', isCorrect: false },
        { answerText: 'B. Refuse and hang up. Then call the official Royal Malaysia Customs hotline.', isCorrect: true },
        { answerText: 'C. Tell them you will call back later and end the call.', isCorrect: false },
      ],
      explanation: 'Explanation: This is a scare tactic used by scammers pretending to be customs officers. They create panic by mentioning legal consequences and use it to trick you into giving up personal information like your IC and address. Even delaying the call without verifying still puts you at risk if you later engage. The safest action is to hang up immediately and call the official Royal Malaysia Customs hotline to confirm if the claim is real.'
    },
    {
      questionText: `<span class="phone-icon">&#128222;</span> You receive a phone call from an unfamiliar number: <strong>+113818415</strong>. It's an automated voice message that says:<div class="message-quote">"This is an alert from CIMB. A charge of RM2,837 has just been made using your credit card ending with 5873.<br><br>If you authorized this transaction, press 1.<br> If not, press 2 to speak to a CIMB officer now."</div>You're shocked because you didn't use your card recently.<br><br>What do you do?`,
      answerOptions: [
        { answerText: 'A. Press 2 to speak to the "officer" and follow their instructions to transfer your money for safety.', isCorrect: false },
        { answerText: 'B. Stay on the line and ask for the officer\'s full name and employee ID.', isCorrect: false },
        { answerText: 'C. Hang up immediately and call the official CIMB hotline printed on the back of your card.', isCorrect: true },
      ],
      explanation: 'Explanation: This scam uses fear and urgency to pressure you into acting without thinking. The automated message sounds convincing, but it\'s designed to trick you into speaking with a fake officer who will guide you to "secure" your money - by transferring it to the scammer. Even asking for credentials doesn\'t help, as scammers often prepare fake names and IDs. The safest move is to hang up immediately and call the official bank hotline found on your card to verify the situation.'
    },
    {
      questionText: `<span class="mobile-icon">&#128241;</span> Your colleague shares a finance app claiming "guaranteed 20% monthly profit." You download it. It looks legitimate and even shows fake user testimonials.
They ask you to deposit RM500 and promise to refund it if you are unhappy. Within 3 days, your dashboard shows you have earned RM140. You are told to deposit RM2,000 to unlock withdrawals.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Top up RM2,000 to get access to the full profit.', isCorrect: false },
        { answerText: 'B. Ask others in the app Telegram group what they did.', isCorrect: false },
        { answerText: 'C. Check if the app is registered with Bank Negara or SC Malaysia - it is not.', isCorrect: true },
      ],
      explanation: 'Explanation: This is a classic investment scam disguised as a high-yield app. The initial small profit is just bait to build your trust and push you to invest more. Once you top up, you may never be able to withdraw your money. Asking others in the Telegram group will not help those users are often part of the scam. The smartest move is to check if the platform is registered with official financial regulators like Bank Negara or the Securities Commission. If it is not, it is not safe.'
    },
    {
      questionText: `<span class="mobile-icon">&#128241;</span> At night, you receive a text message:
<div class="message-quote">[Shopee Security Alert] Suspicious login detected on your account.
To avoid account suspension, please scan the QR code below to verify your identity.</div>
After scanning the code, the page prompts you to enter your bank OTP.
<br><br>
What do you do?`,
      answerOptions: [
        { answerText: 'A. Enter your bank OTP code', isCorrect: false },
        { answerText: 'B. Scan the code but refuse to enter the OTP', isCorrect: false },
        { answerText: 'C. Refuse to scan the QR code and call the bank hotline to verify', isCorrect: true },
      ],
      explanation: 'Explanation: This is a phishing scam disguised as a security alert. Scammers use urgency to trick you into scanning a QR code that leads to a fake site. Once you enter your OTP, they can immediately access your bank account and steal your funds. Even scanning the code without submitting anything can put your device at risk. The safest response is to avoid interacting with the message at all and call your bank\'s official hotline to confirm if there\'s really an issue.'
    },
  ];

  // Get random questions from both banks
  const getRandomQuestions = () => {
    // Shuffle question banks
    const shuffledImageQuestions = [...imageQuestionBank].sort(() => 0.5 - Math.random());
    const shuffledTextQuestions = [...textQuestionBank].sort(() => 0.5 - Math.random());
    
    // Select 3 questions from bank 1
    const selectedImageQuestions = shuffledImageQuestions.slice(0, 3);
    
    // Select 2 questions from bank 2
    const selectedTextQuestions = shuffledTextQuestions.slice(0, 2);
    
    // Combine and shuffle again
    return [...selectedImageQuestions, ...selectedTextQuestions].sort(() => 0.5 - Math.random());
  };

  // Generate random questions when component loads
  useEffect(() => {
    setQuizQuestions(getRandomQuestions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerClick = (index) => {
    setSelectedAnswer(index);
  };
  
  const handleSubmit = () => {
    setAnswered(true);
    
    if (selectedAnswer !== null && quizQuestions[currentQuestion].answerOptions[selectedAnswer].isCorrect) {
      setScore(score + 1);
    }
    
    setReadyForNext(true);
  };
  
  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion);
      setAnswered(false);
      setSelectedAnswer(null);
      setReadyForNext(false);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    // Regenerate random questions
    setQuizQuestions(getRandomQuestions());
    setCurrentQuestion(0);
    setShowScore(false);
    setScore(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setReadyForNext(false);
    setQuizStarted(false);
  };

  const getButtonClass = (index) => {
    if (!answered) {
      return selectedAnswer === index ? "answer-button selected" : "answer-button";
    }
    
    if (quizQuestions[currentQuestion]?.answerOptions[index].isCorrect) {
      return "answer-button correct";
    } else if (index === selectedAnswer) {
      return "answer-button incorrect";
    }
    
    return "answer-button";
  };

  const getCorrectAnswerIndex = () => {
    return quizQuestions[currentQuestion]?.answerOptions.findIndex(option => option.isCorrect) || 0;
  };

  // Function to safely render HTML content
  const createMarkup = (html) => {
    return { __html: html };
  };

  // Navigate function to handle internal navigation
  const navigateToKnowledgeHub = () => {
    if (onNavigate) {
      onNavigate("knowledge");
    } else {
      // Fallback if onNavigate is not provided
      window.location.href = '#/knowledge';
    }
  };

  // Handle image click, open modal
  const handleImageClick = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Close modal when clicking outside
  const handleModalBackgroundClick = (e) => {
    if (e.target.classList.contains('modal-background')) {
      closeModal();
    }
  };

  // When questions are not loaded yet, show loading state
  if (quizQuestions.length === 0) {
    return (
      <div className="quiz-container">
        <h1 className="quiz-title">
          <span className="gradient-text">Loading Quiz...</span>
        </h1>
      </div>
    );
  }
  
  // Show start page if quiz hasn't started yet
  if (!quizStarted) {
    return <QuizStartPage onStartQuiz={handleStartQuiz} onNavigate={onNavigate} />;
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">
        <span className="gradient-text">Scam Snap</span>
      </h1>
      <p className="quiz-description">
        Test your knowledge about common scams and improve your self-protection awareness
      </p>

      {/* Confetti for perfect score */}
      {confetti.length > 0 && (
        <div className="confetti-container">
          {confetti.map((c) => (
            <div
              key={c.id}
              className="confetti"
              style={{
                left: `${c.x}%`,
                width: `${c.size}px`,
                height: `${c.size}px`,
                backgroundColor: c.color,
                animationDuration: `${c.animationDuration}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Image zoom modal */}
      {showModal && (
        <div 
          className="modal-background" 
          onClick={handleModalBackgroundClick}
        >
          <div className="modal-content">
            <button className="modal-close-btn" onClick={closeModal}>×</button>
            <img 
              src={modalImageSrc} 
              alt="Enlarged question" 
              className="modal-img" 
            />
          </div>
        </div>
      )}

      {showScore ? (
        <div className="score-section">
          {score === quizQuestions.length ? (
            <div className="perfect-score">
              <h2 className="perfect-title">
                <span className="celebration-emoji">&#127881;</span> 
                Congratulations! 
                <span className="celebration-emoji">&#127882;</span>
              </h2>
              <div className="score-badge">
                Perfect Score! {score}/{quizQuestions.length}
              </div>
            </div>
          ) : (
            <>
              <h2>Quiz Completed!</h2>
              <p>Your Score: {score} / {quizQuestions.length}</p>
            </>
          )}
          
          <div className="score-feedback">
            {score === quizQuestions.length ? (
              <p>Excellent! You are very knowledgeable about protecting yourself from scams!</p>
            ) : score >= quizQuestions.length * 0.7 ? (
              <p>Good job! But there's still room for improvement. It's important to learn more about scam prevention.</p>
            ) : (
              <p>We recommend learning more about scam prevention to improve your self-protection abilities.</p>
            )}
          </div>
          <button className="restart-button" onClick={restartQuiz}>
            Restart Quiz
          </button>
          {score < quizQuestions.length && (
            <button onClick={navigateToKnowledgeHub} className="knowledge-hub-button">
              Go to Knowledge Hub
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="progress-bar-container">
            {Array(quizQuestions.length).fill(0).map((_, index) => {
              // Only light up the block after the current question is answered
              const isActive = index < currentQuestion || (index === currentQuestion && answered);
              // Light up all blocks when the last question is answered
              const isLastQuestionAnswered = currentQuestion === quizQuestions.length - 1 && answered;
              
              return (
                <div 
                  key={index}
                  className={`progress-step ${isActive || isLastQuestionAnswered ? 'progress-step-active' : ''}`}
                ></div>
              );
            })}
          </div>
          <div className="question-section">
            <div className="question-count">
              <span>Scenario {currentQuestion + 1}</span>/{quizQuestions.length}
            </div>
            <div 
              className="question-text"
              dangerouslySetInnerHTML={createMarkup(quizQuestions[currentQuestion].questionText)}
            ></div>
            
            {/* Modified image section with click event */}
            {quizQuestions[currentQuestion].imageUrl && (
              <div className="question-image">
                <img 
                  src={quizQuestions[currentQuestion].imageUrl} 
                  alt="Question illustration" 
                  className="question-img" 
                  onClick={() => handleImageClick(quizQuestions[currentQuestion].imageUrl)}
                  style={{ cursor: 'pointer' }}
                  title="Click to enlarge"
                />
                <div className="zoom-indicator"></div>
              </div>
            )}
          </div>
          <div className="answer-section">
            {quizQuestions[currentQuestion].answerOptions.map((answerOption, index) => (
              <button
                key={index}
                onClick={() => !answered && handleAnswerClick(index)}
                className={getButtonClass(index)}
                disabled={answered && readyForNext}
              >
                {answerOption.answerText}
              </button>
            ))}
          </div>
          
          {!answered ? (
            <button 
              className="next-button" 
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              Submit Answer
            </button>
          ) : (
            <>
              <div className="feedback-message">
                {selectedAnswer !== null && quizQuestions[currentQuestion].answerOptions[selectedAnswer].isCorrect ? (
                  <p className="correct-message" ref={correctMessageRef}>Correct!</p>
                ) : (
                  <>
                    <p className="incorrect-message" ref={incorrectMessageRef}>Incorrect!</p>
                    <p className="correct-answer">
                      The correct answer is: <span className="highlight-answer">
                        {quizQuestions[currentQuestion].answerOptions[getCorrectAnswerIndex()].answerText}
                      </span>
                    </p>
                  </>
                )}
                <p className="explanation">
                  {quizQuestions[currentQuestion].explanation}
                </p>
              </div>
              {readyForNext && (
                <button 
                  className="next-button" 
                  onClick={handleNextQuestion}
                >
                  {currentQuestion < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ScamQuiz; 