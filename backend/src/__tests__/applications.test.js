const request = require('supertest');
const app = require('../app');
const { sequelize, User, Application, Job, Company } = require('../../models');

let token;

// Helper — registers a user and returns their JWT
const registerAndLogin = async (username = 'appuser', email = 'appuser@example.com') => {
    const res = await request(app)
        .post('/auth/register')
        .send({ username, email, password: 'password123' });
    return res.body.token;
};

// Helper — creates the minimum DB rows needed for an application
const createApplication = async (userId, status = 'applied') => {
    const company = await Company.create({ title: `Company-${Date.now()}`, location: 'Remote' });
    const job = await Job.create({ company_id: company.id, title: 'Engineer', work_mode: 'remote' });
    return Application.create({ user_id: userId, job_id: job.id, status });
};

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

beforeEach(async () => {
    token = await registerAndLogin();
});

afterEach(async () => {
    await Application.destroy({ where: {}, truncate: true, cascade: true });
    await Job.destroy({ where: {}, truncate: true, cascade: true });
    await Company.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
    await sequelize.close();
});

// ---------------------------------------------------------------------------
// GET /applications
// ---------------------------------------------------------------------------
describe('GET /applications', () => {
    test('401 – no token', async () => {
        const res = await request(app).get('/applications');
        expect(res.status).toBe(401);
    });

    test('401 – invalid token', async () => {
        const res = await request(app)
            .get('/applications')
            .set('Authorization', 'Bearer invalidtoken');
        expect(res.status).toBe(401);
    });

    test('200 – returns empty list when user has no applications', async () => {
        const res = await request(app)
            .get('/applications')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.applications).toHaveLength(0);
        expect(res.body.total).toBe(0);
    });

    test('200 – returns applications belonging to the logged-in user', async () => {
        const user = await User.findOne({ where: { email: 'appuser@example.com' } });
        await createApplication(user.id, 'applied');
        await createApplication(user.id, 'interviewing');

        const res = await request(app)
            .get('/applications')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(2);
        expect(res.body.applications).toHaveLength(2);
    });

    test('200 – does not return another user\'s applications', async () => {
        const otherToken = await registerAndLogin('otheruser', 'other@example.com');
        const otherUser  = await User.findOne({ where: { email: 'other@example.com' } });
        await createApplication(otherUser.id, 'applied');

        const res = await request(app)
            .get('/applications')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.total).toBe(0);
    });

    test('200 – pagination: limit and totalPages are correct', async () => {
        const user = await User.findOne({ where: { email: 'appuser@example.com' } });
        for (let i = 0; i < 5; i++) await createApplication(user.id);

        const res = await request(app)
            .get('/applications?limit=2&page=1')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.applications).toHaveLength(2);
        expect(res.body.total).toBe(5);
        expect(res.body.totalPages).toBe(3);
        expect(res.body.page).toBe(1);
    });

    test('200 – pagination: page 2 returns correct offset', async () => {
        const user = await User.findOne({ where: { email: 'appuser@example.com' } });
        for (let i = 0; i < 5; i++) await createApplication(user.id);

        const res = await request(app)
            .get('/applications?limit=2&page=2')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.applications).toHaveLength(2);
        expect(res.body.page).toBe(2);
    });


});
