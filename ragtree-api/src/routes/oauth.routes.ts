import { Elysia } from 'elysia'
import { Google, Discord, generateCodeVerifier, generateState } from 'arctic'
import { User } from '../models/user.model'
import { signAccessToken, signRefreshToken } from '../middleware/auth.middleware'

const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  `${process.env.FRONTEND_URL}/api/auth/callback/google`
)

const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  `${process.env.FRONTEND_URL}/api/auth/callback/discord`
)

export const oauthRoutes = new Elysia({ prefix: '/auth' })
  .get('/google', async ({ redirect }) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])
    return redirect(url.toString())
  })

  .get('/google/callback', async (ctx: any) => {
    const { query, set, cookie, redirect } = ctx
    const { code } = query
    if (!code) { set.status = 400; return { error: 'No code' } }
    const codeVerifier = generateCodeVerifier()
    const tokens = await google.validateAuthorizationCode(code, codeVerifier)
    const userInfo = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    }).then(r => r.json()) as { sub: string; email: string; name: string; picture: string }

    let user = await User.findOne({ 'oauth_providers.provider': 'google', 'oauth_providers.provider_id': userInfo.sub })
    if (!user) {
      user = await User.findOne({ email: userInfo.email })
      if (user) {
        user.oauth_providers.push({ provider: 'google', provider_id: userInfo.sub })
        await user.save()
      } else {
        user = await User.create({
          name: userInfo.name, email: userInfo.email, avatar_url: userInfo.picture,
          role: 'user', oauth_providers: [{ provider: 'google', provider_id: userInfo.sub }]
        })
      }
    }

    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  })

  .get('/discord', async ({ redirect }) => {
    const state = generateState()
    const url = discord.createAuthorizationURL(state, null, ['identify', 'email'])
    return redirect(url.toString())
  })

  .get('/discord/callback', async (ctx: any) => {
    const { query, set, cookie, redirect } = ctx
    const { code } = query
    if (!code) { set.status = 400; return { error: 'No code' } }
    const tokens = await discord.validateAuthorizationCode(code, null)
    const userInfo = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    }).then(r => r.json()) as { id: string; email: string; username: string; avatar: string }

    let user = await User.findOne({ 'oauth_providers.provider': 'discord', 'oauth_providers.provider_id': userInfo.id })
    if (!user) {
      user = await User.findOne({ email: userInfo.email })
      if (user) {
        user.oauth_providers.push({ provider: 'discord', provider_id: userInfo.id })
        await user.save()
      } else {
        const avatarUrl = userInfo.avatar
          ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`
          : undefined
        user = await User.create({
          name: userInfo.username, email: userInfo.email, avatar_url: avatarUrl,
          role: 'user', oauth_providers: [{ provider: 'discord', provider_id: userInfo.id }]
        })
      }
    }

    const payload = { userId: String(user._id), role: user.role }
    const access_token = signAccessToken(payload)
    const refresh_token = signRefreshToken(payload)
    cookie.refresh_token.set({ value: refresh_token, httpOnly: true, sameSite: 'strict', maxAge: 60 * 60 * 24 * 30 })
    return redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  })
