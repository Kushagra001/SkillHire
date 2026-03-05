import robots from '../app/robots';

describe('robots()', () => {
    const result = robots();

    it('should return a rules object for all crawlers', () => {
        expect(result.rules).toBeDefined();
        // Could be a single object or array; normalize for test
        const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
        expect(rules.userAgent).toBe('*');
    });

    it('should allow the root path "/"', () => {
        const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
        const allowed = Array.isArray(rules.allow) ? rules.allow : [rules.allow];
        expect(allowed).toContain('/');
    });

    it('should disallow "/api/" and "/dashboard/"', () => {
        const rules = Array.isArray(result.rules) ? result.rules[0] : result.rules;
        const disallowed = Array.isArray(rules.disallow)
            ? rules.disallow
            : [rules.disallow];
        expect(disallowed).toContain('/api/');
        expect(disallowed).toContain('/dashboard/');
    });

    it('should provide the absolute sitemap URL', () => {
        expect(result.sitemap).toBe('https://skillhire.in/sitemap.xml');
    });
});
