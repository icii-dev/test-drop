import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './layouts/Header';
import { publicRoutes } from './routes';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                {publicRoutes.map((route, index) => {
                    const Page = route.element;
                    return <Route key={index} path={route.path} element={<Page />}></Route>;
                })}
            </Routes>
        </Router>
    );
};

export default App;
