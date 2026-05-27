import asyncHandler from 'express-async-handler';

// Helper to provide context-aware mock subtasks when API key is not present
function getMockSubtasks(title) {
  const t = title.toLowerCase();
  if (t.includes('exam') || t.includes('test') || t.includes('prepare') || t.includes('study') || t.includes('operating systems')) {
    if (t.includes('operating systems') || t.includes('os')) {
      return [
        'Revise CPU Scheduling algorithms (FCFS, SJF, Round Robin)',
        'Study Deadlock prevention, avoidance, and Detection schemes',
        'Practice Memory Management concept calculations (Paging, Segmentation)',
        'Solve Previous Year Questions (PYQs) on Process Synchronization',
        'Review Virtual Memory and Page Replacement algorithms'
      ];
    }
    return [
      'Create a comprehensive study checklist and schedule study blocks',
      'Revise lecture notes, slides, and assigned textbook chapters',
      'Design active-recall flashcards for critical terms and formulas',
      'Solve 3-5 practice/previous year exam questions under timed conditions',
      'Review weak topics and hold a group discussion or review session'
    ];
  }
  if (t.includes('write') || t.includes('essay') || t.includes('paper') || t.includes('report') || t.includes('thesis')) {
    return [
      'Formulate a strong thesis statement and conduct preliminary research',
      'Create a detailed section-by-section outline (Intro, Body, Conclusion)',
      'Write the first draft focusing on logical arguments without self-editing',
      'Cite all academic references and build a comprehensive bibliography',
      'Proofread thoroughly for grammar, flow, clarity, and structural coherence'
    ];
  }
  if (t.includes('project') || t.includes('build') || t.includes('develop') || t.includes('code') || t.includes('app')) {
    return [
      'Define project requirements, scope, and mock up wireframes',
      'Set up database schemas, code repository, and developer environment',
      'Implement core features step-by-step and write test cases',
      'Test edge cases, fix outstanding bugs, and optimize performance',
      'Refine the UI/UX design and write setup documentation'
    ];
  }
  if (t.includes('math') || t.includes('calculus') || t.includes('solve') || t.includes('assignment') || t.includes('homework')) {
    return [
      'Review relevant formulas, rules, and example problems from class',
      'Solve the first set of foundational problems to build confidence',
      'Tackle advanced/complex problems and highlight challenging steps',
      'Format step-by-step solutions clearly for final submission',
      'Verify answers against keys or peer-review with a classmate'
    ];
  }
  if (t.includes('read') || t.includes('book') || t.includes('chapter') || t.includes('article')) {
    return [
      'Skim headings, summaries, and diagrams to grasp the overall structure',
      'Actively read sections and highlight core concepts or key quotes',
      'Summarize each chapter or section in your own words',
      'Create a list of open questions to clarify during lecture or office hours',
      'Review your summaries and test memory retrieval of main points'
    ];
  }
  // Default generic academic breakdown
  return [
    `Clarify exact requirements and rubric for "${title}"`,
    `Gather all lecture notes, textbook chapters, and research materials`,
    `Break the workload into 45-minute high-focus study blocks`,
    `Draft the main components, outlines, or summaries of the task`,
    `Self-assess the finished output against the initial requirements`
  ];
}

// @desc    Generate subtasks for a given study task using OpenAI
// @route   POST /api/tasks/breakdown
// @access  Private
export const generateSubtasks = asyncHandler(async (req, res) => {
  const { taskTitle } = req.body;

  if (!taskTitle || taskTitle.trim() === '') {
    return res.status(400).json({ message: 'Task title is required' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_openai_api_key_here') {
    console.warn('[AI Breakdown] No valid OPENAI_API_KEY found. Utilizing high-quality mock generator.');
    const mockSubtasks = getMockSubtasks(taskTitle);
    // Add a slight delay to simulate AI response time for skeleton loader testing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return res.json({
      subtasks: mockSubtasks,
      isMock: true,
      message: 'Generated using premium offline fallback AI (OpenAI API key not configured).'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Highly cost-effective and ultra-fast for simple parsing
        messages: [
          {
            role: 'system',
            content: 'You are a highly efficient academic assistant designed for college students. Your goal is to help students manage stress and workload by breaking down large tasks, study topics, or assignments into smaller, concise, and highly actionable subtasks (3 to 6 items maximum). You must respond with a JSON object. The object must contain a single key "subtasks" holding a simple flat array of strings representing these action items. No markdown, no additional conversational text.'
          },
          {
            role: 'user',
            content: `Break down this task: "${taskTitle}"`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[AI Breakdown] OpenAI API Error:', errText);
      return res.status(502).json({
        message: 'OpenAI API returned an error. Please verify your API key and quota.',
        details: errText
      });
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(resultText);

    if (parsed && Array.isArray(parsed.subtasks)) {
      return res.json({
        subtasks: parsed.subtasks,
        isMock: false
      });
    } else {
      console.error('[AI Breakdown] Unexpected format from OpenAI API:', parsed);
      return res.status(500).json({ message: 'AI returned an invalid response structure.' });
    }
  } catch (error) {
    console.error('[AI Breakdown] Server Error:', error);
    return res.status(500).json({
      message: 'Failed to connect to AI service.',
      error: error.message
    });
  }
});
