import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { api } from '../api/client'
import { useApiMutation } from '../api/useApi'
import { useAuth } from '../auth'
import { rememberNext, withNext } from '../authRedirect'
import Layout from '../components/Layout'
import { Button } from '../components/ui/Button'
import { FieldError, Input, Label, Textarea } from '../components/ui/Field'
import { PageTitle } from '../components/ui/PageTitle'
import { cn } from '../lib/cn'
import { panelClass, stackClass } from '../components/ui/styles'
import { Seo } from '../seo/Seo'

type FormValues = {
  code: string
  nickname?: string
  bio?: string
}

export default function JoinPage() {
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const codeFromLink = params.get('code') ?? ''
  const nextPath = `/join${codeFromLink ? `?code=${encodeURIComponent(codeFromLink)}` : ''}`

  useEffect(() => {
    rememberNext(nextPath)
  }, [nextPath])

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
      code: codeFromLink,
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
      <Seo title={t('join.title')} path="/join" noIndex />
      <PageTitle>{t('join.title')}</PageTitle>
      {!accessToken ? (
        <div className={cn(panelClass, stackClass, 'mt-4 max-w-md')}>
          <p className="text-muted">{t('join.signedOutBody')}</p>
          {codeFromLink ? (
            <p className="text-sm text-muted">
              {t('join.code')}: <strong className="text-ink">{codeFromLink}</strong>
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to={withNext('/login', nextPath)} className="sm:flex-1">
              <Button className="w-full">{t('join.loginToContinue')}</Button>
            </Link>
            <Link to={withNext('/register', nextPath)} className="sm:flex-1">
              <Button variant="secondary" className="w-full">
                {t('join.registerToContinue')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
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
            {isSubmitting ? t('join.submitting') : t('join.submit')}
          </Button>
        </form>
      )}
    </Layout>
  )
}
