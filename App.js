import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MyLibraryPage from './pages/MyLibraryPage';
import Toast from './components/Toast';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Toast />
                <Switch>
                    <Route path="/mylibrary" component={MyLibraryPage} />
                    {/* Add more routes here as needed */}
                </Switch>
            </div>
        </Router>
    );
}

export default App;