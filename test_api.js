const http = require('http');

const req = http.get('http://localhost:3000/api/jobs', (res) => {
    let raw = Buffer.alloc(0);
    res.on('data', chunk => raw = Buffer.concat([raw, chunk]));
    res.on('end', () => {
        console.log("STATUS:", res.statusCode);
        console.log("HEADERS:", res.headers);

        try {
            const data = JSON.parse(raw.toString());
            console.log("LENGTH OF JOBS: ", data.jobs ? data.jobs.length : 'NO DATA.JOBS');
        } catch (e) {
            console.log("BODY:", raw.toString().substring(0, 300));
        }
    })
});

req.on('error', e => console.error(e));
