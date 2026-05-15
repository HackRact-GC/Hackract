import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testQuery() {
    try {
        const filters = {
            search: '',
            severity: '',
            status: ''
        };

        const search = filters.search || '';
        const severity = filters.severity;
        const status = filters.status;

        const where = {};
        if (search) {
            where.title = { contains: String(search), mode: 'insensitive' };
        }
        if (severity) where.severity = severity;
        if (status) where.status = status;

        const accessWhere = {};
        // Simulate a PENTESTER user for example
        accessWhere.pentest = {
            OR: [
                { leadPentesterId: 'some-id' },
                { collaborators: { some: { userId: 'some-id' } } },
            ],
        };

        const finalWhere = { AND: [where, accessWhere] };

        console.log('Final Where:', JSON.stringify(finalWhere, null, 2));

        const findings = await prisma.finding.findMany({
            where: finalWhere,
            include: {
                reporter: { select: { fullName: true, handle: true } },
                pentest: { select: { id: true, name: true } },
            },
        });

        console.log('Success! Findings count:', findings.length);
    } catch (error) {
        console.error('Query Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testQuery();
