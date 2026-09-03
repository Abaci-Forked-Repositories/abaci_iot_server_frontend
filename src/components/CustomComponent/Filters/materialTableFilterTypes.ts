export type MaterialTableFilterProps = {
	columnDef?: { tableData?: { id?: number; filterValue?: unknown } };
	onFilterChanged: (columnId: number, value: unknown) => void;
};

export const asMaterialTableFilterProps = (props: unknown): MaterialTableFilterProps =>
	props as MaterialTableFilterProps;
