import type { Editor } from '@tiptap/react'
import parse from 'html-react-parser'
import { useState } from 'react'
import { NotionEditor } from '@/components/tiptap-templates/notion-like/notion-like-editor'

export default function DemoPage() {
  const [value, setValue] = useState<string | null>(null)
  const handleChange = (editor: Editor) => {
    setValue(editor.getHTML())
  }

  return (
    <div>
      <div className="border">
        <NotionEditor room="tests" onChange={handleChange} />
      </div>
      <div>
        {parse(value || '')}
      </div>
    </div>
  )
}
