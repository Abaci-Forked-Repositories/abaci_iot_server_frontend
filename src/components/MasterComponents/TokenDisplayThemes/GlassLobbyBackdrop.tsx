import React from 'react';

/** Soft hospital-lobby atmosphere — blurred orbs and architectural light (CSS only). */
const GlassLobbyBackdrop: React.FC = () => (
	<div className='tdc-gl-backdrop' aria-hidden='true'>
		<div className='tdc-gl-backdrop__lobby' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--pink' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--violet' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--cyan' />
		<div className='tdc-gl-backdrop__sparkles'>
			<span />
			<span />
			<span />
			<span />
		</div>
	</div>
);

export default GlassLobbyBackdrop;
