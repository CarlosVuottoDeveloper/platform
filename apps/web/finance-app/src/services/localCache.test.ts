import { clearIndexedDbPersistence, terminate } from 'firebase/firestore';
import { clearLocalCache } from './localCache';

jest.mock('./firebase', () => ({ db: { name: 'db' } }));

describe('clearLocalCache', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('closes Firestore before deleting what it stored on this device', async () => {
    const order: string[] = [];
    jest.mocked(terminate).mockImplementation(async () => {
      order.push('terminate');
    });
    jest.mocked(clearIndexedDbPersistence).mockImplementation(async () => {
      order.push('clear');
    });

    await clearLocalCache();

    expect(terminate).toHaveBeenCalledWith({ name: 'db' });
    expect(clearIndexedDbPersistence).toHaveBeenCalledWith({ name: 'db' });
    expect(order).toEqual(['terminate', 'clear']);
  });

  it('does not block signing out when the cache cannot be cleared, as with another tab open', async () => {
    jest.mocked(terminate).mockResolvedValue();
    jest.mocked(clearIndexedDbPersistence).mockRejectedValue({ code: 'failed-precondition' });

    await expect(clearLocalCache()).resolves.toBeUndefined();
  });
});
