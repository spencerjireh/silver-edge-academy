import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Eye, EyeOff, User, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      addToast({ type: 'error', message: 'Please enter your username and password' })
      return
    }

    setIsLoading(true)

    try {
      await login(username.trim(), password)
      addToast({ type: 'success', message: 'Welcome back!' })
      navigate('/')
    } catch (error) {
      addToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Login failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-white to-coral-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center mb-4 border-b-[4px] border-violet-800">
            <Star className="w-9 h-9 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Silver Edge Academy</h1>
          <p className="text-slate-600 mt-2">Welcome back, young coder!</p>
        </div>

        {/* Login form */}
        <div className="rounded-3xl crystal-glass-heavy p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              icon={<User className="w-5 h-5" />}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                icon={<Lock className="w-5 h-5" />}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] p-1 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Start Coding!
            </Button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-medium text-slate-700 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-sm text-slate-600">
              <p><span className="font-medium">alex_coder</span> (Level 5)</p>
              <p><span className="font-medium">emma_dev</span> (Level 3)</p>
              <p><span className="font-medium">sophia_js</span> (Level 8)</p>
              <p className="text-slate-500 mt-2">Password: <span className="font-medium">password123</span></p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Need help? Ask your teacher for your login details.
        </p>
      </div>
    </div>
  )
}
