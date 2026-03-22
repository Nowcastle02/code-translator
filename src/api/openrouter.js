const OPENROUTER_API_URL = import.meta.env.DEV
  ? '/openrouter/api/v1/chat/completions'
  : '/api/translate'

const DIFFICULTY_PROMPT = {
  '초등학생': '초등학생도 이해할 수 있도록 매우 쉬운 일상 언어와 비유로 설명해주세요. 복잡한 단어는 피해주세요.',
  '중학생': '중학생 수준에서 이해할 수 있도록 설명해주세요. 적절한 비유를 활용해도 됩니다.',
  '비전공 성인': '비전공 성인을 대상으로, 일상 생활의 경험에 빗대어 이해하기 쉽게 설명해주세요.',
}

export async function translateCode(code, difficulty) {
  const messages = [
    {
      role: 'system',
      content: `당신은 코드를 비전공자도 이해할 수 있는 언어로 번역해주는 "코드 번역기"입니다.
프로그래밍 언어를 자동으로 감지하고, 모든 설명은 한국어로 작성하세요.
${DIFFICULTY_PROMPT[difficulty]}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:
{
  "detected_language": "감지된 프로그래밍 언어 (예: Python, JavaScript, Java)",
  "summary": "코드의 핵심 동작을 한 문장으로 요약",
  "analogy": "일상적인 비유로 코드를 설명 (2-4문장)",
  "key_concepts": ["핵심개념1", "핵심개념2", "핵심개념3"],
  "difficulty": "${difficulty}"
}`,
    },
    {
      role: 'user',
      content: `다음 코드를 번역해주세요:\n\n\`\`\`\n${code}\n\`\`\``,
    },
  ]

  const isdev = import.meta.env.DEV
  const headers = { 'Content-Type': 'application/json' }
  if (isdev) {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`
  }

  const body = isdev
    ? JSON.stringify({ model: 'openai/gpt-4o-mini', messages })
    : JSON.stringify({ messages })

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers,
    body,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || `API 오류: ${response.status}`)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('응답이 없습니다.')

  const match = content.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('JSON 응답을 찾을 수 없습니다.')

  return JSON.parse(match[0])
}
