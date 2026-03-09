require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_ci';
process.env.SALT_ROUNDS = '1';

// Use dedicated test DB vars locally; fall back to CI values if not set
process.env.DEV_DB_NAME = process.env.TEST_DB_NAME || process.env.DEV_DB_NAME;
process.env.DEV_DB_USER = process.env.TEST_DB_USER || process.env.DEV_DB_USER;
process.env.DEV_DB_PASS = process.env.TEST_DB_PASS || process.env.DEV_DB_PASS;
process.env.DEV_DB_HOST = process.env.TEST_DB_HOST || process.env.DEV_DB_HOST;
process.env.DEV_DB_PORT = process.env.TEST_DB_PORT || process.env.DEV_DB_PORT;

