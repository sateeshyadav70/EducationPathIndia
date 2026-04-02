import { useEffect, useMemo, useState } from 'react'
import { colleges } from '../data/colleges.js'

const initialMessages = [
  { id: 1, from: 'bot', text: 'Hi! Ask me about the best colleges under a budget or by placement.' },
]

function parseBudget(text) {
  const match = text.match(/(\d+(?:\.\d+)?)/)
  if (!match) return null
  const value = Number(match[1])
  if (Number.isNaN(value)) return null
  return value
}

function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const apiUrl = import.meta.env.VITE_CHATBOT_API

  useEffect(() => {
    const stored = window.localStorage.getItem('chatbotHistory')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length) setMessages(parsed)
      } catch {
        setMessages(initialMessages)
      }
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('chatbotHistory', JSON.stringify(messages))
  }, [messages])

  const quickReplies = useMemo(
    () => [
      'Best colleges under 5 lakh',
      'Top placement colleges',
      'Show top rated colleges',
    ],
    [],
  )

  const getResponse = (text) => {
    const lowered = text.toLowerCase()
    const budget = parseBudget(lowered)
    if (lowered.includes('under') || lowered.includes('budget')) {
      if (budget) {
        const filtered = colleges
          .filter((college) => (college.feesValue || 0) <= budget)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 3)
        if (filtered.length === 0) {
          return `No colleges found under ${budget}L right now. Try a higher budget.`
        }
        return `Top options under ${budget}L: ${filtered.map((c) => c.name).join(', ')}.`
      }
      return 'Tell me your budget in lakhs, like “under 5 lakh”.'
    }
    if (lowered.includes('placement')) {
      const top = [...colleges]
        .sort((a, b) => (b.placementValue || 0) - (a.placementValue || 0))
        .slice(0, 3)
      return `Best placement colleges: ${top.map((c) => c.name).join(', ')}.`
    }
    if (lowered.includes('top') || lowered.includes('best') || lowered.includes('rated')) {
      const top = [...colleges].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)
      return `Top rated colleges: ${top.map((c) => c.name).join(', ')}.`
    }
    return 'I can help with budget, placements, or top rated colleges. Try a quick suggestion.'
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return
    const nextUser = { id: Date.now(), from: 'user', text }
    setMessages((prev) => [...prev, nextUser])
    setInput('')
    setLoading(true)
    try {
      if (apiUrl) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })
        if (!response.ok) throw new Error('API error')
        const data = await response.json()
        const replyText = data.reply || data.message || getResponse(text)
        setMessages((prev) => [...prev, { id: Date.now() + 1, from: 'bot', text: replyText }])
      } else {
        const reply = { id: Date.now() + 1, from: 'bot', text: getResponse(text) }
        setMessages((prev) => [...prev, reply])
      }
    } catch {
      const reply = { id: Date.now() + 1, from: 'bot', text: getResponse(text) }
      setMessages((prev) => [...prev, reply])
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setMessages(initialMessages)
    window.localStorage.removeItem('chatbotHistory')
  }

  return (
    <div className={`chatbot${open ? ' open' : ''}`}>
      <button className="chatbot-toggle" type="button" onClick={() => setOpen((prev) => !prev)}>
        {open ? 'Close' : 'College Guide'}
      </button>
      {open && (
        <div className="chatbot-window">
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`chatbot-message ${message.from}`}>
                {message.text}
              </div>
            ))}
          </div>
          <div className="chatbot-quick">
            {quickReplies.map((item) => (
              <button key={item} type="button" onClick={() => sendMessage(item)}>
                {item}
              </button>
            ))}
            <button type="button" className="reset" onClick={handleReset}>
              Reset
            </button>
          </div>
          <form
            className="chatbot-input"
            onSubmit={(event) => {
              event.preventDefault()
              sendMessage(input)
            }}
          >
            <input
              type="text"
              placeholder="Ask: best college under 5 lakh?"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={loading}
            />
            <button className="btn primary" type="submit" disabled={loading}>
              {loading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Chatbot
