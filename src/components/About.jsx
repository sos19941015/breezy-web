import React from 'react';
import { Info, Code, Database, Heart } from 'lucide-react';

export default function About({ t }) {
    return (
        <section className="card" style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)', gap: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Info size={24} color="var(--md-sys-color-primary)" />
                <h2 className="text-title">{t.about}</h2>
            </div>

            <p className="text-body" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                {t.description}
            </p>

            <div style={{ display: 'grid', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 199, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Database size={20} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>{t.dataSource}</p>
                        <p className="text-body" style={{ fontWeight: '500' }}>Open-Meteo API</p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(168, 199, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Code size={20} color="var(--md-sys-color-primary)" />
                    </div>
                    <div>
                        <p className="text-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>{t.developer}</p>
                        <p className="text-body" style={{ fontWeight: '500' }}>Antigravity AI</p>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--md-sys-color-outline-variant)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', color: 'var(--md-sys-color-on-surface-variant)', fontSize: '0.85rem' }}>
                <span>Made with</span>
                <Heart size={16} fill="#ff4d4d" color="#ff4d4d" />
                <span>for the USER</span>
            </div>
        </section>
    );
}
