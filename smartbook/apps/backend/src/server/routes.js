import globalRoutes from '../routes/global.routes.js';
import publicRoutes from '../routes/public.routes.js';
export function registerRoutes(app) {
    app.get('/', (_req, res) => {
        res.json({ name: 'smartbook-api', status: 'ok' });
    });
    app.use('/api', globalRoutes);
    app.use('/c/:slug', publicRoutes);
}
