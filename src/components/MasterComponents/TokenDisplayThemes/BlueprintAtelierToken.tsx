import React, { memo } from 'react';

export interface BlueprintAtelierTokenProps {
	displayToken: string;
	draw?: boolean;
}

/** Token as a CAD dimension callout — extension lines + inked value. */
const BlueprintAtelierToken: React.FC<BlueprintAtelierTokenProps> = ({
	displayToken,
	draw = false,
}) => (
	<div
		className={['tdc-ba-callout', draw ? 'tdc-ba-callout--draw' : ''].filter(Boolean).join(' ')}
		aria-label={`Token ${displayToken}`}>
		<span className='tdc-ba-callout__eyebrow' aria-hidden='true'>
			NOW SERVING
		</span>

		<div className='tdc-ba-callout__dim' aria-hidden='true'>
			<span className='tdc-ba-callout__ext tdc-ba-callout__ext--left' />
			<span className='tdc-ba-callout__arrow tdc-ba-callout__arrow--left' />
			<span className='tdc-ba-callout__rule' />
			<span className='tdc-ba-callout__arrow tdc-ba-callout__arrow--right' />
			<span className='tdc-ba-callout__ext tdc-ba-callout__ext--right' />
		</div>

		<span key={displayToken} className='tdc-ba-callout__token'>
			{displayToken}
		</span>

		<div className='tdc-ba-callout__ticks' aria-hidden='true'>
			<span className='tdc-ba-callout__tick' />
			<span className='tdc-ba-callout__tick' />
			<span className='tdc-ba-callout__tick' />
		</div>
	</div>
);

export default memo(BlueprintAtelierToken);
