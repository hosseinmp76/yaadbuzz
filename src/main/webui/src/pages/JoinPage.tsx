import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from 'urql'
import Layout from '../components/Layout'
import { JOIN_TEAM } from '../api/queries'

export default function JoinPage() {
  const navigate = useNavigate()
  const [, joinTeam] = useMutation(JOIN_TEAM)
  const [code, setCode] = useState('')
  const [nickname, setNickname] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await joinTeam({ code, nickname: nickname || null, bio: bio || null })
    if (result.error) {
      setError(result.error.message)
      return
    }
    navigate(`/teams/${result.data.joinTeam.teamId}`)
  }

  return (
    <Layout>
      <h1 className="page-title">Join a team</h1>
      <form className="panel" style={{ maxWidth: 480 }} onSubmit={onSubmit}>
        <label>Invite code<input value={code} onChange={(e) => setCode(e.target.value)} required /></label>
        <label>Nickname<input value={nickname} onChange={(e) => setNickname(e.target.value)} /></label>
        <label>Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Join</button>
      </form>
    </Layout>
  )
}
