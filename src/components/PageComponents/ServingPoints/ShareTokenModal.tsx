import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '../../bootstrap/Modal';
import Button from '../../bootstrap/Button';
import Icon from '../../icon/Icon';
import Spinner from '../../bootstrap/Spinner';

export interface ShareTokenModalProps {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	tokenUserUuid: string;
	queueId: number;
	tokenDisplay: string | null;
	customerName?: string | null;
}

const ShareTokenModal: React.FC<ShareTokenModalProps> = ({
	isOpen,
	setIsOpen,
	tokenUserUuid,
	queueId,
	tokenDisplay,
	customerName,
}) => {
	const [copied, setCopied] = useState(false);
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [qrLoading, setQrLoading] = useState(false);

	const publicUrl = `${window.location.origin}/public/token-status?token=${encodeURIComponent(tokenUserUuid)}&queue=${queueId}`;

	useEffect(() => {
		if (!isOpen) {
			setQrDataUrl(null);
			return;
		}
		let cancelled = false;
		setQrLoading(true);
		void QRCode.toDataURL(publicUrl, { width: 200, margin: 2, errorCorrectionLevel: 'M' })
			.then((url) => {
				if (!cancelled) setQrDataUrl(url);
			})
			.catch(() => {
				if (!cancelled) setQrDataUrl(null);
			})
			.finally(() => {
				if (!cancelled) setQrLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [isOpen, publicUrl]);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(publicUrl);
		} catch {
			const el = document.createElement('textarea');
			el.value = publicUrl;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 2500);
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={setIsOpen} isCentered isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen}>
				<ModalTitle id='share-token-modal'>
					<div className='d-flex align-items-center gap-3'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 40, height: 40 }}>
							<Icon icon='QrCode2' color='primary' />
						</span>
						<div>
							<div className='fw-bold lh-sm'>Share Token Status</div>
							<div className='text-muted small fw-normal mt-1'>
								Let the customer track their position
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>

			<ModalBody className='pt-2 pb-3'>
				{(tokenDisplay || customerName) && (
					<div className='d-flex align-items-center gap-3 p-3 rounded-4 mb-4 border border-secondary border-opacity-25 bg-body-secondary'>
						<span
							className='d-inline-flex align-items-center justify-content-center rounded-3 bg-primary bg-opacity-10 flex-shrink-0'
							style={{ width: 48, height: 48 }}>
							<Icon icon='ConfirmationNumber' color='primary' />
						</span>
						<div className='min-w-0 flex-grow-1'>
							<div className='text-muted small text-uppercase fw-semibold mb-1'>Token</div>
							{tokenDisplay && (
								<div className='fw-bold fs-5 text-body lh-sm text-truncate'>{tokenDisplay}</div>
							)}
							{customerName && (
								<div className='text-muted small mt-1 text-truncate'>{customerName}</div>
							)}
						</div>
					</div>
				)}

				<div className='rounded-4 border border-secondary border-opacity-25 bg-body-secondary bg-opacity-50 p-3 mb-4'>
					<div className='text-muted small text-uppercase fw-semibold mb-3 text-center'>
						Scan QR code
					</div>
					<div className='d-flex flex-column align-items-center'>
						<div className='p-3 rounded-4 border border-secondary border-opacity-25 bg-body shadow-sm'>
							{qrLoading ? (
								<div
									className='d-flex align-items-center justify-content-center'
									style={{ width: 200, height: 200 }}>
									<Spinner color='primary' />
								</div>
							) : qrDataUrl ? (
								<img
									src={qrDataUrl}
									alt='QR code for token status link'
									width={200}
									height={200}
									className='rounded-2 d-block'
								/>
							) : (
								<div
									className='d-flex align-items-center justify-content-center text-muted small text-center px-2'
									style={{ width: 200, height: 200 }}>
									Could not generate QR code
								</div>
							)}
						</div>
						<div className='d-inline-flex align-items-center gap-2 text-muted small mt-3 px-3 py-2 rounded-pill bg-body border border-secondary border-opacity-25'>
							<Icon icon='PhoneIphone' size='sm' color='primary' />
							Scan with any phone camera
						</div>
					</div>
				</div>

				<div className='d-flex align-items-center gap-2 mb-3'>
					<div className='flex-fill border-top border-secondary border-opacity-25' />
					<span className='text-muted small text-uppercase fw-semibold px-1'>or share link</span>
					<div className='flex-fill border-top border-secondary border-opacity-25' />
				</div>

				<div
					className={[
						'd-flex align-items-stretch gap-2 p-2 rounded-3 border',
						copied
							? 'border-success bg-success bg-opacity-10'
							: 'border-secondary border-opacity-25 bg-body-secondary bg-opacity-50',
					].join(' ')}>
					<div
						className='flex-grow-1 min-w-0 align-self-center px-2 text-muted small'
						style={{ wordBreak: 'break-all', fontFamily: 'monospace', lineHeight: 1.5 }}>
						{publicUrl}
					</div>
					<Button
						color={copied ? 'success' : 'primary'}
						type='button'
						icon={copied ? 'Check' : 'ContentCopy'}
						className='flex-shrink-0 align-self-center'
						onClick={() => void handleCopy()}>
						{copied ? 'Copied!' : 'Copy link'}
					</Button>
				</div>
			</ModalBody>

			<ModalFooter className='border-top border-secondary border-opacity-25 pt-3'>
				<Button color='secondary' isLight type='button' onClick={() => setIsOpen(false)}>
					Close
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ShareTokenModal;
