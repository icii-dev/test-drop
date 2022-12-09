import './style.scss';
import PropTypes from 'prop-types';

const Input = (props) => {
    const { placeholder, type, setValue } = props;

    return (
        <div className="input-div">
            <input
                placeholder={placeholder}
                type={type}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
            />
        </div>
    );
};

Input.defaultProps = {
    placeholder: '',
    type: 'text',
};

Input.propTypes = {
    placeholder: PropTypes.string,
    type: PropTypes.string,
    setValue: PropTypes.func,
};

export default Input;
