import React, { useEffect, useState } from 'react';

export interface GlassLobbyActiveChipProps {
    token: string;
    counter: string;
    isNew?: boolean;
}

const GlassLobbyActiveChip: React.FC<GlassLobbyActiveChipProps> = ({ token, counter, isNew = false }) => {
    const [entering, setEntering] = useState(isNew);

    useEffect(() => {
        if (isNew) setEntering(true);
    }, [isNew]);

    return (
        <div
            className={['tdc-gl-active__chip', entering ? 'tdc-gl-active__chip--enter' : '']
                .filter(Boolean)
                .join(' ')}
            onAnimationEnd={() => setEntering(false)}>
            <span className='tdc-gl-active__token'>{token}</span>
            <span className='tdc-gl-active__counter'>{counter}</span>
        </div>
    );
};

export default GlassLobbyActiveChip;