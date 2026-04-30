import React from 'react';
import { Player } from '@lottiefiles/react-lottie-player';
import PropTypes from 'prop-types';

const NoDataComponent = ({ lottie, description }) => {
	return (
		<div className='position_centered' style={{position:'relative'}}>
			<Player autoplay loop src={lottie} style={{ height: '200px' }} />
			<p className='position_centered' style={{marginTop:"50px", textAlign:"center"}}>{description}</p>
		</div>
	);
};
	/* eslint-disable react/forbid-prop-types */
NoDataComponent.propTypes = {
	lottie: PropTypes.any.isRequired, 
	description: PropTypes.string.isRequired,
  };
    /* eslint-enable react/forbid-prop-types */
export default NoDataComponent