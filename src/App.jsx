import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Your backend API URL (use full URL if backend is on another host/port)
  const API_URL = 'http://127.0.0.1:8000/chat' // change to your backend URL

  const askRAG = async (question) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || `Request failed: ${res.status}`)
    }

    const data = await res.json()
    // Backend may return { answer }, { response }, or { text } — adjust as needed
    return data.answer ?? data.response ?? data.text ?? JSON.stringify(data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setIsLoading(true)

    try {
      const answer = await askRAG(text)
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>RAG Chat Bot</h1>
        <p>Ask a question — get an answer from your knowledge base</p>
      </header>

      <main className="chat">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">💬</span>
              <p>No messages yet. Type a question below to start.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <span className="message-role">{msg.role === 'user' ? 'You' : 'AI'}</span>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <span className="message-role">AI</span>
              <div className="message-content typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            autoFocus
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </button>
        </form>
      </main>
    </div>
  )
}

export default App
