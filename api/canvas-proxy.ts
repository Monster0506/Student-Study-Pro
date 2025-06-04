// Vercel serverless function to proxy Canvas API requests
export default async function handler(req: any, res: any) {
    // Health check/status endpoint
    if (req.query.status !== undefined) {
        const { token, baseUrl } = req.query;
        if (!token || !baseUrl) {
            return res.status(400).json({ ok: false, error: 'Missing token or baseUrl.' });
        }
        try {
            const url = `${baseUrl}/api/v1/courses?per_page=1`;
            const canvasRes = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!canvasRes.ok) {
                return res.status(canvasRes.status).json({ ok: false, error: 'Failed to fetch courses.' });
            }
            const data = await canvasRes.json();
            if (Array.isArray(data) && data.length > 0) {
                return res.status(200).json({ ok: true, message: 'Canvas proxy is running and data is valid.' });
            } else {
                return res.status(200).json({ ok: false, error: 'No courses returned.' });
            }
        } catch (err) {
            return res.status(500).json({ ok: false, error: 'Failed to fetch from Canvas.' });
        }
    }
    const { endpoint, token, baseUrl } = req.query;
    const context_codes = req.query['context_codes[]'];
    console.log('[Canvas Proxy] Endpoint hit', { endpoint, baseUrl, context_codes: context_codes ? context_codes : 'none' });


    if (!endpoint || !token || !baseUrl) {

        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const url = `${baseUrl}/api/v1/${endpoint}`;


    try {
        let urlToFetch = url;

        if (context_codes) {
            urlToFetch += `?context_codes[]=${context_codes}`;

        }
        let allData: any[] = [];
        let isPaginated = false;
        do {
            const canvasRes = await fetch(urlToFetch, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const headersObj: Record<string, string> = {};
            canvasRes.headers.forEach((value, key) => {
                headersObj[key] = value;
            });

            const contentType = canvasRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {

                const data = await canvasRes.json();


                if (Array.isArray(data)) {
                    allData = allData.concat(data);
                    // Check for pagination
                    const link = canvasRes.headers.get('Link');
                    if (link) {
                        const match = link.match(/<([^>]+)>; rel="next"/);
                        if (match) {
                            urlToFetch = match[1];
                            isPaginated = true;
                        } else {
                            isPaginated = false;
                        }
                    } else {
                        isPaginated = false;
                    }
                } else {
                    // Not an array, just return the object
                    res.setHeader('Content-Type', 'application/json');
                    return res.json(data);
                }
            } else {
                // Not JSON, just return the first response as text
                const data = await canvasRes.arrayBuffer();
                const dataStr = new TextDecoder('utf-8').decode(data);
                res.setHeader('Content-Type', 'text/plain');
                return res.send(dataStr);
            }
        } while (isPaginated);
        // Return the aggregated array
        res.setHeader('Content-Type', 'application/json');
        return res.json(allData);
    } catch (err) {
        console.error('[Canvas Proxy] Error:', err && err.stack ? err.stack : err);
        res.status(500).json({ error: 'Failed to fetch from Canvas.' });
    }
} 