const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../../models');

beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterEach(async () => {
    await User.destroy({ where: {}, truncate: true, cascade: true });
});

afterAll(async () => {
    await sequelize.close();
});

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------
describe('POST /auth/register', () => {
    const validPayload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
    };

    test('201 – registers a new user and returns a token', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send(validPayload);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toMatchObject({
            username: 'testuser',
            email: 'test@example.com',
        });
        expect(res.body.user).not.toHaveProperty('password_hash');
    });

    test('400 – missing username', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing email', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing password', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', email: 'test@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('409 – duplicate email', async () => {
        await request(app).post('/auth/register').send(validPayload);

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'otheruser', email: 'test@example.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Email already in use');
    });

    test('409 – duplicate username', async () => {
        await request(app).post('/auth/register').send(validPayload);

        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', email: 'other@example.com', password: 'password123' });

        expect(res.status).toBe(409);
        expect(res.body.error).toBe('Username already in use');
    });
});

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
describe('POST /auth/login', () => {
    beforeEach(async () => {
        await request(app).post('/auth/register').send({
            username: 'loginuser',
            email: 'login@example.com',
            password: 'password123',
        });
    });

    test('200 – logs in with valid credentials and returns a token', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toMatchObject({ email: 'login@example.com' });
    });

    test('400 – missing email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('400 – missing password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    test('401 – wrong password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'login@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });

    test('401 – unregistered email', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });
});
