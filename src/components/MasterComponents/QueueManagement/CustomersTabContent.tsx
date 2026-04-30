import React, { FormEvent } from 'react';
import type { TokenUser } from '../../../services/queueManagementApi';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../bootstrap/Card';
import Button from '../../bootstrap/Button';

export interface CustomersTabContentProps {
	customerSearchType: 'phone' | 'email';
	setCustomerSearchType: (v: 'phone' | 'email') => void;
	customerSearchValue: string;
	setCustomerSearchValue: (v: string) => void;
	onSearch: (e: FormEvent<HTMLFormElement>) => void;
	searchLoading: boolean;
	customerSearchResults: TokenUser[];
	tokenUsers: TokenUser[];
}

const CustomersTabContent: React.FC<CustomersTabContentProps> = ({
	customerSearchType,
	setCustomerSearchType,
	customerSearchValue,
	setCustomerSearchValue,
	onSearch,
	searchLoading,
	customerSearchResults,
	tokenUsers,
}) => {
	return (
		<div className='row g-4'>
			<div className='col-12 col-lg-4'>
				<Card stretch>
					<CardHeader>
						<CardLabel icon='Search'>
							<CardTitle tag='h5'>Find Customer</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody>
						<form onSubmit={onSearch} className='d-flex flex-column gap-3'>
							<select
								className='form-select'
								value={customerSearchType}
								onChange={(e) => setCustomerSearchType(e.target.value as 'phone' | 'email')}>
								<option value='phone'>By phone</option>
								<option value='email'>By email</option>
							</select>
							<input
								className='form-control'
								required
								value={customerSearchValue}
								onChange={(e) => setCustomerSearchValue(e.target.value)}
								placeholder={customerSearchType === 'phone' ? '555-0001' : 'customer@example.com'}
							/>
							<Button color='primary' type='submit' isDisable={searchLoading}>
								Search
							</Button>
						</form>
						<hr />
						{customerSearchResults.map((customer, i) => (
							<div
								className='border rounded-3 p-2 mb-2'
								key={customer.id ?? `search-${i}-${customer.email}`}>
								<div className='fw-semibold'>{customer.name}</div>
								<div className='text-muted small'>{customer.phone || '-'}</div>
								<div className='text-muted small'>{customer.email || '-'}</div>
							</div>
						))}
					</CardBody>
				</Card>
			</div>
			<div className='col-12 col-lg-8'>
				<Card stretch>
					<CardHeader>
						<CardLabel icon='PeopleAlt'>
							<CardTitle tag='h5'>Token Users</CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody className='table-responsive'>
						<table className='table table-modern align-middle'>
							<thead>
								<tr>
									<th>Name</th>
									<th>Email</th>
									<th>Phone</th>
									<th>Age</th>
									<th>Place</th>
								</tr>
							</thead>
							<tbody>
								{tokenUsers.map((customer) => (
									<tr key={customer.id ?? `tu-${customer.email}-${customer.phone}`}>
										<td>{customer.name}</td>
										<td>{customer.email || '-'}</td>
										<td>{customer.phone || '-'}</td>
										<td>{customer.age || '-'}</td>
										<td>{customer.place || '-'}</td>
									</tr>
								))}
								{!tokenUsers.length && (
									<tr>
										<td colSpan={5} className='text-center text-muted py-4'>
											No token users found.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</CardBody>
				</Card>
			</div>
		</div>
	);
};

export default CustomersTabContent;
