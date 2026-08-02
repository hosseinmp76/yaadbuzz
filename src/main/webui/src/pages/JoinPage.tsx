import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../api/client'
import { useApiMutation } from '../api/useApi'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label, Textarea } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'

type FormValues = {
  code: string
  nickname?: string
  bio?: string
}

export default function JoinPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [, joinTeam] = useApiMutation(
    (code: string, nickname: string | null, bio: string | null) => api.joinTeam(code, nickname ?? '', bio),
  )
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
    const result = await joinTeam(values.code, values.nickname || null, values.bio || null)
    if (result.error) {
      toast.error(result.error.message)
      return
    }
    const teamId = result.data?.teamId
    if (!teamId) {
      toast.error(t('common.requestFailed'))
      return
    }
    toast.success(t('join.success'))
    void navigate(`/teams/${teamId}`)
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
