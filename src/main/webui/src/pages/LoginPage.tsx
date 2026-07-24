import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { useAuth } from '../auth'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const { login, accessToken } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'alice@yaadbuzz.local',
      password: 'password123',
    },
  })

  if (accessToken) return <Navigate to="/app" replace />

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values.email, values.password)
      toast.success('Welcome back')
      void navigate('/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError('root', { message })
      toast.error(message)
    }
  })

  return (
    <Layout>
      <div className="mx-auto max-w-md py-8">
        <h1 className="page-title">Welcome back</h1>
        <p className="text-muted">Log in to continue building your yearbook.</p>
        <form className="panel mt-5 stack" onSubmit={onSubmit}>
          <Label>
            Email
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <Label>
            Password
            <Input type="password" autoComplete="current-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </Label>
          <FieldError message={errors.root?.message} />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-4 text-muted">
          No account?{' '}
          <Link to="/register" className="font-semibold text-brand">
            Register
          </Link>
        </p>
      </div>
    </Layout>
  )
}
