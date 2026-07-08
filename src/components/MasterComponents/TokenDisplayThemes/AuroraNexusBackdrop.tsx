import React from 'react';

/** Flowing aurora curtains, floating glows, lens flares, and stardust for Aurora Nexus. */
const AuroraNexusBackdrop: React.FC = () => (
	<div className='tdc-an-backdrop' aria-hidden='true'>
		<div className='tdc-an-backdrop__base' />
		<div className='tdc-an-backdrop__float'>
			<div className='tdc-an-backdrop__float-glow tdc-an-backdrop__float-glow--blue'>
				<div className='tdc-an-backdrop__float-glow-inner' />
			</div>
			<div className='tdc-an-backdrop__float-glow tdc-an-backdrop__float-glow--purple'>
				<div className='tdc-an-backdrop__float-glow-inner' />
			</div>
			<div className='tdc-an-backdrop__float-glow tdc-an-backdrop__float-glow--cyan'>
				<div className='tdc-an-backdrop__float-glow-inner' />
			</div>
		</div>
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--1'>
			<div className='tdc-an-backdrop__ribbon-inner' />
		</div>
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--2'>
			<div className='tdc-an-backdrop__ribbon-inner' />
		</div>
		<div className='tdc-an-backdrop__ribbon tdc-an-backdrop__ribbon--3'>
			<div className='tdc-an-backdrop__ribbon-inner' />
		</div>
		<div className='tdc-an-backdrop__curtain tdc-an-backdrop__curtain--1'>
			<div className='tdc-an-backdrop__curtain-inner' />
		</div>
		<div className='tdc-an-backdrop__curtain tdc-an-backdrop__curtain--2'>
			<div className='tdc-an-backdrop__curtain-inner' />
		</div>
		<div className='tdc-an-backdrop__curtain tdc-an-backdrop__curtain--3'>
			<div className='tdc-an-backdrop__curtain-inner' />
		</div>
		<div className='tdc-an-backdrop__stars' />
		<div className='tdc-an-backdrop__vignette' />
		<div className='tdc-an-backdrop__twinkles'>
			<span />
			<span />
			<span />
			<span />
			<span />
			<span />
		</div>
		<div className='tdc-an-backdrop__flares'>
			<div className='tdc-an-backdrop__flare-track tdc-an-backdrop__flare-track--1'>
				<span className='tdc-an-backdrop__flare tdc-an-backdrop__flare--1' />
			</div>
			<div className='tdc-an-backdrop__flare-track tdc-an-backdrop__flare-track--2'>
				<span className='tdc-an-backdrop__flare tdc-an-backdrop__flare--2' />
			</div>
			<div className='tdc-an-backdrop__flare-track tdc-an-backdrop__flare-track--3'>
				<span className='tdc-an-backdrop__flare tdc-an-backdrop__flare--3' />
			</div>
			<div className='tdc-an-backdrop__flare-track tdc-an-backdrop__flare-track--4'>
				<span className='tdc-an-backdrop__flare tdc-an-backdrop__flare--4' />
			</div>
		</div>
	</div>
);

export default AuroraNexusBackdrop;
