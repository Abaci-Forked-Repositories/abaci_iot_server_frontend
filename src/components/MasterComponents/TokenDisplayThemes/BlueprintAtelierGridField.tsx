import React, { memo } from 'react';

/** Navy CAD grid with construction arcs, crosshairs, and sheet marks. */
const BlueprintAtelierGridField: React.FC = () => (
	<div className='tdc-ba-grid-field' aria-hidden='true'>
		<div className='tdc-ba-grid-field__paper' />
		<div className='tdc-ba-grid-field__grid' />
		<div className='tdc-ba-grid-field__major' />
		<svg className='tdc-ba-grid-field__svg' viewBox='0 0 100 100' preserveAspectRatio='none'>
			<circle className='tdc-ba-grid-field__arc' cx='18' cy='78' r='22' />
			<circle className='tdc-ba-grid-field__arc tdc-ba-grid-field__arc--soft' cx='82' cy='22' r='16' />
			<path className='tdc-ba-grid-field__guide' d='M8 42 H92' />
			<path className='tdc-ba-grid-field__guide' d='M52 6 V94' />
			<path
				className='tdc-ba-grid-field__guide tdc-ba-grid-field__guide--diag'
				d='M12 88 L38 62'
			/>
		</svg>
		<span className='tdc-ba-grid-field__crosshair tdc-ba-grid-field__crosshair--tl' />
		<span className='tdc-ba-grid-field__crosshair tdc-ba-grid-field__crosshair--br' />
		<span className='tdc-ba-grid-field__mark tdc-ba-grid-field__mark--a'>A</span>
		<span className='tdc-ba-grid-field__mark tdc-ba-grid-field__mark--1'>1</span>
		<div className='tdc-ba-grid-field__veil' />
	</div>
);

export default memo(BlueprintAtelierGridField);
