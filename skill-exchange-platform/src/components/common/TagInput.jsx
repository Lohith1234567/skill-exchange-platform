import { useState, useRef } from 'react'

/**
 * TagInput component
 * Props:
 * - label?: string
 * - value: string[]
 * - onChange: (tags: string[]) => void
 * - placeholder?: string
 * - maxTags?: number
 * - className?: string
 */
const TagInput = ({
  label,
  value = [],
  onChange,
  placeholder = 'Type and press Enter…',
  maxTags,
  className = '',
}) => {
  const [input, setInput] = useState('')
  const inputRef = useRef(null)

  const clean = (str) => str.trim().replace(/\s+/g, ' ')

  const addTag = (raw) => {
    const t = clean(raw)
    if (!t) return
    if (maxTags && value.length >= maxTags) return
    if (value.some((v) => v.toLowerCase() === t.toLowerCase())) return
    onChange([...value, t])
    setInput('')
  }

  const removeTag = (idx) => {
    const next = value.filter((_, i) => i !== idx)
    onChange(next)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    const { key } = e
    if ((key === 'Enter' || key === ',' || key === ';') && input.trim()) {
      e.preventDefault()
      addTag(input)
    } else if (key === 'Backspace' && !input && value.length) {
      // Remove last tag when input empty
      e.preventDefault()
      removeTag(value.length - 1)
    }
  }

  const handleBlur = () => {
    // Add pending token on blur
    if (input.trim()) addTag(input)
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      )}
      <div
        className="min-h-[46px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-sm"
            >
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => removeTag(idx)}
                className="-mr-1 rounded-full p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-800 hover:text-indigo-800 dark:hover:text-indigo-300"
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="flex-1 min-w-[120px] border-0 focus:ring-0 outline-none py-1 text-gray-900 dark:text-white bg-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>
      {maxTags && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{value.length}/{maxTags} tags</p>
      )}
    </div>
  )
}

export default TagInput
