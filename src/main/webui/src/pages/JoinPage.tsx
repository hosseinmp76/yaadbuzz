import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useMutation } from 'urql'
import { z } from 'zod'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label, Textarea } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { JOIN_TEAM } from '../api/queries'

const schema = z.object({
  code: z.string().min(4, 'Invite code is required'),
  nickname: z.string().optional(),
  bio: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function JoinPage() {
  const navigate = useNavigate()
  const [, joinTeam] = useMutation(JOIN_TEAM)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', nickname: '', bio: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    const result = await joinTeam({
      code: values.code,
      nickname: values.nickname || null,
      bio: values.bio || null,
    })
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    toast.success('Joined team')
    void navigate(`/teams/${result.data.joinTeam.teamId}`)
  })

  return (
    <Layout>
      <PageTitle>Join a team</PageTitle>
      <form className={cn(panelClass, stackClass, 'mt-4 max-w-md')} onSubmit={onSubmit}>
        <Label>
          Invite code
          <Input {...register('code')} />
          <FieldError message={errors.code?.message} />
        </Label>
        <Label>
          Nickname
          <Input {...register('nickname')} />
        </Label>
        <Label>
          Bio
          <Textarea rows={3} {...register('bio')} />
        </Label>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          Join
        </Button>
      </form>
    </Layout>
  )
}
