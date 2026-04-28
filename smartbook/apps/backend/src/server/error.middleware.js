export function errorMiddleware(err, _req, res, _next) {
    // Default to 500. Controllers/services can throw richer errors later.
    const message = err instanceof Error ? err.message : 'Unexpected error';
    res.status(500).json({ error: 'internal_error', message });
}
