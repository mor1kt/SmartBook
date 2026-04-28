import cors from 'cors'
import express from 'express'

import globalRoutes from './routes/global.routes.js'
import publicRoutes from './routes/public.routes.js'
import { env } from './db/env.js'

const app = express()

app.use(
  cors({
    origin: env.FRONTEND_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean),
    credentials: true,
  })
)
app.use(express.json())

app.use('/api', globalRoutes)
app.use('/c/:slug', publicRoutes)

export default app
