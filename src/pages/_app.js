import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { Toaster } from 'sonner';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </Provider>
  );
}
