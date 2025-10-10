'use client'

import type { TiptapCollabProvider } from '@tiptap-pro/provider'
import type { Content, Editor } from '@tiptap/react'
import type { Doc as YDoc } from 'yjs'
import { Ai } from '@tiptap-pro/extension-ai'
import { Collaboration, isChangeOrigin } from '@tiptap/extension-collaboration'

import { CollaborationCaret } from '@tiptap/extension-collaboration-caret'
import { Emoji, gitHubEmojis } from '@tiptap/extension-emoji'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskItem, TaskList } from '@tiptap/extension-list'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Mention } from '@tiptap/extension-mention'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { Typography } from '@tiptap/extension-typography'
import { UniqueID } from '@tiptap/extension-unique-id'
import { Placeholder, Selection } from '@tiptap/extensions'
import { EditorContent, EditorContext, useEditor } from '@tiptap/react'
// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { UiState } from '@/components/tiptap-extension/ui-state-extension'
// --- Custom Extensions ---
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension'

import { Image } from '@/components/tiptap-node/image-node/image-node-extension'
// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension'
// --- Content ---
import { NotionEditorHeader } from '@/components/tiptap-templates/notion-like/notion-like-editor-header'

import { MobileToolbar } from '@/components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar'
import { NotionToolbarFloating } from '@/components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating'
import { AiMenu } from '@/components/tiptap-ui/ai-menu'
import { useScrollToHash } from '@/components/tiptap-ui/copy-anchor-link-button/use-scroll-to-hash'
import { DragContextMenu } from '@/components/tiptap-ui/drag-context-menu'
// --- Tiptap UI ---
import { EmojiDropdownMenu } from '@/components/tiptap-ui/emoji-dropdown-menu'
import { MentionDropdownMenu } from '@/components/tiptap-ui/mention-dropdown-menu'
import { SlashDropdownMenu } from '@/components/tiptap-ui/slash-dropdown-menu'

import { AiProvider, useAi } from '@/contexts/ai-context'
// --- Contexts ---
import { AppProvider } from '@/contexts/app-context'
import { CollabProvider, useCollab } from '@/contexts/collab-context'
import { UserProvider, useUser } from '@/contexts/user-context'
// --- Hooks ---
import { useUiEditorState } from '@/hooks/use-ui-editor-state'

import { TIPTAP_AI_APP_ID } from '@/lib/tiptap-collab-utils'
// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils'
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss'
import '@/components/tiptap-node/code-block-node/code-block-node.scss'

import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss'
import '@/components/tiptap-node/list-node/list-node.scss'

import '@/components/tiptap-node/image-node/image-node.scss'

import '@/components/tiptap-node/heading-node/heading-node.scss'
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss'
// --- Styles ---
import '@/components/tiptap-templates/notion-like/notion-like-editor.scss'

export interface NotionEditorProps {
  room: string
  placeholder?: string
  content?: Content
  onChange?: (editor: Editor) => void
}

export interface EditorProviderProps {
  provider: TiptapCollabProvider
  ydoc: YDoc
  placeholder?: string
  aiToken: string | null
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
export function LoadingSpinner({ text = 'Connecting...' }: { text?: string }) {
  return (
    <div className="spinner-container">
      <div className="spinner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="spinner-loading-text">{text}</div>
      </div>
    </div>
  )
}

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
  const { editor } = React.use(EditorContext)!
  const {
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    aiGenerationHasMessage,
    isDragging,
  } = useUiEditorState(editor)

  // Selection based effect to handle AI generation acceptance
  React.useEffect(() => {
    if (!editor)
      return

    if (
      !aiGenerationIsLoading
      && aiGenerationIsSelection
      && aiGenerationHasMessage
    ) {
      editor.chain().focus().aiAccept().run()
      editor.commands.resetUiState()
    }
  }, [
    aiGenerationHasMessage,
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    editor,
  ])

  useScrollToHash()

  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="notion-like-editor-content"
      style={{
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
    >
      <DragContextMenu />
      <AiMenu />
      <EmojiDropdownMenu />
      <MentionDropdownMenu />
      <SlashDropdownMenu />
      <NotionToolbarFloating />

      {createPortal(<MobileToolbar />, document.body)}
    </EditorContent>
  )
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
  const { provider, ydoc, placeholder = 'Start writing...', aiToken } = props

  const { content, onChange } = useContentControlContext()

  const { user } = useUser()

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    onUpdate: ({ editor }) => {
      onChange(editor)
    },
    onCreate: ({ editor }) => {
      editor.commands.setContent(content)
    },
    editorProps: {
      attributes: {
        class: 'notion-like-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        undoRedo: false,
        horizontalRule: false,
        dropcursor: {
          width: 2,
        },
        link: { openOnClick: false },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Collaboration.configure({ document: ydoc }),
      CollaborationCaret.configure({
        provider,
        user: { id: user.id, name: user.name, color: user.color },
      }),
      Placeholder.configure({
        placeholder,
        emptyNodeClass: 'is-empty with-slash',
      }),
      Mention,
      Emoji.configure({
        emojis: gitHubEmojis.filter(
          emoji => !emoji.name.includes('regional'),
        ),
        forceFallbackImages: true,
      }),
      Mathematics,
      Superscript,
      Subscript,
      Color,
      TextStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Selection,
      Image,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: error => console.error('Upload failed:', error),
      }),
      UniqueID.configure({
        types: [
          'paragraph',
          'bulletList',
          'orderedList',
          'taskList',
          'heading',
          'blockquote',
          'codeBlock',
        ],
        filterTransaction: transaction => !isChangeOrigin(transaction),
      }),
      Typography,
      UiState,
      Ai.configure({
        appId: TIPTAP_AI_APP_ID,
        token: aiToken || undefined,
        autocompletion: false,
        showDecorations: true,
        hideDecorationsOnStreamEnd: false,
        onLoading: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true)
          context.editor.commands.aiGenerationHasMessage(false)
        },
        onChunk: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true)
          context.editor.commands.aiGenerationHasMessage(true)
        },
        onSuccess: (context) => {
          const hasMessage = !!context.response
          context.editor.commands.aiGenerationSetIsLoading(false)
          context.editor.commands.aiGenerationHasMessage(hasMessage)
        },
      }),
    ],
  })

  if (!editor) {
    return <LoadingSpinner />
  }

  return (
    <div className="notion-like-editor-wrapper">
      <EditorContext value={{ editor }}>
        <NotionEditorHeader />
        <EditorContentArea />
      </EditorContext>

    </div>
  )
}

interface ContentControlContext {
  content: Content | null
  onChange: (content: Editor) => void
}

const ContentStateContext = React.createContext<ContentControlContext | null>(null)

function useContentControlContext() {
  const context = React.use(ContentStateContext)

  if (!context) {
    throw new Error('useContentControlContext must be used within a ContentControlProvider')
  }

  return context
}

function arrowFn() {}
/**
 * Full editor with all necessary providers, ready to use with just a room ID
 */
export function NotionEditor({
  room,
  content = '',
  onChange = arrowFn,
  placeholder = 'Start writing...',
}: NotionEditorProps) {
  const value = React.useMemo(() => ({ content, onChange }), [content, onChange])

  return (
    <UserProvider>
      <AppProvider>
        <CollabProvider room={room}>
          <AiProvider>
            <ContentStateContext value={value}>
              <NotionEditorContent placeholder={placeholder} />
            </ContentStateContext>
          </AiProvider>
        </CollabProvider>
      </AppProvider>
    </UserProvider>
  )
}

/**
 * Internal component that handles the editor loading state
 */
export function NotionEditorContent({ placeholder }: { placeholder?: string }) {
  const { provider, ydoc } = useCollab()
  const { aiToken } = useAi()

  if (!provider || !aiToken) {
    return <LoadingSpinner />
  }

  return (
    <EditorProvider
      provider={provider}
      ydoc={ydoc}
      placeholder={placeholder}
      aiToken={aiToken}
    />
  )
}
