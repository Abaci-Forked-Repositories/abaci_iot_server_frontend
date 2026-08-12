import React, { FC, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import AbaciLogo from '../assets/Abaci Logo Dark mode SVG.svg';
import AbaciLogoWhite from '../assets/Abaci Logo SVG.svg';

interface ILogoProps {
	width?: number;
	height?: number;
	dark?: boolean;
}

const Logo: FC<ILogoProps> = ({ width = 150, height = 89, dark = true }) => {
	const [loaded, setLoaded] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const src = dark ? AbaciLogo : AbaciLogoWhite;

	useEffect(() => {
		setLoaded(false);
		const img = imgRef.current;
		if (img?.complete && img.naturalWidth > 0) {
			setLoaded(true);
		}
	}, [src]);

	return (
		<img
			ref={imgRef}
			src={src}
			alt=''
			width={width}
			height={height}
			decoding='async'
			onLoad={() => setLoaded(true)}
			style={{
				opacity: loaded ? 1 : 0,
				transition: 'opacity 0.15s ease',
				display: 'inline-block',
				verticalAlign: 'middle',
			}}
		/>
	);
};

Logo.propTypes = {
	width: PropTypes.number,
	height: PropTypes.number,
};
Logo.defaultProps = {
	width: 2155,
	height: 854,
	dark: true,
};

export default Logo;
