// server/services/evaluationService.js

// Simple intelligent evaluation framework based on keyword density, answer length, and structured prompts.

const WEIGHTS = {
  motivation: 15,
  experience: 10,
  personality: 15,
  project: 25,
  problemSolving: 20,
  communication: 15
};

const KEYWORDS = {
  leadership: ['leader', 'lead', 'initiative', 'ownership', 'diriger', 'équipe', 'manager', 'impact', 'proactif'],
  teamwork: ['team', 'collaborate', 'ensemble', 'groupe', 'communiquer', 'partager', 'écoute', 'synergie'],
  problemSolving: ['solution', 'résoudre', 'analyser', 'stratégie', 'défi', 'challenge', 'surmonter', 'adaptation'],
  innovation: ['idée', 'projet', 'innovation', 'créer', 'imaginer', 'nouveau', 'amélioration', 'vision']
};

function analyzeText(text, lengthThreshold = 100) {
  if (!text || text.trim() === '') return { score: 0, feedback: "Unanswered" };
  
  const wordCount = text.trim().split(/\s+/).length;
  let score = 0;
  
  // Length scoring (up to 50% of the section score based on length heuristics)
  if (wordCount > lengthThreshold) score += 0.5;
  else if (wordCount > lengthThreshold / 2) score += 0.3;
  else score += 0.1;

  // Keyword scoring (up to 50%)
  const lowerText = text.toLowerCase();
  let keywordMatches = 0;
  Object.values(KEYWORDS).flat().forEach(kw => {
    if (lowerText.includes(kw)) keywordMatches++;
  });

  if (keywordMatches > 5) score += 0.5;
  else if (keywordMatches > 2) score += 0.3;
  else if (keywordMatches > 0) score += 0.1;

  // Cap at 1.0 (100% for this section)
  return {
    score: Math.min(score, 1.0),
    wordCount,
    keywordMatches,
    feedback: wordCount < lengthThreshold / 2 ? 'Too short/lacks detail' : 'Good detail'
  };
}

exports.evaluatePhase2 = (answers) => {
  const breakdown = {
    motivation: 0,
    experience: 0,
    personality: 0,
    project: 0,
    problemSolving: 0,
    communication: 0
  };

  // Evaluate Motivation
  const mot = analyzeText(answers.motivation, 80);
  breakdown.motivation = Math.round(mot.score * WEIGHTS.motivation);

  // Evaluate Experience
  const exp = analyzeText(answers.experience, 60);
  breakdown.experience = Math.round(exp.score * WEIGHTS.experience);

  // Evaluate Personality & Teamwork
  const pers = analyzeText(answers.personalityTeamwork, 80);
  breakdown.personality = Math.round(pers.score * WEIGHTS.personality);

  // Evaluate Project Ideation
  const proj = analyzeText(answers.projectIdeation, 120);
  breakdown.project = Math.round(proj.score * WEIGHTS.project);

  // Evaluate Problem Solving (combining behavioral & situational)
  const behTxt = (answers.behavioralThinking || '') + ' ' + (answers.situationalProblemSolving || '');
  const prob = analyzeText(behTxt, 150);
  breakdown.problemSolving = Math.round(prob.score * WEIGHTS.problemSolving);

  // Evaluate Communication (optional)
  if (answers.communication) {
    const comm = analyzeText(answers.communication, 80);
    breakdown.communication = Math.round(comm.score * WEIGHTS.communication);
  } else {
    // If not required, give them proportional average points or max out to not penalize
    breakdown.communication = WEIGHTS.communication; 
  }

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  let classification = 'None';
  let summary = '';

  if (totalScore >= 80) {
    classification = 'High Potential';
    summary = 'Excellent candidate. Shows strong leadership capability, structured thought process, and high motivation.';
  } else if (totalScore >= 50) {
    classification = 'Medium';
    summary = 'Solid candidate but lacks depth in certain areas. Good potential for growth.';
  } else {
    classification = 'Low';
    summary = 'Candidate provided superficial answers or lacks the required detail for advanced positions.';
  }

  return { totalScore, breakdown, classification, summary };
};
