import sitemap from '../app/sitemap';

const BASE_URL = 'https://skillhire.in';

describe('sitemap()', () => {
    const result = sitemap();

    it('should return an array of sitemap entries', () => {
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
    });

    it('should include all 5 core public routes', () => {
        const urls = result.map((entry) => entry.url);
        expect(urls).toContain(`${BASE_URL}/`);
        expect(urls).toContain(`${BASE_URL}/jobs`);
        expect(urls).toContain(`${BASE_URL}/pricing`);
        expect(urls).toContain(`${BASE_URL}/privacy`);
        expect(urls).toContain(`${BASE_URL}/terms`);
    });

    it('should NOT include protected routes', () => {
        const urls = result.map((entry) => entry.url);
        expect(urls.some((url) => url.includes('/api/'))).toBe(false);
        expect(urls.some((url) => url.includes('/dashboard/'))).toBe(false);
    });

    it('should have correct priorities for each route', () => {
        const get = (path: string) => result.find((e) => e.url === `${BASE_URL}${path}`)!;
        expect(get('/').priority).toBe(1.0);
        expect(get('/jobs').priority).toBe(0.9);
        expect(get('/pricing').priority).toBe(0.8);
        expect(get('/privacy').priority).toBe(0.5);
        expect(get('/terms').priority).toBe(0.5);
    });

    it('should have correct changeFrequency for each route', () => {
        const get = (path: string) => result.find((e) => e.url === `${BASE_URL}${path}`)!;
        expect(get('/').changeFrequency).toBe('daily');
        expect(get('/jobs').changeFrequency).toBe('hourly');
        expect(get('/pricing').changeFrequency).toBe('weekly');
        expect(get('/privacy').changeFrequency).toBe('monthly');
        expect(get('/terms').changeFrequency).toBe('monthly');
    });

    it('should have a lastModified date for every entry', () => {
        result.forEach((entry) => {
            expect(entry.lastModified).toBeInstanceOf(Date);
        });
    });

    it('should use absolute URLs with the correct base domain', () => {
        result.forEach((entry) => {
            expect(entry.url.startsWith(BASE_URL)).toBe(true);
        });
    });
});
