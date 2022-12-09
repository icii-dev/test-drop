import { useRef, useState } from 'react';
import assets from '../../../../assets';
import './style.scss';

const UploadFile = () => {
    const [preview, setPreview] = useState();
    const fileRef = useRef();

    const fileSelectHandler = (e) => {
        fileRef.current = e.target.files[0];
        const url = URL.createObjectURL(fileRef.current);
        console.log(url);
        setPreview(url);
        checkTypeImage();
    };

    const checkTypeImage = () => {
        const type = fileRef.current.type;

        console.log(type);
    };

    return (
        <div className="upload-file-wrapper">
            <input type="file" className="upfile" onChange={fileSelectHandler} />
            {!preview && <p>Upload media</p>}
            {preview && <img src={preview} />}
        </div>
    );
};

export default UploadFile;
