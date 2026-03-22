import { useState } from 'react'
import './App.css'
import { translateCode } from './api/openrouter'

const DIFFICULTIES = [
  { id: '초등학생', emoji: '🌱' },
  { id: '중학생', emoji: '📚' },
  { id: '비전공 성인', emoji: '💼' },
]

function App() {
  const [code, setCode] = useState('')
  const [difficulty, setDifficulty] = useState('초등학생')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleTranslate = async () => {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await translateCode(code, difficulty)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <span className="header-logo">코드 번역기</span>
        <span className="header-sub">코드를 누구나 이해할 수 있는 언어로</span>
      </header>

      <main className="main">
        <div className="panel panel-dark">
          <div className="panel-top">
            <span className="panel-label">입력 코드</span>
            {result && (
              <span className="lang-badge">{result.detected_language} · 자동 감지됨</span>
            )}
          </div>
          <textarea
            className="code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="코드를 붙여넣으세요..."
            spellCheck={false}
          />
          <div className="difficulty-selector">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={`diff-btn ${difficulty === d.id ? 'active' : ''}`}
                onClick={() => setDifficulty(d.id)}
              >
                {d.emoji} {d.id}
              </button>
            ))}
          </div>
          <button
            className="translate-btn"
            onClick={handleTranslate}
            disabled={loading || !code.trim()}
          >
            {loading ? '번역 중...' : '코드 번역하기'}
          </button>
        </div>

        <div className="panel panel-light">
          <div className="panel-top">
            <span className="panel-label">번역 결과</span>
          </div>

          {!result && !loading && !error && (
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <p>코드를 입력하고 번역하기를 눌러보세요</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <div className="spinner" />
              <p>번역 중입니다...</p>
            </div>
          )}

          {error && (
            <div className="empty-state error-state">
              <span className="empty-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {result && !loading && (
            <div className="result-card">
              <div className="result-section">
                <span className="result-label">✏️ 한 줄로 말하면</span>
                <p className="result-summary">"{result.summary}"</p>
              </div>
              <div className="result-section">
                <span className="result-label">🍎 쉽게 비유하면</span>
                <p className="result-analogy">{result.analogy}</p>
              </div>
              <div className="result-section">
                <span className="result-label">🔑 핵심 개념</span>
                <div className="concept-tags">
                  {result.key_concepts.map((concept, i) => (
                    <span key={i} className="concept-tag">{concept}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
