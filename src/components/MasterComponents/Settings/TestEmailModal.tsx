import React, { FC, useEffect, useState } from 'react';
import Button from '../../bootstrap/Button';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import FormGroup from '../../bootstrap/forms/FormGroup';
import Input from '../../bootstrap/forms/Input';
import Icon from '../../icon/Icon';
import Spinner from '../../bootstrap/Spinner';
import useToasterNotification from '../../../hooks/useToasterNotification';
import {
	sendTestEmail,
	SendTestEmailPayload,
} from '../../../api/administration/cloudSync.api';

export type TestEmailSettings = Omit<SendTestEmailPayload, 'email'>;

interface TestEmailModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	fromAddress: string;
	/** Current Email Settings form values (sent with the test request). */
	settings: TestEmailSettings;
	/** Called after send_test_email succeeds (HTTP OK / success !== false). */
	onTestSuccess?: () => void;
}

/**
 * Send Test Email — POST system-config/send_test_email/
 * Send stays disabled until recipient has a value.
 */
const TestEmailModal: FC<TestEmailModalProps> = ({
	isOpen,
	setIsOpen,
	fromAddress,
	settings,
	onTestSuccess,
}) => {
	const [recipient, setRecipient] = useState('');
	const [sending, setSending] = useState(false);
	const { showSuccessNotification, showErrorNotification } = useToasterNotification();

	useEffect(() => {
		if (!isOpen) {
			setRecipient('');
			setSending(false);
		}
	}, [isOpen]);

	const canSend = Boolean(recipient.trim()) && !sending;

	const handleSend = async () => {
		const email = recipient.trim();
		if (!email || sending) return;

		setSending(true);
		try {
			const data = await sendTestEmail({
				email,
				email_host: settings.email_host,
				email_password: settings.email_password,
				email_port: settings.email_port,
				email_protocol: settings.email_protocol,
				encryption_type: settings.encryption_type,
				sender_email: settings.sender_email || fromAddress,
			});
			if (data.success === false) {
				showErrorNotification(data.message || 'Test email failed.');
				return;
			}
			showSuccessNotification(data.message || 'Test email sent.');
			onTestSuccess?.();
			setIsOpen(false);
		} catch (err) {
			showErrorNotification(err);
		} finally {
			setSending(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size='lg'
			isCentered
			titleId='test-email-title'
			isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='test-email-title'>Test Email Configuration</ModalTitle>
			</ModalHeader>
			<ModalBody className='px-4'>
				<div className='rounded-3 bg-primary text-white p-3 p-md-4 mb-4'>
					<div className='fw-semibold mb-1'>Verify SMTP Connectivity</div>
					<div className='small opacity-75'>
						Confirm your email configuration is correct by sending a test message. A
						successful test is required before saving changes.
					</div>
				</div>

				<div className='row g-3 align-items-end'>
					<div className='col-md-5'>
						<FormGroup id='test_from' label='Sender Address (From)'>
							<Input
								id='test_from'
								type='email'
								value={fromAddress}
								disabled
								readOnly
							/>
						</FormGroup>
					</div>
					<div className='col-md-2 d-flex justify-content-center pb-3'>
						<Icon icon='ArrowForward' size='lg' color='primary' />
					</div>
					<div className='col-md-5'>
						<FormGroup id='test_to' label='Recipient Address (To)'>
							<Input
								id='test_to'
								type='email'
								value={recipient}
								placeholder='recipient@example.com'
								disabled={sending}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setRecipient(e.target.value)
								}
							/>
						</FormGroup>
					</div>
				</div>
			</ModalBody>
			<ModalFooter className='px-4'>
				<Button color='light' isDisable={sending} onClick={() => setIsOpen(false)}>
					Cancel
				</Button>
				<Button
					color='primary'
					icon={sending ? undefined : 'Send'}
					isDisable={!canSend}
					onClick={() => {
						void handleSend();
					}}>
					{sending ? (
						<>
							<Spinner isSmall inButton />
							Sending…
						</>
					) : (
						'Send Test Email'
					)}
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TestEmailModal;
