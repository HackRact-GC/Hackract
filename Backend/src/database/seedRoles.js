import prisma from '../database/prismaClient.js';

/**
 * Seed default roles
 */
async function seedRoles() {
    console.log('🌱 Seeding roles...');

    const roles = [
        {
            name: 'Super Admin',
            type: 'SUPER_ADMIN',
            description: 'Full system access with all permissions',
            permissions: ['*'],
        },
        {
            name: 'Organization Admin',
            type: 'ORG_ADMIN',
            description: 'Full access within their organization',
            permissions: [
                'org:read', 'org:write', 'org:manage', 'org:invite',
                'pentest:read', 'pentest:write', 'pentest:delete', 'pentest:manage',
                'finding:read', 'finding:write', 'finding:delete', 'finding:verify',
                'user:read', 'ai:read', 'ai:write', 'ai:manage',
                'audit:read', 'role:read',
            ],
        },
        {
            name: 'Pentester',
            type: 'PENTESTER',
            description: 'Can perform penetration tests and manage findings',
            permissions: [
                'pentest:read', 'pentest:write',
                'finding:read', 'finding:write', 'finding:delete',
                'ai:read', 'ai:write',
                'org:read', 'user:read',
            ],
        },
        {
            name: 'Analyst',
            type: 'ANALYST',
            description: 'Can analyze pentests and manage findings',
            permissions: [
                'pentest:read',
                'finding:read', 'finding:write',
                'ai:read', 'ai:write',
                'org:read', 'user:read',
            ],
        },
        {
            name: 'Viewer',
            type: 'VIEWER',
            description: 'Read-only access to pentests and findings',
            permissions: [
                'pentest:read',
                'finding:read',
                'org:read',
                'user:read',
                'ai:read',
            ],
        },
    ];

    for (const role of roles) {
        const existing = await prisma.role.findUnique({
            where: { type: role.type },
        });

        if (existing) {
            console.log(`✓ Role ${role.name} already exists`);
            // Update permissions if they've changed
            await prisma.role.update({
                where: { type: role.type },
                data: { permissions: role.permissions },
            });
        } else {
            await prisma.role.create({ data: role });
            console.log(`✓ Created role: ${role.name}`);
        }
    }

    console.log('✅ Roles seeded successfully!');
}

seedRoles()
    .catch((error) => {
        console.error('❌ Error seeding roles:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
