require('dotenv').config({ quiet: true });
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const objectType = process.env.HUBSPOT_OBJECT_TYPE_ID;
const hubspot = axios.create({
    baseURL: 'https://api.hubapi.com',
    timeout: 15000,
    headers: { Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}` }
});

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

app.get('/', async (req, res, next) => {
    try {
        const records = [];
        let after;
        do {
            const response = await hubspot.get(`/crm/v3/objects/${objectType}`, {
                params: { properties: 'name,topic,capacity', limit: 100, after }
            });
            records.push(...response.data.results);
            after = response.data.paging?.next?.after;
        } while (after);

        res.render('homepage', {
            title: 'Workshops | Integrating With HubSpot I Practicum', records
        });
    } catch (error) {
        next(error);
    }
});

app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        values: {}, error: ''
    });
});

app.post('/update-cobj', async (req, res, next) => {
    const values = {
        name: typeof req.body.name === 'string' ? req.body.name.trim() : '',
        topic: typeof req.body.topic === 'string' ? req.body.topic.trim() : '',
        capacity: typeof req.body.capacity === 'string' ? req.body.capacity.trim() : ''
    };
    const capacity = Number(values.capacity);
    if (!values.name || !values.topic || !values.capacity ||
        values.name.length > 200 || values.topic.length > 500 ||
        !Number.isSafeInteger(capacity) || capacity < 1) {
        return res.status(400).render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            values,
            error: 'Enter a name, a topic, and a positive whole number for capacity.'
        });
    }

    try {
        await hubspot.post(`/crm/v3/objects/${objectType}`, { properties: values });
        res.redirect(303, '/');
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    // Axios errors include request headers. Log only non-secret diagnostics.
    console.error('HubSpot request failed', {
        status: error.response?.status,
        category: error.response?.data?.category,
        correlationId: error.response?.data?.correlationId
    });
    res.status(502).send('The HubSpot request could not be confirmed. Check the CRM before retrying a submission, then return to the homepage.');
});

if (require.main === module) {
    if (!process.env.HUBSPOT_ACCESS_TOKEN || !objectType || !/^2-\d+$/.test(objectType)) {
        console.error('Set HUBSPOT_ACCESS_TOKEN and a custom HUBSPOT_OBJECT_TYPE_ID in .env before starting.');
        process.exitCode = 1;
    } else {
        app.listen(3000, '127.0.0.1', () => console.log('Listening on http://localhost:3000'));
    }
}

module.exports = app;
