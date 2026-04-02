import React from 'react';
import * as Icons from 'lucide-react';

export default function About({ t }) {
    return (
        <section className="card" style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Icons.Info size={24} color="var(--md-sys-color-primary)" />
                <h2 className="text-title">{t.about}</h2>
            </div>

            <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {t.description}
            </p>

            <div style={{ display: 'grid', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 199, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Database size={20} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>{t.dataSource}</p>
                        <p className="text-body" style={{ fontWeight: '500' }}>Open-Meteo API</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 199, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Code size={20} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>{t.developer}</p>
                        <p className="text-body" style={{ fontWeight: '500' }}>{t.developerName}</p>
                    </div>
                </div>

                <a
                    href="https://github.com/sos19941015/breezy-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-md)',
                        textDecoration: 'none',
                        color: 'inherit',
                        padding: '8px',
                        marginLeft: '-8px',
                        borderRadius: 'var(--md-sys-shape-corner-medium)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 199, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.Github size={20} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>Source Code</p>
                        <p className="text-body" style={{ fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            GitHub Repository <Icons.ExternalLink size={14} />
                        </p>
                    </div>
                </a>
            </div>

            <div style={{ marginTop: 'var(--spacing-sm)', display: 'flex', justifyContent: 'center' }}>
                <a
                    href="https://github.com/sos19941015/breezy-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: 'var(--md-sys-color-primary)',
                        color: 'var(--md-sys-color-on-primary)',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <Icons.Star size={18} fill="currentColor" />
                    Give a Star
                </a>
            </div>

            <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                <span>Made with</span>
                <Icons.Heart size={16} fill="#ff4d4d" color="#ff4d4d" />
                <span>by Rex</span>
            </div>
        </section>
    );
}
