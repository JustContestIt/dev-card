import { ConfigService } from '@nestjs/config';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../prisma/prisma.service';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: { contactMessage: { count: jest.Mock; create: jest.Mock } };

  const input = { name: 'Test User', email: 'test@example.com', message: 'A long enough message' };
  const config = { get: jest.fn().mockReturnValue(3) } as unknown as ConfigService<never, true>;

  beforeEach(() => {
    prisma = {
      contactMessage: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(({ data }: { data: object }) =>
          Promise.resolve({ id: 'id-1', createdAt: new Date(), ...data }),
        ),
      },
    };
    service = new ContactService(prisma as unknown as PrismaService, config);
  });

  it('persists the message together with the hashed IP', async () => {
    const saved = await service.send(input, 'hash-abc');

    expect(prisma.contactMessage.create).toHaveBeenCalledWith({
      data: { ...input, ipHash: 'hash-abc' },
    });
    expect(saved.id).toBe('id-1');
  });

  it('rejects with RATE_LIMITED once the hourly limit is reached', async () => {
    prisma.contactMessage.count.mockResolvedValue(3);

    await expect(service.send(input, 'hash-abc')).rejects.toMatchObject({
      extensions: { code: 'RATE_LIMITED' },
    });
    await expect(service.send(input, 'hash-abc')).rejects.toBeInstanceOf(GraphQLError);
    expect(prisma.contactMessage.create).not.toHaveBeenCalled();
  });

  it('skips the limit check when the IP could not be resolved', async () => {
    await service.send(input, null);

    expect(prisma.contactMessage.count).not.toHaveBeenCalled();
    expect(prisma.contactMessage.create).toHaveBeenCalled();
  });
});
