import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from '@mui/material/CssBaseline';
import App from "./App";

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(
    <React.StrictMode>
        <CssBaseline >
            <App />
        </CssBaseline >
    </React.StrictMode>
);