import { useEffect, useMemo, useRef, useState } from 'react'
import { useOS } from '../../os/OSProvider'
import { Icon } from '../../os/icons'
import { KEYS, readJson, writeJson } from '../../os/storage'
import type { AppProps } from '../../os/types'

interface Note {
  id: string
  title: string
  body: string
  updated: number
}

const SEED: Note[] = [
  {
    id: 'seed-1',
    title: 'WELCOME',
    body: `This is the Text Editor. Everything is saved automatically.

The editor is local to this machine. It does not sync anywhere.

Do not store names here.`,
    updated: Date.now() - 1000 * 60 * 47,
  },
  {
    id: 'seed-2',
    title: 'SESSION 04',
    body: `03:47 — receiver woke up on its own.
03:48 — signal 47.2 Hz, nine seconds.
03:52 — Sector 04 door opened from inside.

The recording ends after that.`,
    updated: Date.now() - 1000 * 60 * 60 * 24 * 29,
  },
]

function loadNotes(): Note[] {
  const raw = readJson<unknown>(KEYS.notes, null)
  if (!Array.isArray(raw)) return SEED
  const notes: Note[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const note = item as Partial<Note>
    if (typeof note.id !== 'string' || typeof note.title !== 'string' || typeof note.body !== 'string')
      continue
    notes.push({
      id: note.id,
      title: note.title.slice(0, 120),
      body: note.body.slice(0, 20000),
      updated:
        typeof note.updated === 'number' && Number.isFinite(note.updated)
          ? note.updated
          : Date.now(),
    })
  }
  return notes.length > 0 ? notes.slice(0, 500) : SEED
}

function formatStamp(value: number): string {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function NotesApp(_props: AppProps) {
  const { playSound, notify } = useOS()
  const [notes, setNotes] = useState<Note[]>(loadNotes)
  const [selectedId, setSelectedId] = useState(() => loadNotes()[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [dirty, setDirty] = useState(false)
  const saveTimer = useRef<number | null>(null)
  const notesRef = useRef(notes)

  const selected = notes.find((note) => note.id === selectedId) ?? notes[0] ?? null

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const sorted = [...notes].sort((a, b) => b.updated - a.updated)
    if (!needle) return sorted
    return sorted.filter(
      (note) =>
        note.title.toLowerCase().includes(needle) || note.body.toLowerCase().includes(needle),
    )
  }, [notes, query])

  useEffect(() => {
    notesRef.current = notes
    setDirty(true)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      const saved = writeJson(KEYS.notes, notes)
      setDirty(!saved)
      if (!saved) notify('Could not save the document', 'danger')
    }, 400)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [notes, notify])

  useEffect(() => {
    return () => {
      writeJson(KEYS.notes, notesRef.current)
    }
  }, [])

  useEffect(() => {
    setConfirmDelete(false)
  }, [selectedId])

  const update = (patch: Partial<Note>) => {
    if (!selected) return
    setNotes((current) =>
      current.map((note) =>
        note.id === selected.id ? { ...note, ...patch, updated: Date.now() } : note,
      ),
    )
  }

  const addNote = () => {
    if (notes.length >= 500) {
      notify('The document limit has been reached (500)', 'danger')
      return
    }
    const note: Note = {
      id: `n-${Date.now().toString(36)}`,
      title: 'Untitled Document',
      body: '',
      updated: Date.now(),
    }
    setNotes((current) => [note, ...current])
    setSelectedId(note.id)
    setQuery('')
    playSound('click')
  }

  const removeSelected = () => {
    if (!selected) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setNotes((current) => current.filter((note) => note.id !== selected.id))
    setSelectedId(notes.find((note) => note.id !== selected.id)?.id ?? '')
    setConfirmDelete(false)
  }

  return (
    <div className="notes">
      <div className="notes__sidebar">
        <div className="notes__search">
          <Icon name="search" size={14} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search documents"
          />
        </div>

        <div className="notes__list">
          {filtered.map((note) => (
            <button
              key={note.id}
              type="button"
              className={`notes__item ${selected?.id === note.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedId(note.id)}
            >
              <span className="notes__item-title">{note.title || 'Untitled Document'}</span>
              <span className="notes__item-meta">
                {formatStamp(note.updated)}
                <span>{note.body.trim().split('\n')[0]?.slice(0, 40) ?? 'Empty document'}</span>
              </span>
            </button>
          ))}
          {filtered.length === 0 && <div className="notes__none">No documents</div>}
        </div>

        <div className="notes__sidebar-foot">
          <button type="button" className="btn notes__new" onClick={addNote}>
            <Icon name="plus" size={13} />
            New
          </button>
          <button
            type="button"
            className={`btn btn--icon ${confirmDelete ? 'btn--danger' : ''}`}
            onClick={removeSelected}
            disabled={!selected}
            title={confirmDelete ? 'Confirm delete' : 'Delete document'}
            aria-label="Delete document"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="notes__editor">
        {selected ? (
          <>
            <div className="notes__head">
              <input
                className="notes__title"
                value={selected.title}
                onChange={(event) => update({ title: event.target.value.slice(0, 120) })}
                placeholder="Title"
                aria-label="Document title"
              />
              <div className="notes__status">
                {dirty ? 'Saving…' : 'Saved'}
                <span>{formatStamp(selected.updated)}</span>
              </div>
            </div>
            <textarea
              className="notes__body"
              value={selected.body}
              maxLength={20000}
              onChange={(event) => update({ body: event.target.value })}
              placeholder="Start typing…"
              aria-label="Document text"
            />
            <div className="notes__foot">
              <span>{selected.body.length} characters</span>
              <span>{selected.body.trim() ? selected.body.trim().split(/\s+/).length : 0} words</span>
              <span>{confirmDelete ? 'Press delete again to confirm' : 'Autosave on'}</span>
            </div>
          </>
        ) : (
          <div className="notes__empty">Select a document or create a new one</div>
        )}
      </div>
    </div>
  )
}
