import React, { useEffect, useRef, useState } from 'react';
import MaterialTable, {
	type MaterialTableProps,
} from '@material-table/core';

const TOOLBAR_FALLBACK = 64;
const PAGINATION_FALLBACK = 56;
const MIN_BODY = 240;

type FullHeightMaterialTableProps<RowData extends object> = MaterialTableProps<RowData>;

/**
 * MaterialTable that fills its parent height.
 * Body scrolls when rows exceed available space; height does not collapse with few rows.
 */
function FullHeightMaterialTable<RowData extends object>(
	props: FullHeightMaterialTableProps<RowData>,
) {
	const { options, ...rest } = props;
	const wrapRef = useRef<HTMLDivElement>(null);
	const [bodyHeight, setBodyHeight] = useState(MIN_BODY);

	useEffect(() => {
		const el = wrapRef.current;
		if (!el) return undefined;

		const measure = () => {
			const paper = el.querySelector('.MuiPaper-root') as HTMLElement | null;
			const root = paper ?? el;
			const toolbar = root.querySelector(
				'.MuiToolbar-root:not(.MuiTablePagination-toolbar)',
			) as HTMLElement | null;
			const pagination = root.querySelector(
				'.MuiTablePagination-root',
			) as HTMLElement | null;

			const available = el.clientHeight;
			const chrome =
				(toolbar?.offsetHeight || TOOLBAR_FALLBACK) +
				(pagination?.offsetHeight || PAGINATION_FALLBACK);
			const next = Math.max(MIN_BODY, available - chrome);
			setBodyHeight((prev) => (Math.abs(prev - next) > 2 ? next : prev));
		};

		measure();
		requestAnimationFrame(() => requestAnimationFrame(measure));

		const ro = new ResizeObserver(() => {
			requestAnimationFrame(measure);
		});
		ro.observe(el);

		const mo = new MutationObserver(() => {
			requestAnimationFrame(measure);
		});
		mo.observe(el, { childList: true, subtree: true });

		window.addEventListener('resize', measure);
		return () => {
			ro.disconnect();
			mo.disconnect();
			window.removeEventListener('resize', measure);
		};
	}, []);

	return (
		<div ref={wrapRef} className='material-table-full-height'>
			<MaterialTable
				{...rest}
				options={{
					...options,
					maxBodyHeight: bodyHeight,
					minBodyHeight: bodyHeight,
					emptyRowsWhenPaging: options?.emptyRowsWhenPaging ?? false,
				}}
			/>
		</div>
	);
}

export default FullHeightMaterialTable;
