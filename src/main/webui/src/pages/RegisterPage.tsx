import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { useAuth } from '../auth'
import { Seo } from '../seo/Seo'

const schema = z.object({
  displayName: z.string().min(2, 'Display name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
})

type FormValues = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser, accessToken } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
    },
  })

  if (accessToken) return <Navigate to="/app" replace />

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser(values.email, values.password, values.displayName)
      toast.success('Account created')
      void navigate('/app')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError('root', { message })
      toast.error(message)
    }
  })

  return (
    <Layout>
      <Seo
        title="Create your account"
        description="Register for Yaadbuzz and start an online yearbook for your team or organization."
        path="/register"
      />
      <div className="mx-auto max-w-md py-8">
        <PageTitle>Create your Yaadbuzz</PageTitle>
        <p className="text-muted">One account, many teams, endless memories.</p>
        <form className={cn(panelClass, stackClass, 'mt-5')} onSubmit={onSubmit}>
          <Label>
            Display name
            <Input autoComplete="name" {...register('displayName')} />
            <FieldError message={errors.displayName?.message} />
          </Label>
          <Label>
            Email
            <Input type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </Label>
          <Label>
            Password
            <Input type="password" autoComplete="new-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </Label>
          <FieldError message={errors.root?.message} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-muted">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand">
            Log in
          </Link>
        </p>
      </div>
    </Layout>
  )
}
