import React, { FC, useState } from 'react';
import { Form } from 'reactstrap';
import { useForm } from 'react-hook-form';
import { authAxios } from '../../../axiosInstance';
import OffCanvasComponent from '../../OffCanvasComponent';
import Card, { CardBody } from '../../bootstrap/Card';
import SaveButton from '../../CustomComponent/Buttons/SaveButton';
import useToasterNotification from '../../../hooks/useToasterNotification';
import Fields, { type UserRoleSelectOption } from './Fields';

interface AddUserProps {
	isOpen: boolean;
	setIsOpen: (isOpen: boolean) => void;
	tableRef: React.RefObject<{ onQueryChange: () => void } | null>;
	title: string;
}

type AddUserFormValues = {
	first_name: string;
	last_name: string;
	email: string;
	role: UserRoleSelectOption | null;
	password: string;
	password2: string;
};

const AddUser: FC<AddUserProps> = ({ isOpen, setIsOpen, tableRef, title }) => {
	const { showErrorNotification, showSuccessNotification } = useToasterNotification();
	const {
		register,
		handleSubmit,
		getValues,
		control,
		reset,
		formState: { errors },
		trigger,
	} = useForm<AddUserFormValues>({
		defaultValues: {
			first_name: '',
			last_name: '',
			email: '',
			role: null,
			password: '',
			password2: '',
		},
	});

	const [waitingForAxios, setwaitingForAxios] = useState(false);

	const onSubmit = (data: AddUserFormValues) => {
		const payload = {
			email: data.email.trim(),
			first_name: data.first_name.trim(),
			last_name: data.last_name.trim(),
			role_id: data.role?.value ?? undefined,
			password: data.password,
			password2: data.password2,
		};

		setwaitingForAxios(true);
		authAxios
			.post('/api/users/', payload)
			.then((res) => {
				setwaitingForAxios(false);
				tableRef?.current?.onQueryChange?.();
				showSuccessNotification(
					res.data?.message || 'User created successfully.',
				);
				reset();
				setIsOpen(false);
			})
			.catch((err) => {
				setwaitingForAxios(false);
				showErrorNotification(err);
			});
	};

	return (
		<OffCanvasComponent isOpen={isOpen} placement='end' title={title} setOpen={setIsOpen}>
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Card>
					<CardBody>
						<Fields
							register={register}
							errors={errors}
							getValues={getValues}
							control={control}
							trigger={trigger}
						/>
						<div className='row m-0'>
							<div className='col-12 p-3'>
								<SaveButton state={waitingForAxios} />
							</div>
						</div>
					</CardBody>
				</Card>
			</Form>
		</OffCanvasComponent>
	);
};

export default AddUser;
