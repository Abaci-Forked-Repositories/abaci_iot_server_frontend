import React, { memo } from 'react';

export interface TerracottaOliveSandApertureProps {
	displayToken: string;
	reveal?: boolean;
}

const BLADE_COUNT = 8;

/** Rotating mosaic ring reveals the token through a central portal. */
const TerracottaOliveSandAperture: React.FC<TerracottaOliveSandApertureProps> = ({
	displayToken,
	reveal = false,
}) => (
	<div
		className={[
			'tdc-tos-aperture',
			reveal ? 'tdc-tos-aperture--reveal' : '',
		]
			.filter(Boolean)
			.join(' ')}
		aria-label={`Token ${displayToken}`}>
		<div className='tdc-tos-aperture__halo' aria-hidden='true' />

		<div className='tdc-tos-aperture__spinner' aria-hidden='true'>
			<span className='tdc-tos-aperture__ring' />
			<div className='tdc-tos-aperture__blades'>
				{Array.from({ length: BLADE_COUNT }, (_, i) => (
					<span
						key={i}
						className='tdc-tos-aperture__blade'
						style={{ '--tos-blade-i': i } as React.CSSProperties}
					/>
				))}
			</div>
		</div>

		<div className='tdc-tos-aperture__portal'>
			<span className='tdc-tos-aperture__portal-ring' aria-hidden='true' />
			<span key={displayToken} className='tdc-tos-token'>
				{displayToken}
			</span>
		</div>
	</div>
);

export default memo(TerracottaOliveSandAperture);
