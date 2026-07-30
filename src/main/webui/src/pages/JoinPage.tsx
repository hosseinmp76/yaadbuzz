import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
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

type FormValues = {
  code: string
  nickname?: string
  bio?: string
}

export default function JoinPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [, joinTeam] = useMutation(JOIN_TEAM)
  const schema = z.object({
    code: z.string().min(4, t('join.codeRequired')),
    nickname: z.string().optional(),
    bio: z.string().optional(),
  })
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: params.get('code') ?? '',
      nickname: '',
      bio: '',
    },
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
    toast.success(t('join.success'))
    void navigate(`/teams/${result.data.joinTeam.teamId}`)
  })

  return (
    <Layout>
      <PageTitle>{t('join.title')}</PageTitle>
      <form className={cn(panelClass, stackClass, 'mt-4 max-w-md')} onSubmit={onSubmit}>
        <Label>
          {t('join.code')}
          <Input {...register('code')} />
          <FieldError message={errors.code?.message} />
        </Label>
        <Label>
          {t('join.nickname')}
          <Input {...register('nickname')} />
        </Label>
        <Label>
          {t('join.bio')}
          <Textarea rows={3} {...register('bio')} />
        </Label>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {t('join.submit')}
        </Button>
      </form>
    </Layout>
  )
}
