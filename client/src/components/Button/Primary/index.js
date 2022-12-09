import './style.scss';
import PropTypes from 'prop-types';

const Primary = (props) => {
    const { label, onClick } = props;

    return (
        <div className="btn-primary" onClick={onClick}>
            {label}
        </div>
    );
};

Primary.propTypes = {
    label: PropTypes.string,
    onClick: PropTypes.func,
};

export default Primary;
