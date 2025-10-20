import useCurrentResumeStore from '@/store/resume/current'
import { Navigate } from 'react-router-dom'
const Editor = () => {
  const resumeId = useCurrentResumeStore((state) => state.resumeId)

  return <Navigate to={`/editor/${resumeId}`} replace />
}

export default Editor
