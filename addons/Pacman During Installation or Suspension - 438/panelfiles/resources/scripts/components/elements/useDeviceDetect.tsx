import { useEffect, useState } from 'react';

const useDeviceDetect = () => {
    const [ width, setWidth ] = useState(window.innerWidth);
    const [ height, setHeight ] = useState(window.innerHeight);

    const handleWindowResize = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    return (width <= 720 && height <= 1000);
};

export default useDeviceDetect;

