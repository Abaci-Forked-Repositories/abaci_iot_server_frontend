import React, { memo } from 'react';

export interface MetroMosaicTokenProps {
	displayToken: string;
	slide?: boolean;
}

/** Token slides in like a next-station announcement board. */
const MetroMosaicToken: React.FC<MetroMosaicTokenProps> = ({
	displayToken,
	slide = false,
}) => (
	<div
		className={['tdc-mm-token-stage', slide ? 'tdc-mm-token-stage--slide' : '']
			.filter(Boolean)
			.join(' ')}
		aria-label={`Token ${displayToken}`}>
		<span className='tdc-mm-token-stage__eyebrow' aria-hidden='true'>
			Now Calling
		</span>
		<span key={displayToken} className='tdc-mm-token'>
			{displayToken}
		</span>
	</div>
);

export default memo(MetroMosaicToken);
