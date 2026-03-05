'use client';

import Script from 'next/script';

export default function JsonLd() {
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': 'https://skillhire.in/#website',
                name: 'SkillHire',
                url: 'https://skillhire.in',
                description: 'Skill-based hiring for 2023-2026 freshers. Get matched to top companies based on what you can build.',
                potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                        '@type': 'EntryPoint',
                        urlTemplate: 'https://skillhire.in/jobs?q={search_term_string}',
                    },
                    'query-input': 'required name=search_term_string',
                },
            },
            {
                '@type': 'Organization',
                '@id': 'https://skillhire.in/#organization',
                name: 'SkillHire',
                url: 'https://skillhire.in',
                logo: {
                    '@type': 'ImageObject',
                    url: 'https://skillhire.in/assets/logo.svg',
                },
                description: 'Skill-based hiring platform for 2023-2026 batch freshers across India.',
                foundingDate: '2024',
                areaServed: 'IN',
                knowsAbout: [
                    'Fresher Hiring',
                    'Skill-Based Recruitment',
                    'ATS Resume Optimization',
                    'Tech Jobs India',
                ],
            },
        ],
    };

    return (
        <Script
            id="json-ld-structured-data"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            strategy="afterInteractive"
        />
    );
}
