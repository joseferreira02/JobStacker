'use strict';

module.exports = {
  async up(queryInterface) {
    // 1. Roles
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'user', description: 'Regular user' },
      { id: 2, name: 'admin', description: 'Administrator' }
    ]);

    // 2. Users (passwords: admin123, user123)
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        username: 'admin',
        email: 'admin@jobstacker.com',
        password_hash: '$2b$10$Taglj7BqgSWpOCVRpNDW9uR61zfcJi0m06MqGsw9ty2hBmFm7JLBi',
        created_at: new Date()
      },
      {
        id: 2,
        username: 'john',
        email: 'john@example.com',
        password_hash: '$2b$10$G2SHutH9wWoUYGXP6FbPZe7qvep.dlsaH2/pOxlGkrFGv2COgK5fi',
        created_at: new Date()
      }
    ]);

    // 3. Assign roles
    await queryInterface.bulkInsert('user_roles', [
      { user_id: 1, role_id: 2, assigned_at: new Date() }, // admin → admin role
      { user_id: 2, role_id: 1, assigned_at: new Date() }  // john → user role
    ]);

    // 4. Companies
    await queryInterface.bulkInsert('companies', [
      { id: 1, title: 'Google', location: 'Mountain View, CA' },
      { id: 2, title: 'Spotify', location: 'Stockholm, Sweden' },
      { id: 3, title: 'Shopify', location: 'Ottawa, Canada' }
    ]);

    // 5. Jobs
    await queryInterface.bulkInsert('jobs', [
      { id: 1, company_id: 1, title: 'Frontend Engineer', description: 'React/Next.js role', url: 'https://careers.google.com', salary: 120000.00, work_mode: 'hybrid' },
      { id: 2, company_id: 2, title: 'Backend Developer', description: 'Node.js microservices', url: 'https://jobs.spotify.com', salary: 95000.00, work_mode: 'remote' },
      { id: 3, company_id: 3, title: 'Full Stack Developer', description: 'Ruby on Rails + React', url: 'https://jobs.shopify.com', salary: 110000.00, work_mode: 'onsite' }
    ]);

    // 6. Applications (john applied to all 3)
    await queryInterface.bulkInsert('applications', [
      { id: 1, user_id: 2, job_id: 1, status: 'interviewing', applied_at: new Date('2026-02-15') },
      { id: 2, user_id: 2, job_id: 2, status: 'applied', applied_at: new Date('2026-02-28') },
      { id: 3, user_id: 2, job_id: 3, status: 'rejected', applied_at: new Date('2026-01-10') }
    ]);

    // 7. Interviews
    await queryInterface.bulkInsert('interviews', [
      { id: 1, application_id: 1, round_type: 'Phone Screen', scheduled_start: new Date('2026-03-10T10:00:00'), scheduled_end: new Date('2026-03-10T10:30:00'), status: 'completed', notes: 'Went well, moving to next round' },
      { id: 2, application_id: 1, round_type: 'Technical', scheduled_start: new Date('2026-03-15T14:00:00'), scheduled_end: new Date('2026-03-15T15:00:00'), status: 'scheduled', notes: null }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('interviews', null, {});
    await queryInterface.bulkDelete('applications', null, {});
    await queryInterface.bulkDelete('jobs', null, {});
    await queryInterface.bulkDelete('companies', null, {});
    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
