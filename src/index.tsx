import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store'
import App from './components/App';

const container = document.getElementById('root');
if (container === null) throw new Error('Root container missing in index.html');
const root = ReactDOM.createRoot(container);

root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

