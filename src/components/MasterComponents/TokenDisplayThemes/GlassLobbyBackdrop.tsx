import React from 'react';

/** Soft hospital-lobby atmosphere — breathing gradient and blurred orbs. */
const GlassLobbyBackdrop: React.FC = () => (
	<div className='tdc-gl-backdrop' aria-hidden='true'>
		<div className='tdc-gl-backdrop__breathe'>
			<div className='tdc-gl-backdrop__breathe-layer tdc-gl-backdrop__breathe-layer--purple' />
			<div className='tdc-gl-backdrop__breathe-layer tdc-gl-backdrop__breathe-layer--pink' />
			<div className='tdc-gl-backdrop__breathe-layer tdc-gl-backdrop__breathe-layer--blue' />
		</div>
		<div className='tdc-gl-backdrop__lobby' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--pink' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--violet' />
		<div className='tdc-gl-backdrop__orb tdc-gl-backdrop__orb--cyan' />
	</div>
);

export default GlassLobbyBackdrop;
