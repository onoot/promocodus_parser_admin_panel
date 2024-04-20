import React, {useEffect, useState} from "react";
import Image from 'next/image';
import nextjsLogo from '../../public/next.svg';
import {toast} from "react-toastify";

interface AppBarProps {
    open: number;
    setOpen: React.Dispatch<React.SetStateAction<number>>;
    appBarRef: React.RefObject<HTMLDivElement>;
}

export const AppBar: React.FC<AppBarProps> = ({open, setOpen, appBarRef}) => {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [isSticky, setSticky] = useState(false);
    const [appBarWidth, setAppBarWidth] = useState<number>(500);

    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            const offset = window.scrollY;
            if (offset > 100) {
                setSticky(true);
            } else {
                setSticky(false);
            }
        };

        const handleResize = () => {
            const appBar = document.getElementById('app-bar');
            if (appBar) {
                setAppBarWidth(appBar.offsetWidth);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', handleResize);

        // Вызываем handleResize сразу после монтирования компонента
        handleResize();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleClick = (id: number) => {
        // обработка в зависимости от id
        switch (id) {
            case 1:
                setOpen(1)
                break
            case 2:
                setOpen(2)
                break
            case 3:
                setOpen(3)
                break
            case 4:
                setOpen(4)
                break
            case 5:
                setOpen(5)
                break
            case 7:
                setOpen(7)
                break
            default:
                toast.error('Эта кнопка не работает');
                break
        }

    }


    const menuItems = [
        {id: 1, label: 'Парсер', icon: 'table'},
        {id: 2, label: 'Задачи', icon: 'boxes'},
        {id: 3, label: 'Магазины', icon: 'shop'},
        {id: 4, label: 'Купоны', icon: 'gift'},
        {id: 5, label: 'История', icon: 'journal-text'},
        {id: 7, label: 'Терминал', icon: 'terminal'},
    ];

    const handleSearch = (ras: boolean) => {
        if (ras == true) {
            setShowModal(true);
            fetch('/api/loop/reboot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        } else {
            setShowModal(false);
        }
    };
    const appBarStyle = isSticky ? {width: appBarWidth} : {};

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            const appBar = document.getElementById('app-bar');
            if (appBar) {
                setAppBarWidth(appBar.offsetWidth);
            }
        };

        // Check if the code is running on the client side before attaching event listeners
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);

            // Call handleResize immediately after component mount
            handleResize();

            // Cleanup event listener on component unmount
            return () => {
                window.removeEventListener('resize', handleResize);
            };
        }

    }, []);

    const mobileNavButtonStyle: React.CSSProperties = {
        display: windowWidth <= 768 ? 'block' : 'none',
        position: 'fixed',
        color: "black",
        top: '10px',
        left: !isNavOpen ? `${appBarWidth}px` : '0',
        background: 'none',
        border: 'none',
        marginLeft: "50px",
        cursor: 'pointer',
        zIndex: 999,
        transition: 'left 0.5s ease',
    };

    const handleToggleNav = () => {
        setIsNavOpen(!isNavOpen);
    }
    const menu = isNavOpen ? 'off' : 'on'


    return (
        <>
            <section ref={appBarRef} className={`d-flex col-lg-3 col-md-4 col-sm-5 bg-dark menu ${menu} z-2`}
                     style={appBarStyle}>
                <nav id="app-bar" className={`me-auto d-flex flex-column align-items-baseline ms-5 mt-3 menu`}>
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            className="d-flex flex-row justify-content-start align-items-baseline mt-2 w-100"
                            onClick={() => handleClick(item.id)}
                        >
                            <i className={`bi bi-${item.icon} fs-2`}></i>
                            <h3 className="ms-2">{item.label}</h3>
                        </button>
                    ))}
                    <article className="d-flex mt-auto mb-5 flex-column align-items-center byNextjs">
                        <Image src={nextjsLogo} alt="Next.js Logo" width={80} height={80}/>
                        <p className="ml-2">The project works on Next.js</p>
                    </article>
                </nav>

            </section>
            <button
                className="mobile-nav-button mt-4"
                onClick={handleToggleNav}
                style={mobileNavButtonStyle}
            >
                {!isNavOpen ? (
                    <div style={{color: "black"}}>
                        <i className="bi bi-backspace fs-1"></i>
                    </div>
                ) : (
                    <div className="burger-icon" style={{color: "black", marginLeft: "-25px", paddingLeft: "25px"}}>
                        <i className="bi bi-list fs-1"></i>
                    </div>
                )}
            </button>

        </>
    );
};
