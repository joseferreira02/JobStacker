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
      { id: 1,  title: 'Google',    location: 'Mountain View, CA' },
      { id: 2,  title: 'Spotify',   location: 'Stockholm, Sweden' },
      { id: 3,  title: 'Shopify',   location: 'Ottawa, Canada' },
      { id: 4,  title: 'Meta',      location: 'Menlo Park, CA' },
      { id: 5,  title: 'Amazon',    location: 'Seattle, WA' },
      { id: 6,  title: 'Netflix',   location: 'Los Gatos, CA' },
      { id: 7,  title: 'Stripe',    location: 'San Francisco, CA' },
      { id: 8,  title: 'Notion',    location: 'San Francisco, CA' },
      { id: 9,  title: 'Vercel',    location: 'Remote' },
      { id: 10, title: 'Atlassian', location: 'Sydney, Australia' },
    ]);

    // 5. Jobs
    await queryInterface.bulkInsert('jobs', [
      { id: 1,  company_id: 1,  title: 'Frontend Engineer',       description: 'React/Next.js role',        url: 'https://careers.google.com',    salary: 120000.00, work_mode: 'hybrid'  },
      { id: 2,  company_id: 2,  title: 'Backend Developer',        description: 'Node.js microservices',     url: 'https://jobs.spotify.com',      salary: 95000.00,  work_mode: 'remote'  },
      { id: 3,  company_id: 3,  title: 'Full Stack Developer',     description: 'Ruby on Rails + React',     url: 'https://jobs.shopify.com',      salary: 110000.00, work_mode: 'onsite'  },
      { id: 4,  company_id: 4,  title: 'React Native Engineer',    description: 'Mobile apps at scale',      url: 'https://careers.meta.com',      salary: 130000.00, work_mode: 'hybrid'  },
      { id: 5,  company_id: 5,  title: 'Cloud Engineer',           description: 'AWS infrastructure',        url: 'https://amazon.jobs',           salary: 140000.00, work_mode: 'onsite'  },
      { id: 6,  company_id: 6,  title: 'Senior UI Engineer',       description: 'Design systems',            url: 'https://jobs.netflix.com',      salary: 155000.00, work_mode: 'remote'  },
      { id: 7,  company_id: 7,  title: 'Frontend Platform Eng',    description: 'Payments UI',               url: 'https://stripe.com/jobs',       salary: 145000.00, work_mode: 'hybrid'  },
      { id: 8,  company_id: 8,  title: 'Product Engineer',         description: 'Collaborative docs',        url: 'https://notion.so/careers',     salary: 125000.00, work_mode: 'remote'  },
      { id: 9,  company_id: 9,  title: 'DX Engineer',              description: 'Developer experience',      url: 'https://vercel.com/careers',    salary: 135000.00, work_mode: 'remote'  },
      { id: 10, company_id: 10, title: 'Software Engineer',        description: 'Jira / Confluence teams',   url: 'https://atlassian.com/company', salary: 115000.00, work_mode: 'hybrid'  },
      { id: 11, company_id: 1,  title: 'Site Reliability Eng',     description: 'SRE team',                  url: 'https://careers.google.com',    salary: 150000.00, work_mode: 'hybrid'  },
      { id: 12, company_id: 2,  title: 'Data Engineer',            description: 'Data pipelines',            url: 'https://jobs.spotify.com',      salary: 105000.00, work_mode: 'remote'  },
      { id: 13, company_id: 4,  title: 'iOS Engineer',             description: 'Messenger iOS',             url: 'https://careers.meta.com',      salary: 128000.00, work_mode: 'onsite'  },
      { id: 14, company_id: 6,  title: 'Backend Engineer',         description: 'Streaming backend',         url: 'https://jobs.netflix.com',      salary: 160000.00, work_mode: 'remote'  },
      { id: 15, company_id: 7,  title: 'API Engineer',             description: 'Stripe API team',           url: 'https://stripe.com/jobs',       salary: 148000.00, work_mode: 'hybrid'  },
    ]);

    // 6. Applications (john applied to all 15)
    await queryInterface.bulkInsert('applications', [
      { id: 1,  user_id: 2, job_id: 1,  status: 'interviewing', applied_at: new Date('2026-02-15') },
      { id: 2,  user_id: 2, job_id: 2,  status: 'applied',      applied_at: new Date('2026-02-28') },
      { id: 3,  user_id: 2, job_id: 3,  status: 'rejected',     applied_at: new Date('2026-01-10') },
      { id: 4,  user_id: 2, job_id: 4,  status: 'applied',      applied_at: new Date('2026-02-01') },
      { id: 5,  user_id: 2, job_id: 5,  status: 'ghosted',      applied_at: new Date('2026-01-20') },
      { id: 6,  user_id: 2, job_id: 6,  status: 'offered',      applied_at: new Date('2026-02-10') },
      { id: 7,  user_id: 2, job_id: 7,  status: 'interviewing', applied_at: new Date('2026-03-01') },
      { id: 8,  user_id: 2, job_id: 8,  status: 'applied',      applied_at: new Date('2026-03-03') },
      { id: 9,  user_id: 2, job_id: 9,  status: 'rejected',     applied_at: new Date('2026-01-25') },
      { id: 10, user_id: 2, job_id: 10, status: 'applied',      applied_at: new Date('2026-02-20') },
      { id: 11, user_id: 2, job_id: 11, status: 'ghosted',      applied_at: new Date('2026-01-15') },
      { id: 12, user_id: 2, job_id: 12, status: 'applied',      applied_at: new Date('2026-03-05') },
      { id: 13, user_id: 2, job_id: 13, status: 'interviewing', applied_at: new Date('2026-02-25') },
      { id: 14, user_id: 2, job_id: 14, status: 'offered',      applied_at: new Date('2026-02-18') },
      { id: 15, user_id: 2, job_id: 15, status: 'applied',      applied_at: new Date('2026-03-07') },
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
