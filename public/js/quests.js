export const QUESTS = {
    1: {
        id: 1, title: 'Registration', xp: 100, badge: 'badge_registration',
        desc: 'Verify your name in the electoral roll or register as a new voter.',
        task: 'Prove your knowledge to earn your badge.',
        questions: [
            { q: 'What is the minimum age to vote in India?', options: ['16', '18', '21'], ans: 1 },
            { q: 'Which form is used for new voter registration?', options: ['Form 6', 'Form 8', 'Form 7'], ans: 0 },
            { q: 'What is the official ECI portal for voter services?', options: ['voters.eci.gov.in', 'india.gov.in', 'eci.com'], ans: 0 }
        ]
    },
    2: {
        id: 2, title: 'Polling Station', xp: 200, badge: 'badge_polling',
        desc: 'Identify your local polling booth.',
        task: 'Answer to unlock.',
        questions: [
            { q: 'What document is sent to your house before elections?', options: ['Voter Slip', 'Aadhar Card', 'Ration Card'], ans: 0 },
            { q: 'Who manages the polling booth?', options: ['Police Officer', 'Presiding Officer', 'District Collector'], ans: 1 },
            { q: 'How do you find your booth online?', options: ['Google Maps', 'Electoral Search Portal', 'Social Media'], ans: 1 }
        ]
    },
    3: {
        id: 3, title: 'Candidates', xp: 300, badge: 'badge_candidates',
        desc: 'Research candidate affidavits.',
        task: 'Test your knowledge.',
        questions: [
            { q: 'What is an affidavit?', options: ['A sworn statement', 'A party ticket', 'A voting machine'], ans: 0 },
            { q: 'Which app shows candidate criminal records?', options: ['Voter Helpline App', 'Know Your Candidate (KYC)', 'WhatsApp'], ans: 1 },
            { q: 'Candidates must disclose their assets.', options: ['True', 'False', 'Only if asked'], ans: 0 }
        ]
    },
    4: {
        id: 4, title: 'Manifestos', xp: 400, badge: 'badge_measures',
        desc: 'Study party manifestos.',
        task: 'Complete to proceed.',
        questions: [
            { q: 'What is a manifesto?', options: ['A legal contract', 'A document of promises', 'A voting list'], ans: 1 },
            { q: 'When are manifestos usually released?', options: ['After voting', 'On voting day', 'Before elections'], ans: 2 },
            { q: 'Can a party be sued for not fulfilling manifestos?', options: ['Yes', 'No', 'Only the ruling party'], ans: 1 }
        ]
    },
    5: {
        id: 5, title: 'Voting Plan', xp: 500, badge: 'badge_vote',
        desc: 'Decide when and how you\'ll go to the polls.',
        task: 'Plan ahead.',
        questions: [
            { q: 'What time do polls usually open?', options: ['7:00 AM', '10:00 AM', '12:00 PM'], ans: 0 },
            { q: 'Can you vote without a Voter ID card?', options: ['No', 'Yes, with alternative ID like Aadhar', 'Only if BLO allows'], ans: 1 },
            { q: 'Are mobile phones allowed inside the voting compartment?', options: ['Yes', 'No', 'Only for photos'], ans: 1 }
        ]
    },
    6: {
        id: 6, title: 'BLO Connect', xp: 600, badge: 'badge_registration',
        desc: 'Know your Booth Level Officer.',
        task: 'Understand your local hero.',
        questions: [
            { q: 'What does BLO stand for?', options: ['Booth Level Officer', 'Block Liaison Officer', 'Base Level Operator'], ans: 0 },
            { q: 'Can a BLO help correct name spellings?', options: ['Yes', 'No', 'Only the Election Commissioner'], ans: 0 },
            { q: 'Who appoints the BLO?', options: ['Political Parties', 'Election Commission', 'Local Police'], ans: 1 }
        ]
    },
    7: {
        id: 7, title: 'Awareness', xp: 700, badge: 'badge_polling',
        desc: 'Help others understand the importance of their vote.',
        task: 'Spread the word.',
        questions: [
            { q: 'Which day is celebrated as National Voters\' Day?', options: ['Jan 26', 'Jan 25', 'Aug 15'], ans: 1 },
            { q: 'What is SVEEP?', options: ['A voting machine', 'Voter education program', 'A political party'], ans: 1 },
            { q: 'Is proxy voting allowed for ordinary citizens?', options: ['Yes', 'No', 'Only for seniors'], ans: 1 }
        ]
    },
    8: {
        id: 8, title: 'Final Pillar', xp: 1000, badge: 'badge_vote',
        desc: 'You are a fully informed voter.',
        task: 'Final test.',
        questions: [
            { q: 'What is NOTA?', options: ['None of the Above', 'New Output Testing Agency', 'National Organization'], ans: 0 },
            { q: 'Which machine is used for casting votes?', options: ['ATM', 'EVM', 'VVPAT only'], ans: 1 },
            { q: 'Voting is a...', options: ['Fundamental Right', 'Constitutional Right', 'Moral Duty'], ans: 1 }
        ]
    }
};

export const QUEST_ICONS = {
    1: 'fa-feather-pointed', 2: 'fa-compass', 3: 'fa-users-rectangle',
    4: 'fa-book-open', 5: 'fa-shield-halved', 6: 'fa-eye',
    7: 'fa-bullhorn', 8: 'fa-monument'
};

export const ASSET_BASE = 'https://storage.googleapis.com/electoquest-assets-silicon-garage-494118-a1';
