import React, { useEffect, useMemo, useState } from 'react';
import type { RecentQueueToken } from '../../../services/publicScreenApi';

const TOKENS_PER_PAGE = 4;
const PAGE_ROTATE_MS = 5200;

const PILL_VARIANTS = ['cyan', 'purple', 'blue', 'magenta'] as const;

export interface AuroraNexusActiveTokensProps {
	tokens: RecentQueueToken[];
	showHistoryTime?: boolean;
	enteringKeys: ReadonlySet<string>;
	onEnterEnd: (key: string) => void;
	tokenKeyFn: (t: RecentQueueToken) => string;
	shortCounterLabel: (name: string | undefined) => string | null;
	fmtTime: (iso: string | undefined) => string;
}

const NavChevron: React.FC = () => (
	<svg className='tdc-an-active__nav-icon' viewBox='0 0 24 24' aria-hidden='true'>
		<path
			d='M10 7l5 5-5 5'
			fill='none'
			stroke='currentColor'
			strokeWidth='2.2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
);


const AuroraNexusActiveTokens: React.FC<AuroraNexusActiveTokensProps> = ({
	tokens,
	showHistoryTime = true,
	enteringKeys,
	onEnterEnd,
	tokenKeyFn,
	shortCounterLabel,
	fmtTime,
}) => {
	const pageCount = Math.max(1, Math.ceil(tokens.length / TOKENS_PER_PAGE));
	const [page, setPage] = useState(0);

	useEffect(() => {
		setPage(0);
	}, [tokens.length]);

	useEffect(() => {
		if (pageCount <= 1) return undefined;
		const timer = window.setInterval(() => {
			setPage((current) => (current + 1) % pageCount);
		}, PAGE_ROTATE_MS);
		return () => window.clearInterval(timer);
	}, [pageCount]);

	const visibleTokens = useMemo(() => {
		if (tokens.length <= TOKENS_PER_PAGE) return tokens;
		const start = page * TOKENS_PER_PAGE;
		return tokens.slice(start, start + TOKENS_PER_PAGE);
	}, [tokens, page]);

	return (
		<div className='tdc-an-active' aria-label='Active tokens'>
			<div className='tdc-an-active__row'>
				<div className='tdc-an-active__label-block' aria-hidden='true'>
					<span className='tdc-an-active__label'>Active</span>
					<span className='tdc-an-active__label'>Tokens</span>
				</div>

				<div className='tdc-an-active__viewport'>
					<div className='tdc-an-active__grid'>
						{visibleTokens.map((t, i) => {
							const counter = shortCounterLabel(t.serving_point_name);
							const tokenKey = tokenKeyFn(t);
							const isEntering = enteringKeys.has(tokenKey);
							const variant = PILL_VARIANTS[(page * TOKENS_PER_PAGE + i) % PILL_VARIANTS.length];
							return (
								<div
									key={tokenKey}
									className={[
										'tdc-an-active__pill',
										`tdc-an-active__pill--${variant}`,
										isEntering ? 'tdc-an-active__pill--enter' : '',
									]
										.filter(Boolean)
										.join(' ')}
									onAnimationEnd={() => {
										if (isEntering) onEnterEnd(tokenKey);
									}}>
									<span className='tdc-an-active__pill-token'>{t.token_display}</span>
									<span className='tdc-an-active__pill-label'>Counter</span>
									{counter ? (
										<span className='tdc-an-active__pill-counter'>{counter}</span>
									) : (
										<span className='tdc-an-active__pill-counter tdc-an-active__pill-counter--empty' />
									)}
									{showHistoryTime && t.called_at ? (
										<span className='tdc-an-active__pill-time'>{fmtTime(t.called_at)}</span>
									) : null}
								</div>
							);
						})}
					</div>
				</div>

				{pageCount > 1 ? (
					<button
						type='button'
						className='tdc-an-active__nav'
						aria-label='Next active tokens page'
						onClick={() => setPage((current) => (current + 1) % pageCount)}>
						<NavChevron />
					</button>
				) : (
					<div className='tdc-an-active__nav tdc-an-active__nav--ghost' aria-hidden='true'>
						<NavChevron />
					</div>
				)}
			</div>

			{pageCount > 1 ? (
				<div className='tdc-an-active__dots' aria-hidden='true'>
					{Array.from({ length: pageCount }, (_, index) => (
						<span
							key={index}
							className={[
								'tdc-an-active__dot',
								index === page ? 'tdc-an-active__dot--active' : '',
							]
								.filter(Boolean)
								.join(' ')}
						/>
					))}
				</div>
			) : tokens.length > 0 ? (
				<div className='tdc-an-active__dots' aria-hidden='true'>
					{Array.from({ length: 4 }, (_, index) => (
						<span
							key={index}
							className={[
								'tdc-an-active__dot',
								index === 0 ? 'tdc-an-active__dot--active' : '',
							]
								.filter(Boolean)
								.join(' ')}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

export default AuroraNexusActiveTokens;
