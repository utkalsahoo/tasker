import { device, expect, element, by } from 'detox';

describe('Task lifecycle', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('displays today screen', async () => {
    await expect(element(by.text('Overdue'))).toBeVisible();
  });
});
