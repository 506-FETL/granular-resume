import { Button } from './ui/button'

export default function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <div className='text-center space-y-4 max-w-md'>
        <h1 className='text-2xl font-bold text-destructive'>应用出错了</h1>
        <p className='text-muted-foreground'>{error.message || '请查看控制台了解详情'}</p>
        <div className='flex gap-2 justify-center'>
          <Button onClick={resetErrorBoundary}>重试</Button>
          <Button variant='outline' onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </div>
      </div>
    </div>
  )
}
