import React from 'react';
import { Star, MapPin, Trash2 } from 'lucide-react';

export default function Favorites({ favorites, onSelect, onRemove, t }) {
    if (!favorites || favorites.length === 0) {
        return (
            <section className="card" style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                    <Star size={22} color="var(--md-sys-color-primary)" fill="var(--md-sys-color-primary)" />
                    <h2 className="text-title">{t.favorites}</h2>
                </div>
                <p style={{ color: 'var(--md-sys-color-on-surface-variant)', textAlign: 'center', padding: 'var(--spacing-md) 0' }}>
                    {t.noFavorites}
                </p>
            </section>
        );
    }

    return (
        <section className="card" style={{ padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-md)' }}>
                <Star size={22} color="var(--md-sys-color-primary)" fill="var(--md-sys-color-primary)" />
                <h2 className="text-title">{t.favorites}</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {favorites.map((fav, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            backgroundColor: 'var(--md-sys-color-surface-variant)',
                            borderRadius: 'var(--md-sys-shape-corner-medium)',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div
                            onClick={() => onSelect(fav)}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, cursor: 'pointer' }}
                        >
                            <MapPin size={18} color="var(--md-sys-color-primary)" />
                            <div>
                                <span style={{ fontWeight: 500, fontSize: '1rem', color: 'var(--md-sys-color-on-surface)' }}>
                                    {fav.name}
                                </span>
                                {fav.admin1 && (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--md-sys-color-on-surface-variant)', marginLeft: '8px' }}>
                                        {fav.admin1}, {fav.country}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                            title={t.removeFromFavorites}
                            style={{
                                padding: '6px',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: 'var(--md-sys-color-on-surface-variant)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#d32f2f'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--md-sys-color-on-surface-variant)'}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
