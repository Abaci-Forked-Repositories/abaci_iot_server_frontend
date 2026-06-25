import React from 'react';

/** Flowing aurora ribbons + stardust for the Aurora Nexus theme. */
const AuroraNexusBackdrop: React.FC = () => (
	<div className='tdc-an-backdrop' aria-hidden='true'>
		<div className='tdc-an-backdrop__base' />
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--1' />
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--2' />
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--3' />
		<div className='tdc-an-backdrop__stars' />
		<div className='tdc-an-backdrop__vignette' />
	</div>
);

export default AuroraNexusBackdrop;
