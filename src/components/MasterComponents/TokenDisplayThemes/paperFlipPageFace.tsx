import React from 'react';

export interface PageSnapshot {
	token: string;
	queueName?: string;
	subtitle?: string;
	statusLabel: string;
	statusModifier: string;
}

export interface PaperFlipPageFaceProps {
	data: PageSnapshot;
	side: 'front' | 'back';
}

export function PaperFlipPageFace({ data, side }: PaperFlipPageFaceProps) {
	if (side === 'back') {
		return (
			<div className='tdc-pf-page__back' aria-hidden='true'>
				<div className='tdc-pf-page__back-texture' />
			</div>
		);
	}

	return (
		<div className='tdc-pf-page__front'>
			<header className='tdc-pf-page__header'>
				{data.subtitle ? (
					<span className='tdc-pf-page__subtitle'>{data.subtitle}</span>
				) : (
					<span className='tdc-pf-page__subtitle tdc-pf-page__subtitle--empty' aria-hidden='true' />
				)}
				<span
					className={[
						'tdc-pf-page__status',
						`tdc-pf-page__status--${data.statusModifier}`,
					].join(' ')}>
					<span className='tdc-pf-page__status-dot' aria-hidden='true' />
					<span className='tdc-pf-page__status-label'>{data.statusLabel}</span>
				</span>
			</header>

			<div className='tdc-pf-page__token-wrap'>
				<span className='tdc-pf-page__token'>{data.token}</span>
			</div>
		</div>
	);
}
