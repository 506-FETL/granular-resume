import { useResumeStyles } from '@/hooks/use-resume-styles'
import BasicResume from './templates/basic/Basic'

function Resume() {
  const { font, spacing, theme } = useResumeStyles()

  return (
    <BasicResume font={font} spacing={spacing} theme={theme} />
  )
}

export default Resume
