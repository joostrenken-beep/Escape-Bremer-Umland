import { render } from 'preact';
import '@fontsource/special-elite/latin-400.css';
import './styles.css';
import { App } from './App';

render(<App />, document.getElementById('app')!);
