import assets from '../../assets';
import { Button } from '../../components';
import './header.scss';

const Header = () => {
    return (
        <div className="header">
            <div className="row center">
                <div className="logo">
                    <img src={assets.logo} />
                </div>
                <h1 className="title">Achillesido</h1>
            </div>

            <div className="row center gap-30 menu-div">
                <a>Home</a>
                <a>About US</a>
                <a>Docs</a>
            </div>

            <Button.ConnectWallet />
        </div>
    );
};

export default Header;
