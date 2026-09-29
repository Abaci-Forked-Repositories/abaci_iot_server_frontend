import React from 'react';
// import ReactDOM from 'react-dom'; // For React 17
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client'; // For React 18
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/styles.scss';
import App from './App/App';
import reportWebVitals from './reportWebVitals';
import { ThemeContextProvider } from './contexts/themeContext';
import { AuthContextProvider } from './contexts/authContext';
import './i18n';

import store from './store';
import { LicenceProvider } from './contexts/LicenceContext';
import ProductValidation from './components/ProductValidation';
import { USE_MOCK_SERVICE } from './config';
import { setupAxiosAuthRefresh } from './axiosAuthRefresh';

// Attach 401 → refresh → retry before the app mounts
setupAxiosAuthRefresh();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 minutes
			retry: 1,
		},
	},
});

const children = (
	<QueryClientProvider client={queryClient}>
		<Provider store={store}>
			<Router>
				<ThemeContextProvider>
					<ProductValidation>
						<AuthContextProvider>
							<LicenceProvider>
								{/* <React.StrictMode> */}
								<App />
								{/* </React.StrictMode> */}
							</LicenceProvider>
						</AuthContextProvider>
					</ProductValidation>
				</ThemeContextProvider>
			</Router>
		</Provider>
	</QueryClientProvider>
);

async function enableMocking() {
	if (!USE_MOCK_SERVICE) return;

	try {
		const { worker } = await import('./mocks/browser');
		await worker.start({
			onUnhandledRequest: 'bypass',
			quiet: false,
		});
		console.info(
			'[MOCK] MSW is ON for forgot-password + settings preview only.\n' +
				'Login uses the REAL backend.\n' +
				'Forgot-password OTP: 123456\n' +
				'Set VITE_USE_MOCK_SERVICE=false to disable all mocks.',
		);
	} catch (err) {
		console.error(
			'[MOCK] Failed to start MSW. Ensure public/mockServiceWorker.js exists (npx msw init public/ --save).',
			err,
		);
	}
}

const container = document.getElementById('root');

enableMocking().then(() => {
	createRoot(container as Element).render(children);
	reportWebVitals();
});
