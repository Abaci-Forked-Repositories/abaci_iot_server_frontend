import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import classNames from 'classnames';
import Icon from '../../icon/Icon';
import {
	KNOWLEDGE_FLOW,
	KNOWLEDGE_TOPICS,
	type KnowledgeTopic,
	type KnowledgeTopicId,
} from './knowledgeContent';

const accentClass = (accent: KnowledgeTopic['accent']) => {
	switch (accent) {
		case 'info':
			return 'knowledge-accent--info';
		case 'success':
			return 'knowledge-accent--success';
		case 'warning':
			return 'knowledge-accent--warning';
		default:
			return 'knowledge-accent--primary';
	}
};

const panelVariants = {
	enter: (reduce: boolean) => ({
		opacity: 0,
		y: reduce ? 0 : 18,
		filter: reduce ? 'none' : 'blur(4px)',
	}),
	center: {
		opacity: 1,
		y: 0,
		filter: 'blur(0px)',
		transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
	},
	exit: (reduce: boolean) => ({
		opacity: 0,
		y: reduce ? 0 : -10,
		filter: reduce ? 'none' : 'blur(2px)',
		transition: { duration: 0.2 },
	}),
};

const KnowledgeWorkspace: React.FC = () => {
	const reduceMotion = useReducedMotion();
	const [activeId, setActiveId] = useState<KnowledgeTopicId>('overview');
	const activeTopic = KNOWLEDGE_TOPICS.find((t) => t.id === activeId) ?? KNOWLEDGE_TOPICS[0];
	const activeIndex = KNOWLEDGE_TOPICS.findIndex((t) => t.id === activeId);

	useEffect(() => {
		const hash = window.location.hash.replace('#', '') as KnowledgeTopicId;
		if (hash && KNOWLEDGE_TOPICS.some((t) => t.id === hash)) {
			setActiveId(hash);
		}
	}, []);

	const selectTopic = (id: KnowledgeTopicId) => {
		setActiveId(id);
		window.history.replaceState(null, '', `#${id}`);
	};

	return (
		<div className='knowledge-page'>
			<motion.section
				className='knowledge-hero'
				initial={reduceMotion ? false : { opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
				<div className='knowledge-hero__glow' aria-hidden />
				<div className='knowledge-hero__content'>
					<div className='knowledge-hero__badge'>
						<Icon icon='MenuBook' size='sm' />
						<span>User guide</span>
					</div>
					<h1 className='knowledge-hero__title'>How this project works</h1>
					<p className='knowledge-hero__text'>
						Follow the flow from setup to serving, then open any topic for a plain
						explanation of what each part does and how the terms are used.
					</p>
				</div>

				<div className='knowledge-flow' aria-label='Typical project flow'>
					{KNOWLEDGE_FLOW.map((step, index) => (
						<React.Fragment key={step.id}>
							<motion.div
								className='knowledge-flow__step'
								initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ delay: 0.12 + index * 0.06, duration: 0.3 }}>
								<span className='knowledge-flow__icon'>
									<Icon icon={step.icon} size='sm' />
								</span>
								<span className='knowledge-flow__label'>{step.label}</span>
							</motion.div>
							{index < KNOWLEDGE_FLOW.length - 1 ? (
								<span className='knowledge-flow__arrow' aria-hidden>
									<Icon icon='ChevronRight' size='sm' />
								</span>
							) : null}
						</React.Fragment>
					))}
				</div>
			</motion.section>

			<div className='knowledge-layout'>
				<nav className='knowledge-nav' aria-label='Knowledge topics'>
					<div className='knowledge-nav__title'>Sections</div>
					<ul className='knowledge-nav__list'>
						{KNOWLEDGE_TOPICS.map((topic) => {
							const isActive = topic.id === activeId;
							return (
								<li key={topic.id}>
									<button
										type='button'
										className={classNames('knowledge-nav__item', accentClass(topic.accent), {
											'is-active': isActive,
										})}
										onClick={() => selectTopic(topic.id)}
										aria-current={isActive ? 'page' : undefined}>
										<span className='knowledge-nav__item-icon'>
											<Icon icon={topic.icon} size='sm' />
										</span>
										<span className='knowledge-nav__item-text'>
											<span className='knowledge-nav__item-title'>{topic.title}</span>
											<span className='knowledge-nav__item-sub'>{topic.subtitle}</span>
										</span>
									</button>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className='knowledge-panel-wrap'>
					<AnimatePresence mode='wait' custom={!!reduceMotion}>
						<motion.article
							key={activeTopic.id}
							className={classNames('knowledge-panel', accentClass(activeTopic.accent))}
							custom={!!reduceMotion}
							variants={panelVariants}
							initial='enter'
							animate='center'
							exit='exit'>
							<header className='knowledge-panel__header'>
								<span className='knowledge-panel__icon'>
									<Icon icon={activeTopic.icon} />
								</span>
								<div>
									<h2 className='knowledge-panel__title'>{activeTopic.title}</h2>
									<p className='knowledge-panel__subtitle'>{activeTopic.subtitle}</p>
								</div>
							</header>

							<p className='knowledge-panel__summary'>{activeTopic.summary}</p>

							{activeTopic.paragraphs?.map((paragraph) => (
								<p key={paragraph.slice(0, 48)} className='knowledge-panel__paragraph'>
									{paragraph}
								</p>
							))}

							{activeTopic.steps?.length ? (
								<section className='knowledge-section'>
									<h3 className='knowledge-section__title'>Typical flow</h3>
									<ol className='knowledge-steps'>
										{activeTopic.steps.map((step, index) => (
											<li key={step} className='knowledge-steps__item'>
												<span className='knowledge-steps__num'>{index + 1}</span>
												<span>{step}</span>
											</li>
										))}
									</ol>
								</section>
							) : null}

							{activeTopic.terms?.length ? (
								<section className='knowledge-section'>
									<h3 className='knowledge-section__title'>Terms &amp; how they are used</h3>
									<div className='knowledge-terms'>
										{activeTopic.terms.map((term) => (
											<div key={term.name} className='knowledge-term'>
												<div className='knowledge-term__name'>{term.name}</div>
												<p className='knowledge-term__desc'>{term.description}</p>
											</div>
										))}
									</div>
								</section>
							) : null}

							{activeTopic.tips?.length ? (
								<section className='knowledge-section'>
									<h3 className='knowledge-section__title'>Good to know</h3>
									<div className='knowledge-tips'>
										{activeTopic.tips.map((tip) => (
											<div key={tip.title} className='knowledge-tip'>
												<div className='knowledge-tip__icon'>
													<Icon icon='Lightbulb' size='sm' />
												</div>
												<div>
													<div className='knowledge-tip__title'>{tip.title}</div>
													<p className='knowledge-tip__text'>{tip.text}</p>
												</div>
											</div>
										))}
									</div>
								</section>
							) : null}

							<footer className='knowledge-panel__footer'>
								<button
									type='button'
									className='knowledge-panel__nav-btn'
									disabled={activeIndex <= 0}
									onClick={() => {
										if (activeIndex > 0) selectTopic(KNOWLEDGE_TOPICS[activeIndex - 1].id);
									}}>
									<Icon icon='ChevronLeft' size='sm' />
									Previous
								</button>
								<button
									type='button'
									className='knowledge-panel__nav-btn knowledge-panel__nav-btn--next'
									disabled={activeIndex >= KNOWLEDGE_TOPICS.length - 1}
									onClick={() => {
										if (activeIndex < KNOWLEDGE_TOPICS.length - 1) {
											selectTopic(KNOWLEDGE_TOPICS[activeIndex + 1].id);
										}
									}}>
									Next section
									<Icon icon='ChevronRight' size='sm' />
								</button>
							</footer>
						</motion.article>
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
};

export default KnowledgeWorkspace;
