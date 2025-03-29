export function authenticate(req, res, next) 
{
    const apiKey = req.header("x-api-key");
    if (apiKey !== process.env.API_KEY) 
    {
        return res.status(403).json({ error: "Unauthorized access" });
    }
    next();
}